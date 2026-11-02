import {
  Factory, LogOut, LogIn, MapPin, BadgeCheck, ShoppingBag, Cpu, Wrench, AlertTriangle, ShieldCheck, Undo2, Flag, CheckCircle2,
  PackageOpen, Trash2, Boxes, UserPlus, Building2, KeyRound, ClipboardCheck, Pill, Smartphone, CircuitBoard, Apple, Shirt, Car, Sparkles, Package,
  Fingerprint, Cog, PackageCheck, Warehouse, Truck, RotateCcw, Stethoscope, HandHeart, Lock, Unlock, Replace, Plug,
} from 'lucide-react';

export const fmtDate = (s) => (s ? new Date(s).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
export const fmtDateTime = (s) => (s ? new Date(s).toLocaleString(undefined, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');
export const shortHash = (h, n = 8) => (h ? `${h.slice(0, n)}…${h.slice(-4)}` : '—');
export const pct = (x) => `${Math.round((x || 0) * 100)}%`;

export function timeAgo(s) {
  if (!s) return '—';
  const d = (Date.now() - new Date(s).getTime()) / 1000;
  if (d < 60) return 'just now';
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  if (d < 86400 * 30) return `${Math.floor(d / 86400)}d ago`;
  return fmtDate(s);
}

export const EVENT_META = {
  SERIAL_ISSUED: { label: 'Serial issued (empty passport)', icon: Fingerprint, tone: 'brand' },
  PROCESS_STEP: { label: 'Process step', icon: Cog, tone: 'blue' },
  PRODUCTION_COMPLETE: { label: 'Production complete', icon: PackageCheck, tone: 'brand' },
  INSTALLED: { label: 'Installed in product', icon: Plug, tone: 'gray' },
  PACKED: { label: 'Packed', icon: Package, tone: 'gray' },
  STORED: { label: 'Stored in warehouse', icon: Warehouse, tone: 'gray' },
  DELIVERED: { label: 'Delivered', icon: Truck, tone: 'blue' },
  ISSUE_REPORTED: { label: 'Customer issue · returned', icon: RotateCcw, tone: 'red' },
  DIAGNOSED: { label: 'Diagnosed', icon: Stethoscope, tone: 'purple' },
  REPLACEMENT_ASSIGNED: { label: 'Assigned as replacement', icon: Replace, tone: 'purple' },
  HANDED_OVER: { label: 'Handed back to customer', icon: HandHeart, tone: 'brand' },
  LOCK: { label: 'Device locked', icon: Lock, tone: 'red' },
  UNLOCK: { label: 'Device unlocked', icon: Unlock, tone: 'brand' },
  MACHINE_REGISTERED: { label: 'Machine registered', icon: Cog, tone: 'gray' },
  MANUFACTURED: { label: 'Manufactured', icon: Factory, tone: 'brand' },
  BATCH_CREATED: { label: 'Batch created', icon: Boxes, tone: 'brand' },
  QUALITY_CHECK: { label: 'Quality check', icon: ClipboardCheck, tone: 'blue' },
  EXIT: { label: 'Dispatched (exit)', icon: LogOut, tone: 'amber' },
  ENTRY: { label: 'Received (entry)', icon: LogIn, tone: 'blue' },
  CHECKPOINT: { label: 'Transit checkpoint', icon: MapPin, tone: 'gray' },
  SOLD: { label: 'Sold to customer', icon: ShoppingBag, tone: 'brand' },
  FIRMWARE_UPDATE: { label: 'Firmware update', icon: Cpu, tone: 'purple' },
  SERVICE: { label: 'Service / repair', icon: Wrench, tone: 'blue' },
  DEFECT_REPORTED: { label: 'Defect reported', icon: AlertTriangle, tone: 'red' },
  WARRANTY_CLAIM: { label: 'Warranty claim', icon: ShieldCheck, tone: 'purple' },
  RECALL: { label: 'Recalled', icon: Undo2, tone: 'red' },
  BATCH_RECALLED: { label: 'Batch recalled', icon: Undo2, tone: 'red' },
  FLAG: { label: 'Regulatory flag', icon: Flag, tone: 'red' },
  CLEAR: { label: 'Flag cleared', icon: CheckCircle2, tone: 'brand' },
  REPACKAGE: { label: 'Repackaged', icon: PackageOpen, tone: 'amber' },
  DISPOSE: { label: 'Disposed', icon: Trash2, tone: 'gray' },
  ACTOR_REGISTERED: { label: 'Member registered', icon: UserPlus, tone: 'gray' },
  FACILITY_REGISTERED: { label: 'Facility registered', icon: Building2, tone: 'gray' },
  FACILITY_LICENSE: { label: 'License change', icon: KeyRound, tone: 'amber' },
  PROGRAM_CREATED: { label: 'Program created', icon: BadgeCheck, tone: 'purple' },
};
export const eventMeta = (t) => EVENT_META[t] || { label: t, icon: Package, tone: 'gray' };

export const STATUS_META = {
  in_production: { label: 'In production', tone: 'purple' },
  returned: { label: 'Returned · service', tone: 'amber' },
  locked: { label: 'Locked', tone: 'red' },
  installed: { label: 'Installed', tone: 'gray' },
  in_stock: { label: 'In stock', tone: 'brand' },
  in_transit: { label: 'In transit', tone: 'blue' },
  sold: { label: 'Sold', tone: 'gray' },
  recalled: { label: 'Recalled', tone: 'red' },
  flagged: { label: 'Flagged', tone: 'red' },
  quarantined: { label: 'Quarantined', tone: 'amber' },
  retired: { label: 'Retired', tone: 'gray' },
  active: { label: 'Active', tone: 'brand' },
};

export const VERDICT_META = {
  GENUINE: { tone: 'brand', bg: 'from-brand-600 to-brand-700' },
  COUNTERFEIT: { tone: 'red', bg: 'from-red-600 to-red-700' },
  TAMPERED: { tone: 'red', bg: 'from-red-600 to-red-700' },
  SUSPECTED_CLONE: { tone: 'red', bg: 'from-red-600 to-rose-700' },
  RECALLED: { tone: 'red', bg: 'from-red-600 to-orange-700' },
  EXPIRED: { tone: 'amber', bg: 'from-amber-500 to-orange-600' },
  SUSPICIOUS: { tone: 'amber', bg: 'from-amber-500 to-amber-600' },
  LOCKED: { tone: 'red', bg: 'from-red-700 to-ink-900' },
};

export const SEVERITY_TONE = { critical: 'red', high: 'amber', medium: 'blue', low: 'gray' };

export const ROLE_LABEL = {
  admin: 'Network admin', manufacturer: 'Manufacturer', distributor: 'Distributor', logistics: 'Logistics', retailer: 'Retailer',
  pharmacy: 'Pharmacy', hospital: 'Hospital', service_center: 'Service centre', regulator: 'Regulator',
};

export const CATEGORY_META = {
  medicine: { label: 'Medicine', icon: Pill },
  electronics: { label: 'Electronics', icon: Smartphone },
  component: { label: 'Component', icon: CircuitBoard },
  food: { label: 'Food', icon: Apple },
  apparel: { label: 'Apparel', icon: Shirt },
  automotive: { label: 'Automotive', icon: Car },
  cosmetics: { label: 'Cosmetics', icon: Sparkles },
  other: { label: 'Other', icon: Package },
};
export const categoryMeta = (c) => CATEGORY_META[c] || CATEGORY_META.other;

export const DEFECT_CODES = ['DISPLAY_GREEN_LINE', 'DISPLAY_PINK_LINE', 'BATTERY_SWELLING', 'OVERHEATING', 'BOOT_LOOP', 'NO_POWER', 'PACKAGING_DAMAGED', 'PARTICULATE_MATTER', 'DISCOLORATION', 'ADVERSE_REACTION'];

// Lifecycle bookkeeping on a passport – shown in dedicated panels, never as product attributes.
export const INTERNAL_ATTRS = new Set(['serial_no', 'steps', 'parts', 'claims', 'defects', 'issues', 'replacements', 'repackaged', 'sold_by', 'dispatched_by', 'last_exit_facility', 'customer_ref', 'open_ticket', 'diagnosis', 'locked', 'locked_at', 'lock_reason', 'serviced_at', 'produced_at', 'packed_at', 'delivered_at', 'pod', 'carton', 'bin', 'recall_reason', 'recall_remedied_at', 'flag_reason', 'warranty_until', 'warranty_months', 'firmware_updated_at', 'temp_min_c', 'temp_max_c', 'qc', 'process_route', 'replaces', 'parent', 'removed_from', 'cold_chain_breach', 'last_temperature_c', 'damage']);

export const humanize = (s) => String(s || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export const TICKET_STATUS = {
  recall_notice: { label: 'Recall notice – contact customer', tone: 'red' },
  reported: { label: 'Reported by retailer', tone: 'amber' },
  collected: { label: 'Collected from customer', tone: 'amber' },
  sent_to_manufacturer: { label: 'In transit to manufacturer', tone: 'blue' },
  at_manufacturer: { label: 'At manufacturer', tone: 'purple' },
  diagnosed: { label: 'Diagnosed', tone: 'purple' },
  repaired: { label: 'Repaired', tone: 'brand' },
  returning_to_retailer: { label: 'In transit to retailer', tone: 'blue' },
  ready_for_customer: { label: 'Ready for customer', tone: 'brand' },
  closed: { label: 'Closed – delivered to customer', tone: 'gray' },
};

// Starting points for a batch's process route; every step becomes a scanner station.
export const ROUTE_PRESETS = {
  electronics: ['SMT & PCB assembly', 'Display lamination', 'Battery install', 'Final assembly', 'Software flash', 'Final QC'],
  medicine: ['API dispensing', 'Compounding', 'Aseptic filling', 'Stoppering & sealing', 'Terminal sterilization', 'Visual inspection', 'Labelling & serialisation'],
  component: ['Fabrication', 'Inspection'],
  food: ['Raw material intake', 'Processing', 'Cooking / pasteurisation', 'Filling', 'Sealing', 'Metal detection', 'Labelling'],
  apparel: ['Cutting', 'Stitching', 'Finishing', 'Quality inspection', 'Tagging'],
  automotive: ['Machining', 'Heat treatment', 'Assembly', 'Torque check', 'End-of-line test'],
  cosmetics: ['Weighing', 'Mixing', 'Filling', 'Capping', 'Batch QC', 'Labelling'],
  other: ['Assembly', 'Inspection'],
};
