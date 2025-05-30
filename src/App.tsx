import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./hooks/useAuth";
import { useAgeVerification } from "./hooks/useAgeVerification";
import { AuthForm } from "./components/AuthForm";
import { AgeVerification } from "./components/AgeVerification";

function AuthenticatedApp() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-[#F5E6D3]">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-[#1B2951]">
            CannaLog
          </h1>
          <button
            onClick={signOut}
            className="bg-[#8B6F47] text-white px-4 py-2 rounded-md hover:bg-[#7a5f3e] transition-colors"
          >
            Sign Out
          </button>
        </div>
        
        <div className="text-center">
          <p className="text-[#1B2951] mb-4">
            Welcome, {user?.email}! 🌿
          </p>
          <p className="text-[#8B6F47]">
            Authentication working! Ready for the next features.
          </p>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const { isVerified, loading: ageLoading, markAsVerified } = useAgeVerification();

  // Show loading while checking both auth and age verification
  if (authLoading || ageLoading) {
    return (
      <div className="min-h-screen bg-[#F5E6D3] flex items-center justify-center">
        <div className="text-[#1B2951]">Loading...</div>
      </div>
    );
  }

  // Show age verification gate first
  if (!isVerified) {
    return <AgeVerification onVerified={markAsVerified} />;
  }

  // Then show auth flow
  return user ? <AuthenticatedApp /> : <AuthForm />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
