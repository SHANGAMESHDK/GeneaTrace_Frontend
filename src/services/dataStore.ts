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
  ComponentCategory,
  IndustrySector
} from '../types';
import {
  initialBatches,
  generateInitialComponents,
  generateInitialProducts,
  generateInitialShipments,
  generateInitialManufacturingEvents,
  initialRecallCase,
  initialSecurityStatus,
  initialIntegrations,
  initialBlockchainBlocks
} from '../data/mockData';
import { pseudoHash } from '../utils/hashing';

const STORAGE_KEY = 'geneatrace_state_v2_multi';

interface AppState {
  batches: BatchRecord[];
  components: ComponentRecord[];
  products: ProductRecord[];
  shipments: ShipmentRecord[];
  events: ManufacturingEvent[];
  recallCase: RecallCase;
  securityStatus: SecurityStatus;
  integrations: IntegrationStatus[];
  blockchainBlocks: BlockchainAuditBlock[];
  activeSector: string; // 'All' or IndustrySector
}

function loadInitialState(): AppState {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse stored GeneaTrace state, resetting.', e);
    }
  }

  const components = generateInitialComponents();
  const products = generateInitialProducts();
  const shipments = generateInitialShipments(products);
  const events = generateInitialManufacturingEvents();

  const state: AppState = {
    batches: initialBatches,
    components,
    products,
    shipments,
    events,
    recallCase: initialRecallCase,
    securityStatus: initialSecurityStatus,
    integrations: initialIntegrations,
    blockchainBlocks: initialBlockchainBlocks,
    activeSector: 'All'
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return state;
}

let currentState: AppState = loadInitialState();

export const GeneaTraceStore = {
  getState(): AppState {
    return currentState;
  },

  saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
  },

  getActiveSector(): string {
    return currentState.activeSector || 'All';
  },

  setActiveSector(sector: string) {
    currentState.activeSector = sector;
    this.saveState();
  },

  resetDemoData(): AppState {
    localStorage.removeItem(STORAGE_KEY);
    const components = generateInitialComponents();
    const products = generateInitialProducts();
    const shipments = generateInitialShipments(products);
    const events = generateInitialManufacturingEvents();

    currentState = {
      batches: initialBatches,
      components,
      products,
      shipments,
      events,
      recallCase: initialRecallCase,
      securityStatus: initialSecurityStatus,
      integrations: initialIntegrations,
      blockchainBlocks: initialBlockchainBlocks,
      activeSector: 'All'
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
    return currentState;
  },

  // Batches
  getBatches(sector?: string): BatchRecord[] {
    let list = [...currentState.batches];
    const s = sector || currentState.activeSector;
    if (s && s !== 'All') {
      list = list.filter(b => b.sector === s);
    }
    return list;
  },

  getBatch(batchId: string): BatchRecord | undefined {
    return currentState.batches.find(b => b.batchId.toUpperCase() === batchId.toUpperCase());
  },

  createBatch(newBatch: {
    batchId: string;
    sector?: IndustrySector;
    componentType: ComponentCategory;
    batchSize: number;
    supplier: string;
    facility: string;
    productionDate: string;
  }): { batch: BatchRecord; componentsCreated: number } {
    const existing = currentState.batches.find(b => b.batchId.toUpperCase() === newBatch.batchId.toUpperCase());
    if (existing) {
      throw new Error(`Batch ID ${newBatch.batchId} already exists in current manufacturing namespace.`);
    }

    const assignedSector: IndustrySector = newBatch.sector || 'Consumer Electronics';

    const batchRecord: BatchRecord = {
      batchId: newBatch.batchId.toUpperCase(),
      sector: assignedSector,
      componentType: newBatch.componentType,
      batchSize: newBatch.batchSize,
      serialPrefix: newBatch.batchId.toUpperCase(),
      supplier: newBatch.supplier,
      facility: newBatch.facility,
      productionDate: newBatch.productionDate,
      status: 'In Production',
      inspectionResult: 'Inspection Scheduled',
      completedOperationsCount: 1,
      totalOperationsCount: 6,
      blockchainCheckpointTx: pseudoHash(`BATCH-REG-${newBatch.batchId}`),
      checkpointStatus: 'Anchored'
    };

    const newComponents: ComponentRecord[] = [];
    for (let i = 1; i <= newBatch.batchSize; i++) {
      const serialNumber = `${newBatch.batchId.toUpperCase()}-${i.toString().padStart(4, '0')}`;
      const compId = `CMP-${newBatch.componentType.slice(0, 3).toUpperCase()}-${(200000 + i).toString().slice(1)}`;
      newComponents.push({
        componentId: compId,
        serialNumber,
        batchId: newBatch.batchId.toUpperCase(),
        type: newBatch.componentType,
        sector: assignedSector,
        manufacturer: newBatch.supplier,
        supplier: newBatch.supplier,
        location: newBatch.facility,
        mfgDate: newBatch.productionDate,
        status: 'In Production',
        qualityStatus: 'Pending',
        verificationStatus: 'Demo Verified',
        cryptographicHash: pseudoHash(`COMPONENT-${serialNumber}-${compId}`)
      });
    }

    currentState.batches.unshift(batchRecord);
    currentState.components.push(...newComponents);
    this.saveState();

    return { batch: batchRecord, componentsCreated: newComponents.length };
  },

  // Components
  getComponents(filters?: { type?: string; batchId?: string; qualityStatus?: string; search?: string; sector?: string }): ComponentRecord[] {
    let list = [...currentState.components];
    const s = filters?.sector || currentState.activeSector;
    if (s && s !== 'All') {
      list = list.filter(c => c.sector === s);
    }
    if (filters?.type && filters.type !== 'All') {
      list = list.filter(c => c.type.toLowerCase() === filters.type?.toLowerCase());
    }
    if (filters?.batchId && filters.batchId !== 'All') {
      list = list.filter(c => c.batchId.toUpperCase() === filters.batchId?.toUpperCase());
    }
    if (filters?.qualityStatus && filters.qualityStatus !== 'All') {
      list = list.filter(c => c.qualityStatus.toLowerCase() === filters.qualityStatus?.toLowerCase());
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(c =>
        c.serialNumber.toLowerCase().includes(q) ||
        c.componentId.toLowerCase().includes(q) ||
        c.batchId.toLowerCase().includes(q) ||
        c.supplier.toLowerCase().includes(q)
      );
    }
    return list;
  },

  getComponentBySerial(serial: string): ComponentRecord | undefined {
    return currentState.components.find(c => c.serialNumber.toUpperCase() === serial.toUpperCase());
  },

  // Products
  getProducts(sector?: string): ProductRecord[] {
    let list = [...currentState.products];
    const s = sector || currentState.activeSector;
    if (s && s !== 'All') {
      list = list.filter(p => p.sector === s);
    }
    return list;
  },

  getProduct(productId: string): ProductRecord | undefined {
    return currentState.products.find(p => p.productId.toUpperCase() === productId.toUpperCase());
  },

  // Shipments
  getShipments(): ShipmentRecord[] {
    return [...currentState.shipments];
  },

  getShipment(shipmentId: string): ShipmentRecord | undefined {
    return currentState.shipments.find(s => s.shipmentId.toUpperCase() === shipmentId.toUpperCase());
  },

  // Events
  getEventsForEntity(entityId: string): ManufacturingEvent[] {
    return currentState.events.filter(e => e.entityId.toUpperCase() === entityId.toUpperCase());
  },

  // Forward Traceability: Batch ID -> Components -> Products -> Shipments
  traceForwardFromBatch(batchId: string): {
    batch: BatchRecord | undefined;
    totalUnits: number;
    affectedComponents: ComponentRecord[];
    affectedProducts: ProductRecord[];
    affectedShipments: ShipmentRecord[];
    deliveredCount: number;
    inTransitCount: number;
    warehouseCount: number;
    traversalTimeMs: number;
  } {
    const start = performance.now();
    const batch = this.getBatch(batchId);
    const affectedComponents = currentState.components.filter(c => c.batchId.toUpperCase() === batchId.toUpperCase());
    const componentSerials = new Set(affectedComponents.map(c => c.serialNumber));

    const affectedProducts = currentState.products.filter(p => {
      const installedValues = Object.values(p.installedComponents);
      return installedValues.some(val => componentSerials.has(val));
    });

    const affectedProductIds = new Set(affectedProducts.map(p => p.productId));
    const affectedShipments = currentState.shipments.filter(s =>
      s.productIds.some(pid => affectedProductIds.has(pid))
    );

    let deliveredCount = 0;
    let inTransitCount = 0;
    let warehouseCount = 0;

    affectedProducts.forEach(p => {
      if (p.status === 'Delivered') deliveredCount++;
      else if (p.status === 'Shipped' || p.status === 'Recall Flagged') inTransitCount++;
      else warehouseCount++;
    });

    const traversalTimeMs = Math.max(12, Math.round((performance.now() - start) * 100) / 100);

    return {
      batch,
      totalUnits: affectedComponents.length,
      affectedComponents,
      affectedProducts,
      affectedShipments,
      deliveredCount,
      inTransitCount,
      warehouseCount,
      traversalTimeMs
    };
  },

  // Backward Traceability
  traceBackwardFromProduct(productIdOrImei: string): {
    product: ProductRecord | undefined;
    components: { category: string; serial: string; batch: string; record?: ComponentRecord }[];
    events: ManufacturingEvent[];
    shipment: ShipmentRecord | undefined;
    traversalTimeMs: number;
  } {
    const start = performance.now();
    const cleanQuery = productIdOrImei.trim().toUpperCase();

    const product = currentState.products.find(
      p => p.productId.toUpperCase() === cleanQuery || p.imeiMasked.toUpperCase() === cleanQuery
    );

    if (!product) {
      return {
        product: undefined,
        components: [],
        events: [],
        shipment: undefined,
        traversalTimeMs: Math.round((performance.now() - start) * 100) / 100
      };
    }

    const comps = Object.entries(product.installedComponents).map(([category, serial]) => {
      const rec = currentState.components.find(c => c.serialNumber === serial);
      const batch = rec?.batchId || serial.split('-')[0] || 'N/A';
      return {
        category,
        serial,
        batch,
        record: rec
      };
    });

    const productEvents = currentState.events.filter(e => e.entityId === product.productId);
    const displaySerial = product.installedComponents['Display Module'] || Object.values(product.installedComponents)[0];
    const compEvents = displaySerial ? currentState.events.filter(e => e.entityId === displaySerial) : [];
    const allEvents = [...compEvents, ...productEvents];

    const shipment = currentState.shipments.find(s => s.shipmentId === product.shipmentId);
    const traversalTimeMs = Math.max(15, Math.round((performance.now() - start) * 100) / 100);

    return {
      product,
      components: comps,
      events: allEvents,
      shipment,
      traversalTimeMs
    };
  },

  // Trigger Precision Batch Recall
  triggerBatchRecall(batchId: string, reason: string): RecallCase {
    const trace = this.traceForwardFromBatch(batchId);
    const batch = currentState.batches.find(b => b.batchId.toUpperCase() === batchId.toUpperCase());
    if (batch) {
      batch.status = 'Defective';
      batch.defectReason = reason;
    }

    currentState.components.forEach(c => {
      if (c.batchId.toUpperCase() === batchId.toUpperCase()) {
        c.status = 'Recalled';
        c.qualityStatus = 'Failed';
        c.verificationStatus = 'Flagged';
      }
    });

    const affectedProdIds = new Set(trace.affectedProducts.map(p => p.productId));
    currentState.products.forEach(p => {
      if (affectedProdIds.has(p.productId)) {
        p.status = 'Recall Flagged';
      }
    });

    const recallCase: RecallCase = {
      recallId: `REC-${Date.now().toString().slice(-4)}`,
      batchId: batchId.toUpperCase(),
      sector: batch?.sector || 'Consumer Electronics',
      componentType: batch?.componentType || 'Display',
      defectCategory: 'Thermal Delamination & Stress Fracture',
      severity: 'Critical',
      discoveryDate: new Date().toISOString().split('T')[0],
      affectedOperation: '1.5 Adhesive Gluing / 1.7 Preheating Curing',
      description: reason || `Automated precision recall initiated for ${batchId}`,
      status: 'Recall Initiated',
      unitsInBatch: trace.totalUnits,
      affectedComponents: trace.affectedComponents.map(c => c.serialNumber),
      affectedProductIds: trace.affectedProducts.map(p => p.productId),
      affectedShipmentIds: trace.affectedShipments.map(s => s.shipmentId),
      deliveredCount: trace.deliveredCount,
      inTransitCount: trace.inTransitCount,
      warehouseCount: trace.warehouseCount,
      rootCause: 'Machine process tolerance drift detected in automated optical inspection audit.',
      actionsTaken: [
        `Batch ${batchId} flagged defective in Merkle-DAG ledger`,
        `Identified ${trace.affectedProducts.length} finished units in ${trace.traversalTimeMs}ms`,
        `Dispatched automatic hold commands to ${trace.affectedShipments.length} active carrier manifests`,
        `Digital Product Passport flags pushed to consumer verification portal`
      ]
    };

    currentState.recallCase = recallCase;
    this.saveState();
    return recallCase;
  },

  // Device Security & Automatic Lock Simulation
  simulateTampering(deviceId: string, tampered: boolean) {
    const dev = currentState.products.find(p => p.productId === deviceId);
    if (!dev) return;

    if (tampered) {
      dev.isTampered = true;
      currentState.securityStatus = {
        ...currentState.securityStatus,
        productId: deviceId,
        hardwareHashMatches: false,
        signatureValid: false,
        componentsAuthentic: false,
        status: 'Confirmed Tampering',
        anomalyDetails: 'Identity signature mismatch detected: Hardware cryptographic commitment differs from factory DPP manifest. Unofficial module detected.',
        lockCommandStatus: 'Authorized',
        simulatedAuditLogs: [
          ...currentState.securityStatus.simulatedAuditLogs,
          {
            timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
            event: 'Component Identity Anomaly Detected (Hardware Commitment Mismatch)',
            actor: 'GeneaTrace DPP Attestation Agent (v2.4)',
            hash: pseudoHash(`ANOMALY-${Date.now()}`)
          },
          {
            timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
            event: 'Security Policy Evaluated: Tamper Threshold Exceeded. Lock Command Authorized.',
            actor: 'GeneaTrace Policy Engine',
            hash: pseudoHash(`AUTH-LOCK-${Date.now()}`)
          }
        ]
      };
    } else {
      dev.isTampered = false;
      dev.isLocked = false;
      currentState.securityStatus = {
        ...initialSecurityStatus,
        productId: deviceId
      };
    }
    this.saveState();
  },

  executeLockCommand(deviceId: string) {
    const dev = currentState.products.find(p => p.productId === deviceId);
    if (dev) {
      dev.isLocked = true;
      dev.lockReason = 'Unauthorized hardware tampering detected. Device secured by GeneaTrace MDM agent.';
    }

    currentState.securityStatus = {
      ...currentState.securityStatus,
      lockCommandStatus: 'Executed (Simulated)',
      lockTimestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      simulatedAuditLogs: [
        ...currentState.securityStatus.simulatedAuditLogs,
        {
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          event: 'Signed Lock Command Delivered via Enterprise MDM API',
          actor: 'GeneaTrace Security Gateway',
          hash: pseudoHash(`LOCK-CMD-${Date.now()}`)
        },
        {
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          event: 'Device Screen Secured: Red Tamper Warning Lock Activated',
          actor: `Managed Client Agent (${deviceId})`,
          hash: pseudoHash(`EXEC-CONFIRM-${Date.now()}`)
        }
      ]
    };
    this.saveState();
  },

  recoverDevice(deviceId: string) {
    const dev = currentState.products.find(p => p.productId === deviceId);
    if (dev) {
      dev.isTampered = false;
      dev.isLocked = false;
      dev.lockReason = undefined;
    }

    currentState.securityStatus = {
      ...initialSecurityStatus,
      productId: deviceId,
      status: 'Verified',
      lockCommandStatus: 'None',
      simulatedAuditLogs: [
        ...currentState.securityStatus.simulatedAuditLogs,
        {
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          event: 'Authorized Service Center Authentication & Device Recovery Cleared',
          actor: 'Authorized Service Technician #4912',
          hash: pseudoHash(`RECOVER-${Date.now()}`)
        }
      ]
    };
    this.saveState();
  }
};
