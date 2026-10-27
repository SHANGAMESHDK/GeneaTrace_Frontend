import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  HelpCircle,
  ShoppingBag,
  RotateCcw,
  CheckCircle,
  Truck,
  UserCheck,
  ExternalLink,
  ScanLine,
  Barcode,
  QrCode,
  Camera,
  AlertTriangle,
  Info
} from 'lucide-react';
import { GeneaTraceStore } from '../services/dataStore';
import { ShopkeeperDefectReport } from '../types';
import { BarcodeScannerModal } from '../components/shopkeeper/BarcodeScannerModal';

export const ShopkeeperPortalPage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = GeneaTraceStore.getCurrentUser();
  const isShopkeeper = currentUser.role === 'shopkeeper';

  const [activeTab, setActiveTab] = useState<'sales' | 'defect' | 'redelivery'>('sales');

  // Scanner modal state
  const [scannerTarget, setScannerTarget] = useState<'sale' | 'defect' | null>(null);

  // Customer Sale State (Step 9)
  const [saleSerial, setSaleSerial] = useState('AAA12345678');
  const [customerName, setCustomerName] = useState('Vikram Malhotra');
  const [customerPhone, setCustomerPhone] = useState('+91 98765 43210');
  const [invoiceNo, setInvoiceNo] = useState('INV-BLR-2026-8812');
  const [saleSuccessMessage, setSaleSuccessMessage] = useState('');

  // Defect Report State (Steps 10 & 11)
  const [serialInput, setSerialInput] = useState('AAA12345678');
  const [problemCategory, setProblemCategory] = useState<ShopkeeperDefectReport['problemCategory']>('Screen & Display');
  const [problemDescription, setProblemDescription] = useState('Customer returned device: Screen flickering and persistent vertical green line post-unboxing.');
  const [suspectedCause, setSuspectedCause] = useState('Batch AAA display adhesive curing thermal variance during Machine DISP-04 stage.');
  const [severity, setSeverity] = useState<ShopkeeperDefectReport['severity']>('Critical Failure');
  const [shopName, setShopName] = useState(currentUser.shopName || 'Apex Retail & Service Hub - Indiranagar');
  const [location, setLocation] = useState(currentUser.city || 'Bangalore, Karnataka');
  const [state, setState] = useState(currentUser.state || 'Karnataka');

  const [submittedReport, setSubmittedReport] = useState<ShopkeeperDefectReport | null>(null);
  const [redeliverySuccess, setRedeliverySuccess] = useState(false);

  const product = GeneaTraceStore.getProduct(saleSerial) || GeneaTraceStore.getProduct('AAA12345678')!;
  const reports = GeneaTraceStore.getDefectReports();

  // 1. Submit Customer Sale (Step 9)
  const handleRegisterSale = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      GeneaTraceStore.registerCustomerSale(saleSerial, {
        customerName,
        phone: customerPhone,
        invoiceNo,
        retailerShop: shopName
      });
      setSaleSuccessMessage(`Customer sale successfully registered for ${customerName} (${saleSerial}). Digital Product Passport updated to 'Sold to Customer'.`);
      setTimeout(() => setSaleSuccessMessage(''), 6000);
    } catch (err: any) {
      alert(err.message || 'Error registering sale');
    }
  };

  // 2. Submit Defect & RMA Return to Factory (Steps 10 & 11)
  const handleDefectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serialInput.trim() || !problemDescription.trim() || !suspectedCause.trim()) {
      alert('Please fill in Serial/IMEI, Problem Description, and Suspected Cause.');
      return;
    }

    const res = GeneaTraceStore.recordCustomerIssueAndRma(serialInput.trim(), {
      description: problemDescription,
      category: problemCategory,
      severity
    });

    setSubmittedReport(res.report);
  };

  // 3. Complete Customer Re-Delivery (Step 15)
  const handleCompleteRedelivery = () => {
    GeneaTraceStore.completeRecallAndRedelivery('AAA12345678');
    setRedeliverySuccess(true);
    setTimeout(() => setRedeliverySuccess(false), 6000);
  };

  // Handle scanned value from camera or barcode simulation
  const handleBarcodeScanned = (scannedCode: string) => {
    if (scannerTarget === 'sale') {
      setSaleSerial(scannedCode);
    } else if (scannerTarget === 'defect') {
      setSerialInput(scannedCode);
    }
    setScannerTarget(null);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* ─────────────────────────────────────────────────────────────
          TOP HEADER & SHOPKEEPER TERMINAL BADGE
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#e89d7b] to-[#b85d38] flex items-center justify-center text-[#120a07] font-bold shadow-md shadow-[#b85d38]/20">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold tracking-tight text-white flex items-center gap-2.5">
                <span>Retailer Operations &amp; Customer Incident Hub</span>
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Retail Terminal Active</span>
                </span>
                <span className="text-xs text-[#a69489]">
                  Authorized Hub: <strong className="text-[#f7d5c5]">{shopName}</strong>
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs text-[#cbb5aa] mt-2 max-w-2xl">
            Customer sales registration, real-time box QR &amp; barcode scanning, RMA defect logging with manufacturer return, and recall replacement delivery.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/passport/AAA12345678')}
            className="px-3.5 py-2 rounded-xl bg-[#1c120d]/80 hover:bg-[#251812] text-[#f7d5c5] text-xs font-semibold flex items-center gap-1.5 transition-colors border border-[#d9825b]/30 cursor-pointer shadow-sm"
          >
            <ExternalLink size={13} />
            <span>Inspect Passport (AAA12345678)</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3-STEP RETAIL LIFECYCLE TABS
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-[#140c08]/90 backdrop-blur-md rounded-2xl border border-[#d9825b]/25 max-w-2xl shadow-inner">
        <button
          onClick={() => setActiveTab('sales')}
          className={`flex-1 min-w-[170px] py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'sales'
              ? 'bg-gradient-to-r from-[#d9825b] to-[#b85d38] text-white shadow-md shadow-[#b85d38]/30 font-bold'
              : 'text-[#cbb5aa] hover:text-white hover:bg-white/5'
          }`}
        >
          <ShoppingBag size={15} />
          <span>1. Customer Sale (Step 9)</span>
        </button>

        <button
          onClick={() => setActiveTab('defect')}
          className={`flex-1 min-w-[170px] py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'defect'
              ? 'bg-gradient-to-r from-rose-700 to-rose-800 text-white shadow-md shadow-rose-900/40 font-bold'
              : 'text-[#cbb5aa] hover:text-white hover:bg-white/5'
          }`}
        >
          <RotateCcw size={15} />
          <span>2. Defect RMA (Steps 10-11)</span>
        </button>

        <button
          onClick={() => setActiveTab('redelivery')}
          className={`flex-1 min-w-[170px] py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'redelivery'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-900/40 font-bold'
              : 'text-[#cbb5aa] hover:text-white hover:bg-white/5'
          }`}
        >
          <UserCheck size={15} />
          <span>3. Customer Handover (Step 15)</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: CUSTOMER SALE REGISTRATION WITH BARCODE/QR SCANNER
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'sales' && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          {/* Left: Registration Form */}
          <div className="lg:col-span-7 bg-[#140c08]/85 backdrop-blur-md p-6 rounded-3xl border border-[#d9825b]/25 shadow-[0_15px_40px_rgba(0,0,0,0.6)] space-y-5">
            <div>
              <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                <ShoppingBag className="text-[#e89d7b]" size={20} />
                <span>Customer Selling Details Registration (Retail Login)</span>
              </h2>
              <p className="text-xs text-[#cbb5aa] mt-1">
                Record end-consumer ownership upon delivery at the retail store. Scan the product box QR or barcode to bind the customer to the blockchain serial container.
              </p>
            </div>

            {saleSuccessMessage && (
              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-200 flex items-center gap-3">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                <span>{saleSuccessMessage}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSale} className="space-y-4">
              {/* Serial Input with QR / Barcode Scanner Action Button */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#f7d5c5]">Device Cryptographic Serial Number</label>
                  <span className="text-[10px] text-[#cbb5aa] font-mono">Scan Box Barcode or Phone QR</span>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={saleSerial}
                      onChange={e => setSaleSerial(e.target.value)}
                      placeholder="e.g. AAA12345678 or GT-DEV-00000851"
                      className="w-full pl-3.5 pr-10 py-2.5 bg-[#120a07] border border-[#d9825b]/30 rounded-xl text-xs font-mono font-bold text-white placeholder-neutral-500 focus:outline-none focus:border-[#e89d7b] focus:ring-1 focus:ring-[#e89d7b]/40"
                    />
                    <button
                      type="button"
                      onClick={() => setScannerTarget('sale')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-[#e89d7b] hover:text-white hover:bg-[#d9825b]/20 transition-all cursor-pointer"
                      title="Open Barcode & QR Scanner"
                    >
                      <ScanLine size={16} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setScannerTarget('sale')}
                    className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#d9825b] to-[#b85d38] hover:from-[#e89d7b] hover:to-[#c67651] text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-[#b85d38]/20 transition-all cursor-pointer shrink-0"
                  >
                    <Camera size={14} />
                    <span>Scan QR / Barcode</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#f7d5c5] mb-1">Customer Full Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#120a07] border border-[#d9825b]/30 rounded-xl text-xs text-white focus:outline-none focus:border-[#e89d7b] focus:ring-1 focus:ring-[#e89d7b]/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#f7d5c5] mb-1">Customer Phone Number</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#120a07] border border-[#d9825b]/30 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#e89d7b] focus:ring-1 focus:ring-[#e89d7b]/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#f7d5c5] mb-1">Retail Invoice Number</label>
                  <input
                    type="text"
                    value={invoiceNo}
                    onChange={e => setInvoiceNo(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#120a07] border border-[#d9825b]/30 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#e89d7b] focus:ring-1 focus:ring-[#e89d7b]/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#f7d5c5] mb-1">Retail Center</label>
                  <input
                    type="text"
                    disabled
                    value={shopName}
                    className="w-full px-3.5 py-2.5 bg-[#1c120d] border border-white/10 rounded-xl text-xs text-[#cbb5aa]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#d9825b] to-[#b85d38] hover:from-[#e89d7b] hover:to-[#c67651] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#b85d38]/30 transition-all cursor-pointer"
              >
                <CheckCircle size={15} />
                <span>Upload Selling Details to Passport (Mark as Sold)</span>
              </button>
            </form>
          </div>

          {/* Right: Real-Time Passport Status Preview */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#140c08]/80 backdrop-blur-md p-5 rounded-3xl border border-[#d9825b]/20 space-y-3 shadow-md">
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#e89d7b]">Current Passport Status</span>
              <div className="p-4 bg-[#1c120d]/80 rounded-2xl border border-[#d9825b]/20 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-white font-serif">{product.productModel}</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#e89d7b]/15 text-[#f7d5c5] border border-[#d9825b]/30 font-mono text-[10px]">
                    {product.customerSale?.status || 'In Stock'}
                  </span>
                </div>
                <p className="text-[11px] text-[#cbb5aa] font-mono">Serial: <span className="text-[#f7d5c5] font-bold">{product.productId}</span></p>
                {product.customerSale && (
                  <div className="pt-2.5 border-t border-white/10 text-xs space-y-1.5 text-[#cbb5aa]">
                    <p><strong className="text-white">Customer:</strong> {product.customerSale.customerName}</p>
                    <p><strong className="text-white">Phone:</strong> {product.customerSale.phone}</p>
                    <p><strong className="text-white">Invoice:</strong> {product.customerSale.invoiceNo}</p>
                    <p><strong className="text-white">Date:</strong> {product.customerSale.saleDate}</p>
                  </div>
                )}
              </div>

              {/* Quick Barcode helper hint */}
              <div className="p-3.5 rounded-2xl bg-[#1c120d]/60 border border-white/5 flex items-start gap-2.5 text-xs text-[#cbb5aa]">
                <QrCode size={16} className="text-[#e89d7b] shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Use the <strong>Scan QR / Barcode</strong> button above to test physical scanning with your camera or quickly pick from preloaded device serials.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: CUSTOMER RETURN & DEFECT RMA WITH BARCODE/QR SCANNER
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'defect' && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          {/* Left: Defect Logging Form */}
          <div className="lg:col-span-7 bg-[#140c08]/85 backdrop-blur-md p-6 rounded-3xl border border-rose-500/25 shadow-[0_15px_40px_rgba(0,0,0,0.6)] space-y-5">
            <div>
              <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                <RotateCcw className="text-rose-400" size={20} />
                <span>Customer Return &amp; Manufacturer RMA Dispatch (Steps 10 &amp; 11)</span>
              </h2>
              <p className="text-xs text-[#cbb5aa] mt-1">
                Customer returned device with failure. Scan the defective phone barcode/QR, log incident diagnosis, and dispatch RMA container to factory.
              </p>
            </div>

            {submittedReport && (
              <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-xs text-amber-200 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <CheckCircle2 size={16} />
                  <span>RMA Dispatch Docket Created: {submittedReport.id}</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Product <strong className="font-mono text-white">{submittedReport.serialNumber}</strong> flagged for Manufacturer Root Cause Analysis. Transmitted to Enterprise QA Hub.
                </p>
              </div>
            )}

            <form onSubmit={handleDefectSubmit} className="space-y-4">
              {/* Defective Serial Input with QR / Barcode Scanner Action Button */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#f7d5c5]">Defective Product Serial Number</label>
                  <span className="text-[10px] text-rose-300 font-mono">Scan Phone Back QR or IMEI Barcode</span>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={serialInput}
                      onChange={e => setSerialInput(e.target.value)}
                      placeholder="e.g. AAA12345678"
                      className="w-full pl-3.5 pr-10 py-2.5 bg-[#120a07] border border-rose-500/30 rounded-xl text-xs font-mono font-bold text-white placeholder-neutral-500 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400/30"
                    />
                    <button
                      type="button"
                      onClick={() => setScannerTarget('defect')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-rose-400 hover:text-white hover:bg-rose-500/20 transition-all cursor-pointer"
                      title="Open Defect Scanner"
                    >
                      <ScanLine size={16} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setScannerTarget('defect')}
                    className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-rose-700 to-rose-800 hover:from-rose-600 hover:to-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-rose-950/40 transition-all cursor-pointer shrink-0"
                  >
                    <Barcode size={14} />
                    <span>Scan Defect Barcode / QR</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#f7d5c5] mb-1">Failure Category</label>
                  <select
                    value={problemCategory}
                    onChange={e => setProblemCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-[#120a07] border border-[#d9825b]/30 rounded-xl text-xs text-white focus:outline-none focus:border-[#e89d7b]"
                  >
                    <option value="Screen & Display" className="bg-[#140c08] text-white">Screen &amp; Display</option>
                    <option value="Battery & Charging" className="bg-[#140c08] text-white">Battery &amp; Charging</option>
                    <option value="Camera & Sensor" className="bg-[#140c08] text-white">Camera &amp; Sensor</option>
                    <option value="Motherboard & Wireless" className="bg-[#140c08] text-white">Motherboard &amp; Wireless</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#f7d5c5] mb-1">Severity</label>
                  <select
                    value={severity}
                    onChange={e => setSeverity(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-[#120a07] border border-rose-500/30 rounded-xl text-xs font-semibold text-rose-300 focus:outline-none focus:border-rose-400"
                  >
                    <option value="Critical Failure" className="bg-[#140c08] text-rose-400">Critical Failure (Unusable)</option>
                    <option value="Major Degradation" className="bg-[#140c08] text-amber-400">Major Degradation</option>
                    <option value="Minor Cosmetic" className="bg-[#140c08] text-neutral-300">Minor Cosmetic</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#f7d5c5] mb-1">Customer Problem Description</label>
                <textarea
                  rows={3}
                  value={problemDescription}
                  onChange={e => setProblemDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#120a07] border border-[#d9825b]/30 rounded-xl text-xs text-white focus:outline-none focus:border-[#e89d7b]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#f7d5c5] mb-1">Suspected Cause (Technician Assessment)</label>
                <input
                  type="text"
                  value={suspectedCause}
                  onChange={e => setSuspectedCause(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#120a07] border border-[#d9825b]/30 rounded-xl text-xs text-white focus:outline-none focus:border-[#e89d7b]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-700 to-rose-800 hover:from-rose-600 hover:to-rose-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-950/40 transition-all cursor-pointer"
              >
                <Send size={15} />
                <span>Submit Issue &amp; Dispatch RMA to Manufacturer</span>
              </button>
            </form>
          </div>

          {/* Right: Recent RMA Returns List */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#140c08]/80 backdrop-blur-md p-5 rounded-3xl border border-[#d9825b]/20 space-y-3 shadow-md">
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#e89d7b]">RMA Returns Sent to Manufacturer</span>
              <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                {reports.map((r, i) => (
                  <div key={i} className="p-3.5 bg-[#1c120d]/80 rounded-2xl border border-white/10 text-xs space-y-1.5 hover:border-[#d9825b]/30 transition-colors">
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-bold text-white">{r.id}</span>
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-semibold">{r.status}</span>
                    </div>
                    <p className="text-[#cbb5aa] text-[11px] line-clamp-2">{r.problemDescription}</p>
                    <div className="pt-1.5 border-t border-white/5 text-[10px] text-[#a69489] flex justify-between font-mono">
                      <span>Serial: <strong className="text-white">{r.serialNumber}</strong></span>
                      <span>Batch: <strong className="text-[#f7d5c5]">{r.batchId}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: CUSTOMER RE-DELIVERY HANDOVER
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'redelivery' && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#140c08]/85 backdrop-blur-md p-6 rounded-3xl border border-emerald-500/25 shadow-[0_15px_40px_rgba(0,0,0,0.6)] space-y-5 max-w-2xl"
        >
          <div>
            <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
              <UserCheck className="text-emerald-400" size={20} />
              <span>Customer Re-Delivery Handover (Step 15)</span>
            </h2>
            <p className="text-xs text-[#cbb5aa] mt-1">
              The manufacturer completed precision recall, replaced the defective Batch AAA display module with certified Batch AAB, and returned the verified phone to this retail center.
            </p>
          </div>

          {redeliverySuccess && (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-200 flex items-center gap-3">
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
              <span>Handover Completed! Customer Vikram Malhotra notified and device delivered. Passport status updated to 'Repaired &amp; Delivered'.</span>
            </div>
          )}

          <div className="p-4 rounded-2xl bg-[#1c120d]/80 border border-[#d9825b]/20 text-xs space-y-2">
            <div className="flex items-center justify-between font-semibold">
              <span className="text-white font-serif text-sm">Samsung Galaxy A55 5G (AAA12345678)</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-[10px]">
                Ready for Customer Pickup
              </span>
            </div>
            <p className="text-[#cbb5aa]">
              Customer: <strong className="text-white">Vikram Malhotra</strong> • Phone: <strong className="text-[#f7d5c5]">+91 98765 43210</strong>
            </p>
            <p className="text-[11px] text-[#a69489]">
              Remanufactured with certified Batch AAB module. 100% Quality Passed at Factory AOI Gate.
            </p>
          </div>

          <button
            onClick={handleCompleteRedelivery}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 transition-all cursor-pointer"
          >
            <UserCheck size={16} />
            <span>Confirm Delivery to Customer (Step 15 Complete)</span>
          </button>
        </motion.div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          INTEGRATED LIVE QR & 1D BARCODE SCANNER MODAL
      ───────────────────────────────────────────────────────────── */}
      <BarcodeScannerModal
        isOpen={scannerTarget !== null}
        onClose={() => setScannerTarget(null)}
        onScan={handleBarcodeScanned}
        title={
          scannerTarget === 'sale'
            ? 'Scan Retail Box Barcode or Device QR'
            : 'Scan Defective Unit Barcode or IMEI'
        }
        subtitle={
          scannerTarget === 'sale'
            ? 'Point camera at product retail packaging barcode or display QR to register customer sale'
            : 'Point camera at defective phone back glass, SIM tray IMEI or customer receipt'
        }
      />
    </div>
  );
};
