import {
  BatchRecord,
  ComponentRecord,
  ProductRecord,
  ShipmentRecord,
  ManufacturingEvent,
  RecallCase,
  SecurityStatus,
  IntegrationStatus,
  BlockchainAuditBlock,
  IndustrySector
} from '../types';
import { pseudoHash } from '../utils/hashing';

// Multi-Industry Initial Batches
export const initialBatches: BatchRecord[] = [
  // Consumer Electronics Batches
  {
    batchId: 'ABC',
    sector: 'Consumer Electronics',
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
    sector: 'Consumer Electronics',
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
    sector: 'Consumer Electronics',
    componentType: 'Main PCB',
    batchSize: 100,
    serialPrefix: 'PCB',
    supplier: 'Samsung Electro-Mechanics',
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
    sector: 'Consumer Electronics',
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
    sector: 'Consumer Electronics',
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
    sector: 'Consumer Electronics',
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

  // Automotive & EV Battery Batches (EU Battery Passport Compliant)
  {
    batchId: 'CELL-96',
    sector: 'Automotive & EV Battery',
    componentType: 'Prismatic Cell',
    batchSize: 100,
    serialPrefix: 'CELL',
    supplier: 'CATL / Northvolt Gigafactory',
    facility: 'Skellefteå Gigafactory 1',
    productionDate: '2026-09-20',
    status: 'Quality Passed',
    inspectionResult: 'Passed Ultrasonic Welding & Helium Leak Test',
    completedOperationsCount: 8,
    totalOperationsCount: 8,
    blockchainCheckpointTx: '0x77c920194bc0284719283741',
    checkpointStatus: 'Anchored'
  },
  {
    batchId: 'BMS-800',
    sector: 'Automotive & EV Battery',
    componentType: 'BMS Module',
    batchSize: 100,
    serialPrefix: 'BMS',
    supplier: 'Bosch Automotive Electronics',
    facility: 'Stuttgart Mobility Fab 2',
    productionDate: '2026-09-22',
    status: 'Quality Passed',
    inspectionResult: 'ISO 26262 ASIL-D Functional Safety Verified',
    completedOperationsCount: 6,
    totalOperationsCount: 6,
    blockchainCheckpointTx: '0x44fa908124ccdae190283471',
    checkpointStatus: 'Anchored'
  },
  {
    batchId: 'THM-PLT',
    sector: 'Automotive & EV Battery',
    componentType: 'Thermal Cooling Plate',
    batchSize: 100,
    serialPrefix: 'THM',
    supplier: 'Modine Thermal Systems',
    facility: 'Munich Precision Brazing Line',
    productionDate: '2026-09-21',
    status: 'Quality Passed',
    inspectionResult: 'Passed 4.5 Bar Glycol Pressure Cycle',
    completedOperationsCount: 5,
    totalOperationsCount: 5,
    blockchainCheckpointTx: '0x12bb900147fcda9912089456',
    checkpointStatus: 'Anchored'
  },

  // Medical Technology Batches (FDA UDI Compliant)
  {
    batchId: 'BIO-ENC',
    sector: 'Medical Technology',
    componentType: 'Biocompatible Housing',
    batchSize: 100,
    serialPrefix: 'BIO',
    supplier: 'Medtronic Precision Metallurgy',
    facility: 'Minneapolis Medical Cleanroom ISO Class 5',
    productionDate: '2026-09-18',
    status: 'Quality Passed',
    inspectionResult: 'Passed ASTM F67 Grade 1 Titanium Cytotoxicity',
    completedOperationsCount: 7,
    totalOperationsCount: 7,
    blockchainCheckpointTx: '0x99dd812034bcfa0918234567',
    checkpointStatus: 'Anchored'
  },
  {
    batchId: 'ASIC-MED',
    sector: 'Medical Technology',
    componentType: 'Telemetry ASIC',
    batchSize: 100,
    serialPrefix: 'MED',
    supplier: 'Texas Instruments Medical Division',
    facility: 'Dallas Semiconductor Fab 4',
    productionDate: '2026-09-19',
    status: 'Quality Passed',
    inspectionResult: 'Ultra-Low Power 1.2uW BLE Attestation Passed',
    completedOperationsCount: 6,
    totalOperationsCount: 6,
    blockchainCheckpointTx: '0x66bb89124401827490128456',
    checkpointStatus: 'Anchored'
  },

  // Industrial & Aerospace Batches
  {
    batchId: 'RAD-MCU',
    sector: 'Industrial & Aerospace',
    componentType: 'Radiation-Tolerant MCU',
    batchSize: 100,
    serialPrefix: 'RAD',
    supplier: 'BAE Systems Electronic Systems',
    facility: 'Manassas Radiation Hardened Foundry',
    productionDate: '2026-09-15',
    status: 'Quality Passed',
    inspectionResult: 'Passed 100 krad(Si) Heavy Ion Beam Radiation Tolerance',
    completedOperationsCount: 9,
    totalOperationsCount: 9,
    blockchainCheckpointTx: '0x33aa01928471294857102934',
    checkpointStatus: 'Anchored'
  }
];

// Generate Components across sectors
export function generateInitialComponents(): ComponentRecord[] {
  const components: ComponentRecord[] = [];

  initialBatches.forEach(b => {
    for (let i = 1; i <= b.batchSize; i++) {
      const serialNum = `${b.batchId}-${i.toString().padStart(4, '0')}`;
      const compId = `CMP-${b.componentType.slice(0, 3).toUpperCase()}-${(100000 + i).toString().slice(1)}`;
      const isDefective = b.batchId === 'ABC';
      const isAssembled = i <= 87;
      let assignedProductId: string | undefined = undefined;

      if (b.sector === 'Consumer Electronics') {
        assignedProductId = isAssembled ? `GT-DEV-00000${(800 + i).toString().padStart(3, '0')}` : undefined;
      } else if (b.sector === 'Automotive & EV Battery' && i <= 40) {
        assignedProductId = `GT-EVB-00094${(100 + i).toString().padStart(3, '0')}`;
      } else if (b.sector === 'Medical Technology' && i <= 30) {
        assignedProductId = `GT-MED-00041${(200 + i).toString().padStart(3, '0')}`;
      } else if (b.sector === 'Industrial & Aerospace' && i <= 20) {
        assignedProductId = `GT-AVN-00018${(900 + i).toString().padStart(3, '0')}`;
      }

      components.push({
        componentId: compId,
        serialNumber: serialNum,
        batchId: b.batchId,
        type: b.componentType,
        sector: b.sector,
        manufacturer: b.supplier,
        supplier: b.supplier,
        location: b.facility,
        mfgDate: b.productionDate,
        status: isDefective ? (isAssembled ? 'Recalled' : 'Quality Failed') : (assignedProductId ? 'Quality Passed' : 'In Production'),
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

// Generate Multi-Industry Products (Smartphones, EV Batteries, Medical Implants, Avionics)
export function generateInitialProducts(): ProductRecord[] {
  const products: ProductRecord[] = [];

  // 1. Consumer Electronics: 87 Smartphones (Including GT-DEV-00000851)
  for (let i = 1; i <= 87; i++) {
    const num = 800 + i;
    const productId = `GT-DEV-00000${num.toString().padStart(3, '0')}`;
    const isShowcase = productId === 'GT-DEV-00000851';
    let shipmentId = 'GT-SHP-00000326';
    if (!isShowcase) {
      shipmentId = `GT-SHP-00000${320 + (i % 14)}`;
    }

    products.push({
      productId,
      productModel: 'Galaxy S24 Ultra Titanium DPP Edition',
      sector: 'Consumer Electronics',
      productTypeDisplay: 'Smartphone (5G LTPO)',
      imeiMasked: isShowcase ? '356789123456780' : `3567891${(10000000 + i).toString().slice(1)}`,
      installedComponents: {
        'Display Module': isShowcase ? 'ABC-0042' : `ABC-${i.toString().padStart(4, '0')}`,
        'Battery Cell': isShowcase ? 'BTR-0018' : `BTR-${((i * 3) % 100 + 1).toString().padStart(4, '0')}`,
        'Main PCB': isShowcase ? 'PCB-0073' : `PCB-${((i * 7) % 100 + 1).toString().padStart(4, '0')}`,
        'Camera Module': isShowcase ? 'CAM-0034' : `CAM-${((i * 11) % 100 + 1).toString().padStart(4, '0')}`,
        'Stereo Speaker': isShowcase ? 'SPK-0012' : `SPK-${((i * 5) % 100 + 1).toString().padStart(4, '0')}`,
        'Titanium Frame': isShowcase ? 'FRM-0048' : `FRM-${((i * 2) % 100 + 1).toString().padStart(4, '0')}`,
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
      isLocked: false,
      complianceStandards: ['EU DPP Directive (ESPR)', 'RoHS-3 Compliant', 'WEEE Traceable'],
      carbonFootprintKg: 58.4,
      recycledContentPct: 24.5,
      esgScore: 'A+ (94/100)'
    });
  }

  // 2. Automotive & EV Battery Sector Showcase Product (EU Battery Passport 2023/1542)
  products.push({
    productId: 'GT-EVB-00094120',
    productModel: 'Ultium-Spec 800V 96kWh Modular Traction Battery Pack',
    sector: 'Automotive & EV Battery',
    productTypeDisplay: 'EV Traction Battery Pack (800V High Power)',
    imeiMasked: 'VIN-WP0ZZZ99ZTS-884120',
    installedComponents: {
      'Prismatic Cell Matrix': 'CELL-96-0012',
      'Battery Management System (BMS)': 'BMS-800-0041',
      'Thermal Cold Plate': 'THM-PLT-0019',
      'High Voltage Pyro-Contactor': 'CMP-CON-00032',
      'Copper Busbar Array': 'CMP-BUS-00114',
    },
    installedBatches: {
      cellBatch: 'CELL-96',
      bmsBatch: 'BMS-800',
      thermalBatch: 'THM-PLT',
    },
    assemblyDate: '2026-09-24',
    assemblyFacility: 'Gigafactory Battery Enclave 3, Skellefteå',
    status: 'Delivered',
    passportStatus: 'Active',
    shipmentId: 'GT-SHP-00000328',
    blockchainTx: '0x99bb4012847fcba90123847529',
    merkleRoot: '0x88fc9012847abde01928374615',
    complianceStandards: ['EU Battery Regulation (EU 2023/1542)', 'ISO 26262 ASIL-D', 'UN 38.3 Transport Safety'],
    carbonFootprintKg: 3820,
    recycledContentPct: 41.2, // Recycled cobalt, nickel, lithium
    esgScore: 'AAA ESG Certified',
    batteryChemistry: 'NCM 811 (80% Ni, 10% Co, 10% Mn)',
    stateOfHealth: 100.0
  });

  // 3. Medical Technology Sector Showcase Product (FDA UDI Compliant)
  products.push({
    productId: 'GT-MED-00041289',
    productModel: 'CardioPulse BioTelemetry Implantable Pulse Generator',
    sector: 'Medical Technology',
    productTypeDisplay: 'Class III Implantable Medical Device',
    imeiMasked: 'UDI-(01)00849201948123(21)41289',
    installedComponents: {
      'Biocompatible Titanium Shell': 'BIO-ENC-0008',
      'Low-Power Telemetry ASIC': 'ASIC-MED-0021',
      'Hermetic Ceramic Feedthrough': 'HMT-FEED-0015',
      'Solid-State Micro Lithium-CFx Cell': 'MED-BAT-0004',
    },
    installedBatches: {
      enclosureBatch: 'BIO-ENC',
      asicBatch: 'ASIC-MED',
    },
    assemblyDate: '2026-09-21',
    assemblyFacility: 'Minneapolis Medical Device Cleanroom (ISO Class 5)',
    status: 'Delivered',
    passportStatus: 'Active',
    shipmentId: 'GT-SHP-00000322',
    blockchainTx: '0x77fa01928471928374659102',
    merkleRoot: '0x55dc90182746192837465019',
    complianceStandards: ['FDA UDI 21 CFR 830', 'EU MDR 2017/745 Class III', 'ISO 13485 Medical Devices'],
    carbonFootprintKg: 4.2,
    recycledContentPct: 0.0, // Virgin medical-grade titanium
    esgScore: 'A+ Sterile Grade'
  });

  // 4. Industrial & Aerospace Sector Showcase Product
  products.push({
    productId: 'GT-AVN-00018902',
    productModel: 'FlightSense DO-254 Avionics Edge Controller',
    sector: 'Industrial & Aerospace',
    productTypeDisplay: 'High-Altitude Avionics Flight Controller',
    imeiMasked: 'FAA-PMA-88419204-REV-C',
    installedComponents: {
      'Rad-Tolerant High Reliability MCU': 'RAD-MCU-0005',
      'Hermetic Beryllium-Aluminum Housing': 'AVN-ENC-0012',
      'Triple-Redundant Fiber-Optic Gyro': 'FOG-GYRO-0009',
    },
    installedBatches: {
      mcuBatch: 'RAD-MCU',
    },
    assemblyDate: '2026-09-17',
    assemblyFacility: 'Toulouse Aerospace Advanced Avionics Facility',
    status: 'In Quality Check',
    passportStatus: 'Active',
    shipmentId: 'GT-SHP-00000325',
    blockchainTx: '0x11cc90192847192837465019',
    merkleRoot: '0x99ee90182746192837465012',
    complianceStandards: ['FAA DO-254 Design Assurance Level A', 'DO-178C Airborne Systems', 'MIL-STD-810H'],
    carbonFootprintKg: 18.5,
    recycledContentPct: 15.0,
    esgScore: 'AA Aerospace Defense'
  });

  return products;
}

// Generate Initial Shipments
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

  // Showcase shipment: GT-SHP-00000326
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

  // Other shipments
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

  // Stage A: Display Component Manufacturing
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

  // Stage B: Assembly Line Events for GT-DEV-00000851
  const assemblyOps = [
    { eventId: 'EVT-100201', opId: '3.1', name: 'PCB Assembly', machine: 'SMT-01', result: 'OK' as const },
    { eventId: 'EVT-100202', opId: '3.2', name: 'Component Mounting', machine: 'AS-02', result: 'OK' as const },
    { eventId: 'EVT-100203', opId: '3.3', name: 'Main Assembly', machine: 'AS-03', result: 'OK' as const },
    { eventId: 'EVT-100204', opId: '3.4', name: 'Final Assembly & Sealing', machine: 'FA-01', result: 'OK' as const },
    { eventId: 'EVT-100205', opId: '3.5', name: 'Functional Test', machine: 'FT-01', result: 'OK' as const },
    { eventId: 'EVT-100206', opId: '3.6', name: 'Packaging', machine: 'PK-01', result: 'OK' as const },
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
      verificationStatus: 'Demo Verified'
    });
    prodParentHash = hash;
  });

  // Stage C: EV Battery Pack Assembly Events (for GT-EVB-00094120)
  const evbOps = [
    { eventId: 'EVT-EVB-01', opId: 'E.1', name: 'Cell Laser Tab Ultrasonic Welding', machine: 'WELD-01', result: 'OK' as const },
    { eventId: 'EVT-EVB-02', opId: 'E.2', name: 'Thermal Barrier Aerogel Layer Insertion', machine: 'INS-02', result: 'OK' as const },
    { eventId: 'EVT-EVB-03', opId: 'E.3', name: 'Cold Plate Glycol Circuit Helium Pressure Test', machine: 'PR-03', result: 'OK' as const },
    { eventId: 'EVT-EVB-04', opId: 'E.4', name: 'BMS Wire Harness Optical AOI Inspection', machine: 'BMS-04', result: 'OK' as const },
    { eventId: 'EVT-EVB-05', opId: 'E.5', name: '800V High-Pot Insulation & Dielectric Test', machine: 'HIPOT-05', result: 'OK' as const },
    { eventId: 'EVT-EVB-06', opId: 'E.6', name: 'EU Battery Passport QR Laser Marking', machine: 'LASER-06', result: 'OK' as const },
  ];

  let evbParent = '0x12bb900147fcda9912089456';
  evbOps.forEach((op, idx) => {
    const hash = pseudoHash(`EVB-EVT-${op.eventId}-GT-EVB-00094120-${evbParent}`);
    events.push({
      eventId: op.eventId,
      entityType: 'Product',
      entityId: 'GT-EVB-00094120',
      batchId: 'CELL-96',
      operationId: op.opId,
      operationName: op.name,
      section: 'EV Battery Cell-to-Pack Assembly',
      machineId: op.machine,
      operator: 'GIGA-AUTOMATION-02',
      startTimestamp: `2026-09-24 14:${(idx * 15).toString().padStart(2, '0')}:00`,
      completionTimestamp: `2026-09-24 14:${(idx * 15 + 12).toString().padStart(2, '0')}:00`,
      result: op.result,
      state: 'Completed',
      processParameters: {
        hiPotLeakage: '0.04 mA @ 2500V DC',
        thermalConductivity: '3.2 W/mK',
        cellCapacityBalance: '0.02% delta'
      },
      cryptographicHash: hash,
      parentHash: evbParent,
      verificationStatus: 'Demo Verified'
    });
    evbParent = hash;
  });

  return events;
}

// Initial Recall Case
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
  { id: 'INT-SUP-06', name: 'Supplier Portal Gateway', category: 'Suppliers', description: 'Cryptographic component batch manifests from Samsung, Sony, CATL, Medtronic', status: 'Connected', lastSync: '8 min ago', eventsIngested: 14500, failedEvents: 0, protocol: 'AS2 / JSON-LD' },
];

// Blockchain Demo Audit Checkpoints
export const initialBlockchainBlocks: BlockchainAuditBlock[] = [
  { blockNumber: 1849201, txHash: '0xa45b98cf120194bc87123985', timestamp: '2026-10-01 10:35:12', entityType: 'Batch Checkpoint', entityId: 'Batch ABC (Display 100 units)', merkleRoot: '0x9924a7bc8100234b67912384', validatorNode: 'Validator-Korea-Telecom-01', status: 'Demo Confirmed' },
  { blockNumber: 1849215, txHash: '0x8821bcfae190349281a95b01', timestamp: '2026-10-01 11:20:04', entityType: 'Batch Checkpoint', entityId: 'Batch BTR (Battery 100 units)', merkleRoot: '0xaa19c8201bfde84910283451', validatorNode: 'Validator-AWS-Zurich-02', status: 'Demo Confirmed' },
  { blockNumber: 1849288, txHash: '0x77c920194bc0284719283741', timestamp: '2026-09-20 16:44:19', entityType: 'Batch Checkpoint', entityId: 'Batch CELL-96 (EV Prismatic Cells)', merkleRoot: '0xbb2910485710294857102938', validatorNode: 'Validator-Volvo-Nordic-01', status: 'Demo Confirmed' },
  { blockNumber: 1849340, txHash: '0x33b879102cdaef0982715011', timestamp: '2026-10-02 12:00:22', entityType: 'Passport Issuance', entityId: 'GT-DEV-00000851 (Galaxy S24 Ultra)', merkleRoot: '0xfe881023ba91739812401827', validatorNode: 'Validator-T-Systems-EU-03', status: 'Demo Confirmed' },
  { blockNumber: 1849410, txHash: '0x99bb4012847fcba90123847529', timestamp: '2026-09-24 15:10:02', entityType: 'Passport Issuance', entityId: 'GT-EVB-00094120 (800V EV Battery Pack)', merkleRoot: '0x88fc9012847abde01928374615', validatorNode: 'Validator-Munich-Fraunhofer-02', status: 'Demo Confirmed' },
  { blockNumber: 1849502, txHash: '0xbc3381a94829100147cb9921', timestamp: '2026-10-05 06:16:10', entityType: 'Recall Event', entityId: 'Recall REC-2026-001 (Batch ABC Display)', merkleRoot: '0x11029487cbea901237492018', validatorNode: 'Validator-Korea-Telecom-01', status: 'Demo Confirmed' },
];
