
import React from 'react';
import { Loader } from 'lucide-react';

interface UpdateIndicatorProps {
    isUpdating: boolean;
    progress: number;
}

const UpdateIndicator: React.FC<UpdateIndicatorProps> = ({ isUpdating, progress }) => {
    if (!isUpdating) return null;

    return (
        <div className="fixed top-0 left-0 w-full h-full z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl animate-fade-in">
            <div className="w-full max-w-md p-8 flex flex-col items-center gap-6">
                <div className="relative">
                    <Loader size={64} className="text-cyan-400 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold text-cyan-300">
                        {progress}%
                    </div>
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-xl font-bold text-white tracking-widest uppercase">Синхронизация Ядра</h2>
                    <p className="text-slate-400 text-sm font-mono">Перезапись когнитивных секторов...</p>
                </div>
                <div className="w-full bg-slate-900 border border-white/10 h-2 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="grid grid-cols-2 w-full gap-2">
                    <div className="text-[10px] font-mono text-cyan-500/50">SECTOR_UPDATE: OK</div>
                    <div className="text-[10px] font-mono text-cyan-500/50 text-right">MEM_INJECTION: RUNNING</div>
                </div>
            </div>
        </div>
    );
};

export default UpdateIndicator;
