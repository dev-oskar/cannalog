import { useTranslation } from 'react-i18next';
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "./hooks/useAuth";
import { useAgeVerification } from "./hooks/useAgeVerification";
import { AuthForm } from "./components/AuthForm";
import { AgeVerification } from "./components/AgeVerification";
import { ThemeToggle } from "./components/ThemeToggle";
import { LanguageSelector } from "./components/LanguageSelector";

function AuthenticatedApp() {
  const { user, signOut } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background test-variables">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-primary">{t('app.name')}</h1>
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <ThemeToggle />
            <button
              onClick={signOut}
              className="bg-primary text-background px-4 py-2 rounded-md hover:bg-primary/80 transition-colors"
            >
              {t('auth.signOut')}
            </button>
          </div>
        </div>
        <div className="text-center">
          <p className="text-primary mb-4">{t('dashboard.welcome', { email: user?.email })} 🌿</p>
          <p className="text-secondary">
            {t('dashboard.subtitle')}
          </p>
        </div>
      </div>
    </div>
  );
}

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

  return user ? <AuthenticatedApp /> : <AuthForm />;
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
