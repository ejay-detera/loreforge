<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

# LoreForge - AI-Powered Interactive Storytelling

LoreForge is an innovative web application that combines Laravel's robust backend with React's dynamic frontend to create an AI-powered interactive storytelling experience. Using Google's Gemini API, players can embark on personalized adventures across different genres, making choices that shape their unique narrative journey.

## Features

### 🎮 Core Game System
- **AI-Generated Stories**: Dynamic narrative generation using Google Gemini API
- **Multiple Genres**: Fantasy, Horror, Sci-Fi storytelling modes
- **Character Progression**: Health, Mana, and Inventory management
- **Choice-Based Gameplay**: Meaningful decisions that impact the story
- **Batch Generation**: Efficient API usage with turn buffering

### 🔐 Security & Authentication
- **Multi-Factor Authentication (MFA)**: TOTP-based 2FA support
- **Session Management**: Configurable timeouts and activity tracking
- **Rate Limiting**: Protection against brute force attacks
- **CSRF Protection**: Secure form submissions
- **Sanctum API Tokens**: Secure API authentication

### 🎨 User Experience
- **Responsive Design**: Mobile-first approach with TailwindCSS
- **Real-Time Updates**: Inertia.js for seamless page transitions
- **Modern UI**: Beautiful dark theme with constellation backgrounds
- **Progress Tracking**: Visual feedback for game progress

## Tech Stack

### Backend
- **Laravel 11**: PHP framework with elegant syntax
- **MySQL/SQLite**: Database with Eloquent ORM
- **Sanctum**: API authentication
- **Gemini API**: AI story generation
- **Redis**: Caching and session storage

### Frontend
- **React 18**: Modern JavaScript library
- **Inertia.js**: SPA-like experience without the complexity
- **TailwindCSS**: Utility-first CSS framework
- **Lucide Icons**: Beautiful icon library

## Quick Start

### Prerequisites
- PHP 8.2+
- Node.js 18+
- Composer
- Google Gemini API key

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd loreforge
```

2. **Install dependencies**
```bash
composer install
npm install
```

3. **Environment setup**
```bash
cp .env.example .env
php artisan key:generate
```

4. **Configure environment variables**
```env
# Database
DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash-lite

# Application
APP_NAME=LoreForge
APP_URL=http://localhost:8000
```

5. **Setup database**
```bash
touch database/database.sqlite
php artisan migrate
```

6. **Start the application**
```bash
php artisan serve
npm run dev
```

Visit `http://localhost:8000` to start your adventure!

## Game System Documentation

### Overview
LoreForge's game system consists of a sophisticated backend API and a reactive frontend hook that work together to provide seamless interactive storytelling.

### Key Components

#### Backend Models
- **GameSession**: Manages individual game sessions with player stats
- **Turn**: Individual story turns with choices and outcomes  
- **TurnBatch**: Groups of generated turns for efficiency
- **InventoryItem**: Player inventory management

#### API Endpoints
All game endpoints are protected with Sanctum authentication:

- `POST /api/game/start` - Create new game session
- `POST /api/game/{sessionId}/generate-batch` - Generate story turns
- `POST /api/game/{sessionId}/resolve/{turnId}` - Process player choice

#### Frontend Hook
The `useGame` hook provides complete game state management:
```javascript
import useGame from '@/hooks/useGame';

const {
    currentTurnData,
    currentHP, currentMP,
    inventory,
    isGameOver,
    resolveChoice,
    startNewGame
} = useGame();
```

### Game Flow
1. **Start Game**: Create session with genre and character
2. **Generate Batch**: AI creates 3-5 story turns at once
3. **Make Choices**: Player selects from available options
4. **Resolve Turn**: Apply outcomes, update stats, check win/loss
5. **Auto-Generate**: New batches created when buffer runs low

### Configuration
The Gemini service includes built-in rate limiting (20 requests/day) and comprehensive error handling to ensure reliable gameplay.

For detailed documentation, see [GAME_SYSTEM_README.md](GAME_SYSTEM_README.md).

## Security Features

### Authentication System
- **MFA Support**: Time-based One-Time Password (TOTP) authentication
- **Session Security**: Configurable timeouts with activity tracking
- **Rate Limiting**: Login attempts throttled to prevent brute force
- **Secure Headers**: CSRF protection and security headers

### API Security
- **Sanctum Tokens**: Secure API authentication
- **Request Validation**: Comprehensive input sanitization
- **Ownership Checks**: Users can only access their own data
- **Error Handling**: Secure error responses without information leakage

## Development

### Project Structure
```
├── app/
│   ├── Http/Controllers/
│   │   └── Api/
│   │       └── GameSessionController.php
│   ├── Models/
│   │   ├── GameSession.php
│   │   ├── Turn.php
│   │   ├── TurnBatch.php
│   │   └── InventoryItem.php
│   └── Services/
│       └── GeminiService.php
├── resources/
│   ├── js/
│   │   ├── hooks/
│   │   │   └── useGame.js
│   │   └── Pages/
│   │       └── Game.jsx
│   └── views/
└── routes/
    ├── api.php
    └── web.php
```

### Testing
```bash
# Run tests
php artisan test

# Run specific game tests
php artisan test --filter GameSystemTest
```

### Code Style
```bash
# PHP code style
./vendor/bin/pint

# JavaScript linting
npm run lint
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

---

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework.

You may also try the [Laravel Bootcamp](https://bootcamp.laravel.com), where you will be guided through building a modern Laravel application from scratch.

If you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

## Laravel Sponsors

We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the [Laravel Partners program](https://partners.laravel.com).

### Premium Partners

- **[Vehikl](https://vehikl.com/)**
- **[Tighten Co.](https://tighten.co)**
- **[WebReinvent](https://webreinvent.com/)**
- **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
- **[64 Robots](https://64robots.com)**
- **[Curotec](https://www.curotec.com/services/technologies/laravel/)**
- **[Cyber-Duck](https://cyber-duck.co.uk)**
- **[DevSquad](https://devsquad.com/hire-laravel-developers)**
- **[Jump24](https://jump24.co.uk)**
- **[Redberry](https://redberry.international/laravel/)**
- **[Active Logic](https://activelogic.com)**
- **[byte5](https://byte5.de)**
- **[OP.GG](https://op.gg)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
