"use client";

import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Line, Grid } from "@react-three/drei";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Topology definition
// ---------------------------------------------------------------------------

type NodeKind =
  | "gateway"
  | "service"
  | "broker"
  | "processor"
  | "store"
  | "platform"
  | "ai";

interface SceneNode {
  id: string;
  label: string;
  sub?: string;
  desc: string;
  kind: NodeKind;
  pos: [number, number, number];
}

const NODES: SceneNode[] = [
  { id: "gw",    label: "API GATEWAY",      kind: "gateway",   pos: [0, 3.6, 0],        desc: "Single entry point routing traffic to backend services." },
  { id: "acc",   label: "ACCOUNT SVC",      sub: "spring boot", kind: "service",        pos: [-2.8, 1.9, 0],     desc: "Account management microservice — REST APIs over Spring Boot." },
  { id: "txn",   label: "TRANSACTION SVC",  sub: "spring boot", kind: "service",        pos: [0, 2.15, -0.5],    desc: "High-volume transaction processing domain." },
  { id: "chat",  label: "CHAT SVC",         sub: "websocket",   kind: "service",        pos: [2.8, 1.9, 0],      desc: "Real-time messaging service over persistent WebSocket sessions." },
  { id: "kafka", label: "KAFKA",            sub: "event bus",   kind: "broker",         pos: [0, 0.2, 0.2],      desc: "Event-driven backbone decoupling services through async streams." },
  { id: "proc",  label: "EVENT PROCESSING", sub: "async",       kind: "processor",      pos: [0, -1.6, 0],       desc: "Consumes events with retries and failure handling." },
  { id: "pg",    label: "POSTGRESQL",       sub: "persistence", kind: "store",          pos: [-1.8, -3.1, 0.25], desc: "Query-optimized persistence — indexing cut latency by 30%." },
  { id: "redis", label: "REDIS",            sub: "cache",       kind: "store",          pos: [1.8, -3.1, 0.25],  desc: "Hot-data caching layer reducing database load." },
  { id: "aws",   label: "AWS",              sub: "s3 · cloudwatch · k8s", kind: "platform", pos: [0, -4.6, 0], desc: "Cloud foundation — storage, observability and container orchestration." },
];

const GHOST_NODES: SceneNode[] = [
  { id: "agent", label: "AI AGENT",     sub: "exploring",  kind: "ai", pos: [-3.4, 4.35, -1.6], desc: "Future direction — currently exploring agentic systems." },
  { id: "orch",  label: "ORCHESTRATOR", sub: "concept",    kind: "ai", pos: [-3.4, 3.15, -2.0], desc: "Exploration concept — planning loop routing capabilities." },
  { id: "rag",   label: "RAG",          sub: "experiment", kind: "ai", pos: [-4.5, 2.15, -2.2], desc: "Experiment track — retrieval-augmented generation." },
  { id: "tools", label: "TOOLS",        sub: "concept",    kind: "ai", pos: [-2.3, 2.15, -2.2], desc: "Exploration concept — typed tools an agent can invoke." },
];

const EDGES: Array<[string, string]> = [
  ["gw", "acc"], ["gw", "txn"], ["gw", "chat"],
  ["acc", "kafka"], ["txn", "kafka"], ["chat", "kafka"],
  ["kafka", "proc"],
  ["proc", "pg"], ["proc", "redis"],
  ["pg", "aws"], ["redis", "aws"],
];

const GHOST_EDGES: Array<[string, string]> = [
  ["agent", "orch"], ["orch", "rag"], ["orch", "tools"], ["agent", "gw"],
];

const KIND_STYLE: Record<
  NodeKind,
  { color: string; emissive: string; wire: boolean }
> = {
  gateway:   { color: "#164e63", emissive: "#22d3ee", wire: true },
  service:   { color: "#0c3040", emissive: "#22d3ee", wire: false },
  broker:    { color: "#2e1065", emissive: "#a78bfa", wire: true },
  processor: { color: "#103a44", emissive: "#22d3ee", wire: true },
  store:     { color: "#052e21", emissive: "#34d399", wire: false },
  platform:  { color: "#111a26", emissive: "#38bdf8", wire: false },
  ai:        { color: "#451a03", emissive: "#fbbf24", wire: true },
};

const ALL_NODES = [...NODES, ...GHOST_NODES];
const ALL_EDGES = [...EDGES, ...GHOST_EDGES];

const edgeKey = ([f, t]: [string, string]) => `${f}->${t}`;

/** nodeId -> edge keys touching it */
const NODE_EDGE_MAP: Map<string, Set<string>> = (() => {
  const m = new Map<string, Set<string>>();
  for (const e of ALL_EDGES) {
    const k = edgeKey(e);
    for (const id of e) {
      if (!m.has(id)) m.set(id, new Set());
      m.get(id)!.add(k);
    }
  }
  return m;
})();

function vecOf(n: SceneNode): THREE.Vector3 {
  return new THREE.Vector3(n.pos[0], n.pos[1], n.pos[2]);
}

interface Segment {
  key: string;
  a: THREE.Vector3;
  b: THREE.Vector3;
  ghost: boolean;
}

const SEGMENTS: Segment[] = ALL_EDGES.map((e) => ({
  key: edgeKey(e),
  a: vecOf(ALL_NODES.find((n) => n.id === e[0])!),
  b: vecOf(ALL_NODES.find((n) => n.id === e[1])!),
  ghost: GHOST_EDGES.includes(e),
}));

// ---------------------------------------------------------------------------
// Node
// ---------------------------------------------------------------------------

function NodeLabel({
  node,
  hovered,
  simplify,
}: {
  node: SceneNode;
  hovered: boolean;
  simplify: boolean;
}) {
  const isAi = node.kind === "ai";
  return (
    <div className="pointer-events-none select-none" style={{ transform: "translateY(-46px)" }}>
      <div
        className={cn(
          "whitespace-nowrap rounded-sm border px-2 py-1 text-center font-mono backdrop-blur-sm transition-colors duration-200",
          isAi
            ? "border-warn/40 bg-[#160f04]/80 text-warn/90"
            : hovered
              ? "border-accent/70 bg-[#07222b]/85 text-accent shadow-[0_0_18px_rgba(34,211,238,0.25)]"
              : "border-line-strong bg-background/75 text-ink-dim"
        )}
      >
        <span className="block text-[10px] font-semibold leading-tight tracking-[0.18em]">
          {node.label}
        </span>
        {node.sub && !simplify && (
          <span className="mt-0.5 block text-[8px] tracking-[0.22em] opacity-60">
            {node.sub}
          </span>
        )}
        {hovered && !simplify && (
          <span className="mx-auto mt-1 block max-w-[170px] whitespace-normal text-left text-[9px] font-normal leading-snug tracking-normal text-ink-dim">
            {node.desc}
          </span>
        )}
      </div>
    </div>
  );
}

function SystemNode({
  node,
  active,
  anyHover,
  onHover,
  showLabel,
  richLabels,
}: {
  node: SceneNode;
  active: boolean;
  anyHover: boolean;
  onHover: (id: string | null) => void;
  showLabel: boolean;
  richLabels: boolean;
}) {
  const inner = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const style = KIND_STYLE[node.kind];
  const isAi = node.kind === "ai";
  const floatPhase = useMemo(() => Math.random() * Math.PI * 2, []);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const dimTarget = anyHover && !active ? 0.25 : 1;

  useFrame(({ clock }, dt) => {
    const g = inner.current;
    if (!g) return;
    const t = clock.elapsedTime;
    const k = 1 - Math.pow(0.0015, dt);

    g.position.y = Math.sin(t * 0.7 + floatPhase) * 0.05;

    const targetScale = active ? 1.16 : 1;
    g.scale.x += (targetScale - g.scale.x) * k;
    g.scale.y += (targetScale - g.scale.y) * k;
    g.scale.z += (targetScale - g.scale.z) * k;

    if (matRef.current) {
      matRef.current.opacity += (dimTarget - matRef.current.opacity) * 0.12;
    }
    if (!isAi && g.rotation.y < Math.PI * 2) {
      g.rotation.y += dt * 0.12;
    }
    if (ring.current) ring.current.rotation.z = t * 0.45;
  });

  return (
    <group position={node.pos}>
      <group
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(node.id);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          onHover(null);
          document.body.style.cursor = "";
        }}
      >
        {/* generous invisible hit area */}
        <mesh visible={false}>
          <sphereGeometry args={[node.kind === "platform" ? 1.5 : 0.72, 8, 8]} />
          <meshBasicMaterial />
        </mesh>

        <group ref={inner}>
          <mesh>
            {node.kind === "gateway" && <octahedronGeometry args={[0.46, 0]} />}
            {node.kind === "service" && <boxGeometry args={[0.72, 0.56, 0.56]} />}
            {node.kind === "broker" && <cylinderGeometry args={[0.36, 0.36, 0.52, 28]} />}
            {node.kind === "processor" && <icosahedronGeometry args={[0.42, 0]} />}
            {node.kind === "store" && <cylinderGeometry args={[0.34, 0.34, 0.46, 22]} />}
            {node.kind === "platform" && <boxGeometry args={[3.1, 0.2, 1.2]} />}
            {node.kind === "ai" && <tetrahedronGeometry args={[0.4, 0]} />}
            <meshStandardMaterial
              ref={matRef}
              color={style.color}
              emissive={style.emissive}
              emissiveIntensity={isAi ? 0.4 : 0.55}
              roughness={0.35}
              metalness={0.65}
              transparent
              opacity={1}
            />
          </mesh>

          {style.wire && (
            <mesh scale={1.32}>
              {node.kind === "gateway" && <octahedronGeometry args={[0.46, 0]} />}
              {node.kind === "broker" && <cylinderGeometry args={[0.36, 0.36, 0.52, 28]} />}
              {node.kind === "processor" && <icosahedronGeometry args={[0.42, 0]} />}
              {node.kind === "ai" && <tetrahedronGeometry args={[0.4, 0]} />}
              <meshBasicMaterial
                color={style.emissive}
                wireframe
                transparent
                opacity={isAi ? 0.18 : 0.12}
              />
            </mesh>
          )}
        </group>

        {node.kind === "broker" && (
          <mesh ref={ring} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.58, 0.012, 8, 64]} />
            <meshBasicMaterial color="#a78bfa" transparent opacity={0.4} />
          </mesh>
        )}
      </group>

      {showLabel && (
        <Html center zIndexRange={[30, 0]}>
          <NodeLabel node={node} hovered={active} simplify={!richLabels} />
        </Html>
      )}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Edges & pulses
// ---------------------------------------------------------------------------

function Edge({ seg, highlighted }: { seg: Segment; highlighted: boolean }) {
  if (seg.ghost) {
    return (
      <Line
        points={[seg.a, seg.b]}
        color="#fbbf24"
        lineWidth={1}
        transparent
        opacity={highlighted ? 0.55 : 0.16}
        dashed
        dashSize={0.16}
        gapSize={0.14}
      />
    );
  }
  return (
    <Line
      points={[seg.a, seg.b]}
      color={highlighted ? "#67e8f9" : "#155e75"}
      lineWidth={highlighted ? 2 : 1.2}
      transparent
      opacity={highlighted ? 0.95 : 0.34}
    />
  );
}

function Pulses({
  segments,
  enabled,
  hoveredId,
}: {
  segments: Segment[];
  enabled: boolean;
  hoveredId: string | null;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const cyan = new THREE.Color("#67e8f9");
    const amber = new THREE.Color("#fbbf24");
    segments.forEach((seg, i) => mesh.setColorAt(i, seg.ghost ? amber : cyan));
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [segments]);

  useFrame(({ clock }) => {
    const mesh = ref.current;
    if (!mesh || !enabled) return;
    const t = clock.elapsedTime;

    segments.forEach((seg, i) => {
      const len = seg.a.distanceTo(seg.b);
      const speed = 0.45 / Math.max(len, 0.001);
      const p = (((t * speed + i * 0.618) % 1) + 1) % 1;

      const related =
        !hoveredId || seg.ghost
          ? true
          : (NODE_EDGE_MAP.get(hoveredId)?.has(seg.key) ?? false);

      dummy.position.lerpVectors(seg.a, seg.b, p);
      dummy.scale.setScalar(related ? 0.055 : 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={ref}
      args={[undefined, undefined, segments.length]}
      frustumCulled={false}
    >
      <sphereGeometry args={[1, 10, 10]} />
      <meshBasicMaterial toneMapped={false} transparent opacity={0.95} />
    </instancedMesh>
  );
}

function Starfield({ count = 220 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 9 + Math.random() * 9;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.cos(phi) * 0.7;
      arr[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta) - 4;
    }
    return arr;
  }, [count]);

  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.008;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.035} color="#67e8f9" transparent opacity={0.4} sizeAttenuation />
    </points>
  );
}

// ---------------------------------------------------------------------------
// Scene root
// ---------------------------------------------------------------------------

function Scene({
  scrollRef,
  reduceMotion,
  simplify,
}: {
  scrollRef: MutableRefObject<number>;
  reduceMotion: boolean;
  simplify: boolean;
}) {
  const root = useRef<THREE.Group>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useFrame(({ pointer }, dt) => {
    if (!root.current) return;
    const scroll = scrollRef.current;
    const k = 1 - Math.pow(0.002, dt);

    const targetY = reduceMotion ? 0 : pointer.x * 0.13;
    const targetX = -0.04 + (reduceMotion ? 0 : -pointer.y * 0.06) - scroll * 0.1;
    root.current.rotation.y += (targetY - root.current.rotation.y) * k;
    root.current.rotation.x += (targetX - root.current.rotation.x) * k;
    root.current.position.y = -scroll * 1.4;
  });

  return (
    <>
      <fog attach="fog" args={["#05070b", 14, 26]} />
      <ambientLight intensity={0.75} />
      <directionalLight position={[5, 8, 6]} intensity={1.15} />
      <directionalLight position={[-6, -4, -4]} intensity={0.35} color="#22d3ee" />

      <group ref={root}>
        {!simplify && <Starfield />}

        {NODES.map((n) => (
          <SystemNode
            key={n.id}
            node={n}
            active={hoveredId === n.id}
            anyHover={!!hoveredId}
            onHover={setHoveredId}
            showLabel
            richLabels={!simplify}
          />
        ))}

        {!simplify &&
          GHOST_NODES.map((n) => (
            <SystemNode
              key={n.id}
              node={n}
              active={hoveredId === n.id}
              anyHover={!!hoveredId}
              onHover={setHoveredId}
              showLabel
              richLabels
            />
          ))}

        {SEGMENTS.map((seg) => (
          <Edge
            key={seg.key}
            seg={seg}
            highlighted={
              !!hoveredId && (NODE_EDGE_MAP.get(hoveredId)?.has(seg.key) ?? false)
            }
          />
        ))}

        {!simplify && (
          <Grid
            position={[0, -5.6, 0]}
            args={[40, 40]}
            cellSize={0.9}
            cellThickness={0.6}
            cellColor="#101c28"
            sectionSize={4.5}
            sectionThickness={1}
            sectionColor="#15384a"
            fadeDistance={30}
            fadeStrength={1.4}
            infiniteGrid
          />
        )}
      </group>

      <Pulses segments={SEGMENTS} enabled={!reduceMotion} hoveredId={hoveredId} />
    </>
  );
}

export default function HeroSceneCanvas({
  scrollRef,
  reduceMotion = false,
  simplify = false,
  paused = false,
}: {
  scrollRef: MutableRefObject<number>;
  reduceMotion?: boolean;
  simplify?: boolean;
  /** IntersectionObserver gate — pauses the render loop while the hero is offscreen. */
  paused?: boolean;
}) {
  const animate = !reduceMotion && !paused;

  return (
    <Canvas
      frameloop={animate ? "always" : "demand"}
      dpr={simplify ? [1, 1.25] : [1, 1.75]}
      camera={{ position: [0, 0.3, simplify ? 12.5 : 12], fov: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
      aria-hidden
    >
      <Scene scrollRef={scrollRef} reduceMotion={reduceMotion} simplify={simplify} />
    </Canvas>
  );
}
