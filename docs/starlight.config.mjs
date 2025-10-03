export default {
  title: 'Ebal v2 Docs',
  description: 'Worship team planning tool — manuals and guides',
  logo: {
    src: './src/assets/logo.svg',
    alt: 'Ebal v2 logo'
  },
  customCss: ['./src/styles/global.css'],
  sidebar: [
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
