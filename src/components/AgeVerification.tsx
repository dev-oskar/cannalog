import { useState } from "react";
import { useTranslation } from 'react-i18next';

interface AgeVerificationProps {
  onVerified: () => void;
}

export function AgeVerification({ onVerified }: AgeVerificationProps) {
  const [confirmed, setConfirmed] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmed) {
      localStorage.setItem("cannalog_age_verified", "true");
      onVerified();
    }
  };

  return (
    <div className="fixed inset-0 bg-[#1B2951] bg-opacity-95 flex items-center justify-center px-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🌿</div>
          <h1 className="text-3xl font-bold text-[#1B2951] mb-2">{t('app.name')}</h1>
          <p className="text-[#8B6F47]">{t('app.tagline')}</p>
        </div>

        {/* Age Verification */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold text-[#1B2951] mb-4">
            {t('ageVerification.title')}
          </h2>
          <p className="text-[#8B6F47] text-sm leading-relaxed">
            {t('ageVerification.subtitle')}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center">
            <input
              id="age-confirm"
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="h-4 w-4 text-[#4A7C59] focus:ring-[#4A7C59] border-gray-300 rounded"
            />
            <label
              htmlFor="age-confirm"
              className="ml-3 text-sm text-[#1B2951]"
            >
{t('ageVerification.question')}
            </label>
          </div>

          <button
            type="submit"
            disabled={!confirmed}
            className="w-full bg-[#4A7C59] text-white py-3 px-4 rounded-md hover:bg-[#3d6649] focus:outline-none focus:ring-2 focus:ring-[#4A7C59] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
{t('ageVerification.yes')}
          </button>
        </form>

        {/* Legal Disclaimer */}
        <div className="mt-8 p-4 bg-[#F5E6D3] rounded-md">
          <p className="text-xs text-[#8B6F47] leading-relaxed">
            <strong>Legal Notice:</strong> Cannabis laws vary by location. Users
            are responsible for ensuring compliance with local, state, and
            federal laws. This app is for personal tracking purposes only and
            should not be used where cannabis is illegal.
          </p>
        </div>
      </div>
    </div>
  );
}
