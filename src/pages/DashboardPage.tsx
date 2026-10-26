import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertOctagon,
  Wrench,
  Building2,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Clock,
  Layers,
  MapPin,
  Truck,
  FileText
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { GeneaTraceStore } from '../services/dataStore';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const store = GeneaTraceStore.getState();

  // Defect metrics: Pre-dispatch (factory/testing) vs Post-dispatch (retail/shops)
  const shopReports = GeneaTraceStore.getDefectReports();
  const totalShopDefectsCount = shopReports.length;

  // In testing before dispatching: quality alerts, factory event inspection failures
  const preDispatchDefectsCount = 12; // Factory QC testing failures detected on stations
  // Post-dispatch: from retail shops & service centers across the country
  const postDispatchDefectsCount = totalShopDefectsCount; // Reports from shops
  const totalDefectsReported = preDispatchDefectsCount + postDispatchDefectsCount;

  // Simple defect breakdown chart data
  const defectBreakdownData = [
    {
      stage: 'Pre-Dispatch (Testing)',
      count: preDispatchDefectsCount,
      desc: 'Detected during factory stress & automated optical inspection before leaving plant'
    },
    {
      stage: 'Post-Dispatch (Shop / Retail)',
      count: postDispatchDefectsCount,
      desc: 'Reported by shopkeepers & service centers after shipping to market'
    }
  ];

  return (
    <div className="space-y-6 font-serif-vintage max-w-5xl mx-auto">
      {/* Clean Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-[#e5e5e5]">
        <div>
          <h1 className="text-2xl font-normal text-[#413634]">
            Manufacturing Quality &amp; Defect Overview
          </h1>
          <p className="text-xs text-[#666666] mt-0.5">
            Clean monitoring of manufacturing defects detected in testing vs. issues reported by retail shops.
          </p>
        </div>

        <div className="flex items-center gap-2">
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
        </div>
      </div>

      {/* 3 Core Metric Cards: Clear & Not Clumsy */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Defects */}
        <div className="p-5 vintage-card bg-[#fffcf8] space-y-2 border-t-2 border-t-[#413634]">
          <span className="text-xs uppercase tracking-wider text-[#666666] block">
            Total Defects Reported
          </span>
          <div className="text-3xl text-[#413634] font-normal">
            {totalDefectsReported} Units
          </div>
          <p className="text-[11px] text-[#666666] pt-1 border-t border-[#e5e5e5]">
            Combined pre-dispatch testing variances + nationwide retail shop incidents.
          </p>
        </div>

        {/* Defects in Testing (Before Dispatching) */}
        <div className="p-5 vintage-card bg-[#fffcf8] space-y-2 border-t-2 border-t-[#b87428]">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-[#666666] block">
              In Testing (Before Dispatch)
            </span>
            <span className="text-[10px] px-1.5 py-0.2 bg-[#fef7ec] text-[#b87428] border border-[#b87428]">
              Factory QC
            </span>
          </div>
          <div className="text-3xl text-[#b87428] font-normal">
            {preDispatchDefectsCount} Defects
          </div>
          <p className="text-[11px] text-[#666666] pt-1 border-t border-[#e5e5e5]">
            Flagged on factory testing lines (curing oven variance, optical inspection).
          </p>
        </div>

        {/* Defects Reported After Dispatching (From Shops) */}
        <div className="p-5 vintage-card bg-[#fffcf8] space-y-2 border-t-2 border-t-[#b84a44]">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-[#666666] block">
              Reported After Dispatch
            </span>
            <span className="text-[10px] px-1.5 py-0.2 bg-[#fdf2f1] text-[#b84a44] border border-[#b84a44]">
              Retail / Shops
            </span>
          </div>
          <div className="text-3xl text-[#b84a44] font-normal">
            {postDispatchDefectsCount} Incidents
          </div>
          <p className="text-[11px] text-[#666666] pt-1 border-t border-[#e5e5e5]">
            Logged directly by shopkeepers &amp; authorized service technicians nationwide.
          </p>
        </div>
      </div>

      {/* Visual Comparison: Pre-Dispatch Testing vs Post-Dispatch Shops */}
      <div className="p-6 vintage-card bg-[#fffcf8] space-y-4">
        <div className="border-b border-[#e5e5e5] pb-2 flex items-center justify-between">
          <div>
            <h2 className="text-base text-[#413634] font-medium">
              Defects In Testing vs After Dispatching Breakdown
            </h2>
            <p className="text-xs text-[#666666]">
              Clear distinction between factory-stage catch vs in-field customer reports.
            </p>
          </div>
          <span className="text-[11px] font-mono text-[#c5716d]">
            Total {totalDefectsReported} Tracked Issues
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Pre-Dispatch Box */}
          <div className="p-4 bg-[#faf3dc] border border-[#e5e5e5] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-[#413634] text-xs">
                1. Testing &amp; Pre-Dispatch Stage
              </span>
              <span className="text-sm font-mono font-bold text-[#b87428]">
                {preDispatchDefectsCount} units
              </span>
            </div>
            <p className="text-[11px] text-[#666666] leading-relaxed">
              Caught by internal automated sensors and optical QC scanners before palletization. Quarantined in plant warehouse so they never reach consumers.
            </p>
            <div className="text-[10px] text-[#8b6c58] pt-1">
              Primary Root Cause: Oven thermal profile variation on adhesive line (Station 1.5).
            </div>
          </div>

          {/* Post-Dispatch Box */}
          <div className="p-4 bg-[#faf3dc] border border-[#e5e5e5] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-[#413634] text-xs">
                2. After Dispatch (Shopkeeper Reports)
              </span>
              <span className="text-sm font-mono font-bold text-[#b84a44]">
                {postDispatchDefectsCount} units
              </span>
            </div>
            <p className="text-[11px] text-[#666666] leading-relaxed">
              Reported in real-time by retail service centers across states. These trigger batch correlation to stop selling across all sister shipments.
            </p>
            <div className="text-[10px] text-[#c5716d] pt-1">
              Primary Symptom: Display flickering and green lines on Batch ABC serials.
            </div>
          </div>
        </div>

        {/* Simple Bar Chart */}
        <div className="h-44 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={defectBreakdownData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="2 2" stroke="#e5e5e5" horizontal={false} />
              <XAxis type="number" stroke="#666666" fontSize={11} />
              <YAxis dataKey="stage" type="category" stroke="#413634" fontSize={11} width={160} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fffdf6', borderColor: '#413634', borderRadius: '0px', fontSize: '12px', color: '#413634' }}
              />
              <Bar dataKey="count" fill="#c5716d" barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Navigation to Action Spaces */}
      <div className="p-4 vintage-card-secondary flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-[#413634]">
          <Building2 size={16} className="text-[#c5716d]" />
          <span>
            Need to see which shops reported defects, trace which batch it came from, and locate all sister mobiles?
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/company-defects')}
            className="btn-vintage-accent text-xs flex items-center gap-1"
          >
            <span>Open Corporate Defect Hub</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
