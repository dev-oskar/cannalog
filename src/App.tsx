import { useTranslation } from 'react-i18next';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "./hooks/useAuth";
import { useAgeVerification } from "./hooks/useAgeVerification";
import { AuthForm } from "./components/AuthForm";
import { AgeVerification } from "./components/AgeVerification";
import { router } from "./router";

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const {
    isVerified,
    loading: ageLoading,
    markAsVerified,
  } = useAgeVerification();
  const { t } = useTranslation();

  if (authLoading || ageLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary">{t('common.loading')}</div>
      </div>
    );
  }

  if (!isVerified) {
    return <AgeVerification onVerified={markAsVerified} />;
  }

  if (!user) {
    return <AuthForm />;
  }

  return <RouterProvider router={router} />;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
