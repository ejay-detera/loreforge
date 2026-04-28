import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause, faVolumeHigh, faVolumeLow, faVolumeMute } from '@fortawesome/free-solid-svg-icons';
import { getGenreTheme } from './GenreContainer';

/**
 * SoundtrackPlayer Component
 * Handles genre-specific background music with persistent state.
 */
const SoundtrackPlayer = ({ genre }) => {
    const [isPlaying, setIsPlaying] = useState(true);
    const [volume, setVolume] = useState(0.5);
    const [isMuted, setIsMuted] = useState(false);
    const audioRef = useRef(null);
    const theme = getGenreTheme(genre);

    const tracks = {
        fantasy: '/music/fantasy-theme.mp3',
        horror: '/music/horror-theme.mp3',
        scifi: '/music/sci-fi-theme.mp3',
    };

    const trackTitles = {
        fantasy: 'Chronicles of Aetheria',
        horror: 'Echoes from the Void',
        scifi: 'Neon Horizon',
    };

    // Load initial state from localStorage
    useEffect(() => {
        const savedVolume = localStorage.getItem('loreforge_music_volume');
        const savedPaused = localStorage.getItem('loreforge_music_paused');

        if (savedVolume !== null) {
            setVolume(parseFloat(savedVolume));
        }
        
        // Only set playing to false if explicitly saved as paused
        if (savedPaused === 'true') {
            setIsPlaying(false);
        } else {
            setIsPlaying(true);
        }
    }, []);

    // Sync volume with audio element and localStorage
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume;
        }
        localStorage.setItem('loreforge_music_volume', volume.toString());
    }, [volume, isMuted]);

    // Handle play/pause
    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.log("Autoplay prevented or audio error:", error);
                        // If autoplay is blocked, we stay in "playing" state but music is paused by browser
                        // User will need to click play/pause to start it
                    });
                }
            } else {
                audioRef.current.pause();
            }
        }
        localStorage.setItem('loreforge_music_paused', (!isPlaying).toString());
    }, [isPlaying, genre]); // Re-run on genre change to ensure new track plays if allowed

    const togglePlay = () => setIsPlaying(!isPlaying);
    
    const handleVolumeChange = (e) => {
        const newVol = parseFloat(e.target.value);
        setVolume(newVol);
        if (newVol > 0) setIsMuted(false);
    };

    const toggleMute = () => setIsMuted(!isMuted);

    return (
        <div 
            className="flex items-center justify-between px-6 py-3 border-t backdrop-blur-xl z-50 shrink-0"
            style={{ 
                background: 'rgba(0, 0, 0, 0.8)',
                borderColor: `${theme.accentColor}33`,
                boxShadow: `0 -4px 20px rgba(0,0,0,0.5)`
            }}
        >
            <audio 
                ref={audioRef} 
                src={tracks[genre.toLowerCase()] || tracks.fantasy} 
                loop 
            />

            {/* Track Info & Play Control */}
            <div className="flex items-center gap-4">
                <button
                    onClick={togglePlay}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group"
                    style={{ 
                        background: theme.buttonPrimary,
                        boxShadow: `0 0 15px ${theme.accentGlow}`
                    }}
                >
                    <FontAwesomeIcon 
                        icon={isPlaying ? faPause : faPlay} 
                        className="text-white text-sm"
                    />
                </button>

                <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 game-text" style={{ color: theme.accentColor }}>
                        Atmosphere
                    </span>
                    <span className="text-sm font-bold text-white tracking-wide game-text">
                        {trackTitles[genre.toLowerCase()] || 'LoreForge Theme'}
                    </span>
                </div>
            </div>

            {/* Volume Controls */}
            <div className="flex items-center gap-4 min-w-[140px]">
                <button 
                    onClick={toggleMute}
                    className="text-white/40 hover:text-white transition-colors"
                >
                    <FontAwesomeIcon 
                        icon={isMuted || volume === 0 ? faVolumeMute : volume < 0.5 ? faVolumeLow : faVolumeHigh} 
                    />
                </button>
                
                <div className="relative flex-1 h-6 flex items-center group">
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-full h-1.5 rounded-full appearance-none bg-white/10 cursor-pointer accent-current outline-none"
                        style={{ 
                            color: theme.accentColor,
                            backgroundImage: `linear-gradient(90deg, ${theme.accentColor} 0%, ${theme.accentColor} ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.1) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.1) 100%)`
                        }}
                    />
                </div>
            </div>

            <style>{`
                input[type='range']::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: white;
                    cursor: pointer;
                    box-shadow: 0 0 10px rgba(0,0,0,0.5);
                    transition: all 0.2s;
                }
                input[type='range']:hover::-webkit-slider-thumb {
                    transform: scale(1.2);
                    box-shadow: 0 0 15px ${theme.accentGlow};
                }
            `}</style>
        </div>
    );
};

export default SoundtrackPlayer;
