import { useTranslation } from 'react-i18next';

export function SessionHistory() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Page Header with Action */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-primary mb-2">
            {t('sessions.history.title')}
          </h1>
          <p className="text-secondary">
            {t('sessions.history.subtitle')}
          </p>
        </div>
        <button className="bg-primary text-background px-4 py-2 rounded-lg hover:bg-primary/80 transition-colors shrink-0">
          {t('sessions.add')}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-surface rounded-lg border border-primary/10 p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <select className="border border-primary/20 rounded-md px-3 py-2 text-sm">
            <option>{t('sessions.history.filters.allTime')}</option>
            <option>{t('sessions.history.filters.thisWeek')}</option>
            <option>{t('sessions.history.filters.thisMonth')}</option>
            <option>{t('sessions.history.filters.last3Months')}</option>
          </select>
          <select className="border border-primary/20 rounded-md px-3 py-2 text-sm">
            <option>{t('sessions.history.filters.allStrains')}</option>
          </select>
          <select className="border border-primary/20 rounded-md px-3 py-2 text-sm">
            <option>{t('sessions.history.filters.allMethods')}</option>
            <option>{t('sessions.history.methods.joint')}</option>
            <option>{t('sessions.history.methods.pipe')}</option>
            <option>{t('sessions.history.methods.vape')}</option>
            <option>{t('sessions.history.methods.edible')}</option>
          </select>
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {/* Empty State */}
        <div className="bg-surface rounded-xl border border-primary/10 p-12 text-center">
          <div className="text-6xl mb-4">🌿</div>
          <h3 className="text-lg font-semibold text-primary mb-2">
            {t('sessions.history.emptyState.title')}
          </h3>
          <p className="text-secondary mb-6">
            {t('sessions.history.emptyState.description')}
          </p>
          <button className="bg-primary text-background px-6 py-3 rounded-lg hover:bg-primary/80 transition-colors">
            {t('sessions.add')}
          </button>
        </div>
      </div>
    </div>
  );
}