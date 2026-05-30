import { Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faTrophy, faSkull, faScroll, faClock, faStar } from '@fortawesome/free-solid-svg-icons';
import CampaignDetailModal from '@/Components/Game/CampaignDetailModal';
import { motion, AnimatePresence } from 'framer-motion';

export default function Community() {
    const { auth } = usePage().props;
    const [activeGenre, setActiveGenre] = useState('all');
    const [sortBy, setSortBy] = useState('recent');
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [page, setPage] = useState(1);
    const [selectedCampaignId, setSelectedCampaignId] = useState(null);

    useEffect(() => {
        fetchCampaigns();
    }, [activeGenre, sortBy, page]);

    const fetchCampaigns = async () => {
        setLoading(true);
        try {
            const url = `/api/community?genre=${activeGenre}&sort=${sortBy}&page=${page}`;
            const res = await axios.get(url);
            if (res.data.success) {
                setCampaigns(res.data.campaigns);
                setPagination(res.data.pagination);
            }
        } catch (err) {
            console.error('Failed to fetch campaigns', err);
        } finally {
            setLoading(false);
        }
    };

    const getGenreTheme = (genre) => {
        switch (genre?.toLowerCase()) {
            case 'fantasy': return { badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', hover: 'hover:border-emerald-500/50' };
            case 'horror': return { badge: 'bg-red-500/10 text-red-400 border-red-500/20', hover: 'hover:border-red-500/50' };
            case 'scifi': return { badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20', hover: 'hover:border-cyan-500/50' };
            default: return { badge: 'bg-white/10 text-white/70 border-white/20', hover: 'hover:border-white/50' };
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Community" />
            
            <motion.div 
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
            >
                <motion.div variants={itemVariants} className="mb-10 text-center">
                    <h1 className="text-3xl font-black text-white tracking-widest uppercase mb-2">Community Campaigns</h1>
                    <p className="text-white/50">Explore legendary tales shared by other players and start your own adventure from their paths.</p>
                </motion.div>

                {/* Filters and Sorting bar */}
                <motion.div 
                    variants={itemVariants} 
                    className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10 bg-white/[0.02] border border-white/10 rounded-2xl p-4 sm:p-5"
                >
                    {/* Genre Tabs */}
                    <div className="flex flex-wrap justify-center md:justify-start gap-2">
                        {['all', 'fantasy', 'horror', 'scifi'].map((genre) => (
                            <button
                                key={genre}
                                onClick={() => { setActiveGenre(genre); setPage(1); }}
                                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-[0.15em] transition-all duration-300 border relative overflow-hidden group ${
                                    activeGenre === genre
                                        ? 'bg-white/10 text-white border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                                        : 'bg-transparent text-white/40 border-transparent hover:text-white/80 hover:bg-white/5'
                                }`}
                            >
                                <span className="relative z-10">{genre}</span>
                                {activeGenre === genre && (
                                    <motion.div 
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-white/5 z-0"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Sort Dropdown */}
                    <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-end border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
                        <span className="text-[10px] sm:text-xs text-white/40 font-bold uppercase tracking-widest whitespace-nowrap">Sort By:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                            className="bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-white/30 cursor-pointer min-w-[160px] uppercase tracking-wider transition-all duration-200"
                        >
                            <option value="recent">Newest Shared</option>
                            <option value="highest_rated">Highest Rated</option>
                            <option value="most_popular">Most Popular</option>
                        </select>
                    </div>
                </motion.div>

                {/* Grid Content with AnimatePresence for smooth transitions */}
                <AnimatePresence mode="wait">
                    {loading && campaigns.length === 0 ? (
                        <motion.div 
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex justify-center py-20"
                        >
                            <div className="relative">
                                <div className="w-12 h-12 border-2 border-white/10 border-t-white rounded-full animate-spin"></div>
                                <div className="absolute inset-0 border-2 border-transparent border-b-accent-emerald-green/50 rounded-full animate-[spin_1.5s_linear_infinite]"></div>
                            </div>
                        </motion.div>
                    ) : campaigns.length === 0 ? (
                        <motion.div 
                            key="empty"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl"
                        >
                            <FontAwesomeIcon icon={faScroll} className="text-4xl text-white/20 mb-4" />
                            <h3 className="text-xl font-bold text-white/70 mb-2">No Campaigns Found</h3>
                            <p className="text-white/40">Be the first to share your adventure in this genre.</p>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key={activeGenre + page}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            variants={containerVariants}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {campaigns.map((camp, index) => {
                                const theme = getGenreTheme(camp.genre);
                                const isVictory = camp.outcome === 'victory';
                                
                                return (
                                    <motion.div 
                                        key={camp.id}
                                        variants={itemVariants}
                                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                                        onClick={() => setSelectedCampaignId(camp.id)}
                                        className={`bg-[#0A0D14]/80 backdrop-blur-md rounded-2xl p-6 border border-white/10 cursor-pointer transition-colors duration-300 flex flex-col h-full group ${theme.hover}`}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-xl font-black text-white truncate pr-4 group-hover:text-accent-emerald-green transition-colors">{camp.character_name}</h3>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${theme.badge}`}>
                                                {camp.genre}
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 text-xs text-white/50 mb-4">
                                            <FontAwesomeIcon icon={faUser} className="text-[10px]" />
                                            <span>{camp.author}</span>
                                            <span className="mx-1">•</span>
                                            <FontAwesomeIcon icon={faClock} className="text-[10px]" />
                                            <span>{camp.shared_at}</span>
                                        </div>
                                        
                                        <div className="flex-1 bg-black/40 rounded-xl p-4 border border-white/5 mb-4 group-hover:bg-black/60 transition-colors">
                                            <p className="text-sm text-white/70 leading-relaxed italic line-clamp-3">
                                                "{camp.story_preview}"
                                            </p>
                                        </div>
                                        
                                        <div className="flex justify-between items-center pt-4 border-t border-white/10 mt-auto">
                                            <span className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${isVictory ? 'text-green-400' : 'text-red-400'}`}>
                                                <FontAwesomeIcon icon={isVictory ? faTrophy : faSkull} />
                                                {isVictory ? 'Victory' : 'Defeat'}
                                            </span>
                                            <div className="flex items-center gap-3">
                                                {camp.avg_rating != null && (
                                                    <span className="flex items-center gap-1 text-xs text-amber-400 font-bold" title={`${camp.ratings_count} ratings`}>
                                                        <FontAwesomeIcon icon={faStar} className="text-[10px]" />
                                                        {camp.avg_rating} <span className="text-[10px] text-white/45 font-normal">({camp.ratings_count})</span>
                                                    </span>
                                                )}
                                                <span className="text-xs text-white/40 font-bold uppercase tracking-wider">
                                                    {camp.turn_count} Turns
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>


                {/* Pagination */}
                {pagination && pagination.last_page > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-12">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-bold text-white hover:bg-white/10 disabled:opacity-30 transition-all uppercase tracking-widest"
                        >
                            Prev
                        </button>
                        <span className="text-sm font-bold text-white/50">
                            Page {pagination.current_page} of {pagination.last_page}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(pagination.last_page, p + 1))}
                            disabled={page === pagination.last_page}
                            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-bold text-white hover:bg-white/10 disabled:opacity-30 transition-all uppercase tracking-widest"
                        >
                            Next
                        </button>
                    </div>
                )}
            </motion.div>

            <CampaignDetailModal 
                campaignId={selectedCampaignId}
                isOpen={!!selectedCampaignId}
                onClose={() => setSelectedCampaignId(null)}
            />
        </AuthenticatedLayout>
    );
}
