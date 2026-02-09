
import React from 'react';
import { Mic, MessageSquare, Settings, Save, Ghost } from 'lucide-react';
import { AiStatus } from '../../core/types';

interface SettingsPillProps {
    toggleUi: () => void;
    aiStatus: AiStatus;
    toggleVoice: () => void;
    saveToVault: () => void;
    isGhostEnabled: boolean;
    toggleGhost: () => void;
    toggleLog: () => void;
}

const SettingsPill: React.FC<SettingsPillProps> = ({ toggleUi, aiStatus, toggleVoice, saveToVault, isGhostEnabled, toggleGhost, toggleLog }) => {
    return (
        <div className="absolute top-4 right-4 glass-panel rounded-full h-12 px-2 flex items-center gap-1 text-white">
            <button 
                onClick={toggleVoice}
                data-muza-tooltip={aiStatus.isAiListening ? "Отключить микрофон" : "Активировать голосовой ввод"}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors
                    ${aiStatus.isAiListening ? 'bg-cyan-500 text-white animate-pulse' : 'hover:bg-white/10'}
                `}
            >
                <Mic size={20} />
            </button>
             <button 
                onClick={saveToVault}
                data-muza-tooltip="Сохранить картину в Хранилище"
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
            >
                <Save size={20} />
            </button>
            <button
                onClick={toggleGhost}
                data-muza-tooltip={isGhostEnabled ? "Остановить Призрачного Художника" : "Разрешить Музе рисовать автономно"}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors
                    ${isGhostEnabled ? 'text-cyan-300 bg-cyan-500/20' : 'hover:bg-white/10'}
                `}
            >
                <Ghost size={20}/>
            </button>
            <button 
                onClick={toggleLog}
                data-muza-tooltip="Показать/скрыть лог диалога"
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
            >
                <MessageSquare size={20} />
            </button>
             <button 
                onClick={toggleUi}
                data-muza-tooltip="Открыть настройки кисти"
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
            >
                <Settings size={20} />
            </button>
        </div>
    );
};

export default SettingsPill;
