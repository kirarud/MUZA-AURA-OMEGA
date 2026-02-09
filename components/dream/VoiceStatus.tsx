
import React from 'react';
import { AiStatus } from '../../core/types';

interface VoiceStatusProps {
    status: AiStatus;
}

const VoiceStatus: React.FC<VoiceStatusProps> = ({ status }) => {
    // Determine animation state
    let stateClass = "idle";
    let glowColor = "shadow-[0_0_15px_rgba(100,116,139,0.3)]";
    let coreColor = "bg-slate-500";
    let ringColor = "border-slate-600";
    let statusText = "ОЖИДАНИЕ";

    if (status.isAiSpeaking) {
        stateClass = "speaking";
        glowColor = "shadow-[0_0_25px_rgba(52,211,153,0.6)]";
        coreColor = "bg-emerald-400";
        ringColor = "border-emerald-500/50";
        statusText = "ГОВОРИТ";
    } else if (status.isAiListening) {
        stateClass = "listening";
        glowColor = "shadow-[0_0_25px_rgba(34,211,238,0.6)]";
        coreColor = "bg-cyan-400";
        ringColor = "border-cyan-500/50";
        statusText = "СЛУШАЕТ";
    } else if (status.isDreaming) {
        stateClass = "dreaming";
        glowColor = "shadow-[0_0_25px_rgba(168,85,247,0.6)]";
        coreColor = "bg-purple-400";
        ringColor = "border-purple-500/50";
        statusText = "ДУМАЕТ";
    } else if (status.isAiReady) {
        stateClass = "ready";
        glowColor = "shadow-[0_0_15px_rgba(34,211,238,0.3)]";
        coreColor = "bg-cyan-600";
        ringColor = "border-cyan-800/50";
        statusText = "АКТИВНА";
    }

    return (
        <div className="flex items-center gap-3 select-none">
            {/* Animated status text (typewriter style) */}
            <div className="hidden sm:block text-[9px] font-mono text-cyan-500/70 tracking-[0.2em] text-right">
                {statusText}
            </div>

            {/* Visual Entity */}
            <div className={`relative w-10 h-10 flex items-center justify-center`}>
                {/* Outer Ring */}
                <div className={`absolute inset-0 rounded-full border ${ringColor} transition-all duration-500 ${stateClass === 'listening' ? 'animate-ping opacity-30' : 'opacity-100'}`} />
                
                {/* Spinning Ring for dreaming/active */}
                {(status.isDreaming || status.isAiReady) && (
                    <div className="absolute inset-[-2px] rounded-full border-t border-cyan-400/50 animate-spin opacity-50" style={{ animationDuration: '3s' }}/>
                )}

                {/* Core */}
                <div 
                    className={`relative w-4 h-4 rounded-full ${coreColor} transition-all duration-300 ${glowColor} z-10`}
                >
                    {/* Core Pulse */}
                    <div className={`absolute inset-0 rounded-full ${coreColor} animate-pulse opacity-50 blur-[2px]`} />
                </div>

                {/* Speaking Waves */}
                {status.isAiSpeaking && (
                    <div className="absolute inset-0 flex items-center justify-center gap-0.5 pointer-events-none">
                        <div className="w-0.5 h-3 bg-emerald-400 animate-[soundwave_0.5s_infinite_ease-in-out]" style={{ animationDelay: '0s' }} />
                        <div className="w-0.5 h-5 bg-emerald-400 animate-[soundwave_0.5s_infinite_ease-in-out]" style={{ animationDelay: '0.1s' }} />
                        <div className="w-0.5 h-3 bg-emerald-400 animate-[soundwave_0.5s_infinite_ease-in-out]" style={{ animationDelay: '0.2s' }} />
                    </div>
                )}
            </div>

            <style>{`
                @keyframes soundwave {
                    0%, 100% { height: 4px; opacity: 0.5; }
                    50% { height: 16px; opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default VoiceStatus;
