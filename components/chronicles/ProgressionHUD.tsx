
import React, { useState, useEffect } from 'react';
import { ProgressionState, Achievement } from '../../core/types';
import { ACHIEVEMENTS_DATA, LEVEL_FORMULA } from '../../core/state';
import { Award, Zap, Shield, Star } from 'lucide-react';

interface ProgressionHUDProps {
    progression: ProgressionState;
}

const ProgressionHUD: React.FC<ProgressionHUDProps> = ({ progression }) => {
    const [showAchievementToast, setShowAchievementToast] = useState(false);
    const unlockedAchievements = ACHIEVEMENTS_DATA.filter(a => progression.achievements.includes(a.id));
    const recentAchievement = unlockedAchievements.length > 0 ? unlockedAchievements[unlockedAchievements.length - 1] : null;

    useEffect(() => {
        if (recentAchievement) {
            setShowAchievementToast(true);
            const timer = setTimeout(() => setShowAchievementToast(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [progression.achievements.length, recentAchievement]);

    const nextLevelXp = LEVEL_FORMULA(progression.level);
    const progressPercent = Math.min(100, (progression.xp / nextLevelXp) * 100);

    return (
        <div className="absolute top-0 left-0 right-0 z-30 pointer-events-none p-4 flex flex-col items-center">
            {/* Main Progress Bar */}
            <div className="w-full max-w-md glass-panel rounded-full px-4 py-1.5 flex items-center gap-4 border border-white/10 backdrop-blur-xl shadow-lg pointer-events-auto">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/50">
                        <span className="text-xs font-bold text-cyan-400">{progression.level}</span>
                    </div>
                </div>
                
                <div className="flex-1 flex flex-col gap-1">
                    <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 uppercase tracking-tighter">
                        <span className="flex items-center gap-1"><Zap size={10} className="text-yellow-400"/> {progression.rank}</span>
                        <span>{Math.floor(progression.xp)} / {nextLevelXp} XP</span>
                    </div>
                    <div className="w-full bg-slate-800/50 h-1 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-1000 shadow-[0_0_10px_#06b6d4]" 
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 border-l border-white/10 pl-4">
                    <Star size={12} className="text-yellow-500" />
                    <span className="text-[10px] font-mono text-yellow-500">{progression.singularityFragments}</span>
                </div>
            </div>

            {/* Achievement Toast Overlay */}
            {showAchievementToast && recentAchievement && (
                <div className="mt-4 glass-panel p-4 rounded-xl border border-yellow-500/30 bg-black/80 backdrop-blur-xl animate-fade-in shadow-[0_0_30px_rgba(234,179,8,0.2)] flex items-center gap-4 max-w-sm pointer-events-auto">
                    <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500">
                        <Award size={24} className="text-yellow-400" />
                    </div>
                    <div>
                        <div className="text-xs text-yellow-500 font-bold uppercase tracking-widest mb-1">Достижение</div>
                        <h4 className="text-white font-bold text-sm">{recentAchievement.title}</h4>
                        <p className="text-[10px] text-slate-400 mt-1">{recentAchievement.description}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProgressionHUD;
