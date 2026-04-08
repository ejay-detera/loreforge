import React, { useState, useEffect } from 'react';
import GenreButton, { GenreCard } from './GenreContainer';

/* ─── Exit Confirmation Modal ───────────────────────────────────── */
const ExitConfirmationModal = ({ isOpen, onClose, onConfirm, genre }) => {
    const [dontShowAgain, setDontShowAgain] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('dontShowExitModal');
        if (saved === 'true') {
            setDontShowAgain(true);
        }
    }, []);

    const handleDontShowAgainChange = (checked) => {
        setDontShowAgain(checked);
        localStorage.setItem('dontShowExitModal', checked.toString());
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <GenreCard genre={genre} className="max-w-md w-full mx-4 p-6 text-center">
                <div className="text-4xl mb-4">⚠️</div>
                <h3 className="text-xl font-bold text-white mb-3">Leave Game?</h3>
                <p className="text-white/70 mb-4">
                    This will make you leave your game, but you will still start where you ended up at
                </p>
                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 mb-6">
                    <p className="text-yellow-400 text-sm font-medium mb-1">💾 Auto-Save</p>
                    <p className="text-white/60 text-xs">
                        Your game is automatically saved to your last turn, so you can continue later.
                    </p>
                </div>
                <div className="flex items-center justify-center mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={dontShowAgain}
                            onChange={(e) => handleDontShowAgainChange(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-2"
                        />
                        <span className="text-white/60 text-sm">Don't show this again</span>
                    </label>
                </div>
                <div className="flex gap-3 justify-center">
                    <GenreButton 
                        genre={genre} 
                        variant="outline" 
                        onClick={onClose}
                        size="small"
                    >
                        Cancel
                    </GenreButton>
                    <GenreButton 
                        genre={genre} 
                        onClick={onConfirm}
                        size="small"
                    >
                        Exit Game
                    </GenreButton>
                </div>
            </GenreCard>
        </div>
    );
};

export default ExitConfirmationModal;
