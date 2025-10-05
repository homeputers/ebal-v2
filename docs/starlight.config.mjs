import { defaultSiteLocale, siteLocaleMeta } from './src/config/siteMeta.js';

const defaultLocale = defaultSiteLocale;

export const sidebarEn = [
  {
    label: 'Getting Started',
    autogenerate: { directory: 'getting-started' }
  },
  {
    label: 'Manuals',
    autogenerate: { directory: 'manuals' }
  },
  {
    label: 'How-To',
    autogenerate: { directory: 'how-to' }
  },
  {
    label: 'Reference',
    autogenerate: { directory: 'reference' }
  }
];

export const sidebarEs = [
  {
    label: 'Primeros pasos',
    autogenerate: { directory: 'getting-started' }
  },
  {
    label: 'Manuales',
    autogenerate: { directory: 'manuals' }
  },
  {
    label: 'Guías prácticas',
    autogenerate: { directory: 'how-to' }
  },
  {
    label: 'Referencia',
    autogenerate: { directory: 'reference' }
  }
];

export default {
  defaultLocale,
  locales: {
    en: { label: 'English', lang: 'en' },
    es: { label: 'Español', lang: 'es' }
  },
  title: siteLocaleMeta[defaultSiteLocale].title,
  description: siteLocaleMeta[defaultSiteLocale].description,
  logo: {
    src: './src/assets/logo.svg',
    alt: 'Ebal v2 logo'
  },
  customCss: ['./src/styles/global.css'],
  components: {
    Head: './src/components/LocalizedHead.astro',
    SiteTitle: './src/components/LocalizedSiteTitle.astro',
    LanguageSelect: './src/components/LanguageSwitcher.astro'
  },
  sidebar: sidebarEn
};

export const localeSidebars = {
  en: sidebarEn,
  es: sidebarEs
};
