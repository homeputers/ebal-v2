import { defaultSiteLocale, siteLocaleMeta } from './src/config/siteMeta.js';

const defaultLocale = defaultSiteLocale;

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
    SiteTitle: './src/components/LocalizedSiteTitle.astro'
  },
  sidebar: [
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
  ]
};
