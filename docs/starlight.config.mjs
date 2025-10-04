import { defaultSiteLocale, siteLocaleMeta } from './src/config/siteMeta.js';

const defaultLocale = defaultSiteLocale;

const sidebarEn = [
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

const sidebarEs = [
  {
    label: 'Primeros pasos',
    autogenerate: { directory: 'getting-started' }
  },
  {
    label: 'Manuales',
    autogenerate: { directory: 'manuales' }
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
    en: { label: 'English', lang: 'en', sidebar: sidebarEn },
    es: { label: 'Español', lang: 'es', sidebar: sidebarEs }
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
