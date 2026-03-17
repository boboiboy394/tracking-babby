// User & Auth Types
export type UserRole = 'parent' | 'nurse' | 'clinic';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  username?: string | null;
}

// Child Types
export interface Child {
  id: string;
  parent_id: string;
  name: string;
  birth_date: string;
  gender: 'male' | 'female' | null;
  photo_url: string | null;
  clinic_id: string | null;
  created_at: string;
}

// Tracking Types
export type RecordType = 'feeding' | 'milestone' | 'vaccination' | 'growth' | 'sleep';

export interface FeedingData {
  type: 'milk' | 'porridge' | 'solid';
  amount_ml?: number;
  times: number;
}

export interface MilestoneData {
  milestone_type: 'teeth' | 'crawl' | 'walk' | 'talk' | 'roll' | 'sit';
  description: string;
  date_achieved?: string;
  media_url?: string;
  media_type?: 'image' | 'video';
}

export interface VaccinationData {
  vaccine_name: string;
  dose_number: number;
  date: string;
  hospital?: string;
  location?: string;
}

export interface GrowthData {
  height_cm: number;
  weight_kg: number;
  head_circumference_cm?: number;
}

export interface SleepData {
  duration_minutes: number;
  nap_count: number;
}

export type RecordData = FeedingData | MilestoneData | VaccinationData | GrowthData | SleepData;

export interface TrackingRecord {
  id: string;
  child_id: string;
  record_type: RecordType;
  record_date: string;
  data: RecordData;
  notes: string | null;
  created_at: string;
}

// Chat Types
export interface ChatSession {
  id: string;
  child_id: string;
  title: string | null;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

// AI Analysis Types
export interface AIAnalysisRequest {
  child_id: string;
  date_from?: string;
  date_to?: string;
  data_types: RecordType[];
}

export interface AIAnalysisResponse {
  summary: string;
  growth_assessment: string;
  feeding_insights: string;
  recommendations: string[];
  alerts: string[];
}

// Moments Types
export interface Moment {
  id: string;
  user_id: string;
  child_id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
  // Joined fields (optional)
  child_name?: string;
  user_name?: string;
  user_avatar?: string;
}

export interface FamilyGroup {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
}

export interface FamilyMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
}

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface MomentShare {
  id: string;
  moment_id: string;
  shared_with_id: string;
  shared_type: 'friend' | 'family';
  created_at: string;
}
