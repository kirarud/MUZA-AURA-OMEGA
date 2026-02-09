
import React, { useEffect, useRef } from 'react';
import { MuzaService, ELEMENT_COLORS } from '../../services/muzaService';
import { MuzaElement } from '../../core/types';
import * as d3 from 'd3';

interface NeuralMiniMapProps {
    aiService: MuzaService;
}

const NeuralMiniMap: React.FC<NeuralMiniMapProps> = ({ aiService }) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current) return;
        
        const width = 240;
        const height = 240;
        const centerX = width / 2;
        const centerY = height / 2;
        const scale = 0.25;

        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height);

        svg.selectAll("*").remove();

        const g = svg.append("g");
        let frameId: number;

        const render = () => {
            const nodes = aiService.getNodes();
            const links = aiService.getLinks();
            const thinkingEnergy = aiService.getThinkingEnergy();

            // Link rendering
            const linkSelection = g.selectAll("line.link")
                .data(links, (d: any) => `${d.source.id}-${d.target.id}`);

            linkSelection.enter().append("line")
                .attr("class", "link")
                .attr("stroke", (d: any) => d.isCausal ? "rgba(34, 211, 238, 0.4)" : "rgba(168, 85, 247, 0.2)")
                .attr("stroke-width", (d: any) => d.isCausal ? 1.5 : 0.5)
                .merge(linkSelection as any)
                .attr("x1", (d: any) => centerX + d.source.x * scale)
                .attr("y1", (d: any) => centerY + d.source.y * scale)
                .attr("x2", (d: any) => centerX + d.target.x * scale)
                .attr("y2", (d: any) => centerY + d.target.y * scale)
                .attr("opacity", (d: any) => {
                    const isPulse = Date.now() - d.target.lastFired < 1000;
                    return isPulse ? 1 : 0.3 + thinkingEnergy * 0.4;
                });

            linkSelection.exit().remove();

            // Node rendering
            const nodeSelection = g.selectAll("circle.node")
                .data(nodes, (d: any) => d.id);

            nodeSelection.enter().append("circle")
                .attr("class", "node")
                .attr("stroke", "rgba(255,255,255,0.1)")
                .merge(nodeSelection as any)
                .attr("cx", (d: any) => centerX + d.x * scale)
                .attr("cy", (d: any) => centerY + d.y * scale)
                .attr("r", (d: any) => {
                    const active = Math.max(0, 1 - (Date.now() - d.lastFired) / 1000);
                    const isAnchor = d.id.startsWith('msg_');
                    return (isAnchor ? 4 : 2) + active * 5;
                })
                .attr("fill", (d: any) => {
                     const active = Math.max(0, 1 - (Date.now() - d.lastFired) / 1000);
                     return active > 0.5 ? "#fff" : ELEMENT_COLORS[d.element as MuzaElement];
                })
                .style("filter", (d: any) => {
                    const active = Math.max(0, 1 - (Date.now() - d.lastFired) / 1000);
                    if (active > 0.1) return `drop-shadow(0 0 ${active * 6}px #fff)`;
                    return 'none';
                });

            nodeSelection.exit().remove();

            frameId = requestAnimationFrame(render);
        };

        render();
        return () => cancelAnimationFrame(frameId);
    }, [aiService]);

    return (
        <div className="w-[240px] h-[240px] relative pointer-events-none select-none">
            <svg ref={svgRef} className="overflow-visible" />
            <div className="absolute inset-0 rounded-full border border-cyan-500/15 bg-black/5 backdrop-blur-[1px]"></div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[7px] font-mono text-cyan-500/40 uppercase tracking-[0.4em]">CAUSAL_FIELD_MAP</div>
        </div>
    );
};

export default NeuralMiniMap;
