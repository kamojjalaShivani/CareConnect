import { Provider, Family, CareRequest, DashboardStats } from '../types';

// Sample data for demonstration
const sampleProviders: Provider[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    phone: '(555) 123-4567',
    specialties: ['doula', 'lactation'],
    rating: 4.8,
    status: 'active',
    location: 'Seattle, WA',
    availability: [
      {
        id: '1',
        providerId: '1',
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '17:00',
        isRecurring: true
      },
      {
        id: '2',
        providerId: '1',
        dayOfWeek: 2,
        startTime: '09:00',
        endTime: '17:00',
        isRecurring: true
      }
    ],
    preferences: {
      maxDailyHours: 8,
      preferredFamilyTypes: ['newborn', 'postpartum'],
      travelRadius: 25
    },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    phone: '(555) 234-5678',
    specialties: ['nurse', 'newborn'],
    rating: 4.9,
    status: 'active',
    location: 'Bellevue, WA',
    availability: [
      {
        id: '3',
        providerId: '2',
        dayOfWeek: 0,
        startTime: '08:00',
        endTime: '16:00',
        isRecurring: true
      },
      {
        id: '4',
        providerId: '2',
        dayOfWeek: 6,
        startTime: '08:00',
        endTime: '16:00',
        isRecurring: true
      }
    ],
    preferences: {
      maxDailyHours: 10,
      preferredFamilyTypes: ['newborn', 'special needs'],
      travelRadius: 30
    },
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z'
  },
  {
    id: '3',
    name: 'Emma Davis',
    email: 'emma.davis@example.com',
    phone: '(555) 345-6789',
    specialties: ['doula', 'newborn'],
    rating: 4.7,
    status: 'active',
    location: 'Redmond, WA',
    availability: [
      {
        id: '5',
        providerId: '3',
        dayOfWeek: 3,
        startTime: '10:00',
        endTime: '18:00',
        isRecurring: true
      },
      {
        id: '6',
        providerId: '3',
        dayOfWeek: 4,
        startTime: '10:00',
        endTime: '18:00',
        isRecurring: true
      }
    ],
    preferences: {
      maxDailyHours: 8,
      preferredFamilyTypes: ['postpartum', 'newborn'],
      travelRadius: 20
    },
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z'
  }
];

const sampleFamilies: Family[] = [
  {
    id: '1',
    name: 'The Johnson Family',
    email: 'contact@johnsonfamily.com',
    phone: '(555) 987-6543',
    address: '123 Main St, Seattle, WA 98101',
    careType: ['doula', 'lactation'],
    preferences: {
      consistentProvider: true,
      genderPreference: 'female',
      languagePreference: 'English',
      specialRequests: 'Experience with twins preferred'
    },
    status: 'active',
    createdAt: '2024-01-12T10:00:00Z',
    updatedAt: '2024-01-12T10:00:00Z'
  },
  {
    id: '2',
    name: 'The Smith Family',
    email: 'hello@smithfamily.com',
    phone: '(555) 876-5432',
    address: '456 Oak Ave, Bellevue, WA 98004',
    careType: ['nurse', 'newborn'],
    preferences: {
      consistentProvider: false,
      specialRequests: 'Flexible scheduling needed'
    },
    status: 'active',
    createdAt: '2024-01-18T10:00:00Z',
    updatedAt: '2024-01-18T10:00:00Z'
  }
];

const sampleCareRequests: CareRequest[] = [
  {
    id: '1',
    familyId: '1',
    family: sampleFamilies[0],
    providerId: '1',
    provider: sampleProviders[0],
    careType: 'doula',
    startTime: '2024-01-25T09:00:00Z',
    endTime: '2024-01-25T13:00:00Z',
    status: 'confirmed',
    priority: 'medium',
    notes: 'First-time parents, need extra support',
    requiresConsistency: true,
    location: '123 Main St, Seattle, WA 98101',
    createdAt: '2024-01-22T10:00:00Z',
    updatedAt: '2024-01-22T10:00:00Z'
  },
  {
    id: '2',
    familyId: '2',
    family: sampleFamilies[1],
    careType: 'nurse',
    startTime: '2024-01-26T14:00:00Z',
    endTime: '2024-01-26T18:00:00Z',
    status: 'pending',
    priority: 'high',
    notes: 'Newborn care needed urgently',
    requiresConsistency: false,
    location: '456 Oak Ave, Bellevue, WA 98004',
    createdAt: '2024-01-23T10:00:00Z',
    updatedAt: '2024-01-23T10:00:00Z'
  }
];

export class FallbackApiService {
  private static providers: Provider[] = [...sampleProviders];
  private static families: Family[] = [...sampleFamilies];
  private static careRequests: CareRequest[] = [...sampleCareRequests];

  // Dashboard
  static async getDashboardStats(): Promise<DashboardStats> {
    await this.delay(300); // Simulate network delay
    
    const upcomingAppointments = this.careRequests.filter(
      req => req.status === 'confirmed' && new Date(req.startTime) > new Date()
    ).length;
    
    const activeProviders = this.providers.filter(p => p.status === 'active').length;
    const activeFamilies = this.families.filter(f => f.status === 'active').length;
    const pendingRequests = this.careRequests.filter(req => req.status === 'pending').length;
    
    const today = new Date().toDateString();
    const todayAssignments = this.careRequests.filter(
      req => new Date(req.startTime).toDateString() === today
    ).length;

    return {
      upcomingAppointments,
      activeProviders,
      activeFamilies,
      pendingRequests,
      todayAssignments
    };
  }

  // Providers
  static async getProviders(): Promise<Provider[]> {
    await this.delay(200);
    return [...this.providers];
  }

  static async createProvider(providerData: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>): Promise<Provider> {
    await this.delay(300);
    
    const newProvider: Provider = {
      ...providerData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.providers.push(newProvider);
    return newProvider;
  }

  static async updateProvider(id: string, updates: Partial<Provider>): Promise<Provider> {
    await this.delay(300);
    
    const index = this.providers.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Provider not found');
    }
    
    this.providers[index] = {
      ...this.providers[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    return this.providers[index];
  }

  static async deleteProvider(id: string): Promise<void> {
    await this.delay(200);
    
    const index = this.providers.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Provider not found');
    }
    
    this.providers.splice(index, 1);
  }

  // Families
  static async getFamilies(): Promise<Family[]> {
    await this.delay(200);
    return [...this.families];
  }

  static async createFamily(familyData: Omit<Family, 'id' | 'createdAt' | 'updatedAt'>): Promise<Family> {
    await this.delay(300);
    
    const newFamily: Family = {
      ...familyData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.families.push(newFamily);
    return newFamily;
  }

  static async updateFamily(id: string, updates: Partial<Family>): Promise<Family> {
    await this.delay(300);
    
    const index = this.families.findIndex(f => f.id === id);
    if (index === -1) {
      throw new Error('Family not found');
    }
    
    this.families[index] = {
      ...this.families[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    return this.families[index];
  }

  // Care Requests
  static async getCareRequests(): Promise<CareRequest[]> {
    await this.delay(200);
    
    // Populate family and provider data
    return this.careRequests.map(request => ({
      ...request,
      family: this.families.find(f => f.id === request.familyId),
      provider: request.providerId ? this.providers.find(p => p.id === request.providerId) : undefined
    }));
  }

  static async createCareRequest(requestData: Omit<CareRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<CareRequest> {
    await this.delay(300);
    
    const newRequest: CareRequest = {
      ...requestData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.careRequests.push(newRequest);
    return newRequest;
  }

  static async updateCareRequest(id: string, updates: Partial<CareRequest>): Promise<CareRequest> {
    await this.delay(300);
    
    const index = this.careRequests.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error('Care request not found');
    }
    
    this.careRequests[index] = {
      ...this.careRequests[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    return this.careRequests[index];
  }

  // Utility method to simulate network delay
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}