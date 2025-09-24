## [0.3.0](https://github.com/homeputers/ebal-v2/compare/v0.2.0...v0.3.0) (2025-09-24)

### Features

* add stateless jwt authentication ([#92](https://github.com/homeputers/ebal-v2/issues/92)) ([7c61776](https://github.com/homeputers/ebal-v2/commit/7c617761092f75eb213715346589cf71ebcec0b4))
* add user auth persistence and seeding ([#91](https://github.com/homeputers/ebal-v2/issues/91)) ([1a88d02](https://github.com/homeputers/ebal-v2/commit/1a88d02c4e958fb8bb7309efb03d4ff0c0005867))
* **api:** implement admin user management ([#98](https://github.com/homeputers/ebal-v2/issues/98)) ([55c8c76](https://github.com/homeputers/ebal-v2/commit/55c8c760b7f76a9dd2d01eb602c5a62848baa001))
* **api:** implement self-service profile endpoints ([#102](https://github.com/homeputers/ebal-v2/issues/102)) ([46c0a8f](https://github.com/homeputers/ebal-v2/commit/46c0a8fde3210a56e9aa3dfa4d1c6909196edb61))
* extend OpenAPI for auth and user admin ([#90](https://github.com/homeputers/ebal-v2/issues/90)) ([97bbdc3](https://github.com/homeputers/ebal-v2/commit/97bbdc324e313bf6ed11e4621e3163627f56cedb))
* implement password reset flows ([#93](https://github.com/homeputers/ebal-v2/issues/93)) ([acafd86](https://github.com/homeputers/ebal-v2/commit/acafd86d5fa852ebba8bf9fe9944c5cdf3e6c175))
* **openapi:** add self-service profile endpoints ([#101](https://github.com/homeputers/ebal-v2/issues/101)) ([7153c70](https://github.com/homeputers/ebal-v2/commit/7153c7084d0af310b6294f2934f22292a1892018))
* strengthen auth guards and session handling ([#104](https://github.com/homeputers/ebal-v2/issues/104)) ([4b20727](https://github.com/homeputers/ebal-v2/commit/4b20727e6268c903513ee1f3f0c0762c14eb6988))
* **web:** add admin user management ui ([#97](https://github.com/homeputers/ebal-v2/issues/97)) ([1dfb27a](https://github.com/homeputers/ebal-v2/commit/1dfb27ad843edabd05de1ceaf6d8d18c65749ba3))
* **web:** add auth interceptors and hook ([#94](https://github.com/homeputers/ebal-v2/issues/94)) ([fa9504e](https://github.com/homeputers/ebal-v2/commit/fa9504ee62526613ef9dc0186450ec0b4009e4e7))
* **web:** add profile management area ([#103](https://github.com/homeputers/ebal-v2/issues/103)) ([ec077b3](https://github.com/homeputers/ebal-v2/commit/ec077b3074b8d742e398f526063a702ecf05288c))
* **web:** add protected routes and role guards ([#95](https://github.com/homeputers/ebal-v2/issues/95)) ([45ff004](https://github.com/homeputers/ebal-v2/commit/45ff00444e6a53f5bb3ed5d825803c7acb432fa5))
* **web:** implement auth auth flows ([#96](https://github.com/homeputers/ebal-v2/issues/96)) ([728d43f](https://github.com/homeputers/ebal-v2/commit/728d43f011f3b11ee22071f943593cc851a8d5e5))

### Bug Fixes

* **api:** localize user invite emails ([#99](https://github.com/homeputers/ebal-v2/issues/99)) ([e7cf7d9](https://github.com/homeputers/ebal-v2/commit/e7cf7d99dcbf0f94cab6d29de67082f051c38516))
* **web:** guard members routes for privileged roles ([#100](https://github.com/homeputers/ebal-v2/issues/100)) ([52201bf](https://github.com/homeputers/ebal-v2/commit/52201bfb17b1edd8ddd58ec965160465bde7b2d5))
* **web:** localize literal strings ([#107](https://github.com/homeputers/ebal-v2/issues/107)) ([308e8fb](https://github.com/homeputers/ebal-v2/commit/308e8fb2a2fd6ab57c1559831471460f361c7f19))
## [0.2.0](https://github.com/homeputers/ebal-v2/compare/v0.1.3...v0.2.0) (2025-09-20)

### Features

* localize service print view ([#88](https://github.com/homeputers/ebal-v2/issues/88)) ([a6f4fbd](https://github.com/homeputers/ebal-v2/commit/a6f4fbdc4be8166024f526cd27e8c90de13fc6f1))
* **web:** add Accept-Language axios interceptor ([#77](https://github.com/homeputers/ebal-v2/issues/77)) ([e954a5b](https://github.com/homeputers/ebal-v2/commit/e954a5b5387d579588c60787d683c5930ec73859))
* **web:** add i18n coverage for key ui flows ([#73](https://github.com/homeputers/ebal-v2/issues/73)) ([8fdcb71](https://github.com/homeputers/ebal-v2/commit/8fdcb7180520cd125d4aa33b96e981921d598754))
* **web:** add initial locale resources ([#70](https://github.com/homeputers/ebal-v2/issues/70)) ([cd4b793](https://github.com/homeputers/ebal-v2/commit/cd4b793e087a8bf55981f395931816a8b827c96b))
* **web:** add intl formatting utilities ([#79](https://github.com/homeputers/ebal-v2/issues/79)) ([29910a9](https://github.com/homeputers/ebal-v2/commit/29910a9d89bccdc2b30dd8f215273a1cd0556af6))
* **web:** add language aware routing ([#71](https://github.com/homeputers/ebal-v2/issues/71)) ([5597cab](https://github.com/homeputers/ebal-v2/commit/5597cab0f4d8e211efaa5585ecec4b2f5a64a441))
* **web:** add language switcher component ([#72](https://github.com/homeputers/ebal-v2/issues/72)) ([5faffbc](https://github.com/homeputers/ebal-v2/commit/5faffbc3881b383a9ae54a0b3e072278c407d5e3))
* **web:** add pluralized counts and formatted song updates ([#74](https://github.com/homeputers/ebal-v2/issues/74)) ([5b21187](https://github.com/homeputers/ebal-v2/commit/5b211873012f0785c82b23aaa9411fe4f92e89a3))
* **web:** include language in query keys ([#78](https://github.com/homeputers/ebal-v2/issues/78)) ([ad40176](https://github.com/homeputers/ebal-v2/commit/ad4017672a7b65aaaaac5b243c6341327d963f83))
* **web:** localize arrangement labels ([#80](https://github.com/homeputers/ebal-v2/issues/80)) ([fd313d2](https://github.com/homeputers/ebal-v2/commit/fd313d266b5849d06f97f817acfcf97e0246f178))
* **web:** localize song form fields ([#76](https://github.com/homeputers/ebal-v2/issues/76)) ([1c01bb6](https://github.com/homeputers/ebal-v2/commit/1c01bb63d2d2c15de073e3f2590ebdfb35089a83))
* **web:** localize zod validation errors ([#75](https://github.com/homeputers/ebal-v2/issues/75)) ([a0f6fe5](https://github.com/homeputers/ebal-v2/commit/a0f6fe51966bd0ac93a8aa523b71327d40c0f5da))
* **web:** log missing translations in dev ([#82](https://github.com/homeputers/ebal-v2/issues/82)) ([3a26149](https://github.com/homeputers/ebal-v2/commit/3a26149052ebbdd94170d72aba5ca8b978ff90eb))
* **web:** seed toolbar translations ([#87](https://github.com/homeputers/ebal-v2/issues/87)) ([aa64de1](https://github.com/homeputers/ebal-v2/commit/aa64de12f9f626bb9c722acaf0a3d2e4540202c3))

### Bug Fixes

* **web:** guard i18n resource namespaces ([#69](https://github.com/homeputers/ebal-v2/issues/69)) ([c0a1b3e](https://github.com/homeputers/ebal-v2/commit/c0a1b3ef05e1d8a74c40e11209340645f079123e))
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
