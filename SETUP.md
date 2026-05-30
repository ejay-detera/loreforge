# LoreForge Setup Guide

Welcome to the **LoreForge** setup guide. This document provides step-by-step instructions to get LoreForge running locally on your machine.

---

## 🛠️ System Prerequisites

Ensure you have the following software installed on your development environment:

- **PHP**: `8.2` or higher (with extensions: `openssl`, `pdo`, `mbstring`, `tokenizer`, `xml`, `ctype`, `json`, `sqlite3` or `mysql`)
- **Composer**: Dependency manager for PHP
- **Node.js**: `18.x` or higher (with `npm` package manager)
- **Database**: SQLite (default, zero configuration needed) or MySQL / PostgreSQL
- **Mailer**: A mail sandbox (like [Mailtrap](https://mailtrap.io/)) for testing Two-Factor Authentication (MFA) emails.

---

## 🚀 Step-by-Step Installation

Follow these steps to set up LoreForge:

### Step 1: Clone the Repository
Clone the codebase to your local web server directory (e.g., Laragon `www/` directory or your preferred path):
```bash
git clone <repository-url> loreforge
cd loreforge
```

### Step 2: Install PHP Dependencies
Run Composer to install the backend frameworks and packages:
```bash
composer install
```

### Step 3: Install Frontend Dependencies
Run NPM to download and install client-side libraries (React, Vite, TailwindCSS, Framer Motion, etc.):
```bash
npm install
```

### Step 4: Environment Configuration
1. Duplicate the template environment file:
   ```bash
   cp .env.example .env
   ```
2. Generate the Laravel application encryption key:
   ```bash
   php artisan key:generate
   ```
3. Open the newly created `.env` file in your editor and configure the following sections:

#### Database Setup (Default is SQLite)
```env
DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite
```
> [!NOTE]
> On Windows, the database file needs to exist before running migrations. Run the following command in PowerShell to create it:
> `New-Item -ItemType File -Path database/database.sqlite -Force`
> Or on Unix/macOS:
> `touch database/database.sqlite`

#### Google Gemini API Configuration
To generate story arcs and campaign events, you need a Google Gemini API Key. Get one from [Google AI Studio](https://aistudio.google.com/).
```env
# Gemini AI Configuration
GEMINI_API_KEY=your_actual_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash-lite
```

#### Mail Configuration (For MFA / TOTP 2FA)
LoreForge includes a secure Multi-Factor Authentication (MFA) system. To receive security confirmation emails, configure a development mail client (e.g., Mailtrap):
```env
MAIL_MAILER=smtp
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_mailtrap_username
MAIL_PASSWORD=your_mailtrap_password
MAIL_FROM_ADDRESS=loreforge@example.com
MAIL_FROM_NAME="LoreForge"
```

---

### Step 5: Run Database Migrations & Seeds
Prepare the database tables and seed test accounts:
```bash
php artisan migrate --seed
```
> [!TIP]
> This command will automatically create the tables and add a default test user:
> - **Email**: `test@example.com`
> - **Password**: `password` (default Laravel password, or set a secure password upon registering)

---

### Step 6: Start the Development Servers

To run the application, you need both the PHP backend and the Vite asset server running simultaneously.

1. **Start the Laravel Server**:
   ```bash
   php artisan serve
   ```
   *This launches the backend application at `http://localhost:8000` (or `http://127.0.0.1:8000`).*

2. **Start the Vite Frontend Compiler**:
   In a separate terminal tab or window, run:
   ```bash
   npm run dev
   ```
   *This compiles the React pages and monitors assets for real-time changes.*

---

## 🧪 Verifying the Installation

To verify that the application has been set up successfully and is fully operational, run the following:

### Running Backend Unit & Feature Tests
```bash
php artisan test
```
*This validates game mechanics, session management, and Gemini service handlers.*

### Running Frontend Linters & Styles
```bash
npm run lint
```
*Checks your React and Javascript codebase for structural issues or styling errors.*

---

## 🔑 Key App Settings & Security Features

### Multi-Factor Authentication (MFA)
LoreForge has a built-in TOTP-based Multi-Factor Authentication.
- When logged in, visit the profile dashboard.
- Enable 2FA, scan the generated QR Code with an authenticator app (like Google Authenticator or Authy).
- Enter the code from your app to complete configuration.
- Subsequent logins will prompt you for the verification code.

### Rate Limiting & Gemini Limits
- The Gemini service has built-in safety mechanisms to prevent uncontrolled API calls.
- By default in development, the daily limits are set high (`999,999`) to prevent interruptions while coding. You can adjust this configuration inside [GeminiService.php](file:///c:/laragon/www/loreforge/app/Services/GeminiService.php) by restoring the `const DAILY_LIMIT = 20` threshold for production-like simulations.

---

## 🛠️ Troubleshooting

- **SQLite Database Locked or Missing**: Ensure that the database file path in `.env` is an absolute path or matches your current Laravel configuration, and that you have write permissions to the `database` folder.
- **Gemini API Error 401**: Ensure your `GEMINI_API_KEY` is pasted correctly without quotes or spaces in your `.env` file.
- **Vite Hot-Reload Issues**: If you do not see UI updates, ensure `npm run dev` is running and there are no active JavaScript errors in your browser's dev console.
