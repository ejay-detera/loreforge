import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState, useEffect } from 'react';
import { getGenreLabel } from '@/Utils/genres';

export default function Characters() {
    const [characters, setCharacters] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/characters')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setCharacters(data.characters);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load characters", err);
                setLoading(false);
            });
    }, []);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-text-primary-off-white">
                            Characters
                        </h2>
                        <p className="mt-1 text-sm text-text-muted-cool-gray">
                            Manage your character roster
                        </p>
                    </div>
                    <Link href={route('new-game')} className="px-4 py-2 bg-accent-emerald-green text-bg-deep-navy rounded-lg font-semibold hover:bg-accent-hover-lighter-green transition-colors duration-300">
                        <i className="fas fa-plus mr-2"></i>
                        New Character
                    </Link>
                </div>
            }
        >
            <Head title="Characters" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="text-center py-16">
                        <p className="text-text-muted-cool-gray">Loading your heroes...</p>
                    </div>
                ) : characters.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="mx-auto w-24 h-24 bg-surface-dark-charcoal rounded-full flex items-center justify-center mb-6">
                            <i className="fas fa-users text-3xl text-accent-emerald-green"></i>
                        </div>
                        <h3 className="text-xl font-semibold text-text-primary-off-white mb-2">
                            No characters yet
                        </h3>
                        <p className="text-text-muted-cool-gray mb-8 max-w-md mx-auto">
                            Create your first character and prepare for epic adventures across different realms.
                        </p>
                        <Link href={route('new-game')} className="px-6 py-3 bg-accent-emerald-green text-bg-deep-navy rounded-lg font-semibold hover:bg-accent-hover-lighter-green transition-colors duration-300">
                            <i className="fas fa-plus mr-2"></i>
                            Create Character
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                        {characters.map((character) => (
                            <div key={character.id} className="bg-surface-dark-charcoal/50 backdrop-blur-sm rounded-lg border border-border-subtle-dark/50 p-6 hover:border-accent-emerald-green/50 transition-all duration-300">
                                <div className="text-center mb-4">
                                    <div className="w-16 h-16 bg-accent-emerald-green/20 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">
                                        <i className="fas fa-user text-accent-emerald-green" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-text-primary-off-white mb-1">
                                        {character.name}
                                    </h3>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-text-muted-cool-gray">Adventures</span>
                                        <span className="text-text-primary-off-white font-medium">{character.gamesPlayed}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-text-muted-cool-gray">Victories</span>
                                        <span className="text-text-primary-off-white">{character.victories}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-text-muted-cool-gray">Total Turns</span>
                                        <span className="text-text-primary-off-white">{character.totalTurns}</span>
                                    </div>
                                    <div className="flex justify-between mt-2">
                                        <span className="text-text-muted-cool-gray">Genre</span>
                                        <span className="px-2 py-1 bg-surface-dark-charcoal rounded text-xs text-accent-emerald-green">
                                            {getGenreLabel(character.genre)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
