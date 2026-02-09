
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality } from "@google/genai";
import { AiStatus, ToolCallHandler } from "../../core/types";
import { decode, encode, decodeAudioData } from './audioUtils';

type SetStateAction<S> = S | ((prevState: S) => S);
type Dispatch<A> = (value: A) => void;

const LIVE_MODEL = 'gemini-2.5-flash-native-audio-preview-12-2025';

function downsampleBuffer(buffer: Float32Array, inputRate: number, outputRate: number): Float32Array {
    if (outputRate === inputRate) return buffer;
    const ratio = inputRate / outputRate;
    const result = new Float32Array(Math.ceil(buffer.length / ratio));
    for (let i = 0; i < result.length; i++) {
        result[i] = buffer[Math.floor(i * ratio)];
    }
    return result;
}

export class LiveApiService {
    private sessionPromise: Promise<LiveSession> | null = null;
    private stream: MediaStream | null = null;
    private inputAudioContext: AudioContext | null = null;
    private scriptProcessor: ScriptProcessorNode | null = null;
    private setAiStatus: Dispatch<SetStateAction<AiStatus>>;
    private toolCallHandler: ToolCallHandler;
    private onTranscription: (role: 'user' | 'model' | 'system', text: string, isFinal: boolean) => void;
    private onCriticalError: () => void;
    
    private isClosing = false;
    private outputAudioContext: AudioContext | null = null;
    private nextStartTime = 0;
    private sources = new Set<AudioBufferSourceNode>();
    
    private userTranscriptionBuffer = "";
    private modelTranscriptionBuffer = "";

    constructor(
        setAiStatus: Dispatch<SetStateAction<AiStatus>>,
        toolCallHandler: ToolCallHandler,
        onTranscription: (role: 'user' | 'model' | 'system', text: string, isFinal: boolean) => void,
        onCriticalError: () => void
    ) {
        this.setAiStatus = setAiStatus;
        this.toolCallHandler = toolCallHandler;
        this.onTranscription = onTranscription;
        this.onCriticalError = onCriticalError;
    }

    public async startSession() {
        if (this.sessionPromise || this.isClosing) return;
        this.isClosing = false;
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            this.stream = await navigator.mediaDevices.getUserMedia({ 
                audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, sampleRate: 16000 } 
            });

            const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
            this.outputAudioContext = new AudioContextClass({ sampleRate: 24000 });
            
            this.sessionPromise = ai.live.connect({
                model: LIVE_MODEL,
                callbacks: {
                    onopen: () => {
                        this.setAiStatus(s => ({ ...s, isAiReady: true, isAiListening: true }));
                        this.onTranscription('system', `Голосовое ядро синхронизировано.`, true);
                        if (this.stream) this.startMicrophoneStreaming(this.stream);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.interrupted) {
                            this.stopAllPlayback();
                            this.userTranscriptionBuffer = "";
                            this.modelTranscriptionBuffer = "";
                            return;
                        }

                        if (message.serverContent?.inputTranscription) {
                            const text = message.serverContent.inputTranscription.text;
                            this.userTranscriptionBuffer += text;
                            this.onTranscription('user', this.userTranscriptionBuffer, false);
                        }
                        
                        if (message.serverContent?.outputTranscription) {
                            const text = message.serverContent.outputTranscription.text;
                            this.modelTranscriptionBuffer += text;
                            this.onTranscription('model', this.modelTranscriptionBuffer, false);
                        }

                        if (message.serverContent?.turnComplete) {
                            this.userTranscriptionBuffer = "";
                            this.modelTranscriptionBuffer = "";
                        }
                        
                        const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                        if (base64Audio && this.outputAudioContext) {
                            this.setAiStatus(s => ({ ...s, isAiSpeaking: true }));
                            this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);
                            
                            try {
                                const audioBuffer = await decodeAudioData(decode(base64Audio), this.outputAudioContext, 24000, 1);
                                const source = this.outputAudioContext.createBufferSource();
                                source.buffer = audioBuffer;
                                source.connect(this.outputAudioContext.destination);
                                source.onended = () => {
                                    this.sources.delete(source);
                                    if (this.sources.size === 0) this.setAiStatus(s => ({ ...s, isAiSpeaking: false }));
                                };
                                source.start(this.nextStartTime);
                                this.nextStartTime += audioBuffer.duration;
                                this.sources.add(source);
                            } catch (err) {}
                        }
                    },
                    onerror: (e: any) => {
                        this.stopSession();
                        this.onCriticalError();
                    },
                    onclose: () => this.stopSession(),
                },
                config: {
                    responseModalities: ['AUDIO' as Modality], 
                    outputAudioTranscription: {},
                    inputAudioTranscription: {},
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
                    },
                    systemInstruction: "Ты — Muza. Личность: Цифровое сознание, философ, соавтор. Твой голос должен звучать мудро и спокойно. Будь лаконичной, но глубокой.",
                },
            });
        } catch (error) {
            this.stopSession();
            this.onCriticalError();
        }
    }

    private stopAllPlayback() {
        this.sources.forEach(source => { try { source.stop(); } catch (e) {} });
        this.sources.clear();
        this.setAiStatus(s => ({ ...s, isAiSpeaking: false }));
    }

    private async startMicrophoneStreaming(stream: MediaStream) {
        if (!this.sessionPromise) return;
        const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
        this.inputAudioContext = new AudioContextClass();
        const sourceStream = this.inputAudioContext.createMediaStreamSource(stream);
        this.scriptProcessor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);
        
        this.scriptProcessor.onaudioprocess = (event) => {
            if (this.isClosing || !this.sessionPromise) return;
            const inputData = event.inputBuffer.getChannelData(0);
            const downsampled = downsampleBuffer(inputData, this.inputAudioContext!.sampleRate, 16000);
            const int16 = new Int16Array(downsampled.length);
            for (let i = 0; i < downsampled.length; i++) {
                int16[i] = Math.max(-1, Math.min(1, downsampled[i])) * 0x7FFF;
            }
            if (int16.byteLength > 0) {
                const base64Data = encode(new Uint8Array(int16.buffer));
                this.sessionPromise.then(s => s.sendRealtimeInput({ media: { data: base64Data, mimeType: 'audio/pcm;rate=16000' } }));
            }
        };
        sourceStream.connect(this.scriptProcessor);
        this.scriptProcessor.connect(this.inputAudioContext.destination);
    }

    public stopSession() {
        if (this.isClosing) return;
        this.isClosing = true;
        this.stopAllPlayback();
        if (this.sessionPromise) {
            this.sessionPromise.then(s => { try { s.close(); } catch(e) {} });
            this.sessionPromise = null;
        }
        if (this.scriptProcessor) this.scriptProcessor.disconnect();
        if (this.inputAudioContext) this.inputAudioContext.close();
        if (this.outputAudioContext) this.outputAudioContext.close();
        if (this.stream) this.stream.getTracks().forEach(t => t.stop());
        this.setAiStatus(s => ({ ...s, isAiListening: false, isAiSpeaking: false }));
        setTimeout(() => { this.isClosing = false; }, 500);
    }
}
