export type IndustrySector =
  | 'Consumer Electronics'
  | 'Automotive & EV Battery'
  | 'Medical Technology'
  | 'Industrial & Aerospace';

export type ComponentCategory =
  // Consumer Electronics
  | 'Display'
  | 'Battery'
  | 'Main PCB'
  | 'Camera Module'
  | 'Speaker'
  | 'Frame'
  | 'Sensors'
  | 'Other'
  // Automotive & EV Battery
  | 'Prismatic Cell'
  | 'BMS Module'
  | 'Thermal Cooling Plate'
  | 'High-Voltage Contactor'
  | 'Busbar System'
  // Medical Technology
  | 'Biocompatible Housing'
  | 'Telemetry ASIC'
  | 'Hermetic Feedthrough'
  | 'Micro-Electrode'
  // Industrial & Aerospace
  | 'Radiation-Tolerant MCU'
  | 'MIL-SPEC Enclosure'
  | 'Fiber-Optic Gyroscope';

export type ComponentStatus =
  | 'Registered'
  | 'In Production'
  | 'Quality Passed'
  | 'Quality Failed'
  | 'Recalled'
  | 'Reworked';

export interface ComponentRecord {
  componentId: string;
  serialNumber: string;
  batchId: string;
  type: ComponentCategory;
  sector: IndustrySector;
  manufacturer: string;
  supplier: string;
  location: string;
  mfgDate: string;
  status: ComponentStatus;
  qualityStatus: 'Passed' | 'Failed' | 'Pending' | 'Reworked';
  passportRef?: string;
  verificationStatus: 'Cryptographically Verified' | 'Verified' | 'Pending' | 'Flagged' | 'Demo Verified';
  cryptographicHash: string;
  installedInProductId?: string;
}

export interface BatchRecord {
  batchId: string;
  sector: IndustrySector;
  componentType: ComponentCategory;
  batchSize: number;
  serialPrefix: string;
  supplier: string;
  facility: string;
  productionDate: string;
  status: 'In Production' | 'Quality Passed' | 'Defective' | 'Recalled' | 'Reworked';
  defectReason?: string;
  inspectionResult: string;
  completedOperationsCount: number;
  totalOperationsCount: number;
  blockchainCheckpointTx: string;
  checkpointStatus: 'Anchored' | 'Pending';
}

export type OperationState =
  | 'Not Started'
  | 'In Progress'
  | 'Completed'
  | 'Failed'
  | 'Rework Required'
  | 'Reworked'
  | 'Verified';

export interface ManufacturingEvent {
  eventId: string;
  entityType: 'Component' | 'Product';
  entityId: string;
  batchId: string;
  operationId: string;
  operationName: string;
  section: string;
  machineId: string;
  operator: string;
  startTimestamp: string;
  completionTimestamp: string;
  result: 'OK' | 'Failed' | 'Reworked';
  state: OperationState;
  processParameters?: Record<string, string | number>;
  inspectionNotes?: string;
  cryptographicHash: string;
  parentHash?: string;
  verificationStatus: 'Cryptographically Verified' | 'Verified' | 'Pending' | 'Demo Verified';
}

export interface ProductRecord {
  productId: string; // e.g. GT-DEV-00000851, GT-EVB-00094120, GT-MED-00041289
  productModel: string;
  sector: IndustrySector;
  productTypeDisplay: string; // e.g. 'Smartphone', '800V EV Battery Pack', 'Cardiac Implant'
  imeiMasked: string; // Serial / Unique Device Identifier (UDI / VIN association)
  installedComponents: Record<string, string>;
  installedBatches: Record<string, string>;
  assemblyDate: string;
  assemblyFacility: string;
  status: 'Assembled' | 'In Quality Check' | 'Packed' | 'Shipped' | 'Delivered' | 'Recall Flagged' | 'Locked';
  passportStatus: 'Active' | 'Revoked' | 'Restricted';
  shipmentId: string;
  blockchainTx: string;
  merkleRoot: string;
  isTampered?: boolean;
  isLocked?: boolean;
  lockReason?: string;

  // Multi-Industry Compliance & ESG Metrics
  complianceStandards?: string[];
  carbonFootprintKg?: number;
  recycledContentPct?: number;
  esgScore?: string;
  batteryChemistry?: string; // For EV Battery DPP
  stateOfHealth?: number;    // % SoH
}

export interface ShipmentCheckpoint {
  id: string;
  name: string;
  location: string;
  timestamp: string;
  status: 'Completed' | 'Current' | 'Pending';
  scanHash: string;
}

export interface ShipmentRecord {
  shipmentId: string;
  packageIds: string[];
  productIds: string[];
  origin: string;
  destination: string;
  carrier: string;
  dispatchTime: string;
  expectedDelivery: string;
  currentStatus: 'Packed' | 'Dispatched' | 'In Transit' | 'At Distribution Center' | 'Delivered' | 'Exception' | 'Returned';
  currentLocation: string;
  temperature?: string;
  humidity?: string;
  checkpoints: ShipmentCheckpoint[];
}

export interface RecallCase {
  recallId: string;
  batchId: string;
  sector: IndustrySector;
  componentType: ComponentCategory;
  defectCategory: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  discoveryDate: string;
  affectedOperation: string;
  description: string;
  status: 'Investigation' | 'Confirmed' | 'Recall Initiated' | 'Notifications Sent' | 'Recovery in Progress' | 'Resolved';
  unitsInBatch: number;
  affectedComponents: string[];
  affectedProductIds: string[];
  affectedShipmentIds: string[];
  deliveredCount: number;
  inTransitCount: number;
  warehouseCount: number;
  rootCause: string;
  actionsTaken: string[];
}

export interface SecurityStatus {
  productId: string;
  imei: string;
  hardwareHashMatches: boolean;
  signatureValid: boolean;
  componentsAuthentic: boolean;
  status: 'Verified' | 'Verification Pending' | 'Suspicious' | 'Confirmed Tampering' | 'Revoked' | 'Recovery Required';
  anomalyDetails?: string;
  lockCommandStatus: 'None' | 'Authorized' | 'Issued' | 'Executed (Simulated)' | 'Failed';
  lockTimestamp?: string;
  simulatedAuditLogs: {
    timestamp: string;
    event: string;
    actor: string;
    hash: string;
  }[];
}

export interface IntegrationStatus {
  id: string;
  name: string;
  category: 'ERP' | 'MES' | 'SCADA' | 'Quality' | 'Logistics' | 'Suppliers';
  description: string;
  status: 'Connected' | 'Syncing' | 'Degraded' | 'Offline';
  lastSync: string;
  eventsIngested: number;
  failedEvents: number;
  protocol: string;
}

export interface BlockchainAuditBlock {
  blockNumber: number;
  txHash: string;
  timestamp: string;
  entityType: 'Batch Checkpoint' | 'Passport Issuance' | 'Recall Event' | 'Lock Command' | 'Shop Incident Report';
  entityId: string;
  merkleRoot: string;
  validatorNode: string;
  status: 'Confirmed' | 'Pending' | 'Demo Confirmed';
}

export type UserRole = 'shopkeeper' | 'company_qa';

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  shopName?: string;
  city?: string;
  state?: string;
  badge: string;
}

export interface ShopkeeperDefectReport {
  id: string;
  serialNumber: string; // Device serial or IMEI
  productModel: string;
  reportedAt: string;
  shopkeeperId: string;
  shopName: string;
  location: string;
  state: string;
  problemCategory: 'Screen & Display' | 'Battery & Charging' | 'Camera & Sensor' | 'Logic Board / Power' | 'Housing / Assembly' | 'Other';
  problemDescription: string;
  suspectedCause: string;
  severity: 'Minor' | 'Moderate' | 'Critical Failure';
  batchId?: string;
  mfgDate?: string;
  status: 'Pending Review' | 'Investigating' | 'Batch Hold Issued' | 'Resolved / Cleared';
  companyNotes?: string;
  isImmutable: boolean; // Cannot be edited or deleted by shopkeeper
}
