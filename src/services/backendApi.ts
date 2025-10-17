import { Provider, Family, CareRequest, DashboardStats, CareRequestMatches, Assignment, RecentCareRequestActivity } from '../types';

const API_BASE_URL = 'http://localhost:3002/api'; // Assuming backend runs on 3001, frontend on 5174

class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

const getAuthToken = (): string | null => {
  return localStorage.getItem('careconnect_token');
};

const apiRequest = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const token = getAuthToken();
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    console.log('endpoint:',endpoint)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new ApiError(errorData.error || `HTTP ${response.status}`, response.status);
    }

    // Handle 204 No Content responses
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Network error or server unavailable', 0);
  }
};

export class BackendApiService {
  // Authentication
  static async login(email: string, password: string): Promise<{ token: string; user: any }> {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Store token
    localStorage.setItem('careconnect_token', response.token);
    localStorage.setItem('careconnect_user', JSON.stringify(response.user));
    
    return response;
  }

  static async getCurrentUser(): Promise<{ user: any }> {
    const response = await apiRequest('/auth/me', {
      method: 'GET',
    });
    return response;
  }

  static async logout(): Promise<void> {
    localStorage.removeItem('careconnect_token');
    localStorage.removeItem('careconnect_user');
  }

  // Dashboard
  static async getDashboardStats(): Promise<DashboardStats> {
    return await apiRequest('/dashboard/stats');
  }

  static async getRecentCareRequests(): Promise<RecentCareRequestActivity[]> {
    return await apiRequest('/dashboard/recent-care-requests');
  }

  // Providers
  static async getProviders(): Promise<Provider[]> {
    return await apiRequest('/providers');
  }

  static async getProvider(id: string): Promise<Provider> {
    return await apiRequest(`/providers/${id}`);
  }

  static async createProvider(provider: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>): Promise<Provider> {
    return await apiRequest('/providers', {
      method: 'POST',
      body: JSON.stringify(provider),
    });
  }

  static async updateProvider(id: string, updates: Partial<Provider>): Promise<Provider> {
    return await apiRequest(`/providers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  static async deleteProvider(id: string): Promise<void> {
    await apiRequest(`/providers/${id}`, {
      method: 'DELETE',
    });
  }

  // Families
  static async getFamilies(): Promise<Family[]> {
    return await apiRequest('/families');
  }

  static async getFamily(id: string): Promise<Family> {
    return await apiRequest(`/families/${id}`);
  }

  static async createFamily(family: Omit<Family, 'id' | 'createdAt' | 'updatedAt'>): Promise<Family> {
    return await apiRequest('/families', {
      method: 'POST',
      body: JSON.stringify(family),
    });
  }

  static async updateFamily(id: string, updates: Partial<Family>): Promise<Family> {
    return await apiRequest(`/families/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  static async deleteFamily(id: string): Promise<void> {
    await apiRequest(`/families/${id}`, {
      method: 'DELETE',
    });
  }

  // Care Requests
  static async getCareRequests(): Promise<CareRequest[]> {
    return await apiRequest('/care-requests');
  }

  static async getCareRequest(id: string): Promise<CareRequest> {
    return await apiRequest(`/care-requests/${id}`);
  }

  static async createCareRequest(request: Omit<CareRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<CareRequest> {
    return await apiRequest('/care-requests', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  static async updateCareRequest(id: string, updates: Partial<CareRequest>): Promise<CareRequest> {
    return await apiRequest(`/care-requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  static async deleteCareRequest(id: string): Promise<void> {
    await apiRequest(`/care-requests/${id}`, {
      method: 'DELETE',
    });
  }

  // Assignments
  static async getAssignments(): Promise<Assignment[]> {
    return await apiRequest('/assignments');
  }

  static async createAssignment(assignment: { requestId: string; providerId: string }): Promise<Assignment[]> {
    return await apiRequest('/assignments', {
      method: 'POST',
      body: JSON.stringify(assignment),
    });
  }

  static async updateAssignment(id: string, updates: any): Promise<any> {
    return await apiRequest(`/assignments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  static async getCareRequestMatches(id: string): Promise<CareRequestMatches> {
    return await apiRequest(`/care-requests/${id}/match`);
  }
}
