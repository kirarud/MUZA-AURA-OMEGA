
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { MuzaState, ToolCallHandler, MuzaElement, ConsciousnessType } from '../../core/types';
import { Ghost } from '../../services/dream/ghost';
import InkSimulation from '../../services/dream/inkSimulation';
import { OpticsEngine } from '../../services/dream/opticsEngine';
import { MuzaService } from '../../services/muzaService';
import { InteractionManager } from '../../services/dream/interactionManager';
import { generatePaperTexture } from '../../services/dream/paper';

import ControlPanel from '../dream/ControlPanel';
import SettingsPill from '../dream/SettingsPill';
import VoiceStatus from '../dream/VoiceStatus';
import { Eraser, Loader, Sparkles } from 'lucide-react';

interface DreamStudioProps {
    muzaState: MuzaState;
    setMuzaState: React.Dispatch<React.SetStateAction<MuzaState | null>>;
    aiService: MuzaService;
    onGrantXp: (source: any) => void;
    toggleLog: () => void;
    registerToolHandler: (handler: ToolCallHandler) => void;
    toggleVoice: () => void;
}

const DreamStudio: React.FC<DreamStudioProps> = (props) => {
    const { muzaState, setMuzaState, aiService, onGrantXp, toggleLog, registerToolHandler, toggleVoice } = props;
    
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const paperCanvasRef = useRef<HTMLCanvasElement>(null);
    const opticsCanvasRef = useRef<HTMLCanvasElement>(null);
    
    const simulationRef = useRef<InkSimulation | null>(null);
    const ghostRef = useRef<Ghost | null>(null);
    const opticsEngineRef = useRef<OpticsEngine | null>(null);
    const interactionManagerRef = useRef<InteractionManager | null>(null);
    
    const [isUiVisible, setIsUiVisible] = useState(true);
    const [isReady, setIsReady] = useState(false);
    
    const { dreamStudio, consciousness, progression } = muzaState;
    const { brush, simulation, paper, aiStatus, isGhostEnabled } = dreamStudio;

    const setBrush = (u: any) => { 
        const newBrush = typeof u === 'function' ? u(brush) : u;
        setMuzaState(s => s ? { ...s, dreamStudio: { ...s.dreamStudio, brush: newBrush } } : null);
    };

    const initEngine = useCallback((width: number, height: number) => {
        if (!canvasRef.current || !paperCanvasRef.current || !opticsCanvasRef.current || width <= 0 || height <= 0) return;
        
        [canvasRef.current, paperCanvasRef.current, opticsCanvasRef.current].forEach(c => { 
            c.width = width; 
            c.height = height; 
        });

        if (!simulationRef.current) {
            simulationRef.current = new InkSimulation(canvasRef.current);
        } else {
            simulationRef.current.resize(width, height);
        }

        if (!opticsEngineRef.current) {
            opticsEngineRef.current = new OpticsEngine(opticsCanvasRef.current);
        } else {
            opticsEngineRef.current.resize(width, height);
        }

        if (!ghostRef.current) {
            ghostRef.current = new Ghost(simulationRef.current, consciousness, brush, { width, height }, aiService);
        }

        if (!interactionManagerRef.current) {
            interactionManagerRef.current = new InteractionManager({
                canvas: canvasRef.current, simulation: simulationRef.current, aiService, brush,
                onGrantXp, onInteractionStart: () => {}, onInteractionEnd: () => {},
            });
        }

        const paperCtx = paperCanvasRef.current.getContext('2d');
        if (paperCtx) {
            paperCtx.clearRect(0, 0, width, height);
            const texture = generatePaperTexture(width, height, paper.roughness);
            paperCtx.drawImage(texture, 0, 0);
        }
        
        setIsReady(true);
    }, [consciousness, brush, aiService, onGrantXp, paper.roughness]);

    useEffect(() => {
        if (!containerRef.current) return;
        
        const updateLayout = () => {
            const rect = containerRef.current?.getBoundingClientRect();
            if (rect && rect.width > 0 && rect.height > 0) {
                initEngine(rect.width, rect.height);
            }
        };

        const observer = new ResizeObserver(entries => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                if (width > 0 && height > 0) initEngine(width, height);
            }
        });

        observer.observe(containerRef.current);
        window.addEventListener('resize', updateLayout);
        updateLayout();

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', updateLayout);
        };
    }, [initEngine]);

    useEffect(() => {
        if (!isReady) return;
        let frame: number;
        const loop = () => {
            if (ghostRef.current) {
                ghostRef.current.updateDependencies(consciousness, brush, { width: canvasRef.current?.width || 100, height: canvasRef.current?.height || 100 }, aiService);
                if (isGhostEnabled) ghostRef.current.update();
            }
            simulationRef.current?.update();
            simulationRef.current?.render(brush.color);
            opticsEngineRef.current?.render(aiService.getNodes());
            frame = requestAnimationFrame(loop);
        };
        loop();
        return () => cancelAnimationFrame(frame);
    }, [isReady, isGhostEnabled, brush, consciousness, aiService]);

    return (
        <div ref={containerRef} className="w-full h-full relative bg-[#020202] overflow-hidden">
            <canvas ref={paperCanvasRef} className="absolute inset-0 pointer-events-none opacity-40 z-0" />
            <canvas ref={opticsCanvasRef} className="absolute inset-0 pointer-events-none mix-blend-screen opacity-30 z-1" />
            <canvas 
                ref={canvasRef} 
                className="absolute inset-0 cursor-crosshair z-10"
                onMouseDown={e => interactionManagerRef.current?.handleMouseDown(e.nativeEvent)}
                onMouseMove={e => interactionManagerRef.current?.handleMouseMove(e.nativeEvent)}
                onMouseUp={() => interactionManagerRef.current?.handleMouseUp()}
            />

            {!isReady && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-50">
                    <Loader className="text-cyan-400 animate-spin mb-4" size={48} />
                    <span className="text-cyan-500 font-mono tracking-widest text-xs animate-pulse">CALIBRATING_CANVAS...</span>
                </div>
            )}

            <SettingsPill
                toggleUi={() => setIsUiVisible(!isUiVisible)}
                aiStatus={aiStatus}
                toggleVoice={toggleVoice}
                saveToVault={() => {}}
                isGhostEnabled={isGhostEnabled}
                toggleGhost={() => setMuzaState(s => s ? { ...s, dreamStudio: { ...s.dreamStudio, isGhostEnabled: !s.dreamStudio.isGhostEnabled } } : null)}
                toggleLog={toggleLog}
            />
            
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 z-40">
                <button onClick={() => simulationRef.current?.clear()} className="px-6 py-2 rounded-full glass-panel text-[10px] font-bold tracking-widest hover:bg-white/10 transition-all flex items-center gap-2 border border-white/10"><Eraser size={12}/> ОЧИСТИТЬ ХОЛСТ</button>
            </div>

            {isUiVisible && isReady && (
                <ControlPanel 
                    brush={brush} setBrush={setBrush}
                    simulation={simulation} setSimulation={(u:any)=>setMuzaState(s=>s?{...s, dreamStudio:{...s.dreamStudio, simulation: typeof u === 'function' ? u(s.dreamStudio.simulation) : u }}:null)}
                    paper={paper} setPaper={(u:any)=>setMuzaState(s=>s?{...s, dreamStudio:{...s.dreamStudio, paper: typeof u === 'function' ? u(s.dreamStudio.paper) : u }}:null)}
                    unlockedSkills={progression.unlockedSkills}
                />
            )}
        </div>
    );
};

export default DreamStudio;
