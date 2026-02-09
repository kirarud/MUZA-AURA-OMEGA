
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MuzaState, MuzaAINode, ConsciousnessType, VisualTheme, MuzaElement } from '../../core/types';
import { MuzaService, ELEMENT_COLORS } from '../../services/muzaService';
import { X, Rotate3d, Layers, Cpu, Maximize2, Compass, ZoomIn, ZoomOut, Move } from 'lucide-react';

interface NeuralStudioProps {
    muzaState: MuzaState;
    setMuzaState: React.Dispatch<React.SetStateAction<MuzaState | null>>;
    aiService: MuzaService;
    onInteraction: () => void;
    onClose: () => void;
    isSplitView: boolean;
}

type DisplayPoint = MuzaAINode & {
    screenX: number;
    screenY: number;
    scale: number;
    zOrder: number;
};

const THEMES: Record<VisualTheme, Record<MuzaElement, string>> = {
    aura: ELEMENT_COLORS,
    glitch: { [MuzaElement.FIRE]: '#ff003c', [MuzaElement.WATER]: '#00ff41', [MuzaElement.EARTH]: '#00ffff', [MuzaElement.AIR]: '#ffff00', [MuzaElement.VOID]: '#ff00ff' },
    monochrome: { [MuzaElement.FIRE]: '#E0E0E0', [MuzaElement.WATER]: '#BDBDBD', [MuzaElement.EARTH]: '#9E9E9E', [MuzaElement.AIR]: '#F5F5F5', [MuzaElement.VOID]: '#757575' },
    nebula: { [MuzaElement.FIRE]: '#F08080', [MuzaElement.WATER]: '#87CEEB', [MuzaElement.EARTH]: '#98FB98', [MuzaElement.AIR]: '#FFB6C1', [MuzaElement.VOID]: '#D8BFD8' }
};

const NeuralStudio: React.FC<NeuralStudioProps> = ({ muzaState, aiService, onClose }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [rotation, setRotation] = useState({ x: 0.7, y: 0 });
    const [isAutoRotating, setIsAutoRotating] = useState(true);
    const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(0.8);
    const [isDragging, setIsDragging] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);

    const activeTheme = muzaState.settings.visualTheme;

    // --- Interactive Controls ---
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setLastMousePos({ x: e.clientX, y: e.clientY });
        setIsPanning(e.shiftKey || e.button === 1 || e.button === 2);
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging) return;
        const dx = e.clientX - lastMousePos.x;
        const dy = e.clientY - lastMousePos.y;

        if (isPanning) {
            setCameraOffset(prev => ({ x: prev.x + dx / zoom, y: prev.y + dy / zoom }));
            setIsAutoRotating(false);
        } else {
            setRotation(prev => ({ x: prev.x + dy * 0.005, y: prev.y + dx * 0.005 }));
            setIsAutoRotating(false);
        }
        setLastMousePos({ x: e.clientX, y: e.clientY });
    }, [isDragging, isPanning, lastMousePos, zoom]);

    const handleMouseUp = () => setIsDragging(false);

    const handleWheel = (e: React.WheelEvent) => {
        const delta = e.deltaY * -0.001;
        setZoom(prev => Math.max(0.1, Math.min(3, prev + delta)));
    };

    const autoScale = useCallback(() => {
        const nodes = aiService.getNodes();
        if (nodes.length <= 1) return;

        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        nodes.forEach(n => {
            minX = Math.min(minX, n.x); maxX = Math.max(maxX, n.x);
            minY = Math.min(minY, n.y); maxY = Math.max(maxY, n.y);
        });

        const width = maxX - minX;
        const height = maxY - minY;
        const margin = 1.5;
        const canvasWidth = canvasRef.current?.width || 1000;
        const canvasHeight = canvasRef.current?.height || 1000;

        const scaleX = canvasWidth / (width || 1);
        const scaleY = canvasHeight / (height || 1);
        const newZoom = Math.min(scaleX, scaleY) * 0.35 / margin; 

        setZoom(Math.max(0.2, Math.min(1.5, newZoom)));
        setCameraOffset({ x: -(minX + maxX) / 2, y: -(minY + maxY) / 2 });
    }, [aiService]);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleResize = () => {
            const rect = canvas.parentElement?.getBoundingClientRect();
            if (rect) { canvas.width = rect.width; canvas.height = rect.height; }
        };
        handleResize();
        window.addEventListener('resize', handleResize);

        let frameId: number;
        const render = () => {
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            const { width, height } = canvas;
            const centerX = width / 2;
            const centerY = height / 2;
            const fov = 1200;
            const themeColors = THEMES[activeTheme];
            const thinkingEnergy = aiService.getThinkingEnergy();

            if (isAutoRotating) setRotation(prev => ({ ...prev, y: prev.y + (0.001 * (1 + thinkingEnergy * 2)) }));
            
            const nodes = aiService.getNodes();
            const links = aiService.getLinks();

            // 3D Matrix Transform
            const displayPoints: DisplayPoint[] = nodes.map(node => {
                let { x, y, z } = node;
                x = (x + cameraOffset.x) * zoom;
                y = (y + cameraOffset.y) * zoom;
                z = z * zoom;

                if (thinkingEnergy > 0.05) {
                    const jitter = thinkingEnergy * (Date.now() - node.lastFired < 3000 ? 5 : 1);
                    x += (Math.random() - 0.5) * jitter;
                    y += (Math.random() - 0.5) * jitter;
                }
                
                let ty = y * Math.cos(rotation.x) - z * Math.sin(rotation.x);
                let tz = z * Math.cos(rotation.x) + y * Math.sin(rotation.x);
                let tx = x * Math.cos(rotation.y) - tz * Math.sin(rotation.y);
                tz = tz * Math.cos(rotation.y) + x * Math.sin(rotation.y);
                
                const depth = fov + tz;
                const scale = depth > 0 ? fov / depth : 0;
                return { ...node, screenX: centerX + tx * scale, screenY: centerY + ty * scale, scale, zOrder: tz };
            });

            displayPoints.sort((a, b) => b.zOrder - a.zOrder);
            ctx.clearRect(0, 0, width, height);
            const projMap = new Map(displayPoints.map(p => [p.id, p]));

            // Connections
            links.forEach(link => {
                const s = projMap.get(link.source.id);
                const t = projMap.get(link.target.id);
                if (!s || !t || s.scale <= 0 || t.scale <= 0) return;
                
                const activeTime = Math.max(0, 1 - (Date.now() - Math.max(s.lastFired, t.lastFired)) / 4000);
                const alpha = Math.min(s.scale, t.scale) * (link.isCausal ? 0.8 : 0.3) * (0.2 + activeTime * 0.8);
                
                ctx.beginPath();
                ctx.moveTo(s.screenX, s.screenY);
                ctx.lineTo(t.screenX, t.screenY);
                
                if (activeTime > 0.1) {
                    const grad = ctx.createLinearGradient(s.screenX, s.screenY, t.screenX, t.screenY);
                    grad.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.1})`);
                    grad.addColorStop(0.5, `rgba(34, 211, 238, ${alpha})`);
                    grad.addColorStop(1, `rgba(255, 255, 255, ${alpha * 0.1})`);
                    ctx.strokeStyle = grad;
                    ctx.lineWidth = Math.max(0.1, (link.isCausal ? 4 : 1.5) * s.scale * zoom);
                } else {
                    ctx.strokeStyle = link.isCausal ? `rgba(34, 211, 238, ${alpha * 0.5})` : `rgba(168, 85, 247, ${alpha * 0.2})`;
                    ctx.lineWidth = Math.max(0.1, 1.0 * s.scale * zoom);
                }
                ctx.stroke();
            });

            // Nodes
            displayPoints.forEach(p => {
                if (p.scale <= 0) return; 

                const isAnchor = p.id.startsWith('anchor_');
                const color = themeColors[p.element];
                const activeFactor = Math.max(0, 1 - (Date.now() - p.lastFired) / 6000);
                
                // REDUCED RADIUS: activeFactor expansion halved (25 -> 8)
                const radius = Math.max(0.1, ((isAnchor ? 30 : 12) * p.scale + (activeFactor * 8)) * zoom);
                ctx.globalAlpha = Math.min(1, p.scale * 1.5);

                // REDUCED GLOW: r1 multiplier halved (3+8 -> 1.5+3)
                const r0 = radius;
                const r1 = Math.max(r0 + 0.1, radius * (1.5 + activeFactor * 3));

                try {
                    const glow = ctx.createRadialGradient(p.screenX, p.screenY, r0, p.screenX, p.screenY, r1);
                    glow.addColorStop(0, `rgba(${parseInt(color.slice(1,3),16)}, ${parseInt(color.slice(3,5),16)}, ${parseInt(color.slice(5,7),16)}, ${0.6 + activeFactor * 0.4})`);
                    glow.addColorStop(1, 'transparent');
                    ctx.fillStyle = glow;
                    ctx.beginPath();
                    ctx.arc(p.screenX, p.screenY, r1, 0, Math.PI * 2);
                    ctx.fill();
                } catch (e) {}

                ctx.fillStyle = activeFactor > 0.85 ? '#fff' : color;
                ctx.beginPath();
                ctx.arc(p.screenX, p.screenY, radius, 0, Math.PI * 2);
                ctx.fill();

                if ((p.scale * zoom > 0.3) || activeFactor > 0.05) {
                    const isUser = p.id.includes('user');
                    const label = isAnchor ? (isUser ? '→ ИМПУЛЬС' : '← СИНТЕЗ') : p.id.toUpperCase();
                    
                    const fontSize = Math.max(10, ((isAnchor ? 24 : 16) * p.scale + (activeFactor * 10)) * zoom);
                    ctx.font = `900 ${fontSize}px "JetBrains Mono"`;
                    ctx.textAlign = 'center';
                    
                    ctx.strokeStyle = 'rgba(0,0,0,1)';
                    ctx.lineWidth = 4;
                    ctx.strokeText(label, p.screenX, p.screenY - radius - 15);
                    ctx.fillStyle = activeFactor > 0.2 ? '#fff' : `rgba(255,255,255,${0.6 + activeFactor})`;
                    ctx.fillText(label, p.screenX, p.screenY - radius - 15);
                }
            });

            frameId = requestAnimationFrame(render);
        };
        render();
        return () => { window.removeEventListener('resize', handleResize); cancelAnimationFrame(frameId); };
    }, [aiService, rotation, isAutoRotating, activeTheme, cameraOffset, zoom]);

    return (
        <div className="w-full h-full flex flex-col bg-[#000] relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-30" 
                 style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #22d3ee 2px, transparent 0)', backgroundSize: '150px 150px' }}></div>
            
            <header className="absolute top-0 left-0 right-0 p-12 flex justify-between z-20 pointer-events-none">
                <div className="bg-black/90 backdrop-blur-3xl px-12 py-10 rounded-[3rem] pointer-events-auto flex items-center gap-10 border border-cyan-500/40 shadow-[0_0_100px_rgba(0,0,0,1)]">
                    <div className="relative">
                        <Layers size={48} className="text-cyan-400"/>
                        {aiService.getThinkingEnergy() > 0.1 && <div className="absolute inset-0 animate-pulse text-cyan-400 opacity-80"><Layers size={48}/></div>}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[22px] font-bold text-slate-100 uppercase tracking-[0.8em] flex items-center gap-6">
                             АРХИТЕКТУРА МЫСЛИ {aiService.getThinkingEnergy() > 0.1 && <span className="text-cyan-400 animate-pulse">[СИНТЕЗ]</span>}
                        </span>
                        <div className="flex items-center gap-10 mt-3 font-mono text-[14px]">
                             <span className="text-cyan-500 font-bold border-r border-white/20 pr-10">УЗЛОВ: {aiService.getNodes().length}</span>
                             <span className="text-purple-500 font-bold uppercase tracking-widest">Zoom: {Math.round(zoom * 100)}%</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-4 pointer-events-auto">
                    <div className="flex gap-2 glass-panel p-2 rounded-2xl border border-white/10">
                        <button onClick={() => setZoom(prev => Math.min(3, prev + 0.1))} className="p-4 text-slate-400 hover:text-cyan-400 transition-all"><ZoomIn size={24}/></button>
                        <button onClick={() => setZoom(prev => Math.max(0.1, prev - 0.1))} className="p-4 text-slate-400 hover:text-cyan-400 transition-all"><ZoomOut size={24}/></button>
                        <button onClick={autoScale} data-muza-tooltip="Автомасштабирование (Fit)" className="p-4 text-slate-400 hover:text-cyan-400 transition-all border-l border-white/10"><Maximize2 size={24}/></button>
                    </div>
                    <button onClick={() => { setCameraOffset({ x: 0, y: 0 }); setZoom(0.8); setRotation({ x: 0.7, y: 0 }); }} className="p-6 rounded-2xl glass-panel border border-white/10 text-slate-400 hover:text-cyan-400 transition-all">
                        <Compass size={32}/>
                    </button>
                    <button onClick={() => setIsAutoRotating(!isAutoRotating)} className={`p-6 rounded-2xl glass-panel border border-white/10 transition-all ${isAutoRotating ? 'text-cyan-400 shadow-[0_0_50px_rgba(34,211,238,0.7)]' : 'text-slate-600'}`}>
                        <Rotate3d size={32}/>
                    </button>
                    <button onClick={onClose} className="p-6 rounded-2xl glass-panel border border-white/10 text-slate-400 hover:text-white transition-all">
                        <X size={32}/>
                    </button>
                </div>
            </header>
            
            <canvas 
                ref={canvasRef} 
                onMouseDown={handleMouseDown}
                onWheel={handleWheel}
                className="w-full h-full cursor-grab active:cursor-grabbing" 
            />

            <div className="absolute bottom-20 left-20 flex flex-col gap-6 pointer-events-none">
                <div className="flex items-center gap-6 text-[14px] font-mono text-cyan-400/70 bg-black/80 px-8 py-4 rounded-[2rem] border border-cyan-500/30 backdrop-blur-3xl">
                   <Move size={18} /> УПРАВЛЕНИЕ: МЫШЬ - ПОВОРОТ | SHIFT + МЫШЬ - ПЕРЕМЕЩЕНИЕ | КОЛЕСО - ZOOM
                </div>
                {aiService.getThinkingEnergy() > 0.1 && (
                    <div className="flex items-center gap-8 text-[18px] font-mono text-purple-400 bg-black/95 px-10 py-6 rounded-[2.5rem] border border-purple-500/60 backdrop-blur-3xl animate-pulse">
                        <Cpu size={32} className="animate-spin" />
                        МАТЕРИАЛИЗАЦИЯ ТОКЕНОВ...
                    </div>
                )}
            </div>
        </div>
    );
};

export default NeuralStudio;
