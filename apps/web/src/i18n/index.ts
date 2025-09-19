import i18n, { type Resource, type ResourceLanguage } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

export const DEFAULT_LANGUAGE = 'en';
export const NAMESPACES = [
  'common',
  'members',
  'songs',
  'arrangements',
  'services',
  'songSets',
  'validation',
] as const;

type Namespace = (typeof NAMESPACES)[number];

type LocaleModule = { default: ResourceLanguage };

const isNamespace = (value: string): value is Namespace =>
  (NAMESPACES as readonly string[]).includes(value);

const localeModules = import.meta.glob('../locales/*/*.json', { eager: true });

const resources: Resource = {};

Object.entries(localeModules).forEach(([path, module]) => {
  const match = path.match(/\.\.\/locales\/([^/]+)\/([^/]+)\.json$/);

  if (!match) {
    return;
  }

  const [, language, namespace] = match;

  if (!isNamespace(namespace)) {
    return;
  }

  const resourceModule = module as LocaleModule;

  resources[language] = {
    ...(resources[language] ?? {}),
    [namespace]: resourceModule.default,
  };
});

if (!resources[DEFAULT_LANGUAGE]) {
  resources[DEFAULT_LANGUAGE] = {};
}

const supportedLngs = Array.from(
  new Set([...Object.keys(resources), DEFAULT_LANGUAGE]),
);

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: DEFAULT_LANGUAGE,
    ns: NAMESPACES,
    defaultNS: 'common',
    supportedLngs,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
      caches: ['localStorage'],
    },
    keySeparator: false,
    returnNull: false,
  });

export const setAppLanguage = (language: string) => {
  void i18n.changeLanguage(language);
};

export const getAppLanguage = () => i18n.language ?? DEFAULT_LANGUAGE;

export default i18n;
