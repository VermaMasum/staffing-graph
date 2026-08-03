"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { GraphData, GraphNode } from "@/lib/types";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

const TYPE_COLOR: Record<GraphNode["type"], string> = {
  Project: "#6366f1",
  Skill: "#10b981",
  Person: "#f59e0b",
  Team: "#94a3b8",
};

const DETAIL_COLOR: Record<string, string> = {
  self: "#ec4899",
  candidate: "#f59e0b",
  team: "#3b82f6",
  collaborator: "#a78bfa",
};

function colorForNode(node: GraphNode): string {
  if (node.detail && DETAIL_COLOR[node.detail]) return DETAIL_COLOR[node.detail];
  return TYPE_COLOR[node.type];
}

function sizeForNode(node: GraphNode): number {
  if (node.type === "Project") return 8;
  if (node.type === "Person") return node.detail === "self" ? 8 : 6;
  return 4;
}

interface GraphViewProps {
  data: GraphData;
  onNodeClick?: (node: GraphNode) => void;
  height?: number;
}

export default function GraphView({ data, onNodeClick, height = 420 }: GraphViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const observer = new ResizeObserver((entries) => {
      setWidth(entries[0].contentRect.width);
    });
    observer.observe(el);
    setWidth(el.clientWidth);
    return () => observer.disconnect();
  }, []);

  const graphData = useMemo(
    () => ({
      nodes: data.nodes.map((n) => ({ ...n })),
      links: data.links.map((l) => ({ ...l })),
    }),
    [data]
  );

  if (data.nodes.length === 0) {
    return (
      <div
        ref={containerRef}
        className="flex items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50 text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900/40 dark:text-neutral-400"
        style={{ height }}
      >
        No graph data to show yet.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950"
      style={{ height }}
    >
      {width > 0 && (
        <ForceGraph2D
          graphData={graphData}
          width={width}
          height={height}
          nodeLabel={(n: unknown) => (n as GraphNode).label}
          nodeColor={(n: unknown) => colorForNode(n as GraphNode)}
          nodeVal={(n: unknown) => sizeForNode(n as GraphNode)}
          linkColor={() => "rgba(148, 163, 184, 0.55)"}
          linkWidth={1}
          linkDirectionalParticles={0}
          cooldownTicks={80}
          onNodeClick={(n: unknown) => onNodeClick?.(n as GraphNode)}
          nodeCanvasObjectMode={() => "after"}
          nodeCanvasObject={(n: unknown, ctx: CanvasRenderingContext2D, globalScale: number) => {
            const node = n as GraphNode & { x?: number; y?: number };
            if (node.x === undefined || node.y === undefined) return;
            const label = node.label;
            // Clamp the font size in screen pixels rather than scaling
            // linearly with zoom, so labels stay legible whether the graph
            // auto-fits tight (few nodes) or loose (many clustered nodes).
            const fontSize = Math.min(12, Math.max(8, 11 / globalScale));
            ctx.font = `${fontSize}px sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.fillStyle = "rgba(30, 30, 30, 0.85)";
            ctx.fillText(label, node.x, node.y + sizeForNode(node) + 2);
          }}
        />
      )}
    </div>
  );
}
