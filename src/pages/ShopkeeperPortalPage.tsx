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
  ExternalLink
} from 'lucide-react';
import { GeneaTraceStore } from '../services/dataStore';
import { ShopkeeperDefectReport } from '../types';

export const ShopkeeperPortalPage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = GeneaTraceStore.getCurrentUser();
  const isShopkeeper = currentUser.role === 'shopkeeper';

  const [activeTab, setActiveTab] = useState<'sales' | 'defect' | 'redelivery'>('sales');

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

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header & Role Indicator */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <ShoppingBag className="text-blue-600" size={24} />
              <span>Retailer Operations &amp; Customer Incident Hub</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono">
              Retail Terminal Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Indiranagar Authorized Hub • Customer Sales Registration, Defect RMA Logging &amp; Recall Replacement Handover.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/passport/AAA12345678')}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200"
          >
            <ExternalLink size={13} />
            <span>Inspect Passport (AAA12345678)</span>
          </button>
        </div>
      </div>

      {/* 3-Step Retail Lifecycle Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/80 max-w-2xl">
        <button
          onClick={() => setActiveTab('sales')}
          className={`flex-1 min-w-[160px] py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'sales'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShoppingBag size={15} />
          <span>1. Customer Sale (Step 9)</span>
        </button>

        <button
          onClick={() => setActiveTab('defect')}
          className={`flex-1 min-w-[160px] py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'defect'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <RotateCcw size={15} />
          <span>2. Defect RMA (Steps 10-11)</span>
        </button>

        <button
          onClick={() => setActiveTab('redelivery')}
          className={`flex-1 min-w-[160px] py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'redelivery'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <UserCheck size={15} />
          <span>3. Customer Handover (Step 15)</span>
        </button>
      </div>

      {/* TAB 1: CUSTOMER SALE REGISTRATION */}
      {activeTab === 'sales' && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShoppingBag className="text-blue-600" size={18} />
                <span>Customer Selling Details Registration (Retail Login)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Record end-consumer ownership upon delivery at the retail store. Binds the customer to the blockchain serial container.
              </p>
            </div>

            {saleSuccessMessage && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-3">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                <span>{saleSuccessMessage}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSale} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Device Cryptographic Serial Number</label>
                <input
                  type="text"
                  value={saleSerial}
                  onChange={e => setSaleSerial(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Full Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Phone Number</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Retail Invoice Number</label>
                  <input
                    type="text"
                    value={invoiceNo}
                    onChange={e => setInvoiceNo(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Retail Center</label>
                  <input
                    type="text"
                    disabled
                    value={shopName}
                    className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all"
              >
                <CheckCircle size={15} />
                <span>Upload Selling Details to Passport (Mark as Sold)</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Current Passport Status</span>
              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>{product.productModel}</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-mono text-[10px]">
                    {product.customerSale?.status || 'In Stock'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-mono">Serial: {product.productId}</p>
                {product.customerSale && (
                  <div className="pt-2 border-t border-slate-100 text-xs space-y-1 text-slate-600">
                    <p><strong>Customer:</strong> {product.customerSale.customerName}</p>
                    <p><strong>Phone:</strong> {product.customerSale.phone}</p>
                    <p><strong>Invoice:</strong> {product.customerSale.invoiceNo}</p>
                    <p><strong>Date:</strong> {product.customerSale.saleDate}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 2: CUSTOMER RETURN & DEFECT RMA DISPATCH */}
      {activeTab === 'defect' && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <RotateCcw className="text-rose-600" size={18} />
                <span>Customer Return &amp; Manufacturer RMA Dispatch (Steps 10 &amp; 11)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Customer returned device with failure. Submit incident with serial number and dispatch physical product to factory.
              </p>
            </div>

            {submittedReport && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="flex items-center gap-2 font-bold text-amber-800">
                  <CheckCircle2 size={16} />
                  <span>RMA Dispatch Docket Created: {submittedReport.id}</span>
                </div>
                <p className="text-[11px]">
                  Product {submittedReport.serialNumber} flagged for Manufacturer Root Cause Analysis. Transmitted to Enterprise QA Hub.
                </p>
              </div>
            )}

            <form onSubmit={handleDefectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Defective Product Serial Number</label>
                <input
                  type="text"
                  value={serialInput}
                  onChange={e => setSerialInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Failure Category</label>
                  <select
                    value={problemCategory}
                    onChange={e => setProblemCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Screen & Display">Screen &amp; Display</option>
                    <option value="Battery & Charging">Battery &amp; Charging</option>
                    <option value="Camera & Sensor">Camera &amp; Sensor</option>
                    <option value="Motherboard & Wireless">Motherboard &amp; Wireless</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Severity</label>
                  <select
                    value={severity}
                    onChange={e => setSeverity(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold text-rose-600"
                  >
                    <option value="Critical Failure">Critical Failure (Unusable)</option>
                    <option value="Major Degradation">Major Degradation</option>
                    <option value="Minor Cosmetic">Minor Cosmetic</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Problem Description</label>
                <textarea
                  rows={3}
                  value={problemDescription}
                  onChange={e => setProblemDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Suspected Cause (Technician Assessment)</label>
                <input
                  type="text"
                  value={suspectedCause}
                  onChange={e => setSuspectedCause(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-rose-500/20 transition-all"
              >
                <Send size={15} />
                <span>Submit Issue &amp; Dispatch RMA to Manufacturer</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">RMA Returns Sent to Manufacturer</span>
              <div className="space-y-2">
                {reports.map((r, i) => (
                  <div key={i} className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-bold text-slate-900">{r.id}</span>
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-semibold">{r.status}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] line-clamp-2">{r.problemDescription}</p>
                    <div className="pt-1 text-[10px] text-slate-400 flex justify-between font-mono">
                      <span>Serial: {r.serialNumber}</span>
                      <span>Batch: {r.batchId}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 3: CUSTOMER RE-DELIVERY HANDOVER */}
      {activeTab === 'redelivery' && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 max-w-2xl"
        >
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="text-emerald-600" size={18} />
              <span>Customer Re-Delivery Handover (Step 15)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              The manufacturer completed precision recall, replaced the defective Batch AAA display module, and returned the verified phone to this retail center.
            </p>
          </div>

          {redeliverySuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-3">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <span>Handover Completed! Customer Vikram Malhotra notified and device delivered. Passport status updated to 'Repaired & Delivered'.</span>
            </div>
          )}

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between font-semibold">
              <span className="text-slate-900">Samsung Galaxy A55 5G (AAA12345678)</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px]">
                Ready for Customer Pickup
              </span>
            </div>
            <p className="text-slate-600">
              Customer: <strong>Vikram Malhotra</strong> • Phone: <strong>+91 98765 43210</strong>
            </p>
            <p className="text-[11px] text-slate-500">
              Remanufactured with certified Batch AAB module. 100% Quality Passed at Factory AOI Gate.
            </p>
          </div>

          <button
            onClick={handleCompleteRedelivery}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition-all"
          >
            <UserCheck size={16} />
            <span>Confirm Delivery to Customer (Step 15 Complete)</span>
          </button>
        </motion.div>
      )}
    </div>
  );
};
