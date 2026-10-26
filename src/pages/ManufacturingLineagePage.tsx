import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Handle,
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  GitFork,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Layers,
  ChevronRight,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { GeneaTraceStore } from '../services/dataStore';

// Custom Node for Manufacturing Operations in Theme Aesthetic
const OperationNode = ({ data }: { data: any }) => {
  const isDefective = data.isDefective;

  return (
    <div
      className={`px-3 py-2 rounded-sm border text-xs min-w-[170px] shadow-sm transition-all font-serif-vintage ${
        isDefective
          ? 'bg-[rgba(248,113,113,0.15)] border-[#F87171] text-[#F87171]'
          : 'bg-[#382A28] border-[#60433D] text-[#E8D8CE] hover:border-[#916B60]'
      }`}
    >
      <Handle type="target" position={Position.Left} className="bg-[#916B60]! w-1.5! h-1.5!" />
      <div className="flex items-center justify-between gap-2 border-b border-[#60433D] pb-1">
        <span className="font-mono text-[9px] uppercase tracking-wider text-[#C1A094]">{data.step}</span>
        <span
          className={`px-1 py-0.2 rounded-xs text-[9px] font-mono ${
            isDefective ? 'bg-[#F87171] text-[#211B1A] font-semibold' : 'bg-[#60433D] text-[#E8D8CE] border border-[#60433D]'
          }`}
        >
          {data.machine}
        </span>
      </div>
      <div className="text-xs mt-1 text-[#E8D8CE] leading-tight font-normal">{data.label}</div>
      <div className="mt-1 flex items-center justify-between text-[10px] text-[#C1A094] font-mono">
        <span>{data.event}</span>
        <span className={data.result === 'OK' ? 'text-[#34D399]' : 'text-[#F87171] font-semibold'}>{data.result}</span>
      </div>
      <Handle type="source" position={Position.Right} className="bg-[#916B60]! w-1.5! h-1.5!" />
    </div>
  );
};

// Custom Node for Component Junction in Theme Aesthetic
const ComponentJunctionNode = ({ data }: { data: any }) => {
  return (
    <div className="px-3.5 py-2.5 rounded-sm bg-[#60433D] border border-[#60433D] text-xs min-w-[190px] shadow-sm font-serif-vintage">
      <Handle type="target" position={Position.Left} className="bg-[#916B60]! w-1.5! h-1.5!" />
      <div className="flex items-center gap-1.5 text-[#C1A094] mb-1">
        <Cpu size={13} />
        <span className="text-xs font-medium">{data.title}</span>
      </div>
      <div className="text-[11px] text-[#C1A094]">{data.desc}</div>
      <div className="mt-1 text-[10px] font-mono text-[#916B60]">Batch: {data.batchId}</div>
      <Handle type="source" position={Position.Right} className="bg-[#916B60]! w-1.5! h-1.5!" />
    </div>
  );
};

const nodeTypes = {
  operation: OperationNode,
  junction: ComponentJunctionNode,
};

export const ManufacturingLineagePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeWorkflow, setActiveWorkflow] = useState<'electronics' | 'ev_battery'>('electronics');
  const [selectedNode, setSelectedNode] = useState<any>(null);

  // Workflow 1: Display Component & Smartphone Assembly
  const electronicsNodes: Node[] = [
    { id: '1.1', type: 'operation', position: { x: 50, y: 100 }, data: { step: '1.1 Raw Material', label: 'Glass & Substrate Receipt', machine: 'RM-01', event: 'Material In', result: 'OK', time: '2026-10-01 08:00', operator: 'OP-KIM-21', section: 'Component Manufacturing' } },
    { id: '1.2', type: 'operation', position: { x: 260, y: 100 }, data: { step: '1.2 Cutting', label: 'Precision Laser Glass Cut', machine: 'GC-02', event: 'Glass Cut', result: 'OK', time: '2026-10-01 08:20', operator: 'OP-PARK-08', section: 'Component Manufacturing' } },
    { id: '1.3', type: 'operation', position: { x: 470, y: 100 }, data: { step: '1.3 TFT Layer', label: 'TFT Matrix Deposition', machine: 'TFT-03', event: 'TFT Layer', result: 'OK', time: '2026-10-01 08:45', operator: 'OP-AUTO-ROBOT', section: 'Component Manufacturing' } },
    { id: '1.4', type: 'operation', position: { x: 680, y: 100 }, data: { step: '1.4 Polarizer', label: 'Polarizer Lamination', machine: 'PL-04', event: 'Polarizer', result: 'OK', time: '2026-10-01 09:10', operator: 'OP-LEE-14', section: 'Component Manufacturing' } },
    { id: '1.5', type: 'operation', position: { x: 890, y: 100 }, data: { step: '1.5 Gluing', label: 'Adhesive Gluing (Optically Clear)', machine: 'AG-05', event: 'Optical Adhesive', result: 'Anomaly', isDefective: true, time: '2026-10-01 09:25', operator: 'OP-CHOI-03', section: 'Component Manufacturing' } },
    { id: '1.6', type: 'operation', position: { x: 1100, y: 100 }, data: { step: '1.6 Sticking', label: 'Display Panel Sticking', machine: 'ST-06', event: 'Polplay Sticking', result: 'OK', time: '2026-10-01 09:30', operator: 'OP-JUNG-19', section: 'Component Manufacturing' } },
    { id: '1.7', type: 'operation', position: { x: 1310, y: 100 }, data: { step: '1.7 Curing', label: 'Preheating & Oven Curing', machine: 'PH-07', event: 'Preheating', result: 'Thermal Drift', isDefective: true, time: '2026-10-01 10:00', operator: 'OP-HEATER-AUTO', section: 'Component Manufacturing' } },
    { id: '1.8', type: 'operation', position: { x: 1520, y: 100 }, data: { step: '1.8 Test', label: 'Electrical & Pixel Test', machine: 'ET-08', event: 'Electrical Test', result: 'Failed Tol', isDefective: true, time: '2026-10-01 10:15', operator: 'OP-TEST-STN1', section: 'Component Manufacturing' } },
    { id: '1.9', type: 'operation', position: { x: 1730, y: 100 }, data: { step: '1.9 QC Inspect', label: 'Final Quality Inspection', machine: 'INSP-09', event: 'Final Inspect', result: 'Flagged', isDefective: true, time: '2026-10-01 10:30', operator: 'OP-QC-LEAD', section: 'Component Manufacturing' } },

    { id: 'hub-display', type: 'junction', position: { x: 1730, y: 280 }, data: { title: 'Display (Batch ABC)', desc: '100 units (ABC-0001 to 0100)', batchId: 'ABC', isDefective: true } },
    { id: 'hub-battery', type: 'junction', position: { x: 1730, y: 390 }, data: { title: 'Battery (Batch BTR)', desc: 'ATL 5,000mAh Cells', batchId: 'BTR' } },
    { id: 'hub-pcb', type: 'junction', position: { x: 1730, y: 500 }, data: { title: 'Main PCB (Batch PCB)', desc: 'Semco Snapdragon 8 Gen 3', batchId: 'PCB' } },

    { id: '3.1', type: 'operation', position: { x: 2020, y: 380 }, data: { step: '3.1 PCB Assembly', label: 'PCB SMT Line Mount', machine: 'SMT-01', event: 'EVT-100201', result: 'OK', section: 'Smartphone Assembly' } },
    { id: '3.2', type: 'operation', position: { x: 2230, y: 380 }, data: { step: '3.2 Component Mount', label: 'Robotic Component Mount', machine: 'AS-02', event: 'EVT-100202', result: 'OK', section: 'Smartphone Assembly' } },
    { id: '3.3', type: 'operation', position: { x: 2440, y: 380 }, data: { step: '3.3 Main Assembly', label: 'Chassis & Sub-Assembly', machine: 'AS-03', event: 'EVT-100203', result: 'OK', section: 'Smartphone Assembly' } },
    { id: '3.4', type: 'operation', position: { x: 2650, y: 380 }, data: { step: '3.4 Final Sealing', label: 'Titanium Shell Sealing', machine: 'FA-01', event: 'EVT-100204', result: 'OK', section: 'Smartphone Assembly' } },
    { id: '3.5', type: 'operation', position: { x: 2860, y: 380 }, data: { step: '3.5 Functional Test', label: 'Diagnostic BIST', machine: 'FT-01', event: 'EVT-100205', result: 'OK', section: 'Smartphone Assembly' } },
    { id: '3.6', type: 'operation', position: { x: 3070, y: 380 }, data: { step: '3.6 Packaging', label: 'DPP QR Engraving', machine: 'PK-01', event: 'EVT-100206', result: 'OK', section: 'Smartphone Assembly' } },

    { id: 'product-851', type: 'junction', position: { x: 3300, y: 360 }, data: { title: 'GT-DEV-00000851', desc: 'Smartphone (Contains ABC-0042)', batchId: 'ABC Linked' } },
  ];

  const electronicsEdges: Edge[] = [
    { id: 'e1-2', source: '1.1', target: '1.2', animated: true, style: { stroke: '#60433D', strokeWidth: 1.5 } },
    { id: 'e2-3', source: '1.2', target: '1.3', animated: true, style: { stroke: '#60433D', strokeWidth: 1.5 } },
    { id: 'e3-4', source: '1.3', target: '1.4', animated: true, style: { stroke: '#60433D', strokeWidth: 1.5 } },
    { id: 'e4-5', source: '1.4', target: '1.5', animated: true, style: { stroke: '#F87171', strokeWidth: 1.8 } },
    { id: 'e5-6', source: '1.5', target: '1.6', animated: true, style: { stroke: '#F87171', strokeWidth: 1.8 } },
    { id: 'e6-7', source: '1.6', target: '1.7', animated: true, style: { stroke: '#F87171', strokeWidth: 1.8 } },
    { id: 'e7-8', source: '1.7', target: '1.8', animated: true, style: { stroke: '#F87171', strokeWidth: 1.8 } },
    { id: 'e8-9', source: '1.8', target: '1.9', animated: true, style: { stroke: '#F87171', strokeWidth: 1.8 } },
    { id: 'e9-hub', source: '1.9', target: 'hub-display', animated: true, style: { stroke: '#F87171', strokeWidth: 2 } },
    { id: 'e-disp-asm', source: 'hub-display', target: '3.1', animated: true, style: { stroke: '#F87171', strokeWidth: 1.8 } },
    { id: 'e-btr-asm', source: 'hub-battery', target: '3.1', style: { stroke: '#916B60', strokeWidth: 1.2 } },
    { id: 'e-pcb-asm', source: 'hub-pcb', target: '3.1', style: { stroke: '#916B60', strokeWidth: 1.2 } },
    { id: 'e31-32', source: '3.1', target: '3.2', animated: true, style: { stroke: '#60433D', strokeWidth: 1.5 } },
    { id: 'e32-33', source: '3.2', target: '3.3', animated: true, style: { stroke: '#60433D', strokeWidth: 1.5 } },
    { id: 'e33-34', source: '3.3', target: '3.4', animated: true, style: { stroke: '#60433D', strokeWidth: 1.5 } },
    { id: 'e34-35', source: '3.4', target: '3.5', animated: true, style: { stroke: '#60433D', strokeWidth: 1.5 } },
    { id: 'e35-36', source: '3.5', target: '3.6', animated: true, style: { stroke: '#60433D', strokeWidth: 1.5 } },
    { id: 'e36-prod', source: '3.6', target: 'product-851', animated: true, style: { stroke: '#916B60', strokeWidth: 1.8 } },
  ];

  // Workflow 2: EV Battery Cell-to-Pack
  const evNodes: Node[] = [
    { id: 'ev-1', type: 'operation', position: { x: 50, y: 150 }, data: { step: 'B.1 Raw Slurry', label: 'NCM 811 Active Material Mixing', machine: 'MIX-01', event: 'Cathode Slurry', result: 'OK', section: 'Gigafactory Cell Fab' } },
    { id: 'ev-2', type: 'operation', position: { x: 280, y: 150 }, data: { step: 'B.2 Foil Coating', label: 'Continuous Double-Side Coating', machine: 'COAT-02', event: 'Foil Lamination', result: 'OK', section: 'Gigafactory Cell Fab' } },
    { id: 'ev-3', type: 'operation', position: { x: 510, y: 150 }, data: { step: 'B.3 Calendering', label: 'High-Pressure Hot Calendering', machine: 'ROLL-03', event: 'Density Calender', result: 'OK', section: 'Gigafactory Cell Fab' } },
    { id: 'ev-4', type: 'operation', position: { x: 740, y: 150 }, data: { step: 'B.4 Ultrasonic Tab', label: 'Ultrasonic Tab Joining (96 Cells)', machine: 'WELD-04', event: 'Tab Welding', result: 'OK', section: 'Gigafactory Cell Fab' } },
    { id: 'ev-hub', type: 'junction', position: { x: 1000, y: 130 }, data: { title: 'Prismatic Cells (Batch CELL-96)', desc: '96kWh Cell Matrix (Skellefteå)', batchId: 'CELL-96' } },
    { id: 'ev-5', type: 'operation', position: { x: 1250, y: 150 }, data: { step: 'B.5 Cold Plate', label: 'Thermal Cold Plate Helium Test', machine: 'PR-05', event: 'Pressure Test', result: 'OK', section: 'Pack Assembly' } },
    { id: 'ev-6', type: 'operation', position: { x: 1480, y: 150 }, data: { step: 'B.6 BMS Harness', label: 'ASIL-D BMS Enclave Bonding', machine: 'BMS-06', event: 'BMS Calibration', result: 'OK', section: 'Pack Assembly' } },
    { id: 'ev-7', type: 'operation', position: { x: 1710, y: 150 }, data: { step: 'B.7 Hi-Pot 800V', label: 'Dielectric Insulation Safety Test', machine: 'HIPOT-07', event: 'Dielectric Check', result: 'OK', section: 'Pack Assembly' } },
    { id: 'ev-pack', type: 'junction', position: { x: 1960, y: 130 }, data: { title: 'GT-EVB-00094120', desc: '800V EV Battery Pack (EU Battery DPP)', batchId: 'EU Battery 2023/1542' } },
  ];

  const evEdges: Edge[] = [
    { id: 'ev-e1', source: 'ev-1', target: 'ev-2', animated: true, style: { stroke: '#60433D' } },
    { id: 'ev-e2', source: 'ev-2', target: 'ev-3', animated: true, style: { stroke: '#60433D' } },
    { id: 'ev-e3', source: 'ev-3', target: 'ev-4', animated: true, style: { stroke: '#60433D' } },
    { id: 'ev-e4', source: 'ev-4', target: 'ev-hub', animated: true, style: { stroke: '#60433D' } },
    { id: 'ev-e5', source: 'ev-hub', target: 'ev-5', animated: true, style: { stroke: '#FBBF24' } },
    { id: 'ev-e6', source: 'ev-5', target: 'ev-6', animated: true, style: { stroke: '#60433D' } },
    { id: 'ev-e7', source: 'ev-6', target: 'ev-7', animated: true, style: { stroke: '#60433D' } },
    { id: 'ev-e8', source: 'ev-7', target: 'ev-pack', animated: true, style: { stroke: '#34D399', strokeWidth: 1.8 } },
  ];

  const currentNodes = activeWorkflow === 'electronics' ? electronicsNodes : evNodes;
  const currentEdges = activeWorkflow === 'electronics' ? electronicsEdges : evEdges;

  const [nodes, setNodes, onNodesChange] = useNodesState(currentNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(currentEdges);

  const switchWorkflow = (wf: 'electronics' | 'ev_battery') => {
    setActiveWorkflow(wf);
    if (wf === 'electronics') {
      setNodes(electronicsNodes);
      setEdges(electronicsEdges);
    } else {
      setNodes(evNodes);
      setEdges(evEdges);
    }
  };

  const onNodeClick = (_: any, node: Node) => {
    setSelectedNode(node);
  };

  return (
    <div className="space-y-4 h-[calc(100vh-100px)] flex flex-col font-serif-vintage">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0 pb-2 border-b border-[#60433D]">
        <div>
          <h1 className="text-xl text-[#E8D8CE] flex items-center gap-2">
            <GitFork className="text-[#916B60]" size={20} />
            <span>Manufacturing Lineage Map (Multi-Sector Merkle-DAG)</span>
          </h1>
          <p className="text-xs text-[#C1A094]">
            Interactive visual graph of component fabrication and end-product assembly.
          </p>
        </div>

        {/* Workflow Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-0.5 rounded-sm bg-[#382A28] border border-[#60433D] text-xs">
            <button
              onClick={() => switchWorkflow('electronics')}
              className={`px-3 py-1 rounded-xs transition-all ${
                activeWorkflow === 'electronics'
                  ? 'bg-[#C1A094] text-[#211B1A] font-semibold'
                  : 'text-[#C1A094] hover:text-[#E8D8CE]'
              }`}
            >
              📱 Display &amp; Mobile Lineage
            </button>
            <button
              onClick={() => switchWorkflow('ev_battery')}
              className={`px-3 py-1 rounded-xs transition-all ${
                activeWorkflow === 'ev_battery'
                  ? 'bg-[#C1A094] text-[#211B1A] font-semibold'
                  : 'text-[#C1A094] hover:text-[#E8D8CE]'
              }`}
            >
              🚗 EV Battery Cell-to-Pack
            </button>
          </div>
        </div>
      </div>

      {/* Main Graph Area */}
      <div className="flex-1 border border-[#60433D] bg-[#211B1A] relative overflow-hidden flex shadow-lg rounded-sm">
        <div className="flex-1 h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.15 }}
            minZoom={0.2}
            maxZoom={1.5}
          >
            <Background color="#60433D" gap={20} size={1} />
            <Controls className="bg-[#382A28]! border-[#60433D]! text-[#E8D8CE]!" />
            <MiniMap
              nodeColor={node => {
                const d = node.data as any;
                if (d?.isDefective) return '#F87171';
                if (d?.section?.includes('Assembly')) return '#916B60';
                return '#916B60';
              }}
              className="bg-[#382A28]! border-[#60433D]!"
            />
          </ReactFlow>
        </div>

        {/* Node Detail Inspector Drawer */}
        {selectedNode && (
          <div className="w-80 md:w-96 bg-[#382A28] border-l border-[#60433D] p-5 flex flex-col justify-between overflow-y-auto shadow-2xl z-20">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#60433D]">
                <span className="text-xs uppercase tracking-wider text-[#C1A094] font-medium">
                  Unit-Level Event Inspector
                </span>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-[#C1A094] hover:text-[#E8D8CE] text-xs px-2 py-0.5 border border-[#60433D] bg-[#60433D] rounded-xs"
                >
                  Close
                </button>
              </div>

              <div>
                <h3 className="text-base text-[#E8D8CE] font-medium">{selectedNode.data.label || selectedNode.data.title}</h3>
                <span className="text-xs font-mono text-[#916B60]">{selectedNode.data.step || selectedNode.id}</span>
              </div>

              <div className="p-3 bg-[#60433D] border border-[#60433D] rounded-sm space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-[#C1A094]">Machine / Station:</span>
                  <span className="text-[#E8D8CE]">{selectedNode.data.machine || 'Automated Hub'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#C1A094]">Operator Identity:</span>
                  <span className="text-[#E8D8CE]">{selectedNode.data.operator || 'SYSTEM_ROBOTIC'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#C1A094]">Event Execution:</span>
                  <span className="text-[#C1A094]">{selectedNode.data.event || selectedNode.data.batchId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#C1A094]">Inspection Status:</span>
                  <span className={selectedNode.data.isDefective ? 'text-[#F87171] font-bold' : 'text-[#34D399]'}>
                    {selectedNode.data.result || 'Anchored OK'}
                  </span>
                </div>
              </div>

              {selectedNode.data.isDefective && (
                <div className="p-3 bg-[rgba(248,113,113,0.15)] border border-[#F87171]/50 text-xs text-[#F87171] space-y-1 rounded-sm">
                  <div className="flex items-center gap-1.5 font-medium">
                    <AlertTriangle size={14} />
                    <span>Defect Root Cause Registered</span>
                  </div>
                  <p className="text-[11px] text-[#E8D8CE] leading-relaxed">
                    Oven PH-07 thermal variance caused premature crystallization of the optical adhesive (AG-05). All 100 display serials (ABC-0001 to ABC-0100) are flagged.
                  </p>
                </div>
              )}

              <div className="space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-[#C1A094]">Merkle Hash Commitment</span>
                <div className="p-2 bg-[#211B1A] border border-[#60433D] font-mono text-[10px] text-[#C1A094] break-all rounded-xs">
                  0x94bca001e8812cfa09923847529841bb2347890123...
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#60433D] space-y-2">
              <button
                onClick={() => navigate(`/traceability?query=${selectedNode.data.batchId || 'ABC'}`)}
                className="btn-vintage-primary w-full justify-center"
              >
                <span>Forward Trace From Node</span>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
