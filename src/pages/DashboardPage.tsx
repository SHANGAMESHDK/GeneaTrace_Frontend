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
    { label: 'Components Registered', value: '24,850', sub: '+1,240 this shift (4 Sectors)', icon: Cpu, color: 'text-[#54ACBF]', path: '/components' },
    { label: 'Active Batches', value: `${batchCount} Batches`, sub: 'Automotive, Medical, Aero, Mobile', icon: Layers, color: 'text-[#54ACBF]', path: '/batches' },
    { label: 'Finished Products Tracked', value: '8,420', sub: 'Passports across 4 Industries', icon: Smartphone, color: 'text-[#54ACBF]', path: '/traceability' },
    { label: 'Manufacturing Events', value: '96,350', sub: '100% unit-level logged', icon: Activity, color: 'text-[#34D399]', path: '/lineage' },
    { label: 'Shipments in Transit', value: '14 Active', sub: 'Munich Gateway next', icon: Truck, color: 'text-[#FBBF24]', path: '/logistics' },
    { label: 'Open Quality Alerts', value: '12 Flagged', sub: 'Curing sensor variance', icon: AlertTriangle, color: 'text-[#FBBF24]', path: '/recalls' },
    { label: 'Active Precision Recalls', value: `${activeRecalls} Case`, sub: 'Batch ABC Display', icon: AlertOctagon, color: 'text-[#F87171]', path: '/recalls', highlight: true },
    { label: 'Blockchain Status', value: 'Demo Anchored', sub: 'Block #1849502 verified', icon: Blocks, color: 'text-[#54ACBF]', path: '/audit' },
  ];

  const sectorDistributionData = [
    { name: 'Consumer Electronics', value: 55, color: '#A7EBF2' },
    { name: 'Automotive & EV Battery', value: 25, color: '#54ACBF' },
    { name: 'Medical Technology', value: 12, color: '#26658C' },
    { name: 'Industrial & Aerospace', value: 8, color: '#073451' },
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
    { section: 'EV Tab Weld', rate: 0.22 },
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
        <div className="p-4 rounded-sm bg-[rgba(248,113,113,0.12)] border border-[#F87171]/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#062B49] text-[#F87171] border border-[#F87171]/50 shrink-0 rounded-sm">
              <AlertOctagon size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-normal text-sm text-[#D9F5F7]">Active Precision Recall Notice: Display Batch ABC</span>
                <span className="px-1.5 py-0.2 text-[9px] font-mono uppercase bg-[#F87171] text-[#011C40] font-semibold rounded-xs">
                  Critical
                </span>
              </div>
              <p className="text-xs text-[#86BFCF] mt-0.5">
                {store.recallCase.unitsInBatch} units flagged. Merkle-DAG isolates {flaggedProductsCount || 87} finished units across 14 shipments.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end md:self-center">
            <button
              onClick={() => navigate('/recalls')}
              className="px-3.5 py-1.5 text-xs rounded-sm bg-[#F87171] text-[#011C40] font-semibold hover:bg-[#fca5a5] transition-colors flex items-center gap-1.5"
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[#155477]">
        <div>
          <h1 className="text-2xl font-normal tracking-wide text-[#D9F5F7] flex items-center gap-2">
            <span>Manufacturing Lineage Intelligence</span>
          </h1>
          <p className="text-xs text-[#86BFCF] mt-1">
            Blockchain-Linked Digital Product Passport • Electronics, Automotive &amp; EV Batteries, Medical Devices &amp; Aerospace
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/lineage')}
            className="btn-vintage-primary shadow-sm"
          >
            <Sparkles size={13} className="text-[#011C40]" />
            <span>Interactive Lineage Graph</span>
          </button>
        </div>
      </div>

      {/* Industry Sector Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div
          onClick={() => navigate('/passport/GT-DEV-00000851')}
          className="p-3 bg-[#062B49] border border-[#155477] hover:border-[#54ACBF] cursor-pointer transition-all flex items-center gap-3 group rounded-sm"
        >
          <div className="p-2 bg-[#073451] text-[#A7EBF2] border border-[#155477] shrink-0 rounded-sm">
            <Smartphone size={16} />
          </div>
          <div>
            <div className="text-xs text-[#D9F5F7] font-medium">Consumer Electronics</div>
            <div className="text-[10px] text-[#86BFCF]">Smartphones &amp; Wearables</div>
          </div>
        </div>

        <div
          onClick={() => navigate('/passport/GT-EVB-00094120')}
          className="p-3 bg-[#062B49] border border-[#155477] hover:border-[#54ACBF] cursor-pointer transition-all flex items-center gap-3 group rounded-sm"
        >
          <div className="p-2 bg-[#073451] text-[#54ACBF] border border-[#155477] shrink-0 rounded-sm">
            <BatteryCharging size={16} />
          </div>
          <div>
            <div className="text-xs text-[#D9F5F7] font-medium">Automotive &amp; EV Battery</div>
            <div className="text-[10px] text-[#86BFCF]">EU Battery DPP 2023/1542</div>
          </div>
        </div>

        <div
          onClick={() => navigate('/passport/GT-MED-00041289')}
          className="p-3 bg-[#062B49] border border-[#155477] hover:border-[#54ACBF] cursor-pointer transition-all flex items-center gap-3 group rounded-sm"
        >
          <div className="p-2 bg-[#073451] text-[#34D399] border border-[#155477] shrink-0 rounded-sm">
            <HeartPulse size={16} />
          </div>
          <div>
            <div className="text-xs text-[#D9F5F7] font-medium">Medical Technology</div>
            <div className="text-[10px] text-[#86BFCF]">FDA UDI Class III Sterile</div>
          </div>
        </div>

        <div
          onClick={() => navigate('/passport/GT-AVN-00018902')}
          className="p-3 bg-[#062B49] border border-[#155477] hover:border-[#54ACBF] cursor-pointer transition-all flex items-center gap-3 group rounded-sm"
        >
          <div className="p-2 bg-[#073451] text-[#26658C] border border-[#155477] shrink-0 rounded-sm">
            <Plane size={16} />
          </div>
          <div>
            <div className="text-xs text-[#D9F5F7] font-medium">Aerospace &amp; Avionics</div>
            <div className="text-[10px] text-[#86BFCF]">FAA DO-254 / DO-178C</div>
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
              className={`p-4 rounded-sm cursor-pointer transition-all border ${
                k.highlight
                  ? 'bg-[rgba(248,113,113,0.12)] border-[#F87171]/50 shadow-sm'
                  : 'bg-[#062B49] border-[#155477] hover:border-[#54ACBF]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#86BFCF] truncate">{k.label}</span>
                <div className="p-1.5 bg-[#073451] border border-[#155477] rounded-sm">
                  <Icon className={`w-3.5 h-3.5 ${k.color}`} />
                </div>
              </div>
              <div className="mt-2 text-lg text-[#A7EBF2] font-semibold tracking-tight">{k.value}</div>
              <div className="mt-1 flex items-center justify-between text-[11px] text-[#86BFCF]">
                <span className="truncate">{k.sub}</span>
                <ArrowUpRight size={11} className="text-[#54ACBF]" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Visualizations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Output by Day Chart */}
        <div className="lg:col-span-2 p-5 vintage-card">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#155477]">
            <div>
              <h2 className="text-sm font-medium text-[#D9F5F7]">Daily Manufacturing Unit Output</h2>
              <p className="text-xs text-[#86BFCF]">Target vs Actual Ledger Verified Units</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-serif-vintage">
              <span className="flex items-center gap-1.5 text-[#86BFCF]">
                <span className="w-2 h-2 rounded-xs bg-[#54ACBF]" /> Target
              </span>
              <span className="flex items-center gap-1.5 text-[#A7EBF2]">
                <span className="w-2 h-2 rounded-xs bg-[#A7EBF2]" /> Verified Output
              </span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={outputData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="cyanOceanGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A7EBF2" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#A7EBF2" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 2" stroke="#155477" />
                <XAxis dataKey="day" stroke="#86BFCF" fontSize={11} />
                <YAxis stroke="#86BFCF" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#062B49',
                    borderColor: '#155477',
                    borderRadius: '2px',
                    fontSize: '12px',
                    color: '#D9F5F7',
                    boxShadow: '0 4px 16px rgba(1, 28, 64, 0.4)'
                  }}
                />
                <Area type="monotone" dataKey="actual" stroke="#A7EBF2" strokeWidth={1.8} fillOpacity={1} fill="url(#cyanOceanGrad)" />
                <Area type="monotone" dataKey="target" stroke="#54ACBF" strokeWidth={1.2} strokeDasharray="3 3" fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Industry Sector Distribution */}
        <div className="p-5 vintage-card flex flex-col justify-between">
          <div className="pb-2 border-b border-[#155477]">
            <h2 className="text-sm font-medium text-[#D9F5F7]">DPP Passports by Industry Sector</h2>
            <p className="text-xs text-[#86BFCF]">Volume distribution</p>
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
                  contentStyle={{
                    backgroundColor: '#062B49',
                    borderColor: '#155477',
                    borderRadius: '2px',
                    fontSize: '12px',
                    color: '#D9F5F7'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            {sectorDistributionData.map(s => (
              <div key={s.name} className="flex items-center gap-1.5 text-[#D9F5F7]">
                <span className="w-2 h-2 shrink-0 rounded-xs" style={{ backgroundColor: s.color }} />
                <span className="truncate">{s.name} ({s.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Defect Rate by Section & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 vintage-card">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#155477]">
            <div>
              <h2 className="text-sm font-medium text-[#D9F5F7]">Defect Rate by Manufacturing Operation (%)</h2>
              <p className="text-xs text-[#86BFCF]">Notice spike at Station 1.5 Adhesive Gluing &amp; 1.7 Curing Oven</p>
            </div>
            <span className="text-[10px] uppercase tracking-wide text-[#F87171] bg-[rgba(248,113,113,0.15)] px-2 py-0.5 border border-[#F87171]/40 rounded-xs">
              Anomalous Spike
            </span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={defectData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#155477" />
                <XAxis dataKey="section" stroke="#86BFCF" fontSize={10} />
                <YAxis stroke="#86BFCF" fontSize={11} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#062B49',
                    borderColor: '#155477',
                    borderRadius: '2px',
                    fontSize: '12px',
                    color: '#D9F5F7'
                  }}
                />
                <Bar dataKey="rate" radius={[2, 2, 0, 0]}>
                  {defectData.map((entry, index) => (
                    <Cell
                      key={`bar-${index}`}
                      fill={entry.rate > 1.0 ? '#F87171' : entry.rate > 0.4 ? '#FBBF24' : '#54ACBF'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-5 vintage-card">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#155477]">
            <div>
              <h2 className="text-sm font-medium text-[#D9F5F7]">Activity Stream</h2>
              <p className="text-xs text-[#86BFCF]">Immutable ledger events</p>
            </div>
            <Clock size={14} className="text-[#54ACBF]" />
          </div>

          <div className="space-y-2.5">
            {recentEvents.map(e => (
              <div key={e.id} className="p-2.5 bg-[#073451] border border-[#155477] text-xs rounded-sm">
                <div className="flex items-center justify-between text-[#D9F5F7]">
                  <span className="truncate font-medium">{e.title}</span>
                  <span className="text-[10px] text-[#86BFCF] shrink-0 font-mono">{e.time}</span>
                </div>
                <div className="flex items-center justify-between mt-1 text-[11px]">
                  <span className="font-mono text-[#86BFCF] truncate">{e.entity}</span>
                  <span
                    className={`px-1.5 py-0.2 text-[9px] uppercase font-mono rounded-xs ${
                      e.status === 'Active' || e.status === 'Flagged'
                        ? 'bg-[rgba(248,113,113,0.18)] text-[#F87171] border border-[#F87171]/40'
                        : 'bg-[rgba(52,211,153,0.18)] text-[#34D399] border border-[#34D399]/40'
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
