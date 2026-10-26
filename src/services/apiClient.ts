/**
 * GeneaTrace Backend API Client
 * Connects the React/TypeScript frontend to the FastAPI + Supabase backend.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export interface BackendHealth {
  status: string;
  relational_database?: { status: string; database?: string };
  graph_database?: { status: string; using_fallback?: boolean };
  blockchain?: { status: string; is_mock?: boolean };
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
    const url = endpoint.startsWith('http') ? endpoint : API_BASE + endpoint;
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers['Authorization'] = 'Bearer ' + token;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = 'API Error ' + response.status + ': ' + response.statusText;
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

  // Health checks
  async getHealth(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/health');
  }

  async getReadiness(): Promise<BackendHealth> {
    const rootUrl = API_BASE.replace('/api/v1', '');
    const res = await fetch(rootUrl + '/ready');
    return res.json();
  }

  // Auth
  async login(username = 'admin', password = 'DevPassword123!'): Promise<{ access_token: string; user: any }> {
    const res = await this.request<{ access_token: string; user: any }>('/auth/login', {
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

  // Dashboard Metrics
  async getDashboardMetrics(): Promise<any> {
    return this.request<any>('/dashboard/metrics');
  }

  // Digital Product Passports
  async getPassport(productId: string): Promise<any> {
    return this.request<any>('/passports/' + productId);
  }

  async getPublicPassport(productId: string): Promise<any> {
    return this.request<any>('/passports/' + productId + '/public');
  }

  // Lineage & Graph Traversals
  async getForwardLineage(batchCode: string): Promise<any> {
    return this.request<any>('/lineage/forward/' + batchCode);
  }

  async getBackwardLineage(productId: string): Promise<any> {
    return this.request<any>('/lineage/backward/' + productId);
  }

  // Batches
  async getBatches(): Promise<any[]> {
    return this.request<any[]>('/batches');
  }

  async getBatch(batchCode: string): Promise<any> {
    return this.request<any>('/batches/' + batchCode);
  }

  // Components
  async getComponents(skip = 0, limit = 50): Promise<any[]> {
    return this.request<any[]>('/components?skip=' + skip + '&limit=' + limit);
  }

  async getComponent(serial: string): Promise<any> {
    return this.request<any>('/components/' + serial);
  }

  // Products
  async getProducts(): Promise<any[]> {
    return this.request<any[]>('/products');
  }

  async getProduct(productId: string): Promise<any> {
    return this.request<any>('/products/' + productId);
  }

  // Recalls
  async getRecalls(): Promise<any[]> {
    return this.request<any[]>('/recalls');
  }

  async getRecallExposure(batchCode: string): Promise<any> {
    return this.request<any>('/recalls/exposure/' + batchCode);
  }

  async triggerRecall(batchCode: string, reason: string): Promise<any> {
    return this.request<any>('/recalls/trigger', {
      method: 'POST',
      body: JSON.stringify({ batch_code: batchCode, reason }),
    });
  }

  // Device Security & Attestation
  async attestDevice(productId: string, identityCommitment: string): Promise<any> {
    return this.request<any>('/security/attest', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, identity_commitment: identityCommitment }),
    });
  }

  async executeDeviceLock(productId: string, reason: string): Promise<any> {
    return this.request<any>('/security/lock', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, reason }),
    });
  }

  async recoverDevice(productId: string): Promise<any> {
    return this.request<any>('/security/recover/' + productId, {
      method: 'POST',
    });
  }
}

export const api = new ApiClient();
