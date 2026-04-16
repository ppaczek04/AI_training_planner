export interface PlannedExercise {
  name: string;
  sets: number;
  reps: string;
  rest_seconds: number;
}

export interface WorkoutDay {
  day_number: number;
  day_name: string;
  focus: string;
  exercises: PlannedExercise[];
}

export interface PlanMetadata {
  plan_name: string;
  plan_type: string;
  difficulty: string;
  estimated_session_time_minutes: number;
}

export interface UserProfile {
  sex: string;
  age: number;
  height_cm: number;
  weight_kg: number;
  experience_level: string;
  days_per_week: number;
  available_equipment: string[];
}

export interface WorkoutPlan {
  user_profile: UserProfile;
  plan_metadata: PlanMetadata;
  days: WorkoutDay[];
  days_requested: number;
  days_generated: number;
  warnings: string[];
}

export interface StoredWorkoutPlan extends WorkoutPlan {
  id: string;
  created_at: string;
}
