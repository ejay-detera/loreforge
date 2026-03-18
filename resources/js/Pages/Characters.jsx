import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Characters() {
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
                    <button className="px-4 py-2 bg-accent-emerald-green text-bg-deep-navy rounded-lg font-semibold hover:bg-accent-hover-lighter-green transition-colors duration-300">
                        <i className="fas fa-plus mr-2"></i>
                        New Character
                    </button>
                </div>
            }
        >
            <Head title="Characters" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Empty State */}
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
                    <button className="px-6 py-3 bg-accent-emerald-green text-bg-deep-navy rounded-lg font-semibold hover:bg-accent-hover-lighter-green transition-colors duration-300">
                        <i className="fas fa-plus mr-2"></i>
                        Create Character
                    </button>
                </div>

                {/* Sample Character Cards (for demonstration) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                    {[
                        {
                            name: "Aldric Stormblade",
                            class: "Warrior",
                            level: 12,
                            race: "Human",
                            genre: "Fantasy",
                            avatar: "🗡️"
                        },
                        {
                            name: "Dr. Sarah Chen",
                            class: "Scientist",
                            level: 8,
                            race: "Human",
                            genre: "Sci-Fi",
                            avatar: "🔬"
                        },
                        {
                            name: "Victor Blackwood",
                            class: "Investigator",
                            level: 5,
                            race: "Human",
                            genre: "Horror",
                            avatar: "🔍"
                        },
                        {
                            name: "Lyra Moonwhisper",
                            class: "Mage",
                            level: 15,
                            race: "Elf",
                            genre: "Fantasy",
                            avatar: "🧙‍♀️"
                        }
                    ].map((character, index) => (
                        <div key={index} className="bg-surface-dark-charcoal/50 backdrop-blur-sm rounded-lg border border-border-subtle-dark/50 p-6 hover:border-accent-emerald-green/50 transition-all duration-300">
                            <div className="text-center mb-4">
                                <div className="w-16 h-16 bg-accent-emerald-green/20 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">
                                    {character.avatar}
                                </div>
                                <h3 className="text-lg font-semibold text-text-primary-off-white mb-1">
                                    {character.name}
                                </h3>
                                <p className="text-sm text-accent-emerald-green font-medium">
                                    {character.class}
                                </p>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-text-muted-cool-gray">Level</span>
                                    <span className="text-text-primary-off-white font-medium">{character.level}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-text-muted-cool-gray">Race</span>
                                    <span className="text-text-primary-off-white">{character.race}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-text-muted-cool-gray">Genre</span>
                                    <span className="px-2 py-1 bg-surface-dark-charcoal rounded text-xs text-accent-emerald-green">
                                        {character.genre}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-border-subtle-dark/30">
                                <button className="w-full px-3 py-2 bg-surface-dark-charcoal hover:bg-surface-dark-charcoal/70 text-text-primary-off-white rounded text-sm transition-colors duration-300">
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
