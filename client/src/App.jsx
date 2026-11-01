import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCurrentUser } from './store/authSlice';
import { ROUTES } from './constants/routes';

// Layout
import { MainLayout } from './layouts/MainLayout';

// Pages
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { DailyTrackerPage } from './pages/DailyTrackerPage';
import { NutritionPage } from './pages/NutritionPage';
import { HydrationPage } from './pages/HydrationPage';
import { FitnessPage } from './pages/FitnessPage';
import { SleepTrackerPage } from './pages/SleepTrackerPage';
import { WeightTrackerPage } from './pages/WeightTrackerPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ReportsPage } from './pages/ReportsPage';
import { GoalsHabitsPage } from './pages/GoalsHabitsPage';
import { SettingsPage } from './pages/SettingsPage';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  return <MainLayout>{children}</MainLayout>;
};

export const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCurrentUser());
    }
  }, [isAuthenticated, dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Authentication Routes */}
        <Route
          path={ROUTES.LOGIN}
          element={
            isAuthenticated ? <Navigate to={ROUTES.DASHBOARD} replace /> : <LoginPage />
          }
        />
        <Route
          path={ROUTES.REGISTER}
          element={
            isAuthenticated ? <Navigate to={ROUTES.DASHBOARD} replace /> : <RegisterPage />
          }
        />

        {/* 11 Main Protected App Routes */}
        <Route
          path={ROUTES.DASHBOARD}
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.DAILY_TRACKER}
          element={
            <ProtectedRoute>
              <DailyTrackerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.NUTRITION}
          element={
            <ProtectedRoute>
              <NutritionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.HYDRATION}
          element={
            <ProtectedRoute>
              <HydrationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.FITNESS}
          element={
            <ProtectedRoute>
              <FitnessPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.SLEEP}
          element={
            <ProtectedRoute>
              <SleepTrackerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.WEIGHT}
          element={
            <ProtectedRoute>
              <WeightTrackerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ANALYTICS}
          element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.REPORTS}
          element={
            <ProtectedRoute>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.GOALS}
          element={
            <ProtectedRoute>
              <GoalsHabitsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.SETTINGS}
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

