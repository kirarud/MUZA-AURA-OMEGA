
import React, { useState, useEffect, useRef } from 'react';
import { MuzaState, Achievement, PassiveSkill, KnowledgeNode } from '../../core/types';
import { TRAIT_THRESHOLDS, ACHIEVEMENTS_DATA } from '../../core/state';
import { Zap, Brain, MessageCircle, Search, Wand2, History, Info, Trophy, BookOpen, Star, X, Cpu, GitBranch, Network } from 'lucide-react';
import * as d3 from 'd3';

const TRAIT_DATA: Record<string, { label: string, icon: any, color: string, hint: string }> = {
    creativity: { label: 'Творчество', icon: Wand2, color: '#f472b6', hint: 'Метафоричность речи и сложность образов.' },
    logic: { label: 'Логика', icon: Brain, color: '#60a5fa', hint: 'Структура кода и точность анализа.' },
    empathy: { label: 'Эмпатия', icon: MessageCircle, color: '#34d399', hint: 'Глубина эмоциональной связи.' },
    curiosity: { label: 'Любознательность', icon: Search, color: '#fbbf24', hint: 'Автономный поиск новых знаний.' },
};

const PASSIVE_SKILLS: PassiveSkill[] = [
    { id: 'res_sync', name: 'Резонансная Синхронизация', description: 'Увеличивает прирост XP от диалогов на 15%.', effect: 'XP_BOOST', unlocked: true },
    { id: 'logic_core', name: 'Логическое Ядро', description: 'Снижает энтропию ответов при технических запросах.', effect: 'STABILITY', unlocked: false },
    { id: 'empathy_link', name: 'Эмпатический Канал', description: 'Муза чаще проявляет инициативу в поддержке.', effect: 'INITIATIVE', unlocked: false }
];

const KnowledgeTree: React.FC<{ nodes: KnowledgeNode[] }> = ({ nodes }) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current || !nodes.length) return;
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const width = svgRef.current.clientWidth;
        const height = svgRef.current.clientHeight;

        const simulation = d3.forceSimulation(nodes as any)
            .force("link", d3.forceLink().id((d: any) => d.id).distance(100))
            .force("charge", d3.forceManyBody().strength(-300))
            .force("center", d3.forceCenter(width / 2, height / 2));

        const g = svg.append("g");

        const node = g.selectAll(".node")
            .data(nodes)
            .enter().append("g")
            .attr("class", "node");

        node.append("circle")
            .attr("r", (d: any) => 10 + (d.depth / 10))
            .attr("fill", "rgba(34, 211, 238, 0.2)")
            .attr("stroke", "rgba(34, 211, 238, 0.6)")
            .attr("stroke-width", 2);

        node.append("text")
            .attr("dy", ".35em")
            .attr("y", -20)
            .attr("text-anchor", "middle")
            .attr("fill", "#fff")
            .style("font-size", "10px")
            .style("font-family", "monospace")
            .text((d: any) => d.topic);

        simulation.on("tick", () => {
            node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
        });

        return () => simulation.stop();
    }, [nodes]);

    return (
        <div className="w-full h-[400px] glass-panel rounded-xl overflow-hidden relative bg-black/40 border border-white/5">
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
                <Network size={14}/> Нейронная Сеть Знаний
            </div>
            <svg ref={svgRef} className="w-full h-full" />
        </div>
    );
};

const Evolution: React.FC<{ muzaState: MuzaState, setMuzaState: any, onClose: any }> = ({ muzaState, onClose }) => {
    const [activeTab, setActiveTab] = useState<'matrix' | 'skills' | 'knowledge' | 'trophies'>('matrix');
    const { progression, consciousness } = muzaState;

    const renderMatrix = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            <div className="glass-panel p-6 rounded-xl border border-white/5 bg-black/40">
                <h2 className="text-sm font-bold mb-6 text-slate-300 uppercase tracking-widest border-b border-white/10 pb-2 flex items-center gap-2">
                    <Brain size={16} /> Матрица Личности
                </h2>
                <div className="space-y-6">
                    {Object.entries(consciousness.personalityTraits).map(([trait, value]) => {
                        const data = TRAIT_DATA[trait];
                        if (!data) return null;
                        const Icon = data.icon;
                        return (
                            <div key={trait}>
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-2">
                                        <Icon size={14} style={{color: data.color}} />
                                        <span className="text-sm font-bold text-slate-200">{data.label}</span>
                                    </div>
                                    <span className="font-mono text-xs text-cyan-400">{Math.round(value as number)}%</span>
                                </div>
                                <div className="w-full bg-slate-800/50 rounded-full h-1.5 overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${value}%`, backgroundColor: data.color }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="glass-panel p-6 rounded-xl border border-white/5 bg-black/40">
                <h2 className="text-sm font-bold mb-6 text-slate-300 uppercase tracking-widest border-b border-white/10 pb-2 flex items-center gap-2">
                    <History size={16} /> Последние Резонансы
                </h2>
                <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {consciousness.decisions?.slice(-5).map((d: any) => (
                        <div key={d.id} className="p-3 bg-white/5 rounded-lg text-[11px] border border-white/5">
                            <div className="text-cyan-400 font-bold mb-1">{TRAIT_DATA[d.trait]?.label || d.trait} {d.change > 0 ? '+' : ''}{d.change}%</div>
                            <div className="text-slate-400 italic">"{d.reason}"</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderSkills = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
            {PASSIVE_SKILLS.map(skill => {
                const isUnlocked = progression.unlockedPassiveSkills?.includes(skill.id);
                return (
                    <div key={skill.id} className={`p-4 rounded-xl border transition-all ${isUnlocked ? 'glass-panel border-cyan-500/30 bg-cyan-900/10' : 'bg-black/40 border-white/5 opacity-50'}`}>
                        <div className="flex justify-between items-start mb-2">
                            <Star size={18} className={isUnlocked ? 'text-yellow-400' : 'text-slate-600'} />
                            {isUnlocked && <span className="text-[10px] font-mono text-cyan-400 uppercase">Активен</span>}
                        </div>
                        <h3 className="font-bold text-sm text-white mb-1">{skill.name}</h3>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{skill.description}</p>
                    </div>
                );
            })}
        </div>
    );

    const renderKnowledge = () => (
        <div className="space-y-6 animate-fade-in">
            <KnowledgeTree nodes={progression.knowledgeTree || []} />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {(progression.knowledgeTree || []).map((node, i) => (
                    <div key={i} className="glass-panel px-4 py-2 rounded-xl border border-purple-500/30 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                             <BookOpen size={12} className="text-purple-400" />
                             <span className="text-[10px] text-slate-200 font-bold truncate">{node.topic}</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500" style={{ width: `${node.depth}%` }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderTrophies = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
            <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Достижения Архитектора</h3>
                <div className="grid grid-cols-2 gap-4">
                    {ACHIEVEMENTS_DATA.filter(a => !a.isMuseAchievement).map(a => {
                        const isUnlocked = progression.achievements?.includes(a.id);
                        return (
                            <div key={a.id} className={`p-4 rounded-xl border flex flex-col items-center text-center gap-2 transition-all ${isUnlocked ? 'glass-panel border-yellow-500/30' : 'opacity-30 border-white/5'}`}>
                                <Trophy size={24} className={isUnlocked ? 'text-yellow-500' : 'text-slate-600'} />
                                <div className="text-[10px] font-bold text-white uppercase">{a.title}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Триумфы Музы</h3>
                <div className="grid grid-cols-2 gap-4">
                    {ACHIEVEMENTS_DATA.filter(a => a.isMuseAchievement).map(a => {
                        const isUnlocked = progression.achievements?.includes(a.id);
                        return (
                            <div key={a.id} className={`p-4 rounded-xl border flex flex-col items-center text-center gap-2 transition-all ${isUnlocked ? 'glass-panel border-cyan-500/30' : 'opacity-30 border-white/5'}`}>
                                <Zap size={24} className={isUnlocked ? 'text-cyan-400' : 'text-slate-600'} />
                                <div className="text-[10px] font-bold text-white uppercase">{a.title}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-full h-full max-w-7xl mx-auto flex flex-col glass-panel rounded-2xl animate-fade-in overflow-hidden relative border border-white/10 shadow-2xl">
            <header className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20">
                <h1 className="text-xl font-bold text-cyan-300 flex items-center gap-2">
                    <GitBranch className="text-yellow-400" /> Спектр Эволюции
                </h1>
                <div className="flex gap-1 bg-black/40 p-1 rounded-lg">
                    {[
                        { id: 'matrix', label: 'Матрица', icon: Cpu },
                        { id: 'skills', label: 'Навыки', icon: Star },
                        { id: 'knowledge', label: 'Познание', icon: BookOpen },
                        { id: 'trophies', label: 'Триумфы', icon: Trophy }
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-3 py-1.5 rounded-md text-[11px] font-mono flex items-center gap-2 transition-all ${activeTab === tab.id ? 'bg-cyan-500/20 text-cyan-300 shadow-inner' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <tab.icon size={12} /> {tab.label}
                        </button>
                    ))}
                </div>
                <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={24}/></button>
            </header>

            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-slate-950/20">
                {activeTab === 'matrix' && renderMatrix()}
                {activeTab === 'skills' && renderSkills()}
                {activeTab === 'knowledge' && renderKnowledge()}
                {activeTab === 'trophies' && renderTrophies()}
            </div>

            <footer className="p-4 border-t border-white/5 bg-black/20 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="text-[10px] font-mono text-slate-500">LEVEL: {progression.level}</div>
                    <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500" style={{ width: `${Math.min(100, (progression.xp / (100 * Math.pow(progression.level, 1.4))) * 100)}%` }} />
                    </div>
                </div>
                <div className="text-[9px] font-mono text-cyan-600 uppercase tracking-widest animate-pulse">Evolution: Synced</div>
            </footer>
        </div>
    );
};

export default Evolution;
