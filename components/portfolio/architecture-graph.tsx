"use client";

import { useMemo, useState } from "react";
import type { ArchitectureDiagram, DiagNode, NodeKind } from "@/lib/portfolio-data";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Layout constants
// ---------------------------------------------------------------------------

const COL_W = 182;
const ROW_H = 126;
const BOX_W = 158;
const BOX_H = 62;
const PAD_X = 18;
const CAPTION_H = 30;
const BOX_TOP_IN_BAND = 28;

const KIND_STYLE: Record<NodeKind, { fill: string; stroke: string; text: string }> = {
  client:    { fill: "#10151c", stroke: "#3b4a5f", text: "#9fb0c3" },
  compute:   { fill: "#0a2530", stroke: "#17708c", text: "#7dd3fc" },
  messaging: { fill: "#170b2e", stroke: "#6d28d9", text: "#c4b5fd" },
  data:      { fill: "#06231a", stroke: "#0b5e44", text: "#6ee7b7" },
  platform:  { fill: "#121c28", stroke: "#2e5e77", text: "#7dd3fc" },
  ai:        { fill: "#1c1204", stroke: "#b45309", text: "#fcd34d" },
};

interface Positioned extends DiagNode {
  cx: number;
  cy: number;
  boxW: number;
}

function layout(diagram: ArchitectureDiagram) {
  const maxCols = Math.max(
    ...diagram.nodes.map((n) => n.col + (n.colSpan ?? 1))
  );
  const width = PAD_X * 2 + maxCols * COL_W;
  const height = CAPTION_H + diagram.layers.length * ROW_H + 10;

  const positioned: Positioned[] = diagram.nodes.map((n) => {
    const span = n.colSpan ?? 1;
    const boxW = span > 1 ? span * COL_W - 18 : BOX_W;
    return {
      ...n,
      boxW,
      cx: PAD_X + n.col * COL_W + (span * COL_W) / 2,
      cy: CAPTION_H + n.layer * ROW_H + BOX_TOP_IN_BAND + BOX_H / 2,
    };
  });

  const byId = new Map(positioned.map((p) => [p.id, p]));

  const edges = diagram.edges
    .map(({ from, to }) => {
      const a = byId.get(from);
      const b = byId.get(to);
      if (!a || !b) return null;
      const x1 = a.cx;
      const y1 = a.cy + BOX_H / 2;
      const x2 = b.cx;
      const y2 = b.cy - BOX_H / 2;
      const midY = (y1 + y2) / 2;
      const d = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
      return { key: `${from}->${to}`, from, to, d };
    })
    .filter((e): e is NonNullable<typeof e> => e !== null);

  return { width, height, positioned, edges, maxCols };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function InspectorRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 border-l-2 border-line-strong pl-3">
      <dt className="w-[104px] shrink-0 pt-0.5 font-mono text-[9px] tracking-[0.25em] text-ink-faint">
        {label}
      </dt>
      <dd className="text-sm leading-relaxed text-ink-dim">{children}</dd>
    </div>
  );
}

export function ArchitectureGraph({
  diagram,
  className,
}: {
  diagram: ArchitectureDiagram;
  className?: string;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { width, height, positioned, edges } = useMemo(() => layout(diagram), [diagram]);

  const byId = useMemo(
    () => new Map(positioned.map((p) => [p.id, p])),
    [positioned]
  );

  const focusId = hoveredId ?? selectedId;
  const focusNode = focusId ? byId.get(focusId) ?? null : null;

  const touchedEdges = useMemo(() => {
    if (!focusId) return new Set<string>();
    return new Set(
      edges.filter((e) => e.from === focusId || e.to === focusId).map((e) => e.key)
    );
  }, [edges, focusId]);

  const dimmed = (id: string) =>
    !!focusId && focusId !== id && !touchedEdges.has(`${focusId}->${id}`) && !touchedEdges.has(`${id}->${focusId}`);

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      {/* canvas */}
      <div className="panel corner-brackets relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
          <span className="font-mono text-[9px] tracking-[0.3em] text-ink-faint sm:text-[10px]">
            {diagram.title}
          </span>
          <span className="hidden items-center gap-2 font-mono text-[9px] tracking-[0.25em] text-ink-faint sm:inline-flex">
            CLICK NODES TO INSPECT
          </span>
        </div>

        <div className="grid-bg relative overflow-x-auto p-2 sm:p-4">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="mx-auto block h-auto w-full min-w-[680px]"
            role="img"
            aria-label={`Interactive architecture diagram: ${diagram.title}. Click nodes to inspect.`}
          >
            <defs>
              <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#17708c" />
              </marker>
              <marker
                id="arrow-active"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#22d3ee" />
              </marker>
            </defs>

            {/* layer captions */}
            {diagram.layers.map((label, i) => (
              <text
                key={label + i}
                x={PAD_X + 4}
                y={CAPTION_H + i * ROW_H + 14}
                className="fill-[#7d8ba1] font-mono"
                fontSize="11"
                letterSpacing="3"
              >
                {label}
              </text>
            ))}

            {/* edges */}
            {edges.map((e) => {
              const active = touchedEdges.has(e.key);
              return (
                <path
                  key={e.key}
                  d={e.d}
                  fill="none"
                  stroke={active ? "#22d3ee" : "#164e63"}
                  strokeWidth={active ? 2 : 1.2}
                  opacity={active ? 0.95 : 0.45}
                  strokeDasharray="5 7"
                  markerEnd={active ? "url(#arrow-active)" : "url(#arrow)"}
                  className={cn(
                    !focusId && "[stroke-dashoffset:0] motion-safe:animate-[dash_2.2s_linear_infinite]",
                    focusId && !active && "opacity-15"
                  )}
                  style={{ transition: "opacity .25s ease, stroke .25s ease" }}
                />
              );
            })}

            {/* nodes */}
            {positioned.map((n) => {
              const style = KIND_STYLE[n.kind];
              const isSelected = selectedId === n.id;
              const isDim = dimmed(n.id);
              return (
                <g
                  key={n.id}
                  transform={`translate(${n.cx - n.boxW / 2}, ${n.cy - BOX_H / 2})`}
                  onClick={() => setSelectedId(isSelected ? null : n.id)}
                  onMouseEnter={() => setHoveredId(n.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedId(isSelected ? null : n.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  aria-label={`${n.label}${n.exploring ? " (exploring)" : ""}: ${n.desc}`}
                  className="cursor-pointer outline-none [&:focus-visible_rect]:stroke-accent"
                  style={{ transition: "opacity .25s ease", opacity: isDim ? 0.35 : 1 }}
                >
                  {isSelected && (
                    <rect
                      x={-4}
                      y={-4}
                      width={n.boxW + 8}
                      height={BOX_H + 8}
                      rx={9}
                      fill="none"
                      stroke="#22d3ee"
                      strokeOpacity={0.35}
                      strokeWidth={6}
                    />
                  )}
                  <rect
                    width={n.boxW}
                    height={BOX_H}
                    rx={7}
                    fill={style.fill}
                    stroke={isSelected ? "#22d3ee" : style.stroke}
                    strokeWidth={isSelected ? 1.8 : 1.1}
                    style={{ transition: "stroke .2s ease" }}
                  />
                  <text
                    x={n.boxW / 2}
                    y={n.sub ? BOX_H / 2 - 3 : BOX_H / 2 + 4}
                    textAnchor="middle"
                    fill={isSelected ? "#a5f3fc" : style.text}
                    fontSize="11.5"
                    fontWeight="700"
                    letterSpacing="1.5"
                    className="font-mono"
                  >
                    {n.label}
                  </text>
                  {n.sub && (
                    <text
                      x={n.boxW / 2}
                      y={BOX_H / 2 + 15}
                      textAnchor="middle"
                      fill={style.text}
                      opacity="0.62"
                      fontSize="8.5"
                      letterSpacing="2"
                      className="font-mono"
                    >
                      {n.sub.toUpperCase()}
                    </text>
                  )}
                  {n.exploring && (
                    <>
                      <circle cx={n.boxW - 13} cy={13} r={3.5} fill="#fbbf24">
                        <animate attributeName="opacity" values="1;0.35;1" dur="1.6s" repeatCount="indefinite" />
                      </circle>
                      <text
                        x={13}
                        y={17}
                        fill="#fbbf24"
                        fontSize="7.5"
                        letterSpacing="1.5"
                        className="font-mono"
                        opacity="0.85"
                      >
                        EXPLORING
                      </text>
                    </>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-line px-4 py-2.5">
          {(Object.keys(KIND_STYLE) as NodeKind[]).map((kind) => (
            <span key={kind} className="inline-flex items-center gap-1.5 font-mono text-[8.5px] tracking-[0.2em] text-ink-faint">
              <span
                className="inline-block size-2 rounded-[2px]"
                style={{ background: KIND_STYLE[kind].fill, border: `1px solid ${KIND_STYLE[kind].stroke}` }}
                aria-hidden
              />
              {kind.toUpperCase()}
            </span>
          ))}
        </div>
      </div>

      {/* inspector */}
      <div
        aria-live="polite"
        className="min-h-[112px] border border-line bg-surface-2/70 p-4 sm:p-5"
      >
        {focusNode ? (
          <div>
            <p className="flex flex-wrap items-center gap-3 font-mono text-xs tracking-[0.25em]">
              <span className="text-accent">&gt;</span>
              <span className="font-bold text-ink">{focusNode.label}</span>
              {focusNode.sub && (
                <span className="text-[10px] tracking-[0.2em] text-ink-faint">
                  {focusNode.sub.toUpperCase()}
                </span>
              )}
              {focusNode.exploring && (
                <span className="chip chip--ai !py-0.5 !text-[9px]">EXPLORING</span>
              )}
            </p>

            <dl className="mt-3 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
              <InspectorRow label="ROLE">
                {focusNode.role ?? focusNode.desc}
              </InspectorRow>
              {(focusNode.why || !focusNode.role) && (
                <InspectorRow label={focusNode.why ? "WHY IT EXISTS" : "ABOUT"}>
                  {focusNode.why ?? focusNode.desc}
                </InspectorRow>
              )}
              {focusNode.tech && (
                <InspectorRow label="TECHNOLOGY">
                  <span className="font-mono text-[11px] tracking-wider text-ink">
                    {focusNode.tech}
                  </span>
                </InspectorRow>
              )}
            </dl>
          </div>
        ) : (
          <p className="pt-2 font-mono text-[11px] leading-relaxed tracking-[0.18em] text-ink-faint">
            &gt; SELECT A NODE TO INSPECT<span className="ml-1 inline-block h-3.5 w-2 translate-y-[2px] animate-pulse bg-accent/70" />
          </p>
        )}
      </div>

      <style jsx global>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -48;
          }
        }
      `}</style>
    </div>
  );
}
