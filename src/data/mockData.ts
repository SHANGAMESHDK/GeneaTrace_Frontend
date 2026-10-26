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

// Initial Batches
export const initialBatches: BatchRecord[] = [
  {
    batchId: 'ABC',
    componentType: 'Display',
    batchSize: 100,
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
  },
  {
    batchId: 'BTR',
    componentType: 'Battery',
    batchSize: 100,
    serialPrefix: 'BTR',
    supplier: 'ATL Energy Solutions',
    facility: 'Electrolyte Facility 2 (Cheongju)',
    productionDate: '2026-09-28',
    status: 'Quality Passed',
    inspectionResult: 'Passed (0.01% impedance variance)',
    completedOperationsCount: 5,
    totalOperationsCount: 5,
    blockchainCheckpointTx: '0x8821bcfae190349281a95b01',
    checkpointStatus: 'Anchored'
  },
  {
    batchId: 'PCB',
    componentType: 'Main PCB',
    batchSize: 100,
    serialPrefix: 'PCB',
    supplier: 'Murata / Samsung Electro-Mechanics',
    facility: 'SMT High-Speed Line 4',
    productionDate: '2026-09-29',
    status: 'Quality Passed',
    inspectionResult: 'Passed AOI Optical & X-Ray BGA',
    completedOperationsCount: 6,
    totalOperationsCount: 6,
    blockchainCheckpointTx: '0x33b879102cdaef0982715011',
    checkpointStatus: 'Anchored'
  },
  {
    batchId: 'CAM',
    componentType: 'Camera Module',
    batchSize: 100,
    serialPrefix: 'CAM',
    supplier: 'Sony Semiconductor & Optics',
    facility: 'Kumamoto Fab 1',
    productionDate: '2026-09-30',
    status: 'Quality Passed',
    inspectionResult: 'Passed 200MP OIS Actuator Calibration',
    completedOperationsCount: 6,
    totalOperationsCount: 6,
    blockchainCheckpointTx: '0x19bb487c014fa99120894567',
    checkpointStatus: 'Anchored'
  },
  {
    batchId: 'SPK',
    componentType: 'Speaker',
    batchSize: 100,
    serialPrefix: 'SPK',
    supplier: 'AAC Technologies Micro-Acoustics',
    facility: 'Changzhou Plant 6',
    productionDate: '2026-09-27',
    status: 'Quality Passed',
    inspectionResult: 'Passed Acoustic SPL Sweeps',
    completedOperationsCount: 4,
    totalOperationsCount: 4,
    blockchainCheckpointTx: '0x902cf4817aed092147bb3322',
    checkpointStatus: 'Anchored'
  },
  {
    batchId: 'FRM',
    componentType: 'Frame',
    batchSize: 100,
    serialPrefix: 'FRM',
    supplier: 'Foxconn Precision CNC',
    facility: 'Zhengzhou Metalwork Division',
    productionDate: '2026-09-25',
    status: 'Quality Passed',
    inspectionResult: 'Passed Titanium Grade 5 Anodization',
    completedOperationsCount: 5,
    totalOperationsCount: 5,
    blockchainCheckpointTx: '0x55ac291048fbaa0912447990',
    checkpointStatus: 'Anchored'
  },
  {
    batchId: 'OTH',
    componentType: 'Other',
    batchSize: 100,
    serialPrefix: 'OTH',
    supplier: 'Qualcomm / STMicroelectronics',
    facility: 'Semiconductor Wafer Fab 12',
    productionDate: '2026-09-26',
    status: 'Quality Passed',
    inspectionResult: 'Passed Sub-system RF & IMU BIST',
    completedOperationsCount: 4,
    totalOperationsCount: 4,
    blockchainCheckpointTx: '0x71dc99401abed66189920134',
    checkpointStatus: 'Anchored'
  }
];

// Generate 100 components for each batch
export function generateInitialComponents(): ComponentRecord[] {
  const components: ComponentRecord[] = [];
  const batchConfigs = [
    { batchId: 'ABC', type: 'Display' as const, mfg: 'ABC Displays', supp: 'Samsung Display Corp', loc: 'Cleanroom Alpha Line 3', compCode: 'CMP-DSP' },
    { batchId: 'BTR', type: 'Battery' as const, mfg: 'ATL Chem', supp: 'ATL Energy Solutions', loc: 'Electrolyte Facility 2', compCode: 'CMP-BAT' },
    { batchId: 'PCB', type: 'Main PCB' as const, mfg: 'Semco High-Density', supp: 'Samsung Electro-Mechanics', loc: 'SMT Line 4', compCode: 'CMP-PCB' },
    { batchId: 'CAM', type: 'Camera Module' as const, mfg: 'Sony Semiconductor', supp: 'Sony Semiconductor & Optics', loc: 'Fab 1 Kumamoto', compCode: 'CMP-CAM' },
    { batchId: 'SPK', type: 'Speaker' as const, mfg: 'AAC Acoustics', supp: 'AAC Technologies', loc: 'Changzhou Plant 6', compCode: 'CMP-SPK' },
    { batchId: 'FRM', type: 'Frame' as const, mfg: 'Foxconn Titanium CNC', supp: 'Foxconn Precision', loc: 'Zhengzhou Metalwork', compCode: 'CMP-FRM' },
    { batchId: 'OTH', type: 'Other' as const, mfg: 'Qualcomm Snapdragon RF', supp: 'Qualcomm / STMicro', loc: 'Wafer Fab 12', compCode: 'CMP-OTH' }
  ];

  batchConfigs.forEach(b => {
    for (let i = 1; i <= 100; i++) {
      const serialNum = `${b.batchId}-${i.toString().padStart(4, '0')}`;
      const compId = `${b.compCode}-${(100000 + i).toString().slice(1)}`;
      const isDefective = b.batchId === 'ABC';
      const isAssembled = i <= 87; // First 87 units were assembled into finished products
      const assignedProductId = isAssembled ? `GT-DEV-00000${(800 + i).toString().padStart(3, '0')}` : undefined;

      components.push({
        componentId: compId,
        serialNumber: serialNum,
        batchId: b.batchId,
        type: b.type,
        manufacturer: b.mfg,
        supplier: b.supp,
        location: b.loc,
        mfgDate: '2026-10-01',
        status: isDefective ? (isAssembled ? 'Recalled' : 'Quality Failed') : (isAssembled ? 'Quality Passed' : 'In Production'),
        qualityStatus: isDefective ? 'Failed' : 'Passed',
        passportRef: assignedProductId ? `/passport/${assignedProductId}` : undefined,
        verificationStatus: isDefective ? 'Flagged' : 'Demo Verified',
        cryptographicHash: pseudoHash(`COMPONENT-${serialNum}-${compId}`),
        installedInProductId: assignedProductId
      });
    }
  });

  return components;
}

// Generate Finished Products (87 products assembled containing Batch ABC)
export function generateInitialProducts(): ProductRecord[] {
  const products: ProductRecord[] = [];

  for (let i = 1; i <= 87; i++) {
    const num = 800 + i;
    const productId = `GT-DEV-00000${num.toString().padStart(3, '0')}`;
    const displaySerial = `ABC-${i.toString().padStart(4, '0')}`;
    const batterySerial = `BTR-${((i * 3) % 100 + 1).toString().padStart(4, '0')}`;
    const pcbSerial = `PCB-${((i * 7) % 100 + 1).toString().padStart(4, '0')}`;
    const cameraSerial = `CAM-${((i * 11) % 100 + 1).toString().padStart(4, '0')}`;
    const speakerSerial = `SPK-${((i * 5) % 100 + 1).toString().padStart(4, '0')}`;
    const frameSerial = `FRM-${((i * 2) % 100 + 1).toString().padStart(4, '0')}`;
    const othersSerial = `OTH-${((i * 4) % 100 + 1).toString().padStart(4, '0')}`;

    // Target shipment grouping (14 shipments)
    // Product 851 belongs to GT-SHP-00000326
    let shipmentId = 'GT-SHP-00000326';
    if (productId !== 'GT-DEV-00000851') {
      const shpNum = 320 + (i % 14);
      shipmentId = `GT-SHP-00000${shpNum}`;
    }

    // Specific showcase product: GT-DEV-00000851
    const isShowcase = productId === 'GT-DEV-00000851';

    products.push({
      productId,
      productModel: 'Galaxy S24 Ultra Titanium DPP Edition',
      imeiMasked: isShowcase ? '356789123456780' : `3567891${(10000000 + i).toString().slice(1)}`,
      installedComponents: {
        displaySerial: isShowcase ? 'ABC-0042' : displaySerial,
        batterySerial: isShowcase ? 'BTR-0018' : batterySerial,
        pcbSerial: isShowcase ? 'PCB-0073' : pcbSerial,
        cameraSerial: isShowcase ? 'CAM-0034' : cameraSerial,
        speakerSerial: isShowcase ? 'SPK-0012' : speakerSerial,
        frameSerial: isShowcase ? 'FRM-0048' : frameSerial,
        othersSerial: isShowcase ? 'OTH-0021' : othersSerial,
      },
      installedBatches: {
        displayBatch: 'ABC',
        batteryBatch: 'BTR',
        pcbBatch: 'PCB',
        cameraBatch: 'CAM',
        speakerBatch: 'SPK',
        frameBatch: 'FRM',
      },
      assemblyDate: '2026-10-02',
      assemblyFacility: 'Smart Manufacturing Mega-Hub 4, Gumi',
      status: isShowcase ? 'Recall Flagged' : (i <= 62 ? 'Delivered' : 'Shipped'),
      passportStatus: 'Active',
      shipmentId,
      blockchainTx: pseudoHash(`PASSPORT-TX-${productId}`),
      merkleRoot: pseudoHash(`MERKLE-ROOT-${productId}`),
      isTampered: false,
      isLocked: false
    });
  }

  return products;
}

// Generate Initial Shipments (14 shipments covering 87 phones)
export function generateInitialShipments(products: ProductRecord[]): ShipmentRecord[] {
  const shipments: ShipmentRecord[] = [];
  const destinations = [
    { dest: 'Central European Distribution Hub (Frankfurt, DE)', carrier: 'DHL Express Global Forwarding' },
    { dest: 'North American Hub (Chicago Logistics Center, US)', carrier: 'FedEx Priority Freight' },
    { dest: 'Nordic Electronics Hub (Stockholm, SE)', carrier: 'Maersk Air Cargo' },
    { dest: 'Asia-Pacific Retail Hub (Singapore Changi Logistics)', carrier: 'Nippon Express Air' },
    { dest: 'UK Central Warehouse (Milton Keynes, UK)', carrier: 'DPD Logistics' },
    { dest: 'Gulf Region Fulfillment (Dubai Logistics City, UAE)', carrier: 'Emirates SkyCargo' }
  ];

  // Specific showcase shipment: GT-SHP-00000326
  const showcaseProducts = ['GT-DEV-00000851', 'GT-DEV-00000852', 'GT-DEV-00000853', 'GT-DEV-00000856'];
  shipments.push({
    shipmentId: 'GT-SHP-00000326',
    packageIds: ['PKG-88210-A', 'PKG-88210-B'],
    productIds: showcaseProducts,
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
  });

  // Other 13 shipments
  for (let s = 1; s <= 13; s++) {
    const shpId = `GT-SHP-00000${(320 + s).toString().padStart(3, '0')}`;
    const assignedProds = products.filter(p => p.shipmentId === shpId).map(p => p.productId);
    const destInfo = destinations[s % destinations.length];
    const isDelivered = s <= 8;

    shipments.push({
      shipmentId: shpId,
      packageIds: [`PKG-77${s}-01`, `PKG-77${s}-02`],
      productIds: assignedProds.length > 0 ? assignedProds : [`GT-DEV-000008${(10 + s)}`],
      origin: 'Gumi Mega-Hub 4, South Korea',
      destination: destInfo.dest,
      carrier: destInfo.carrier,
      dispatchTime: `2026-10-02 0${(s % 8) + 1}:00:00`,
      expectedDelivery: isDelivered ? '2026-10-05 16:00:00' : '2026-10-09 18:00:00',
      currentStatus: isDelivered ? 'Delivered' : 'In Transit',
      currentLocation: isDelivered ? destInfo.dest : 'Regional Hub Sorting Facility',
      temperature: '22.0 °C',
      humidity: '48% RH',
      checkpoints: [
        { id: `CP-${s}-1`, name: 'Factory Dispatch Scan', location: 'Gumi Mega-Hub 4', timestamp: '2026-10-02 09:00:00', status: 'Completed', scanHash: pseudoHash(`CP-DISP-${shpId}`) },
        { id: `CP-${s}-2`, name: 'Regional Hub Scan', location: destInfo.dest, timestamp: isDelivered ? '2026-10-05 14:00:00' : 'Current', status: isDelivered ? 'Completed' : 'Current', scanHash: pseudoHash(`CP-HUB-${shpId}`) }
      ]
    });
  }

  return shipments;
}

// Generate Unit-Level Manufacturing Events
export function generateInitialManufacturingEvents(): ManufacturingEvent[] {
  const events: ManufacturingEvent[] = [];

  // 1. Stage A: Display Component Manufacturing (for display units ABC-0001 through ABC-0100)
  // Especially ABC-0001, ABC-0042, etc.
  const displayOps = [
    { opId: '1.1', name: 'Raw Material Receipt', sec: 'Component Manufacturing' as const, machine: 'RM-01', oper: 'OP-KIM-21', time: '2026-10-01 08:00', result: 'OK' as const },
    { opId: '1.2', name: 'Glass Cutting', sec: 'Component Manufacturing' as const, machine: 'GC-02', oper: 'OP-PARK-08', time: '2026-10-01 08:20', result: 'OK' as const },
    { opId: '1.3', name: 'TFT Deposition', sec: 'Component Manufacturing' as const, machine: 'TFT-03', oper: 'OP-AUTO-ROBOT', time: '2026-10-01 08:45', result: 'OK' as const },
    { opId: '1.4', name: 'Polarizer Lamination', sec: 'Component Manufacturing' as const, machine: 'PL-04', oper: 'OP-LEE-14', time: '2026-10-01 09:10', result: 'OK' as const },
    { opId: '1.5', name: 'Adhesive Gluing', sec: 'Component Manufacturing' as const, machine: 'AG-05', oper: 'OP-CHOI-03', time: '2026-10-01 09:25', result: 'OK' as const },
    { opId: '1.6', name: 'Display Sticking', sec: 'Component Manufacturing' as const, machine: 'ST-06', oper: 'OP-JUNG-19', time: '2026-10-01 09:30', result: 'OK' as const },
    { opId: '1.7', name: 'Preheating / Curing', sec: 'Component Manufacturing' as const, machine: 'PH-07', oper: 'OP-HEATER-AUTO', time: '2026-10-01 10:00', result: 'OK' as const },
    { opId: '1.8', name: 'Electrical Test', sec: 'Component Manufacturing' as const, machine: 'ET-08', oper: 'OP-TEST-STN1', time: '2026-10-01 10:15', result: 'OK' as const },
    { opId: '1.9', name: 'Final Quality Inspection', sec: 'Component Manufacturing' as const, machine: 'INSP-09', oper: 'OP-QC-LEAD', time: '2026-10-01 10:30', result: 'OK' as const },
  ];

  // Generate events for key display units
  const keyDisplaySerials = ['ABC-0001', 'ABC-0002', 'ABC-0003', 'ABC-0042', 'ABC-0087', 'ABC-0100'];
  keyDisplaySerials.forEach(serial => {
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
        verificationStatus: 'Demo Verified'
      });
      parentHash = hash;
    });
  });

  // 2. Stage B: Smartphone Assembly Line Events (as in infographic section 3)
  const assemblyOps = [
    { eventId: 'EVT-100201', opId: '3.1', name: 'PCB Assembly', machine: 'SMT-01', result: 'OK' as const },
    { eventId: 'EVT-100202', opId: '3.2', name: 'Component Mounting', machine: 'AS-02', result: 'OK' as const },
    { eventId: 'EVT-100203', opId: '3.3', name: 'Main Assembly', machine: 'AS-03', result: 'OK' as const },
    { eventId: 'EVT-100204', opId: '3.4', name: 'Final Assembly & Sealing', machine: 'FA-01', result: 'OK' as const },
    { eventId: 'EVT-100205', opId: '3.5', name: 'Functional Test', machine: 'FT-01', result: 'OK' as const },
    { eventId: 'EVT-100206', opId: '3.6', name: 'Packaging', machine: 'PK-01', result: 'OK' as const },
  ];

  // Specific events for showcase phone GT-DEV-00000851
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
      verificationStatus: 'Demo Verified'
    });
    prodParentHash = hash;
  });

  return events;
}

// Initial Recall Case (Batch ABC Defective)
export const initialRecallCase: RecallCase = {
  recallId: 'REC-2026-001',
  batchId: 'ABC',
  componentType: 'Display',
  defectCategory: 'Delamination & Thermal Micro-fracture',
  severity: 'Critical',
  discoveryDate: '2026-10-05',
  affectedOperation: '1.5 Adhesive Gluing / 1.7 Preheating Curing',
  description: 'Display batch ABC exhibited micro-delamination along the lower bezel when subjected to extended thermal cycles. Curing oven PH-07 sensor variance caused premature crystallization of the optical adhesive.',
  status: 'Recall Initiated',
  unitsInBatch: 100,
  affectedComponents: Array.from({ length: 100 }, (_, i) => `ABC-${(i + 1).toString().padStart(4, '0')}`),
  affectedProductIds: Array.from({ length: 87 }, (_, i) => `GT-DEV-00000${(801 + i).toString().padStart(3, '0')}`),
  affectedShipmentIds: [
    'GT-SHP-00000326', 'GT-SHP-00000321', 'GT-SHP-00000322', 'GT-SHP-00000323',
    'GT-SHP-00000324', 'GT-SHP-00000325', 'GT-SHP-00000327', 'GT-SHP-00000328',
    'GT-SHP-00000329', 'GT-SHP-00000330', 'GT-SHP-00000331', 'GT-SHP-00000332',
    'GT-SHP-00000333', 'GT-SHP-00000334'
  ],
  deliveredCount: 62,
  inTransitCount: 25,
  warehouseCount: 13,
  rootCause: 'Machine PH-07 thermal sensor thermocouple TC-03 uncalibrated by +8.2°C during cycle ABC-20261001-09.',
  actionsTaken: [
    'Flagged Batch ABC in GeneaTrace immutable ledger',
    'Traversed Merkle-DAG to isolate all 87 finished phones in < 62ms',
    'Dispatched targeted recall hold orders to DHL/FedEx logistics carriers',
    'Pushing signed DPP notification to retail POS & authorized distributor systems'
  ]
};

// Initial Device Security Simulation
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
  { id: 'INT-MES-02', name: 'Siemens Opcenter MES', category: 'MES', description: 'Production events, work order tracking, station routing, WIP tracking', status: 'Connected', lastSync: '12 sec ago', eventsIngested: 142800, failedEvents: 2, protocol: 'OPC UA / AMQP' },
  { id: 'INT-SCADA-03', name: 'Ignition SCADA & PLC Gateway', category: 'SCADA', description: 'Machine temperatures, curing profiles, torque sensors, vacuum pressure', status: 'Connected', lastSync: '3 sec ago', eventsIngested: 894310, failedEvents: 0, protocol: 'MQTT Sparkplug B' },
  { id: 'INT-QMS-04', name: 'ETQ Reliance QMS', category: 'Quality', description: 'Inspection results, visual AOI defect logs, CAPA compliance', status: 'Connected', lastSync: '2 min ago', eventsIngested: 21340, failedEvents: 1, protocol: 'REST Webhooks' },
  { id: 'INT-LOG-05', name: 'Oracle TMS Logistics Network', category: 'Logistics', description: 'Shipment manifests, carrier API scans, geofence checkpoint alerts', status: 'Connected', lastSync: '45 sec ago', eventsIngested: 53200, failedEvents: 0, protocol: 'EDI / REST' },
  { id: 'INT-SUP-06', name: 'Supplier Portal Gateway', category: 'Suppliers', description: 'Cryptographic component batch manifests from Samsung, Sony, ATL', status: 'Connected', lastSync: '8 min ago', eventsIngested: 14500, failedEvents: 0, protocol: 'AS2 / JSON-LD' },
];

// Blockchain Demo Audit Checkpoints
export const initialBlockchainBlocks: BlockchainAuditBlock[] = [
  { blockNumber: 1849201, txHash: '0xa45b98cf120194bc87123985', timestamp: '2026-10-01 10:35:12', entityType: 'Batch Checkpoint', entityId: 'Batch ABC (Display 100 units)', merkleRoot: '0x9924a7bc8100234b67912384', validatorNode: 'Validator-Korea-Telecom-01', status: 'Demo Confirmed' },
  { blockNumber: 1849215, txHash: '0x8821bcfae190349281a95b01', timestamp: '2026-10-01 11:20:04', entityType: 'Batch Checkpoint', entityId: 'Batch BTR (Battery 100 units)', merkleRoot: '0xaa19c8201bfde84910283451', validatorNode: 'Validator-AWS-Zurich-02', status: 'Demo Confirmed' },
  { blockNumber: 1849340, txHash: '0x33b879102cdaef0982715011', timestamp: '2026-10-02 12:00:22', entityType: 'Passport Issuance', entityId: 'GT-DEV-00000851 (Galaxy S24 Ultra)', merkleRoot: '0xfe881023ba91739812401827', validatorNode: 'Validator-T-Systems-EU-03', status: 'Demo Confirmed' },
  { blockNumber: 1849502, txHash: '0xbc3381a94829100147cb9921', timestamp: '2026-10-05 06:16:10', entityType: 'Recall Event', entityId: 'Recall REC-2026-001 (Batch ABC Display)', merkleRoot: '0x11029487cbea901237492018', validatorNode: 'Validator-Korea-Telecom-01', status: 'Demo Confirmed' },
];
