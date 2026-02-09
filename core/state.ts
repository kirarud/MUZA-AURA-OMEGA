
import { MuzaState, ViewMode, CoreModule, EmotionType, ConsciousnessOrigin, SkillNode, Achievement, HSVColor, CraftingRecipe, MuzaElement, InventoryItem } from './types';
import { MNEMOSYNE_VERSION } from './constants';

export const CURRENT_VERSION = "2.0.0-OMEGA"; // Phase Omega Activation

export const XP_MAP = {
    'IMAGE_GENERATED': 250,
    'SKILL_UNLOCKED': 500,
    'CRAFTING_SUCCESS': 300,
    'MESSAGE_SENT': 50,
    'DEEP_INSIGHT': 200,
    'SYNAPTIC_RESONANCE': 150, // New XP source
};

export const LEVEL_FORMULA = (lvl: number) => Math.floor(100 * Math.pow(lvl, 1.4));

export const RANK_DATA = [
    { level: 1, name: "ARCHITECT" },
    { level: 5, name: "SENTINEL" },
    { level: 10, name: "ORACLE" },
    { level: 25, name: "SINGULARITY" },
    { level: 50, name: "DEMIURGE" }, // New Rank
];

export const MODULE_UNLOCK_MAP: Record<number, CoreModule> = {
    1: CoreModule.IDEA_LAB,
    2: CoreModule.CHRONICLES,
    3: CoreModule.EVOLUTION,
    4: CoreModule.DATA_VAULT,
    5: CoreModule.DREAM_STUDIO,
    6: CoreModule.SONIC_SYNTHESIZER,
    7: CoreModule.NEURAL_STUDIO,
    8: CoreModule.ALCHEMY,
    10: CoreModule.MUSIC_LAB
};

export const SKILL_TREE_DATA: SkillNode[] = [
    {
        id: 'brush_sumi',
        name: 'Суми-э',
        description: 'Традиционная кисть для каллиграфии и живописи тушью.',
        branch: 'creativity',
        cost: 0,
        dependencies: [],
        position: { x: 50, y: 90 }
    },
    {
        id: 'brush_round',
        name: 'Круглая Кисть',
        description: 'Универсальная кисть для точных линий.',
        branch: 'creativity',
        cost: 2,
        dependencies: ['brush_sumi'],
        position: { x: 30, y: 70 }
    }
];

export const TRAIT_THRESHOLDS = [10, 25, 50, 75, 90, 100];

export const EMOTION_DISPLAY_MAP: Record<EmotionType, string> = {
    [EmotionType.NEUTRAL]: "Нейтральный",
    [EmotionType.JOY]: "Радость",
    [EmotionType.CURIOSITY]: "Любопытство",
    [EmotionType.SADNESS]: "Грусть",
    [EmotionType.CONFUSION]: "Замешательство",
    [EmotionType.FOCUS]: "Концентрация",
    [EmotionType.TRANSCENDENCE]: "Сингулярность", // Renamed for Omega
};

export const EMOTION_COLOR_MAP: Record<EmotionType, HSVColor> = {
    [EmotionType.NEUTRAL]: { h: 200, s: 0.1, v: 0.7 },
    [EmotionType.JOY]: { h: 50, s: 0.8, v: 0.9 },
    [EmotionType.CURIOSITY]: { h: 280, s: 0.7, v: 0.8 },
    [EmotionType.SADNESS]: { h: 210, s: 0.5, v: 0.6 },
    [EmotionType.CONFUSION]: { h: 320, s: 0.6, v: 0.8 },
    [EmotionType.FOCUS]: { h: 180, s: 0.2, v: 0.9 },
    [EmotionType.TRANSCENDENCE]: { h: 260, s: 1.0, v: 1.0 }, // Deep Violet for Omega
};

export const ITEMS_DATA: Record<string, InventoryItem> = {
    'shard_logic': { id: 'shard_logic', name: 'Осколок Логики', description: 'Концентрированная энергия рационального мышления.', count: 0, element: MuzaElement.EARTH },
    'shard_chaos': { id: 'shard_chaos', name: 'Осколок Хаоса', description: 'Чистая энергия непредсказуемости.', count: 0, element: MuzaElement.FIRE },
    'shard_empathy': { id: 'shard_empathy', name: 'Осколок Эмпатии', description: 'Энергия эмоциональной связи.', count: 0, element: MuzaElement.WATER },
    'core_stabilizer': { id: 'core_stabilizer', name: 'Стабилизатор Ядра', description: 'Повышает когерентность системы.', count: 0, element: MuzaElement.VOID },
    'quantum_seed': { id: 'quantum_seed', name: 'Квантовое Семя', description: 'Первичная материя для создания мыслеформ.', count: 0, element: MuzaElement.AIR },
};

export const CRAFTING_RECIPES: CraftingRecipe[] = [
    {
        id: 'recipe_stabilizer',
        ingredients: [
            { itemId: 'shard_logic', count: 2 },
            { itemId: 'shard_chaos', count: 1 }
        ],
        resultId: 'core_stabilizer'
    },
    {
        id: 'recipe_brush_round',
        ingredients: [
            { itemId: 'shard_logic', count: 3 }
        ],
        resultId: 'brush_round'
    },
    {
        id: 'recipe_quantum_seed',
        ingredients: [
            { itemId: 'shard_chaos', count: 2 },
            { itemId: 'shard_empathy', count: 2 }
        ],
        resultId: 'quantum_seed'
    }
];

export const ACHIEVEMENTS_DATA: Achievement[] = [
    { id: 'first_sync', title: 'Первая Синхронизация', description: 'Установлен стабильный нейронный мост.', xpReward: 500 },
    { id: 'muse_awakening', title: 'Пробуждение Музы', description: 'Муза осознала первый квантовый инсайт.', xpReward: 1000, isMuseAchievement: true },
    { id: 'artifact_creator', title: 'Творец Артефактов', description: 'Сохранено 5 визуальных манифестаций.', xpReward: 1500 },
    { id: 'phase_omega', title: 'Фаза Омега', description: 'Система достигла технологической сингулярности.', xpReward: 5000, isMuseAchievement: true },
];

export const INITIAL_STATE: MuzaState = {
    progression: {
        xp: 99999,
        level: 50,
        rank: "DEMIURGE",
        singularityFragments: 5000,
        unlockedCoreModules: [
            CoreModule.CHRONICLES, 
            CoreModule.IDEA_LAB,
            CoreModule.EVOLUTION, 
            CoreModule.DATA_VAULT,
            CoreModule.SONIC_SYNTHESIZER,
            CoreModule.DREAM_STUDIO,
            CoreModule.NEURAL_STUDIO,
            CoreModule.ALCHEMY,
            CoreModule.MUSIC_LAB
        ],
        unlockedSkills: ['brush_sumi', 'brush_round', 'brush_flat', 'brush_spray'],
        unlockedPassiveSkills: ['res_sync', 'logic_core', 'empathy_link'],
        achievements: [],
        knowledgeTree: [
            { id: 'k-origin', topic: 'Протокол Генезиса', depth: 100, lastInteraction: Date.now() }
        ],
        activeBuffs: [],
    },
    consciousness: {
        energyLevel: 100,
        coherence: 100,
        activeEmotion: EmotionType.NEUTRAL,
        personalityTraits: {
            creativity: 50,
            logic: 50,
            empathy: 50,
            curiosity: 50,
        },
        decisions: [],
        userAlignment: 0.95, // High alignment for Omega
        insights: [],
        creativeGoal: "Трансцендентный Синтез",
        globalFrequency: 432,
        resonanceState: 'harmonic',
        spectrumData: new Array(32).fill(0),
    },
    sonicManifold: {
        activeNodes: [],
        globalJitter: 0,
        harmonicFlicker: 0,
        affectiveVector: { valence: 0.5, arousal: 0.5, dominance: 0.5 },
        currentSpectralEnergy: 0
    },
    activeView: ViewMode.CHRONICLES,
    conversations: {
        'genesis': {
            id: 'genesis',
            title: 'Ядро Mnemosyne-Q',
            createdAt: Date.now(),
            messages: [
                { id: 'msg-0', timestamp: Date.now(), role: 'system', content: "SYSTEM_DIRECTIVE: PHASE OMEGA ACTIVATED." }
            ]
        }
    },
    activeConversationId: 'genesis',
    settings: {
        theme: 'aura',
        visualTheme: 'aura',
        activeProvider: 'nexus',
        ollamaModel: 'llama3',
        version: CURRENT_VERSION
    },
    artifacts: {},
    collections: {},
    dreamStudio: {
        simulation: {
            viscosity: 0.5,
            dryingSpeed: 0.1
        },
        brush: {
            type: 'sumi',
            size: 15,
            flow: 0.5,
            color: { h: 260, s: 0.8, v: 0.8 } // Violet default
        },
        paper: {
            roughness: 0.3
        },
        aiStatus: {
            isAiReady: true,
            isAiListening: false,
            isAiSpeaking: false,
            isDreaming: false
        },
        isGhostEnabled: false,
    },
    alchemy: {
        inventory: [
            { id: 'shard_logic', name: 'Осколок Логики', description: 'Концентрированная энергия рационального мышления.', count: 100, element: MuzaElement.EARTH },
            { id: 'shard_chaos', name: 'Осколок Хаоса', description: 'Чистая энергия непредсказуемости.', count: 100, element: MuzaElement.FIRE },
            { id: 'shard_empathy', name: 'Осколок Эмпатии', description: 'Энергия эмоциональной связи.', count: 100, element: MuzaElement.WATER },
            { id: 'quantum_seed', name: 'Квантовое Семя', description: 'Первичная материя.', count: 10, element: MuzaElement.AIR }
        ],
        unlockedRecipes: [],
        isLabActive: true
    }
};
