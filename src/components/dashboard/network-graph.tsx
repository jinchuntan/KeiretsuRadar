'use client';

import { useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { SupplierNetwork, RiskLevel } from '@/lib/types';

const riskColors: Record<RiskLevel, string> = {
  low: '#22c55e',
  medium: '#f59e0b',
  high: '#ef4444',
  critical: '#dc2626',
};

function buildNodes(network: SupplierNetwork): Node[] {
  const centerNode: Node = {
    id: network.centerNode.id,
    position: { x: 400, y: 300 },
    data: { label: network.centerNode.name },
    style: {
      background: 'rgba(59, 130, 246, 0.15)',
      border: '2px solid rgba(59, 130, 246, 0.5)',
      borderRadius: '12px',
      padding: '12px 20px',
      color: '#93c5fd',
      fontSize: '13px',
      fontWeight: 600,
      minWidth: '120px',
      textAlign: 'center' as const,
    },
    type: 'default',
  };

  const supplierNodes: Node[] = network.suppliers.map((s, i) => {
    const angle = (2 * Math.PI * i) / network.suppliers.length - Math.PI / 2;
    const radius = 220;
    const x = 400 + radius * Math.cos(angle);
    const y = 300 + radius * Math.sin(angle);
    const color = riskColors[s.riskLevel];
    const size = s.importance === 'critical' ? 1.1 : s.importance === 'high' ? 1 : 0.9;

    return {
      id: s.id,
      position: { x, y },
      data: {
        label: `${s.name}\n${s.riskScore}/100`,
        supplierId: s.id,
      },
      style: {
        background: `${color}15`,
        border: `2px solid ${color}60`,
        borderRadius: '10px',
        padding: `${8 * size}px ${14 * size}px`,
        color: color,
        fontSize: `${11 * size}px`,
        fontWeight: 500,
        minWidth: `${90 * size}px`,
        textAlign: 'center' as const,
        cursor: 'pointer',
        whiteSpace: 'pre-line' as const,
        lineHeight: '1.4',
      },
      type: 'default',
    };
  });

  return [centerNode, ...supplierNodes];
}

function buildEdges(network: SupplierNetwork): Edge[] {
  return network.edges.map((e, i) => {
    const supplier = network.suppliers.find(s => s.id === e.target);
    const color = supplier ? riskColors[supplier.riskLevel] : '#666';
    return {
      id: `edge-${i}`,
      source: e.source,
      target: e.target,
      label: e.relationship,
      style: { stroke: `${color}40`, strokeWidth: 1.5 },
      labelStyle: { fill: '#888', fontSize: 9 },
      labelBgStyle: { fill: '#0f0f0f', fillOpacity: 0.9 },
      animated: supplier?.riskLevel === 'high',
    };
  });
}

interface NetworkGraphProps {
  network: SupplierNetwork;
  onNodeClick?: (supplierId: string) => void;
}

export function NetworkGraph({ network, onNodeClick }: NetworkGraphProps) {
  const initialNodes = useMemo(() => buildNodes(network), [network]);
  const initialEdges = useMemo(() => buildEdges(network), [network]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    if (node.id !== 'center' && onNodeClick) {
      const supplierId = (node.data as { supplierId?: string }).supplierId || node.id;
      onNodeClick(supplierId);
    }
  }, [onNodeClick]);

  return (
    <div className="h-[500px] w-full rounded-xl border border-border/50 bg-card/30 overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.5}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="rgba(255,255,255,0.03)" />
        <Controls
          showInteractive={false}
          style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
        />
      </ReactFlow>
    </div>
  );
}
