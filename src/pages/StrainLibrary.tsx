import { useTranslation } from 'react-i18next';

export function StrainLibrary() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Page Header with Action */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-primary mb-2">
            {t('strains.library.title')}
          </h1>
          <p className="text-secondary">
            {t('strains.library.subtitle')}
          </p>
        </div>
        <button className="bg-primary text-background px-4 py-2 rounded-lg hover:bg-primary/80 transition-colors shrink-0">
          {t('strains.add')}
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-surface rounded-lg border border-primary/10 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <input 
            type="text" 
            placeholder={t('strains.library.search')}
            className="flex-1 border border-primary/20 rounded-md px-3 py-2 text-sm"
          />
          <select className="border border-primary/20 rounded-md px-3 py-2 text-sm">
            <option>{t('strains.library.filters.allTypes')}</option>
            <option>{t('strains.indica')}</option>
            <option>{t('strains.sativa')}</option>
            <option>{t('strains.hybrid')}</option>
          </select>
        </div>
      </div>

      {/* Strain Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Indica Section */}
        <div className="bg-surface rounded-xl border border-primary/10 p-6">
          <div className="flex items-center mb-4">
            <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
            <h2 className="text-lg font-semibold text-primary">
              {t('strains.indica')}
            </h2>
          </div>
          <div className="text-center py-8">
            <p className="text-secondary text-sm mb-4">
              {t('strains.library.emptyStates.indica')}
            </p>
            <button className="text-primary text-sm hover:underline">
              {t('strains.library.quickAdd.addIndica')}
            </button>
          </div>
        </div>

        {/* Sativa Section */}
        <div className="bg-surface rounded-xl border border-primary/10 p-6">
          <div className="flex items-center mb-4">
            <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
            <h2 className="text-lg font-semibold text-primary">
              {t('strains.sativa')}
            </h2>
          </div>
          <div className="text-center py-8">
            <p className="text-secondary text-sm mb-4">
              {t('strains.library.emptyStates.sativa')}
            </p>
            <button className="text-primary text-sm hover:underline">
              {t('strains.library.quickAdd.addSativa')}
            </button>
          </div>
        </div>

        {/* Hybrid Section */}
        <div className="bg-surface rounded-xl border border-primary/10 p-6">
          <div className="flex items-center mb-4">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <h2 className="text-lg font-semibold text-primary">
              Hybrid
            </h2>
          </div>
          <div className="text-center py-8">
            <p className="text-secondary text-sm mb-4">
              {t('strains.library.emptyStates.hybrid')}
            </p>
            <button className="text-primary text-sm hover:underline">
              {t('strains.library.quickAdd.addHybrid')}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Add Section */}
      <div className="mt-8 bg-background/50 rounded-xl border border-primary/10 p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">{t('strains.library.quickAdd.title')}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {['Blue Dream', 'Girl Scout Cookies', 'OG Kush', 'White Widow'].map(strain => (
            <button 
              key={strain}
              className="p-3 text-sm border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors"
            >
              + {strain}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}