
import { Modality } from "@google/genai";
import { getAi } from './gemini';

/**
 * Резервный синтез речи через браузерное API (Web Speech API).
 * Выполняется полностью локально в браузере. Бесплатно и безлимитно.
 */
function speakBrowser(text: string): Promise<void> {
    return new Promise((resolve) => {
        if (!window.speechSynthesis) {
            console.warn("Browser TTS not supported");
            resolve();
            return;
        }
        
        // Прерываем текущую речь, если она есть
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ru-RU';
        utterance.rate = 1.0; // Нормальная скорость
        utterance.pitch = 1.0; // Естественная высота
        utterance.volume = 1.0;
        
        // Ждем загрузки голосов (важно для Chrome)
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            // Ищем русский голос. Приоритет: Google (обычно качественнее), затем любой RU.
            const preferredVoice = voices.find(v => v.lang.includes('ru') && (v.name.includes('Google') || v.name.includes('Premium')));
            const fallbackVoice = voices.find(v => v.lang.includes('ru'));
            
            if (preferredVoice) utterance.voice = preferredVoice;
            else if (fallbackVoice) utterance.voice = fallbackVoice;
            
            // Если русского голоса нет, браузер использует дефолтный, но это лучше чем тишина
        };

        if (window.speechSynthesis.getVoices().length === 0) {
            window.speechSynthesis.onvoiceschanged = () => {
                loadVoices();
                window.speechSynthesis.speak(utterance);
            };
        } else {
            loadVoices();
            window.speechSynthesis.speak(utterance);
        }

        utterance.onend = () => resolve();
        utterance.onerror = (e) => {
            console.error("Browser TTS Error", e);
            resolve();
        };
        
        // Если voices уже были загружены выше, speak вызовется там, иначе ждем onvoiceschanged.
        // Но на случай если onvoiceschanged не сработает:
        if (window.speechSynthesis.getVoices().length > 0) {
             // speak уже вызван внутри loadVoices если логику чуть поменять, но для надежности:
             // Выше loadVoices только настраивает voice.
        }
    });
}

export const generateSpeech = async (text: string): Promise<string | void> => {
    if (!text || !text.trim()) return "";

    const cleanText = text.replace(/```[\s\S]*?```/g, '').replace(/[*_~`]/g, '').trim();
    if (!cleanText) return "";

    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: cleanText }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        // 'Kore' - женский, 'Puck' - мужской, 'Charon' - глубокий мужской, 'Fenrir' - грубый, 'Zephyr' - женский мягкий.
                        prebuiltVoiceConfig: { voiceName: 'Kore' }, 
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) throw new Error("No audio data from Gemini");
        
        return base64Audio;
    } catch (error: any) {
        console.warn("Gemini TTS Unavailable (Quota or Network), switching to Browser Fallback (Unlimited).");
        await speakBrowser(cleanText);
        return; 
    }
};
