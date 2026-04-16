import type { StoredWorkoutPlan } from '../types/workoutPlan';

interface NewPlanInput {
  userId: string;
  daysPerWeek: number;
  weight: number;
  sex: string;
  height: number;
  age: number;
  experienceLevel: string;
  availableEquipment: string[];
}

const LOCAL_STORAGE_KEY = 'ai-training-planner.user-plans';

const mockPlans: StoredWorkoutPlan[] = [
  {
    id: 'plan-strength-001',
    created_at: '2026-04-10T08:30:00.000Z',
    user_profile: {
      sex: 'male',
      age: 23,
      height_cm: 182,
      weight_kg: 79,
      experience_level: 'intermediate',
      days_per_week: 4,
      available_equipment: ['barbell', 'dumbbell', 'bench', 'squat_rack'],
    },
    plan_metadata: {
      plan_name: 'Siła 4-dniowa FBW',
      plan_type: 'strength',
      difficulty: 'intermediate',
      estimated_session_time_minutes: 65,
    },
    days_requested: 4,
    days_generated: 4,
    warnings: [],
    days: [
      {
        day_number: 1,
        day_name: 'Dzień 1',
        focus: 'Nogi + core',
        exercises: [
          { name: 'Przysiad ze sztangą', sets: 5, reps: '5', rest_seconds: 180 },
          { name: 'Rumuński martwy ciąg', sets: 4, reps: '6-8', rest_seconds: 150 },
          { name: 'Plank', sets: 3, reps: '45s', rest_seconds: 60 },
        ],
      },
      {
        day_number: 2,
        day_name: 'Dzień 2',
        focus: 'Klatka + triceps',
        exercises: [
          { name: 'Wyciskanie sztangi leżąc', sets: 5, reps: '5', rest_seconds: 180 },
          { name: 'Wyciskanie hantli skos dodatni', sets: 3, reps: '8-10', rest_seconds: 120 },
          { name: 'Prostowanie ramion na wyciągu', sets: 3, reps: '10-12', rest_seconds: 90 },
        ],
      },
      {
        day_number: 3,
        day_name: 'Dzień 3',
        focus: 'Plecy + biceps',
        exercises: [
          { name: 'Podciąganie nachwytem', sets: 4, reps: '6-8', rest_seconds: 150 },
          { name: 'Wiosłowanie sztangą', sets: 4, reps: '6-8', rest_seconds: 150 },
          { name: 'Uginanie ramion z hantlami', sets: 3, reps: '10-12', rest_seconds: 90 },
        ],
      },
      {
        day_number: 4,
        day_name: 'Dzień 4',
        focus: 'Barki + akcesoria',
        exercises: [
          { name: 'Wyciskanie żołnierskie', sets: 4, reps: '6', rest_seconds: 150 },
          { name: 'Unoszenie bokiem', sets: 3, reps: '12-15', rest_seconds: 75 },
          { name: 'Face pull', sets: 3, reps: '12-15', rest_seconds: 75 },
        ],
      },
    ],
  },
  {
    id: 'plan-hypertrophy-002',
    created_at: '2026-04-12T18:10:00.000Z',
    user_profile: {
      sex: 'female',
      age: 21,
      height_cm: 168,
      weight_kg: 60,
      experience_level: 'beginner',
      days_per_week: 3,
      available_equipment: ['dumbbell', 'machine', 'cable_machine', 'bench'],
    },
    plan_metadata: {
      plan_name: 'Sylwetka START 3 dni',
      plan_type: 'hypertrophy',
      difficulty: 'beginner',
      estimated_session_time_minutes: 50,
    },
    days_requested: 3,
    days_generated: 3,
    warnings: ['Zwiększaj ciężar stopniowo co 1-2 tygodnie, jeśli technika pozostaje poprawna.'],
    days: [
      {
        day_number: 1,
        day_name: 'Dzień 1',
        focus: 'Pośladki + tył uda',
        exercises: [
          { name: 'Hip thrust', sets: 4, reps: '10-12', rest_seconds: 90 },
          { name: 'Martwy ciąg na prostych nogach', sets: 3, reps: '10', rest_seconds: 90 },
          { name: 'Uginanie nóg na maszynie', sets: 3, reps: '12', rest_seconds: 75 },
        ],
      },
      {
        day_number: 2,
        day_name: 'Dzień 2',
        focus: 'Plecy + brzuch',
        exercises: [
          { name: 'Przyciąganie drążka do klatki', sets: 3, reps: '10-12', rest_seconds: 90 },
          { name: 'Wiosłowanie siedząc na wyciągu', sets: 3, reps: '10-12', rest_seconds: 90 },
          { name: 'Dead bug', sets: 3, reps: '10/strona', rest_seconds: 60 },
        ],
      },
      {
        day_number: 3,
        day_name: 'Dzień 3',
        focus: 'Nogi + barki',
        exercises: [
          { name: 'Goblet squat', sets: 4, reps: '10-12', rest_seconds: 90 },
          { name: 'Wykroki chodzone', sets: 3, reps: '10/strona', rest_seconds: 90 },
          { name: 'Unoszenie hantli bokiem', sets: 3, reps: '12-15', rest_seconds: 75 },
        ],
      },
    ],
  },
];

const normalizeSex = (sex: string): string => {
  if (sex === 'male' || sex === 'female') {
    return sex;
  }

  return 'male';
};

const getStoredLocalPlans = (): StoredWorkoutPlan[] => {
  const rawValue = localStorage.getItem(LOCAL_STORAGE_KEY);

  if (!rawValue) {
    return [];
  }

  try {
    return JSON.parse(rawValue) as StoredWorkoutPlan[];
  } catch {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    return [];
  }
};

const saveLocalPlans = (plans: StoredWorkoutPlan[]): void => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(plans));
};

const estimatedSessionTime = (daysPerWeek: number, experienceLevel: string): number => {
  if (experienceLevel === 'beginner') {
    return 45;
  }

  if (experienceLevel === 'advanced') {
    return daysPerWeek >= 5 ? 75 : 70;
  }

  return daysPerWeek >= 5 ? 65 : 60;
};

const baseFocus = ['Push', 'Pull', 'Legs', 'Upper', 'Lower', 'Full Body', 'Core'];

const buildDays = (daysPerWeek: number, experienceLevel: string) => {
  const reps = experienceLevel === 'beginner' ? '10-12' : experienceLevel === 'advanced' ? '6-8' : '8-10';
  const rest = experienceLevel === 'beginner' ? 60 : experienceLevel === 'advanced' ? 120 : 90;

  return Array.from({ length: daysPerWeek }, (_, index) => {
    const dayNumber = index + 1;
    const focus = baseFocus[index % baseFocus.length];

    return {
      day_number: dayNumber,
      day_name: `Dzień ${dayNumber}`,
      focus,
      exercises: [
        {
          name: `${focus} - ćwiczenie główne`,
          sets: 4,
          reps,
          rest_seconds: rest,
        },
        {
          name: `${focus} - ćwiczenie pomocnicze`,
          sets: 3,
          reps,
          rest_seconds: rest,
        },
        {
          name: `${focus} - akcesoria`,
          sets: 3,
          reps: '12-15',
          rest_seconds: 60,
        },
      ],
    };
  });
};

export const getMockPlans = (userId?: string): StoredWorkoutPlan[] => {
  const localPlans = getStoredLocalPlans();
  const userLocalPlans = userId ? localPlans.filter((plan) => plan.id.startsWith(`user-${userId}-`)) : localPlans;
  return [...userLocalPlans, ...mockPlans];
};

export const createLocalPlan = (input: NewPlanInput): StoredWorkoutPlan => {
  const createdAt = new Date().toISOString();
  const id = `user-${input.userId}-${Date.now()}`;
  const days = buildDays(input.daysPerWeek, input.experienceLevel);

  const newPlan: StoredWorkoutPlan = {
    id,
    created_at: createdAt,
    user_profile: {
      sex: normalizeSex(input.sex),
      age: input.age,
      height_cm: Math.round(input.height),
      weight_kg: input.weight,
      experience_level: input.experienceLevel,
      days_per_week: input.daysPerWeek,
      available_equipment: input.availableEquipment,
    },
    plan_metadata: {
      plan_name: `Plan ${input.daysPerWeek}-dniowy`,
      plan_type: 'rule_based',
      difficulty: input.experienceLevel,
      estimated_session_time_minutes: estimatedSessionTime(input.daysPerWeek, input.experienceLevel),
    },
    days_requested: input.daysPerWeek,
    days_generated: days.length,
    warnings: input.availableEquipment.length === 0 ? ['Nie wybrano sprzętu. Plan używa ćwiczeń ogólnych.'] : [],
    days,
  };

  const existingPlans = getStoredLocalPlans();
  saveLocalPlans([newPlan, ...existingPlans]);

  return newPlan;
};

export const getMockPlanById = (planId: string): StoredWorkoutPlan | undefined => {
  const localPlan = getStoredLocalPlans().find((plan) => plan.id === planId);

  if (localPlan) {
    return localPlan;
  }

  return mockPlans.find((plan) => plan.id === planId);
};
