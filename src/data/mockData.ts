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
    batchId: 'AAA',
    sector: 'Consumer Electronics',
    componentType: 'Display',
    batchSize: 1,
    serialPrefix: 'AAA',
    supplier: 'Samsung Display Corp',
    facility: 'Cleanroom Complex Alpha (Line 3)',
    productionDate: '2026-10-01',
    status: 'Defective',
    defectReason: 'Micro-thermal flux variance during Machine DISP-04 lamination stage',
    inspectionResult: 'Optical Lamination Tolerance Drift (EL-08)',
    completedOperationsCount: 4,
    totalOperationsCount: 4,
    blockchainCheckpointTx: '0xa45b98cf120194bc87123985',
    checkpointStatus: 'Anchored'
  }
];

// Generate Components for production batches (Single Showcase Component)
export function generateInitialComponents(): ComponentRecord[] {
  return [
    {
      componentId: 'CMP-DIS-000042',
      serialNumber: 'AAA-0042',
      batchId: 'AAA',
      type: 'Display',
      sector: 'Consumer Electronics',
      manufacturer: 'Samsung Display Corp',
      supplier: 'Samsung Display Corp',
      location: 'Cleanroom Complex Alpha (Line 3)',
      mfgDate: '2026-10-01',
      status: 'Recalled',
      qualityStatus: 'Failed',
      passportRef: '/passport/AAA12345678',
      verificationStatus: 'Flagged',
      cryptographicHash: pseudoHash('COMPONENT-AAA-0042-CMP-DIS-000042'),
      installedInProductId: 'AAA12345678'
    }
  ];
}

// Generate Manufactured Finished Products (Single Showcase Device - Samsung Galaxy A55 5G)
export function generateInitialProducts(): ProductRecord[] {
  return [
    {
      productId: 'AAA12345678',
      productModel: 'Samsung Galaxy A55 5G (Enterprise Traceable)',
      sector: 'Consumer Electronics',
      productTypeDisplay: 'Smartphone (5G Super AMOLED)',
      imeiMasked: '356789123456780',
      installedComponents: {
        'Display Module': 'AAA-0042',
        displaySerial: 'AAA-0042'
      },
      installedBatches: {
        displayBatch: 'AAA'
      },
      assemblyDate: '2026-10-02',
      assemblyFacility: 'Samsung Smart Mega-Hub 4, Gumi',
      status: 'Recall Flagged',
      passportStatus: 'Active',
      shipmentId: 'GT-SHP-00000326',
      blockchainTx: pseudoHash('PASSPORT-TX-AAA12345678'),
      merkleRoot: '0x9f3b8a1c4e72d05f88b14a2c91e3f706',
      isTampered: false,
      isLocked: false,
      complianceStandards: ['EU DPP Directive (ESPR)', 'RoHS-3 Compliant', 'WEEE Traceable'],
      carbonFootprintKg: 42.8,
      recycledContentPct: 28.5,
      esgScore: 'A+ (95/100)',

      // Customer Sale Recorded at Retailer
      customerSale: {
        customerName: 'Vikram Malhotra',
        phone: '+91 98765 43210',
        saleDate: '2026-10-15',
        invoiceNo: 'INV-BLR-2026-8812',
        retailerShop: 'Apex Retail & Service Hub - Indiranagar',
        status: 'Returned For Repair'
      },

      // Chronological Manufacturing Stages (Pushed via /scanner)
      assemblyStages: [
        {
          stageIndex: 1,
          name: 'SMT PCB Solder & Flux Printing',
          machineId: 'SMT-01',
          timestamp: '2026-10-02 08:30:14 UTC',
          operator: 'Rajesh V.',
          status: 'Completed',
          hash: '0x1a8f9c4b220194bc'
        },
        {
          stageIndex: 2,
          name: 'Super AMOLED Display Module Lamination',
          machineId: 'DISP-04',
          timestamp: '2026-10-02 09:12:45 UTC',
          operator: 'Elena Rostova',
          status: 'Flagged (Thermal Variance Detected)',
          hash: '0x2b7e6d5a88194c71'
        },
        {
          stageIndex: 3,
          name: 'Motherboard & Secure Enclave Cryptographic Binding',
          machineId: 'SEC-02',
          timestamp: '2026-10-02 10:05:22 UTC',
          operator: 'Kenji Sato',
          status: 'Completed',
          hash: '0x3c6d5e4f440285a2'
        },
        {
          stageIndex: 4,
          name: 'Automated Optical Inspection (AOI) Quality Gate',
          machineId: 'AOI-01',
          timestamp: '2026-10-02 10:45:00 UTC',
          operator: 'Automated Gate',
          status: 'Sealed & Merkle Root Anchored',
          hash: '0x4d5c6b7a993184ef'
        }
      ]
    },
    {
      productId: 'GT-DEV-00000851',
      productModel: 'Galaxy S25 Ultra Titanium (SM-S928 DPP Edition)',
      sector: 'Consumer Electronics',
      productTypeDisplay: 'Flagship Smartphone (Snapdragon 8 Gen 4)',
      imeiMasked: '359812048821901',
      installedComponents: {
        'Display Module': 'CMP-DIS-8801',
        'Battery Cell': 'BTR-5000-A2',
        'Mainboard': 'PCB-MB-S25U'
      },
      installedBatches: {
        'Display Module': 'DISP-Q4',
        'Battery Cell': 'CELL-2026-09',
        'Mainboard': 'SMT-ALPHA-01'
      },
      assemblyDate: '2026-10-04',
      assemblyFacility: 'Samsung Smart Mega-Hub 4, Gumi',
      status: 'Delivered',
      passportStatus: 'Active',
      shipmentId: 'GT-SHP-00000326',
      blockchainTx: pseudoHash('PASSPORT-TX-GT-DEV-00000851'),
      merkleRoot: '0x8f2c3d4e5a6b7c8d9e0f1a2b3c4d5e6f',
      isTampered: false,
      isLocked: false,
      complianceStandards: ['EU DPP Directive (ESPR)', 'RoHS-3 Compliant', 'CE Certified'],
      carbonFootprintKg: 46.2,
      recycledContentPct: 32.0,
      esgScore: 'A+ (97/100)',
      customerSale: {
        customerName: 'Ananya Deshmukh',
        phone: '+91 98201 55432',
        saleDate: '2026-10-18',
        invoiceNo: 'INV-BLR-2026-9041',
        retailerShop: 'Samsung Experience Store - Phoenix Mall, Bangalore',
        status: 'Sold'
      },
      assemblyStages: [
        {
          stageIndex: 1,
          name: 'Grade-5 Titanium Frame CNC Milling',
          machineId: 'CNC-TITAN-01',
          timestamp: '2026-10-04 07:15:00 UTC',
          operator: 'Dae-Jung Kim',
          status: 'Completed',
          hash: '0x7a8b9c0d1e2f3a4b'
        },
        {
          stageIndex: 2,
          name: 'Dynamic AMOLED 2X Display Optical Bonding',
          machineId: 'DISP-02',
          timestamp: '2026-10-04 08:30:00 UTC',
          operator: 'Min-Soo Park',
          status: 'Completed',
          hash: '0x8b9c0d1e2f3a4b5c'
        },
        {
          stageIndex: 3,
          name: 'Secure Enclave & Knox Cryptographic Fusion',
          machineId: 'SEC-01',
          timestamp: '2026-10-04 09:45:00 UTC',
          operator: 'Automated Enclave Gate',
          status: 'Completed',
          hash: '0x9c0d1e2f3a4b5c6d'
        },
        {
          stageIndex: 4,
          name: 'Hermetic IP68 Pressure Seal & Merkle Root Anchor',
          machineId: 'SEAL-04',
          timestamp: '2026-10-04 10:20:00 UTC',
          operator: 'QC Gate Alpha',
          status: 'Sealed & Merkle Root Anchored',
          hash: '0xad0e1f2a3b4c5d6e'
        }
      ]
    },
    {
      productId: 'GT-EVB-00094120',
      productModel: '800V High-Density NMC EV Battery Pack (102 kWh)',
      sector: 'Automotive & EV Battery',
      productTypeDisplay: 'High-Voltage Traction Battery (EU Battery DPP 2023/1542)',
      imeiMasked: 'UDI-EVB-800V-94120',
      installedComponents: {
        'Battery Management System (BMS)': 'BMS-800V-0041',
        'Prismatic Cell Module Array': 'MOD-NMC-0881',
        'Thermal Cooling Plate': 'THM-COOL-102'
      },
      installedBatches: {
        'Battery Management System (BMS)': 'BMS-LOT-12',
        'Prismatic Cell Module Array': 'NMC-811-Q3',
        'Thermal Cooling Plate': 'THM-ALUM-04'
      },
      assemblyDate: '2026-09-28',
      assemblyFacility: 'Cleanroom Gigafactory 1, Salzgitter',
      status: 'Delivered',
      passportStatus: 'Active',
      shipmentId: 'GT-SHP-00000326',
      blockchainTx: pseudoHash('PASSPORT-TX-GT-EVB-00094120'),
      merkleRoot: '0x7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b',
      isTampered: false,
      isLocked: false,
      complianceStandards: ['EU Battery Regulation (2023/1542)', 'ISO 26262 ASIL-D', 'UN 38.3 Certified'],
      carbonFootprintKg: 58.4,
      recycledContentPct: 44.5,
      esgScore: 'A++ (99/100)',
      batteryChemistry: 'NMC 811 (Nickel-Manganese-Cobalt)',
      stateOfHealth: 100,
      customerSale: {
        customerName: 'Volvo Car Mobility Fleet',
        phone: '+46 31 590 000',
        saleDate: '2026-10-12',
        invoiceNo: 'INV-EU-2026-4410',
        retailerShop: 'Direct OEM Assembly Delivery - Torslanda Plant',
        status: 'Sold'
      },
      assemblyStages: [
        {
          stageIndex: 1,
          name: 'Prismatic Cell Stacking & Laser Tab Welding',
          machineId: 'WELD-CELL-08',
          timestamp: '2026-09-28 06:30:00 UTC',
          operator: 'Hans Gruber',
          status: 'Completed',
          hash: '0x1b2c3d4e5f6a7b8c'
        },
        {
          stageIndex: 2,
          name: 'Dielectric Thermal Gap Filler Ingestion',
          machineId: 'DISP-THM-01',
          timestamp: '2026-09-28 07:45:00 UTC',
          operator: 'Lukas Meyer',
          status: 'Completed',
          hash: '0x2c3d4e5f6a7b8c9d'
        },
        {
          stageIndex: 3,
          name: 'High-Voltage Insulation & ASIL-D BMS Attestation',
          machineId: 'BMS-TEST-02',
          timestamp: '2026-09-28 09:10:00 UTC',
          operator: 'Automated Hi-Pot Station',
          status: 'Completed',
          hash: '0x3d4e5f6a7b8c9d0e'
        },
        {
          stageIndex: 4,
          name: 'EU Battery DPP Cloud Seal & Merkle Blockchain Anchor',
          machineId: 'DPP-ANCHOR-01',
          timestamp: '2026-09-28 10:00:00 UTC',
          operator: 'Automated Certification Gate',
          status: 'Sealed & Merkle Root Anchored',
          hash: '0x4e5f6a7b8c9d0e1f'
        }
      ]
    },
    {
      productId: 'GT-MED-00041289',
      productModel: 'Titanium Cardiac Bio-Telemetry Pacemaker (Class III)',
      sector: 'Medical Technology',
      productTypeDisplay: 'Class III Active Implantable Medical Device (EU MDR)',
      imeiMasked: 'UDI-DI-008401928341',
      installedComponents: {
        'Bio-Compatible Lead Sensor': 'MED-SEN-412',
        'Solid-State Micro Battery': 'MED-BAT-990',
        'Encrypted RF Telemetry Transceiver': 'RF-MED-771'
      },
      installedBatches: {
        'Bio-Compatible Lead Sensor': 'MED-LOT-A',
        'Solid-State Micro Battery': 'BAT-SOL-02',
        'Encrypted RF Telemetry Transceiver': 'RF-ISO-09'
      },
      assemblyDate: '2026-09-20',
      assemblyFacility: 'Cleanroom Class 100 Precision Bio-Facility, Zurich',
      status: 'Delivered',
      passportStatus: 'Active',
      shipmentId: 'GT-SHP-00000326',
      blockchainTx: pseudoHash('PASSPORT-TX-GT-MED-00041289'),
      merkleRoot: '0x5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f',
      isTampered: false,
      isLocked: false,
      complianceStandards: ['EU MDR (2017/745) Class III', 'ISO 13485:2016 Certified', 'FDA 21 CFR Part 820'],
      carbonFootprintKg: 3.8,
      recycledContentPct: 15.0,
      esgScore: 'A+ (98/100)',
      customerSale: {
        customerName: 'St. Jude Heart Institute - Cardiology Wing',
        phone: '+41 44 255 11 11',
        saleDate: '2026-10-05',
        invoiceNo: 'INV-MED-2026-1102',
        retailerShop: 'Direct Hospital Medical Distribution - Zurich Center',
        status: 'Sold'
      },
      assemblyStages: [
        {
          stageIndex: 1,
          name: 'Laser Beam Hermetic Titanium Canister Micro-Welding',
          machineId: 'LASER-BIO-01',
          timestamp: '2026-09-20 07:00:00 UTC',
          operator: 'Dr. Beatrix Keller',
          status: 'Completed',
          hash: '0x9a8b7c6d5e4f3a2b'
        },
        {
          stageIndex: 2,
          name: 'Helium Leak Micro-Torr Mass Spectrometry Inspection',
          machineId: 'SPECTRO-HE-02',
          timestamp: '2026-09-20 08:30:00 UTC',
          operator: 'Marco Vane',
          status: 'Completed',
          hash: '0x8b7c6d5e4f3a2b1c'
        },
        {
          stageIndex: 3,
          name: 'Ethylene Oxide (EtO) Medical Terminal Sterilization',
          machineId: 'STERIL-ETO-04',
          timestamp: '2026-09-20 10:15:00 UTC',
          operator: 'Automated Sterilization Chamber',
          status: 'Completed',
          hash: '0x7c6d5e4f3a2b1c0d'
        },
        {
          stageIndex: 4,
          name: 'EUDAMED UDI-DI Anchoring & Merkle Sealing',
          machineId: 'EUDAMED-GATE-01',
          timestamp: '2026-09-20 11:00:00 UTC',
          operator: 'Quality Assurance Officer',
          status: 'Sealed & Merkle Root Anchored',
          hash: '0x6d5e4f3a2b1c0d9e'
        }
      ]
    }
  ];
}

// Generate Shipments (Single Showcase Shipment)
export function generateInitialShipments(products: ProductRecord[]): ShipmentRecord[] {
  return [
    {
      shipmentId: 'GT-SHP-00000326',
      packageIds: ['PKG-88210-A'],
      productIds: ['AAA12345678', 'GT-DEV-00000851'],
      origin: 'Samsung Mega-Hub 4, Gumi',
      destination: 'Apex Retail Hub, Indiranagar, Bangalore',
      carrier: 'DHL Express Supply Chain Intercontinental',
      dispatchTime: '2026-10-03 08:30:00',
      expectedDelivery: '2026-10-07 14:00:00',
      currentStatus: 'Delivered',
      currentLocation: 'Apex Retail & Service Hub, Indiranagar',
      temperature: '21.4 °C (Nominal)',
      humidity: '44% RH',
      checkpoints: [
        { id: 'CP-1', name: 'Packaging & Seal Authentication', location: 'Gumi Mega-Hub 4', timestamp: '2026-10-03 08:30:00', status: 'Completed', scanHash: pseudoHash('CP-1-326') },
        { id: 'CP-2', name: 'Factory Outbound Warehouse Clearance', location: 'Gumi Logistics Bay 2', timestamp: '2026-10-03 14:20:00', status: 'Completed', scanHash: pseudoHash('CP-2-326') },
        { id: 'CP-3', name: 'Carrier Air Freight Dispatched', location: 'Incheon Cargo Air Terminal', timestamp: '2026-10-04 02:15:00', status: 'Completed', scanHash: pseudoHash('CP-3-326') },
        { id: 'CP-4', name: 'Delivered to Retail Hub', location: 'Apex Retail & Service Hub, Indiranagar', timestamp: '2026-10-06 11:30:00', status: 'Completed', scanHash: pseudoHash('CP-4-326') }
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

// Initial Recall Case (Single Showcase Recall - Samsung Galaxy A55 5G)
export const initialRecallCase: RecallCase = {
  recallId: 'REC-2026-AAA',
  batchId: 'AAA',
  sector: 'Consumer Electronics',
  componentType: 'Display',
  defectCategory: 'Delamination & Thermal Micro-fracture',
  severity: 'Critical',
  discoveryDate: '2026-10-05',
  affectedOperation: 'Stage 2: Super AMOLED Display Module Lamination (Machine DISP-04)',
  description: 'Display batch AAA exhibited micro-delamination and green line artifact along the lower matrix when subjected to thermal cycles. Machine DISP-04 thermal lamination sensor variance caused premature crystallization of the optical adhesive.',
  status: 'Recall Initiated',
  unitsInBatch: 1,
  affectedComponents: ['AAA-0042'],
  affectedProductIds: ['AAA12345678'],
  affectedShipmentIds: ['GT-SHP-00000326'],
  deliveredCount: 1,
  inTransitCount: 0,
  warehouseCount: 0,
  rootCause: 'Machine DISP-04 thermal sensor thermocouple uncalibrated by +8.2°C during Stage 2 display lamination of Batch AAA.',
  actionsTaken: [
    'Flagged Batch AAA in GeneaTrace immutable ledger',
    'Traversed Merkle-DAG to isolate product AAA12345678 in < 12ms',
    'Dispatched targeted recall hold order to Apex Retail Hub - Indiranagar',
    'Generated RMA Docket RMA-BLR-AAA12345678 for factory repair & redelivery'
  ]
};

// Device Security Status (Showcase Device - Samsung Galaxy A55 5G)
export const initialSecurityStatus: SecurityStatus = {
  productId: 'AAA12345678',
  imei: '356789123456780',
  hardwareHashMatches: true,
  signatureValid: true,
  componentsAuthentic: true,
  status: 'Verified',
  lockCommandStatus: 'None',
  simulatedAuditLogs: [
    { timestamp: '2026-10-02 10:45:00', event: 'Factory DPP Identity Provisioned & Signed', actor: 'Gumi Mega-Hub Security Enclave', hash: '0x12a990bf...' },
    { timestamp: '2026-10-03 08:31:00', event: 'Logistics Handover Attestation Validated', actor: 'DHL Secure Handheld Gate', hash: '0x88fca002...' },
    { timestamp: '2026-10-06 11:30:00', event: 'Retail Hub Indiranagar Delivery Handover Passed', actor: 'Apex Retail Node Scanner', hash: '0xbc3381a9...' }
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
