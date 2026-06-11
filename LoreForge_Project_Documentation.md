# LoreForge — Project Documentation

## Project Title

**LoreForge** — AI-Powered Interactive Storytelling RPG

---

## 1. Introduction

### 1.1 Project Objective

LoreForge is an AI-powered interactive storytelling web application that merges modern web development with generative artificial intelligence to create immersive, turn-based role-playing game (RPG) experiences. The project aims to solve the challenge of delivering dynamic, non-linear narrative content at scale — a problem traditionally requiring large teams of writers and game designers — by leveraging the Google Gemini API to serve as an automated Dungeon Master that generates branching storylines, enemy encounters, and combat outcomes in real time.

### 1.2 Target Audience

LoreForge targets two primary audiences:

- **Players** who enjoy narrative-driven, choice-based games and want a web-accessible RPG experience without the overhead of installing native applications. These users value replayability, genre variety, and meaningful decision-making.
- **Developers and Educators** interested in a reference implementation of how AI-powered content generation can be integrated into a full-stack web application using a modern Laravel + React architecture.

### 1.3 Intended Benefits

- Provides unlimited replayability through AI-generated story content that differs with each playthrough.
- Supports three distinct genres — **Fantasy**, **Horror**, and **Sci-Fi** — each with unique tone, enemies, and visual theming.
- Offers a community hub where players can share completed campaigns, rate, comment on, and replay each other's adventures.
- Demonstrates practical integration of emerging AI technology (Gemini API) within a secure, production-grade web application.

---

## 2. Project Requirements

### 2.1 Functional Requirements

| ID    | Requirement                                                                                     |
|-------|-------------------------------------------------------------------------------------------------|
| FR-01 | Users can register with email/password, with CAPTCHA verification and input sanitization.       |
| FR-02 | Users must verify their email address via a 6-digit OTP sent to their registered email.         |
| FR-03 | Users can enable/disable TOTP-based Multi-Factor Authentication (Google Authenticator).         |
| FR-04 | Users can create new game sessions by selecting a genre (Fantasy, Horror, Sci-Fi) and naming a character. |
| FR-05 | The system generates story turns in batches of up to 5 via the Google Gemini API.               |
| FR-06 | Each turn presents 2–4 branching choices with pre-computed outcomes (HP, MP, enemy HP changes).  |
| FR-07 | Player choices are resolved server-side with stat clamping, keyword-based validation, and server-side guards against AI hallucination. |
| FR-08 | Game state (HP, MP, inventory, turn count, enemy HP) is persisted per session in the database.  |
| FR-09 | Players receive starter inventory items (2× Healing Potion, 2× Mana Potion) at game start.     |
| FR-10 | The game ends in **Victory** (reaching max turns) or **Defeat** (HP drops to 0).               |
| FR-11 | Completed campaigns can be shared to the Community hub with auto-generated story previews.      |
| FR-12 | Community members can browse, filter by genre, sort, rate (1–5 stars), and comment on shared campaigns. |
| FR-13 | Players can replay community campaigns as new game sessions.                                    |
| FR-14 | A dashboard displays user statistics (total games, victories, defeats, favorite genre) and recent sessions. |
| FR-15 | An achievement system awards badges based on gameplay milestones (e.g., First Blood, Victorious, Barely Survived). |
| FR-16 | An admin panel is available for users with the `is_admin` flag.                                 |

### 2.2 Non-Functional Requirements

| ID     | Requirement                                                                                     |
|--------|-------------------------------------------------------------------------------------------------|
| NFR-01 | API endpoints are secured with Laravel Sanctum, CSRF tokens, and session-based authentication.  |
| NFR-02 | The application enforces session timeout after 3 hours of inactivity via custom middleware.      |
| NFR-03 | Security headers (X-Content-Type-Options, Referrer-Policy, Permissions-Policy, HSTS) are applied on all responses. |
| NFR-04 | Rate limiting is enforced on community interactions (30 requests/minute for ratings and comments).|
| NFR-05 | The UI provides a responsive, dark-themed design optimized for mobile, tablet, and desktop.     |
| NFR-06 | Battle animations (slash, fireball, dodge, heal glow) provide visual feedback tied to action types. |
| NFR-07 | Batch story generation minimizes API calls (max 5 turns per call) for performance and cost control. |
| NFR-08 | Database performance is optimized with composite indexes on frequently queried columns.         |
| NFR-09 | Email notifications for campaign activity are rate-limited (5 per user per day) and processed via a queue worker. |

### 2.3 User Stories

- **As a player**, I want to start a new adventure in a chosen genre so I can explore different story styles.
- **As a player**, I want to make choices each turn so my game outcome depends on my decisions.
- **As a player**, I want my game progress saved so I can return later and continue.
- **As a player**, I want to see my HP, MP, and inventory updated in real time so I understand my character's state.
- **As a player**, I want to share my completed campaign so others can read and rate my story.
- **As a player**, I want to browse and replay community campaigns so I can experience other players' adventures.
- **As a player**, I want to earn achievements for gameplay milestones so I feel rewarded for my progress.
- **As a developer**, I want the game to limit AI calls and parse structured responses so the backend remains stable.

### 2.4 User Personas

| Persona          | Description                                                                                       |
|------------------|---------------------------------------------------------------------------------------------------|
| **The Casual RPG Fan** | A player who enjoys quick, browser-based gaming sessions. Values ease of access, genre variety, and visual appeal. Plays during breaks. |
| **The Competitive Storyteller** | Motivated by achievements, high scores, and community recognition. Shares campaigns and engages with ratings/comments. |
| **The Admin/Moderator** | A privileged user who monitors shared content, user activity, and manages the platform via the admin panel. |

---

## 3. Architectural Design

### 3.1 Application Architecture

LoreForge is a **web-based Single Page Application (SPA)** that uses a client-server architecture. The frontend runs in the browser as a React application, while the backend is a Laravel 11 API server. Communication between the two is facilitated by **Inertia.js**, which provides server-side routing with client-side rendering, eliminating the need for a separate REST API for page navigation while still exposing dedicated API routes for game logic.

### 3.2 Technology Stack

| Layer          | Technology                                                                                   |
|----------------|----------------------------------------------------------------------------------------------|
| **Backend**    | Laravel 11 (PHP 8.2+)                                                                       |
| **Frontend**   | React 18, Inertia.js v2, JSX                                                                |
| **Build Tool** | Vite 6                                                                                       |
| **Styling**    | TailwindCSS 3, `@tailwindcss/forms`, FontAwesome 7                                          |
| **Animation**  | Framer Motion 12                                                                             |
| **AI Engine**  | Google Gemini API (`gemini-2.5-flash-lite` model) via direct HTTP integration                |
| **Database**   | SQLite (default), configurable for MySQL/PostgreSQL                                          |
| **Auth**       | Laravel Sanctum (session-based), Breeze scaffolding                                          |
| **MFA**        | `pragmarx/google2fa-laravel` + `bacon/bacon-qr-code` (TOTP with QR code)                    |
| **CAPTCHA**    | `mews/captcha` (math-based CAPTCHA on registration)                                          |
| **Routing**    | `tightenco/ziggy` (Laravel named routes in JavaScript)                                       |
| **Queue**      | Laravel Queue (database driver) for email jobs                                               |
| **Dev Tools**  | PHPUnit 11, Laravel Pint, Laravel Pail, Mockery, Faker                                      |

### 3.3 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENT (Browser)                          │
│                                                                     │
│  ┌──────────┐  ┌─────────────┐  ┌──────────┐  ┌────────────────┐   │
│  │ React 18 │  │ Inertia.js  │  │  Framer   │  │  TailwindCSS   │   │
│  │  Pages   │◄─┤  Adapter    │  │  Motion   │  │  + FontAwesome │   │
│  └────┬─────┘  └──────┬──────┘  └──────────┘  └────────────────┘   │
│       │               │                                             │
│  ┌────▼─────┐  ┌──────▼──────┐                                     │
│  │ useGame  │  │   Axios /   │                                     │
│  │  Hook    │──┤   fetch()   │                                     │
│  └──────────┘  └──────┬──────┘                                     │
└───────────────────────┼─────────────────────────────────────────────┘
                        │ HTTP (CSRF + Sanctum Session)
┌───────────────────────┼─────────────────────────────────────────────┐
│                       ▼           SERVER (Laravel 11)               │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                     Middleware Stack                          │   │
│  │  auth:sanctum │ session.timeout │ mfa │ admin │ throttle     │   │
│  │  SecureTransportHeaders │ PreventBackHistory │ CSRF          │   │
│  └──────────────────────────┬───────────────────────────────────┘   │
│                              │                                      │
│  ┌───────────────┐  ┌───────▼───────┐  ┌───────────────────────┐   │
│  │  Web Routes   │  │ API Routes    │  │  Auth Routes          │   │
│  │  (Inertia)    │  │ /api/game/*   │  │  (Breeze + OTP + MFA) │   │
│  └───────┬───────┘  │ /api/community│  └───────────────────────┘   │
│          │          └───────┬───────┘                               │
│  ┌───────▼───────┐  ┌──────▼────────┐  ┌───────────────────────┐   │
│  │  Controllers  │  │ API           │  │  Services             │   │
│  │  Dashboard    │  │ Controllers   │  │  ┌─────────────────┐  │   │
│  │  Game         │  │ GameSession   │  │  │ GeminiService   │──┼───┼──► Google Gemini API
│  │  Profile      │  │ Community     │  │  │ AchievementSvc  │  │   │
│  │  Mfa          │  │ Character     │  │  └─────────────────┘  │   │
│  │  Admin        │  └──────┬────────┘  └───────────────────────┘   │
│  └───────────────┘         │                                       │
│                     ┌──────▼────────┐  ┌───────────────────────┐   │
│                     │    Models     │  │  Queue Worker         │   │
│                     │ User          │  │  SendCampaignActivity │   │
│                     │ GameSession   │  │  Email (Mailable)     │   │
│                     │ Turn/TurnBatch│  └───────────────────────┘   │
│                     │ InventoryItem │                               │
│                     │ SharedCampaign│                               │
│                     │ CampaignRating│                               │
│                     │ CampaignComment│                              │
│                     │ UserAchievement│                              │
│                     └──────┬────────┘                               │
│                            │                                       │
│                     ┌──────▼────────┐                               │
│                     │   Database    │                               │
│                     │   (SQLite)    │                               │
│                     └───────────────┘                               │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.4 Database Schema (Entity Relationships)

```
┌──────────┐       ┌──────────────┐       ┌─────────┐
│  users   │──1:N──│ game_sessions │──1:N──│  turns  │
└──────────┘       └──────────────┘       └─────────┘
     │                    │                     │
     │                    ├──1:N──┐             │
     │                    │       ▼             │
     │                    │  inventory_items    │
     │                    │                     │
     │                    ├──1:N──┐             │
     │                    │       ▼             │
     │                    │  turn_batches       │
     │                    │                     │
     │                    ├──1:1──┐             │
     │                    │       ▼             │
     │                    │  shared_campaigns   │
     │                    │       │             │
     │                    │       ├──1:N── campaign_ratings
     │                    │       └──1:N── campaign_comments
     │                    │
     └──1:N── user_achievements
```

**Key Tables:**

| Table                | Purpose                                                            |
|----------------------|--------------------------------------------------------------------|
| `users`              | Player accounts with email, hashed password, MFA secret, admin flag |
| `game_sessions`      | Active/completed games with genre, character, HP/MP stats, outcome  |
| `turns`              | Individual story turns with choices, outcomes (JSON), and resolution state |
| `turn_batches`       | Groups of turns generated per Gemini API call                      |
| `inventory_items`    | Player inventory with acquisition/removal turn tracking            |
| `shared_campaigns`   | Published campaigns linked to completed game sessions              |
| `campaign_ratings`   | User ratings (1–5) per shared campaign                             |
| `campaign_comments`  | User comments per shared campaign                                  |
| `user_achievements`  | Unlocked achievement badges per user per session                   |

---

## 4. Integration of Best Practices

### 4.1 SDLC Methodology

LoreForge follows an **iterative, feature-driven development** approach aligned with Agile principles. Based on the Git commit history, the project evolved through clearly defined feature sprints:

1. **Sprint 1 — Foundation**: Initial commit, landing page UI, login/signup scaffolding.
2. **Sprint 2 — Authentication & Security**: OTP email verification, MFA with Google Authenticator, CAPTCHA, back-button prevention, SQL injection protection.
3. **Sprint 3 — Core Gameplay**: Game session management, AI integration via Gemini API, sprite-based combat system, batch story generation.
4. **Sprint 4 — Community & Polish**: Community campaign sharing, rating/commenting, replay system, performance indexes, music, session heartbeat.
5. **Sprint 5 — Architecture Improvements**: Enemy HP tracking, achievements system, admin panel, shared campaign titles.

Each sprint delivers a working increment with both backend and frontend changes, reflecting a **Scrum-like cadence** with continuous integration.

### 4.2 Version Control

The project uses **Git** for version control with the following practices:

- **Conventional commit messages**: Commits follow the `feat:`, `chore:`, `fix:`, `docs:` prefix convention (e.g., `feat: implement community campaign browsing, rating, commenting, and replay functionality`).
- **Tracked dependency management**: Both `composer.json` / `composer.lock` and `package.json` / `package-lock.json` are version-controlled for reproducible builds.
- **`.gitignore`** excludes `vendor/`, `node_modules/`, `.env`, and compiled assets.
- **`.gitattributes`** ensures consistent line endings across development environments.

### 4.3 Clean Code Principles

The codebase adheres to several clean code principles:

- **Separation of Concerns (SoC)**: Business logic is isolated in service classes (`GeminiService`, `AchievementService`), HTTP handling in controllers, and data modeling in Eloquent models. Frontend state management is centralized in the `useGame.js` custom hook, separate from UI rendering in page components.
- **Single Responsibility Principle (SRP)**: Each controller handles a specific domain — `GameSessionController` for game flow, `CommunityController` for social features, `MfaController` for 2FA, `AchievementController` for badges.
- **DRY (Don't Repeat Yourself)**: Game constants (HP, MP, potion values, enemy tier ratios) are centralized in `GameConstants.php` and mirrored in `gameConstants.js` on the frontend.
- **Descriptive Naming**: Models, controllers, middleware, and hooks use intention-revealing names (e.g., `SessionTimeout`, `EnsureUserIsAdmin`, `PreventMfaBackNavigation`, `CheckActiveGameSession`).
- **Laravel Conventions**: The project follows standard Laravel 11 conventions for directory structure, route grouping, Eloquent relationships, form requests, and middleware registration.

### 4.4 Testing

The project employs multiple testing strategies:

| Strategy             | Tool / Framework | Description                                                      |
|----------------------|------------------|------------------------------------------------------------------|
| **Feature Tests**    | PHPUnit 11       | Tests for `GameSessionController` (auth, session creation, inventory, enemy HP resolution), `CommunityController` (XSS sanitization, rate limiting), `GeminiService` (enemy tier calculation), and authentication flows. |
| **Unit Tests**       | PHPUnit 11       | Basic unit test scaffolding in `tests/Unit/`.                    |
| **Lint / Formatting**| Laravel Pint     | PHP code style enforcement (`./vendor/bin/pint`).                |
| **Frontend Linting** | npm              | JavaScript/JSX linting via `npm run lint`.                       |
| **Manual Testing**   | Browser          | Interactive playtesting of game sessions, community features.    |

**Test execution:**
```bash
php artisan test              # Run all PHPUnit tests
./vendor/bin/pint             # Fix PHP code style
npm run lint                  # Lint frontend JavaScript
```

**Notable Test Cases:**
- `test_start_session_requires_auth()` — Verifies unauthenticated game start returns 401.
- `test_start_session_creates_session_and_inventory()` — Ensures session creation seeds exactly 4 starter items.
- `test_resolve_turn_handles_enemy_hp()` — Validates enemy HP is correctly decremented on attack.
- `test_add_comment_sanitizes_body()` — Confirms `<script>` tags are stripped from comments (XSS prevention).
- `test_rate_limiting_on_comments()` — Verifies the 31st comment request within a minute returns HTTP 429.

### 4.5 Security

LoreForge implements a multi-layered security approach:

| Security Layer                  | Implementation                                                                  |
|---------------------------------|---------------------------------------------------------------------------------|
| **Authentication**              | Laravel Sanctum session-based auth with CSRF token protection on all endpoints. |
| **Email Verification**          | Custom OTP system: 6-digit encrypted code sent via email, expires in 10 minutes.|
| **Multi-Factor Authentication** | TOTP (Google Authenticator) via `pragmarx/google2fa-laravel` with QR code setup.|
| **CAPTCHA**                     | Math-based CAPTCHA (`mews/captcha`) on registration to prevent bot accounts.    |
| **Input Sanitization**          | `strip_tags()` on user-submitted content (comments, usernames). Regex validation on usernames (`/^[a-zA-Z0-9_]+$/`). |
| **Session Security**            | 3-hour inactivity timeout (`SessionTimeout` middleware). Session invalidation on logout. MFA session flag management. |
| **Authorization**               | Session ownership checks — users can only access/modify their own game data. Admin routes guarded by `EnsureUserIsAdmin` middleware. |
| **Rate Limiting**               | Laravel throttle middleware (30 req/min on comments and ratings). Registration rate limiting (3 attempts per IP). |
| **HTTP Security Headers**       | `SecureTransportHeaders` middleware sets X-Content-Type-Options, Referrer-Policy, Permissions-Policy, and HSTS. |
| **Server-Side Validation**      | All game outcomes are validated server-side: offensive moves cannot heal, potion effects have minimum floors, keyword-based fallback corrects misclassified AI outputs. |
| **Password Hashing**            | Automatic bcrypt hashing via Eloquent `'password' => 'hashed'` cast.           |
| **Back-Button Prevention**      | `PreventBackHistory` and `PreventMfaBackNavigation` middleware prevent unauthorized access to cached authenticated pages. |

### 4.6 DevOps Practices

- **Composer automation scripts**: Post-install hooks handle `.env` creation, SQLite database provisioning, key generation, and migration.
- **Concurrent development workflow**: `composer dev` launches 4 parallel processes (Laravel server, queue worker, log tail via Pail, and Vite dev server) using `concurrently`.
- **Queue processing**: Background job processing via `php artisan queue:work` for email notifications, preventing blocking on HTTP requests.
- **Environment configuration**: All secrets (Gemini API key, database credentials, mail settings) are managed via `.env` with `.env.example` as a template.

---

## 5. Integration of Emerging Technologies

### 5.1 Emerging Technology Used

LoreForge integrates **Generative AI** through the **Google Gemini API** (`gemini-2.5-flash-lite` model) as its core content engine. The AI serves as an automated Dungeon Master, dynamically generating narrative content, combat encounters, branching choices, and stat-modifying outcomes for each game turn.

### 5.2 Integration Approach

The AI integration is handled through a dedicated service class — `GeminiService.php` (597 lines) — which encapsulates all Gemini interactions:

**1. Prompt Engineering (`buildGamePrompt`)**
- Constructs a comprehensive system prompt (~200 lines) that encodes the full game state: character name, genre, current HP/MP, inventory, turn progress, and the player's last choice.
- Enforces strict rules for enemy selection (genre-specific sprite-mapped enemies with weak → mid → boss progression), mana economics (magic costs MP, attacks don't), item usage (exact healing/mana values), and narrative pacing (story must conclude on the final turn).
- Specifies exact JSON output format with `action_type` and `action_result` fields that map to frontend visual effects.

**2. API Communication (`generateBatch`)**
- Sends HTTP POST requests to the Gemini REST API with configurable generation parameters (temperature: 0.9, topK: 40, topP: 0.95, maxOutputTokens: 16384).
- Uses a 120-second timeout to accommodate longer generation requests.
- Handles rate limiting (HTTP 429) and service unavailability (HTTP 503) with user-friendly error messages.

**3. Response Parsing (`parseGameBatch`)**
- Cleans AI output by stripping markdown code fences, JavaScript-style comments, double-brace wrappers, and trailing commas.
- Extracts JSON via regex and validates structure: each turn must have `turn_number`, `enemy_name`, `story_text`, `choices` (2–4), and `outcomes`.
- Applies defaults for missing `action_type`, `action_result`, `items_added`, and `items_removed` fields.

**4. Server-Side Guardrails (in `GameSessionController::resolveTurn`)**
- Offensive moves (`attack`/`magic`) are clamped to non-positive health and mana changes — the AI cannot accidentally make an attack heal the player.
- Keyword-based fallback detection reclassifies mislabeled actions (e.g., a choice named "Fireball" labeled as `utility` is corrected to `magic`).
- Potion effects have minimum floors (Healing Potion ≥ +25 HP, Mana Potion ≥ +20 MP).

### 5.3 Challenges and Benefits

| Aspect        | Details                                                                            |
|---------------|------------------------------------------------------------------------------------|
| **Benefits**  | Rich, dynamic story content unique to every playthrough. Genre-specific narratives with tone adaptation. Automated enemy progression (weak → mid → boss). Reduced need for hand-authored content. |
| **Challenges** | AI hallucination (inventing non-existent enemies, incorrect stat values). Inconsistent JSON formatting (code fences, trailing commas, double-braces). Action type misclassification (healing attacks). Variable response latency (addressed with batch generation and client-side buffering). |
| **Mitigations** | Strict JSON schema validation and sanitization. Server-side stat clamping and keyword-based correction. Batch generation (5 turns/call) to minimize API calls. Daily request counter (configurable limit). Error retry flow in the frontend `useGame` hook. |

---

## 6. User Interface and User Experience (UI/UX) Design

### 6.1 Design Process

The UI was designed with a **user-centered, genre-adaptive approach**. The application features a dark-themed aesthetic that shifts dynamically based on the selected genre:

- **Fantasy**: Gold/amber accents (#C9A84C), medieval shield iconography, epic tone.
- **Horror**: Red accents (#e05555), eye iconography, dark/tense atmosphere.
- **Sci-Fi**: Cyan/electric blue accents (#00BFFF), rocket iconography, futuristic feel.

Design principles applied:
- **Progressive disclosure**: The game interface reveals information contextually (e.g., inventory panel, enemy HP only when relevant).
- **Feedback-driven interactions**: Every player action triggers visual feedback — combat animations, HP/MP bar changes, inventory updates, and achievement toasts.
- **Consistency**: Reusable components (buttons, modals, cards) maintain visual consistency across all pages.

### 6.2 UI Elements and Pages

| Page / Component         | Description                                                                  |
|--------------------------|------------------------------------------------------------------------------|
| **Welcome (Landing)**    | Animated hero section with scroll-reveal features, genre showcase, and call-to-action. |
| **Login / Register**     | Styled authentication forms with CAPTCHA, animated transitions, and error handling. |
| **Dashboard**            | User statistics (total games, win rate, favorite genre), recent sessions, community spotlight, and achievements. |
| **New Game**             | Genre selection with visual genre containers, character naming, and turn count configuration. |
| **Game (Battle Screen)** | Core gameplay interface with enemy/player sprites, HP/MP bars, story narration (typewriter effect), choice buttons, inventory panel, and animated combat effects. |
| **History**              | Timeline of past game sessions with duration, score, and outcome. Expandable detail modals for turn-by-turn replay. |
| **Community**            | Paginated campaign browser with genre filters, sort options (recent, highest rated, most popular), star ratings, and comment threads. |
| **Achievements**         | Badge gallery showing unlocked and locked achievements with icons and descriptions. |
| **Profile**              | User profile editing with MFA setup/disable, password management, and account deletion. |
| **MFA Setup / Verify**   | QR code display for Google Authenticator enrollment and 6-digit OTP verification. |
| **Admin Panel**          | Administrative dashboard for platform management (admin-only). |

### 6.3 Key UI Components

| Component                | File                                  | Purpose                                          |
|--------------------------|---------------------------------------|--------------------------------------------------|
| `GenreContainer.jsx`     | Components/Game/                      | Genre-themed game wrapper with adaptive styling   |
| `CampaignDetailModal.jsx`| Components/Game/                      | Full campaign detail view with turn timeline      |
| `HistoryDetailsModal.jsx`| Components/Game/                      | Game session history detail overlay               |
| `SoundtrackPlayer.jsx`  | Components/Game/                      | In-game background music player                   |
| `TypewriterText.jsx`    | Components/Game/                      | Animated text reveal for story narration          |
| `ExitConfirmationModal.jsx` | Components/Game/                  | Confirm before leaving active game                |
| `HeroSection.jsx`       | Components/                           | Animated landing page hero banner                 |
| `GenreSection.jsx`       | Components/                          | Genre showcase section for the landing page       |
| `Feature.jsx`            | Components/                          | Feature highlights with scroll-reveal animation   |
| `ErrorBoundary.jsx`     | Components/                           | React error boundary for graceful error handling  |
| `SessionHeartbeat.jsx`  | Components/                           | Keeps session alive every 5 minutes to prevent timeout |
| `PageTransition.jsx`    | Components/                           | Framer Motion page transition wrapper             |

### 6.4 Accessibility

- **Responsive layout**: Adapts for mobile, tablet, and desktop breakpoints via TailwindCSS responsive utilities.
- **Dark mode readability**: Contrast-optimized text and UI elements against dark backgrounds.
- **Clear interaction states**: Buttons and interactive elements use distinct hover, focus, and disabled states with descriptive labels.
- **Session heartbeat**: Prevents unexpected logouts during active gameplay with a 5-minute ping interval.

---

## 7. Implementation and Testing

### 7.1 Development Overview

#### Backend Architecture

The backend follows a **Service-Controller-Model** pattern:

- **Models** (9 total): `User`, `GameSession`, `Turn`, `TurnBatch`, `InventoryItem`, `SharedCampaign`, `CampaignRating`, `CampaignComment`, `UserAchievement` — each with explicit `$fillable`, `$casts`, and Eloquent relationships.
- **Controllers** (12 total): Split between web controllers (Dashboard, Game, Profile, MFA, Admin, Achievement) and API controllers (GameSession, Community, Character).
- **Services** (2 total): `GeminiService` (AI integration, 597 lines) and `AchievementService` (badge evaluation, 95 lines).
- **Middleware** (8 custom): `SessionTimeout`, `RequireMfa`, `SecureTransportHeaders`, `EnsureUserIsAdmin`, `CheckActiveGameSession`, `PreventBackHistory`, `PreventMfaBackNavigation`, `HandleInertiaRequests`.
- **Jobs** (1): `SendCampaignActivityEmail` — queued job for email notifications with per-user daily rate limiting.
- **Mailables** (2): `CampaignActivityMail`, `OtpVerificationMail`.
- **Helpers** (1): `GameConstants` — centralized game balance constants.

#### Frontend Architecture

The frontend uses **React 18 with Inertia.js** for server-driven SPA routing:

- **Pages** (15 total): Welcome, Dashboard, NewGame, Game, History, Community, Characters, Achievements, Admin, Login, Register, ForgotPassword, ResetPassword, VerifyEmail, ConfirmPassword + MFA pages.
- **Components** (25+ total): Reusable UI elements including modals, buttons, forms, navigation links, error boundaries, and game-specific components.
- **Hooks** (2): `useGame.js` (303 lines — centralized game state management) and `UseScrollReveal.js` (scroll-triggered animations).
- **Layouts** (2): `AuthenticatedLayout.jsx` (full navigation chrome) and `GuestLayout.jsx` (minimal layout for auth pages).
- **Utils** (2): `gameConstants.js` (HP/MP defaults) and `genres.js` (genre labels/constants).

#### Key Implementation: Game Turn Resolution Flow

```
Player clicks choice button
        │
        ▼
useGame.resolveChoice(choiceKey)
        │
        ├── Guard: validates choice exists in outcomes
        │
        ▼
POST /api/game/{sessionId}/resolve/{turnId}
        │
        ▼
GameSessionController::resolveTurn()
        │
        ├── Validate choice exists in turn outcomes
        ├── Extract health_change, mana_change, enemy_hp_change
        ├── Server-side guards:
        │     ├── Offensive moves cannot heal (clamp to ≤ 0)
        │     ├── Keyword-based action_type correction
        │     └── Potion minimum floors (HP ≥ +25, MP ≥ +20)
        ├── Apply stat changes with min/max clamping
        ├── Track enemy HP (initialize if null based on tier)
        ├── Handle inventory add/remove
        ├── Check game over conditions (HP ≤ 0 or turns ≥ max)
        ├── Evaluate achievements via AchievementService
        │
        ▼
JSON response with updated session, inventory, achievements
        │
        ▼
useGame hook updates React state → UI re-renders
```

### 7.2 Challenges Addressed

| Challenge                           | Solution                                                                      |
|-------------------------------------|-------------------------------------------------------------------------------|
| AI response inconsistency           | Multi-layer JSON cleaning (strip markdown, comments, double-braces, trailing commas) + schema validation + defaults for missing fields. |
| AI-generated healing attacks        | Server-side clamping: `attack`/`magic` action types force `health_change ≤ 0` and `mana_change ≤ 0`. Keyword-based fallback reclassification. |
| API latency for story generation    | Batch generation (5 turns per call) with client-side buffering. Auto-fetch next batch when current batch is exhausted. |
| Session expiration during gameplay  | `SessionHeartbeat` component pings `/update-activity` every 5 minutes. CSRF 419 errors trigger automatic page reload. |
| Concurrent session conflicts        | Auto-abandon existing active sessions when starting a new game.              |
| XSS in user-generated content       | `strip_tags()` on all comment bodies before database storage.                |
| Email spam on campaign activity      | Queued job with per-user daily rate limiting (5 emails/day via `RateLimiter`). |

### 7.3 Testing Strategies

- **Backend Feature Tests** (5 test files): `GameSessionControllerTest`, `GeminiServiceTest`, `CommunityControllerTest`, `ProfileTest`, `ExampleTest` — covering auth guards, data integrity, input sanitization, rate limiting, and game mechanics.
- **Frontend State Validation**: The `useGame` hook includes explicit loading/error states, choice key validation against outcome maps, and retry logic for failed batch generation.
- **Integration Points**: CSRF token management, session cookie handling, and Inertia.js page prop passing are tested through the feature test HTTP client.

---

## 8. Deployment and Maintenance

### 8.1 Deployment Process

#### Prerequisites
- PHP 8.2+ with extensions: `pdo_sqlite`, `mbstring`, `openssl`, `curl`
- Composer 2.x
- Node.js 18+ and npm
- SQLite (or MySQL/PostgreSQL for production)

#### Installation Steps

```bash
# 1. Clone the repository
git clone <repository-url> loreforge
cd loreforge

# 2. Install PHP dependencies
composer install

# 3. Install frontend dependencies
npm install

# 4. Configure environment
cp .env.example .env
php artisan key:generate

# 5. Set required environment variables in .env
# GEMINI_API_KEY=your_gemini_api_key_here
# GEMINI_MODEL=gemini-2.5-flash-lite
# DB_CONNECTION=sqlite
# DB_DATABASE=database/database.sqlite
# MAIL_MAILER=smtp (configure SMTP settings)

# 6. Create database and run migrations
touch database/database.sqlite
php artisan migrate --seed

# 7. Start all services (recommended)
composer dev

# Or start services individually:
php artisan serve          # Backend server
npm run dev                # Vite dev server
php artisan queue:work     # Queue worker for emails
```

#### Production Build

```bash
npm run build              # Compile production assets
php artisan config:cache   # Cache configuration
php artisan route:cache    # Cache routes
php artisan view:cache     # Cache Blade views
```

### 8.2 Maintenance Strategy

| Activity                    | Frequency        | Command / Action                                  |
|-----------------------------|------------------|----------------------------------------------------|
| Dependency updates          | Monthly          | `composer update` + `npm update`                   |
| Security patches            | As released      | `composer audit` + `npm audit`                     |
| Code style enforcement      | Per commit       | `./vendor/bin/pint`                                |
| Frontend linting            | Per commit       | `npm run lint`                                     |
| Test suite execution        | Per commit       | `php artisan test`                                 |
| Database backups            | Daily            | SQLite file backup or `mysqldump` for MySQL        |
| Gemini API monitoring       | Weekly           | Check request counts via cache key, monitor quotas |
| Log review                  | Weekly           | `php artisan pail` or `storage/logs/laravel.log`   |
| Session cleanup             | Automated        | Laravel session garbage collection via config      |

---

## 9. Conclusion

### 9.1 Key Achievements

LoreForge successfully delivers a feature-complete, AI-powered interactive storytelling platform that demonstrates:

- **Full-Stack Proficiency**: A production-grade Laravel 11 + React 18 SPA with Inertia.js, featuring 9 Eloquent models, 12 controllers, 8 custom middleware classes, and 25+ React components.
- **AI Integration**: Practical implementation of Google Gemini API as a content generation engine with robust prompt engineering, response parsing, and server-side guardrails against AI hallucination.
- **Security-First Design**: Multi-layered authentication (email + OTP + MFA), CAPTCHA, input sanitization, rate limiting, CSRF protection, security headers, and session management.
- **Community Features**: A social layer enabling campaign sharing, star ratings, comments, and replay — complete with email notifications and rate limiting.
- **Clean Architecture**: Clear separation of concerns with services, controllers, models, and hooks, following Laravel and React best practices throughout.

### 9.2 Learning Outcomes

- Prompt engineering for structured JSON output from large language models requires extensive rule specification and server-side validation to handle inconsistent AI behavior.
- Batch generation patterns significantly reduce API costs and improve perceived latency in real-time AI-powered applications.
- Multi-factor authentication requires careful session management, especially around middleware ordering and navigation prevention.
- Community features demand robust moderation tools (input sanitization, rate limiting, admin controls) even at the MVP stage.

### 9.3 Areas for Improvement

- **Expanded Test Coverage**: Add unit tests for `GeminiService` prompt building, frontend component tests with React Testing Library, and end-to-end tests with Playwright.
- **Real-Time Features**: Implement WebSocket support for live community activity feeds and multiplayer storytelling.
- **Enhanced AI Context**: Feed previous turn outcomes back into the prompt for stronger narrative continuity across batches.
- **Accessibility Audit**: Conduct WCAG 2.1 compliance testing and add ARIA labels, keyboard navigation, and screen reader support.
- **CI/CD Pipeline**: Implement GitHub Actions for automated testing, linting, and deployment.

---

## 10. Appendix

### 10.1 Project File Structure

```
loreforge/
├── app/
│   ├── Helpers/
│   │   └── GameConstants.php              # Centralized game balance values
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/
│   │   │   │   ├── GameSessionController.php  # Game start, batch gen, turn resolution, share
│   │   │   │   ├── CommunityController.php    # Campaign list, detail, rate, comment, replay
│   │   │   │   └── CharacterController.php    # Character management
│   │   │   ├── Auth/
│   │   │   │   ├── AuthenticatedSessionController.php
│   │   │   │   ├── RegisteredUserController.php  # Registration with CAPTCHA
│   │   │   │   ├── OtpVerificationController.php # Email OTP verification
│   │   │   │   └── ... (6 more auth controllers)
│   │   │   ├── DashboardController.php    # User stats, recent sessions, spotlight
│   │   │   ├── GameController.php         # Game page rendering
│   │   │   ├── MfaController.php          # MFA setup, verify, enable, disable
│   │   │   ├── ProfileController.php      # Profile CRUD
│   │   │   ├── AchievementController.php  # Achievement page
│   │   │   └── AdminController.php        # Admin panel
│   │   ├── Middleware/
│   │   │   ├── SessionTimeout.php         # 3-hour inactivity timeout
│   │   │   ├── RequireMfa.php             # MFA gate for protected routes
│   │   │   ├── EnsureUserIsAdmin.php      # Admin authorization
│   │   │   ├── SecureTransportHeaders.php # Security response headers
│   │   │   ├── CheckActiveGameSession.php
│   │   │   ├── PreventBackHistory.php
│   │   │   ├── PreventMfaBackNavigation.php
│   │   │   └── HandleInertiaRequests.php
│   │   └── Requests/
│   │       └── ProfileUpdateRequest.php
│   ├── Jobs/
│   │   └── SendCampaignActivityEmail.php  # Queued email with rate limiting
│   ├── Mail/
│   │   ├── CampaignActivityMail.php       # Campaign rating/comment notification
│   │   └── OtpVerificationMail.php        # Email verification OTP
│   ├── Models/
│   │   ├── User.php                       # MustVerifyEmail, MFA fields, gameSessions relation
│   │   ├── GameSession.php                # Genre, stats, outcome, relations to turns/inventory
│   │   ├── Turn.php                       # Story text, choices (JSON), outcomes (JSON)
│   │   ├── TurnBatch.php                  # Batch metadata
│   │   ├── InventoryItem.php              # Item name, acquired_at, removed_at
│   │   ├── SharedCampaign.php             # Campaign sharing with ratings/comments relations
│   │   ├── CampaignRating.php             # 1–5 star rating
│   │   ├── CampaignComment.php            # User comment
│   │   └── UserAchievement.php            # Achievement badge record
│   ├── Providers/
│   └── Services/
│       ├── GeminiService.php              # AI integration (597 lines)
│       └── AchievementService.php         # Badge evaluation (95 lines)
├── database/
│   ├── migrations/                        # 20 migration files
│   ├── factories/
│   │   └── UserFactory.php
│   └── seeders/
│       └── DatabaseSeeder.php
├── resources/
│   ├── js/
│   │   ├── app.jsx                        # Inertia app bootstrap
│   │   ├── Pages/
│   │   │   ├── Welcome.jsx                # Landing page
│   │   │   ├── Dashboard.jsx              # User dashboard
│   │   │   ├── NewGame.jsx                # Game creation
│   │   │   ├── Game.jsx                   # Core game interface (55KB)
│   │   │   ├── History.jsx                # Game history
│   │   │   ├── Community.jsx              # Community hub
│   │   │   ├── Characters.jsx             # Character management
│   │   │   ├── Achievements.jsx           # Achievement gallery
│   │   │   ├── Admin.jsx                  # Admin panel
│   │   │   ├── Auth/ (6 pages)            # Login, Register, ForgotPassword, etc.
│   │   │   ├── Mfa/ (2 pages)             # Setup, Verify
│   │   │   └── Profile/ (Edit + Partials)
│   │   ├── Components/
│   │   │   ├── Game/ (6 components)       # GenreContainer, CampaignDetailModal, etc.
│   │   │   └── (18 general components)    # HeroSection, ErrorBoundary, SessionHeartbeat, etc.
│   │   ├── Layouts/
│   │   │   ├── AuthenticatedLayout.jsx    # Full app chrome
│   │   │   └── GuestLayout.jsx            # Minimal auth layout
│   │   ├── hooks/
│   │   │   ├── useGame.js                 # Game state management (303 lines)
│   │   │   └── UseScrollReveal.js         # Scroll animation hook
│   │   └── Utils/
│   │       ├── gameConstants.js           # HP/MP constants
│   │       └── genres.js                  # Genre labels
│   ├── css/
│   └── views/
│       ├── app.blade.php                  # Root Blade template
│       └── emails/                        # Email templates
├── routes/
│   ├── web.php                            # Inertia page routes (120 lines)
│   ├── api.php                            # API routes (57 lines)
│   ├── auth.php                           # Breeze auth routes
│   └── console.php                        # Artisan commands
├── tests/
│   ├── Feature/
│   │   ├── GameSessionControllerTest.php  # 3 tests
│   │   ├── GeminiServiceTest.php          # 1 test
│   │   ├── CommunityControllerTest.php    # 2 tests
│   │   ├── ProfileTest.php               # Profile tests
│   │   └── Auth/ (auth tests)
│   └── Unit/
│       └── ExampleTest.php
├── config/                                # 12 config files (incl. google2fa, captcha)
├── composer.json                          # PHP dependencies
├── package.json                           # JS dependencies
├── tailwind.config.js                     # TailwindCSS configuration
├── vite.config.js                         # Vite build configuration
├── phpunit.xml                            # PHPUnit configuration
├── GAME_SYSTEM_README.md                  # Game mechanics documentation
├── SETUP.md                               # Installation guide
└── README.md                              # Project overview
```

### 10.2 Complete API Reference

#### Game Endpoints (`/api/game`)

| Method   | Endpoint                                    | Description                                   | Auth Required |
|----------|---------------------------------------------|-----------------------------------------------|---------------|
| `GET`    | `/api/game/active-session`                  | Check if user has an active game session       | Yes           |
| `POST`   | `/api/game/start`                           | Start a new game session                       | Yes           |
| `POST`   | `/api/game/{sessionId}/generate-batch`      | Generate next batch of story turns             | Yes           |
| `POST`   | `/api/game/{sessionId}/resolve/{turnId}`    | Resolve player's choice for a turn             | Yes           |
| `GET`    | `/api/game/history/{sessionId}/details`     | Get full session details with turns            | Yes           |
| `POST`   | `/api/game/{sessionId}/share`               | Share a completed campaign to community        | Yes           |
| `DELETE` | `/api/game/{sessionId}/share`               | Unshare a campaign                             | Yes           |

#### Community Endpoints (`/api/community`)

| Method   | Endpoint                                    | Description                                   | Auth Required |
|----------|---------------------------------------------|-----------------------------------------------|---------------|
| `GET`    | `/api/community`                            | List shared campaigns (genre filter, sort, paginate) | Yes    |
| `GET`    | `/api/community/{campaignId}`               | Get full campaign details with turns           | Yes           |
| `POST`   | `/api/community/{campaignId}/replay`        | Replay a community campaign                    | Yes           |
| `POST`   | `/api/community/{campaignId}/rate`          | Rate a campaign (1–5 stars, upsert)            | Yes (throttled) |
| `GET`    | `/api/community/{campaignId}/comments`      | List comments (paginated)                      | Yes           |
| `POST`   | `/api/community/{campaignId}/comments`      | Add a comment                                  | Yes (throttled) |
| `DELETE` | `/api/community/{campaignId}/comments/{id}` | Delete own comment                             | Yes (throttled) |

### 10.3 Environment Variables

```env
# Application
APP_NAME=LoreForge
APP_ENV=local
APP_KEY=base64:...
APP_URL=http://localhost:8000

# Database
DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite

# AI Engine
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash-lite

# Mail (SMTP)
MAIL_MAILER=smtp
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USERNAME=your_email
MAIL_PASSWORD=your_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@loreforge.app
MAIL_FROM_NAME="LoreForge"

# Session
SESSION_TIMEOUT=10800  # 3 hours in seconds

# Queue
QUEUE_CONNECTION=database
```

### 10.4 Game Balance Constants

| Constant                | Value     | Purpose                                           |
|-------------------------|-----------|---------------------------------------------------|
| `STARTING_HP`           | 100       | Initial player health points                       |
| `STARTING_MP`           | 50        | Initial player mana points                         |
| `MAX_HP`                | 100       | Maximum health cap                                 |
| `MAX_MP`                | 50        | Maximum mana cap                                   |
| `POTION_HEAL_HP`        | +25       | Healing Potion restoration value                   |
| `POTION_RESTORE_MP`     | +20       | Mana Potion restoration value                      |
| `DEFAULT_MAX_TURNS`     | 20        | Default campaign length                            |
| `FLEE_HP_THRESHOLD`     | 10%       | HP ratio below which Flee becomes available        |
| `MP_MAGIC_THRESHOLD`    | 10        | Minimum MP to offer magic attack choices           |
| `WEAK_ARC_END_RATIO`    | 0.35      | Turns 0–35% of campaign = weak enemies             |
| `MID_ARC_END_RATIO`     | 0.70      | Turns 35–70% = mid-tier enemies                    |
| Boss phase              | 70–100%   | Final 30% of campaign = boss encounters            |

### 10.5 Achievement Definitions

| ID            | Name               | Criteria                                   | Icon              |
|---------------|--------------------|--------------------------------------------|-------------------|
| `first_blood` | First Blood        | Survive your first encounter (turn ≥ 1)    | `fa-tint`          |
| `veteran`     | Veteran Explorer   | Reach turn 10 in any adventure             | `fa-shield-alt`    |
| `master`      | Master Adventurer  | Reach turn 20 in any adventure             | `fa-crown`         |
| `victorious`  | Victorious         | Successfully complete an adventure         | `fa-trophy`        |
| `survivor`    | Barely Survived    | Finish a turn with HP > 0 and HP < 20      | `fa-heartbeat`     |

### 10.6 References

- [Laravel 11 Documentation](https://laravel.com/docs/11.x)
- [React 18 Documentation](https://react.dev/)
- [Inertia.js Documentation](https://inertiajs.com/)
- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Laravel Sanctum](https://laravel.com/docs/11.x/sanctum)
- [Google2FA Laravel Package](https://github.com/antonioribeiro/google2fa-laravel)
