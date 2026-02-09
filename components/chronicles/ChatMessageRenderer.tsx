
import React from 'react';
import { ChatMessage, MuzaElement, EmotionType, ConsciousnessOrigin } from '../../core/types';
import { EMOTION_DISPLAY_MAP } from '../../core/state';
import { Bot, User, BrainCircuit, Flame, Droplets, Mountain, Wind, Circle, Smile, HelpCircle, Frown, Crosshair, RotateCw, Meh, Sparkles, Atom, Activity } from 'lucide-react';

interface ChatMessageRendererProps {
    message: ChatMessage;
    onImageClick?: (base64Data: string) => void;
}

const ELEMENT_STYLES: Record<MuzaElement, { border: string, shadow: string, text: string }> = {
    [MuzaElement.FIRE]: { border: 'border-red-500/50', shadow: 'shadow-red-900/50', text: 'text-red-400' },
    [MuzaElement.WATER]: { border: 'border-blue-500/50', shadow: 'shadow-blue-900/50', text: 'text-blue-400' },
    [MuzaElement.EARTH]: { border: 'border-emerald-500/50', shadow: 'shadow-emerald-900/50', text: 'text-emerald-400' },
    [MuzaElement.AIR]: { border: 'border-pink-500/50', shadow: 'shadow-pink-900/50', text: 'text-pink-300' },
    [MuzaElement.VOID]: { border: 'border-purple-500/50', shadow: 'shadow-purple-900/50', text: 'text-purple-400' },
};

const ElementIcon: React.FC<{ element: MuzaElement, size?: number }> = ({ element, size = 12 }) => {
    switch(element) {
        case MuzaElement.FIRE: return <Flame size={size} className="text-red-400" />;
        case MuzaElement.WATER: return <Droplets size={size} className="text-blue-400" />;
        case MuzaElement.EARTH: return <Mountain size={size} className="text-emerald-400" />;
        case MuzaElement.AIR: return <Wind size={size} className="text-pink-300" />;
        default: return <Circle size={size} className="text-slate-400" />;
    }
};

const EmotionIcon: React.FC<{ emotion: EmotionType, size?: number }> = ({ emotion, size = 12 }) => {
    switch(emotion) {
        case EmotionType.JOY: return <Smile size={size} className="text-yellow-400" />;
        case EmotionType.CURIOSITY: return <HelpCircle size={size} className="text-purple-400" />;
        case EmotionType.SADNESS: return <Frown size={size} className="text-blue-400" />;
        case EmotionType.FOCUS: return <Crosshair size={size} className="text-slate-300" />;
        case EmotionType.CONFUSION: return <RotateCw size={size} className="text-pink-400" />;
        default: return <Meh size={size} className="text-slate-400" />;
    }
};

const OriginIcon: React.FC<{ origin?: ConsciousnessOrigin, size?: number }> = ({ origin, size = 12 }) => {
    if (!origin) return null;
    switch (origin) {
        case ConsciousnessOrigin.NEXUS: return <Sparkles size={size} className="text-purple-400" />;
        case ConsciousnessOrigin.ARK: return <Atom size={size} className="text-cyan-400" />;
        default: return null;
    }
};


export const ChatMessageRenderer: React.FC<ChatMessageRendererProps> = ({ message: msg, onImageClick }) => {
    let textContent = '';
    let imageContent: string | null = null;

    if (typeof msg.content === 'string') {
        textContent = msg.content;
    } else if (Array.isArray(msg.content)) {
        msg.content.forEach(part => {
            if (part.text) textContent += part.text + '\n';
            if (part.inlineData?.data) imageContent = part.inlineData.data;
        });
    } else {
        textContent = '[Неподдерживаемый контент]';
    }
    textContent = textContent.trim();

    if (msg.role === 'reflection') {
        return (
             <div key={msg.id} className="w-full flex justify-center my-4 py-2">
                <div className="max-w-md w-full border-l-2 border-cyan-500/40 bg-cyan-500/5 px-6 py-4 rounded-r-xl backdrop-blur-sm">
                    <div className="flex items-center gap-3 text-cyan-400 mb-2">
                        <Activity size={16} className="animate-pulse" />
                        <span className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase">Синаптическая Рефлексия</span>
                    </div>
                    <p className="text-xs italic text-slate-300 font-mono leading-relaxed">
                        {textContent}
                    </p>
                </div>
            </div>
        );
    }
    
    if (msg.role === 'system') {
        return (
             <div key={msg.id} className="w-full text-center my-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest opacity-60">
                [ {textContent} ]
            </div>
        );
    }
    
    const isUser = msg.role === 'user';
    const aiSnapshot = msg.aiStateSnapshot;
    
    if (isUser) {
        return (
             <div key={msg.id} className="flex gap-4 flex-row-reverse mb-4">
                <div className="w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center bg-cyan-600/20 border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                    <User size={20} className="text-cyan-400"/>
                </div>
                <div className="max-w-[85%] bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl rounded-tr-none text-sm p-4 shadow-xl break-words whitespace-pre-wrap leading-relaxed text-slate-200">
                    <p>{textContent}</p>
                    {imageContent && onImageClick && (
                        <div className="mt-4 rounded-xl overflow-hidden border border-purple-500/30 shadow-2xl">
                            <img 
                                src={`data:image/png;base64,${imageContent}`}
                                alt="Анализ памяти"
                                className="w-full h-auto cursor-pointer hover:scale-105 transition duration-500"
                                onClick={() => onImageClick(imageContent!)}
                            />
                        </div>
                    )}
                </div>
            </div>
        );
    }

    const elementStyle = aiSnapshot ? ELEMENT_STYLES[aiSnapshot.dominantElement] : ELEMENT_STYLES[MuzaElement.VOID];
    const originName = msg.origin === ConsciousnessOrigin.NEXUS ? "Нексус" : "Ковчег";

    return (
        <div key={msg.id} className="flex gap-4 flex-row mb-6 animate-fade-in">
            <div className="w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center bg-slate-800/80 border border-white/10 relative shadow-lg">
                <Bot size={22} className={elementStyle.text}/>
                {msg.origin && (
                    <div className="absolute -bottom-1 -right-1 bg-black rounded-full p-1 border border-slate-700 shadow-sm" title={`Источник: ${originName}`}>
                        <OriginIcon origin={msg.origin} size={12} />
                    </div>
                )}
            </div>
            <div className={`max-w-[85%] glass-panel rounded-2xl rounded-tl-none text-sm overflow-hidden flex flex-col border ${elementStyle.border} shadow-2xl ${elementStyle.shadow} break-words`}>
                <div className="p-4 leading-relaxed text-slate-100">
                    <p className="whitespace-pre-wrap">{textContent || '[Мультимодальный контент]'}</p>
                </div>
                {aiSnapshot && (
                    <div className="border-t border-white/5 px-4 py-2.5 flex justify-between text-[10px] font-mono text-slate-400 bg-black/40 backdrop-blur-md">
                        <span className="flex items-center gap-2 group cursor-help">
                            <EmotionIcon emotion={aiSnapshot.emotion} size={12} />
                            <span className="group-hover:text-cyan-300 transition-colors uppercase tracking-widest">{EMOTION_DISPLAY_MAP[aiSnapshot.emotion]}</span>
                        </span>
                        <span className="flex items-center gap-2 group cursor-help">
                            <ElementIcon element={aiSnapshot.dominantElement} size={12} />
                            <span className={`group-hover:text-white transition-colors uppercase tracking-widest ${elementStyle.text}`}>{aiSnapshot.dominantElement}</span>
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};
