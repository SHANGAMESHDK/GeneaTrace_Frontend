import {
  BatchRecord,
  ComponentRecord,
  ProductRecord,
  ShipmentRecord,
  ManufacturingEvent,
  RecallCase,
  SecurityStatus,
  IntegrationStatus,
  BlockchainAuditBlock
} from '../types';
import { pseudoHash } from '../utils/hashing';

// Certified Production Batches (Smartphone Manufacturing)
export const initialBatches: BatchRecord[] = [
  {
    batchId: 'ABC',
    sector: 'Consumer Electronics',
    componentType: 'Display',
    batchSize: 1,
    serialPrefix: 'ABC',
    supplier: 'Samsung Display Corp',
    facility: 'Cleanroom Complex Alpha (Line 3)',
    productionDate: '2026-10-01',
    status: 'Defective',
    defectReason: 'Micro-delamination in polarizer adhesive layer detected post-curing',
    inspectionResult: 'Failed Electrical Curing Tolerances (EL-08)',
    completedOperationsCount: 9,
    totalOperationsCount: 9,
    blockchainCheckpointTx: '0xa45b98cf120194bc87123985',
    checkpointStatus: 'Anchored'
  }
];

// Generate Components for production batches (Single Showcase Component)
export function generateInitialComponents(): ComponentRecord[] {
  return [
    {
      componentId: 'CMP-DIS-000042',
      serialNumber: 'ABC-0042',
      batchId: 'ABC',
      type: 'Display',
      sector: 'Consumer Electronics',
      manufacturer: 'Samsung Display Corp',
      supplier: 'Samsung Display Corp',
      location: 'Cleanroom Complex Alpha (Line 3)',
      mfgDate: '2026-10-01',
      status: 'Recalled',
      qualityStatus: 'Failed',
      passportRef: '/passport/GT-DEV-00000851',
      verificationStatus: 'Flagged',
      cryptographicHash: pseudoHash('COMPONENT-ABC-0042-CMP-DIS-000042'),
      installedInProductId: 'GT-DEV-00000851'
    }
  ];
}

// Generate Manufactured Finished Products (Single Showcase Device)
export function generateInitialProducts(): ProductRecord[] {
  return [
    {
      productId: 'GT-DEV-00000851',
      productModel: 'Galaxy S24 Ultra Titanium DPP Edition',
      sector: 'Consumer Electronics',
      productTypeDisplay: 'Smartphone (5G LTPO)',
      imeiMasked: '356789123456780',
      installedComponents: {
        'Display Module': 'ABC-0042',
        displaySerial: 'ABC-0042'
      },
      installedBatches: {
        displayBatch: 'ABC'
      },
      assemblyDate: '2026-10-02',
      assemblyFacility: 'Smart Manufacturing Mega-Hub 4, Gumi',
      status: 'Recall Flagged',
      passportStatus: 'Active',
      shipmentId: 'GT-SHP-00000326',
      blockchainTx: pseudoHash('PASSPORT-TX-GT-DEV-00000851'),
      merkleRoot: pseudoHash('MERKLE-ROOT-GT-DEV-00000851'),
      isTampered: false,
      isLocked: false,
      complianceStandards: ['EU DPP Directive (ESPR)', 'RoHS-3 Compliant', 'WEEE Traceable'],
      carbonFootprintKg: 58.4,
      recycledContentPct: 24.5,
      esgScore: 'A+ (94/100)'
    }
  ];
}

// Generate Shipments (Single Showcase Shipment)
export function generateInitialShipments(products: ProductRecord[]): ShipmentRecord[] {
  return [
    {
      shipmentId: 'GT-SHP-00000326',
      packageIds: ['PKG-88210-A'],
      productIds: ['GT-DEV-00000851'],
      origin: 'Gumi Mega-Hub 4, South Korea',
      destination: 'Frankfurt Central Distribution, Germany',
      carrier: 'DHL Express Supply Chain Intercontinental',
      dispatchTime: '2026-10-03 08:30:00',
      expectedDelivery: '2026-10-07 14:00:00',
      currentStatus: 'In Transit',
      currentLocation: 'Transit Checkpoint 4 (Munich Gateway)',
      temperature: '21.4 °C (Nominal)',
      humidity: '44% RH',
      checkpoints: [
        { id: 'CP-1', name: 'Packaging & Seal Authentication', location: 'Gumi Mega-Hub 4', timestamp: '2026-10-03 08:30:00', status: 'Completed', scanHash: pseudoHash('CP-1-326') },
        { id: 'CP-2', name: 'Incheon Int Airport Customs Clear', location: 'Incheon Cargo Terminal', timestamp: '2026-10-03 21:15:00', status: 'Completed', scanHash: pseudoHash('CP-2-326') },
        { id: 'CP-3', name: 'Leipzig European Air Hub Arrival', location: 'Leipzig/Halle Airport', timestamp: '2026-10-04 11:40:00', status: 'Completed', scanHash: pseudoHash('CP-3-326') },
        { id: 'CP-4', name: 'Munich Gateway Intermodal Scan', location: 'Munich Rail Freight Gateway', timestamp: '2026-10-05 06:15:00', status: 'Current', scanHash: pseudoHash('CP-4-326') },
        { id: 'CP-5', name: 'Frankfurt Regional Distribution Arrival', location: 'Frankfurt Cargo City South', timestamp: 'Pending', status: 'Pending', scanHash: '' },
        { id: 'CP-6', name: 'Authorized Retail Handover', location: 'Saturn / MediaMarkt Flagship', timestamp: 'Pending', status: 'Pending', scanHash: '' }
      ]
    }
  ];
}

// Generate Unit-Level Manufacturing Events (Single Showcase Flow)
export function generateInitialManufacturingEvents(): ManufacturingEvent[] {
  const events: ManufacturingEvent[] = [];

  const displayOps = [
    { opId: '1.1', name: 'Raw Material Receipt', sec: 'Component Manufacturing', machine: 'RM-01', oper: 'OP-KIM-21', time: '2026-10-01 08:00', result: 'OK' as const },
    { opId: '1.2', name: 'Glass Cutting', sec: 'Component Manufacturing', machine: 'GC-02', oper: 'OP-PARK-08', time: '2026-10-01 08:20', result: 'OK' as const },
    { opId: '1.3', name: 'TFT Deposition', sec: 'Component Manufacturing', machine: 'TFT-03', oper: 'OP-AUTO-ROBOT', time: '2026-10-01 08:45', result: 'OK' as const },
    { opId: '1.4', name: 'Polarizer Lamination', sec: 'Component Manufacturing', machine: 'PL-04', oper: 'OP-LEE-14', time: '2026-10-01 09:10', result: 'OK' as const },
    { opId: '1.5', name: 'Adhesive Gluing', sec: 'Component Manufacturing', machine: 'AG-05', oper: 'OP-CHOI-03', time: '2026-10-01 09:25', result: 'OK' as const },
    { opId: '1.6', name: 'Display Sticking', sec: 'Component Manufacturing', machine: 'ST-06', oper: 'OP-JUNG-19', time: '2026-10-01 09:30', result: 'OK' as const },
    { opId: '1.7', name: 'Preheating / Curing', sec: 'Component Manufacturing', machine: 'PH-07', oper: 'OP-HEATER-AUTO', time: '2026-10-01 10:00', result: 'OK' as const },
    { opId: '1.8', name: 'Electrical Test', sec: 'Component Manufacturing', machine: 'ET-08', oper: 'OP-TEST-STN1', time: '2026-10-01 10:15', result: 'OK' as const },
    { opId: '1.9', name: 'Final Quality Inspection', sec: 'Component Manufacturing', machine: 'INSP-09', oper: 'OP-QC-LEAD', time: '2026-10-01 10:30', result: 'OK' as const },
  ];

  const serial = 'ABC-0042';
  let parentHash = '0x0000000000000000000000000000000000000000';
  displayOps.forEach((op, idx) => {
    const eventId = `EVT-DSP-${serial.replace('-', '')}-${idx + 1}`;
    const hash = pseudoHash(`${eventId}-${serial}-${op.name}-${parentHash}`);
    events.push({
      eventId,
      entityType: 'Component',
      entityId: serial,
      batchId: 'ABC',
      operationId: op.opId,
      operationName: op.name,
      section: op.sec,
      machineId: op.machine,
      operator: op.oper,
      startTimestamp: `${op.time}:00`,
      completionTimestamp: `${op.time}:50`,
      result: op.result,
      state: 'Completed',
      processParameters: {
        chamberTemp: '24.2 °C',
        vacuumLevel: '99.8 kPa',
        curingDelta: idx === 6 ? '145 °C / 18 min' : 'Ambient',
        irInspectionScore: '99.4/100'
      },
      cryptographicHash: hash,
      parentHash,
      verificationStatus: 'Cryptographically Verified'
    });
    parentHash = hash;
  });

  // Assembly Line Events for GT-DEV-00000851
  const assemblyOps = [
    { eventId: 'EVT-100201', opId: '3.1', name: 'Machined Chassis & PCB Mounting', machine: 'SMT-01', result: 'OK' as const },
    { eventId: 'EVT-100202', opId: '3.2', name: 'Sub-Assembly & Display Bonding', machine: 'AS-02', result: 'OK' as const },
    { eventId: 'EVT-100203', opId: '3.3', name: 'Automated Optical Inspection (AOI)', machine: 'AOI-03', result: 'OK' as const },
    { eventId: 'EVT-100204', opId: '3.4', name: 'Precision Rework & Laser Alignment', machine: 'RW-02', result: 'OK' as const },
    { eventId: 'EVT-100205', opId: '3.5', name: 'Final Assembly & Ultrasonic Sealing', machine: 'FA-01', result: 'OK' as const },
    { eventId: 'EVT-100206', opId: '3.6', name: 'Functional Stress & Quality Inspection', machine: 'FT-01', result: 'OK' as const },
    { eventId: 'EVT-100207', opId: '3.7', name: 'Packaging & Tamper-Evident Seal', machine: 'PK-01', result: 'OK' as const },
  ];

  let prodParentHash = '0x994801acde879201456bc812';
  assemblyOps.forEach((op, idx) => {
    const hash = pseudoHash(`PROD-EVT-${op.eventId}-GT-DEV-00000851-${prodParentHash}`);
    events.push({
      eventId: op.eventId,
      entityType: 'Product',
      entityId: 'GT-DEV-00000851',
      batchId: 'ABC',
      operationId: op.opId,
      operationName: op.name,
      section: 'Smartphone Assembly',
      machineId: op.machine,
      operator: 'ROBOTIC-CELL-04',
      startTimestamp: `2026-10-02 11:${(idx * 12).toString().padStart(2, '0')}:00`,
      completionTimestamp: `2026-10-02 11:${(idx * 12 + 10).toString().padStart(2, '0')}:00`,
      result: op.result,
      state: 'Completed',
      processParameters: {
        sealingTorque: '0.45 Nm',
        heliumLeakRate: '< 10^-6 mbar l/s',
        displayTouchLatency: '1.2 ms',
        batteryInternalResistance: '12.4 mOhm'
      },
      cryptographicHash: hash,
      parentHash: prodParentHash,
      verificationStatus: 'Cryptographically Verified'
    });
    prodParentHash = hash;
  });

  return events;
}

// Initial Recall Case (Single Showcase Recall)
export const initialRecallCase: RecallCase = {
  recallId: 'REC-2026-001',
  batchId: 'ABC',
  sector: 'Consumer Electronics',
  componentType: 'Display',
  defectCategory: 'Delamination & Thermal Micro-fracture',
  severity: 'Critical',
  discoveryDate: '2026-10-05',
  affectedOperation: '1.5 Adhesive Gluing / 1.7 Preheating Curing',
  description: 'Display batch ABC exhibited micro-delamination along the lower bezel when subjected to extended thermal cycles. Curing oven PH-07 sensor variance caused premature crystallization of the optical adhesive.',
  status: 'Recall Initiated',
  unitsInBatch: 1,
  affectedComponents: ['ABC-0042'],
  affectedProductIds: ['GT-DEV-00000851'],
  affectedShipmentIds: ['GT-SHP-00000326'],
  deliveredCount: 0,
  inTransitCount: 1,
  warehouseCount: 0,
  rootCause: 'Machine PH-07 thermal sensor thermocouple TC-03 uncalibrated by +8.2°C during cycle ABC-20261001-09.',
  actionsTaken: [
    'Flagged Batch ABC in GeneaTrace immutable ledger',
    'Traversed Merkle-DAG to isolate product GT-DEV-00000851 in < 12ms',
    'Dispatched targeted recall hold order to DHL carrier for shipment GT-SHP-00000326',
    'Pushing signed DPP notification to retail POS & authorized distributor systems'
  ]
};

// Device Security Status (Single Showcase Device)
export const initialSecurityStatus: SecurityStatus = {
  productId: 'GT-DEV-00000851',
  imei: '356789123456780',
  hardwareHashMatches: true,
  signatureValid: true,
  componentsAuthentic: true,
  status: 'Verified',
  lockCommandStatus: 'None',
  simulatedAuditLogs: [
    { timestamp: '2026-10-02 11:58:00', event: 'Factory DPP Identity Provisioned & Signed', actor: 'Gumi Mega-Hub Security Enclave', hash: '0x12a990bf...' },
    { timestamp: '2026-10-03 08:31:00', event: 'Logistics Handover Attestation Validated', actor: 'DHL Secure Handheld Gate', hash: '0x88fca002...' },
    { timestamp: '2026-10-05 06:16:00', event: 'Transit Checkpoint 4 Integrity Check Passed', actor: 'Munich Gateway Intermodal Scanner', hash: '0xbc3381a9...' }
  ]
};

// Industrial System Integrations
export const initialIntegrations: IntegrationStatus[] = [
  { id: 'INT-ERP-01', name: 'SAP S/4HANA Enterprise ERP', category: 'ERP', description: 'BOM explosion, Purchase Orders, Supplier Master, ASN Ingestion', status: 'Connected', lastSync: '1 min ago', eventsIngested: 48920, failedEvents: 0, protocol: 'OData v4 REST / RFC' },
  { id: 'INT-MES-02', name: 'Siemens Opcenter MES', category: 'MES', description: 'Production events, work order tracking, station routing, WIP tracking', status: 'Connected', lastSync: '12 sec ago', eventsIngested: 142800, failedEvents: 0, protocol: 'OPC UA / AMQP' },
  { id: 'INT-SCADA-03', name: 'Ignition SCADA & PLC Gateway', category: 'SCADA', description: 'Machine temperatures, curing profiles, torque sensors, vacuum pressure', status: 'Connected', lastSync: '3 sec ago', eventsIngested: 894310, failedEvents: 0, protocol: 'MQTT Sparkplug B' },
  { id: 'INT-QMS-04', name: 'ETQ Reliance QMS', category: 'Quality', description: 'Inspection results, visual AOI defect logs, CAPA compliance', status: 'Connected', lastSync: '2 min ago', eventsIngested: 21340, failedEvents: 0, protocol: 'REST Webhooks' },
  { id: 'INT-LOG-05', name: 'Oracle TMS Logistics Network', category: 'Logistics', description: 'Shipment manifests, carrier API scans, geofence checkpoint alerts', status: 'Connected', lastSync: '45 sec ago', eventsIngested: 53200, failedEvents: 0, protocol: 'EDI / REST' },
  { id: 'INT-SUP-06', name: 'Supplier Portal Gateway', category: 'Suppliers', description: 'Cryptographic component batch manifests from Samsung Display Corp', status: 'Connected', lastSync: '8 min ago', eventsIngested: 14500, failedEvents: 0, protocol: 'AS2 / JSON-LD' },
];

// Blockchain State Commitment Blocks (Single Showcase Block)
export const initialBlockchainBlocks: BlockchainAuditBlock[] = [
  { blockNumber: 1849340, txHash: '0x33b879102cdaef0982715011', timestamp: '2026-10-02 12:00:22', entityType: 'Passport Issuance', entityId: 'GT-DEV-00000851 (Galaxy S24 Ultra)', merkleRoot: '0xfe881023ba91739812401827', validatorNode: 'Validator-T-Systems-EU-03', status: 'Confirmed' }
];
