export type ComponentCategory =
  | 'Display'
  | 'Battery'
  | 'Main PCB'
  | 'Camera Module'
  | 'Speaker'
  | 'Frame'
  | 'Sensors'
  | 'Other';

export type ComponentStatus =
  | 'Registered'
  | 'In Production'
  | 'Quality Passed'
  | 'Quality Failed'
  | 'Recalled'
  | 'Reworked';

export interface ComponentRecord {
  componentId: string;
  serialNumber: string; // e.g. ABC-0042
  batchId: string;      // e.g. ABC
  type: ComponentCategory;
  manufacturer: string;
  supplier: string;
  location: string;
  mfgDate: string;
  status: ComponentStatus;
  qualityStatus: 'Passed' | 'Failed' | 'Pending' | 'Reworked';
  passportRef?: string;
  verificationStatus: 'Demo Verified' | 'Pending' | 'Flagged';
  cryptographicHash: string;
  installedInProductId?: string;
}

export interface BatchRecord {
  batchId: string; // e.g. ABC
  componentType: ComponentCategory;
  batchSize: number; // e.g. 100
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
  entityId: string; // ABC-0042 or GT-DEV-00000851
  batchId: string;
  operationId: string;
  operationName: string;
  section: 'Component Manufacturing' | 'Smartphone Assembly';
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
  verificationStatus: 'Demo Verified' | 'Pending';
}

export interface ProductRecord {
  productId: string; // e.g. GT-DEV-00000851
  productModel: string;
  imeiMasked: string; // e.g. 356789123456780
  installedComponents: {
    displaySerial: string;
    batterySerial: string;
    pcbSerial: string;
    cameraSerial: string;
    speakerSerial: string;
    frameSerial: string;
    othersSerial?: string;
  };
  installedBatches: {
    displayBatch: string;
    batteryBatch: string;
    pcbBatch: string;
    cameraBatch: string;
    speakerBatch: string;
    frameBatch: string;
  };
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
  shipmentId: string; // e.g. GT-SHP-00000326
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
  entityType: 'Batch Checkpoint' | 'Passport Issuance' | 'Recall Event' | 'Lock Command';
  entityId: string;
  merkleRoot: string;
  validatorNode: string;
  status: 'Demo Confirmed';
}
