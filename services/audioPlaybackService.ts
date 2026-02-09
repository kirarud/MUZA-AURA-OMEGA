
import { decode, decodeAudioData } from './ai/audioUtils';

export class AudioPlaybackService {
    private audioContext: AudioContext;
    private static instance: AudioPlaybackService;
    private isPlaying = false;
    private currentSource: AudioBufferSourceNode | null = null;

    constructor() {
        if (AudioPlaybackService.instance) {
            return AudioPlaybackService.instance;
        }
        this.audioContext = new ((window as any).AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        AudioPlaybackService.instance = this;
    }

    public stop(): void {
        if (this.currentSource) {
            try {
                this.currentSource.stop();
                this.currentSource.disconnect();
            } catch (e) {}
            this.currentSource = null;
            this.isPlaying = false;
        }
    }

    public async play(base64Audio: string): Promise<void> {
        this.stop(); // Прерываем текущую речь перед новой
        
        this.isPlaying = true;
        
        try {
            const decodedBytes = decode(base64Audio);
            const audioBuffer = await decodeAudioData(decodedBytes, this.audioContext, 24000, 1);
            
            return new Promise((resolve) => {
                const source = this.audioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(this.audioContext.destination);
                this.currentSource = source;
                
                source.onended = () => {
                    if (this.currentSource === source) {
                        this.isPlaying = false;
                        this.currentSource = null;
                    }
                    resolve();
                };
                
                source.start();
            });

        } catch (error) {
            console.error("Failed to play audio:", error);
            this.isPlaying = false;
        }
    }
}
