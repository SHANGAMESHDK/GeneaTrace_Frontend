import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Cpu,
  Layers,
  Smartphone,
  Activity,
  Truck,
  AlertTriangle,
  ShieldAlert,
  Blocks,
  ArrowUpRight,
  CheckCircle2,
  AlertOctagon,
  Clock,
  Sparkles,
  BatteryCharging,
  HeartPulse,
  Plane
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
    { label: 'Components Registered', value: '24,850', sub: '+1,240 this shift (4 Sectors)', icon: Cpu, color: 'text-cyan-400', path: '/components' },
    { label: 'Active Batches', value: `${batchCount} Batches`, sub: 'Automotive, Medical, Aero, Mobile', icon: Layers, color: 'text-blue-400', path: '/batches' },
    { label: 'Finished Products Tracked', value: '8,420', sub: 'Passports across 4 Industries', icon: Smartphone, color: 'text-indigo-400', path: '/traceability' },
    { label: 'Manufacturing Events', value: '96,350', sub: '100% unit-level logged', icon: Activity, color: 'text-emerald-400', path: '/lineage' },
    { label: 'Shipments in Transit', value: '14 Active', sub: 'Munich Gateway next', icon: Truck, color: 'text-amber-400', path: '/logistics' },
    { label: 'Open Quality Alerts', value: '12 Flagged', sub: 'Curing sensor variance', icon: AlertTriangle, color: 'text-orange-400', path: '/recalls' },
    { label: 'Active Precision Recalls', value: `${activeRecalls} Case`, sub: 'Batch ABC Display', icon: AlertOctagon, color: 'text-red-400', path: '/recalls', highlight: true },
    { label: 'Blockchain Status', value: 'Demo Anchored', sub: 'Block #1849502 verified', icon: Blocks, color: 'text-violet-400', path: '/audit' },
  ];

  const sectorDistributionData = [
    { name: 'Consumer Electronics', value: 55, color: '#06b6d4' },
    { name: 'Automotive & EV Battery', value: 25, color: '#f59e0b' },
    { name: 'Medical Technology', value: 12, color: '#10b981' },
    { name: 'Industrial & Aerospace', value: 8, color: '#6366f1' },
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
    <div className="space-y-6">
      {/* Top Banner Alert for Defective Batch */}
      {store.recallCase.status !== 'Resolved' && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg shadow-red-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">
              <AlertOctagon size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-red-200">Active High-Priority Recall Alert: Display Batch ABC</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500 text-white uppercase">Critical</span>
              </div>
              <p className="text-xs text-red-300/80 mt-0.5">
                {store.recallCase.unitsInBatch} total units flagged. Merkle-DAG trace reveals {flaggedProductsCount || 87} finished units across 14 shipments.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end md:self-center">
            <button
              onClick={() => navigate('/recalls')}
              className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-md transition-colors flex items-center gap-1.5"
            >
              <span>View Recall Center</span>
              <ArrowUpRight size={14} />
            </button>
            <button
              onClick={() => navigate('/traceability?query=ABC')}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-200 font-medium transition-colors"
            >
              Forward Trace Batch ABC
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Unified Industrial DPP Intelligence</span>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Multi-Sector Operations
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Blockchain-Linked Digital Product Passport • Electronics, Automotive &amp; EV Batteries, Medical Devices &amp; Aerospace
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/lineage')}
            className="px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-cyan-600/20 transition-all"
          >
            <Sparkles size={14} />
            <span>Multi-Sector Lineage Graph</span>
          </button>
        </div>
      </div>

      {/* Industry Sector Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div
          onClick={() => navigate('/passport/GT-DEV-00000851')}
          className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all flex items-center gap-3 group"
        >
          <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-110 transition-transform">
            <Smartphone size={18} />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Consumer Electronics</div>
            <div className="text-[10px] text-slate-400 font-mono">Smartphones &amp; Wearables</div>
          </div>
        </div>

        <div
          onClick={() => navigate('/passport/GT-EVB-00094120')}
          className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all flex items-center gap-3 group"
        >
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
            <BatteryCharging size={18} />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Automotive &amp; EV Battery</div>
            <div className="text-[10px] text-amber-400 font-mono">EU Battery DPP 2023/1542</div>
          </div>
        </div>

        <div
          onClick={() => navigate('/passport/GT-MED-00041289')}
          className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all flex items-center gap-3 group"
        >
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
            <HeartPulse size={18} />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Medical Technology</div>
            <div className="text-[10px] text-emerald-400 font-mono">FDA UDI Class III Sterile</div>
          </div>
        </div>

        <div
          onClick={() => navigate('/passport/GT-AVN-00018902')}
          className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-all flex items-center gap-3 group"
        >
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
            <Plane size={18} />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Aerospace &amp; Avionics</div>
            <div className="text-[10px] text-indigo-400 font-mono">FAA DO-254 / DO-178C</div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((k, idx) => {
          const Icon = k.icon;
          return (
            <div
              key={idx}
              onClick={() => navigate(k.path)}
              className={`p-4 rounded-xl cursor-pointer transition-all duration-200 group ${
                k.highlight
                  ? 'bg-red-950/20 border border-red-500/30 hover:border-red-500/60 hover:shadow-lg hover:shadow-red-950/30'
                  : 'bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400 truncate">{k.label}</span>
                <Icon className={`w-4 h-4 ${k.color} group-hover:scale-110 transition-transform`} />
              </div>
              <div className="mt-2 text-xl font-bold text-white tracking-tight">{k.value}</div>
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span className="truncate">{k.sub}</span>
                <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Visualizations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Output by Day Chart */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Daily Manufacturing Unit Output</h2>
              <p className="text-xs text-slate-400">Target vs Actual Cryptographically Committed Units</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-600" /> Target
              </span>
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500" /> Verified Output
              </span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={outputData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="actual" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#cyanGrad)" />
                <Area type="monotone" dataKey="target" stroke="#64748b" strokeWidth={1} strokeDasharray="4 4" fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Industry Sector Distribution */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">DPP Passports by Industry Sector</h2>
            <p className="text-xs text-slate-400">Cross-industry volume distribution</p>
          </div>
          <div className="h-52 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sectorDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {sectorDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
            {sectorDistributionData.map(s => (
              <div key={s.name} className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                <span className="truncate">{s.name} ({s.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Defect Rate by Section & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Defect Rate by Manufacturing Operation (%)</h2>
              <p className="text-xs text-slate-400">Notice spike at Station 1.5 Adhesive Gluing &amp; 1.7 Curing Oven</p>
            </div>
            <span className="text-xs font-mono text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/30">
              Anomalous Spike
            </span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={defectData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="section" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={11} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                  {defectData.map((entry, index) => (
                    <Cell
                      key={`bar-${index}`}
                      fill={entry.rate > 1.0 ? '#ef4444' : entry.rate > 0.4 ? '#f59e0b' : '#0284c7'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Cross-Industry Activity Stream</h2>
              <p className="text-xs text-slate-400">Immutable ledger events</p>
            </div>
            <Clock size={15} className="text-slate-400" />
          </div>

          <div className="space-y-3">
            {recentEvents.map(e => (
              <div key={e.id} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs">
                <div className="flex items-center justify-between text-slate-300 font-medium">
                  <span className="truncate">{e.title}</span>
                  <span className="text-[10px] text-slate-500 font-mono shrink-0">{e.time}</span>
                </div>
                <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                  <span className="font-mono text-cyan-400/80 truncate">{e.entity}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                      e.status === 'Active' || e.status === 'Flagged'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-emerald-500/20 text-emerald-400'
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
