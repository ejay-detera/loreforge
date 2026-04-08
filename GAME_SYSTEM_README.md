# LoreForge Game System Documentation

## Overview
LoreForge is an AI-powered interactive storytelling game built with Laravel + React (Inertia.js). This document explains the complete game system architecture and usage.

## System Components

### Backend Components

#### 1. Models
- **GameSession**: Manages individual game sessions with player stats and progress
- **Turn**: Individual story turns with choices and outcomes
- **TurnBatch**: Groups of generated turns for efficient API usage
- **InventoryItem**: Player inventory management
- **User**: Player authentication and management

#### 2. Services
- **GeminiService**: Handles AI story generation using Google's Gemini API
  - Daily request limiting (20 requests/day)
  - Batch generation of 3-5 story turns
  - Automatic JSON parsing and validation
  - Rate limiting and error handling

#### 3. Controllers
- **GameSessionController**: API endpoints for game operations
  - `start()`: Create new game session
  - `generateBatch()`: Generate new story turns
  - `resolveTurn()`: Process player choices

#### 4. API Routes
All game endpoints are under `/api/game/` with `auth:sanctum` middleware:
- `POST /api/game/start` - Start new game
- `POST /api/game/{sessionId}/generate-batch` - Generate story batch
- `POST /api/game/{sessionId}/resolve/{turnId}` - Resolve player choice

### Frontend Components

#### 1. React Hook: useGame.js
Central game state management hook that provides:
- **State Management**: HP, MP, inventory, turns, game status
- **Automatic Batch Generation**: Generates new batches when running low
- **Choice Resolution**: Processes player choices and updates state
- **Error Handling**: Comprehensive error management
- **Loading States**: UI feedback during API calls

#### 2. Game Page Component
Example implementation showing how to use the useGame hook

## Game Flow

### 1. Starting a Game
```javascript
const { startNewGame } = useGame();

// Start a new fantasy game
await startNewGame('fantasy', 'Aragorn', 25);
```

### 2. Playing Turns
```javascript
const { resolveChoice, currentTurnData } = useGame();

// When player makes a choice
await resolveChoice('Attack the dragon');
```

### 3. Automatic Batch Generation
The hook automatically generates new batches when:
- Remaining turns in buffer ≤ 1
- Game is not over
- Session exists

## Database Schema

### Game Sessions
```sql
- id, user_id, genre, character_name
- current_health, max_health, current_mana, max_mana
- turn_count, max_turns, status, outcome, is_public
```

### Turns
```sql
- id, session_id, batch_id, turn_number
- story_text, choices (JSON), outcomes (JSON)
- player_choice, health_change, mana_change
- enemy_hp_change, is_resolved
```

### Turn Batches
```sql
- id, session_id, batch_number, turns_generated
- player_choice_trigger
```

### Inventory Items
```sql
- id, session_id, item_name, description
- acquired_at, removed_at
```

## API Response Formats

### Start Game Response
```json
{
  "success": true,
  "session": { /* GameSession data */ },
  "message": "New adventure begun!"
}
```

### Generate Batch Response
```json
{
  "success": true,
  "batch": {
    "id": 123,
    "batch_number": 2,
    "turns": [ /* Turn objects */ ]
  },
  "remaining_requests": 15,
  "message": "New story turns generated!"
}
```

### Resolve Turn Response
```json
{
  "success": true,
  "session": { /* Updated session data */ },
  "inventory": [ /* Updated inventory */ ],
  "inventory_changes": ["Added: Health Potion"],
  "resolved_turn": { /* Resolved turn info */ },
  "message": "Turn resolved successfully"
}
```

## Configuration

### Environment Variables
```env
# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash-lite
```

### Services Configuration
```php
// config/services.php
'gemini' => [
    'api_key' => env('GEMINI_API_KEY'),
    'model' => env('GEMINI_MODEL', 'gemini-2.5-flash-lite'),
],
```

## Usage Examples

### Basic Game Implementation
```javascript
import useGame from '@/hooks/useGame';

function GameComponent() {
    const {
        currentTurnData,
        currentHP,
        currentMP,
        inventory,
        isGameOver,
        loading,
        resolveChoice,
        startNewGame
    } = useGame();

    if (isGameOver) {
        return <GameOverScreen />;
    }

    if (!currentTurnData) {
        return <StartGame onStart={startNewGame} />;
    }

    return (
        <div>
            <StoryText text={currentTurnData.story_text} />
            <Choices 
                choices={currentTurnData.choices}
                onChoice={resolveChoice}
                disabled={loading}
            />
            <Stats hp={currentHP} mp={currentMP} inventory={inventory} />
        </div>
    );
}
```

### Error Handling
```javascript
const { error, resetGame } = useGame();

if (error) {
    return (
        <div>
            <h3>Error: {error}</h3>
            <button onClick={resetGame}>Reset Game</button>
        </div>
    );
}
```

## Security Features

1. **Authentication**: All API endpoints protected with Sanctum tokens
2. **Rate Limiting**: Daily API limits prevent abuse
3. **Input Validation**: All user inputs validated and sanitized
4. **Session Ownership**: Users can only access their own game sessions
5. **CSRF Protection**: All state-changing requests protected

## Performance Optimizations

1. **Batch Generation**: Reduces API calls by generating multiple turns at once
2. **Local State Management**: Client-side turn buffering reduces server load
3. **Database Indexing**: Optimized queries for game data retrieval
4. **Caching**: Request counting and rate limiting use efficient caching

## Error Scenarios

### Daily Limit Reached
- API returns 429 status with appropriate message
- Frontend displays limit information to user

### Invalid Choice
- API validates choice exists in turn outcomes
- Returns 400 error with descriptive message

### Session Not Found
- Returns 404 for invalid session/turn IDs
- Frontend handles gracefully with user feedback

## Development Setup

1. Run migrations: `php artisan migrate`
2. Configure Gemini API key in `.env`
3. Add game routes to your navigation
4. Implement the Game component or create your own UI

## Future Enhancements

- Multiple save slots per user
- Shared campaigns and leaderboards
- Achievement system
- Story branching visualization
- Sound effects and music
- Character progression system
- Multiplayer scenarios
