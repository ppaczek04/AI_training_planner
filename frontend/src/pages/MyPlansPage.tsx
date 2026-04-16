import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getMockPlans } from '../services/mockPlans';

const formatCreatedAt = (createdAt: string): string =>
  new Date(createdAt).toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

export const MyPlansPage = () => {
  const { user } = useAuth();
  const plans = getMockPlans(user?.id);

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Moje plany treningowe</h1>
        <p className="mt-2 text-slate-600">
          Poniżej widzisz zapisane plany użytkownika (mock danych zgodny z backendowym modelem).
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {plans.map((plan) => {
          const focusSummary = plan.days.map((day) => day.focus).join(', ');

          return (
            <article
              key={plan.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <h2 className="text-lg font-semibold text-slate-900">{plan.plan_metadata.plan_name}</h2>
              <p className="mt-1 text-sm text-slate-600">
                Typ: {plan.plan_metadata.plan_type} | Trudność: {plan.plan_metadata.difficulty}
              </p>

              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-700">
                <div>
                  <dt className="text-slate-500">Wygenerowane dni</dt>
                  <dd className="font-medium">{plan.days_generated}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Czas sesji</dt>
                  <dd className="font-medium">{plan.plan_metadata.estimated_session_time_minutes} min</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Utworzono</dt>
                  <dd className="font-medium">{formatCreatedAt(plan.created_at)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Dni/tydzień</dt>
                  <dd className="font-medium">{plan.user_profile.days_per_week}</dd>
                </div>
              </dl>

              <p className="mt-4 text-sm text-slate-600">
                <span className="font-medium text-slate-700">Focus:</span> {focusSummary}
              </p>

              <Link
                to={`/my-plans/${plan.id}`}
                className="mt-4 inline-block rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
              >
                Zobacz szczegóły
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
};
