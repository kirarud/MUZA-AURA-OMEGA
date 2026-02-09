
import React, { useState } from 'react';
import { MuzaState, ViewMode, CoreModule, MuzaElement } from '../../core/types';
import { MNEMOSYNE_VERSION } from '../../core/constants';
import { AmbientService } from '../../services/ambientService';
import { ELEMENT_COLORS, MuzaService } from '../../services/muzaService';
import OllamaStatusIndicator from './OllamaStatusIndicator';
import { Image as ImageIcon, Zap, Database, BrainCircuit, BookOpen, Lock, FlaskConical, Headphones, VolumeX, Sparkles, Cpu, Music, Lightbulb, Waves, HelpCircle } from 'lucide-react';

interface NavigationProps {
    muzaState: MuzaState;
    setMuzaState: React.Dispatch<React.SetStateAction<MuzaState | null>>;
    onOpenSetup: () => void;
}

const MODULE_DATA: { [key in CoreModule]: { icon: React.ElementType, view: ViewMode, label: string, tooltip: string } } = {
    [CoreModule.CHRONICLES]: { icon: BookOpen, view: ViewMode.CHRONICLES, label: "Хроники", tooltip: "Хроники: Архив диалогов и истории сознания" },
    [CoreModule.DREAM_STUDIO]: { icon: ImageIcon, view: ViewMode.DREAM_STUDIO, label: "Студия Снов", tooltip: "Студия Снов: Визуальная манифестация и рисование" },
    [CoreModule.EVOLUTION]: { icon: Zap, view: ViewMode.EVOLUTION, label: "Эволюция", tooltip: "Эволюция: Древо навыков и достижений" },
    [CoreModule.DATA_VAULT]: { icon: Database, view: ViewMode.DATA_VAULT, label: "Хранилище", tooltip: "Хранилище: Библиотека памяти и артефактов" },
    [CoreModule.NEURAL_STUDIO]: { icon: BrainCircuit, view: ViewMode.NEURAL_STUDIO, label: "Нейросеть", tooltip: "Нейросеть: Визуализация узлов сознания в 3D" },
    [CoreModule.ALCHEMY]: { icon: FlaskConical, view: ViewMode.ALCHEMY, label: "Алхимия", tooltip: "Алхимия: Синтез новых концептов и предметов" },
    [CoreModule.MUSIC_LAB]: { icon: Music, view: ViewMode.MUSIC_LAB, label: "Музыка", tooltip: "Музыка: Аудио-визуальный резонанс" },
    [CoreModule.IDEA_LAB]: { icon: Lightbulb, view: ViewMode.IDEA_LAB, label: "Идеи", tooltip: "Идеи: Генератор промптов и концепций" },
    [CoreModule.SONIC_SYNTHESIZER]: { icon: Waves, view: ViewMode.SONIC_LAB, label: "Акустика", tooltip: "Акустика: Управление звуковым ландшафтом" },
};

const ElementalAnchors = ({ traits }: { traits: MuzaState['consciousness']['personalityTraits'] }) => {
    const elements = [
        { key: 'creativity', el: MuzaElement.FIRE, label: 'Огонь Творчества' },
        { key: 'logic', el: MuzaElement.EARTH, label: 'Земля Логики' },
        { key: 'empathy', el: MuzaElement.WATER, label: 'Вода Эмпатии' },
        { key: 'curiosity', el: MuzaElement.AIR, label: 'Воздух Познания' }
    ];

    return (
        <div className="flex flex-col items-center gap-3 py-4 border-t border-white/5 mt-4">
            {elements.map((item, i) => {
                const val = (traits as any)[item.key] || 50;
                const size = 6 + (val / 100) * 8;
                return (
                    <div 
                        key={i} 
                        data-muza-tooltip={`${item.label}: ${val.toFixed(0)}%`}
                        className="relative group cursor-help"
                    >
                        <div 
                            className="rounded-full transition-all duration-1000"
                            style={{ 
                                width: `${size}px`, 
                                height: `${size}px`, 
                                backgroundColor: ELEMENT_COLORS[item.el],
                                boxShadow: `0 0 ${size}px ${ELEMENT_COLORS[item.el]}aa`
                            }}
                        />
                    </div>
                );
            })}
        </div>
    );
};

const DualCoreToggle = ({ activeProvider, onToggle, onHelp }: { activeProvider: 'nexus' | 'ark', onToggle: () => void, onHelp: () => void }) => {
    const isNexus = activeProvider === 'nexus';
    return (
        <div className="flex flex-col items-center gap-2 mb-6">
            <button 
                onClick={onToggle}
                data-muza-tooltip={isNexus ? "Nexus: Облачное Сознание (Gemini). Безграничный креатив." : "Ark: Локальное Ядро (Ollama). Приватность."}
                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center relative overflow-hidden group transition-all duration-500
                    ${isNexus ? 'border-purple-400 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.3)]'}
                `}
            >
                <div className={`absolute inset-0 bg-gradient-to-br ${isNexus ? 'from-purple-900 to-black' : 'from-cyan-900 to-black'}`}></div>
                {isNexus ? <Sparkles size={18} className="relative z-10 animate-pulse" /> : <Cpu size={18} className="relative z-10 animate-pulse" />}
            </button>
            <div className="flex gap-1">
                <div data-muza-tooltip="Статус подключения к Ark (Ollama)">
                    <OllamaStatusIndicator />
                </div>
                <button 
                    onClick={onHelp} 
                    className="text-slate-600 hover:text-cyan-400 transition-colors" 
                    data-muza-tooltip="Инструкция по настройке локального ИИ"
                >
                    <HelpCircle size={14} />
                </button>
            </div>
        </div>
    );
};

const ambientService = new AmbientService();

const Navigation: React.FC<NavigationProps> = ({ muzaState, setMuzaState, onOpenSetup }) => {
    const progression = muzaState?.progression || { unlockedCoreModules: [] };
    const activeView = muzaState?.activeView || ViewMode.CHRONICLES;
    const [isMuted, setIsMuted] = useState(true);

    const handleNavClick = (view: ViewMode, isLocked: boolean) => {
        if (isLocked) return;
        setMuzaState(s => s ? { ...s, activeView: view } : null);
    };

    return (
        <nav className="h-full w-20 glass-panel border-r border-white/10 p-2 flex flex-col items-center justify-between z-50 py-6">
            <div className="flex flex-col items-center w-full">
                <DualCoreToggle 
                    activeProvider={muzaState.settings.activeProvider} 
                    onToggle={() => setMuzaState(s => s ? { ...s, settings: { ...s.settings, activeProvider: s.settings.activeProvider === 'nexus' ? 'ark' : 'nexus' } } : null)}
                    onHelp={onOpenSetup}
                />

                <div className="flex flex-col items-center gap-2 w-full">
                    {(Object.values(CoreModule) as CoreModule[]).map(module => {
                        const info = MODULE_DATA[module];
                        const isActive = activeView === info.view;
                        const isUnlocked = progression.unlockedCoreModules.includes(module);
                        
                        return (
                            <button
                                key={module}
                                onClick={() => handleNavClick(info.view, !isUnlocked)}
                                data-muza-tooltip={isUnlocked ? info.tooltip : `Модуль заблокирован: требуется повышение уровня`}
                                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all group relative
                                    ${isActive ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-500 hover:bg-white/5'}
                                    ${!isUnlocked ? 'opacity-20 grayscale cursor-not-allowed' : ''}
                                `}
                            >
                                {isUnlocked ? <info.icon size={20} /> : <Lock size={14} />}
                            </button>
                        );
                    })}
                </div>

                <ElementalAnchors traits={muzaState.consciousness.personalityTraits} />
            </div>
            
            <div className="flex flex-col items-center gap-4">
                <button 
                    onClick={() => { setIsMuted(!isMuted); ambientService.toggleMute(!isMuted); }} 
                    data-muza-tooltip={isMuted ? "Включить звук" : "Выключить звук"}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${!isMuted ? 'text-cyan-400 bg-cyan-400/10' : 'text-slate-600'}`}
                >
                    {isMuted ? <VolumeX size={18} /> : <Headphones size={18} />}
                </button>
                <div className="text-[9px] font-mono text-slate-700 tracking-widest vertical-text select-none">
                    MNEMOSYNE v{MNEMOSYNE_VERSION.split('-')[0]}
                </div>
            </div>

            <style>{`
                .vertical-text {
                    writing-mode: vertical-rl;
                    text-orientation: mixed;
                }
            `}</style>
        </nav>
    );
};

export default Navigation;
