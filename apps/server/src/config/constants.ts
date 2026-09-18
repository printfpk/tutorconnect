// User roles
export const ROLES = {
  PARENT: 'parent',
  STUDENT: 'student',
  TUTOR: 'tutor',
  ADMIN: 'admin',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// User account status
export const USER_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  BLOCKED: 'blocked',
  DEACTIVATED: 'deactivated',
} as const;

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

// Tutor verification status
export const VERIFICATION_STATUS = {
  UNVERIFIED: 'unverified',
  PENDING: 'pending_verification',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
} as const;

export type VerificationStatus = (typeof VERIFICATION_STATUS)[keyof typeof VERIFICATION_STATUS];

// Teaching modes
export const TEACHING_MODES = {
  HOME: 'home_tuition',
  ONLINE: 'online',
  TUTOR_PLACE: 'at_tutor_place',
  ANY: 'any',
} as const;

export type TeachingMode = (typeof TEACHING_MODES)[keyof typeof TEACHING_MODES];

// Requirement types
export const REQUIREMENT_TYPES = {
  SCHEDULED: 'scheduled',
  MONTHLY: 'monthly',
  HOURLY: 'hourly',
  FLASH: 'flash',
} as const;

export type RequirementType = (typeof REQUIREMENT_TYPES)[keyof typeof REQUIREMENT_TYPES];

// Requirement status
export const REQUIREMENT_STATUS = {
  DRAFT: 'draft',
  OPEN: 'open_for_offers',
  OFFERS_RECEIVED: 'offers_received',
  NEGOTIATION: 'negotiation',
  TUTOR_SELECTED: 'tutor_selected',
  BOOKING_CREATED: 'booking_created',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
} as const;

export type RequirementStatus = (typeof REQUIREMENT_STATUS)[keyof typeof REQUIREMENT_STATUS];

// Offer status
export const OFFER_STATUS = {
  PENDING: 'pending',
  VIEWED: 'viewed',
  NEGOTIATING: 'negotiating',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  WITHDRAWN: 'withdrawn',
  EXPIRED: 'expired',
} as const;

export type OfferStatus = (typeof OFFER_STATUS)[keyof typeof OFFER_STATUS];

// Booking status
export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];

// Booking types
export const BOOKING_TYPES = {
  SCHEDULED: 'scheduled',
  MONTHLY: 'monthly',
  HOURLY: 'hourly',
  FLASH: 'flash',
} as const;

export type BookingType = (typeof BOOKING_TYPES)[keyof typeof BOOKING_TYPES];

// Pricing types
export const PRICING_TYPES = {
  HOURLY: 'hourly',
  MONTHLY: 'monthly',
  PER_SESSION: 'per_session',
  CUSTOM: 'custom',
} as const;

export type PricingType = (typeof PRICING_TYPES)[keyof typeof PRICING_TYPES];

// Flash request status
export const FLASH_STATUS = {
  CREATED: 'flash_created',
  SEARCHING: 'searching',
  TUTORS_NOTIFIED: 'tutors_notified',
  TUTOR_RESPONDED: 'tutor_responded',
  TUTOR_SELECTED: 'tutor_selected',
  BOOKING_CONFIRMED: 'booking_confirmed',
  TRAVELING: 'traveling',
  ARRIVED: 'arrived',
  SESSION_STARTED: 'session_started',
  SESSION_COMPLETED: 'session_completed',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
  NO_TUTOR_FOUND: 'no_tutor_found',
} as const;

export type FlashStatus = (typeof FLASH_STATUS)[keyof typeof FLASH_STATUS];

// Tracking status
export const TRACKING_STATUS = {
  NOT_STARTED: 'not_started',
  TRAVELING: 'traveling',
  ARRIVED: 'arrived',
  SESSION_STARTED: 'session_started',
  SESSION_COMPLETED: 'session_completed',
  CANCELLED: 'cancelled',
} as const;

export type TrackingStatus = (typeof TRACKING_STATUS)[keyof typeof TRACKING_STATUS];

// Review moderation
export const MODERATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  HIDDEN: 'hidden',
  REMOVED: 'removed',
} as const;

export type ModerationStatus = (typeof MODERATION_STATUS)[keyof typeof MODERATION_STATUS];

// Report status
export const REPORT_STATUS = {
  PENDING: 'pending',
  REVIEWING: 'reviewing',
  RESOLVED: 'resolved',
  DISMISSED: 'dismissed',
} as const;

export type ReportStatus = (typeof REPORT_STATUS)[keyof typeof REPORT_STATUS];

// Cancellation reasons
export const CANCELLATION_REASONS = [
  'changed_plans',
  'tutor_unavailable',
  'student_unavailable',
  'inappropriate_communication',
  'emergency',
  'other',
] as const;

export type CancellationReason = (typeof CANCELLATION_REASONS)[number];

// Days of week
export const DAYS_OF_WEEK = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// GeoJSON constants
export const GEO = {
  MAX_RADIUS_KM: 50,
  DEFAULT_RADIUS_KM: 10,
  EARTH_RADIUS_KM: 6371,
} as const;
