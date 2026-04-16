import { Navigate, Route, Routes } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { ProtectedRoute } from './components/routing/ProtectedRoute';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './pages/LoginPage';
import { MyPlansPage } from './pages/MyPlansPage';
import { NewPlanPage } from './pages/NewPlanPage';
import { PlanDetailsPage } from './pages/PlanDetailsPage';
import { ProgressPage } from './pages/ProgressPage';
import { RegisterPage } from './pages/RegisterPage';

const App = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <Routes>
          <Route path="/login" element={isAuthenticated ? <Navigate to="/new-plan" replace /> : <LoginPage />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/new-plan" replace /> : <RegisterPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/new-plan" element={<NewPlanPage />} />
            <Route path="/my-plans" element={<MyPlansPage />} />
            <Route path="/my-plans/:planId" element={<PlanDetailsPage />} />
            <Route path="/progress" element={<ProgressPage />} />
          </Route>

          <Route
            path="*"
            element={<Navigate to={isAuthenticated ? '/new-plan' : '/login'} replace />}
          />
        </Routes>
      </main>
    </div>
  );
};

export default App;
