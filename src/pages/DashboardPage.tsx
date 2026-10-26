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
    { label: 'Components Registered', value: '24,850', sub: '+1,240 this shift (4 Sectors)', icon: Cpu, color: 'text-[#E2DDE7]', path: '/components' },
    { label: 'Active Batches', value: `${batchCount} Batches`, sub: 'Automotive, Medical, Aero, Mobile', icon: Layers, color: 'text-[#AAA2B3]', path: '/batches' },
    { label: 'Finished Products Tracked', value: '8,420', sub: 'Passports across 4 Industries', icon: Smartphone, color: 'text-[#716879]', path: '/traceability' },
    { label: 'Manufacturing Events', value: '96,350', sub: '100% unit-level logged', icon: Activity, color: 'text-[#86D6A6]', path: '/lineage' },
    { label: 'Shipments in Transit', value: '14 Active', sub: 'Munich Gateway next', icon: Truck, color: 'text-[#E8BC7A]', path: '/logistics' },
    { label: 'Open Quality Alerts', value: '12 Flagged', sub: 'Curing sensor variance', icon: AlertTriangle, color: 'text-[#E8BC7A]', path: '/recalls' },
    { label: 'Active Precision Recalls', value: `${activeRecalls} Case`, sub: 'Batch ABC Display', icon: AlertOctagon, color: 'text-[#F08C8A]', path: '/recalls', highlight: true },
    { label: 'Blockchain Status', value: 'Demo Anchored', sub: 'Block #1849502 verified', icon: Blocks, color: 'text-[#9FBAD8]', path: '/audit' },
  ];

  const sectorDistributionData = [
    { name: 'Consumer Electronics', value: 55, color: '#E2DDE7' },
    { name: 'Automotive & EV Battery', value: 25, color: '#AAA2B3' },
    { name: 'Medical Technology', value: 12, color: '#716879' },
    { name: 'Industrial & Aerospace', value: 8, color: '#45404F' },
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
        <div className="p-4 rounded-none bg-[#2D1C22] border border-[#5A2C35] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#17151C] text-[#F08C8A] border border-[#5A2C35] shrink-0">
              <AlertOctagon size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-normal text-sm text-[#E2DDE7]">Active Precision Recall Notice: Display Batch ABC</span>
                <span className="px-1.5 py-0.2 text-[9px] font-mono uppercase bg-[#F08C8A] text-[#17151C] font-semibold">Critical</span>
              </div>
              <p className="text-xs text-[#AAA2B3] mt-0.5">
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[#45404F]">
        <div>
          <h1 className="text-2xl font-normal tracking-wide text-[#E2DDE7] flex items-center gap-2">
            <span>Manufacturing Lineage Intelligence</span>
          </h1>
          <p className="text-xs text-[#AAA2B3] mt-1">
            Blockchain-Linked Digital Product Passport • Electronics, Automotive &amp; EV Batteries, Medical Devices &amp; Aerospace
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/lineage')}
            className="btn-vintage-primary"
          >
            <Sparkles size={13} className="text-[#17151C]" />
            <span>Interactive Lineage Graph</span>
          </button>
        </div>
      </div>

      {/* Industry Sector Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div
          onClick={() => navigate('/passport/GT-DEV-00000851')}
          className="p-3 bg-[#292531] border border-[#45404F] hover:border-[#AAA2B3] cursor-pointer transition-all flex items-center gap-3 group rounded-none"
        >
          <div className="p-2 bg-[#17151C] text-[#E2DDE7] border border-[#45404F] shrink-0">
            <Smartphone size={16} />
          </div>
          <div>
            <div className="text-xs text-[#E2DDE7]">Consumer Electronics</div>
            <div className="text-[10px] text-[#716879]">Smartphones &amp; Wearables</div>
          </div>
        </div>

        <div
          onClick={() => navigate('/passport/GT-EVB-00094120')}
          className="p-3 bg-[#292531] border border-[#45404F] hover:border-[#AAA2B3] cursor-pointer transition-all flex items-center gap-3 group rounded-none"
        >
          <div className="p-2 bg-[#17151C] text-[#AAA2B3] border border-[#45404F] shrink-0">
            <BatteryCharging size={16} />
          </div>
          <div>
            <div className="text-xs text-[#E2DDE7]">Automotive &amp; EV Battery</div>
            <div className="text-[10px] text-[#716879]">EU Battery DPP 2023/1542</div>
          </div>
        </div>

        <div
          onClick={() => navigate('/passport/GT-MED-00041289')}
          className="p-3 bg-[#292531] border border-[#45404F] hover:border-[#AAA2B3] cursor-pointer transition-all flex items-center gap-3 group rounded-none"
        >
          <div className="p-2 bg-[#17151C] text-[#716879] border border-[#45404F] shrink-0">
            <HeartPulse size={16} />
          </div>
          <div>
            <div className="text-xs text-[#E2DDE7]">Medical Technology</div>
            <div className="text-[10px] text-[#716879]">FDA UDI Class III Sterile</div>
          </div>
        </div>

        <div
          onClick={() => navigate('/passport/GT-AVN-00018902')}
          className="p-3 bg-[#292531] border border-[#45404F] hover:border-[#AAA2B3] cursor-pointer transition-all flex items-center gap-3 group rounded-none"
        >
          <div className="p-2 bg-[#17151C] text-[#AAA2B3] border border-[#45404F] shrink-0">
            <Plane size={16} />
          </div>
          <div>
            <div className="text-xs text-[#E2DDE7]">Aerospace &amp; Avionics</div>
            <div className="text-[10px] text-[#716879]">FAA DO-254 / DO-178C</div>
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
                  ? 'bg-[#2D1C22] border-[#5A2C35] shadow-sm'
                  : 'vintage-card hover:border-[#AAA2B3]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#AAA2B3] truncate">{k.label}</span>
                <Icon className={`w-3.5 h-3.5 ${k.color}`} />
              </div>
              <div className="mt-2 text-lg text-[#E2DDE7] tracking-tight">{k.value}</div>
              <div className="mt-1 flex items-center justify-between text-[11px] text-[#716879]">
                <span className="truncate">{k.sub}</span>
                <ArrowUpRight size={11} className="text-[#AAA2B3]" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Visualizations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Output by Day Chart */}
        <div className="lg:col-span-2 p-5 vintage-card">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#45404F]">
            <div>
              <h2 className="text-sm text-[#E2DDE7]">Daily Manufacturing Unit Output</h2>
              <p className="text-xs text-[#AAA2B3]">Target vs Actual Ledger Verified Units</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-serif-vintage">
              <span className="flex items-center gap-1.5 text-[#716879]">
                <span className="w-2 h-2 bg-[#716879]" /> Target
              </span>
              <span className="flex items-center gap-1.5 text-[#E2DDE7]">
                <span className="w-2 h-2 bg-[#E2DDE7]" /> Verified Output
              </span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={outputData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="lavenderGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#AAA2B3" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#AAA2B3" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 2" stroke="#45404F" />
                <XAxis dataKey="day" stroke="#AAA2B3" fontSize={11} />
                <YAxis stroke="#AAA2B3" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#201D27', borderColor: '#45404F', borderRadius: '0px', fontSize: '12px', color: '#E2DDE7' }}
                />
                <Area type="monotone" dataKey="actual" stroke="#E2DDE7" strokeWidth={1.5} fillOpacity={1} fill="url(#lavenderGrad)" />
                <Area type="monotone" dataKey="target" stroke="#716879" strokeWidth={1} strokeDasharray="3 3" fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Industry Sector Distribution */}
        <div className="p-5 vintage-card flex flex-col justify-between">
          <div className="pb-2 border-b border-[#45404F]">
            <h2 className="text-sm text-[#E2DDE7]">DPP Passports by Industry Sector</h2>
            <p className="text-xs text-[#AAA2B3]">Volume distribution</p>
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
                  contentStyle={{ backgroundColor: '#201D27', borderColor: '#45404F', borderRadius: '0px', fontSize: '12px', color: '#E2DDE7' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            {sectorDistributionData.map(s => (
              <div key={s.name} className="flex items-center gap-1.5 text-[#E2DDE7]">
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
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#45404F]">
            <div>
              <h2 className="text-sm text-[#E2DDE7]">Defect Rate by Manufacturing Operation (%)</h2>
              <p className="text-xs text-[#AAA2B3]">Notice spike at Station 1.5 Adhesive Gluing &amp; 1.7 Curing Oven</p>
            </div>
            <span className="text-[10px] uppercase tracking-wide text-[#F08C8A] bg-[#2D1C22] px-2 py-0.5 border border-[#5A2C35]">
              Anomalous Spike
            </span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={defectData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#45404F" />
                <XAxis dataKey="section" stroke="#AAA2B3" fontSize={10} />
                <YAxis stroke="#AAA2B3" fontSize={11} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#201D27', borderColor: '#45404F', borderRadius: '0px', fontSize: '12px', color: '#E2DDE7' }}
                />
                <Bar dataKey="rate" radius={[0, 0, 0, 0]}>
                  {defectData.map((entry, index) => (
                    <Cell
                      key={`bar-${index}`}
                      fill={entry.rate > 1.0 ? '#F08C8A' : entry.rate > 0.4 ? '#E8BC7A' : '#AAA2B3'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-5 vintage-card">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#45404F]">
            <div>
              <h2 className="text-sm text-[#E2DDE7]">Activity Stream</h2>
              <p className="text-xs text-[#AAA2B3]">Immutable ledger events</p>
            </div>
            <Clock size={14} className="text-[#716879]" />
          </div>

          <div className="space-y-2.5">
            {recentEvents.map(e => (
              <div key={e.id} className="p-2.5 bg-[#292531] border border-[#45404F] text-xs">
                <div className="flex items-center justify-between text-[#E2DDE7]">
                  <span className="truncate">{e.title}</span>
                  <span className="text-[10px] text-[#AAA2B3] shrink-0 font-mono">{e.time}</span>
                </div>
                <div className="flex items-center justify-between mt-1 text-[11px]">
                  <span className="font-mono text-[#716879] truncate">{e.entity}</span>
                  <span
                    className={`px-1.5 py-0.2 text-[9px] uppercase font-mono ${
                      e.status === 'Active' || e.status === 'Flagged'
                        ? 'bg-[#2D1C22] text-[#F08C8A] border border-[#5A2C35]'
                        : 'bg-[#1B2D22] text-[#86D6A6] border border-[#2D543B]'
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
