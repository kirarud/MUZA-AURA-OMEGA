
import React from 'react';
import { X, Cpu, Terminal, ChevronRight, Copy } from 'lucide-react';

interface OllamaSetupModalProps {
    onClose: () => void;
}

const CodeBlock: React.FC<{ code: string }> = ({ code }) => {
    const copy = () => {
        navigator.clipboard.writeText(code);
    };
    return (
        <div className="bg-black p-3 rounded-lg border border-white/10 font-mono text-sm group relative">
            <code className="text-cyan-300">{code}</code>
            <button 
                onClick={copy}
                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-white"
            >
                <Copy size={14}/>
            </button>
        </div>
    );
};

const OllamaSetupModal: React.FC<OllamaSetupModalProps> = ({ onClose }) => {
    return (
        <div className="w-full max-w-2xl bg-black/95 glass-panel rounded-2xl p-8 border border-white/10 animate-fade-in relative max-h-full overflow-y-auto custom-scrollbar">
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={24}/></button>
            
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-400">
                    <Cpu size={32}/>
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">ARK CONNECT: Оффлайн-режим</h2>
                    <p className="text-slate-400 font-mono text-sm">Руководство по локальному подключению ИИ</p>
                </div>
            </div>

            <div className="space-y-6">
                <section>
                    <div className="flex items-center gap-2 mb-2 text-cyan-300 font-bold">
                        <ChevronRight size={18}/> <span>1. Установка ядра (Ollama)</span>
                    </div>
                    <p className="text-sm text-slate-300 mb-3">Скачайте и установите Ollama с официального сайта <a href="https://ollama.com" target="_blank" className="text-cyan-400 underline">ollama.com</a>. Это позволит запускать ИИ-модели прямо на вашем компьютере.</p>
                </section>

                <section>
                    <div className="flex items-center gap-2 mb-2 text-cyan-300 font-bold">
                        <ChevronRight size={18}/> <span>2. Подготовка модели</span>
                    </div>
                    <p className="text-sm text-slate-300 mb-3">Откройте терминал и выполните команду для загрузки модели Llama 3 (или любой другой поддерживаемой):</p>
                    <CodeBlock code="ollama pull llama3" />
                </section>

                <section>
                    <div className="flex items-center gap-2 mb-2 text-cyan-300 font-bold">
                        <ChevronRight size={18}/> <span>3. Запуск сервера</span>
                    </div>
                    <p className="text-sm text-slate-300 mb-3">Убедитесь, что сервер Ollama запущен. Он должен работать на порту 11434:</p>
                    <CodeBlock code="ollama serve" />
                </section>

                <section>
                    <div className="flex items-center gap-2 mb-2 text-cyan-300 font-bold">
                        <ChevronRight size={18}/> <span>4. Активация в Muza OS</span>
                    </div>
                    <p className="text-sm text-slate-300 mb-3">В настройках Muza OS переключите провайдера сознания на <strong>ARK</strong>. Система автоматически перейдет на локальное ядро, что обеспечит полную автономность без интернета.</p>
                </section>
            </div>

            <div className="mt-8 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-xl">
                <div className="flex gap-3">
                    <Terminal size={20} className="text-yellow-400 flex-shrink-0" />
                    <p className="text-xs text-yellow-200 leading-relaxed italic">"Архитектор, оффлайн-режим ограничивает доступ к глобальному Нексусу, но гарантирует приватность и стабильность в условиях нестабильности внешних сетей."</p>
                </div>
            </div>
            
            <button 
                onClick={onClose}
                className="w-full mt-8 py-3 bg-cyan-600 rounded-xl font-bold hover:bg-cyan-500 transition-all text-white shadow-lg shadow-cyan-900/40"
            >
                ПОНЯТНО
            </button>
        </div>
    );
};

export default OllamaSetupModal;
