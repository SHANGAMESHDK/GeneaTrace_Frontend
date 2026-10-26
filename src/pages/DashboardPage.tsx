import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Cpu,
  Layers,
  Smartphone,
  Activity,
  Truck,
  AlertTriangle,
  Blocks,
  ArrowUpRight,
  AlertOctagon,
  Clock,
  Sparkles,
  BatteryCharging,
  HeartPulse,
  Plane,
  Wrench,
  Building2,
  ShieldCheck,
  Send
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';
import { GeneaTraceStore } from '../services/dataStore';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const store = GeneaTraceStore.getState();

  const batchCount = store.batches.length;
  const activeRecalls = store.recallCase.status !== 'Resolved' ? 1 : 0;
  const flaggedProductsCount = store.products.filter(p => p.status === 'Recall Flagged').length;

  const kpis = [
    { label: 'Components Registered', value: '24,850', sub: '+1,240 this shift (4 Sectors)', icon: Cpu, color: 'text-[#c5716d]', path: '/components' },
    { label: 'Active Batches', value: `${batchCount} Batches`, sub: 'Automotive, Medical, Aero, Mobile', icon: Layers, color: 'text-[#49627d]', path: '/batches' },
    { label: 'Finished Products Tracked', value: '8,420', sub: 'Passports across 4 Industries', icon: Smartphone, color: 'text-[#8b6c58]', path: '/traceability' },
    { label: 'Manufacturing Events', value: '96,350', sub: '100% unit-level logged', icon: Activity, color: 'text-[#2e6b4d]', path: '/lineage' },
    { label: 'Shipments in Transit', value: '14 Active', sub: 'Munich Gateway next', icon: Truck, color: 'text-[#b87428]', path: '/logistics' },
    { label: 'Open Quality Alerts', value: '12 Flagged', sub: 'Curing sensor variance', icon: AlertTriangle, color: 'text-[#b87428]', path: '/recalls' },
    { label: 'Active Precision Recalls', value: `${activeRecalls} Case`, sub: 'Batch ABC Display', icon: AlertOctagon, color: 'text-[#b84a44]', path: '/recalls', highlight: true },
    { label: 'Blockchain Status', value: 'Demo Anchored', sub: 'Block #1849502 verified', icon: Blocks, color: 'text-[#49627d]', path: '/audit' },
  ];

  const sectorDistributionData = [
    { name: 'Consumer Electronics', value: 55, color: '#c5716d' },
    { name: 'Automotive & EV Battery', value: 25, color: '#b87428' },
    { name: 'Medical Technology', value: 12, color: '#2e6b4d' },
    { name: 'Industrial & Aerospace', value: 8, color: '#49627d' },
  ];

  const outputData = [
    { day: 'Mon', target: 1200, actual: 1180 },
    { day: 'Tue', target: 1200, actual: 1240 },
    { day: 'Wed', target: 1200, actual: 1210 },
    { day: 'Thu', target: 1200, actual: 1195 },
    { day: 'Fri', target: 1200, actual: 1310 },
    { day: 'Sat', target: 900, actual: 920 },
    { day: 'Sun', target: 800, actual: 810 },
  ];

  const defectData = [
    { section: '1.2 Glass Cut', rate: 0.12 },
    { section: '1.3 TFT Dep', rate: 0.28 },
    { section: '1.4 Polarizer', rate: 0.45 },
    { section: '1.5 Adhesive Gluing', rate: 2.85 },
    { section: '1.7 Curing Oven', rate: 1.95 },
    { section: 'EV Ultrasonic Weld', rate: 0.22 },
    { section: 'Med Laser Weld', rate: 0.05 },
    { section: 'Aero Conformal', rate: 0.10 },
  ];

  const recentEvents = [
    { id: '1', title: 'Precision Recall Active: Batch ABC', entity: 'Display Module (100 units)', time: '14 mins ago', type: 'recall', status: 'Active' },
    { id: '2', title: 'EU Battery Passport 2023/1542 Anchored', entity: 'GT-EVB-00094120 (800V EV Pack)', time: '22 mins ago', type: 'passport', status: 'Verified' },
    { id: '3', title: 'Transit Scan Checkpoint 4 Verified', entity: 'Shipment GT-SHP-00000326', time: '38 mins ago', type: 'logistics', status: 'Completed' },
    { id: '4', title: 'FDA UDI Class III Direct Mark Passed', entity: 'GT-MED-00041289 (Cardiac Implant)', time: '1 hr ago', type: 'medical', status: 'Verified' },
    { id: '5', title: 'Curing Oven PH-07 Sensor Audit', entity: 'Machine Station PH-07', time: '2 hrs ago', type: 'quality', status: 'Flagged' },
  ];

  return (
    <div className="space-y-6 font-serif-vintage">
      {/* Top Banner Alert for Defective Batch */}
      {store.recallCase.status !== 'Resolved' && (
        <div className="p-4 rounded-none bg-[#fdf2f1] border border-[#b84a44] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#fffdf6] text-[#b84a44] border border-[#b84a44] shrink-0">
              <AlertOctagon size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-normal text-sm text-[#413634]">Active Precision Recall Notice: Display Batch ABC</span>
                <span className="px-1.5 py-0.2 text-[9px] font-mono uppercase bg-[#b84a44] text-white">Critical</span>
              </div>
              <p className="text-xs text-[#666666] mt-0.5">
                {store.recallCase.unitsInBatch} units flagged. Merkle-DAG isolates {flaggedProductsCount || 87} finished units across 14 shipments.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end md:self-center">
            <button
              onClick={() => navigate('/recalls')}
              className="btn-vintage-accent"
            >
              <span>View Recall Center</span>
              <ArrowUpRight size={13} />
            </button>
            <button
              onClick={() => navigate('/traceability?query=ABC')}
              className="btn-vintage-outline"
            >
              Trace Batch ABC
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[#e5e5e5]">
        <div>
          <h1 className="text-2xl font-normal tracking-wide text-[#413634] flex items-center gap-2">
            <span>Manufacturing Lineage Intelligence</span>
          </h1>
          <p className="text-xs text-[#666666] mt-1">
            Blockchain-Linked Digital Product Passport • Shopkeeper Incident Ingestion, Defect Matching &amp; Batch Quarantine
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/shop-portal')}
            className="btn-vintage-outline text-xs flex items-center gap-1.5"
          >
            <Wrench size={13} className="text-[#c5716d]" />
            <span>Shopkeeper Entry</span>
          </button>
          <button
            onClick={() => navigate('/company-defects')}
            className="btn-vintage-accent text-xs flex items-center gap-1.5"
          >
            <Building2 size={13} />
            <span>Corporate Defect Hub</span>
          </button>
          <button
            onClick={() => navigate('/lineage')}
            className="btn-vintage-primary text-xs"
          >
            <Sparkles size={13} className="text-[#c5716d]" />
            <span>Lineage Graph</span>
          </button>
        </div>
      </div>

      {/* Two Pillars Workflow Banner: Shopkeeper Incident -> Company Batch Quarantine */}
      <div className="p-4 vintage-card bg-[#faf3dc] border border-[#413634] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="p-3 bg-[#fffdf6] border border-[#e5e5e5] space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium text-[#413634] flex items-center gap-1.5">
              <Wrench size={15} className="text-[#c5716d]" />
              <span>Pillar 1: Shopkeeper &amp; Service Center Portal</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.2 bg-[#faf3dc] text-[#c5716d] border border-[#c5716d]/30">
              Write-Only Access
            </span>
          </div>
          <p className="text-[#666666] text-[11px] leading-relaxed">
            When a device arrives with an issue, the technician enters the <strong>Serial / IMEI</strong>, <strong>symptoms</strong>, and <strong>suspected cause</strong>. Data is append-only and cannot be altered or overwritten.
          </p>
          <button
            onClick={() => navigate('/shop-portal')}
            className="text-[#c5716d] hover:underline font-mono text-[11px] flex items-center gap-1 pt-1"
          >
            <span>Open Technician Entry Form →</span>
          </button>
        </div>

        <div className="p-3 bg-[#fffdf6] border border-[#e5e5e5] space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium text-[#413634] flex items-center gap-1.5">
              <Building2 size={15} className="text-[#2e6b4d]" />
              <span>Pillar 2: Corporate Defect Correlator &amp; Hold Dispatch</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.2 bg-[#edf6f0] text-[#2e6b4d] border border-[#2e6b4d]/30">
              HQ Command Space
            </span>
          </div>
          <p className="text-[#666666] text-[11px] leading-relaxed">
            Corporate QA views nationwide incident reports, checks for <strong>similar defect matches</strong>, identifies the exact <strong>manufacturing batch &amp; date</strong>, and tracks <strong>where all sister mobiles are located</strong> to issue stop-sale holds.
          </p>
          <button
            onClick={() => navigate('/company-defects')}
            className="text-[#2e6b4d] hover:underline font-mono text-[11px] flex items-center gap-1 pt-1"
          >
            <span>Open Company Defect Space →</span>
          </button>
        </div>
      </div>

      {/* Industry Sector Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div
          onClick={() => navigate('/passport/GT-DEV-00000851')}
          className="p-3 bg-[#faf3dc] border border-[#e5e5e5] hover:border-[#413634] cursor-pointer transition-all flex items-center gap-3 group rounded-none"
        >
          <div className="p-2 bg-[#fffdf6] text-[#c5716d] border border-[#e5e5e5] shrink-0">
            <Smartphone size={16} />
          </div>
          <div>
            <div className="text-xs text-[#413634]">Consumer Electronics</div>
            <div className="text-[10px] text-[#8b6c58]">Smartphones &amp; Wearables</div>
          </div>
        </div>

        <div
          onClick={() => navigate('/passport/GT-EVB-00094120')}
          className="p-3 bg-[#faf3dc] border border-[#e5e5e5] hover:border-[#413634] cursor-pointer transition-all flex items-center gap-3 group rounded-none"
        >
          <div className="p-2 bg-[#fffdf6] text-[#b87428] border border-[#e5e5e5] shrink-0">
            <BatteryCharging size={16} />
          </div>
          <div>
            <div className="text-xs text-[#413634]">Automotive &amp; EV Battery</div>
            <div className="text-[10px] text-[#8b6c58]">EU Battery DPP 2023/1542</div>
          </div>
        </div>

        <div
          onClick={() => navigate('/passport/GT-MED-00041289')}
          className="p-3 bg-[#faf3dc] border border-[#e5e5e5] hover:border-[#413634] cursor-pointer transition-all flex items-center gap-3 group rounded-none"
        >
          <div className="p-2 bg-[#fffdf6] text-[#2e6b4d] border border-[#e5e5e5] shrink-0">
            <HeartPulse size={16} />
          </div>
          <div>
            <div className="text-xs text-[#413634]">Medical Technology</div>
            <div className="text-[10px] text-[#8b6c58]">FDA UDI Class III Sterile</div>
          </div>
        </div>

        <div
          onClick={() => navigate('/passport/GT-AVN-00018902')}
          className="p-3 bg-[#faf3dc] border border-[#e5e5e5] hover:border-[#413634] cursor-pointer transition-all flex items-center gap-3 group rounded-none"
        >
          <div className="p-2 bg-[#fffdf6] text-[#49627d] border border-[#e5e5e5] shrink-0">
            <Plane size={16} />
          </div>
          <div>
            <div className="text-xs text-[#413634]">Aerospace &amp; Avionics</div>
            <div className="text-[10px] text-[#8b6c58]">FAA DO-254 / DO-178C</div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map((k, idx) => {
          const Icon = k.icon;
          return (
            <div
              key={idx}
              onClick={() => navigate(k.path)}
              className={`p-4 rounded-none cursor-pointer transition-all border ${
                k.highlight
                  ? 'bg-[#fdf2f1] border-[#b84a44] shadow-sm'
                  : 'vintage-card hover:border-[#413634]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#666666] truncate">{k.label}</span>
                <Icon className={`w-3.5 h-3.5 ${k.color}`} />
              </div>
              <div className="mt-2 text-lg text-[#413634] tracking-tight">{k.value}</div>
              <div className="mt-1 flex items-center justify-between text-[11px] text-[#8b6c58]">
                <span className="truncate">{k.sub}</span>
                <ArrowUpRight size={11} className="text-[#666666]" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Visualizations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Output by Day Chart */}
        <div className="lg:col-span-2 p-5 vintage-card">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#e5e5e5]">
            <div>
              <h2 className="text-sm text-[#413634]">Daily Manufacturing Unit Output</h2>
              <p className="text-xs text-[#666666]">Target vs Actual Ledger Verified Units</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-serif-vintage">
              <span className="flex items-center gap-1.5 text-[#666666]">
                <span className="w-2 h-2 bg-[#8b6c58]" /> Target
              </span>
              <span className="flex items-center gap-1.5 text-[#c5716d]">
                <span className="w-2 h-2 bg-[#c5716d]" /> Verified Output
              </span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={outputData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="roseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c5716d" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#c5716d" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 2" stroke="#e5e5e5" />
                <XAxis dataKey="day" stroke="#666666" fontSize={11} />
                <YAxis stroke="#666666" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fffdf6', borderColor: '#413634', borderRadius: '0px', fontSize: '12px', color: '#413634' }}
                />
                <Area type="monotone" dataKey="actual" stroke="#c5716d" strokeWidth={1.5} fillOpacity={1} fill="url(#roseGrad)" />
                <Area type="monotone" dataKey="target" stroke="#8b6c58" strokeWidth={1} strokeDasharray="3 3" fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Industry Sector Distribution */}
        <div className="p-5 vintage-card flex flex-col justify-between">
          <div className="pb-2 border-b border-[#e5e5e5]">
            <h2 className="text-sm text-[#413634]">DPP Passports by Industry Sector</h2>
            <p className="text-xs text-[#666666]">Volume distribution</p>
          </div>
          <div className="h-52 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sectorDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {sectorDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#fffdf6', borderColor: '#413634', borderRadius: '0px', fontSize: '12px', color: '#413634' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            {sectorDistributionData.map(s => (
              <div key={s.name} className="flex items-center gap-1.5 text-[#413634]">
                <span className="w-2 h-2 shrink-0 rounded-none" style={{ backgroundColor: s.color }} />
                <span className="truncate">{s.name} ({s.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Defect Rate by Section & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 vintage-card">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#e5e5e5]">
            <div>
              <h2 className="text-sm text-[#413634]">Defect Rate by Manufacturing Operation (%)</h2>
              <p className="text-xs text-[#666666]">Notice spike at Station 1.5 Adhesive Gluing &amp; 1.7 Curing Oven</p>
            </div>
            <span className="text-[10px] uppercase tracking-wide text-[#b84a44] bg-[#fdf2f1] px-2 py-0.5 border border-[#b84a44]/30">
              Anomalous Spike
            </span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={defectData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#e5e5e5" />
                <XAxis dataKey="section" stroke="#666666" fontSize={10} />
                <YAxis stroke="#666666" fontSize={11} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fffdf6', borderColor: '#413634', borderRadius: '0px', fontSize: '12px', color: '#413634' }}
                />
                <Bar dataKey="rate" radius={[0, 0, 0, 0]}>
                  {defectData.map((entry, index) => (
                    <Cell
                      key={`bar-${index}`}
                      fill={entry.rate > 1.0 ? '#b84a44' : entry.rate > 0.4 ? '#b87428' : '#c5716d'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-5 vintage-card">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#e5e5e5]">
            <div>
              <h2 className="text-sm text-[#413634]">Activity Stream</h2>
              <p className="text-xs text-[#666666]">Immutable ledger events</p>
            </div>
            <Clock size={14} className="text-[#8b6c58]" />
          </div>

          <div className="space-y-2.5">
            {recentEvents.map(e => (
              <div key={e.id} className="p-2.5 bg-[#faf3dc] border border-[#e5e5e5] text-xs">
                <div className="flex items-center justify-between text-[#413634]">
                  <span className="truncate">{e.title}</span>
                  <span className="text-[10px] text-[#666666] shrink-0 font-mono">{e.time}</span>
                </div>
                <div className="flex items-center justify-between mt-1 text-[11px]">
                  <span className="font-mono text-[#8b6c58] truncate">{e.entity}</span>
                  <span
                    className={`px-1.5 py-0.2 text-[9px] uppercase font-mono ${
                      e.status === 'Active' || e.status === 'Flagged'
                        ? 'bg-[#fdf2f1] text-[#b84a44] border border-[#b84a44]/30'
                        : 'bg-[#edf6f0] text-[#2e6b4d] border border-[#2e6b4d]/30'
                    }`}
                  >
                    {e.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
