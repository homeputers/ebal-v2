## [0.1.3](https://github.com/homeputers/ebal-v2/compare/v0.1.2...v0.1.3) (2025-09-18)

### Bug Fixes

* **api:** clear maven config in docker build ([#66](https://github.com/homeputers/ebal-v2/issues/66)) ([0343265](https://github.com/homeputers/ebal-v2/commit/03432650cdbd4de85343dda70d256c90912cf95f))
## [0.1.2](https://github.com/homeputers/ebal-v2/compare/v0.1.1...v0.1.2) (2025-09-18)

### Bug Fixes

* **web:** allow docker build without yarn dir ([#64](https://github.com/homeputers/ebal-v2/issues/64)) ([30c56b3](https://github.com/homeputers/ebal-v2/commit/30c56b39cee9fa120c66dc168386ab0f19fe1966))
## [0.1.1](https://github.com/homeputers/ebal-v2/compare/v0.1.0...v0.1.1) (2025-09-18)

### Bug Fixes

* **ci:** build docker images from repo root ([#62](https://github.com/homeputers/ebal-v2/issues/62)) ([885d616](https://github.com/homeputers/ebal-v2/commit/885d616a6074d12a176d24b8e408d67de3dafe91))
## [0.1.0](https://github.com/homeputers/ebal-v2/compare/865d1d4e266d7aa8061ef3e390883a4e9a0d734c...v0.1.0) (2025-09-18)

### Features

* add AGENTS.md file ([#11](https://github.com/homeputers/ebal-v2/issues/11)) ([23d18c8](https://github.com/homeputers/ebal-v2/commit/23d18c8d42e0b9126bde8afebef7da9571e68161))
* add basic CRUD API for core aggregates ([#8](https://github.com/homeputers/ebal-v2/issues/8)) ([9bd8b60](https://github.com/homeputers/ebal-v2/commit/9bd8b60e5400b2de5f380702bb9fa760fb5c6bfd))
* add conditional storage module scaffolding ([#51](https://github.com/homeputers/ebal-v2/issues/51)) ([c0c5e17](https://github.com/homeputers/ebal-v2/commit/c0c5e17146da42ccc24303d29462b540c2270055))
* add initial database schema migration ([#5](https://github.com/homeputers/ebal-v2/issues/5)) ([865d1d4](https://github.com/homeputers/ebal-v2/commit/865d1d4e266d7aa8061ef3e390883a4e9a0d734c))
* add OpenTelemetry tracing filter ([#54](https://github.com/homeputers/ebal-v2/issues/54)) ([11da9b8](https://github.com/homeputers/ebal-v2/commit/11da9b8379b97cebe348323694da9e9eb50f49cd))
* add search endpoint ([#33](https://github.com/homeputers/ebal-v2/issues/33)) ([a644ff9](https://github.com/homeputers/ebal-v2/commit/a644ff91f98583a72bd6e5100d68982d09d3ca61))
* **api:** add initial JPA domain models ([#7](https://github.com/homeputers/ebal-v2/issues/7)) ([a9fdd75](https://github.com/homeputers/ebal-v2/commit/a9fdd7508740d0bc26a6a6d29f38625c9232e65e))
* **api:** add service calendar ical feed ([#56](https://github.com/homeputers/ebal-v2/issues/56)) ([c7ee0e8](https://github.com/homeputers/ebal-v2/commit/c7ee0e85aae67c600e32df386860c44826c5af68))
* **api:** adopt OpenAPI-first approach ([#9](https://github.com/homeputers/ebal-v2/issues/9)) ([e1da5f7](https://github.com/homeputers/ebal-v2/commit/e1da5f74c671e9efa2215874cdf419c2cc674898))
* **api:** migrate groups and the rest of catalogs to MyBatis ([#32](https://github.com/homeputers/ebal-v2/issues/32)) ([60d2224](https://github.com/homeputers/ebal-v2/commit/60d2224db164d87e5e72ddbbf7ad1edbce8c38e4))
* **api:** migrate members to mybatis ([#31](https://github.com/homeputers/ebal-v2/issues/31)) ([07ad106](https://github.com/homeputers/ebal-v2/commit/07ad106c60096a468182747d88269c1c2aeb9a65))
* **api:** scaffold security config and /me endpoint ([#50](https://github.com/homeputers/ebal-v2/issues/50)) ([fc60067](https://github.com/homeputers/ebal-v2/commit/fc60067905ce3f20959bf0a771f6cfb4e07e9370))
* **web:** add arrangement label cache ([#47](https://github.com/homeputers/ebal-v2/issues/47)) ([f930ba2](https://github.com/homeputers/ebal-v2/commit/f930ba26a1d757265e62ac1e7887c137968c5068))
* **web:** add async song/arrangement pickers ([#40](https://github.com/homeputers/ebal-v2/issues/40)) ([9a0294b](https://github.com/homeputers/ebal-v2/commit/9a0294b61f3d98921c3e7092de08326c0baabccf))
* **web:** add chord transpose utility ([#45](https://github.com/homeputers/ebal-v2/issues/45)) ([f326a67](https://github.com/homeputers/ebal-v2/commit/f326a679a5eead502c96f5a828c467c37f5a4076))
* **web:** add chordpro preview ([#49](https://github.com/homeputers/ebal-v2/issues/49)) ([2f38084](https://github.com/homeputers/ebal-v2/commit/2f380847966d5515aab5fb0bf1940b4c95f70fb7))
* **web:** add CRUD API helpers ([#24](https://github.com/homeputers/ebal-v2/issues/24)) ([0d72796](https://github.com/homeputers/ebal-v2/commit/0d727960f75c9912554d12e452355f20c81ac8da))
* **web:** add member form component ([#36](https://github.com/homeputers/ebal-v2/issues/36)) ([e36a3db](https://github.com/homeputers/ebal-v2/commit/e36a3dbf2f76ed5e67e36b9dce5c95901f641aa5))
* **web:** add member hooks and page skeleton ([#23](https://github.com/homeputers/ebal-v2/issues/23)) ([2257cd6](https://github.com/homeputers/ebal-v2/commit/2257cd6592a8acfebe82c5c1d17abb14d1850db3))
* **web:** add OpenAPI type helpers ([#21](https://github.com/homeputers/ebal-v2/issues/21)) ([912766c](https://github.com/homeputers/ebal-v2/commit/912766c5ea7472181035d1c1542e613ece6b51c1))
* **web:** add query hooks and pages for core entities ([#25](https://github.com/homeputers/ebal-v2/issues/25)) ([ab166a6](https://github.com/homeputers/ebal-v2/commit/ab166a6a297b435e63007209c7791059ac1f67c8))
* **web:** add reusable arrangement label formatting ([#48](https://github.com/homeputers/ebal-v2/issues/48)) ([1422346](https://github.com/homeputers/ebal-v2/commit/1422346f06b63e3c0f296c72a8e3bb1d7468e774))
* **web:** add service plan pages ([#39](https://github.com/homeputers/ebal-v2/issues/39)) ([4ba031b](https://github.com/homeputers/ebal-v2/commit/4ba031bfecde013f78a8eae345378f7428a6743d))
* **web:** add shareable service plan view ([#55](https://github.com/homeputers/ebal-v2/issues/55)) ([e06d23a](https://github.com/homeputers/ebal-v2/commit/e06d23ac029dfcd8f0d5cda0b7b276775f88b26c))
* **web:** add song set detail management page ([#44](https://github.com/homeputers/ebal-v2/issues/44)) ([1a9f433](https://github.com/homeputers/ebal-v2/commit/1a9f4333b149d6dfa849badd394ca4225dfa90dd))
* **web:** add song set hooks ([#42](https://github.com/homeputers/ebal-v2/issues/42)) ([53c5cad](https://github.com/homeputers/ebal-v2/commit/53c5cad835e645fea4016d0f73358fbf3cafa269))
* **web:** add song sets list page ([#43](https://github.com/homeputers/ebal-v2/issues/43)) ([d306f9f](https://github.com/homeputers/ebal-v2/commit/d306f9fff2c5b6ccb6de8e36b189e22859be7f06))
* **web:** add songs and arrangements ui ([#38](https://github.com/homeputers/ebal-v2/issues/38)) ([d0fd85f](https://github.com/homeputers/ebal-v2/commit/d0fd85f0e8a7d017e57576e73e74ad4950a2bb82))
* **web:** add typed api client and scripts ([#16](https://github.com/homeputers/ebal-v2/issues/16)) ([407862d](https://github.com/homeputers/ebal-v2/commit/407862d0e9fff9a2e0b4364f4f83f187177fc0c1))
* **web:** add typed song set api helpers ([#41](https://github.com/homeputers/ebal-v2/issues/41)) ([958782f](https://github.com/homeputers/ebal-v2/commit/958782f96ac2ad1e08f19dd99c3e3286856fe65d))
* **web:** expand members API to full CRUD ([#22](https://github.com/homeputers/ebal-v2/issues/22)) ([009544d](https://github.com/homeputers/ebal-v2/commit/009544de6d58af1c8ea0fb78ba5d7baf291cb67f))
* **web:** implement group and membership management ([#26](https://github.com/homeputers/ebal-v2/issues/26)) ([b6c0979](https://github.com/homeputers/ebal-v2/commit/b6c0979b1780333b1266741f46fde67f51808fad))
* **web:** scaffold app shell with routing ([#15](https://github.com/homeputers/ebal-v2/issues/15)) ([0ce0721](https://github.com/homeputers/ebal-v2/commit/0ce07213afc9221833a6901735da3a5611a9dc74))
* **web:** show resultant keys on song set items ([#46](https://github.com/homeputers/ebal-v2/issues/46)) ([1eb9c36](https://github.com/homeputers/ebal-v2/commit/1eb9c36aafffe91f75ebdc7d4194483666b2b356))

### Bug Fixes

* **api:** prefix controllers with api base path ([#14](https://github.com/homeputers/ebal-v2/issues/14)) ([a5991fd](https://github.com/homeputers/ebal-v2/commit/a5991fdad54acc98f628ea91d3b09aa59b2a47a4))
* prevent prepare release workflow here-doc failure ([#59](https://github.com/homeputers/ebal-v2/issues/59)) ([b1817ab](https://github.com/homeputers/ebal-v2/commit/b1817ab3086bedc2eb00593a7772f6a56e3b0dc3))
* **web:** use relative API base URL and log errors in dev ([#19](https://github.com/homeputers/ebal-v2/issues/19)) ([b6ff244](https://github.com/homeputers/ebal-v2/commit/b6ff24404b151a67c534543a3f9f3da149401dcb))
* wiring of APIs with frontend ([#35](https://github.com/homeputers/ebal-v2/issues/35)) ([61c7328](https://github.com/homeputers/ebal-v2/commit/61c73286841ac7c9cf5c2da8173d4fb9ebededfd))
