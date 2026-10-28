/**
 * GeneaTrace Backend API Client
 * Connects the React/TypeScript frontend to the FastAPI + Azure/Supabase backend.
 */

export const API_BASE = import.meta.env.VITE_API_BASE_URL || (
  typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8000/api/v1'
    : 'https://geneatrace-api.azurewebsites.net/api/v1'
);

export const BACKEND_ROOT = API_BASE.replace('/api/v1', '');

export interface BackendHealth {
  status: string;
  service?: string;
  environment?: string;
  relational_database?: { status: string; database?: string };
  graph_database?: { status: string; using_fallback?: boolean };
  blockchain?: { status: string; is_mock?: boolean };
}

export interface DashboardSummary {
  total_components: number;
  total_batches: number;
  total_products_assembled: number;
  active_recalls: number;
  blockchain_checkpoints: number;
  pass_rate_percentage: number;
  total_manufacturing_events: number;
  graph_health: string;
  blockchain_health: string;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    try {
      this.token = localStorage.getItem('geneatrace_token');
    } catch {
      this.token = null;
    }
  }

  setToken(token: string) {
    this.token = token;
    try {
      localStorage.setItem('geneatrace_token', token);
    } catch {
      // ignore
    }
  }

  getToken(): string | null {
    if (this.token) return this.token;
    try {
      return localStorage.getItem('geneatrace_token');
    } catch {
      return null;
    }
  }

  clearToken() {
    this.token = null;
    try {
      localStorage.removeItem('geneatrace_token');
    } catch {
      // ignore
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `API Error ${response.status}: ${response.statusText}`;
      try {
        const errorJson = await response.json();
        if (errorJson.detail) {
          errorMessage = typeof errorJson.detail === 'string' ? errorJson.detail : JSON.stringify(errorJson.detail);
        }
      } catch {
        // ignore parse error
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // Health & Readiness Checks
  async getHealth(): Promise<{ status: string; service?: string }> {
    const res = await fetch(`${BACKEND_ROOT}/health`);
    if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
    return res.json();
  }

  async getReadiness(): Promise<BackendHealth> {
    const res = await fetch(`${BACKEND_ROOT}/ready`);
    if (!res.ok) throw new Error(`Readiness check failed: ${res.status}`);
    return res.json();
  }

  // Auth
  async login(username = 'admin', password = 'DevPassword123!'): Promise<{ access_token: string; token_type: string; user_role?: string; username?: string }> {
    const res = await this.request<{ access_token: string; token_type: string; user_role?: string; username?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (res.access_token) {
      this.setToken(res.access_token);
    }
    return res;
  }

  async getCurrentUser(): Promise<any> {
    return this.request<any>('/auth/me');
  }

  // Dashboard Endpoints
  async getDashboardSummary(): Promise<DashboardSummary> {
    return this.request<DashboardSummary>('/dashboard/summary');
  }

  async getManufacturingOutput(): Promise<any[]> {
    return this.request<any[]>('/dashboard/manufacturing-output');
  }

  async getDefectRates(): Promise<any[]> {
    return this.request<any[]>('/dashboard/defect-rates');
  }

  async getBatchDistribution(): Promise<any[]> {
    return this.request<any[]>('/dashboard/batch-distribution');
  }

  async getRecallExposure(): Promise<any[]> {
    return this.request<any[]>('/dashboard/recall-exposure');
  }

  async getRecentEvents(limit = 15): Promise<any[]> {
    return this.request<any[]>(`/dashboard/recent-events?limit=${limit}`);
  }

  // Digital Product Passports
  async getPassport(productId: string): Promise<any> {
    return this.request<any>(`/passports/${productId}`);
  }

  async getPublicPassport(productId: string): Promise<any> {
    return this.request<any>(`/passports/${productId}/public`);
  }

  async verifyPassport(productId: string): Promise<any> {
    return this.request<any>(`/passports/${productId}/verify`);
  }

  // Lineage & Graph Traversals
  async traceBatch(batchCode: string): Promise<any> {
    return this.request<any>(`/traceability/batch/${batchCode}`);
  }

  async traceComponent(serial: string): Promise<any> {
    return this.request<any>(`/traceability/component/${serial}`);
  }

  async traceProduct(productId: string): Promise<any> {
    return this.request<any>(`/traceability/product/${productId}`);
  }

  async traceShipment(shipmentId: string): Promise<any> {
    return this.request<any>(`/traceability/shipment/${shipmentId}`);
  }

  // Batches
  async getBatches(page = 1, pageSize = 50): Promise<any> {
    return this.request<any>(`/batches?page=${page}&page_size=${pageSize}`);
  }

  async getBatch(batchCode: string): Promise<any> {
    return this.request<any>(`/batches/${batchCode}`);
  }

  async createBatch(batchData: any): Promise<any> {
    return this.request<any>('/batches', {
      method: 'POST',
      body: JSON.stringify(batchData),
    });
  }

  // Components
  async getComponents(page = 1, pageSize = 50): Promise<any> {
    return this.request<any>(`/components?page=${page}&page_size=${pageSize}`);
  }

  async getComponent(serial: string): Promise<any> {
    return this.request<any>(`/components/${serial}`);
  }

  async registerComponent(compData: any): Promise<any> {
    return this.request<any>('/components', {
      method: 'POST',
      body: JSON.stringify(compData),
    });
  }

  // Products
  async getProducts(page = 1, pageSize = 50): Promise<any> {
    return this.request<any>(`/products?page=${page}&page_size=${pageSize}`);
  }

  async getProduct(productId: string): Promise<any> {
    return this.request<any>(`/products/${productId}`);
  }

  // Recalls
  async getRecalls(): Promise<any[]> {
    return this.request<any[]>('/recalls');
  }

  async initiateRecall(recallData: any): Promise<any> {
    return this.request<any>('/recalls', {
      method: 'POST',
      body: JSON.stringify(recallData),
    });
  }

  // Shipments
  async getShipments(page = 1, pageSize = 50): Promise<any> {
    return this.request<any>(`/shipments?page=${page}&page_size=${pageSize}`);
  }

  // Blockchain Audit
  async getBlockchainAudit(): Promise<any> {
    return this.request<any>('/blockchain/audit');
  }

  // Integrations
  async getIntegrations(): Promise<any[]> {
    return this.request<any[]>('/integrations');
  }

  // Device Security & Attestation
  async attestDevice(payload: any): Promise<any> {
    return this.request<any>('/security/attestations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async issueDeviceCommand(commandData: any): Promise<any> {
    return this.request<any>('/security/commands', {
      method: 'POST',
      body: JSON.stringify(commandData),
    });
  }

  // QR & Hardware Scan Persistence (Supabase PostgreSQL)
  async recordScanEvent(scanData: {
    target_id: string;
    scan_source?: string;
    verdict?: string;
    is_valid?: boolean;
    merkle_root?: string;
    scanner_location?: string;
    metadata?: any;
  }): Promise<any> {
    return this.request<any>('/security/scans', {
      method: 'POST',
      body: JSON.stringify(scanData),
    });
  }

  async getRecentScans(limit = 50): Promise<any[]> {
    return this.request<any[]>(`/security/scans?limit=${limit}`);
  }
}

export const api = new ApiClient();
