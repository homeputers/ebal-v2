import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightConfig from './starlight.config.mjs';

const site = process.env.ASTRO_SITE || 'http://localhost:4321';
const base = process.env.ASTRO_BASE || '/';

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site,
  base,
  integrations: [starlight(starlightConfig)]
});
