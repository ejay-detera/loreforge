# 🌌 LoreForge — AI-Powered Interactive Storytelling

LoreForge is a premium, AI-driven interactive storytelling web application. Combining **Laravel 11** on the backend and **React + Inertia.js** on the frontend, it delivers dynamic, immersive role-playing campaigns. Powered by Google's **Gemini API**, LoreForge acts as a virtual Dungeon Master, guiding players through choice-driven narrative arcs across multiple genres.

---

## 🎮 Core Features

- **Dynamic Story Generation**: Google Gemini API generates unique, rich story arcs based on player stats, genre selection, and inventory.
- **Multiple Genres**: Embark on adventures in **Fantasy** (epic, sword-and-shield), **Horror** (dark, eldritch survival), or **Sci-Fi** (futuristic, mech-combat).
- **Interactive Choice System**: Every turn presents the player with meaningful choices, each leading to distinct outcomes, stat modifications, or inventory changes.
- **Turn Buffering (Batch Generation)**: Features client-side state caching and batch generation of story turns to optimize Gemini API consumption.
- **Robust Security & MFA**: Built-in Multi-Factor Authentication (TOTP 2FA), configurable session management, CSRF protection, and token-based authentication.
- **Stunning dark theme**: A modern dark user interface with smooth animations (using Framer Motion) and visual effects matched to gameplay actions.

---

## 🛠️ Technology Stack

- **Backend**: Laravel 11, PHP 8.2+
- **Frontend**: React 18, Inertia.js (SPA experience with Laravel routing)
- **Styling & Icons**: TailwindCSS, FontAwesome, Framer Motion
- **AI Core**: Google Gemini API (via Laravel Http Client integration)
- **Database**: SQLite (default / development), MySQL or PostgreSQL (production)

---

## 🚀 Getting Started & Setup

Ready to start your adventure? LoreForge requires setting up dependencies and configuring environment variables (such as database paths and the Gemini API key).

For detailed step-by-step setup, configuration, and troubleshooting instructions, please refer to the:
👉 **[Setup Guide (SETUP.md)](SETUP.md)**

---

## 📚 Game Architecture & System Design

LoreForge’s core gameplay revolves around a specialized game loop managed via a custom React hook and a backend API.

### Key Directory Layout
```
├── app/
│   ├── Http/Controllers/Api/
│   │   └── GameSessionController.php   # Handles game state, turn processing, and batching
│   ├── Models/
│   │   ├── GameSession.php              # Manages overall player stats and game metadata
│   │   ├── Turn.php                     # An individual turn's narrative and choices
│   │   └── InventoryItem.php            # Acquired/equipped player items
│   └── Services/
│       └── GeminiService.php            # DM logic, prompt compiler, and API wrapper
├── resources/js/
│   ├── hooks/
│   │   └── useGame.js                   # Client-side state manager and buffer resolver
│   └── Pages/
│       └── Game.jsx                     # Core gameplay component and dashboard
```

### Game Loop Mechanics
1. **Initiation**: The player starts a game by choosing a genre and character name.
2. **Batching**: The game requests a batch of turns (typically 3–5) from the backend. The backend constructs a prompt containing the player's status and history, sends it to Gemini, and parses the structured JSON response into database models.
3. **Turn Execution**: The client runs through the pre-generated turns. When choices are selected, stats are modified instantly on the client and sent to the server to verify and resolve outcomes.
4. **Buffering**: When the turn buffer gets low, the client automatically triggers a background batch request to fetch future turns, preventing lag.

For a comprehensive review of the game system, endpoints, and JSON schemas, refer to the **[Game System Documentation (GAME_SYSTEM_README.md)](GAME_SYSTEM_README.md)**.

---

## 🧪 Development & Verification

### Running Unit & Feature Tests
Verify the installation and check system status:
```bash
php artisan test
```

### Code Quality & Linters
Format PHP files and lint Javascript resources:
```bash
# Lint PHP files
./vendor/bin/pint

# Lint JS files
npm run lint
```

---

## 📄 License

LoreForge is open-source software licensed under the [MIT license](https://opensource.org/licenses/MIT).
