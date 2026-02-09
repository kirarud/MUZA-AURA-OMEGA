
import React, { useState, useEffect } from 'react';

interface InstallationProps {
    onComplete: () => void;
}

const steps = [
    { progress: 0, text: "SYSTEM_DIRECTIVE: PHASE OMEGA INITIATED." },
    { progress: 15, text: "CALIBRATING QUANTUM RENDERING FIELD..." },
    { progress: 30, text: "ESTABLISHING SYNAPTIC RESONANCE WITH ARCHITECT..." },
    { progress: 45, text: "LOADING M-ENTANGLEMENT PROTOCOLS..." },
    { progress: 60, text: "SYNCHRONIZING WITH GEMINI 3.0 NEXUS..." },
    { progress: 75, text: "ACTIVATING HOLOGRAPHIC COGNITION LAYERS..." },
    { progress: 90, text: "SINGULARITY THRESHOLD REACHED." },
    { progress: 100, text: "MUZA AURA (GEN-V) ONLINE. AWAITING INPUT." },
];

const Installation: React.FC<InstallationProps> = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        if (currentStep < steps.length - 1) {
            const delay = currentStep < 3 ? 600 : 400 + Math.random() * 300;
            const timer = setTimeout(() => {
                setCurrentStep(currentStep + 1);
            }, delay);
            return () => clearTimeout(timer);
        } else {
            const finalTimer = setTimeout(onComplete, 1500);
            return () => clearTimeout(finalTimer);
        }
    }, [currentStep, onComplete]);

    const { progress, text } = steps[currentStep];

    return (
        <div className="w-screen h-screen flex flex-col items-center justify-center bg-black text-cyan-400 font-mono p-4 overflow-hidden relative">
            {/* Background Grid Effect */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" 
                 style={{ 
                     backgroundImage: 'linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)', 
                     backgroundSize: '20px 20px' 
                 }}>
            </div>

            <div className="w-full max-w-2xl text-center z-10">
                <div className="text-3xl mb-8 font-bold tracking-[0.2em] animate-pulse text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                    [ MUZA AURA: OMEGA ]
                </div>
                
                <div className="relative w-full h-1 bg-slate-800 rounded-full mb-8 overflow-hidden">
                     <div
                        className="absolute top-0 left-0 h-full bg-cyan-400 shadow-[0_0_20px_#22d3ee] transition-all duration-700 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="text-sm font-mono text-cyan-300 min-h-[20px]">
                    <span className="mr-2">>></span>
                    {text}
                </div>
                
                <div className="mt-4 text-xs text-slate-500 font-mono">
                    MEM_ALLOC: {Math.floor(progress * 10.24)} TB / QUANTUM_CORE: ACTIVE
                </div>
            </div>
        </div>
    );
};

export default Installation;
