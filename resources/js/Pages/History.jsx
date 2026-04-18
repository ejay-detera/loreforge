import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import HistoryDetailsModal from '@/Components/Game/HistoryDetailsModal';

export default function History({ games = [] }) {
    const [selectedGameId, setSelectedGameId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    const totalPages = Math.ceil(games.length / ITEMS_PER_PAGE);
    const paginatedGames = games.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const openDetails = (id) => {
        setSelectedGameId(id);
        setIsModalOpen(true);
    };

    const getGenreColor = (genre) => {
        switch (genre) {
            case 'Fantasy': return 'text-highlight-warm-gold bg-highlight-warm-gold/20';
            case 'Sci-Fi': return 'text-blue-400 bg-blue-400/20';
            case 'Horror': return 'text-red-400 bg-red-400/20';
            default: return 'text-text-muted-cool-gray bg-surface-dark-charcoal/50';
        }
    };

    const getResultColor = (result) => {
        return result === 'Victory' ? 'text-green-400 bg-green-400/20' : 'text-red-400 bg-red-400/20';
    };

    return (
        <AuthenticatedLayout>
            <Head title="History" />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-surface-dark-charcoal/50 backdrop-blur-sm rounded-lg border border-border-subtle-dark/50 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-text-muted-cool-gray text-sm">Total Games</span>
                            <i className="fas fa-gamepad text-accent-emerald-green"></i>
                        </div>
                        <div className="text-2xl font-bold text-text-primary-off-white">
                            {games.length}
                        </div>
                    </div>
                    <div className="bg-surface-dark-charcoal/50 backdrop-blur-sm rounded-lg border border-border-subtle-dark/50 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-text-muted-cool-gray text-sm">Win Rate</span>
                            <i className="fas fa-trophy text-highlight-warm-gold"></i>
                        </div>
                        <div className="text-2xl font-bold text-text-primary-off-white">
                            {games.length > 0 ? Math.round((games.filter(g => g.result === 'Victory').length / games.length) * 100) : 0}%
                        </div>
                    </div>
                    <div className="bg-surface-dark-charcoal/50 backdrop-blur-sm rounded-lg border border-border-subtle-dark/50 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-text-muted-cool-gray text-sm">Total Score</span>
                            <i className="fas fa-star text-blue-400"></i>
                        </div>
                        <div className="text-2xl font-bold text-text-primary-off-white">
                            {games.reduce((sum, game) => sum + game.score, 0).toLocaleString()}
                        </div>
                    </div>
                    <div className="bg-surface-dark-charcoal/50 backdrop-blur-sm rounded-lg border border-border-subtle-dark/50 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-text-muted-cool-gray text-sm">Achievements</span>
                            <i className="fas fa-medal text-purple-400"></i>
                        </div>
                        <div className="text-2xl font-bold text-text-primary-off-white">
                            {games.reduce((sum, game) => sum + game.achievements.length, 0)}
                        </div>
                    </div>
                </div>

                {/* Game History List */}
                <div className="space-y-4">
                    {paginatedGames.length === 0 ? (
                        <div className="text-center text-text-muted-cool-gray py-8">
                            You haven't played any games yet. Start a new adventure!
                        </div>
                    ) : paginatedGames.map((game) => (
                        <div
                            key={game.id}
                            onClick={() => openDetails(game.id)}
                            className="bg-surface-dark-charcoal/50 backdrop-blur-sm rounded-lg border border-border-subtle-dark/50 p-6 hover:border-accent-emerald-green/50 transition-all duration-300 cursor-pointer group"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-4 mb-3">
                                        <h3 className="text-lg font-semibold text-text-primary-off-white">
                                            {game.name}
                                        </h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getGenreColor(game.genre)}`}>
                                            {game.genre}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getResultColor(game.result)}`}>
                                            {game.result}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <span className="text-text-muted-cool-gray">Date</span>
                                            <div className="text-text-primary-off-white font-medium">{game.date}</div>
                                        </div>
                                        <div>
                                            <span className="text-text-muted-cool-gray">Duration</span>
                                            <div className="text-text-primary-off-white font-medium">{game.duration}</div>
                                        </div>
                                        <div>
                                            <span className="text-text-muted-cool-gray">Score</span>
                                            <div className="text-text-primary-off-white font-medium">{game.score.toLocaleString()}</div>
                                        </div>
                                        <div>
                                            <span className="text-text-muted-cool-gray">Achievements</span>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {game.achievements.map((achievement, index) => (
                                                    <span key={index} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                                                        {achievement}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button className="ml-4 p-2 text-text-muted-cool-gray group-hover:text-text-primary-off-white group-hover:translate-x-1 transition-all duration-300">
                                    <i className="fas fa-chevron-right"></i>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-8">
                        <div className="flex-1">
                            {currentPage > 1 && (
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    className="px-6 py-2 bg-surface-dark-charcoal/50 border border-border-subtle-dark/50 rounded-lg text-text-primary-off-white hover:border-accent-emerald-green/50 transition-all duration-300 flex items-center gap-2"
                                >
                                    <i className="fas fa-chevron-left text-xs"></i> Previous
                                </button>
                            )}
                        </div>
                        
                        <div className="text-text-muted-cool-gray text-sm font-medium">
                            Page {currentPage} of {totalPages}
                        </div>

                        <div className="flex-1 flex justify-end">
                            {currentPage < totalPages && (
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    className="px-6 py-2 bg-surface-dark-charcoal/50 border border-border-subtle-dark/50 rounded-lg text-text-primary-off-white hover:border-accent-emerald-green/50 transition-all duration-300 flex items-center gap-2"
                                >
                                    Next <i className="fas fa-chevron-right text-xs"></i>
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <HistoryDetailsModal
                sessionId={selectedGameId}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </AuthenticatedLayout>
    );
}
