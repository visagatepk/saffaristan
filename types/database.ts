export type UserRole = 'seeker' | 'consultant' | 'admin'

export type VerificationStatus = 
  | 'none' 
  | 'pending_verification' 
  | 'active' 
  | 'rejected'

export interface Profile {
  id: string
  user_id: string
  role: UserRole
  full_name: string | null
  email: string | null
  phone: string | null
  avatar_url: string | null
  city: string | null
  is_verified: boolean
  verification_status: VerificationStatus
  display_name: string | null
  business_name: string | null
  office_address: string | null
  years_experience: number | null
  bio: string | null
  whatsapp_number: string | null
  beoe_certificate_url: string | null
  ntn_certificate_url: string | null
  cnic_front_url: string | null
  cnic_back_url: string | null
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  consultant_id: string
  title: string
  description: string | null
  visa_type: string | null
  destination_country: string | null
  price_min: number | null
  price_max: number | null
  processing_days: number | null
  is_active: boolean
  created_at: string
}

export interface Review {
  id: string
  consultant_id: string
  reviewer_id: string
  rating: number
  comment: string | null
  is_approved: boolean
  created_at: string
}

export interface Booking {
  id: string
  seeker_id: string
  consultant_id: string
  service_id: string | null
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  notes: string | null
  scheduled_at: string | null
  created_at: string
}