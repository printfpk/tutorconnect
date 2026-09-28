import api from './api';

/* ─── Requirements ─────────────────────────────── */

export interface Requirement {
  _id: string;
  postedBy: { _id: string; firstName: string; lastName: string; avatar?: string; pincode?: string };
  subject: string;
  className: string;
  board: string;
  teachingMode: string;
  location?: { coordinates: [number, number]; address?: string; pincode?: string };
  schedule: { days: string[]; preferredTime: string; sessionsPerWeek: number };
  budgetMin: number;
  budgetMax: number;
  isNegotiable: boolean;
  description?: string;
  status: string;
  offersReceived: number;
  createdAt: string;
  updatedAt: string;
}

export interface Offer {
  _id: string;
  requirement: { _id: string; subject: string; className: string; budgetMin: number; budgetMax: number; teachingMode: string; status: string };
  tutor: { _id: string; firstName: string; lastName: string; avatar?: string };
  proposedRate: number;
  message?: string;
  status: string;
  createdAt: string;
}

export interface FlashRequest {
  _id: string;
  postedBy: { _id: string; firstName: string; lastName: string; avatar?: string };
  subject: string;
  className: string;
  board: string;
  location: { coordinates: [number, number]; address?: string };
  sessionDurationHours: number;
  ratePerSession: number;
  startsAt: string;
  status: string;
  expiresAt: string;
  createdAt: string;
}

/* ─── API Functions ─────────────────────────────── */

export const requirementsApi = {
  // Get nearby requirements (for tutors)
  getNearby: (lat: number, lng: number, radius = 10, filters?: { subject?: string; teachingMode?: string }) => {
    const params = new URLSearchParams({ lat: String(lat), lng: String(lng), radius: String(radius) });
    if (filters?.subject) params.set('subject', filters.subject);
    if (filters?.teachingMode) params.set('teachingMode', filters.teachingMode);
    return api.get<{ data: { requirements: Requirement[]; count: number } }>(`/requirements/nearby?${params}`);
  },

  // Get requirements posted by logged-in user
  getMine: () => api.get<{ data: { requirements: Requirement[] } }>('/requirements/mine'),

  // Get single requirement
  getById: (id: string) => api.get<{ data: { requirement: Requirement } }>(`/requirements/${id}`),

  // Create a requirement (parent/student)
  create: (data: Partial<Requirement> & { budgetMin: number; budgetMax: number; subject: string; className: string; teachingMode: string }) =>
    api.post<{ data: { requirement: Requirement } }>('/requirements', data),

  // Update
  update: (id: string, data: Partial<Requirement>) =>
    api.put<{ data: { requirement: Requirement } }>(`/requirements/${id}`, data),

  // Close requirement
  close: (id: string) => api.delete(`/requirements/${id}`),

  // Tutor sends an offer
  sendOffer: (requirementId: string, data: { proposedRate: number; message?: string }) =>
    api.post<{ data: { offer: Offer } }>(`/requirements/${requirementId}/offer`, data),

  // Get offers for a requirement (owner)
  getOffersForRequirement: (requirementId: string) =>
    api.get<{ data: { offers: Offer[] } }>(`/requirements/${requirementId}/offers`),

  // Tutor gets all their sent offers
  getMyOffers: () => api.get<{ data: { offers: Offer[] } }>('/requirements/offers/mine'),
};

export const flashApi = {
  // Get nearby flash requests (for tutors)
  getNearby: (lat: number, lng: number, radius = 5) => {
    const params = new URLSearchParams({ lat: String(lat), lng: String(lng), radius: String(radius) });
    return api.get<{ data: { flashes: FlashRequest[]; count: number } }>(`/flash/nearby?${params}`);
  },

  // Get my flash requests
  getMine: () => api.get<{ data: { flashes: FlashRequest[] } }>('/flash/mine'),

  // Create flash request
  create: (data: { subject: string; className: string; location: { type: 'Point'; coordinates: [number, number] }; sessionDurationHours: number; ratePerSession: number; startsAt?: string }) =>
    api.post<{ data: { flash: FlashRequest } }>('/flash', data),

  // Get single flash request
  getById: (id: string) => api.get<{ data: { flash: FlashRequest } }>(`/flash/${id}`),

  // Tutor responds to a flash request
  respond: (id: string) => api.post(`/flash/${id}/respond`, {}),
};
