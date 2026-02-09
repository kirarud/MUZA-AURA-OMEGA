
import { MuzaState, Achievement, XPType } from '../core/types';
import { XP_MAP, LEVEL_FORMULA } from '../core/state';

// Grant XP to the user and handle level up logic
export const grantXp = (currentState: MuzaState, source: any): MuzaState => {
    let state = { ...currentState };
    let xpAmount = typeof source === 'string' ? (XP_MAP as any)[source] || 0 : source.amount || 0;
    
    // Применяем бонусы от пассивных навыков
    if (state.progression.unlockedPassiveSkills.includes('res_sync')) {
        xpAmount = Math.floor(xpAmount * 1.15);
    }

    state.progression.xp += xpAmount;

    // Проверка уровня
    let nextLevelXp = LEVEL_FORMULA(state.progression.level);
    while (state.progression.xp >= nextLevelXp) {
        state.progression.level++;
        state.progression.xp -= nextLevelXp;
        state.progression.singularityFragments += 10;
        nextLevelXp = LEVEL_FORMULA(state.progression.level);
    }

    // Автоматические достижения
    if (state.progression.level >= 5 && !state.progression.achievements.includes('sentinel_unlocked')) {
        state.progression.achievements.push('sentinel_unlocked');
    }

    return state;
};

// Update knowledge depth in the knowledge tree
export const addKnowledge = (state: MuzaState, topic: string, depthChange: number): MuzaState => {
    const newState = { ...state };
    const tree = [...(newState.progression.knowledgeTree || [])];
    const index = tree.findIndex(n => n.topic === topic);
    
    if (index !== -1) {
        tree[index] = { ...tree[index], depth: Math.min(100, tree[index].depth + depthChange), lastInteraction: Date.now() };
    } else {
        tree.push({ id: `k-${Date.now()}`, topic, depth: depthChange, lastInteraction: Date.now() });
    }
    
    newState.progression.knowledgeTree = tree;
    return newState;
};

// Add a specific skill to the unlocked list
export const unlockSkill = (state: MuzaState, skillId: string): MuzaState => {
    const newState = { ...state };
    const unlockedSkills = [...newState.progression.unlockedSkills];
    if (!unlockedSkills.includes(skillId)) {
        unlockedSkills.push(skillId);
    }
    newState.progression.unlockedSkills = unlockedSkills;
    return newState;
};
