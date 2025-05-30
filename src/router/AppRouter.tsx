import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../layouts';
import { Dashboard, SessionHistory, StrainLibrary } from '../pages';
import { AuthForm } from '../components/AuthForm';
import { AgeVerification } from '../components/AgeVerification';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />
  },
  {
    path: '/auth',
    element: <AuthForm />
  },
  {
    path: '/age-verification',
    element: <AgeVerification onVerified={() => {}} />
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        path: 'dashboard',
        element: <Dashboard />
      },
      {
        path: 'sessions',
        element: <SessionHistory />
      },
      {
        path: 'strains',
        element: <StrainLibrary />
      }
    ]
  }
]);