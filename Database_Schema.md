# Database Schema — LoreForge (MySQL)

> **Engine:** MySQL 8.x  
> **Connection:** `DB_CONNECTION=mysql`, `DB_DATABASE=loreforge-db`  
> **Charset:** utf8mb4 / utf8mb4_unicode_ci (Laravel default)

---

## users

| Column | MySQL Type | Nullable | Default | Notes |
|--------|-----------|----------|---------|-------|
| `id` | `bigint UNSIGNED` | NO | AUTO_INCREMENT | Primary Key |
| `username` | `varchar(255)` | NO | `''` | Unique; `[a-zA-Z0-9_]` only |
| `email` | `varchar(255)` | NO | — | Unique |
| `profile_url` | `varchar(255)` | YES | NULL | Avatar URL |
| `email_verified_at` | `timestamp` | YES | NULL | NULL = unverified |
| `password` | `varchar(255)` | NO | — | bcrypt-hashed |
| `is_admin` | `tinyint(1)` | NO | `0` | 1 = admin panel access |
| `remember_token` | `varchar(100)` | YES | NULL | "Remember me" token |
| `two_factor_secret` | `varchar(255)` | YES | NULL | Encrypted TOTP secret |
| `two_factor_enabled` | `tinyint(1)` | NO | `0` | 1 = MFA active |
| `created_at` | `timestamp` | YES | NULL | Auto-managed |
| `updated_at` | `timestamp` | YES | NULL | Auto-managed |

**Indexes:** `PRIMARY KEY (id)`, `UNIQUE (email)`, `UNIQUE (username)`

---

## game_sessions

| Column | MySQL Type | Nullable | Default | Notes |
|--------|-----------|----------|---------|-------|
| `id` | `bigint UNSIGNED` | NO | AUTO_INCREMENT | Primary Key |
| `user_id` | `bigint UNSIGNED` | NO | — | FK → `users.id` ON DELETE CASCADE |
| `genre` | `enum('fantasy','horror','scifi')` | NO | — | Game genre |
| `character_name` | `varchar(255)` | NO | — | Player's character name |
| `current_health` | `int` | NO | `100` | Current HP (0–`max_health`) |
| `max_health` | `int` | NO | `100` | Max HP capacity |
| `current_mana` | `int` | NO | `50` | Current MP (0–`max_mana`) |
| `max_mana` | `int` | NO | `50` | Max MP capacity |
| `turn_count` | `int` | NO | `0` | Completed turns so far |
| `max_turns` | `int` | NO | `20` | Turns until Victory |
| `enemy_current_hp` | `int` | YES | NULL | Enemy HP; NULL until first encounter |
| `status` | `enum('active','victory','defeated','abandoned')` | NO | `'active'` | Live session state |
| `outcome` | `enum('victory','defeat','abandoned')` | YES | NULL | Final result after game ends |
| `is_public` | `tinyint(1)` | NO | `0` | 1 = shared to Community |
| `created_at` | `timestamp` | YES | NULL | Auto-managed |
| `updated_at` | `timestamp` | YES | NULL | Auto-managed |

**Indexes:** `PRIMARY KEY (id)`, `INDEX (user_id)`, `INDEX (genre)`, `INDEX (status)`

---

## turns

| Column | MySQL Type | Nullable | Default | Notes |
|--------|-----------|----------|---------|-------|
| `id` | `bigint UNSIGNED` | NO | AUTO_INCREMENT | Primary Key |
| `session_id` | `bigint UNSIGNED` | NO | — | FK → `game_sessions.id` ON DELETE CASCADE |
| `batch_id` | `int` | NO | — | References `turn_batches.id` |
| `turn_number` | `int` | NO | — | Sequential number within the session |
| `enemy_name` | `varchar(255)` | YES | NULL | AI-generated genre-specific enemy name |
| `story_text` | `text` | NO | — | AI-generated narrative paragraph |
| `choices` | `json` | NO | — | Array of 2–4 choice objects: `{key, text, action_type}` |
| `outcomes` | `json` | NO | — | Map of choice keys → `{health_change, mana_change, enemy_hp_change, action_type, action_result, items_added, items_removed}` |
| `player_choice` | `varchar(255)` | YES | NULL | Chosen key (e.g. `"choice_a"`) |
| `health_change` | `int` | YES | NULL | Net HP delta after resolution |
| `mana_change` | `int` | YES | NULL | Net MP delta after resolution |
| `enemy_hp_change` | `int` | YES | NULL | HP delta applied to enemy |
| `is_resolved` | `tinyint(1)` | NO | `0` | 1 = player has chosen and turn is finalized |
| `created_at` | `timestamp` | YES | NULL | Auto-managed |
| `updated_at` | `timestamp` | YES | NULL | Auto-managed |

**Indexes:** `PRIMARY KEY (id)`, `INDEX (session_id)`, `COMPOSITE INDEX (session_id, turn_number)`

---

## turn_batches

| Column | MySQL Type | Nullable | Default | Notes |
|--------|-----------|----------|---------|-------|
| `id` | `bigint UNSIGNED` | NO | AUTO_INCREMENT | Primary Key |
| `session_id` | `bigint UNSIGNED` | NO | — | FK → `game_sessions.id` ON DELETE CASCADE |
| `batch_number` | `int` | NO | — | Sequential batch number (1 = first Gemini call) |
| `turns_generated` | `int` | NO | — | Turns produced in this batch (max 5) |
| `player_choice_trigger` | `varchar(255)` | YES | NULL | Choice that triggered this batch generation |
| `created_at` | `timestamp` | YES | NULL | Auto-managed |
| `updated_at` | `timestamp` | YES | NULL | Auto-managed |

**Indexes:** `PRIMARY KEY (id)`, `COMPOSITE INDEX (session_id, batch_number)`

---

## inventory_items

| Column | MySQL Type | Nullable | Default | Notes |
|--------|-----------|----------|---------|-------|
| `id` | `bigint UNSIGNED` | NO | AUTO_INCREMENT | Primary Key |
| `session_id` | `bigint UNSIGNED` | NO | — | FK → `game_sessions.id` ON DELETE CASCADE |
| `item_name` | `varchar(255)` | NO | — | e.g. `"Healing Potion"`, `"Mana Potion"` |
| `description` | `text` | YES | NULL | Effect description |
| `acquired_at` | `int` | NO | — | Turn number when item was added |
| `removed_at` | `int` | YES | NULL | Turn number when consumed; NULL = still held |
| `created_at` | `timestamp` | YES | NULL | Auto-managed |
| `updated_at` | `timestamp` | YES | NULL | Auto-managed |

**Indexes:** `PRIMARY KEY (id)`, `INDEX (session_id)`

> Each new session is seeded with: 2× Healing Potion (+25 HP), 2× Mana Potion (+20 MP)

---

## shared_campaigns

| Column | MySQL Type | Nullable | Default | Notes |
|--------|-----------|----------|---------|-------|
| `id` | `bigint UNSIGNED` | NO | AUTO_INCREMENT | Primary Key |
| `session_id` | `bigint UNSIGNED` | NO | — | FK → `game_sessions.id` ON DELETE CASCADE; UNIQUE |
| `title` | `varchar(255)` | YES | NULL | Auto-generated or user-defined campaign title |
| `shared_by` | `bigint UNSIGNED` | NO | — | FK → `users.id` ON DELETE CASCADE |
| `story_preview` | `text` | NO | — | Short story excerpt for community browser |
| `shared_at` | `timestamp` | NO | — | Publication timestamp |
| `created_at` | `timestamp` | YES | NULL | Auto-managed |
| `updated_at` | `timestamp` | YES | NULL | Auto-managed |

**Indexes:** `PRIMARY KEY (id)`, `UNIQUE (session_id)`, `INDEX (shared_by)`, `INDEX (shared_at)`

---

## campaign_ratings

| Column | MySQL Type | Nullable | Default | Notes |
|--------|-----------|----------|---------|-------|
| `id` | `bigint UNSIGNED` | NO | AUTO_INCREMENT | Primary Key |
| `campaign_id` | `bigint UNSIGNED` | NO | — | FK → `shared_campaigns.id` ON DELETE CASCADE |
| `user_id` | `bigint UNSIGNED` | NO | — | FK → `users.id` ON DELETE CASCADE |
| `rating` | `tinyint UNSIGNED` | NO | — | Star rating: 1–5 |
| `created_at` | `timestamp` | YES | NULL | Auto-managed |
| `updated_at` | `timestamp` | YES | NULL | Auto-managed |

**Indexes:** `PRIMARY KEY (id)`, `UNIQUE (campaign_id, user_id)` — one rating per user per campaign  
**Rate Limit:** 30 requests/minute (Laravel `throttle:30,1`)

---

## campaign_comments

| Column | MySQL Type | Nullable | Default | Notes |
|--------|-----------|----------|---------|-------|
| `id` | `bigint UNSIGNED` | NO | AUTO_INCREMENT | Primary Key |
| `campaign_id` | `bigint UNSIGNED` | NO | — | FK → `shared_campaigns.id` ON DELETE CASCADE |
| `user_id` | `bigint UNSIGNED` | NO | — | FK → `users.id` ON DELETE CASCADE |
| `body` | `text` | NO | — | Comment text; HTML stripped via `strip_tags()` before storage |
| `created_at` | `timestamp` | YES | NULL | Auto-managed |
| `updated_at` | `timestamp` | YES | NULL | Auto-managed |

**Indexes:** `PRIMARY KEY (id)`, `INDEX (campaign_id)`, `INDEX (user_id)`  
**Rate Limit:** 30 requests/minute (Laravel `throttle:30,1`)

---

## user_achievements

| Column | MySQL Type | Nullable | Default | Notes |
|--------|-----------|----------|---------|-------|
| `id` | `bigint UNSIGNED` | NO | AUTO_INCREMENT | Primary Key |
| `user_id` | `bigint UNSIGNED` | NO | — | FK → `users.id` ON DELETE CASCADE |
| `achievement_id` | `varchar(255)` | NO | — | Badge slug (e.g. `"first_blood"`, `"victorious"`, `"barely_survived"`) |
| `game_session_id` | `bigint UNSIGNED` | YES | NULL | FK → `game_sessions.id` SET NULL ON DELETE |
| `created_at` | `timestamp` | YES | NULL | Auto-managed |
| `updated_at` | `timestamp` | YES | NULL | Auto-managed |

**Indexes:** `PRIMARY KEY (id)`, `UNIQUE (user_id, achievement_id)`, `INDEX (game_session_id)`

---

## sessions

Laravel database session storage. Managed automatically by the framework.

| Column | MySQL Type | Nullable | Notes |
|--------|-----------|----------|-------|
| `id` | `varchar(255)` | NO | Primary Key — session token |
| `user_id` | `bigint UNSIGNED` | YES | Authenticated user; NULL for guests |
| `ip_address` | `varchar(45)` | YES | Supports IPv6 |
| `user_agent` | `text` | YES | Browser user-agent |
| `payload` | `longtext` | NO | Serialized session data |
| `last_activity` | `int` | NO | Unix timestamp; used by `SessionTimeout` middleware (3-hour limit) |

**Indexes:** `PRIMARY KEY (id)`, `INDEX (user_id)`, `INDEX (last_activity)`

---

## password_reset_tokens

| Column | MySQL Type | Nullable | Notes |
|--------|-----------|----------|-------|
| `email` | `varchar(255)` | NO | Primary Key |
| `token` | `varchar(255)` | NO | Hashed reset token |
| `created_at` | `timestamp` | YES | Token generation time |

---

## jobs

Laravel queue table for async email processing.

| Column | MySQL Type | Nullable | Notes |
|--------|-----------|----------|-------|
| `id` | `bigint UNSIGNED` | NO | Primary Key |
| `queue` | `varchar(255)` | NO | Queue name; indexed |
| `payload` | `longtext` | NO | Serialized job data |
| `attempts` | `tinyint UNSIGNED` | NO | Retry attempt count |
| `reserved_at` | `int UNSIGNED` | YES | Unix timestamp when job was reserved |
| `available_at` | `int UNSIGNED` | NO | Unix timestamp when job becomes available |
| `created_at` | `int UNSIGNED` | NO | Unix timestamp of job creation |

---

## job_batches

| Column | MySQL Type | Nullable | Notes |
|--------|-----------|----------|-------|
| `id` | `varchar(255)` | NO | Primary Key |
| `name` | `varchar(255)` | NO | Batch name |
| `total_jobs` | `int` | NO | — |
| `pending_jobs` | `int` | NO | — |
| `failed_jobs` | `int` | NO | — |
| `failed_job_ids` | `longtext` | NO | — |
| `options` | `mediumtext` | YES | — |
| `cancelled_at` | `int` | YES | — |
| `created_at` | `int` | NO | — |
| `finished_at` | `int` | YES | — |

---

## failed_jobs

| Column | MySQL Type | Nullable | Notes |
|--------|-----------|----------|-------|
| `id` | `bigint UNSIGNED` | NO | Primary Key |
| `uuid` | `varchar(255)` | NO | Unique |
| `connection` | `text` | NO | — |
| `queue` | `text` | NO | — |
| `payload` | `longtext` | NO | — |
| `exception` | `longtext` | NO | — |
| `failed_at` | `timestamp` | NO | Default: `CURRENT_TIMESTAMP` |

---

## cache

| Column | MySQL Type | Notes |
|--------|-----------|-------|
| `key` | `varchar(255)` | Primary Key |
| `value` | `mediumtext` | Serialized value |
| `expiration` | `int` | Unix TTL timestamp |

> Used for Gemini daily request counters and rate limiter state.

---

## cache_locks

| Column | MySQL Type | Notes |
|--------|-----------|-------|
| `key` | `varchar(255)` | Primary Key |
| `owner` | `varchar(255)` | Lock owner |
| `expiration` | `int` | Unix TTL timestamp |
