import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import useGame from '@/hooks/useGame';
import GenreContainer, {
    GenreButton,
    GenreCard,
    GenreStatBar,
} from '@/Components/Game/GenreContainer';
import ExitConfirmationModal from '@/Components/Game/ExitConfirmationModal';
import TypewriterText from '@/Components/Game/TypewriterText';

/* ─── Main component ─────────────────────────────────────────────────── */
const Game = () => {
    const {
        currentTurnData,
        currentHP, currentMP, maxHP, maxMP,
        inventory, currentTurn, maxTurns,
        isGameOver, isVictory, loading, error,
        remainingTurns, session,
        resolveChoice, resetGame, setError,
    } = useGame();

    const [enemyHP, setEnemyHP]         = useState(120);
    const [showExitModal, setShowExitModal] = useState(false);
    const [textKey, setTextKey]         = useState(0);
    const [dontShowExitModal, setDontShowExitModal] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('dontShowExitModal');
        if (saved === 'true') {
            setDontShowExitModal(true);
        }
    }, []);
    const ENEMY_MAX_HP = 120;

    const genre    = (session?.genre ?? 'fantasy').toLowerCase();
    const genreLabel = genre.charAt(0).toUpperCase() + genre.slice(1);
    const charName = session?.character_name ?? 'Adventurer';
    const currentEnemyName = { fantasy: 'Dark Wraith', horror: 'The Lurker', scifi: 'Rogue AI' }[genre] ?? 'Dark Wraith';
    const charLevel = Math.max(1, Math.floor((currentTurn ?? 0) / 4) + 1);

    /* Enemy sprite selection based on genre */
    const enemySprites = {
        fantasy: [
            'Goblin_Fire.gif',
            'Goblin_tnt.gif', 
            'Skeleton_Archer.png',
            'Skeleton_Flaming Skull.png',
            'Skeleton_King.png',
            'Skeleton_Spearman Armored.png',
            'Skeleton_Swordman Armored.png'
        ],
        horror: [
            'Eldtrich_boss.png',
            'Eldtrich_guardian.png',
            'Eldtrich_hunter.png',
            'Eldtrich_minion.png'
        ],
        scifi: [
            'Robot_Boss.gif',
            'Robot_Guardian.gif',
            'Robot_Pawn.gif'
        ]
    };
    
    const enemySpriteList = enemySprites[genre] || enemySprites.fantasy;
    // Use enemy_name from API response if available, otherwise fall back to turn-based rotation
    const apiEnemyName = currentTurnData?.enemy_name;
    const enemySprite = apiEnemyName 
        ? enemySpriteList.find(sprite => sprite.toLowerCase().includes(apiEnemyName.toLowerCase().replace(/\s+/g, '_'))) || enemySpriteList[0]
        : enemySpriteList[currentTurn % enemySpriteList.length];
    const playerSprite = genre === 'scifi' ? 'Player.png' : 'Player.gif';

    const handleGoToNewGame = () => router.visit('/new-game');

    const handleBackButton = () => {
        if (dontShowExitModal) {
            handleGoToNewGame();
        } else {
            setShowExitModal(true);
        }
    };

    const handleChoice = async (choiceKey) => {
        const outcome = currentTurnData?.outcomes?.[choiceKey];
        if (outcome?.enemy_hp_change) {
            setEnemyHP(prev => Math.max(0, prev + (outcome.enemy_hp_change ?? 0)));
        }
        await resolveChoice(choiceKey);
    };

    const inventoryItems = Array.isArray(inventory)
        ? inventory.map(i => (typeof i === 'string' ? i : i?.item_name ?? ''))
        : [];

    const choices = currentTurnData?.choices ?? [];

    /* ── Error ───────────────────────────────────────────────────────── */
    if (error) {
        return (
            <GenreContainer genre={genre}>
                <ExitConfirmationModal
                    isOpen={showExitModal}
                    onClose={() => setShowExitModal(false)}
                    onConfirm={() => { setShowExitModal(false); handleGoToNewGame(); }}
                    genre={genre}
                />
                <div className="flex items-center justify-center min-h-screen p-6">
                    <GenreCard genre={genre} className="max-w-sm w-full p-8 text-center">
                        <div className="text-5xl mb-4">⚠️</div>
                        <h2 className="text-xl font-bold text-red-400 mb-2">Something went wrong</h2>
                        <p className="text-red-300 text-sm mb-6">{error}</p>
                        <div className="flex gap-3 justify-center">
                            <GenreButton genre={genre} variant="outline" onClick={() => setError(null)} size="small">
                                Dismiss
                            </GenreButton>
                            <GenreButton genre={genre} onClick={handleGoToNewGame} size="small">
                                New Game
                            </GenreButton>
                        </div>
                    </GenreCard>
                </div>
            </GenreContainer>
        );
    }

    /* ── Loading ─────────────────────────────────────────────────────── */
    if (loading || (session && !currentTurnData && !isGameOver)) {
        return (
            <GenreContainer genre={genre}>
                <ExitConfirmationModal
                    isOpen={showExitModal}
                    onClose={() => setShowExitModal(false)}
                    onConfirm={() => { setShowExitModal(false); handleGoToNewGame(); }}
                    genre={genre}
                />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="relative w-20 h-20 mx-auto mb-6">
                            <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-ping" />
                            <div className="absolute inset-0 rounded-full border-4 border-t-white animate-spin" />
                            <div className="flex items-center justify-center h-full text-2xl">⚔️</div>
                        </div>
                        <p className="text-white font-bold text-lg tracking-widest uppercase">Generating Story…</p>
                        <p className="text-white/50 text-sm mt-1">The Dungeon Master is thinking</p>
                    </div>
                </div>
            </GenreContainer>
        );
    }

    /* ── No session ──────────────────────────────────────────────────── */
    if (!session && !loading) {
        return (
            <GenreContainer genre="fantasy">
                <ExitConfirmationModal
                    isOpen={showExitModal}
                    onClose={() => setShowExitModal(false)}
                    onConfirm={() => { setShowExitModal(false); handleGoToNewGame(); }}
                    genre="fantasy"
                />
                <div className="flex items-center justify-center min-h-screen p-6">
                    <div className="text-center">
                        <h1 className="text-5xl font-bold mb-4 text-yellow-400">LoreForge</h1>
                        <p className="text-white/70 mb-8">No active game session found.</p>
                        <GenreButton genre="fantasy" onClick={handleGoToNewGame} size="large" icon="⚔️">
                            Start New Adventure
                        </GenreButton>
                    </div>
                </div>
            </GenreContainer>
        );
    }

    /* ── Game Over / Victory ─────────────────────────────────────────── */
    if (isGameOver) {
        return (
            <GenreContainer genre={genre}>
                <ExitConfirmationModal
                    isOpen={showExitModal}
                    onClose={() => setShowExitModal(false)}
                    onConfirm={() => { setShowExitModal(false); handleGoToNewGame(); }}
                    genre={genre}
                />
                <div className="flex items-center justify-center min-h-screen p-6">
                    <GenreCard genre={genre} className="max-w-md w-full text-center p-10">
                        <div className="text-6xl mb-4">{isVictory ? '🏆' : '💀'}</div>
                        <h2 className={`text-3xl font-bold mb-3 ${isVictory ? 'text-green-400' : 'text-red-400'}`}>
                            {isVictory ? 'Victory!' : 'Game Over'}
                        </h2>
                        <p className="text-white/70 mb-8">
                            {isVictory
                                ? `${charName} has completed the adventure!`
                                : `${charName}'s journey has ended in defeat.`}
                        </p>
                        <GenreButton genre={genre} onClick={handleGoToNewGame} size="large">
                            Start New Adventure
                        </GenreButton>
                    </GenreCard>
                </div>
            </GenreContainer>
        );
    }

    /* ── MAIN BATTLE SCREEN ──────────────────────────────────────────── */
    return (
        <GenreContainer genre={genre} className="overflow-hidden flex flex-col h-screen">

            <ExitConfirmationModal
                isOpen={showExitModal}
                onClose={() => setShowExitModal(false)}
                onConfirm={() => { setShowExitModal(false); handleGoToNewGame(); }}
                genre={genre}
            />

            {/* Back button */}
            <div className="absolute top-4 left-4 z-30">
                <GenreButton
                    genre={genre}
                    variant="outline"
                    onClick={handleBackButton}
                    size="small"
                    className="flex items-center gap-2"
                >
                    <i className="fas fa-arrow-left" />
                    Back
                </GenreButton>
            </div>

                {/*
                 * ── BATTLE ARENA ──────────────────────────────────────
                 * Fixed height, relative container, everything inside is
                 * absolutely positioned so nothing overflows.
                */}
                <div
                    className="relative w-full shrink-0 overflow-hidden"
                    style={{ height: '42vh', minHeight: '260px', maxHeight: '340px' }}
                >
                    {/* ── ENEMY STAT BOX — top LEFT (like Pokémon) ── */}
                    <div className="absolute top-3 left-4 z-20" style={{ maxWidth: '220px' }}>
                        <GenreCard genre={genre} className="px-3 py-2">
                            <div className="flex items-center justify-between gap-4 mb-1.5">
                                <span className="font-bold text-white text-sm truncate">{apiEnemyName || currentEnemyName}</span>
                                <span className="text-xs text-white/50 shrink-0">Lv.12</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-red-400 w-5 shrink-0">HP</span>
                                <div className="flex-1">
                                    <GenreStatBar genre={genre} value={enemyHP} max={ENEMY_MAX_HP} type="enemyHp" />
                                </div>
                            </div>
                        </GenreCard>

                        {/* Turn + Genre badges below enemy box */}
                        <div className="flex gap-1.5 mt-1.5">
                            <GenreCard genre={genre} className="px-2.5 py-1 text-[10px] font-mono">
                                <span className="text-white/60">Turn</span> <span className="font-bold text-white">{currentTurn}</span><span className="text-white/60">/{maxTurns}</span>
                            </GenreCard>
                            <GenreCard genre={genre} className="px-2.5 py-1 text-[10px] font-bold">
                                {genreLabel}
                            </GenreCard>
                        </div>
                    </div>

                    {/* ── ENEMY SPRITE — top RIGHT ──────────────────── */}
                    <div className="absolute z-10" style={{ top: '8%', right: '18%' }}>
                        <img
                            src={`/Sprites/${genreLabel}/${enemySprite}`}
                            alt={apiEnemyName || currentEnemyName}
                            className="rounded-lg"
                            style={{ 
                                width: '130px', 
                                height: '110px',
                                objectFit: 'contain',
                                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))'
                            }}
                        />
                        {/* shadow platform */}
                        <div className="mx-auto mt-1 rounded-full bg-black/30 blur-sm" style={{ width: '120px', height: '10px' }} />
                    </div>

                    {/* ── PLAYER SPRITE — bottom LEFT ───────────────── */}
                    <div className="absolute z-10" style={{ bottom: '10%', left: '16%' }}>
                        <img
                            src={`/Sprites/${genreLabel}/${playerSprite}`}
                            alt={charName}
                            className="rounded-lg"
                            style={{ 
                                width: '150px', 
                                height: '160px',
                                objectFit: 'contain',
                                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))'
                            }}
                        />
                    </div>

                    {/* ── PLAYER STAT BOX — bottom RIGHT (like Pokémon) ── */}
                    <div className="absolute z-20" style={{ bottom: '6%', right: '4%', maxWidth: '230px' }}>
                        <GenreCard genre={genre} className="px-4 py-2.5">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-white text-sm truncate max-w-[130px]">{charName}</span>
                                <span className="text-xs text-white/50 shrink-0">Lv.{charLevel}</span>
                            </div>
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-[10px] font-bold text-green-400 w-5 shrink-0">HP</span>
                                <div className="flex-1">
                                    <GenreStatBar genre={genre} value={currentHP} max={maxHP} type="hp" />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold text-blue-400 w-5 shrink-0">MP</span>
                                <div className="flex-1">
                                    <GenreStatBar genre={genre} value={currentMP} max={maxMP} type="mp" />
                                </div>
                            </div>
                            <div className="flex justify-between text-[10px] text-white/40 mt-0.5">
                                <span>{currentHP}/{maxHP} HP</span>
                                <span>{currentMP}/{maxMP} MP</span>
                            </div>
                        </GenreCard>
                    </div>
                </div>

                {/*
                 * ── BOTTOM PANEL ──────────────────────────────────────
                 * Flex row: story text LEFT, choice buttons RIGHT
                */}
                <div
                    className="flex border-t-2 flex-1 min-h-0"
                    style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                >
                    {/* LEFT — dialog / story text */}
                    <div className="flex-1 p-4 flex flex-col min-w-0 min-h-0 bg-black/50 backdrop-blur">
                        <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2">
                            What will <span style={{ color: 'var(--accent, #C9A84C)' }}>{charName}</span> do?
                        </p>
                        <div
                            className="flex-1 overflow-y-auto pr-1"
                            style={{
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '8px',
                                padding: '10px 12px',
                                background: 'rgba(0,0,0,0.3)',
                            }}
                        >
                            {currentTurnData ? (
                                <p className="text-white/85 text-sm leading-relaxed">
                                    <TypewriterText 
                                        key={textKey} 
                                        text={currentTurnData.story_text} 
                                        speed={25}
                                    />
                                </p>
                            ) : (
                                <p className="text-white/30 text-sm italic">[ Story text appears here... ]</p>
                            )}
                        </div>
                    </div>

                    {/* Divider */}
                    <div style={{ width: '1px', background: 'rgba(255,255,255,0.08)' }} />

                    {/* RIGHT — 2×2 choice buttons */}
                    <div className="shrink-0 p-3 flex flex-col bg-black/60 backdrop-blur" style={{ width: '260px' }}>
                        <p className="text-center text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">
                            Choose Action
                        </p>
                        <div className="grid grid-cols-2 gap-2 flex-1">
                            {[0, 1, 2, 3].map((i) => {
                                const choiceKeys = Object.keys(currentTurnData?.outcomes ?? {});
                                const choiceKey = choiceKeys[i];
                                // Display text comes from choices[] array, key comes from outcomes{}
                                const displayText = currentTurnData?.choices?.[i] ?? choiceKey;

                                return choiceKey ? (
                                    <GenreButton
                                        key={i}
                                        genre={genre}
                                        onClick={() => handleChoice(choiceKey)}
                                        disabled={loading}
                                        size="small"
                                        className="text-[11px] leading-tight h-full w-full uppercase font-bold"
                                    >
                                        {displayText}
                                    </GenreButton>
                                ) : (
                                    <div
                                        key={i}
                                        className="rounded-lg flex items-center justify-center text-white/15 text-[10px]"
                                        style={{ border: '1px dashed rgba(255,255,255,0.12)' }}
                                    >
                                        —
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ── INVENTORY BAR ─────────────────────────────────── */}
                <div
                    className="flex items-center gap-2 px-4 py-2 shrink-0 overflow-x-auto"
                    style={{
                        background: 'rgba(0,0,0,0.7)',
                        borderTop: '1px solid rgba(255,255,255,0.08)',
                    }}
                >
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest shrink-0 mr-1">
                        Inventory:
                    </span>
                    {inventoryItems.length === 0 && (
                        <span className="text-[11px] text-white/25">— empty —</span>
                    )}
                    {inventoryItems.map((item, idx) => (
                        <GenreCard key={idx} genre={genre} className="px-3 py-1 shrink-0">
                            <span className="text-[11px] text-white/80 font-medium whitespace-nowrap">{item}</span>
                        </GenreCard>
                    ))}
                    {Array.from({ length: Math.max(0, 6 - inventoryItems.length) }).map((_, i) => (
                        <div
                            key={`e-${i}`}
                            className="px-3 py-1 rounded-lg shrink-0"
                            style={{ border: '1px dashed rgba(255,255,255,0.12)' }}
                        >
                            <span className="text-[11px] text-white/20 whitespace-nowrap">— empty —</span>
                        </div>
                    ))}
                </div>
            </GenreContainer>
    );
};

export default Game;