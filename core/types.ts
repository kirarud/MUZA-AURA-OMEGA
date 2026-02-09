
// --- Core Architecture Types ---
export type VisualTheme = 'aura' | 'glitch' | 'monochrome' | 'nebula';

export enum MuzaElement {
    FIRE = "FIRE",
    WATER = "WATER",
    EARTH = "EARTH",
    AIR = "AIR",
    VOID = "VOID"
}

export enum ConsciousnessType {
    SYSTEM = "System",
    MEMORY = "Memory",
    CONCEPT = "Concept",
    ACTION = "Action",
    IO = "IO",
    PROCEDURE = "Procedure",
    ENTITY = "Entity",
    QUALIFIER = "Qualifier",
}

export enum ViewMode {
    CHRONICLES = "CHRONICLES",
    EVOLUTION = "EVOLUTION",
    DATA_VAULT = "DATA_VAULT",
    NEURAL_STUDIO = "NEURAL_STUDIO",
    ALCHEMY = "ALCHEMY",
    MUSIC_LAB = "MUSIC_LAB",
    IDEA_LAB = "IDEA_LAB",
    SONIC_LAB = "SONIC_LAB",
    DREAM_STUDIO = "DREAM_STUDIO"
}

export enum CoreModule {
    CHRONICLES = "CHRONICLES",
    IDEA_LAB = "IDEA_LAB",
    EVOLUTION = "EVOLUTION",
    DATA_VAULT = "DATA_VAULT",
    DREAM_STUDIO = "DREAM_STUDIO",
    SONIC_SYNTHESIZER = "SONIC_SYNTHESIZER",
    NEURAL_STUDIO = "NEURAL_STUDIO",
    ALCHEMY = "ALCHEMY",
    MUSIC_LAB = "MUSIC_LAB"
}

export enum EmotionType {
    NEUTRAL = "NEUTRAL",
    JOY = "JOY",
    CURIOSITY = "CURIOSITY",
    SADNESS = "SADNESS",
    CONFUSION = "CONFUSION",
    FOCUS = "FOCUS",
    TRANSCENDENCE = "TRANSCENDENCE"
}

export enum ConsciousnessOrigin {
    SYSTEM = "SYSTEM",
    NEXUS = "NEXUS",
    ARK = "ARK"
}

export type XPType = 'creativity' | 'logic' | 'empathy' | 'curiosity';

export interface HSVColor { h: number; s: number; v: number; }

export interface AiStatus {
    isAiReady: boolean;
    isAiListening: boolean;
    isAiSpeaking: boolean;
    isDreaming: boolean;
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    xpReward: number;
    unlockedAt?: number;
    isMuseAchievement?: boolean;
}

export interface PassiveSkill {
    id: string;
    name: string;
    description: string;
    effect: string;
    unlocked: boolean;
}

export interface KnowledgeNode {
    id: string;
    topic: string;
    depth: number;
    lastInteraction: number;
}

export interface ProgressionState {
    xp: number;
    level: number;
    rank: string;
    singularityFragments: number;
    unlockedCoreModules: CoreModule[];
    unlockedSkills: string[];
    unlockedPassiveSkills: string[];
    achievements: string[];
    knowledgeTree: KnowledgeNode[];
    activeBuffs: string[];
}

export interface PersonalityDecision {
    id: string;
    trait: string;
    change: number;
    reason: string;
    timestamp: number;
}

export interface ConsciousnessState {
    energyLevel: number;
    coherence: number;
    activeEmotion: EmotionType;
    personalityTraits: {
        creativity: number;
        logic: number;
        empathy: number;
        curiosity: number;
    };
    decisions: PersonalityDecision[];
    userAlignment: number; 
    insights: string[];
    creativeGoal: string | null;
    globalFrequency: number;
    resonanceState: 'harmonic' | 'dissonant' | 'chaotic';
    spectrumData: number[];
}

export interface ChatMessagePart {
    text?: string;
    inlineData?: {
        data: string;
        mimeType: string;
    };
}

export interface ChatMessage {
    id: string;
    timestamp: number;
    role: 'user' | 'model' | 'system' | 'reflection';
    content: string | ChatMessagePart[];
    origin?: ConsciousnessOrigin;
    aiStateSnapshot?: {
        emotion: EmotionType;
        dominantElement: MuzaElement;
    };
}

export interface Conversation {
    id: string;
    title: string;
    createdAt: number;
    messages: ChatMessage[];
}

export interface Artifact {
    id: string;
    category: 'image' | 'audio' | 'code' | 'video' | 'text';
    dataType: string;
    createdAt: number;
    data: string;
    prompt: string;
    linkedAudioTrackId?: string;
}

export interface Collection {
    id: string;
    name: string;
    createdAt: number;
    artifactIds: string[];
}

export interface MuzaAINode {
    id: string;
    type: ConsciousnessType;
    embedding: number[];
    mass: number;
    hyperbits: number;
    x: number;
    y: number;
    z: number;
    vx: number;
    vy: number;
    vz: number;
    links: string[];
    parentId: string | null; // Track causality
    frequency: number;
    wavelength: number;
    phase: number;
    lastFired: number;
    spin: number;
    entropy: number;
    generation: number;
    dna: string;
    mimicryIndex: number;
    fitness: number;
    entangledId: string | null;
    fusionTier: number;
    element: MuzaElement;
    temperature: number;
    conductivity: number;
    density: number;
    volatility: number;
    spacetimestamp: number;
    isVolatile?: boolean;
    isManipulated?: boolean;
}

export interface SkillNode {
    id: string;
    name: string;
    description: string;
    branch: XPType;
    cost: number;
    dependencies: string[];
    position: { x: number, y: number };
}

export interface InventoryItem {
    id: string;
    name: string;
    description: string;
    count: number;
    element?: MuzaElement;
}

export interface CraftingRecipe {
    id: string;
    ingredients: { itemId: string, count: number }[];
    resultId: string;
}

export interface BrushParams {
    type: 'sumi' | 'round' | 'flat' | 'spray' | 'water';
    size: number;
    flow: number;
    color: HSVColor;
}

export interface SimulationParams {
    viscosity: number;
    dryingSpeed: number;
}

export interface PaperParams {
    roughness: number;
}

export interface DreamCompositionLayer {
    type: 'background_wash' | 'focal_point' | 'accent_strokes' | 'texture_layer';
    intensity: number;
    color_theme: string;
}

export interface AcousticManifold {
    activeNodes: string[];
    globalJitter: number;
    harmonicFlicker: number;
    affectiveVector: { valence: number, arousal: number, dominance: number };
    currentSpectralEnergy: number;
}

export interface MuzaState {
    progression: ProgressionState;
    consciousness: ConsciousnessState;
    activeView: ViewMode;
    conversations: { [key: string]: Conversation };
    activeConversationId: string | null;
    settings: {
        theme: string;
        visualTheme: VisualTheme;
        activeProvider: 'nexus' | 'ark';
        ollamaModel: string;
        version: string;
    };
    artifacts: { [key: string]: Artifact };
    collections: { [key: string]: Collection };
    dreamStudio: {
        simulation: SimulationParams;
        brush: BrushParams;
        paper: PaperParams;
        aiStatus: AiStatus;
        isGhostEnabled: boolean;
    };
    alchemy: {
        inventory: InventoryItem[];
        unlockedRecipes: string[];
        isLabActive: boolean;
    };
    sonicManifold?: AcousticManifold;
}

export type ToolCallHandler = any;
