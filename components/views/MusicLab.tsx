
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MuzaState, EmotionType } from '../../core/types';
import { GoogleGenAI } from "@google/genai";
import { X, Play, Pause, SkipBack, SkipForward, Volume2, Upload, Music, Disc, Waves, Sparkles, Loader } from 'lucide-react';

interface Track {
    id: string;
    name: string;
    artist: string;
    url: string;
    file?: File;
}

interface MusicLabProps {
    muzaState: MuzaState;
    setMuzaState: React.Dispatch<React.SetStateAction<MuzaState | null>>;
    onClose: () => void;
}

const MusicLab: React.FC<MusicLabProps> = ({ muzaState, setMuzaState, onClose }) => {
    const [tracks, setTracks] = useState<Track[]>([]);
    const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isGeneratingVisual, setIsGeneratingVisual] = useState(false);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const visualizerCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    const activeTrack = currentTrackIndex !== null ? tracks[currentTrackIndex] : null;

    const togglePlay = useCallback(() => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    setIsPlaying(true);
                    if (audioContextRef.current?.state === 'suspended') audioContextRef.current.resume();
                    setupVisualizer();
                }).catch(error => console.error("Playback error:", error));
            }
        }
    }, [isPlaying]);

    const nextTrack = useCallback(() => {
        if (tracks.length === 0) return;
        setCurrentTrackIndex(prev => (prev === null || prev === tracks.length - 1) ? 0 : prev + 1);
    }, [tracks]);

    const prevTrack = useCallback(() => {
        if (tracks.length === 0) return;
        setCurrentTrackIndex(prev => (prev === null || prev === 0) ? tracks.length - 1 : prev - 1);
    }, [tracks]);

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                e.preventDefault();
                togglePlay();
            } else if (e.code === 'ArrowRight') {
                nextTrack();
            } else if (e.code === 'ArrowLeft') {
                prevTrack();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [togglePlay, nextTrack, prevTrack]);

    useEffect(() => {
        if (!audioContextRef.current) {
            const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
            audioContextRef.current = new AudioContext();
        }
        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = "";
            }
        };
    }, []);

    const handleGenerateVisualFromMusic = async () => {
        if (!activeTrack) return;
        setIsGeneratingVisual(true);
        try {
            if ((window as any).aistudio && !(await (window as any).aistudio.hasSelectedApiKey())) {
                 await (window as any).aistudio.openSelectKey();
            }
            const prompt = `Cover art for music: "${activeTrack.name}". Emotion: ${muzaState.consciousness.activeEmotion}. Style: Synesthesia, Cyber-abstract.`;
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-image-preview',
                contents: [{ parts: [{ text: prompt }] }],
                config: { imageConfig: { aspectRatio: "1:1", imageSize: "1K" } }
            });
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const id = `music-vis-${Date.now()}`;
                    setMuzaState(s => s ? { ...s, artifacts: { ...s.artifacts, [id]: { id, category: 'image', dataType: 'png', createdAt: Date.now(), data: part.inlineData!.data, prompt: `Видение: ${activeTrack.name}` } as any } } : null);
                }
            }
        } catch (e) { console.error("Visual failed", e); }
        finally { setIsGeneratingVisual(false); }
    };

    const setupVisualizer = () => {
        if (!audioRef.current || !audioContextRef.current || analyserRef.current) return;
        const ctx = audioContextRef.current;
        try {
            const source = ctx.createMediaElementSource(audioRef.current);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 128;
            source.connect(analyser);
            analyser.connect(ctx.destination);
            analyserRef.current = analyser;
            draw();
        } catch (e) {}
    };

    const draw = () => {
        if (!visualizerCanvasRef.current || !analyserRef.current) return;
        const canvas = visualizerCanvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const render = () => {
            if (!analyserRef.current) return;
            animationFrameRef.current = requestAnimationFrame(render);
            analyserRef.current.getByteFrequencyData(dataArray);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const barWidth = (canvas.width / bufferLength) * 2;
            let x = 0;
            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * canvas.height;
                ctx.fillStyle = `rgba(34, 211, 238, ${0.4 + (barHeight/canvas.height)})`;
                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                x += barWidth + 2;
            }
        };
        render();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        const newTracks: Track[] = Array.from(files).map((file: File) => ({
            id: `track-${Date.now()}`,
            name: file.name.replace(/\.[^/.]+$/, ""),
            artist: "Локальный Файл",
            url: URL.createObjectURL(file)
        }));
        setTracks(prev => [...prev, ...newTracks]);
        if (currentTrackIndex === null) setCurrentTrackIndex(0);
    };

    return (
        <div className="w-full h-full max-w-7xl mx-auto flex flex-col glass-panel rounded-2xl animate-fade-in overflow-hidden relative">
            <header className="p-4 border-b border-white/10 text-center flex items-center justify-between flex-shrink-0 bg-black/20">
                <div className="w-8"></div>
                <h1 className="text-2xl font-bold text-cyan-300 flex items-center justify-center gap-2">
                    <Music className="text-cyan-400" />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">Музыкальная Лаборатория</span>
                </h1>
                <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><X size={24}/></button>
            </header>

            <div className="flex-1 flex flex-col md:flex-row p-6 gap-8 overflow-hidden">
                <div className="md:w-1/3 flex flex-col gap-4 overflow-hidden">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Disc size={16}/> ПЛЕЙЛИСТ</h3>
                        <label className="cursor-pointer text-cyan-400 hover:text-cyan-300 p-2 rounded-full hover:bg-white/5 transition-all">
                            <Upload size={18}/>
                            <input type="file" multiple accept="audio/*" className="hidden" onChange={handleFileChange} />
                        </label>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                        {tracks.map((track, idx) => (
                            <button key={track.id} onClick={() => { setIsPlaying(false); setCurrentTrackIndex(idx); }} className={`w-full p-3 rounded-lg text-left transition-all flex items-center gap-3 border ${currentTrackIndex === idx ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300' : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10'}`}>
                                <Music size={14} className={currentTrackIndex === idx ? 'text-cyan-400' : 'text-slate-600'} />
                                <div className="font-bold text-xs truncate">{track.name}</div>
                            </button>
                        ))}
                        {tracks.length === 0 && <div className="text-center py-8 text-slate-600 text-xs italic">Загрузите музыку</div>}
                    </div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center p-4 bg-black/20 rounded-2xl relative border border-white/5">
                    <div className="w-full max-w-sm aspect-square rounded-2xl overflow-hidden relative mb-8 shadow-2xl border border-white/10 group bg-slate-900">
                        <canvas ref={visualizerCanvasRef} className="w-full h-full opacity-60" width={400} height={400} />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <Disc size={80} className={`text-cyan-500/10 ${isPlaying ? 'animate-spin-slow' : ''}`} />
                        </div>
                        {activeTrack && (
                            <button onClick={handleGenerateVisualFromMusic} disabled={isGeneratingVisual} className="absolute top-4 right-4 p-3 bg-black/60 rounded-full border border-cyan-500/50 text-cyan-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all z-20">
                                {isGeneratingVisual ? <Loader className="animate-spin" size={18}/> : <Sparkles size={18}/>}
                            </button>
                        )}
                    </div>
                    <h2 className="text-xl font-bold text-white mb-6">{activeTrack?.name || "Ожидание..."}</h2>
                    <div className="flex items-center gap-8">
                        <button onClick={prevTrack} className="text-slate-400 hover:text-white"><SkipBack size={24}/></button>
                        <button onClick={togglePlay} className="w-14 h-14 rounded-full bg-cyan-600 flex items-center justify-center text-white shadow-lg hover:scale-105 transition-all">
                            {isPlaying ? <Pause size={28} fill="white"/> : <Play size={28} className="ml-1" fill="white"/>}
                        </button>
                        <button onClick={nextTrack} className="text-slate-400 hover:text-white"><SkipForward size={24}/></button>
                    </div>
                    <div className="mt-8 text-[9px] font-mono text-cyan-500/50 uppercase tracking-[0.3em] flex items-center gap-2">
                        <Waves size={12} className="animate-pulse" /> Keyboard Controls: [SPACE] Play/Pause | [Arrows] Navigate
                    </div>
                </div>
            </div>
            <audio ref={audioRef} src={activeTrack?.url} onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)} onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)} onEnded={() => { setIsPlaying(false); nextTrack(); }} />
        </div>
    );
};

export default MusicLab;
