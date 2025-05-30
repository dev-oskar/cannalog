import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth";

export function Dashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary mb-2">
          {t("dashboard.title")}
        </h1>
        <p className="text-secondary">
          {t("dashboard.subtitle")}
        </p>
      </div>

      {/* Welcome Section */}
      <div className="bg-surface rounded-xl shadow-sm border border-primary/10 p-6 mb-6">
        <div className="text-center">
          <p className="text-primary mb-4 text-lg">
            {t("dashboard.welcome", { email: user?.email })} 🌿
          </p>
          <p className="text-secondary">
            {t("dashboard.subtitle")}
          </p>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-surface rounded-lg border border-primary/10 p-4">
          <h3 className="text-sm font-medium text-secondary mb-1">{t('dashboard.stats.totalSessions')}</h3>
          <p className="text-2xl font-bold text-primary">0</p>
        </div>
        <div className="bg-surface rounded-lg border border-primary/10 p-4">
          <h3 className="text-sm font-medium text-secondary mb-1">{t('dashboard.stats.favoriteStrain')}</h3>
          <p className="text-lg font-semibold text-tertiary">-</p>
        </div>
        <div className="bg-surface rounded-lg border border-primary/10 p-4">
          <h3 className="text-sm font-medium text-secondary mb-1">{t('dashboard.stats.thisWeek')}</h3>
          <p className="text-2xl font-bold text-primary">0</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-surface rounded-xl shadow-sm border border-primary/10 p-6">
        <h2 className="text-lg font-semibold text-primary mb-4">{t('dashboard.stats.recentActivity')}</h2>
        <div className="text-center py-8">
          <p className="text-secondary mb-4">{t('dashboard.stats.noSessions')}</p>
          <button className="bg-primary text-background px-6 py-2 rounded-lg hover:bg-primary/80 transition-colors">
            {t('dashboard.stats.logFirst')}
          </button>
        </div>
      </div>
    </div>
  );
}
