
import { MuzaAINode, ConsciousnessType, ConsciousnessState, EmotionType, MuzaElement } from '../core/types';

const MAX_POPULATION = 1500; 
const DECAY_RATE = 0.00005; 
const GROWTH_STEP = 120; 
const EXPLOSION_FORCE = 0.5; // Minimal impulse
const GLOBAL_GRAVITY = 0.005; // Constant pull to center
const FRICTION = 0.85; // High damping for stability

export const ELEMENT_COLORS: Record<MuzaElement, string> = {
    [MuzaElement.FIRE]: '#ff4d4d', 
    [MuzaElement.WATER]: '#00d2ff', 
    [MuzaElement.EARTH]: '#00ffaa', 
    [MuzaElement.AIR]: '#ff77ff',   
    [MuzaElement.VOID]: '#bd00ff'   
};

export class MuzaService {
    private nodes: MuzaAINode[] = [];
    private static instance: MuzaService;
    private headNodeId: string = 'root';
    private lastAnchorId: string | null = null;
    private isThinking: boolean = false;
    private thinkingEnergy: number = 0;
    private recentTokens: string[] = [];

    constructor() {
        if (MuzaService.instance) return MuzaService.instance;
        this.initializeNodes();
        MuzaService.instance = this;
    }

    private initializeNodes() {
        this.nodes = [{
            id: 'root', type: ConsciousnessType.SYSTEM, embedding: [], mass: 150, hyperbits: 100,
            x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, links: [], parentId: null,
            frequency: 432, wavelength: 550, phase: 0, lastFired: Date.now(), spin: 1,
            entropy: 0, generation: 0, dna: 'GENESIS_CORE', mimicryIndex: 1, fitness: 1,
            entangledId: null, fusionTier: 1, element: MuzaElement.VOID,
            temperature: 20, conductivity: 1, density: 15, volatility: 0, spacetimestamp: Date.now()
        }];
    }

    public setThinking(val: boolean) {
        this.isThinking = val;
    }

    public getRecentTokens() { return this.recentTokens; }
    public clearRecentTokens() { this.recentTokens = []; }

    public update(state: ConsciousnessState) {
        if (this.isThinking) this.thinkingEnergy = Math.min(4.0, this.thinkingEnergy + 0.3);
        else this.thinkingEnergy = Math.max(0, this.thinkingEnergy - 0.1);

        this.nodes.forEach(node => {
            // 1. Damping and Jitter
            const jitter = 0.05 + (this.thinkingEnergy * 0.2);
            node.vx += (Math.random() - 0.5) * jitter;
            node.vy += (Math.random() - 0.5) * jitter;
            
            node.vx *= FRICTION;
            node.vy *= FRICTION;
            node.vz *= FRICTION;

            // 2. Global Centripetal Gravity (Pull to 0,0,0)
            const distToRoot = Math.sqrt(node.x*node.x + node.y*node.y + node.z*node.z) || 1;
            // The further away, the stronger the pull back (exponential)
            const gravityStrength = GLOBAL_GRAVITY * (1 + (distToRoot / 500)**2);
            
            node.vx -= (node.x / distToRoot) * gravityStrength;
            node.vy -= (node.y / distToRoot) * gravityStrength;
            node.vz -= (node.z / distToRoot) * gravityStrength;

            node.x += node.vx;
            node.y += node.vy;
            node.z += node.vz;

            if (node.id !== 'root') {
                node.hyperbits = Math.max(20, node.hyperbits - DECAY_RATE);
            }
            node.phase += 0.08 * (1 + this.thinkingEnergy);
        });

        // 3. Structural Bonds (Causal Attraction)
        this.nodes.forEach(node => {
            if (!node.parentId) return;
            const parent = this.nodes.find(n => n.id === node.parentId);
            if (!parent) return;

            const dx = node.x - parent.x;
            const dy = node.y - parent.y;
            const dz = node.z - parent.z;
            const dist = Math.sqrt(dx*dx + dy*dy + dz*dz) || 1;
            
            const isAnchor = node.id.startsWith('anchor_');
            const targetDist = isAnchor ? GROWTH_STEP * 0.8 : GROWTH_STEP * 0.3;
            
            // "Rubber Band" force: grows stronger if stretched
            const stretch = dist - targetDist;
            const springForce = stretch * (isAnchor ? 0.25 : 0.15);
            
            node.vx -= (dx / dist) * springForce;
            node.vy -= (dy / dist) * springForce;
            node.vz -= (dz / dist) * springForce;
            
            // Parent reacts less to children to prevent chain-reaction drift
            parent.vx += (dx / dist) * springForce * 0.01;
            parent.vy += (dy / dist) * springForce * 0.01;
        });
    }

    public getNetworkSummary(): string {
        const activeNodes = this.nodes
            .filter(n => n.id !== 'root')
            .sort((a, b) => b.hyperbits - a.hyperbits)
            .slice(0, 15);
        
        if (activeNodes.length === 0) return "Спящий режим. Только корневой узел активен.";

        const nodeDescriptions = activeNodes.map(n => 
            `[${n.id}: ${n.element}, энергия:${n.hyperbits.toFixed(1)}]`
        ).join(', ');

        const colors = this.getPrismColors();
        const dominantElement = colors[0] || ELEMENT_COLORS[MuzaElement.VOID];
        
        return `ТЕКУЩЕЕ СОСТОЯНИЕ НЕЙРОСЕТИ:
        Активные концепты: ${nodeDescriptions}
        Доминирующая стихия в фокусе: ${dominantElement}
        Общая энергия мысли: ${this.thinkingEnergy.toFixed(2)}`;
    }

    public getNodes() { return this.nodes; }
    public getThinkingEnergy() { return this.thinkingEnergy; }
    
    public getLinks() {
        const links: any[] = [];
        this.nodes.forEach(n => {
            if (n.parentId) {
                const parent = this.nodes.find(p => p.id === n.parentId);
                if (parent) links.push({ source: parent, target: n, isCausal: true });
            }
            n.links.forEach(lId => {
                const target = this.nodes.find(t => t.id === lId);
                if (target && target.id !== n.parentId) links.push({ source: n, target, isCausal: false });
            });
        });
        return links;
    }

    public stimulate(tokens: string[], source: 'user' | 'model' = 'user') {
        if (tokens.length === 0) return;
        this.recentTokens = [...this.recentTokens, ...tokens].slice(-20);

        // Every new impulse starts closer to the root or parent anchor, with strong pull
        const anchorId = `anchor_${source}_${Date.now()}`;
        
        // LIMITING DRIFT: Anchors are parented to previous anchor BUT also strongly pulled by root in update()
        const anchor = this.createCognitiveNode({
            id: anchorId,
            type: source === 'user' ? ConsciousnessType.IO : ConsciousnessType.PROCEDURE,
            parentId: this.lastAnchorId || 'root',
            connections: []
        });

        if (anchor) {
            this.lastAnchorId = anchor.id;
            this.headNodeId = anchor.id;

            tokens.forEach((t) => {
                const clean = t.toLowerCase().trim().replace(/[^a-zа-я0-9\s]/g, '');
                if (clean.length < 2) return;

                const existing = this.nodes.find(n => n.id === clean);
                if (existing) {
                    existing.hyperbits = 100;
                    existing.lastFired = Date.now();
                    // Instant snap towards current anchor to keep cluster tight
                    existing.vx += (anchor.x - existing.x) * 0.2;
                    existing.vy += (anchor.y - existing.y) * 0.2;
                    if (!existing.links.includes(anchor.id)) existing.links.push(anchor.id);
                } else if (this.nodes.length < MAX_POPULATION) {
                    this.createCognitiveNode({
                        id: clean,
                        type: ConsciousnessType.CONCEPT,
                        parentId: anchor.id,
                        connections: []
                    });
                }
            });
        }
    }

    public createCognitiveNode({ id, type, parentId, connections }: { id: string, type: ConsciousnessType, parentId?: string | null, connections: string[] }): MuzaAINode | null {
        if (this.nodes.some(n => n.id === id)) return null;
        
        const parent = this.nodes.find(n => n.id === (parentId || this.headNodeId)) || this.nodes[0];
        const elements = [MuzaElement.FIRE, MuzaElement.WATER, MuzaElement.EARTH, MuzaElement.AIR];
        
        const angle = Math.random() * Math.PI * 2;
        // Tighter spawn distance
        const dist = type === ConsciousnessType.CONCEPT ? 15 : 40;
        
        const newNode: MuzaAINode = {
            id, type, embedding: [], 
            mass: type === ConsciousnessType.CONCEPT ? 30 : 80, 
            hyperbits: 100,
            x: parent.x + Math.cos(angle) * dist,
            y: parent.y + Math.sin(angle) * dist,
            z: parent.z + (Math.random() - 0.5) * 10,
            vx: Math.cos(angle) * EXPLOSION_FORCE,
            vy: Math.sin(angle) * EXPLOSION_FORCE, 
            vz: (Math.random() - 0.5) * 1, 
            links: connections,
            parentId: parent.id,
            frequency: 432, wavelength: 500, phase: Math.random(),
            lastFired: Date.now(), spin: 1, 
            entropy: 0.1, 
            generation: parent.generation + 1, 
            dna: `MANIFEST:${id.slice(0,5)}`,
            mimicryIndex: 0, fitness: 1, entangledId: null, fusionTier: 1,
            element: elements[Math.floor(Math.random() * elements.length)],
            temperature: 25, conductivity: 0.5, density: 10, volatility: 0.1,
            spacetimestamp: Date.now()
        };
        
        this.nodes.push(newNode);
        return newNode;
    }

    public getPrismColors() {
        const active = this.nodes.filter(n => Date.now() - n.lastFired < 8000);
        if (active.length === 0) return [ELEMENT_COLORS[MuzaElement.VOID]];
        return active.sort((a, b) => b.hyperbits - a.hyperbits).slice(0, 5).map(n => ELEMENT_COLORS[n.element]);
    }

    public synthesizeNeuron(id: string, type: ConsciousnessType, connections: string[]): boolean {
        return this.createCognitiveNode({ id, type, connections }) !== null;
    }

    public startManipulation(id: string) {
        const node = this.nodes.find(n => n.id === id);
        if (node) node.isManipulated = true;
    }

    public updateManipulationPosition(id: string, x: number, y: number) {
        const node = this.nodes.find(n => n.id === id);
        if (node) { node.x = x; node.y = y; node.vx = 0; node.vy = 0; }
    }

    public stopManipulation(id: string) {
        const node = this.nodes.find(n => n.id === id);
        if (node) node.isManipulated = false;
    }
}
