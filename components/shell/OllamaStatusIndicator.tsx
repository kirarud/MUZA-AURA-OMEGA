
import React, { useState, useEffect } from 'react';

const OllamaStatusIndicator: React.FC = () => {
    const [status, setStatus] = useState<'online' | 'offline' | 'checking'>('checking');

    const checkOllama = async () => {
        try {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 2000);
            
            const response = await fetch('http://localhost:11434/api/tags', { 
                signal: controller.signal 
            });
            clearTimeout(id);
            
            if (response.ok) setStatus('online');
            else setStatus('offline');
        } catch (e) {
            setStatus('offline');
        }
    };

    useEffect(() => {
        checkOllama();
        const interval = setInterval(checkOllama, 10000);
        return () => clearInterval(interval);
    }, []);

    const color = status === 'online' ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 
                  status === 'offline' ? 'bg-red-500 opacity-50' : 'bg-slate-500';

    return (
        <div 
            className={`w-2 h-2 rounded-full transition-all ${color}`} 
            title={status === 'online' ? 'Local AI (Ark) Online' : 'Local AI (Ark) Offline'}
        />
    );
};

export default OllamaStatusIndicator;
