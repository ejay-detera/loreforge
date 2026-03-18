import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';

export default function Community() {
    const [activeTab, setActiveTab] = useState('leaderboard');

    const leaderboard = [
        { rank: 1, name: "DragonSlayer99", score: 15420, games: 342, winRate: 78, avatar: "🐉" },
        { rank: 2, name: "SpaceExplorer", score: 14850, games: 298, winRate: 82, avatar: "🚀" },
        { rank: 3, name: "ShadowHunter", score: 13980, games: 412, winRate: 71, avatar: "🗡️" },
        { rank: 4, name: "MysticMage", score: 12500, games: 256, winRate: 85, avatar: "🧙‍♂️" },
        { rank: 5, name: "CyberNinja", score: 11800, games: 189, winRate: 79, avatar: "🥷" },
    ];

    const recentActivity = [
        {
            user: "DragonSlayer99",
            action: "completed",
            details: "The Dragon's Lair on Legendary difficulty",
            time: "5 minutes ago",
            avatar: "🐉"
        },
        {
            user: "SpaceExplorer",
            action: "achieved",
            details: "Master Strategist badge",
            time: "12 minutes ago",
            avatar: "🚀"
        },
        {
            user: "ShadowHunter",
            action: "started",
            details: "new Horror campaign",
            time: "25 minutes ago",
            avatar: "🗡️"
        },
        {
            user: "MysticMage",
            action: "joined",
            details: "multiplayer session",
            time: "1 hour ago",
            avatar: "🧙‍♂️"
        },
        {
            user: "CyberNinja",
            action: "shared",
            details: "custom campaign 'Neon Dreams'",
            time: "2 hours ago",
            avatar: "🥷"
        }
    ];

    const forums = [
        {
            title: "Best strategies for Dragon bosses?",
            author: "NewPlayer123",
            replies: 24,
            views: 156,
            lastActivity: "2 hours ago",
            category: "Strategy"
        },
        {
            title: "Horror mode is too difficult",
            author: "ScaredGamer",
            replies: 18,
            views: 89,
            lastActivity: "4 hours ago",
            category: "Discussion"
        },
        {
            title: "Custom campaign showcase",
            author: "CreativeMind",
            replies: 42,
            views: 312,
            lastActivity: "6 hours ago",
            category: "Showcase"
        },
        {
            title: "Looking for multiplayer partners",
            author: "TeamPlayer",
            replies: 8,
            views: 45,
            lastActivity: "8 hours ago",
            category: "LFG"
        }
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Community" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tab Navigation */}
                <div className="flex space-x-1 mb-8 border-b border-border-subtle-dark/50">
                    {['leaderboard', 'activity', 'forums'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 font-medium text-sm capitalize transition-all duration-300 border-b-2 ${
                                activeTab === tab
                                    ? 'text-accent-emerald-green border-accent-emerald-green'
                                    : 'text-text-muted-cool-gray border-transparent hover:text-text-primary-off-white'
                            }`}
                        >
                            {tab === 'leaderboard' ? 'Leaderboard' : tab === 'activity' ? 'Activity' : 'Forums'}
                        </button>
                    ))}
                </div>

                {/* Leaderboard Tab */}
                {activeTab === 'leaderboard' && (
                    <div className="bg-surface-dark-charcoal/50 backdrop-blur-sm rounded-lg border border-border-subtle-dark/50 overflow-hidden">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-text-primary-off-white mb-6">
                                Top Players
                            </h3>
                            <div className="space-y-4">
                                {leaderboard.map((player) => (
                                    <div key={player.rank} className="flex items-center justify-between p-4 bg-surface-dark-charcoal/30 rounded-lg hover:bg-surface-dark-charcoal/50 transition-all duration-300">
                                        <div className="flex items-center space-x-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                                                player.rank === 1 ? 'bg-highlight-warm-gold text-bg-deep-navy' :
                                                player.rank === 2 ? 'bg-gray-400 text-bg-deep-navy' :
                                                player.rank === 3 ? 'bg-orange-600 text-bg-deep-navy' :
                                                'bg-surface-dark-charcoal text-text-muted-cool-gray'
                                            }`}>
                                                {player.rank}
                                            </div>
                                            <div className="text-2xl">{player.avatar}</div>
                                            <div>
                                                <div className="font-semibold text-text-primary-off-white">
                                                    {player.name}
                                                </div>
                                                <div className="text-sm text-text-muted-cool-gray">
                                                    {player.games} games • {player.winRate}% win rate
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-bold text-accent-emerald-green">
                                                {player.score.toLocaleString()}
                                            </div>
                                            <div className="text-sm text-text-muted-cool-gray">points</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Activity Tab */}
                {activeTab === 'activity' && (
                    <div className="space-y-4">
                        {recentActivity.map((activity, index) => (
                            <div key={index} className="bg-surface-dark-charcoal/50 backdrop-blur-sm rounded-lg border border-border-subtle-dark/50 p-6 hover:border-accent-emerald-green/50 transition-all duration-300">
                                <div className="flex items-start space-x-4">
                                    <div className="text-2xl">{activity.avatar}</div>
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <span className="font-semibold text-text-primary-off-white">
                                                {activity.user}
                                            </span>
                                            <span className="text-text-muted-cool-gray">
                                                {activity.action}
                                            </span>
                                        </div>
                                        <div className="text-text-primary-off-white mb-2">
                                            {activity.details}
                                        </div>
                                        <div className="text-sm text-text-muted-cool-gray">
                                            {activity.time}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Forums Tab */}
                {activeTab === 'forums' && (
                    <div className="bg-surface-dark-charcoal/50 backdrop-blur-sm rounded-lg border border-border-subtle-dark/50 overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-text-primary-off-white">
                                    Community Forums
                                </h3>
                                <button className="px-4 py-2 bg-accent-emerald-green text-bg-deep-navy rounded-lg font-medium hover:bg-accent-hover-lighter-green transition-colors duration-300">
                                    <i className="fas fa-plus mr-2"></i>
                                    New Topic
                                </button>
                            </div>
                            <div className="space-y-4">
                                {forums.map((forum, index) => (
                                    <div key={index} className="p-4 bg-surface-dark-charcoal/30 rounded-lg hover:bg-surface-dark-charcoal/50 transition-all duration-300 cursor-pointer">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-text-primary-off-white mb-2 hover:text-accent-emerald-green transition-colors duration-300">
                                                    {forum.title}
                                                </h4>
                                                <div className="flex items-center space-x-4 text-sm text-text-muted-cool-gray">
                                                    <span>by {forum.author}</span>
                                                    <span>•</span>
                                                    <span>{forum.replies} replies</span>
                                                    <span>•</span>
                                                    <span>{forum.views} views</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="px-2 py-1 bg-surface-dark-charcoal rounded text-xs text-accent-emerald-green mb-2 inline-block">
                                                    {forum.category}
                                                </span>
                                                <div className="text-sm text-text-muted-cool-gray">
                                                    {forum.lastActivity}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
