import React, { useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Position,
  Handle
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  GitFork,
  Activity,
  Layers,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Info,
  Hash,
  Cpu,
  Clock,
  ExternalLink,
  ChevronRight,
  BatteryCharging,
  HeartPulse
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Custom Node for Manufacturing Operations in Vintage Aesthetic
const OperationNode = ({ data }: { data: any }) => {
  const isDefective = data.isDefective;
  const isAssembly = data.section?.includes('Assembly');

  return (
    <div
      className={`px-3 py-2.5 rounded-none border text-xs min-w-[170px] shadow-sm transition-all cursor-pointer font-serif-vintage ${
        isDefective
          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30 rounded-xl border-rose-500/30 text-rose-400'
          : isAssembly
          ? 'bg-[#1c120d]/80 border border-[#d9825b]/20 rounded-2xl border-[#413634] text-white'
          : 'bg-[#140c08]/92 border border-[#d9825b]/25 rounded-3xl border-[#413634] text-white'
      }`}
    >
      <Handle type="target" position={Position.Left} className="bg-[#413634]! w-1.5! h-1.5!" />
      <div className="flex items-center justify-between pb-1 border-b border-[#d9825b]/20">
        <span className="font-mono text-[9px] uppercase tracking-wider text-[#cbb5aa]">{data.step}</span>
        <span
          className={`px-1 py-0.2 rounded-none text-[9px] font-mono ${
            isDefective ? 'bg-[#b84a44] text-white' : 'bg-[#1c120d]/80 border border-[#d9825b]/20 rounded-2xl text-white border border-[#d9825b]/20'
          }`}
        >
          {data.machine}
        </span>
      </div>
      <div className="text-xs mt-1 text-white leading-tight font-normal">{data.label}</div>
      <div className="mt-1 flex items-center justify-between text-[10px] text-[#cbb5aa] font-mono">
        <span>{data.event}</span>
        <span className={data.result === 'OK' ? 'text-emerald-400' : 'text-rose-400'}>{data.result}</span>
      </div>
      <Handle type="source" position={Position.Right} className="bg-[#c5716d]! w-1.5! h-1.5!" />
    </div>
  );
};

// Custom Node for Component Junction in Vintage Aesthetic
const ComponentJunctionNode = ({ data }: { data: any }) => {
  return (
    <div className="px-3.5 py-2.5 rounded-none bg-[#1c120d]/80 border border-[#d9825b]/20 rounded-2xl border border-[#413634] text-xs min-w-[190px] shadow-sm font-serif-vintage">
      <Handle type="target" position={Position.Left} className="bg-[#413634]! w-1.5! h-1.5!" />
      <div className="flex items-center gap-1.5 text-[#f0a887] mb-1">
        <Cpu size={13} />
        <span className="text-xs">{data.title}</span>
      </div>
      <div className="text-[11px] text-[#cbb5aa]">{data.desc}</div>
      <div className="mt-1 text-[10px] font-mono text-[#e89d7b]">Batch: {data.batchId}</div>
      <Handle type="source" position={Position.Right} className="bg-[#413634]! w-1.5! h-1.5!" />
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
    { id: 'e1-2', source: '1.1', target: '1.2', animated: true, style: { stroke: '#413634', strokeWidth: 1 } },
    { id: 'e2-3', source: '1.2', target: '1.3', animated: true, style: { stroke: '#413634', strokeWidth: 1 } },
    { id: 'e3-4', source: '1.3', target: '1.4', animated: true, style: { stroke: '#413634', strokeWidth: 1 } },
    { id: 'e4-5', source: '1.4', target: '1.5', animated: true, style: { stroke: '#b84a44', strokeWidth: 1.5 } },
    { id: 'e5-6', source: '1.5', target: '1.6', animated: true, style: { stroke: '#b84a44', strokeWidth: 1.5 } },
    { id: 'e6-7', source: '1.6', target: '1.7', animated: true, style: { stroke: '#b84a44', strokeWidth: 1.5 } },
    { id: 'e7-8', source: '1.7', target: '1.8', animated: true, style: { stroke: '#b84a44', strokeWidth: 1.5 } },
    { id: 'e8-9', source: '1.8', target: '1.9', animated: true, style: { stroke: '#b84a44', strokeWidth: 1.5 } },
    { id: 'e9-hub', source: '1.9', target: 'hub-display', animated: true, style: { stroke: '#b84a44', strokeWidth: 2 } },
    { id: 'e-disp-asm', source: 'hub-display', target: '3.1', animated: true, style: { stroke: '#b84a44', strokeWidth: 1.5 } },
    { id: 'e-btr-asm', source: 'hub-battery', target: '3.1', style: { stroke: '#8b6c58', strokeWidth: 1 } },
    { id: 'e-pcb-asm', source: 'hub-pcb', target: '3.1', style: { stroke: '#8b6c58', strokeWidth: 1 } },
    { id: 'e31-32', source: '3.1', target: '3.2', animated: true, style: { stroke: '#413634', strokeWidth: 1 } },
    { id: 'e32-33', source: '3.2', target: '3.3', animated: true, style: { stroke: '#413634', strokeWidth: 1 } },
    { id: 'e33-34', source: '3.3', target: '3.4', animated: true, style: { stroke: '#413634', strokeWidth: 1 } },
    { id: 'e34-35', source: '3.4', target: '3.5', animated: true, style: { stroke: '#413634', strokeWidth: 1 } },
    { id: 'e35-36', source: '3.5', target: '3.6', animated: true, style: { stroke: '#413634', strokeWidth: 1 } },
    { id: 'e36-prod', source: '3.6', target: 'product-851', animated: true, style: { stroke: '#c5716d', strokeWidth: 1.5 } },
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
    { id: 'ev-e1', source: 'ev-1', target: 'ev-2', animated: true, style: { stroke: '#413634' } },
    { id: 'ev-e2', source: 'ev-2', target: 'ev-3', animated: true, style: { stroke: '#413634' } },
    { id: 'ev-e3', source: 'ev-3', target: 'ev-4', animated: true, style: { stroke: '#413634' } },
    { id: 'ev-e4', source: 'ev-4', target: 'ev-hub', animated: true, style: { stroke: '#413634' } },
    { id: 'ev-e5', source: 'ev-hub', target: 'ev-5', animated: true, style: { stroke: '#b87428' } },
    { id: 'ev-e6', source: 'ev-5', target: 'ev-6', animated: true, style: { stroke: '#413634' } },
    { id: 'ev-e7', source: 'ev-6', target: 'ev-7', animated: true, style: { stroke: '#413634' } },
    { id: 'ev-e8', source: 'ev-7', target: 'ev-pack', animated: true, style: { stroke: '#2e6b4d', strokeWidth: 1.5 } },
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0 pb-2 border-b border-[#d9825b]/20">
        <div>
          <h1 className="text-xl text-white flex items-center gap-2">
            <GitFork className="text-[#f0a887]" size={20} />
            <span>Manufacturing Lineage Map (Multi-Sector Merkle-DAG)</span>
          </h1>
          <p className="text-xs text-[#cbb5aa]">
            Interactive visual graph of component fabrication and end-product assembly.
          </p>
        </div>

        {/* Workflow Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-0.5 rounded-none bg-[#1c120d]/80 border border-[#d9825b]/20 rounded-2xl border border-[#d9825b]/20 text-xs">
            <button
              onClick={() => switchWorkflow('electronics')}
              className={`px-3 py-1 rounded-none transition-all ${
                activeWorkflow === 'electronics'
                  ? 'bg-[#c5716d] text-[#fffdf6]'
                  : 'text-white hover:text-[#f0a887]'
              }`}
            >
              📱 Display &amp; Mobile Lineage
            </button>
            <button
              onClick={() => switchWorkflow('ev_battery')}
              className={`px-3 py-1 rounded-none transition-all ${
                activeWorkflow === 'ev_battery'
                  ? 'bg-[#c5716d] text-[#fffdf6]'
                  : 'text-white hover:text-[#f0a887]'
              }`}
            >
              🚗 EV Battery Cell-to-Pack
            </button>
          </div>
        </div>
      </div>

      {/* Main Graph Area */}
      <div className="flex-1 border border-[#d9825b]/20 bg-[#160e0a] border border-[#d9825b]/20 rounded-xl relative overflow-hidden flex shadow-xs">
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
            <Background color="#e5e5e5" gap={20} size={1} />
            <Controls className="bg-[#140c08]/92 border border-[#d9825b]/25 rounded-3xl! border-[#d9825b]/20! text-white!" />
            <MiniMap
              nodeColor={node => {
                const d = node.data as any;
                if (d?.isDefective) return '#b84a44';
                if (d?.section?.includes('Assembly')) return '#8b6c58';
                return '#c5716d';
              }}
              className="bg-[#1c120d]/80 border border-[#d9825b]/20 rounded-2xl! border-[#d9825b]/20!"
            />
          </ReactFlow>
        </div>

        {/* Node Detail Inspector Drawer */}
        {selectedNode && (
          <div className="w-80 md:w-96 bg-[#140c08]/92 border border-[#d9825b]/25 rounded-3xl border-l border-[#d9825b]/20 p-5 flex flex-col justify-between overflow-y-auto shadow-md z-20">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#d9825b]/20">
                <span className="text-xs uppercase tracking-wider text-[#f0a887]">
                  Unit-Level Event Inspector
                </span>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-[#cbb5aa] hover:text-white text-xs px-2 py-0.5 border border-[#d9825b]/20 bg-[#1c120d]/80 border border-[#d9825b]/20 rounded-2xl"
                >
                  Close
                </button>
              </div>

              <div>
                <h3 className="text-base text-white">{selectedNode.data.label || selectedNode.data.title}</h3>
                <span className="text-xs font-mono text-[#e89d7b]">{selectedNode.data.step || selectedNode.id}</span>
              </div>

              <div className="p-3 bg-[#1c120d]/80 border border-[#d9825b]/20 rounded-2xl border border-[#d9825b]/20 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-[#cbb5aa]">Machine / Station:</span>
                  <span className="text-white">{selectedNode.data.machine || 'Automated Hub'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#cbb5aa]">Operator Identity:</span>
                  <span className="text-white">{selectedNode.data.operator || 'SYSTEM_ROBOTIC'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#cbb5aa]">Event Execution:</span>
                  <span className="text-[#f0a887]">{selectedNode.data.event || selectedNode.data.batchId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#cbb5aa]">Inspection Status:</span>
                  <span className={selectedNode.data.isDefective ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                    {selectedNode.data.result || 'Anchored OK'}
                  </span>
                </div>
              </div>

              {selectedNode.data.isDefective && (
                <div className="p-3 bg-rose-500/15 text-rose-300 border border-rose-500/30 rounded-xl border border-rose-500/30 text-xs text-rose-400 space-y-1">
                  <div className="flex items-center gap-1.5 font-normal">
                    <AlertTriangle size={14} />
                    <span>Defect Root Cause Registered</span>
                  </div>
                  <p className="text-[11px] text-white leading-relaxed">
                    Oven PH-07 thermal variance caused premature crystallization of the optical adhesive (AG-05). All 100 display serials (ABC-0001 to ABC-0100) are flagged.
                  </p>
                </div>
              )}

              <div className="space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-[#cbb5aa]">Merkle Hash Commitment</span>
                <div className="p-2 bg-[#1c120d]/80 border border-[#d9825b]/20 rounded-2xl border border-[#d9825b]/20 font-mono text-[10px] text-white break-all">
                  0x94bca001e8812cfa09923847529841bb2347890123...
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#d9825b]/20 space-y-2">
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
