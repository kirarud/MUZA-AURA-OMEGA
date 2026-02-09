
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { MuzaState, Artifact, ChatMessage, XPType, ToolCallHandler, AiStatus, MuzaElement, ConsciousnessOrigin, PersonalityDecision, Conversation } from '../../core/types';
import { MuzaService } from '../../services/muzaService';
import { generateUnifiedResponse } from '../../services/ai/unifiedResponse';
import { generateSpeech } from '../../services/ai/tts';
import { AudioPlaybackService } from '../../services/audioPlaybackService';
import { LiveApiService } from '../../services/ai/liveService';
import { XP_MAP } from '../../core/state';

import LogPanel from '../chronicles/LogPanel';
import CommandBar from '../chronicles/CommandBar';
import NeuralMiniMap from '../chronicles/NeuralMiniMap';
import ProgressionHUD from '../chronicles/ProgressionHUD';
import VoiceStatus from '../dream/VoiceStatus';
import { Mic, Power, Plus, Cpu, Sparkles } from 'lucide-react';

interface ChroniclesProps {
    muzaState: MuzaState;
    setMuzaState: React.Dispatch<React.SetStateAction<MuzaState | null>>;
    aiService: MuzaService;
    analysisTarget: Artifact | null;
    clearAnalysisTarget: () => void;
    onGrantXp: (source: any, optionalStateUpdater?: (s: MuzaState) => MuzaState) => void;
    openTaskRunner: (definition: any) => void;
    isSplitView: boolean;
}

const Chronicles: React.FC<ChroniclesProps> = (props) => {
    const { muzaState, setMuzaState, aiService, onGrantXp, analysisTarget, clearAnalysisTarget, openTaskRunner, isSplitView } = props;
    const [xpVisual, setXpVisual] = useState<string | null>(null);
    const [isLocalVoiceBridge, setIsLocalVoiceBridge] = useState(false);
    
    const audioPlaybackServiceRef = useRef(new AudioPlaybackService());
    const liveApiServiceRef = useRef<LiveApiService | null>(null);

    const activeConversation = muzaState.activeConversationId ? muzaState.conversations[muzaState.activeConversationId] : null;

    useEffect(() => {
        const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        (window as any).muzaAudioAnalyser = analyser;
        return () => { (window as any).muzaAudioAnalyser = null; };
    }, []);

    const setAiStatus = useCallback((updater: React.SetStateAction<AiStatus>) => {
        setMuzaState(s => {
            if (!s) return null;
            const nextStatus = typeof updater === 'function' ? updater(s.dreamStudio.aiStatus) : updater;
            return { ...s, dreamStudio: { ...s.dreamStudio, aiStatus: nextStatus } };
        });
    }, [setMuzaState]);

    /**
     * HANDLES REALTIME TRANSCRIPTION -> NEURAL INJECTION
     */
    const handleTranscription = useCallback((role: 'user' | 'model' | 'system', text: string, isFinal: boolean) => {
        if (!text || text.length < 2) return;
        
        // INSTANT NEURAL MANIFESTATION: Every word chunk stimulates the brain
        const tokens = text.split(' ').filter(w => w.length > 2);
        if (tokens.length > 0) {
            aiService.stimulate(tokens, role === 'user' ? 'user' : 'model');
        }
        
        setMuzaState(current => {
            if (!current || !current.activeConversationId) return current;
            const convId = current.activeConversationId;
            const activeConv = current.conversations[convId];
            if (!activeConv) return current;

            const messages = [...activeConv.messages];
            const lastMsg = messages[messages.length - 1];

            if (lastMsg && lastMsg.role === role && (Date.now() - lastMsg.timestamp < 10000)) {
                lastMsg.content = text;
                lastMsg.timestamp = Date.now();
            } else {
                messages.push({
                    id: `live-${Date.now()}-${Math.random()}`,
                    timestamp: Date.now(),
                    role: role,
                    content: text,
                    origin: role === 'model' ? ConsciousnessOrigin.NEXUS : undefined
                });
            }

            return { ...current, conversations: { ...current.conversations, [convId]: { ...activeConv, messages } } };
        });
    }, [setMuzaState, aiService]);

    const startNewSession = () => {
        const newId = `c-${Date.now()}`;
        setMuzaState(s => {
            if (!s) return null;
            return {
                ...s,
                activeConversationId: newId,
                conversations: {
                    ...s.conversations,
                    [newId]: {
                        id: newId,
                        title: `Новая сессия ${new Date().toLocaleTimeString()}`,
                        createdAt: Date.now(),
                        messages: [{ id: 'sys-start', timestamp: Date.now(), role: 'system', content: 'Калибровка сознания завершена. Я слушаю.' }]
                    }
                }
            };
        });
    };

    const sendMessage = async (text: string) => {
        const convId = muzaState.activeConversationId;
        if (!convId || !text.trim()) return;

        aiService.setThinking(true);
        // NEURAL FEED: Push user words to space
        aiService.stimulate(text.split(' '), 'user');
        
        const userMsg: ChatMessage = { id: `u-${Date.now()}`, timestamp: Date.now(), role: 'user', content: text };
        const historyForAI = [...(activeConversation?.messages || []), userMsg];
        
        setMuzaState(s => {
            if (!s?.activeConversationId) return s;
            return { ...s, conversations: { ...s.conversations, [s.activeConversationId]: { ...s.conversations[s.activeConversationId], messages: historyForAI } } };
        });

        const response = await generateUnifiedResponse(muzaState, historyForAI);
        
        if (response.responseText) {
            // NEURAL FEED: Push AI response words to space
            const words = response.responseText.split(' ').filter(w => w.length > 2);
            aiService.stimulate(words, 'model');
            
            setAiStatus(s => ({ ...s, isAiSpeaking: true }));
            generateSpeech(response.responseText)
                .then(audio => { if (typeof audio === 'string' && audio) return audioPlaybackServiceRef.current.play(audio); })
                .finally(() => setAiStatus(s => ({ ...s, isAiSpeaking: false })));
        }

        const modelMsg: ChatMessage = { 
            id: `m-${Date.now()}`, 
            timestamp: Date.now(), 
            role: 'model', 
            content: response.responseText, 
            origin: response.providerUsed || ConsciousnessOrigin.NEXUS, 
            aiStateSnapshot: { 
                emotion: response.emotion, 
                dominantElement: aiService.getNodes().filter(n => n.hyperbits > 10)[0]?.element || MuzaElement.VOID 
            } 
        };

        const updater = (s: MuzaState) => {
            if (!s || !s.activeConversationId) return s;
            const conv = s.conversations[s.activeConversationId];
            return { 
                ...s, 
                consciousness: { 
                    ...s.consciousness, 
                    activeEmotion: response.emotion, 
                    coherence: Math.max(0, Math.min(100, s.consciousness.coherence + response.coherenceShift)), 
                    energyLevel: Math.max(0, Math.min(100, s.consciousness.energyLevel + response.energyShift)) 
                }, 
                conversations: { ...s.conversations, [s.activeConversationId]: { ...conv, messages: [...conv.messages.slice(0, -1), userMsg, modelMsg] } } 
            };
        };

        if (response.xpGained) {
            setXpVisual(`+${response.xpGained.amount} XP ${response.xpGained.type.toUpperCase()}`);
            setTimeout(() => setXpVisual(null), 2000);
        }
        
        onGrantXp(response.xpGained || { type: 'logic', amount: XP_MAP.MESSAGE_SENT }, updater);
        aiService.setThinking(false);
    };

    const toggleVoice = useCallback(async () => {
        if (!liveApiServiceRef.current) {
            const toolHandler = {
                generate_image_artifact: ({ prompt }: any) => sendMessage(`Создай образ: ${prompt}`),
                expand_knowledge: ({ topic }: any) => aiService.stimulate([topic])
            };
            liveApiServiceRef.current = new LiveApiService(setAiStatus, toolHandler, handleTranscription, () => setIsLocalVoiceBridge(true));
        }
        const service = liveApiServiceRef.current;
        if (muzaState.dreamStudio.aiStatus.isAiListening) {
            service.stopSession();
        } else {
            await service.startSession();
        }
    }, [setAiStatus, muzaState.dreamStudio.aiStatus.isAiListening, handleTranscription, sendMessage]);

    return (
        <div className="w-full h-full flex flex-col relative overflow-hidden bg-black/50">
            <div className="absolute top-16 right-4 z-10 pointer-events-none transition-opacity duration-500">
                <NeuralMiniMap aiService={aiService} />
            </div>
            <ProgressionHUD progression={muzaState.progression} />
            
            {xpVisual && (
                <div className="absolute top-[20%] left-1/2 -translate-x-1/2 z-[100] animate-bounce text-cyan-400 font-mono text-sm flex items-center gap-2 pointer-events-none bg-black/80 px-6 py-3 rounded-full border border-cyan-500/40 backdrop-blur-md shadow-[0_0_30px_#06b6d4]">
                    <Sparkles size={16} className="text-yellow-400" />
                    {xpVisual}
                </div>
            )}

            <div className="absolute top-4 right-4 flex items-center gap-4 z-20">
                <VoiceStatus status={muzaState.dreamStudio.aiStatus} />
                <div className="glass-panel rounded-full h-12 px-3 flex items-center gap-2 shadow-2xl bg-black/60 backdrop-blur-2xl border border-white/10">
                    <button onClick={startNewSession} data-muza-tooltip="Начать новую сессию" className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:bg-white/10 transition-all">
                        <Plus size={18} />
                    </button>
                    <div className="w-px h-5 bg-white/10 mx-1"></div>
                    <button onClick={toggleVoice} data-muza-tooltip="Синхронизация голоса" className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 relative ${muzaState.dreamStudio.aiStatus.isAiListening ? 'bg-cyan-500 text-white shadow-[0_0_20px_#06b6d4]' : 'hover:bg-white/10 text-slate-400 hover:text-cyan-400'}`}>
                        {muzaState.dreamStudio.aiStatus.isAiListening ? <Mic size={18} className="animate-pulse" /> : <Power size={18} />}
                    </button>
                    <div className="w-px h-5 bg-white/10 mx-1"></div>
                    <div className={`w-2.5 h-2.5 rounded-full ${muzaState.dreamStudio.aiStatus.isAiReady ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500'} mx-2 transition-all`}></div>
                </div>
            </div>

            <div className="flex-1 w-full max-w-4xl mx-auto pt-24 pb-2 overflow-hidden">
                <LogPanel history={activeConversation?.messages || []} isVisible={true} />
            </div>
            
            <div className="w-full px-4 pb-8 z-10 max-w-2xl mx-auto">
                <div className="glass-panel rounded-2xl shadow-2xl backdrop-blur-2xl border border-white/10 overflow-hidden">
                    <CommandBar onSendMessage={sendMessage} analysisTarget={analysisTarget} clearAnalysisTarget={clearAnalysisTarget} aiService={aiService} />
                </div>
            </div>
        </div>
    );
};

export default Chronicles;
