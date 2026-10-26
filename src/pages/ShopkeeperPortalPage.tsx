import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wrench,
  ShieldCheck,
  AlertOctagon,
  Search,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Smartphone,
  Layers,
  Calendar,
  Building2,
  MapPin,
  FileText,
  Clock,
  Send,
  HelpCircle
} from 'lucide-react';
import { GeneaTraceStore } from '../services/dataStore';
import { ShopkeeperDefectReport } from '../types';

export const ShopkeeperPortalPage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = GeneaTraceStore.getCurrentUser();
  const isShopkeeper = currentUser.role === 'shopkeeper';

  const [serialInput, setSerialInput] = useState('');
  const [problemCategory, setProblemCategory] = useState<ShopkeeperDefectReport['problemCategory']>('Screen & Display');
  const [problemDescription, setProblemDescription] = useState('');
  const [suspectedCause, setSuspectedCause] = useState('');
  const [severity, setSeverity] = useState<ShopkeeperDefectReport['severity']>('Critical Failure');
  const [shopName, setShopName] = useState(currentUser.shopName || 'iFix Retail & Service Hub - Indiranagar');
  const [location, setLocation] = useState(currentUser.city || 'Bangalore, Karnataka');
  const [state, setState] = useState(currentUser.state || 'Karnataka');

  const [submittedReport, setSubmittedReport] = useState<ShopkeeperDefectReport | null>(null);
  const [autofillNotice, setAutofillNotice] = useState<string>('');
  const [matchedBatchInfo, setMatchedBatchInfo] = useState<{ batchId?: string; mfgDate?: string; model?: string } | null>(null);

  // Existing reports from this technician/shop
  const reports = GeneaTraceStore.getDefectReports();

  // Quick serial suggestions for easy testing
  const demoSerials = [
    { serial: 'GT-DEV-00000851', label: 'Galaxy S24 Ultra (Display Batch ABC defect)' },
    { serial: 'GT-DEV-00000853', label: 'Galaxy S24 Ultra (Sister unit from Batch ABC)' },
    { serial: 'GT-DEV-00000856', label: 'Galaxy S24 Ultra (Batch ABC unboxed in Delhi)' },
    { serial: 'GT-DEV-00000860', label: 'Galaxy S24 Ultra (Retail In Transit Unit)' },
  ];

  const handleSelectSerial = (s: string) => {
    setSerialInput(s);
    // Auto-probe DPP database
    const product = GeneaTraceStore.getProduct(s);
    if (product) {
      const displaySerial = product.installedComponents['Display Module'] || Object.values(product.installedComponents)[0];
      const comp = displaySerial ? GeneaTraceStore.getComponentBySerial(displaySerial) : undefined;
      const bId = comp?.batchId || displaySerial?.split('-')[0] || 'ABC';
      setMatchedBatchInfo({
        batchId: bId,
        mfgDate: comp?.mfgDate || product.assemblyDate,
        model: product.productModel
      });
      setAutofillNotice(`Verified unit in Digital Product Passport: ${product.productModel}. Linked to Batch ${bId}.`);
    } else {
      setMatchedBatchInfo(null);
      setAutofillNotice('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serialInput.trim() || !problemDescription.trim() || !suspectedCause.trim()) {
      alert('Please fill in Serial/IMEI, Problem Description, and Suspected Cause.');
      return;
    }

    const res = GeneaTraceStore.submitShopkeeperDefectReport({
      serialNumber: serialInput.trim(),
      productModel: matchedBatchInfo?.model,
      shopName,
      location,
      state,
      problemCategory,
      problemDescription,
      suspectedCause,
      severity
    });

    setSubmittedReport(res.report);
    // Clear form inputs
    setSerialInput('');
    setProblemDescription('');
    setSuspectedCause('');
    setMatchedBatchInfo(null);
    setAutofillNotice('');

    // Trigger update event
    window.dispatchEvent(new Event('defectReportSubmitted'));
  };

  return (
    <div className="space-y-6 font-serif-vintage">
      {/* Top Header & Role Indicator */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-[#e5e5e5]">
        <div>
          <div className="flex items-center gap-2">
            <Wrench className="text-[#c5716d]" size={22} />
            <h1 className="text-2xl font-normal text-[#413634]">
              Authorized Service &amp; Retail Shop Incident Portal
            </h1>
            <span className="px-2 py-0.5 text-[11px] bg-[#faf3dc] border border-[#e5e5e5] text-[#c5716d]">
              Write-Only Access
            </span>
          </div>
          <p className="text-xs text-[#666666] mt-1">
            Strict Service Technician entry: log manufacturing defects, hardware failures, and suspected root causes directly to corporate QA.
          </p>
        </div>

        {/* Security / Write-Only Badge */}
        <div className="flex items-center gap-2 p-2 bg-[#fffcf8] border border-[#e5e5e5] text-xs">
          <div className="w-2 h-2 rounded-full bg-[#2e6b4d] animate-pulse" />
          <div>
            <div className="text-[11px] text-[#413634] font-medium flex items-center gap-1">
              <Lock size={12} className="text-[#2e6b4d]" />
              <span>Immutable Ledger Mode</span>
            </div>
            <div className="text-[10px] text-[#666666]">
              Reports cannot be overwritten or deleted once submitted.
            </div>
          </div>
        </div>
      </div>

      {/* Role Notice Banner */}
      {!isShopkeeper && (
        <div className="p-3 bg-[#faf3dc] border border-[#e5e5e5] flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-[#413634]">
            <HelpCircle size={16} className="text-[#c5716d] shrink-0" />
            <span>
              You are currently viewing this page with role <strong>Lead QA Architect</strong>. Switch to <strong>Authorized Service Technician</strong> to experience the locked, write-only service technician interface.
            </span>
          </div>
          <button
            onClick={() => {
              GeneaTraceStore.switchUserRole('shopkeeper');
              window.location.reload();
            }}
            className="btn-vintage-primary shrink-0 text-xs"
          >
            Switch to Service Technician Role
          </button>
        </div>
      )}

      {/* Main Layout: Left Entry Form, Right Instructions & Recent Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Defect Submission Form */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 vintage-card bg-[#fffcf8] space-y-5">
            <div className="border-b border-[#e5e5e5] pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-lg text-[#413634] flex items-center gap-2">
                  <Smartphone size={18} className="text-[#c5716d]" />
                  <span>Log Defective Piece Incident</span>
                </h2>
                <p className="text-xs text-[#666666]">
                  Enter device identity, customer issue, and your technical inspection hypothesis.
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-[#faf3dc] text-[#666666] border border-[#e5e5e5]">
                STRICT APPEND-ONLY
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Quick Select Presets */}
              <div className="p-3 bg-[#faf3dc] border border-[#e5e5e5] space-y-2">
                <span className="text-[11px] text-[#666666] uppercase tracking-wider block">
                  Quick-Fill Verified Device Serials:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {demoSerials.map(s => (
                    <button
                      key={s.serial}
                      type="button"
                      onClick={() => handleSelectSerial(s.serial)}
                      className={`px-2 py-1 text-[11px] border transition-all ${
                        serialInput === s.serial
                          ? 'bg-[#c5716d] text-[#fffdf6] border-[#c5716d]'
                          : 'bg-[#fffdf6] text-[#413634] border-[#e5e5e5] hover:border-[#413634]'
                      }`}
                      title={s.label}
                    >
                      {s.serial}
                    </button>
                  ))}
                </div>
              </div>

              {/* 1. Device Serial / IMEI */}
              <div>
                <label className="block text-[#413634] font-medium mb-1">
                  1. Device Serial Number / IMEI / Passport ID <span className="text-[#c5716d]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={serialInput}
                    onChange={e => handleSelectSerial(e.target.value)}
                    placeholder="e.g. GT-DEV-00000851 or IMEI / UDI"
                    className="w-full px-3 py-2 bg-[#fffdf6] border border-[#e5e5e5] text-xs text-[#413634] font-mono placeholder-[#8b6c58]/60 focus:outline-none focus:border-[#413634]"
                  />
                </div>
                {autofillNotice && (
                  <div className="mt-1.5 text-[11px] text-[#2e6b4d] flex items-center gap-1.5">
                    <CheckCircle2 size={13} />
                    <span>{autofillNotice}</span>
                  </div>
                )}
              </div>

              {/* Matched Batch Card if found */}
              {matchedBatchInfo && (
                <div className="p-3 bg-[#faf3dc] border border-[#e5e5e5] grid grid-cols-3 gap-2 text-[11px]">
                  <div>
                    <span className="text-[#666666] block">Model Detected:</span>
                    <strong className="text-[#413634]">{matchedBatchInfo.model}</strong>
                  </div>
                  <div>
                    <span className="text-[#666666] block">Batch ID:</span>
                    <strong className="text-[#c5716d] font-mono">{matchedBatchInfo.batchId}</strong>
                  </div>
                  <div>
                    <span className="text-[#666666] block">Production Date:</span>
                    <strong className="text-[#413634] font-mono">{matchedBatchInfo.mfgDate}</strong>
                  </div>
                </div>
              )}

              {/* 2. Shop Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#413634] font-medium mb-1">
                    Shop / Service Center Name
                  </label>
                  <input
                    type="text"
                    value={shopName}
                    onChange={e => setShopName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#fffdf6] border border-[#e5e5e5] text-xs text-[#413634] focus:outline-none focus:border-[#413634]"
                  />
                </div>
                <div>
                  <label className="block text-[#413634] font-medium mb-1">
                    Location &amp; State
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      placeholder="City"
                      className="px-2 py-1.5 bg-[#fffdf6] border border-[#e5e5e5] text-xs text-[#413634] focus:outline-none focus:border-[#413634]"
                    />
                    <input
                      type="text"
                      value={state}
                      onChange={e => setState(e.target.value)}
                      placeholder="State"
                      className="px-2 py-1.5 bg-[#fffdf6] border border-[#e5e5e5] text-xs text-[#413634] focus:outline-none focus:border-[#413634]"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Problem Category & Severity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#413634] font-medium mb-1">
                    Defect Subsystem / Category <span className="text-[#c5716d]">*</span>
                  </label>
                  <select
                    value={problemCategory}
                    onChange={e => setProblemCategory(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-[#fffdf6] border border-[#e5e5e5] text-xs text-[#413634] focus:outline-none focus:border-[#413634]"
                  >
                    <option value="Screen & Display">Screen &amp; Display (Flicker, Lines, Delamination)</option>
                    <option value="Battery & Charging">Battery &amp; Charging (Swelling, Thermal Variance)</option>
                    <option value="Camera & Sensor">Camera &amp; Sensor (OIS Calibration, Lens Blur)</option>
                    <option value="Logic Board / Power">Logic Board / Power (Short Circuit, SMT Fault)</option>
                    <option value="Housing / Assembly">Housing / Assembly (Gap Variance, Adhesive)</option>
                    <option value="Other">Other Manufacturing Issue</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#413634] font-medium mb-1">
                    Observed Severity
                  </label>
                  <select
                    value={severity}
                    onChange={e => setSeverity(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-[#fffdf6] border border-[#e5e5e5] text-xs text-[#413634] focus:outline-none focus:border-[#413634]"
                  >
                    <option value="Critical Failure">Critical Failure (Device Inoperable / Safety Risk)</option>
                    <option value="Moderate">Moderate (Component Functional Anomaly)</option>
                    <option value="Minor">Minor (Cosmetic / Low Impact)</option>
                  </select>
                </div>
              </div>

              {/* 4. What Problem It Has */}
              <div>
                <label className="block text-[#413634] font-medium mb-1">
                  2. What Problem It Has (Customer &amp; Visual Symptoms) <span className="text-[#c5716d]">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={problemDescription}
                  onChange={e => setProblemDescription(e.target.value)}
                  placeholder="Describe in detail what the user experienced, e.g. 'Display panel exhibits green lines, horizontal flicker, touch digitizer unresponsive around center...'"
                  className="w-full p-2.5 bg-[#fffdf6] border border-[#e5e5e5] text-xs text-[#413634] placeholder-[#8b6c58]/60 focus:outline-none focus:border-[#413634]"
                />
              </div>

              {/* 5. Suspected Cause for the Defect */}
              <div>
                <label className="block text-[#413634] font-medium mb-1">
                  3. Suspected Cause for the Defect (Technician Hypothesis) <span className="text-[#c5716d]">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={suspectedCause}
                  onChange={e => setSuspectedCause(e.target.value)}
                  placeholder="e.g. 'Suspected adhesive layer micro-delamination during factory curing process or defective polarizer bonding from manufacturing batch.'"
                  className="w-full p-2.5 bg-[#fffdf6] border border-[#e5e5e5] text-xs text-[#413634] placeholder-[#8b6c58]/60 focus:outline-none focus:border-[#413634]"
                />
              </div>

              {/* Submission Button */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-[#666666] flex items-center gap-1">
                  <ShieldCheck size={14} className="text-[#2e6b4d]" />
                  <span>Anchored as Immutable Record upon submission</span>
                </span>
                <button
                  type="submit"
                  className="btn-vintage-accent flex items-center gap-2 px-5 py-2"
                >
                  <Send size={13} />
                  <span>Submit Defect Incident to Company HQ</span>
                </button>
              </div>
            </form>
          </div>

          {/* Success Banner if recently submitted */}
          {submittedReport && (
            <div className="p-4 bg-[#edf6f0] border border-[#2e6b4d] space-y-2">
              <div className="flex items-center gap-2 text-[#2e6b4d] font-medium text-sm">
                <CheckCircle2 size={16} />
                <span>Incident #{submittedReport.id} Successfully Dispatched to Company HQ!</span>
              </div>
              <p className="text-xs text-[#413634]">
                Serial <strong className="font-mono">{submittedReport.serialNumber}</strong> has been logged to the company defect command center. Corporate QA will now correlate this against manufacturing batch history and sister shipments.
              </p>
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => navigate('/company-defects')}
                  className="btn-vintage-primary text-xs"
                >
                  View Corporate Defect Hub
                </button>
                <button
                  onClick={() => setSubmittedReport(null)}
                  className="btn-vintage-outline text-xs"
                >
                  Log Another Defect
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Service Technician Guidelines & Submitted Stream */}
        <div className="lg:col-span-5 space-y-4">
          {/* Rules & Permissions Card */}
          <div className="p-4 vintage-card-secondary space-y-3">
            <h3 className="text-sm text-[#413634] font-medium flex items-center gap-2">
              <Lock size={14} className="text-[#c5716d]" />
              <span>Service Technician Role Privileges</span>
            </h3>
            <ul className="text-xs text-[#666666] space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-[#2e6b4d] font-bold">✓</span>
                <span><strong>Write-Only Permissions:</strong> You can enter new defect incident reports for any mobile phone or device serial.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#b84a44] font-bold">✕</span>
                <span><strong>No Overwrite or Deletion:</strong> Technicians cannot edit, alter, or delete previous incident submissions.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#2e6b4d] font-bold">✓</span>
                <span><strong>Automated HQ Notification:</strong> Once entered, the central company dashboard immediately correlates the batch and alerts quality engineers.</span>
              </li>
            </ul>
          </div>

          {/* History of Reports Submitted from this Shop */}
          <div className="p-4 vintage-card space-y-3">
            <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-2">
              <h3 className="text-sm text-[#413634] flex items-center gap-2">
                <FileText size={15} className="text-[#c5716d]" />
                <span>Shop Submissions Log ({reports.length})</span>
              </h3>
              <span className="text-[10px] text-[#666666]">Read-Only Historical Stream</span>
            </div>

            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {reports.map(rep => (
                <div
                  key={rep.id}
                  className="p-3 bg-[#faf3dc] border border-[#e5e5e5] text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[#c5716d] font-medium">{rep.id}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 border ${
                      rep.status === 'Batch Hold Issued'
                        ? 'bg-[#fdf2f1] text-[#b84a44] border-[#b84a44]'
                        : rep.status === 'Investigating'
                        ? 'bg-[#fef7ec] text-[#b87428] border-[#b87428]'
                        : 'bg-[#edf6f0] text-[#2e6b4d] border-[#2e6b4d]'
                    }`}>
                      {rep.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono text-[#413634]">{rep.serialNumber}</span>
                    <span className="text-[#666666]">{rep.problemCategory}</span>
                  </div>

                  <p className="text-[11px] text-[#666666] line-clamp-2">
                    {rep.problemDescription}
                  </p>

                  <div className="pt-1 flex items-center justify-between text-[10px] text-[#8b6c58] border-t border-[#e5e5e5]">
                    <span>{rep.shopName}</span>
                    <span className="font-mono">{rep.reportedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
