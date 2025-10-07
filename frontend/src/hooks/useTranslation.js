import { useTranslation as useI18nTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';

// Custom hook that combines i18next translation with language context
export const useTranslation = (namespace = 'translation') => {
  const { t: i18nT, ...i18nRest } = useI18nTranslation(namespace);
  const { currentLanguage, changeLanguage, toggleLanguage, isRTL } = useLanguage();

  // Enhanced translation function with language context
  const t = (key, options = {}) => {
    return i18nT(key, {
      ...options,
      lng: currentLanguage,
    });
  };

  return {
    t,
    currentLanguage,
    changeLanguage,
    toggleLanguage,
    isRTL,
    ...i18nRest,
  };
};

export default useTranslation;
