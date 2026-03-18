import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';

export default function NewGame() {
    const [selectedGenre, setSelectedGenre] = useState('');
    const [gameName, setGameName] = useState('');
    const [selectedMode, setSelectedMode] = useState('');

    const genres = [
        {
            id: 'fantasy',
            name: 'Fantasy',
            icon: 'fas fa-hat-wizard',
            description: 'Epic quests through magical realms',
            color: 'text-highlight-warm-gold',
            bgColor: 'bg-highlight-warm-gold/20'
        },
        {
            id: 'horror',
            name: 'Horror',
            icon: 'fas fa-ghost',
            description: 'Face your deepest fears',
            color: 'text-red-400',
            bgColor: 'bg-red-400/20'
        },
        {
            id: 'scifi',
            name: 'Sci-Fi',
            icon: 'fas fa-rocket',
            description: 'Journey through the cosmos',
            color: 'text-blue-400',
            bgColor: 'bg-blue-400/20'
        }
    ];

    const gameModes = [
        {
            id: 'solo',
            name: 'Solo Adventure',
            icon: 'fas fa-user',
            description: 'Play by yourself'
        },
        {
            id: 'multiplayer',
            name: 'Multiplayer',
            icon: 'fas fa-users',
            description: 'Play with friends'
        },
        {
            id: 'campaign',
            name: 'Campaign Mode',
            icon: 'fas fa-book',
            description: 'Long-form story'
        }
    ];

    return (
        <AuthenticatedLayout>
            <Head title="New Game" />
            
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Game Name */}
                <div className="mb-8">
                    <label className="block text-sm font-medium text-text-primary-off-white mb-2">
                        Game Name
                    </label>
                    <input
                        type="text"
                        value={gameName}
                        onChange={(e) => setGameName(e.target.value)}
                        placeholder="Enter your adventure name..."
                        className="w-full px-4 py-3 bg-surface-dark-charcoal/50 border border-border-subtle-dark/50 rounded-lg text-text-primary-off-white placeholder-text-muted-cool-gray focus:outline-none focus:ring-2 focus:ring-accent-emerald-green focus:border-transparent transition-all duration-300"
                    />
                </div>

                {/* Genre Selection */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-text-primary-off-white mb-4">
                        Choose Your Genre
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {genres.map((genre) => (
                            <button
                                key={genre.id}
                                onClick={() => setSelectedGenre(genre.id)}
                                className={`p-6 rounded-lg border-2 transition-all duration-300 ${
                                    selectedGenre === genre.id
                                        ? 'border-accent-emerald-green bg-accent-emerald-green/10'
                                        : 'border-border-subtle-dark/50 bg-surface-dark-charcoal/30 hover:border-border-subtle-dark'
                                }`}
                            >
                                <div className={`w-12 h-12 ${genre.bgColor} rounded-full flex items-center justify-center mx-auto mb-3`}>
                                    <i className={`${genre.icon} text-xl ${genre.color}`}></i>
                                </div>
                                <h4 className="font-semibold text-text-primary-off-white mb-1">
                                    {genre.name}
                                </h4>
                                <p className="text-sm text-text-muted-cool-gray">
                                    {genre.description}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Game Mode */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-text-primary-off-white mb-4">
                        Game Mode
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {gameModes.map((mode) => (
                            <button
                                key={mode.id}
                                onClick={() => setSelectedMode(mode.id)}
                                className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                                    selectedMode === mode.id
                                        ? 'border-accent-emerald-green bg-accent-emerald-green/10'
                                        : 'border-border-subtle-dark/50 bg-surface-dark-charcoal/30 hover:border-border-subtle-dark'
                                }`}
                            >
                                <i className={`${mode.icon} text-accent-emerald-green text-lg mb-2`}></i>
                                <h4 className="font-semibold text-text-primary-off-white mb-1">
                                    {mode.name}
                                </h4>
                                <p className="text-sm text-text-muted-cool-gray">
                                    {mode.description}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Additional Settings */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-text-primary-off-white mb-4">
                        Additional Settings
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-text-primary-off-white mb-2">
                                Difficulty
                            </label>
                            <select className="w-full px-4 py-3 bg-surface-dark-charcoal/50 border border-border-subtle-dark/50 rounded-lg text-text-primary-off-white focus:outline-none focus:ring-2 focus:ring-accent-emerald-green focus:border-transparent">
                                <option>Easy</option>
                                <option>Normal</option>
                                <option>Hard</option>
                                <option>Legendary</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-primary-off-white mb-2">
                                Session Length
                            </label>
                            <select className="w-full px-4 py-3 bg-surface-dark-charcoal/50 border border-border-subtle-dark/50 rounded-lg text-text-primary-off-white focus:outline-none focus:ring-2 focus:ring-accent-emerald-green focus:border-transparent">
                                <option>Quick (30 min)</option>
                                <option>Standard (1-2 hours)</option>
                                <option>Extended (3+ hours)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Create Button */}
                <div className="flex justify-center">
                    <button 
                        className="px-8 py-3 bg-accent-emerald-green text-bg-deep-navy rounded-lg font-semibold hover:bg-accent-hover-lighter-green transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!gameName || !selectedGenre || !selectedMode}
                    >
                        <i className="fas fa-play mr-2"></i>
                        Start Adventure
                    </button>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
