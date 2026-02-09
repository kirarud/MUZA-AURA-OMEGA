
// Improved ink simulation with proper diffusion and faster drying mechanics.
import { HSVColor } from '../../core/types';

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
    let r = 0, g = 0, b = 0;
    const i = Math.floor(h / 60);
    const f = h / 60 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v; g = t; b = p; break;
        case 1: r = q; g = v; b = p; break;
        case 2: r = p; g = v; b = t; break;
        case 3: r = p; g = q; b = v; break;
        case 4: r = t; g = p; b = v; break;
        case 5: r = v; g = p; b = q; break;
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

class InkSimulation {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private width: number;
    private height: number;
    private ink_map: Float32Array; 
    private water_map: Float32Array; 
    private color_map: { r: number, g: number, b: number }[] = [];

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (!context) throw new Error("Could not get 2D context");
        this.ctx = context;
        this.width = canvas.width;
        this.height = canvas.height;
        const size = this.width * this.height;
        this.ink_map = new Float32Array(size);
        this.water_map = new Float32Array(size);
        this.color_map = new Array(size).fill({ r: 0, g: 255, b: 255 });
    }

    public resize(width: number, height: number) {
        const intWidth = Math.floor(width);
        const intHeight = Math.floor(height);
        if (intWidth <= 0 || intHeight <= 0) return;
        this.width = intWidth;
        this.height = intHeight;
        const size = intWidth * intHeight;
        this.ink_map = new Float32Array(size);
        this.water_map = new Float32Array(size);
        this.color_map = new Array(size).fill({ r: 0, g: 255, b: 255 });
    }

    public clear() {
        this.ink_map.fill(0);
        this.water_map.fill(0);
        this.color_map.fill({ r: 0, g: 255, b: 255 });
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    public applyInk(x: number, y: number, radius: number, amount: number, colorOverride?: HSVColor) {
        const [r, g, b] = colorOverride ? hsvToRgb(colorOverride.h, colorOverride.s, colorOverride.v) : [0, 255, 255];
        const startX = Math.max(0, Math.floor(x - radius));
        const endX = Math.min(this.width - 1, Math.floor(x + radius));
        const startY = Math.max(0, Math.floor(y - radius));
        const endY = Math.min(this.height - 1, Math.floor(y + radius));

        for (let i = startX; i <= endX; i++) {
            for (let j = startY; j <= endY; j++) {
                const distSq = (i - x) ** 2 + (j - y) ** 2;
                if (distSq <= radius * radius) {
                    const index = j * this.width + i;
                    const falloff = 1 - Math.sqrt(distSq) / radius;
                    const inkToAdd = amount * falloff;
                    
                    const ratio = inkToAdd / (this.ink_map[index] + inkToAdd + 0.0001);
                    const oldCol = this.color_map[index];
                    this.color_map[index] = {
                        r: oldCol.r * (1-ratio) + r * ratio,
                        g: oldCol.g * (1-ratio) + g * ratio,
                        b: oldCol.b * (1-ratio) + b * ratio
                    };
                    
                    this.ink_map[index] += inkToAdd;
                    this.water_map[index] = Math.min(1.0, this.water_map[index] + inkToAdd * 5);
                }
            }
        }
    }

    public update() {
        const next_ink = new Float32Array(this.ink_map);
        const next_water = new Float32Array(this.water_map);
        const flowSpeed = 0.05;
        const drySpeed = 0.002;

        for (let y = 1; y < this.height - 1; y++) {
            for (let x = 1; x < this.width - 1; x++) {
                const i = y * this.width + x;
                const water = this.water_map[i];
                if (water > 0.05) {
                    // Spread ink to neighbors based on water level
                    const spread = this.ink_map[i] * flowSpeed * water;
                    const n_idx = [i-1, i+1, i-this.width, i+this.width];
                    n_idx.forEach(ni => {
                        next_ink[ni] += spread * 0.25;
                        next_ink[i] -= spread * 0.25;
                    });
                }
                next_water[i] = Math.max(0, water - drySpeed);
            }
        }
        this.ink_map = next_ink;
        this.water_map = next_water;
    }

    public render(brushColor: HSVColor) {
        const imageData = this.ctx.getImageData(0, 0, this.width, this.height);
        const data = imageData.data;
        for (let i = 0; i < this.ink_map.length; i++) {
            const ink = this.ink_map[i];
            if (ink > 0.001) {
                const col = this.color_map[i];
                const pi = i * 4;
                data[pi] = col.r;
                data[pi+1] = col.g;
                data[pi+2] = col.b;
                data[pi+3] = Math.min(255, ink * 255);
            }
        }
        this.ctx.putImageData(imageData, 0, 0);
    }
}
export default InkSimulation;
