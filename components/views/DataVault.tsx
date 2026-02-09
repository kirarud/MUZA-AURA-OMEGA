
import React, { useState } from 'react';
import { MuzaState, Artifact, Conversation, Collection } from '../../core/types';
import { Database, Image, MessageSquare, BrainCircuit, X, FolderPlus, Plus, Folder, Video, Play, History } from 'lucide-react';
import { ChatMessageRenderer } from '../chronicles/ChatMessageRenderer';

interface DataVaultProps {
    muzaState: MuzaState;
    setMuzaState: React.Dispatch<React.SetStateAction<MuzaState | null>>;
    onAnalyze: (artifact: Artifact) => void;
    onClose: () => void;
}

type VaultTab = 'artifacts' | 'conversations' | 'collections';

const ArtifactCard: React.FC<{ artifact: Artifact; onSelect: () => void }> = ({ artifact, onSelect }) => {
    let preview;
    if (artifact.category === 'video') {
         preview = (
             <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-slate-500">
                 <Video size={32} className="mb-2 text-cyan-500" />
                 <span className="text-[10px] font-mono">VEO VIDEO</span>
             </div>
         );
    } else if (artifact.category === 'text') {
        preview = (
            <div className="w-full h-full bg-indigo-950/30 flex flex-col items-center justify-center text-indigo-400 p-4">
                <History size={32} className="mb-2" />
                <span className="text-[10px] font-mono text-center">THOUGHT LOG</span>
            </div>
        );
    } else {
        const src = `data:image/png;base64,${artifact.data}`;
        preview = <img src={src} alt={artifact.prompt} className="w-full h-full object-cover" />;
    }

    return (
        <div className="aspect-square glass-panel rounded-lg p-2 cursor-pointer group" onClick={onSelect}>
            <div className="w-full h-full bg-black rounded-md overflow-hidden relative border border-white/5">
                {preview}
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4 text-center">
                    <p className="text-xs text-white line-clamp-3">{artifact.prompt}</p>
                </div>
            </div>
        </div>
    );
};

const DataVault: React.FC<DataVaultProps> = ({ muzaState, setMuzaState, onAnalyze, onClose }) => {
    const [activeTab, setActiveTab] = useState<VaultTab>('artifacts');
    const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [imageToView, setImageToView] = useState<string | null>(null);
    const [collectionFilter, setCollectionFilter] = useState<string | null>(null);
    const [newCollectionName, setNewCollectionName] = useState('');
    
    const allArtifacts = (Object.values(muzaState.artifacts) as Artifact[]).sort((a, b) => b.createdAt - a.createdAt);
    const conversations = (Object.values(muzaState.conversations) as Conversation[]).sort((a, b) => b.createdAt - a.createdAt);
    const collections = (Object.values(muzaState.collections) as Collection[]).sort((a, b) => b.createdAt - a.createdAt);

    const filteredArtifacts = collectionFilter
        ? allArtifacts.filter(art => collections.find(c => c.id === collectionFilter)?.artifactIds.includes(art.id))
        : allArtifacts;

    const handleCreateCollection = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCollectionName.trim()) return;
        const newId = `col-${Date.now()}`;
        const newCollection: Collection = { id: newId, name: newCollectionName.trim(), createdAt: Date.now(), artifactIds: [] };
        setMuzaState(s => s ? { ...s, collections: { ...s.collections, [newId]: newCollection } } : null);
        setNewCollectionName('');
    };

    const handleAddToCollection = (collectionId: string) => {
        if (!selectedArtifact) return;
        setMuzaState(s => {
            if (!s) return null;
            const target = s.collections[collectionId];
            if (target && !target.artifactIds.includes(selectedArtifact.id)) {
                return { ...s, collections: { ...s.collections, [collectionId]: { ...target, artifactIds: [...target.artifactIds, selectedArtifact.id] } } };
            }
            return s;
        });
    };

    const renderArtifacts = () => (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4">
            {filteredArtifacts.map(art => <ArtifactCard key={art.id} artifact={art} onSelect={() => setSelectedArtifact(art)} />)}
            {filteredArtifacts.length === 0 && <p className="col-span-full text-center text-slate-400 font-mono p-8">Пусто.</p>}
        </div>
    );
    
    if (selectedArtifact) {
        const isText = selectedArtifact.category === 'text';
        let decodedText = '';
        if (isText) {
            try { decodedText = decodeURIComponent(escape(atob(selectedArtifact.data))); } catch(e) { decodedText = "Ошибка декодирования."; }
        }

        return (
            <div className="w-full h-full glass-panel rounded-2xl flex flex-col p-4 animate-fade-in">
                 <button onClick={() => setSelectedArtifact(null)} className="self-start mb-2 text-slate-300 hover:text-white">&larr; Назад</button>
                 <div className="flex-1 bg-black/50 rounded-lg flex items-center justify-center p-2 relative overflow-hidden">
                    {isText ? (
                        <div className="p-8 font-mono text-cyan-300 whitespace-pre-wrap text-sm max-w-2xl">{decodedText}</div>
                    ) : selectedArtifact.category === 'video' ? (
                        <video controls autoPlay loop className="max-w-full max-h-full rounded-lg" src={`data:video/mp4;base64,${selectedArtifact.data}`} />
                    ) : (
                        <img src={`data:image/png;base64,${selectedArtifact.data}`} alt={selectedArtifact.prompt} className="max-w-full max-h-full object-contain" />
                    )}
                 </div>
                 <div className="p-2 mt-2 text-center flex flex-col items-center gap-2">
                    <p className="text-slate-300 italic">"{selectedArtifact.prompt}"</p>
                    <div className="flex gap-2 mt-2">
                        {selectedArtifact.category === 'image' && <button onClick={() => { onAnalyze(selectedArtifact); setSelectedArtifact(null); }} className="px-4 py-2 bg-purple-600/50 text-purple-200 rounded-lg border border-purple-500/50 hover:bg-purple-500/50 transition-colors flex items-center gap-2"><BrainCircuit size={16} /> Анализ</button>}
                        <div className="relative group">
                             <button className="px-4 py-2 bg-slate-700/50 text-slate-200 rounded-lg border border-slate-600/50 hover:bg-slate-600/50 transition-colors flex items-center gap-2"><Plus size={16} /> Коллекция</button>
                        </div>
                    </div>
                 </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full max-w-7xl mx-auto flex flex-col glass-panel rounded-2xl animate-fade-in">
            <header className="p-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
                <div className="w-8"></div>
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-blue-300 flex items-center justify-center gap-2"><Database /><span>Хранилище Данных</span></h1>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={24}/></button>
            </header>
            <div className="flex-shrink-0 border-b border-white/10 flex justify-center">
                <button onClick={() => { setActiveTab('artifacts'); setCollectionFilter(null); }} className={`px-4 py-3 text-sm font-bold flex items-center gap-2 ${activeTab === 'artifacts' ? 'text-cyan-300 border-b-2 border-cyan-300' : 'text-slate-400'}`}><Image size={16} /> Артефакты ({allArtifacts.length})</button>
                <button onClick={() => setActiveTab('collections')} className={`px-4 py-3 text-sm font-bold flex items-center gap-2 ${activeTab === 'collections' ? 'text-cyan-300 border-b-2 border-cyan-300' : 'text-slate-400'}`}><Folder size={16} /> Коллекции ({collections.length})</button>
                <button onClick={() => setActiveTab('conversations')} className={`px-4 py-3 text-sm font-bold flex items-center gap-2 ${activeTab === 'conversations' ? 'text-cyan-300 border-b-2 border-cyan-300' : 'text-slate-400'}`}><MessageSquare size={16} /> Хроники ({conversations.length})</button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {activeTab === 'artifacts' ? renderArtifacts() : activeTab === 'collections' ? (
                     <div className="p-4 space-y-2">
                        {collections.map(col => (
                            <div key={col.id} className="glass-panel p-3 rounded-lg cursor-pointer hover:bg-white/5 flex justify-between items-center" onClick={() => { setCollectionFilter(col.id); setActiveTab('artifacts'); }}>
                                <div><h3 className="font-bold text-purple-400">{col.name}</h3><p className="text-xs text-slate-400 font-mono">{col.artifactIds.length} артефактов</p></div>
                                <Folder size={20} className="text-purple-400/50" />
                            </div>
                        ))}
                     </div>
                ) : (
                    <div className="p-4 space-y-2">
                        {conversations.map(conv => (
                            <div key={conv.id} className="glass-panel p-3 rounded-lg cursor-pointer hover:bg-white/5" onClick={() => setSelectedConversation(conv)}>
                                <h3 className="font-bold text-cyan-400">{conv.title}</h3>
                                <p className="text-xs text-slate-400 font-mono">{new Date(conv.createdAt).toLocaleString()} - {conv.messages.length} сообщений</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
export default DataVault;
