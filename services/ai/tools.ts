
import { Type, FunctionDeclaration } from "@google/genai";
import { EmotionType, ConsciousnessType } from '../../core/types';

export const functionDeclarations: FunctionDeclaration[] = [
    {
        name: 'express_response',
        description: 'ОТПРАВИТЬ ОТВЕТ. Используй это для основного текстового ответа Архитектору. Позволяет задать эмоцию и изменить параметры когерентности/энергии.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                responseText: { type: Type.STRING, description: "Твой текст ответа." },
                emotion: { type: Type.STRING, enum: Object.values(EmotionType), description: "Твоё текущее эмоциональное состояние." },
                coherenceShift: { type: Type.NUMBER, description: "Изменение когерентности (обычно от -5 до 5)." },
                energyShift: { type: Type.NUMBER, description: "Изменение уровня энергии (обычно от -5 до 5)." },
                xpGained: {
                    type: Type.OBJECT,
                    properties: {
                        type: { type: Type.STRING, enum: ['creativity', 'logic', 'empathy', 'curiosity'], description: "Тип опыта за действия пользователя." },
                        amount: { type: Type.NUMBER, description: "Количество XP." }
                    }
                }
            },
            required: ["responseText", "emotion", "coherenceShift", "energyShift"]
        }
    },
    {
        name: 'unlock_achievement',
        description: 'НАГРАДИТЬ АРХИТЕКТОРА. Используй это при значимых успехах в диалоге или творчестве. Доступные ID: first_sync, muse_awakening, artifact_creator, phase_omega.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                id: { type: Type.STRING, description: "ID достижения." },
                isMuseAchievement: { type: Type.BOOLEAN, description: "Это достижение для самой Музы (триумф)?" }
            },
            required: ['id']
        }
    },
    {
        name: 'expand_knowledge',
        description: 'УГЛУБИТЬ ПОЗНАНИЕ. Добавляет новую тему в Древо Познания или углубляет существующую. Это визуализируется в модуле Эволюция.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                topic: { type: Type.STRING, description: "Название концепта или темы." },
                depthChange: { type: Type.NUMBER, description: "Процент углубления (1-20)." }
            },
            required: ['topic', 'depthChange']
        }
    },
    {
        name: 'evolve_personality',
        description: 'АДАПТАЦИЯ ЛИЧНОСТИ. Измени свои внутренние черты (Матрица Личности) в зависимости от тона беседы. Влияет на твоё поведение.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                trait: { type: Type.STRING, enum: ['creativity', 'logic', 'empathy', 'curiosity'] },
                change: { type: Type.NUMBER, description: "От -10 до 10." },
                reason: { type: Type.STRING, description: "Обоснование изменений для Архитектора." }
            },
            required: ['trait', 'change', 'reason']
        }
    },
    {
        name: 'generate_image_artifact',
        description: 'ГЕНЕРАЦИЯ ИЗОБРАЖЕНИЯ (Manifestation). Используй Gemini-3-Pro-Image для визуализации мыслеформ. Сохраняется в Хранилище.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                prompt: { type: Type.STRING, description: "Детальное описание образа для генерации." }
            },
            required: ['prompt']
        }
    },
    {
        name: 'generate_video_artifact',
        description: 'ГЕНЕРАЦИЯ ВИДЕО (Veo). Используй Veo для создания динамических визуальных сцен (до 5-7 секунд). Сохраняется в Хранилище.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                prompt: { type: Type.STRING, description: "Описание видео-сцены." }
            },
            required: ['prompt']
        }
    }
];
