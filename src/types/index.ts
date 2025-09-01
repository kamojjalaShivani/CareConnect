export interface User {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  phone: string;
  role: 'admin' | 'provider' | 'coordinator';
  createdAt: string;
  updatedAt: string;
}

export interface Provider {
  id: string;
  user_id?: number; // if linked to user
  name: string;
  email: string;
  phone: string;
  location: string;
  specialties: string[];
  maxDailyHours: number;
  maxWeeklyHours: number;
  minWeeklyHours: number;
  travelRadius: number;

  availability: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    shiftType: 'daytime' | 'overnight' | '24_7';
  }[];

  timeOffs: {
    startDate: string;
    endDate: string;
    reason?: string;
  }[];

  preferences: {
    travelRadius: number;
    support24_7: boolean;
    maxWeeklyHours24_7: number;
    preferredFamilyTypes: string[];
  };

  rating: number;
  status: 'active' | 'inactive';

  createdAt?: string;
  updatedAt?: string;
}


export interface Family {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  careType: string[];
  preferences: {
    consistentProvider: boolean;
    genderPreference?: string;
    languagePreference?: string;
    specialRequests: string;
  };
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CareRequest {
  id: string;
  familyId: string;
  family?: Family;
  providerId?: string;
  provider?: Provider;
  careType: string;
  supportType: 'daytime' | 'overnight' | '24_7';
  preferredProviderId?: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  hoursPerDay: number;
  status: 'pending' | 'assigned' | 'confirmed' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes: string;
  requiresConsistency: boolean;
  location: string;
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  shiftType: 'daytime' | 'overnight' | '24_7';
}

export interface TimeOffSlot {
  startDate: string;
  endDate: string;
  reason?: string;
}


export interface DashboardStats {
  upcomingAppointments: number;
  activeProviders: number;
  activeFamilies: number;
  pendingRequests: number;
  todayAssignments: number;
}

export interface RecentCareRequestActivity extends CareRequest {
  Family: {
    name: string;
  };
}

export interface MatchingSuggestion {
  provider: Provider;
  score: number;
  reasons: string[];
  warnings: string[];
}

export interface CareRequestMatches {
  mode: "consistent";
  suggestions: MatchingSuggestion[];
}

export interface Assignment {
  id: string;
  requestId: string;
  providerId: string;
  scheduled_date: string;
  shift_start: string; // ISO string
  shift_end: string;   // ISO string
  hours_worked: number;
  assignedAt: string;
  confirmedAt?: string;
  completedAt?: string;
  feedback?: string;
  rating?: number;
  careRequest?: CareRequest; // Added for eager loading
  provider?: Provider;       // Added for eager loading
}
