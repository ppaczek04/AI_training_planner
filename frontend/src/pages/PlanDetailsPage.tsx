import { Link, useParams } from 'react-router-dom';
import { getMockPlanById } from '../services/mockPlans';

export const PlanDetailsPage = () => {
  const { planId } = useParams<{ planId: string }>();
  const plan = planId ? getMockPlanById(planId) : undefined;

  if (!plan) {
    return (
      <section className="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Nie znaleziono planu</h1>
        <p className="mt-2 text-slate-600">
          Plan o podanym identyfikatorze nie istnieje lub został usunięty.
        </p>
        <Link
          to="/my-plans"
          className="mt-4 inline-block rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
        >
          Wróć do moich planów
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">{plan.plan_metadata.plan_name}</h1>
        <p className="mt-1 text-slate-600">
          Typ: {plan.plan_metadata.plan_type} | Trudność: {plan.plan_metadata.difficulty}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Szacowany czas sesji: {plan.plan_metadata.estimated_session_time_minutes} minut
        </p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Profil użytkownika</h2>
        <dl className="mt-4 grid gap-3 text-sm text-slate-700 md:grid-cols-3">
          <div>
            <dt className="text-slate-500">Płeć</dt>
            <dd className="font-medium">{plan.user_profile.sex}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Wiek</dt>
            <dd className="font-medium">{plan.user_profile.age}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Wzrost</dt>
            <dd className="font-medium">{plan.user_profile.height_cm} cm</dd>
          </div>
          <div>
            <dt className="text-slate-500">Waga</dt>
            <dd className="font-medium">{plan.user_profile.weight_kg} kg</dd>
          </div>
          <div>
            <dt className="text-slate-500">Poziom</dt>
            <dd className="font-medium">{plan.user_profile.experience_level}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Dni/tydzień</dt>
            <dd className="font-medium">{plan.user_profile.days_per_week}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Dni treningowe i ćwiczenia</h2>
        <div className="mt-4 space-y-4">
          {plan.days.map((day) => (
            <article key={day.day_number} className="rounded-lg border border-slate-200 p-4">
              <h3 className="text-base font-semibold text-slate-900">
                {day.day_name} ({day.focus})
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {day.exercises.map((exercise, index) => (
                  <li key={`${day.day_number}-${exercise.name}-${index}`} className="rounded-md bg-slate-50 p-2">
                    {exercise.name} - serie: {exercise.sets}, powtórzenia: {exercise.reps}, przerwa: {exercise.rest_seconds}s
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {plan.warnings.length > 0 && (
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="text-lg font-semibold text-amber-900">Uwagi</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-amber-900">
            {plan.warnings.map((warning, index) => (
              <li key={`${warning}-${index}`}>{warning}</li>
            ))}
          </ul>
        </section>
      )}

      <Link
        to="/my-plans"
        className="inline-block rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
      >
        Wróć do moich planów
      </Link>
    </section>
  );
};
