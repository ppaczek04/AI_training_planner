import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { createLocalPlan } from '../services/mockPlans';

interface NewPlanFormData {
  daysPerWeek: string;
  weight: string;
  sex: string;
  height: string;
  age: string;
  experienceLevel: string;
  availableEquipment: string[];
}

const EQUIPMENT_OPTIONS = [
  { value: 'barbell', label: 'Barbell' },
  { value: 'dumbbell', label: 'Dumbbells' },
  { value: 'bench', label: 'Bench' },
  { value: 'machine', label: 'Machines' },
  { value: 'cable_machine', label: 'Cable Machine' },
  { value: 'pullup_bar', label: 'Pull-up Bar' },
  { value: 'squat_rack', label: 'Squat Rack' },
] as const;

const INITIAL_FORM: NewPlanFormData = {
  daysPerWeek: '',
  weight: '',
  sex: '',
  height: '',
  age: '',
  experienceLevel: '',
  availableEquipment: [],
};

export const NewPlanPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState<NewPlanFormData>(INITIAL_FORM);
  const [message, setMessage] = useState<string | null>(null);

  const handleEquipmentToggle = (value: string, isChecked: boolean) => {
    setFormData((previous) => {
      if (isChecked) {
        return {
          ...previous,
          availableEquipment: [...previous.availableEquipment, value],
        };
      }

      return {
        ...previous,
        availableEquipment: previous.availableEquipment.filter((item) => item !== value),
      };
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const requiredFields: Array<keyof Omit<NewPlanFormData, 'availableEquipment'>> = [
      'daysPerWeek',
      'weight',
      'sex',
      'height',
      'age',
      'experienceLevel',
    ];

    const hasEmptyRequiredField = requiredFields.some((field) => !formData[field]);

    if (hasEmptyRequiredField) {
      setMessage('Uzupełnij wszystkie wymagane pola formularza.');
      return;
    }

    if (!user?.id) {
      setMessage('Nie znaleziono aktywnego użytkownika. Zaloguj się ponownie.');
      return;
    }

    createLocalPlan({
      userId: user.id,
      daysPerWeek: Number(formData.daysPerWeek),
      weight: Number(formData.weight),
      sex: formData.sex,
      height: Number(formData.height),
      age: Number(formData.age),
      experienceLevel: formData.experienceLevel,
      availableEquipment: formData.availableEquipment,
    });

    setMessage('Plan został zapisany. Przenoszę do listy „Moje plany”.');
    setFormData(INITIAL_FORM);
    navigate('/my-plans');
  };

  return (
    <section className="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Ułóż plan treningowy</h1>
      <p className="mt-1 text-sm text-slate-500">Wersja V1: formularz i walidacja po stronie frontendu.</p>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="space-y-1">
          <span className="block text-sm font-medium text-slate-700">Dni treningowe / tydzień</span>
          <select
            value={formData.daysPerWeek}
            onChange={(event) => setFormData((prev) => ({ ...prev, daysPerWeek: event.target.value }))}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          >
            <option value="">Wybierz</option>
            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
              <option key={day} value={String(day)}>
                {day}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="block text-sm font-medium text-slate-700">Waga (kg)</span>
          <input
            type="number"
            min="1"
            value={formData.weight}
            onChange={(event) => setFormData((prev) => ({ ...prev, weight: event.target.value }))}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            placeholder="np. 78"
          />
        </label>

        <label className="space-y-1">
          <span className="block text-sm font-medium text-slate-700">Płeć</span>
          <select
            value={formData.sex}
            onChange={(event) => setFormData((prev) => ({ ...prev, sex: event.target.value }))}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          >
            <option value="">Wybierz</option>
            <option value="male">Mężczyzna</option>
            <option value="female">Kobieta</option>
            <option value="other">Inna</option>
          </select>
        </label>

        <label className="space-y-1">
          <span className="block text-sm font-medium text-slate-700">Wzrost (cm)</span>
          <input
            type="number"
            min="1"
            value={formData.height}
            onChange={(event) => setFormData((prev) => ({ ...prev, height: event.target.value }))}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            placeholder="np. 182"
          />
        </label>

        <label className="space-y-1">
          <span className="block text-sm font-medium text-slate-700">Wiek</span>
          <input
            type="number"
            min="1"
            max="120"
            value={formData.age}
            onChange={(event) => setFormData((prev) => ({ ...prev, age: event.target.value }))}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            placeholder="np. 23"
          />
        </label>

        <label className="space-y-1">
          <span className="block text-sm font-medium text-slate-700">Poziom zaawansowania</span>
          <select
            value={formData.experienceLevel}
            onChange={(event) => setFormData((prev) => ({ ...prev, experienceLevel: event.target.value }))}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          >
            <option value="">Wybierz</option>
            <option value="beginner">Początkujący</option>
            <option value="intermediate">Średniozaawansowany</option>
            <option value="advanced">Zaawansowany</option>
          </select>
        </label>

        <fieldset className="md:col-span-2">
          <legend className="mb-2 block text-sm font-medium text-slate-700">Dostępny sprzęt</legend>
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
            {EQUIPMENT_OPTIONS.map((equipment) => (
              <label key={equipment.value} className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2">
                <input
                  type="checkbox"
                  checked={formData.availableEquipment.includes(equipment.value)}
                  onChange={(event) => handleEquipmentToggle(equipment.value, event.target.checked)}
                />
                <span className="text-sm text-slate-700">{equipment.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {message && (
          <p className="md:col-span-2 rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700">
            {message}
          </p>
        )}

        <div className="md:col-span-2">
          <button
            type="submit"
            className="w-full rounded-md bg-slate-900 px-4 py-2 font-medium text-white transition-colors hover:bg-slate-700"
          >
            Zapisz formularz
          </button>
        </div>
      </form>
    </section>
  );
};
