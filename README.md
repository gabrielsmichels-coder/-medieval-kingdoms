# Medieval Kingdoms

An original, playable single-player medieval village strategy game. React + TypeScript, Vite, Tailwind CSS, Zustand, Lucide, Framer Motion, Express, and Prisma with SQLite.

## Publicar no Render

[Publicar Medieval Kingdoms no Render](https://render.com/deploy?repo=https://github.com/gabrielsmichels-coder/-medieval-kingdoms)

Entre na sua conta, autorize o acesso ao repositório e revise o Blueprint antes de confirmar. A configuração usa o plano gratuito do Render, sem disco persistente. O SQLite salva durante o uso, mas o progresso pode ser perdido quando o serviço reiniciar, for atualizado ou voltar após suspensão. O primeiro acesso após inatividade pode demorar enquanto o servidor inicia. Após concluir o deploy, abra o endereço HTTPS exibido pelo Render no computador ou celular. A versão publicada começa em velocidade normal (1×); para testar mais rápido, altere `GAME_SPEED` para `12` nas variáveis do serviço e reinicie-o. A publicação atual usa um único perfil de jogo compartilhado por quem acessar o endereço.

## Run locally

Requires Node.js 22 or newer and npm.

```sh
npm install
cp .env.example .env
npm run db:generate
npm run db:migrate
npm run dev
```

Open http://localhost:5173. The client proxies `/api` to Express on port 3001. Local development starts at **12× speed**. Set `GAME_SPEED=1` in `.env` and restart the server for normal time. Database: `prisma/kingdom.db`. Preserve this file to preserve your village.

```sh
npm run check
npm test
npm run build
npm start
```

The production server serves both the Vite build and API at http://localhost:3001 (or `$PORT`). Run migrations before starting it on a new database. Do not use the Vite preview server for production.

## Play

- Click buildings on the original SVG village map, or use the Buildings catalogue.
- Resource production is continuous and capped independently for each resource.
- Upgrade Headquarters to unlock Hiding Place at level 2 and Barracks / Rally Point at level 3.
- Expand Warehouse to store expensive upgrades; expand Farm to support buildings and troops.
- Construction has one active job and up to three paid jobs total. Repeated upgrades to the same building queue successive levels. Prerequisites require **completed** levels.
- Barracks and Stable have independent recruitment lanes with five batches each. Costs and population are reserved immediately. Troops arrive when the entire batch completes.
- Smithy research has its own lane. Research unlocks units and changes their displayed combat attributes.
- Use the Rally Point to save an army muster plan without removing troops from your garrison.
- Reports record completed jobs, full storage, and building unlocks. Settings changes the persistent village name.
- Progress continues offline and across server restarts. No reset or cheat button is exposed to players.

## Idioma / Language

A interface abre em português do Brasil por padrão. Para mudar, acesse **Configurações → Idioma da interface → English** (ou **Settings → Interface language → Português (Brasil)**). A escolha é salva neste navegador, independentemente da aldeia. Textos, nomes de edifícios e unidades, pesquisas, mensagens de erro e relatórios antigos são traduzidos na interface; os identificadores do jogo e os nomes personalizados da aldeia permanecem intactos. Números e datas usam o formato do idioma selecionado.

The interface defaults to Brazilian Portuguese and supports English in Settings. The catalog and dynamic report translations are in `src/i18n.ts`. Locale coverage is checked by `tests/i18n.test.ts`; browser checks verify switching, reload persistence, and Portuguese defaults on a fresh device.

## Configuration

`shared/config.ts` contains all building definitions, max levels, costs, growth factors, prerequisites, construction durations, unit costs / statistics / times, technologies / effects, production and storage tables, farm growth, defensive modifiers, population rules, and queue limits. `GAME_SPEED` scales production, construction, research, and recruitment. Client resource counters interpolate the authoritative snapshot; the server validates every purchase.

## Architecture and persistence

`shared/engine.ts` is the deterministic game simulation. `advance` produces resources up to each due event, completes that event once, then produces through the current timestamp. A Warehouse or production upgrade therefore changes the calculation at its actual completion time. Full-storage alerts fire only when crossing the cap.

`server/db.ts` runs reads and actions in Prisma transactions, serializes operations within the Node process, and uses a village version comparison to protect against stale writes. Durable ActionReceipt rows make retries idempotent even after the simulation’s recent request cache expires. All completed jobs are removed in the same transaction that applies their effects. Failed actions roll back all state changes. Progress is materialized on API requests, so no background timer is required for offline operation.

The database has Player and Village entities with an explicit owner relation, coordinates, version, durable action receipts, and a serialized, typed aggregate containing resources, last update, buildings, troop counts, research, queues, saved army plans, and reports. This favors atomic village mutations in the single-player MVP. Add authentication and ownership checks before exposing multiple players. Normalize jobs and movements into separate models when adding cross-village commands or analytics. The Render configuration runs one instance; SQLite is not intended for horizontal replicas.

The client polls every 2.5 seconds and interpolates resource counts / countdowns between snapshots. A successful action immediately replaces its snapshot. Local storage contains only report-read state; gameplay is stored in SQLite.

## Tests

`tests/engine.test.ts` covers resource rates, caps, prerequisites, cost formulas, queue ordering and limits, idempotency, construction, unlock notifications, research effects, recruitment costs, reserved population, independent lanes, and chronological offline progression. `tests/persistence.test.ts` creates a temporary SQLite database, applies real migrations, restarts Prisma clients, verifies transaction rollback, and exercises concurrent repository actions. Tests do not change your development village.

For end-to-end checks with Chromium installed:

```sh
# Linux default: /usr/bin/chromium; override CHROMIUM_PATH if needed.
npm run test:browser
```

The browser runner builds the app, starts a separate server on port 3002 with a temporary database, checks desktop and mobile navigation, map zoom / selection, an actual upgrade, and saved settings, then cleans up. Screenshots are written to `test-results/`. Your playable village is untouched.

## Render deployment

Use the included `render.yaml` blueprint for a free trial deployment. It provisions one free Node web service without a persistent disk, with SQLite at `prisma/kingdom.db` (`DATABASE_URL=file:./kingdom.db`). The build generates Prisma and compiles both apps; startup creates the database and applies migrations before serving traffic. Render may suspend free services when idle, causing a cold start on the next visit. The filesystem is ephemeral: saved progress may be lost after restarts, redeploys, or resumption. This mode is intended for testing. For durable hosted play, change the plan to Starter, add a persistent disk mounted at `/var/data`, and set `DATABASE_URL=file:/var/data/kingdom.db`. Set the desired realm speed in Render. Existing Blueprint setup forms must be reopened or refreshed to load the updated free configuration.

## Scope

All 13 requested buildings, six required troop types, five technologies, four timer lanes, offline economy, population, prerequisites, reports, notifications, and persistence are implemented. Wall, Hiding Place, and Church expose configurable defensive / protection / morale modifiers ready for combat integration. Rally Point shows the garrison and actual researched attributes, and saves validated muster plans with combined attack, carrying capacity, and movement speed. As specified for future expansion, PvP combat, outgoing attacks, reinforcement dispatch, travel, world maps, conquest, and alliances are not implemented. Mounted Archer is an optional unit and is not included. The local profile is shared by everyone using the same server; this MVP has no authentication.

Artwork is original inline SVG and CSS, with level variation for buildings. Fonts are optional Google Fonts with local serif / sans-serif fallbacks; the game requires no external artwork.
