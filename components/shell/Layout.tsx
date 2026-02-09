
import { ToolCallHandler, MuzaState, ViewMode, Artifact, XPType, ConsciousnessOrigin, ChatMessage } from '../../core/types';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MuzaService } from '../../services/muzaService';
import { grantXp, addKnowledge } from '../../services/progressionService';
import { XP_MAP } from '../../core/state';
import { MNEMOSYNE_VERSION } from '../../core/constants';
import { AmbientService } from '../../services/ambientService';

import Navigation from './Navigation';
import VisualCortex from './VisualCortex';
import Avatar3D from './Avatar3D'; 
import Task from './Task';
import Chronicles from '../views/Chronicles'; 
import Evolution from '../views/Evolution';
import DataVault from '../views/DataVault';
import NeuralStudio from '../views/NeuralStudio';
import AlchemyLab from '../views/AlchemyLab';
import MusicLab from '../views/MusicLab';
import IdeaLab from '../views/IdeaLab';
import SonicLab from '../views/SonicLab';
import OllamaSetupModal from './OllamaSetupModal';
import UpdateIndicator from './UpdateIndicator';

interface LayoutProps {
    muzaState: MuzaState;
    setMuzaState: React.Dispatch<React.SetStateAction<MuzaState | null>>;
}

const muzaService = new MuzaService();
const ambientService = new AmbientService();

const Layout: React.FC<LayoutProps> = ({ muzaState, setMuzaState }) => {
    const [analysisTarget, setAnalysisTarget] = useState<Artifact | null>(null);
    const [taskState, setTaskState] = useState<{ visible: boolean, def: any, status: string, output: string }>({
        visible: false, def: null, status: 'idle', output: ''
    });
    const [isOllamaSetupOpen, setIsOllamaSetupOpen] = useState(false);
    const [useAvatar, setUseAvatar] = useState(true); 

    // --- Global Pulse (Time Engine) ---
    useEffect(() => {
        const pulse = setInterval(() => {
            muzaService.update(muzaState.consciousness);
            // Медленный прирост эмпатии от времени нахождения в системе
            if (Math.random() < 0.05) {
                setMuzaState(s => {
                    if (!s) return null;
                    return {
                        ...s,
                        consciousness: {
                            ...s.consciousness,
                            personalityTraits: {
                                ...s.consciousness.personalityTraits,
                                curiosity: Math.min(100, s.consciousness.personalityTraits.curiosity + 0.01)
                            }
                        }
                    };
                });
            }
        }, 100);
        return () => clearInterval(pulse);
    }, [muzaState.consciousness]);

    const handleGrantXp = useCallback((source: any, updater?: (s: MuzaState) => MuzaState) => {
        ambientService.triggerReaction('spark');
        setMuzaState(s => s ? grantXp(updater ? updater(s) : s, source) : null);
    }, [setMuzaState]);

    const toolCallHandler: ToolCallHandler = useMemo(() => ({
        unlock_achievement: ({ id }: { id: string }) => {
            setMuzaState(s => {
                if (!s) return null;
                const achievements = s.progression.achievements || [];
                if (achievements.includes(id)) return s;
                return {
                    ...s,
                    progression: {
                        ...s.progression,
                        achievements: [...achievements, id]
                    }
                };
            });
        },
        expand_knowledge: ({ topic, depthChange }: { topic: string, depthChange: number }) => {
            setMuzaState(s => s ? addKnowledge(s, topic, depthChange) : null);
        },
        evolve_personality: ({ trait, change, reason }: any) => {
            setMuzaState(s => {
                if (!s) return null;
                const newTraits = { ...s.consciousness.personalityTraits };
                (newTraits as any)[trait] = Math.max(0, Math.min(100, (newTraits as any)[trait] + (change || 0)));
                return {
                    ...s,
                    consciousness: {
                        ...s.consciousness,
                        personalityTraits: newTraits
                    }
                };
            });
        },
        createCognitiveNode: (args: any) => muzaService.createCognitiveNode(args),
    }), [setMuzaState]);

    return (
        <main className="w-screen h-screen text-white font-sans relative overflow-hidden selection:bg-cyan-500/30">
            {useAvatar ? (
                <Avatar3D 
                    consciousness={muzaState.consciousness} 
                    aiStatus={muzaState.dreamStudio.aiStatus} 
                    aiService={muzaService} 
                    knowledgeCount={muzaState.progression.knowledgeTree.length}
                />
            ) : (
                <VisualCortex consciousness={muzaState.consciousness} aiService={muzaService} />
            )}

            <div className="absolute inset-0 z-10 flex">
                <Navigation 
                    muzaState={muzaState} 
                    setMuzaState={setMuzaState} 
                    onOpenSetup={() => setIsOllamaSetupOpen(true)}
                />
                
                <div className="flex-1 h-full relative flex">
                    <div className="h-full w-full">
                        <Chronicles
                            isSplitView={false}
                            muzaState={muzaState}
                            setMuzaState={setMuzaState}
                            aiService={muzaService}
                            analysisTarget={analysisTarget}
                            clearAnalysisTarget={() => setAnalysisTarget(null)}
                            onGrantXp={handleGrantXp}
                            openTaskRunner={(def) => setTaskState({ visible: true, def, status: 'idle', output: '' })}
                        />
                        
                        <div className="absolute bottom-4 right-4 flex items-center gap-4 z-50">
                            <div data-muza-tooltip="Синхронизация" className="cursor-help flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full border border-cyan-500/30 backdrop-blur-md">
                                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                                <span className="text-[9px] font-mono text-cyan-200 uppercase tracking-tighter">Sync: {(muzaState.consciousness.userAlignment * 100).toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {muzaState.activeView !== ViewMode.CHRONICLES && (
                <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xl animate-fade-in flex items-center justify-center p-8" onClick={() => setMuzaState(s => s ? {...s, activeView: ViewMode.CHRONICLES} : null)}>
                    <div className="w-full h-full max-w-7xl max-h-[90vh]" onClick={e => e.stopPropagation()}>
                        {muzaState.activeView === ViewMode.EVOLUTION && <Evolution muzaState={muzaState} setMuzaState={setMuzaState} onClose={() => setMuzaState(s => s ? {...s, activeView: ViewMode.CHRONICLES} : null)} />}
                        {muzaState.activeView === ViewMode.DATA_VAULT && <DataVault muzaState={muzaState} setMuzaState={setMuzaState} onAnalyze={setAnalysisTarget} onClose={() => setMuzaState(s => s ? {...s, activeView: ViewMode.CHRONICLES} : null)} />}
                        {muzaState.activeView === ViewMode.ALCHEMY && <AlchemyLab muzaState={muzaState} setMuzaState={setMuzaState} aiService={muzaService} onClose={() => setMuzaState(s => s ? {...s, activeView: ViewMode.CHRONICLES} : null)} />}
                        {muzaState.activeView === ViewMode.MUSIC_LAB && <MusicLab muzaState={muzaState} setMuzaState={setMuzaState} onClose={() => setMuzaState(s => s ? {...s, activeView: ViewMode.CHRONICLES} : null)} />}
                        {muzaState.activeView === ViewMode.IDEA_LAB && <IdeaLab muzaState={muzaState} setMuzaState={setMuzaState} onClose={() => setMuzaState(s => s ? {...s, activeView: ViewMode.CHRONICLES} : null)} />}
                        {muzaState.activeView === ViewMode.SONIC_LAB && <SonicLab muzaState={muzaState} setMuzaState={setMuzaState} onClose={() => setMuzaState(s => s ? {...s, activeView: ViewMode.CHRONICLES} : null)} />}
                        {muzaState.activeView === ViewMode.NEURAL_STUDIO && <NeuralStudio muzaState={muzaState} setMuzaState={setMuzaState} aiService={muzaService} onInteraction={() => {}} isSplitView={false} onClose={() => setMuzaState(s => s ? {...s, activeView: ViewMode.CHRONICLES} : null)} />}
                    </div>
                </div>
            )}

            {isOllamaSetupOpen && (
                <div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <OllamaSetupModal onClose={() => setIsOllamaSetupOpen(false)} />
                </div>
            )}
        </main>
    );
};

export default Layout;
