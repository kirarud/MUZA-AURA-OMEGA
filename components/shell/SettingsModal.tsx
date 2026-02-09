
import React, { useState } from 'react';
import { MuzaState } from '../../core/types';
import { STORAGE_KEY } from '../../App';
import { CURRENT_VERSION } from '../../core/state';
import { X, Save, Download, Server, Cpu, Database, RefreshCw } from 'lucide-react';

interface SettingsModalProps {
    muzaState: MuzaState;
    setMuzaState: React.Dispatch<React.SetStateAction<MuzaState | null>>;
    onClose: () => void;
    onCheckUpdate: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ muzaState, setMuzaState, onClose, onCheckUpdate }) => {
    const [ollamaModel, setOllamaModel] = useState(muzaState.settings.ollamaModel || 'llama3');
    const [saveStatus, setSaveStatus] = useState<string>('');

    const handleSaveLocal = () => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(muzaState));
            setSaveStatus('Сохранено!');
            setTimeout(() => setSaveStatus(''), 2000);
        } catch (e) {
            setSaveStatus('Ошибка!');
        }
    };

    const handleExport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(muzaState));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `muza_backup.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const saveSettings = () => {
        setMuzaState(s => s ? { ...s, settings: { ...s.settings, ollamaModel, version: CURRENT_VERSION } } : null);
        onClose();
    };

    return (
        <div className="w-full max-w-md bg-black/95 glass-panel rounded-2xl p-6 border border-white/10 relative animate-fade-in">
            <button onClick={onClose} data-muza-tooltip="Закрыть окно" className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={24}/></button>
            <h2 className="text-xl font-bold mb-6 text-cyan-400 flex items-center gap-2"><Server/> Конфигурация Ядра</h2>
            <div className="space-y-6">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center">
                    <div>
                        <h3 className="text-sm font-bold text-slate-300">Версия Системы</h3>
                        <p className="text-xs text-slate-500 font-mono">v{muzaState.settings.version || CURRENT_VERSION}</p>
                    </div>
                    <button 
                        onClick={onCheckUpdate}
                        data-muza-tooltip="Проверить наличие обновлений ядра"
                        className="flex items-center gap-2 px-3 py-1.5 bg-cyan-600/20 border border-cyan-500/50 rounded-lg text-xs hover:bg-cyan-500/40 text-cyan-300"
                    >
                        <RefreshCw size={14} /> ОБНОВИТЬ
                    </button>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2"><Cpu size={16}/> Локальное Ядро (Ollama)</h3>
                    <input 
                        type="text" value={ollamaModel} onChange={e => setOllamaModel(e.target.value)}
                        className="w-full bg-black/50 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500"
                        placeholder="llama3..."
                        data-muza-tooltip="Название локальной модели в Ollama"
                    />
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2"><Database size={16}/> База Данных</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <button 
                            onClick={handleSaveLocal} 
                            data-muza-tooltip="Принудительно сохранить состояние в браузере"
                            className="py-2 bg-blue-600/20 border border-blue-500/50 rounded-lg text-xs hover:bg-blue-500/40"
                        >СОХРАНИТЬ</button>
                        <button 
                            onClick={handleExport} 
                            data-muza-tooltip="Скачать файл бекапа всей системы"
                            className="py-2 bg-purple-600/20 border border-purple-500/50 rounded-lg text-xs hover:bg-purple-500/40"
                        >ЭКСПОРТ</button>
                    </div>
                    {saveStatus && <p className="text-center text-[10px] text-green-400 mt-2 font-mono">{saveStatus}</p>}
                </div>
            </div>
            <button 
                onClick={saveSettings} 
                data-muza-tooltip="Применить и сохранить все изменения"
                className="w-full mt-6 py-3 bg-cyan-600 rounded-xl font-bold hover:bg-cyan-500 transition-all"
            >ПРИМЕНИТЬ</button>
        </div>
    );
};

export default SettingsModal;
