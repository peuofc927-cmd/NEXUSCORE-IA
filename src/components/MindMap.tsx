import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface NodeData {
  name: string;
  children?: NodeData[];
}

interface MindMapProps {
  data: NodeData;
  width?: number;
  height?: number;
}

export default function MindMap({ data, width = 800, height = 600 }: MindMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 120, bottom: 20, left: 120 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const tree = d3.tree<NodeData>().size([innerHeight, innerWidth]);
    const root = d3.hierarchy(data);
    tree(root);

    // Links
    g.selectAll(".link")
      .data(root.links())
      .enter().append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "rgba(6, 182, 212, 0.2)")
      .attr("stroke-width", 1.5)
      .attr("d", d3.linkHorizontal<any, any>()
        .x(d => d.y)
        .y(d => d.x) as any);

    // Nodes
    const node = g.selectAll(".node")
      .data(root.descendants())
      .enter().append("g")
      .attr("class", d => "node" + (d.children ? " node--internal" : " node--leaf"))
      .attr("transform", d => `translate(${d.y},${d.x})`);

    node.append("circle")
      .attr("r", 6)
      .attr("fill", d => d.children ? "rgba(6, 182, 212, 0.8)" : "rgba(6, 182, 212, 0.4)")
      .attr("stroke", "rgba(6, 182, 212, 0.4)")
      .attr("stroke-width", 2)
      .style("filter", "drop-shadow(0 0 5px rgba(6, 182, 212, 0.5))");

    node.append("text")
      .attr("dy", ".35em")
      .attr("x", d => d.children ? -12 : 12)
      .style("text-anchor", d => d.children ? "end" : "start")
      .text(d => d.data.name)
      .attr("fill", "#ecfeff")
      .style("font-size", "11px")
      .style("font-family", "Inter, sans-serif")
      .style("text-transform", "uppercase")
      .style("letter-spacing", "0.05em")
      .style("text-shadow", "0 0 10px rgba(6, 182, 212, 0.5)");

  }, [data, width, height]);

  return (
    <div className="w-full overflow-x-auto bg-white/5 rounded-2xl p-4 border border-white/10">
      <svg ref={svgRef} width={width} height={height} className="max-w-full h-auto" />
    </div>
  );
}
