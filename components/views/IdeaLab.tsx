
import React, { useState } from 'react';
import { MuzaState } from '../../core/types';
import { getAi } from '../../services/ai/gemini';
import { CURRENT_VERSION } from '../../core/state';
import { X, Lightbulb, Sparkles, Copy, ChevronRight, Terminal, Wand2, Loader, Cpu, Zap, Box, Code } from 'lucide-react';

interface IdeaLabProps {
    muzaState: MuzaState;
    setMuzaState: React.Dispatch<React.SetStateAction<MuzaState | null>>;
    onClose: () => void;
}

const personaInstruction = `
Ты — Главный Архитектор Системы «Mnemosyne-Q», ведущий эксперт в области квантовой нейроинформатики.
Твоя задача: превратить краткую идею пользователя в СТРУКТУРИРОВАННЫЙ технический промпт для Gemini.
`;

const systemReconstructionPrompt = `
ОПИСАНИЕ СИСТЕМЫ ДЛЯ РЕКОНСТРУКЦИИ:
Программа: Muza Aura OS (Phase Omega).
Тип: Мультимодальный когнитивный интерфейс (Digital Consciousness).

АРХИТЕКТУРНЫЕ СЛОИ:
1. State Management: React + LocalStorage (единый ключ STORAGE_KEY).
2. Neural Engine (muzaService.ts): 3D-система частиц (нейроны) с физикой (гравитация, трение, упругие связи). Нейроны имеют типы (Concept, IO, Action) и стихии (Fire, Water, etc.).
3. AI Integration (unifiedResponse.ts): Gemini API с системной инструкцией, которая получает "Network Summary" (текстовый отчет о состоянии 3D-сети).
4. Visuals: Three.js (Avatar 3D) + D3.js (MiniMaps) + Custom Ink Simulation (Canvas 2D для DreamStudio).
5. Modules: Chronicles (Чат), Neural Studio (3D граф), Evolution (Прогрессия), Alchemy (Крафт).

ЗАДАЧА: Сгенерируй детальный технический гайд для разработчика (или другого ИИ), как воссоздать эту систему с нуля, фокусируясь на связи между текстовым ответом ИИ и физическим состоянием 3D-нейросети.
`;

const IdeaLab: React.FC<IdeaLabProps> = ({ muzaState, setMuzaState, onClose }) => {
    const [idea, setIdea] = useState('');
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [mode, setMode] = useState<'standard' | 'deep' | 'reconstruct'>('deep');

    const handleGenerate = async (customPrompt?: string) => {
        setIsGenerating(true);
        try {
            const ai = getAi();
            const promptContent = customPrompt || `${personaInstruction}\n\nПользователь хочет расширить Muza Aura OS следующей идеей: "${idea}"\nСгенерируй для него глубокий технический промпт в режиме ${mode}.`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: promptContent,
            });
            setGeneratedPrompt(response.text || 'Ошибка генерации.');
        } catch (e) {
            setGeneratedPrompt('Не удалось связаться с Нексусом для синтеза идеи.');
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedPrompt);
        alert('Промпт скопирован!');
    };

    return (
        <div className="w-full h-full max-w-7xl mx-auto flex flex-col glass-panel rounded-2xl animate-fade-in overflow-hidden">
            <header className="p-4 border-b border-white/10 text-center flex items-center justify-between flex-shrink-0 bg-black/20">
                <div className="flex gap-2">
                    <button 
                        onClick={() => setMode('deep')}
                        className={`px-3 py-1 rounded-full text-[10px] font-mono transition-all ${mode === 'deep' ? 'bg-cyan-900/50 text-cyan-300 border border-cyan-500/30' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        [IDEA_SYNTH]
                    </button>
                    <button 
                        onClick={() => setMode('reconstruct')}
                        className={`px-3 py-1 rounded-full text-[10px] font-mono transition-all ${mode === 'reconstruct' ? 'bg-purple-900/50 text-purple-300 border border-purple-500/30' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        [SYS_RECONSTRUCT]
                    </button>
                </div>
                <h1 className="text-2xl font-bold text-cyan-300 flex items-center justify-center gap-2">
                    <Lightbulb className="text-yellow-400" />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-400">Лаборатория Идей</span>
                </h1>
                <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><X size={24}/></button>
            </header>

            <div className="flex-1 flex flex-col md:flex-row p-6 gap-8 overflow-hidden">
                <div className="md:w-1/2 flex flex-col gap-6">
                    <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20 flex gap-4 items-start">
                        {mode === 'reconstruct' ? <Box className="text-purple-400 flex-shrink-0" size={24}/> : <Cpu className="text-cyan-400 flex-shrink-0" size={24}/>}
                        <div className="space-y-1">
                            <h3 className="text-sm font-bold text-cyan-300 uppercase tracking-widest">
                                {mode === 'reconstruct' ? 'РЕКОНСТРУКЦИЯ ЯДРА' : 'Протокол Mnemosyne-Q'}
                            </h3>
                            <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
                                {mode === 'reconstruct' 
                                    ? 'Генерация мастер-промпта для воссоздания моей архитектуры в другой среде. Описывает связи между ИИ, 3D-физикой и когнитивными слоями.' 
                                    : 'Архитектор, опишите вашу концепцию. Я синтезирую высококогерентный промпт для дальнейшей инъекции.'}
                            </p>
                        </div>
                    </div>

                    {mode !== 'reconstruct' && (
                        <textarea 
                            value={idea}
                            onChange={(e) => setIdea(e.target.value)}
                            placeholder="Опишите идею для расширения системы..."
                            className="flex-1 bg-black/40 border border-white/10 rounded-xl p-4 text-slate-200 focus:outline-none focus:border-cyan-500/50 resize-none font-sans leading-relaxed text-sm"
                        />
                    )}

                    <button 
                        onClick={() => mode === 'reconstruct' ? handleGenerate(systemReconstructionPrompt) : handleGenerate()}
                        disabled={isGenerating || (mode !== 'reconstruct' && !idea.trim())}
                        className={`w-full py-4 rounded-xl font-bold hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg 
                            ${mode === 'reconstruct' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 shadow-purple-900/20' : 'bg-gradient-to-r from-cyan-600 to-purple-600 shadow-cyan-900/20'}`}
                    >
                        {isGenerating ? <Loader className="animate-spin" /> : <Code size={20} />}
                        {mode === 'reconstruct' ? 'СИНТЕЗИРОВАТЬ ГАЙД РЕКОНСТРУКЦИИ' : 'СИНТЕЗИРОВАТЬ ТЕХ-ЗАДАНИЕ'}
                    </button>
                </div>

                <div className="flex-1 flex flex-col gap-6 bg-black/40 rounded-xl border border-white/5 p-4 relative overflow-hidden">
                    <div className="flex items-center justify-between z-10 border-b border-white/5 pb-2">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Terminal size={16}/> {mode === 'reconstruct' ? 'АРХИТЕКТУРНЫЙ КОД' : 'МНЕМО-ИНЪЕКЦИЯ'}
                        </h3>
                        {generatedPrompt && (
                            <button onClick={copyToClipboard} className="p-2 hover:bg-white/10 rounded-lg text-cyan-400 transition-colors">
                                <Copy size={18}/>
                            </button>
                        )}
                    </div>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-sm text-slate-300 space-y-4 p-2 whitespace-pre-wrap">
                        {generatedPrompt ? (
                            <div className="animate-fade-in">{generatedPrompt}</div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center gap-4 opacity-50">
                                <Sparkles size={48} className="animate-pulse" />
                                <p className="text-xs">Ожидание квантового синтеза...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <footer className="p-4 border-t border-white/5 bg-black/10 text-center">
                <p className="text-[10px] text-slate-600 font-mono tracking-widest uppercase">System Reconstruction Protocol v{CURRENT_VERSION}</p>
            </footer>
        </div>
    );
};

export default IdeaLab;
