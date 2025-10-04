# Documentation Site

## Publishing to GitHub Pages

- **Branch:** `main`
- **Workflow:** `.github/workflows/docs-pages.yml`
- **Base/Site configuration:** The deployment workflow inspects the repository name and exports `ASTRO_BASE` and `ASTRO_SITE` before building. Repositories named `<org>.github.io` deploy with `ASTRO_BASE=/` and `ASTRO_SITE=https://<org>.github.io`. All other repositories deploy with `ASTRO_BASE=/<repo>` and `ASTRO_SITE=https://<org>.github.io/<repo>`.
- **Custom domains:** Place your desired hostname in `docs/public/CNAME` so it is copied into the final `dist` output.

### Local preview

- `yarn dev` — runs the docs locally at `http://localhost:4321` without applying the production base path.
- `ASTRO_BASE=/myrepo ASTRO_SITE=https://<org>.github.io/myrepo yarn build && yarn preview` — emulates the production build locally with a custom base/site prior to serving the static output.
