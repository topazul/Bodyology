export type UserRole = 'coach' | 'client'
export type DayType = 'str' | 'hyp' | 'cor' | 'aer' | 'mob' | 'rec' | 'rst'
export type WeightUnit = 'kg' | 'lbs'

export interface User {
  id: string
  email: string
  full_name: string
  role: UserRole
  avatar_url?: string
  created_at: string
}

export interface CoachProfile {
  id: string
  user_id: string
  bio?: string
  specialties: string[]
  years_experience?: number
  rating_avg: number
  rating_count: number
  users?: User
}

export interface CoachClient {
  id: string
  coach_id: string
  client_id: string
  goal?: string
  focus_type?: string
  program_week: number
  intensity_min: number
  intensity_max: number
  coach_note?: string
  active: boolean
  started_at: string
  coach?: User
  client?: User
}

export interface WorkoutDay {
  id: string
  coach_client_id: string
  week_number: number
  day_of_week: number
  day_type: DayType
  is_rest: boolean
  coach_note?: string
  exercises?: Exercise[]
}

export interface Exercise {
  id: string
  workout_day_id: string
  name: string
  sets: string
  intensity_pct: number
  coach_note?: string
  video_url?: string
  order_index: number
  completed?: boolean
}

export interface ExerciseCompletion {
  id: string
  exercise_id: string
  client_id: string
  completed_at: string
}

export interface PersonalRecord {
  id: string
  client_id: string
  exercise_name: string
  weight: number
  unit: WeightUnit
  notes?: string
  logged_at: string
}

export interface Message {
  id: string
  coach_client_id: string
  sender_id: string
  body: string
  sent_at: string
  read_at?: string
  sender?: User
}

export interface CoachReview {
  id: string
  coach_id: string
  client_id: string
  rating: number
  duration_worked?: string
  goal?: string
  key_result?: string
  review_text?: string
  created_at: string
  client?: User
}
