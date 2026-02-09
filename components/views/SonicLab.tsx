
import React, { useState, useEffect } from 'react';
import { MuzaState, AcousticManifold } from '../../core/types';
import { X, Waves, Activity, Zap, Shield, Volume2 } from 'lucide-react';

interface SonicLabProps {
    muzaState: MuzaState;
    setMuzaState: React.Dispatch<React.SetStateAction<MuzaState | null>>;
    onClose: () => void;
}

const SonicLab: React.FC<SonicLabProps> = ({ muzaState, setMuzaState, onClose }) => {
    const [stability, setStability] = useState(100);
    const { sonicManifold } = muzaState;

    useEffect(() => {
        const interval = setInterval(() => {
            setStability(s => Math.max(85, s + (Math.random() - 0.5) * 2));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-full max-w-7xl mx-auto flex flex-col glass-panel rounded-2xl animate-fade-in overflow-hidden relative border border-cyan-500/20">
            <header className="p-4 border-b border-white/10 text-center flex items-center justify-between flex-shrink-0 bg-black/40">
                <div className="w-8"></div>
                <h1 className="text-2xl font-bold text-cyan-300 flex items-center justify-center gap-2">
                    <Waves className="text-cyan-400 animate-pulse" />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 uppercase tracking-tighter font-mono">Mnemosyne-Q: Акустическое Ядро</span>
                </h1>
                <button onClick={onClose} data-muza-tooltip="Закрыть акустическое ядро" className="text-slate-400 hover:text-white transition-colors"><X size={24}/></button>
            </header>

            <div className="flex-1 p-8 grid grid-cols-1 md:grid-cols-3 gap-8 overflow-y-auto custom-scrollbar bg-slate-950/20">
                
                {/* Left: Global Metrics */}
                <div className="flex flex-col gap-6">
                    <div className="glass-panel p-6 rounded-xl border border-cyan-500/30 bg-cyan-950/10">
                        <h3 className="text-xs font-bold text-cyan-500 uppercase mb-4 flex items-center gap-2 font-mono"><Activity size={14}/> Статус Решетки</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                                    <span>ИНДЕКС СТАБИЛЬНОСТИ</span>
                                    <span className="text-cyan-400">{stability.toFixed(2)}%</span>
                                </div>
                                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-cyan-500 transition-all duration-500" style={{ width: `${stability}%` }} />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                                    <span>КОГЕРЕНТНОСТЬ (HMM)</span>
                                    <span className="text-purple-400">0.892</span>
                                </div>
                                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-purple-500 transition-all duration-500" style={{ width: `89%` }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel p-6 rounded-xl border border-white/5 bg-black/40">
                         <h3 className="text-xs font-bold text-slate-400 uppercase mb-4 flex items-center gap-2 font-mono"><Shield size={14}/> Защита Данных</h3>
                         <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-[10px] font-mono text-green-400">
                             ШИФРОВАНИЕ ЯДРА: АКТИВНО<br/>
                             ЛОКАЛЬНЫЕ ВЕСА: ПРОВЕРЕНО<br/>
                             УТЕЧКА ДАННЫХ: 0.00%
                         </div>
                    </div>
                </div>

                {/* Center: 3D Hertzian Grid (Visualizer Placeholder) */}
                <div className="md:col-span-2 glass-panel rounded-2xl relative overflow-hidden flex flex-col items-center justify-center p-4 min-h-[400px] border border-white/5 bg-black/60 shadow-inner">
                    <div className="absolute inset-0 opacity-20 pointer-events-none" 
                         style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(34, 211, 238, 0.5) 1px, transparent 0)', backgroundSize: '40px 40px' }}>
                    </div>
                    
                    <div className="relative w-64 h-64 border-2 border-cyan-500/30 rounded-full flex items-center justify-center">
                         <div className="absolute inset-0 animate-spin-slow opacity-30">
                            <Waves size={256} className="text-cyan-400" />
                         </div>
                         <div className="text-center z-10">
                            <div className="text-4xl font-bold font-mono text-cyan-300 drop-shadow-lg">432Hz</div>
                            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-2">Базовый Резонанс</div>
                         </div>
                    </div>

                    <div className="mt-8 grid grid-cols-3 gap-12 w-full max-w-md">
                        <div className="text-center">
                            <div className="text-xs font-mono text-slate-500">X-ЧАСТОТА</div>
                            <div className="text-lg font-bold text-cyan-400">1.04k</div>
                        </div>
                        <div className="text-center border-x border-white/10">
                            <div className="text-xs font-mono text-slate-500">Y-ТЕМП</div>
                            <div className="text-lg font-bold text-purple-400">125ms</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xs font-mono text-slate-500">Z-АМПЛИТУДА</div>
                            <div className="text-lg font-bold text-blue-400">-12dB</div>
                        </div>
                    </div>
                </div>

                {/* Bottom Row: Affective Vector */}
                <div className="md:col-span-3 flex gap-8 items-center glass-panel p-6 rounded-xl border border-white/5">
                    <div className="flex-1">
                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-4 font-mono">Аффективный Вектор (Дешифровка Настроения)</h3>
                        <div className="flex gap-12">
                             <div className="flex-1">
                                <div className="text-[10px] text-slate-500 font-mono mb-2">VALENCE (Позитивность)</div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-red-500 to-green-500" style={{ width: '65%' }} />
                                </div>
                             </div>
                             <div className="flex-1">
                                <div className="text-[10px] text-slate-500 font-mono mb-2">AROUSAL (Энергия)</div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-blue-500 to-yellow-500" style={{ width: '42%' }} />
                                </div>
                             </div>
                        </div>
                    </div>
                    <div className="p-4 bg-cyan-600/20 border border-cyan-500/50 rounded-xl flex items-center gap-4">
                        <Volume2 className="text-cyan-400" />
                        <div>
                            <div className="text-[10px] font-bold text-cyan-300">ГОЛОСОВОЙ МОДУЛЬ: АКТИВЕН</div>
                            <div className="text-[9px] font-mono text-cyan-500/60 tracking-tighter">PHONETIC_STAMP_GEN_V1</div>
                        </div>
                    </div>
                </div>

            </div>

            <footer className="p-4 border-t border-white/5 bg-black/40 text-center flex justify-center gap-8">
                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    HMM_SYNC: OK
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-600">
                    <Zap size={10}/> ENERGY_STABILITY: 0.99
                </div>
            </footer>
        </div>
    );
};

export default SonicLab;
