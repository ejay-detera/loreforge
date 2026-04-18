import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import useGame from '@/hooks/useGame';
import GenreContainer, {
    GenreButton,
    GenreCard,
    GenreStatBar,
    getGenreTheme,
    GenrePlatform,
} from '@/Components/Game/GenreContainer';
import ExitConfirmationModal from '@/Components/Game/ExitConfirmationModal';
import TypewriterText from '@/Components/Game/TypewriterText';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faExclamationTriangle, faTrophy, faSkull, faPlus, faBolt } from '@fortawesome/free-solid-svg-icons';

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

    const [enemyHP, setEnemyHP] = useState(120);
    const [showExitModal, setShowExitModal] = useState(false);
    const [textKey, setTextKey] = useState(0);
    const [dontShowExitModal, setDontShowExitModal] = useState(false);
    const [hpDamage, setHpDamage] = useState(false);
    const [mpDamage, setMpDamage] = useState(false);
    const [prevHP, setPrevHP] = useState(100);
    const [prevMP, setPrevMP] = useState(50);
    const [spritesLoaded, setSpritesLoaded] = useState(false);
    const [preservedGenre, setPreservedGenre] = useState(null);
    const [enemySprite, setEnemySprite] = useState('');
    const [prevEnemyName, setPrevEnemyName] = useState('');
    const [battlePhase, setBattlePhase] = useState(null);
    const [pendingOutcome, setPendingOutcome] = useState(null);
    const [showEnemyDmg, setShowEnemyDmg] = useState(null);
    const [showPlayerDmg, setShowPlayerDmg] = useState(null);

    useEffect(() => {
        const saved = localStorage.getItem('dontShowExitModal');
        if (saved === 'true') setDontShowExitModal(true);
        setTimeout(() => setSpritesLoaded(true), 100);
    }, []);

    const ENEMY_MAX_HP = 120;

    useEffect(() => {
        if (session?.genre && !preservedGenre) {
            setPreservedGenre(session.genre);
        }
    }, [session?.genre, preservedGenre]);

    const genre = (session?.genre ?? preservedGenre ?? 'fantasy').toLowerCase();
    const genreLabel = genre.charAt(0).toUpperCase() + genre.slice(1);
    const genreFolder = { fantasy: 'Fantasy', horror: 'Horror', scifi: 'Sci-fi' }[genre] ?? 'Fantasy';
    const theme = getGenreTheme(genre);

    useEffect(() => {
        console.log('Genre Debug:', {
            sessionGenre: session?.genre,
            preservedGenre,
            computedGenre: genre,
            genreLabel,
            turn: currentTurn,
            sessionId: session?.id,
        });

        if (currentHP < prevHP) {
            setHpDamage(true);
            setTimeout(() => setHpDamage(false), 800);
        }
        if (currentMP < prevMP) {
            setMpDamage(true);
            setTimeout(() => setMpDamage(false), 800);
        }

        setPrevHP(currentHP);
        setPrevMP(currentMP);
    }, [session?.genre, preservedGenre, genre, currentTurn, session?.id, currentHP, currentMP, prevHP, prevMP]);

    useEffect(() => {
        if (enemyHP <= 0 && prevEnemyName) {
            console.log('Enemy defeated! Current:', prevEnemyName, 'HP:', enemyHP);
        }
    }, [enemyHP, prevEnemyName]);

    const [lastProcessedTurn, setLastProcessedTurn] = useState(-1);

    useEffect(() => {
        if (currentTurnData) {
            setTextKey(prev => prev + 1);
        }
    }, [currentTurnData?.turn_number, currentTurnData?.story_text]);

    const charName = session?.character_name ?? 'Adventurer';
    const fallbackEnemyName = { fantasy: 'Goblin Fire Thrower', horror: 'Eldritch Minion', scifi: 'Robot Pawn' }[genre] ?? 'Goblin Fire Thrower';
    const charLevel = Math.max(1, Math.floor((currentTurn ?? 0) / 4) + 1);
    const apiEnemyName = currentTurnData?.enemy_name;

    const enemySprites = {
        fantasy: [
            'Goblin_Fire.gif',
            'Goblin_tnt.gif',
            'Skeleton_Archer.png',
            'Skeleton_Flaming Skull.png',
            'Skeleton_King.png',
            'Skeleton_Spearman Armored.png',
            'Skeleton_Swordman Armored.png',
        ],
        horror: [
            'Eldtrich_boss.png',
            'Eldtrich_guardian.png',
            'Eldtrich_hunter.png',
            'Eldtrich_minion.png',
        ],
        scifi: [
            'Robot_Boss.gif',
            'Robot_Guardian.gif',
            'Robot_Pawn.gif',
        ],
    };

    const enemySpriteList = enemySprites[genre] || enemySprites.fantasy;

    const matchEnemySprite = (enemyName, list) => {
        if (!enemyName) return null;
        const searchWords = enemyName.toLowerCase().split(/[\s_]+/);
        return list.find(s => {
            const spriteName = s.toLowerCase();
            return searchWords.every(word => spriteName.includes(word));
        });
    };

    useEffect(() => {
        if (currentTurnData && currentTurnData.turn_number !== lastProcessedTurn) {
            const currentEnemyName = currentTurnData.enemy_name || fallbackEnemyName;

            let isNewEnemyInstance = false;

            if (currentEnemyName !== prevEnemyName) {
                isNewEnemyInstance = true;
            } else if (enemyHP <= 0 && lastProcessedTurn !== -1) {
                isNewEnemyInstance = true;
            }

            if (isNewEnemyInstance || lastProcessedTurn === -1) {
                const newSprite = matchEnemySprite(currentEnemyName, enemySpriteList) || enemySpriteList[0];
                setEnemySprite(newSprite);
                setPrevEnemyName(currentEnemyName);
                setEnemyHP(ENEMY_MAX_HP);
            }

            setLastProcessedTurn(currentTurnData.turn_number);
        }
    }, [currentTurnData, fallbackEnemyName, currentTurn, enemySpriteList, enemyHP, prevEnemyName, lastProcessedTurn]);

    const playerSprites = { fantasy: 'Player.gif', horror: 'Player.gif', scifi: 'Player.png' };
    const playerSprite = playerSprites[genre];

    const handleGoToNewGame = () => router.visit('/dashboard');

    const handleBackButton = () => {
        if (dontShowExitModal) handleGoToNewGame();
        else setShowExitModal(true);
    };

    const handleChoice = async (choiceKey) => {
        if (battlePhase) return;

        const outcome = currentTurnData?.outcomes?.[choiceKey];
        if (!outcome) return;

        setPendingOutcome({ choiceKey, outcome });

        setBattlePhase('player-attack');
        setShowEnemyDmg(null);
        setShowPlayerDmg(null);

        setTimeout(() => {
            const enemyDmg = outcome.enemy_hp_change ?? 0;
            if (enemyDmg !== 0) {
                setShowEnemyDmg({ value: enemyDmg, color: '#ff4444' });
                setEnemyHP(prev => Math.max(0, prev + enemyDmg));
            }
        }, 350);

        const playerTakesDamage = (outcome.health_change ?? 0) < 0;
        setTimeout(() => {
            if (playerTakesDamage) {
                setBattlePhase('enemy-attack');
                setTimeout(() => {
                    setShowPlayerDmg({
                        value: outcome.health_change,
                        color: '#ff6666',
                    });
                }, 350);
            }
        }, 900);

        const totalDuration = playerTakesDamage ? 1800 : 900;
        setTimeout(async () => {
            setBattlePhase(null);
            setShowEnemyDmg(null);
            setShowPlayerDmg(null);
            setPendingOutcome(null);
            await resolveChoice(choiceKey);
        }, totalDuration);
    };

    const inventoryItems = Array.isArray(inventory)
        ? inventory.map(i => (typeof i === 'string' ? i : i?.item_name ?? ''))
        : [];

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
                        <div className="text-5xl mb-4">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-400" />
                        </div>
                        <h2 className="text-xl font-bold text-red-400 mb-2 game-text">Something went wrong</h2>
                        <p className="text-red-300 text-sm mb-6 game-text">{error}</p>
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
    if ((loading && remainingTurns === 0) || (session && !currentTurnData && !isGameOver && remainingTurns === 0)) {
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
                            <div className="flex items-center justify-center h-full text-2xl">
                                <FontAwesomeIcon icon={faBolt} className="text-white" />
                            </div>
                        </div>
                        <p className="text-white font-bold text-lg tracking-widest uppercase game-text">Generating Story…</p>
                        <p className="text-white/50 text-sm mt-1 game-text">The Dungeon Master is thinking</p>
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
        const accentColor = isVictory ? '#4ade80' : '#f87171';
        const glowColor = isVictory ? 'rgba(74,222,128,0.4)' : 'rgba(248,113,113,0.4)';

        return (
            <GenreContainer genre={genre}>
                <div className="flex items-center justify-center min-h-screen p-6">
                    <GenreCard genre={genre} className="max-w-lg w-full text-center p-10 relative overflow-hidden">
                        <div
                            className="absolute inset-0 pointer-events-none"
                            style={{ background: `radial-gradient(circle at 50% 30%, ${glowColor} 0%, transparent 70%)` }}
                        />
                        <div className="relative inline-block mb-6">
                            <div
                                className="absolute inset-0 rounded-full animate-ping"
                                style={{ border: `3px solid ${accentColor}`, opacity: 0.3, animationDuration: '2s' }}
                            />
                            <div
                                className="relative w-24 h-24 rounded-full flex items-center justify-center mx-auto"
                                style={{
                                    background: `linear-gradient(135deg, ${accentColor}22, ${accentColor}44)`,
                                    border: `2px solid ${accentColor}`,
                                    boxShadow: `0 0 30px ${glowColor}, inset 0 0 20px ${glowColor}`,
                                }}
                            >
                                <FontAwesomeIcon icon={isVictory ? faTrophy : faSkull} className="text-4xl" style={{ color: accentColor }} />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold mb-2 game-text" style={{ color: accentColor }}>
                            {isVictory ? 'Victory!' : 'Defeated'}
                        </h2>
                        <p className="text-white/60 text-sm mb-6 game-text">
                            {isVictory ? `${charName} has conquered the adventure!` : `${charName}'s journey has come to an end.`}
                        </p>
                        <div
                            className="mx-auto mb-6"
                            style={{ width: '60%', height: '1px', background: `linear-gradient(90deg, transparent, ${accentColor}66, transparent)` }}
                        />
                        <div className="grid grid-cols-3 gap-3 mb-8">
                            <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <p className="text-white/40 text-[9px] uppercase tracking-widest game-text mb-1">Turns</p>
                                <p className="text-white text-lg font-bold game-text">{currentTurn}/{maxTurns}</p>
                            </div>
                            <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <p className="text-green-400/60 text-[9px] uppercase tracking-widest game-text mb-1">HP</p>
                                <p className="text-green-400 text-lg font-bold game-text">{currentHP}/{maxHP}</p>
                            </div>
                            <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <p className="text-blue-400/60 text-[9px] uppercase tracking-widest game-text mb-1">MP</p>
                                <p className="text-blue-400 text-lg font-bold game-text">{currentMP}/{maxMP}</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <GenreButton genre={genre} onClick={() => router.visit('/dashboard')} size="large">
                                Return to Dashboard
                            </GenreButton>
                            <button
                                onClick={() => router.visit('/new-game')}
                                className="px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-wider game-text transition-all duration-200 hover:bg-white/10"
                                style={{ color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent' }}
                            >
                                Start New Adventure
                            </button>
                        </div>
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
            <div className="absolute top-4 right-4 z-30">
                <GenreButton
                    genre={genre}
                    variant="outline"
                    onClick={handleBackButton}
                    size="small"
                    className="flex items-center gap-2"
                >
                    <FontAwesomeIcon icon={faArrowLeft} />
                    Back
                </GenreButton>
            </div>

            {/* ── BATTLE ARENA ── */}
            <div
                className={`relative w-full shrink-0 overflow-hidden ${battlePhase ? 'battle-screen-shake' : ''}`}
                style={{ height: '42vh', minHeight: '260px', maxHeight: '340px' }}
            >
                {/* ── GROUND STAGE LINE ── */}
                <div
                    className="absolute left-0 right-0 pointer-events-none z-10"
                    style={{
                        bottom: '20%',
                        height: '3px',
                        background: `linear-gradient(90deg, transparent 2%, ${theme.accentColor}44 15%, ${theme.accentColor}cc 35%, ${theme.accentColor} 50%, ${theme.accentColor}cc 65%, ${theme.accentColor}44 85%, transparent 98%)`,
                        boxShadow: `0 0 18px ${theme.accentGlow}, 0 0 6px ${theme.accentColor}`,
                    }}
                />

                {/* ── GROUND FILL below stage line ── */}
                <div
                    className="absolute left-0 right-0 bottom-0 pointer-events-none z-10"
                    style={{
                        height: '20%',
                        background: `linear-gradient(0deg, ${theme.groundColor} 0%, transparent 100%)`,
                    }}
                />

                {/* ── ENEMY STAT BOX — top LEFT ── */}
                <div
                    className={`absolute top-3 left-4 z-20 ${spritesLoaded ? 'stat-fade-in' : ''}`}
                    style={{ maxWidth: '220px' }}
                >
                    <GenreCard genre={genre} className="px-3 py-2">
                        <div className="flex items-center justify-between gap-4 mb-1.5">
                            <span className="font-bold text-white text-sm truncate game-text">
                                {apiEnemyName || fallbackEnemyName}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-red-400 w-5 shrink-0 game-text">HP</span>
                            <div className={`flex-1 ${hpDamage ? 'hp-damage' : ''}`}>
                                <GenreStatBar genre={genre} value={enemyHP} max={ENEMY_MAX_HP} type="enemyHp" />
                            </div>
                        </div>
                    </GenreCard>
                    <div className="flex gap-1.5 mt-1.5">
                        <GenreCard genre={genre} className="px-2.5 py-1 text-[10px] font-mono">
                            <span className="text-white/60 game-text">Turn</span>{' '}
                            <span className="font-bold text-white game-text">{currentTurn}</span>
                            <span className="text-white/60 game-text">/{maxTurns}</span>
                        </GenreCard>
                        <GenreCard genre={genre} className="px-2.5 py-1 text-[10px] font-bold">
                            <span className="game-text">{genreLabel}</span>
                        </GenreCard>
                    </div>
                </div>

                {/* ── ENEMY SPRITE — upper right, standing on platform on the ground line ── */}
                <div
                    className={`absolute z-10 ${spritesLoaded ? 'slide-in-right bounce-in' : ''} ${battlePhase === 'player-attack' ? 'battle-enemy-hit' : ''} ${battlePhase === 'enemy-attack' ? 'battle-enemy-attack' : ''}`}
                    style={{
                        // Moved way higher to match Pokemon-style perspective
                        bottom: 'calc(45% - 18px)',
                        right: '28%',
                        // Removed flex layout to allow manual overlapping
                    }}
                >
                    <img
                        src={`/Sprites/${genreFolder}/${enemySprite}`}
                        alt={apiEnemyName || fallbackEnemyName}
                        className="rounded-lg"
                        style={{
                            width: '125px',
                            height: '125px',
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.6))',
                            position: 'absolute',
                            bottom: '5px', // Sit slightly above platform center
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 10,
                        }}
                    />

                    {/* Platform ellipse anchored at the bottom of the wrapper */}
                    <GenrePlatform
                        genre={genre}
                        className="absolute"
                        style={{
                            bottom: 0,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 0,
                        }}
                    />

                    {/* Floating damage number on enemy */}
                    {showEnemyDmg && (
                        <div
                            key={`edm-${currentTurn}-${Date.now()}`}
                            className="battle-damage-number"
                            style={{ top: '-10px', left: '50%', transform: 'translateX(-50%)', color: showEnemyDmg.color }}
                        >
                            {showEnemyDmg.value}
                        </div>
                    )}
                </div>

                {/* ── IMPACT EFFECTS (on enemy position) ── */}
                {battlePhase === 'player-attack' && (
                    <>
                        <div className="battle-screen-flash" />
                        <div className="battle-impact-burst" style={{ top: 'calc(25% - 30px)', right: 'calc(28% + 40px)' }} />
                        <div className="battle-slash-left" style={{ top: 'calc(25% - 30px)', right: 'calc(28% + 10px)' }} />
                        <div className="battle-slash-right" style={{ top: 'calc(25% - 20px)', right: 'calc(28% + 20px)' }} />
                    </>
                )}

                {/* ── IMPACT EFFECTS (on player position) ── */}
                {battlePhase === 'enemy-attack' && (
                    <>
                        <div className="battle-screen-flash" />
                        <div className="battle-impact-burst" style={{ top: 'calc(60%)', left: 'calc(24% + 50px)' }} />
                        <div className="battle-slash-left" style={{ top: 'calc(60%)', left: 'calc(24% + 20px)' }} />
                        <div className="battle-slash-right" style={{ top: 'calc(60% + 10px)', left: 'calc(24% + 30px)' }} />
                    </>
                )}

                {/* ── PLAYER SPRITE — lower left, standing on platform on the ground line ── */}
                <div
                    className={`absolute z-10 ${spritesLoaded ? 'slide-in-left bounce-in' : ''} ${battlePhase === 'player-attack' ? 'battle-player-attack' : ''} ${battlePhase === 'enemy-attack' ? 'battle-player-hit' : ''}`}
                    style={{
                        // bottom of wrapper = ground line - half of player ellipse height (~30px)
                        // so ellipse center sits exactly on the ground line
                        bottom: 'calc(10% - 30px)',
                        left: '24%',
                        // Removed flex layout to allow manual overlapping
                    }}
                >
                    <img
                        src={`/Sprites/${genreFolder}/${playerSprite}`}
                        alt={charName}
                        className="rounded-lg"
                        style={{
                            width: '200px',
                            height: '200px',
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.7))',
                            position: 'absolute',
                            bottom: '10px', // Sit slightly above platform center
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 10,
                        }}
                    />

                    {/* Platform ellipse anchored at the bottom of the wrapper */}
                    <GenrePlatform
                        genre={genre}
                        className="absolute"
                        style={{
                            bottom: 0,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 0,
                            width: '280px',
                            height: '110px',
                        }}
                    />

                    {/* Floating damage number on player */}
                    {showPlayerDmg && (
                        <div
                            key={`pdm-${currentTurn}-${Date.now()}`}
                            className="battle-damage-number"
                            style={{ top: '10px', left: '50%', transform: 'translateX(-50%)', color: showPlayerDmg.color }}
                        >
                            {showPlayerDmg.value}
                        </div>
                    )}
                </div>

                {/* ── PLAYER STAT BOX — bottom RIGHT ── */}
                <div
                    className={`absolute z-20 ${spritesLoaded ? 'stat-fade-in' : ''}`}
                    style={{ bottom: '6%', right: '4%', maxWidth: '230px' }}
                >
                    <GenreCard genre={genre} className="px-4 py-2.5">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-white text-sm truncate max-w-[130px] game-text font-8bit">
                                {charName}
                            </span>
                            <span className="text-xs text-white/50 shrink-0 game-text font-8bit">Lv.{charLevel}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[10px] font-bold text-green-400 w-5 shrink-0 game-text font-8bit">HP</span>
                            <div className={`flex-1 ${hpDamage ? 'hp-damage' : ''}`}>
                                <GenreStatBar genre={genre} value={currentHP} max={maxHP} type="hp" />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold text-blue-400 w-5 shrink-0 game-text font-8bit">MP</span>
                            <div className={`flex-1 ${mpDamage ? 'mp-damage' : ''}`}>
                                <GenreStatBar genre={genre} value={currentMP} max={maxMP} type="mp" />
                            </div>
                        </div>
                        <div className="flex justify-between text-[10px] text-white/40 mt-0.5">
                            <span className="game-text font-8bit">HP: {currentHP}/{maxHP}</span>
                            <span className="game-text font-8bit">MP: {currentMP}/{maxMP}</span>
                        </div>
                    </GenreCard>
                </div>
            </div>

            {/* ── BOTTOM PANEL ── */}
            <div
                className="flex border-t-2 flex-1 min-h-0"
                style={{ borderColor: 'rgba(255,255,255,0.1)' }}
            >
                {/* LEFT — dialog / story text */}
                <div className="flex-1 p-4 flex flex-col min-w-0 min-h-0 bg-black/50 backdrop-blur">
                    <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2 game-text">
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
                            <p className="text-white/85 text-sm leading-relaxed game-text">
                                <TypewriterText key={textKey} text={currentTurnData.story_text} speed={25} />
                            </p>
                        ) : (
                            <p className="text-white/30 text-sm italic game-text">[ Story text appears here... ]</p>
                        )}
                    </div>
                </div>

                {/* Divider */}
                <div style={{ width: '1px', background: 'rgba(255,255,255,0.08)' }} />

                {/* RIGHT — 2×2 choice buttons */}
                <div className="shrink-0 p-3 flex flex-col bg-black/60 backdrop-blur" style={{ width: '260px' }}>
                    <p className="text-center text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 game-text">
                        Choose Action
                    </p>
                    <div className="grid grid-cols-2 gap-2 flex-1">
                        {[0, 1, 2, 3].map((i) => {
                            const choiceKeys = Object.keys(currentTurnData?.outcomes ?? {});
                            const choiceKey = choiceKeys[i];
                            const displayText = currentTurnData?.choices?.[i] ?? choiceKey;

                            return choiceKey ? (
                                <GenreButton
                                    key={i}
                                    genre={genre}
                                    onClick={() => handleChoice(choiceKey)}
                                    disabled={loading || !!battlePhase}
                                    size="small"
                                    className="text-[11px] leading-tight h-full w-full uppercase font-bold game-text"
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

            {/* ── INVENTORY BAR ── */}
            <div
                className="flex items-center gap-2 px-4 py-2 shrink-0 overflow-x-auto"
                style={{
                    background: 'rgba(0,0,0,0.7)',
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                }}
            >
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest shrink-0 mr-1 game-text font-8bit">
                    Inventory:
                </span>
                {inventoryItems.length === 0 && (
                    <span className="text-[11px] text-white/25 game-text font-8bit">— empty —</span>
                )}
                {inventoryItems.map((item, idx) => (
                    <GenreCard key={idx} genre={genre} className="px-3 py-1 shrink-0">
                        <span className="text-[11px] text-white/80 font-medium whitespace-nowrap game-text font-8bit">
                            {item}
                        </span>
                    </GenreCard>
                ))}
                {Array.from({ length: Math.max(0, 6 - inventoryItems.length) }).map((_, i) => (
                    <div
                        key={`e-${i}`}
                        className="px-3 py-1 rounded-lg shrink-0"
                        style={{ border: '1px dashed rgba(255,255,255,0.12)' }}
                    >
                        <span className="text-[11px] text-white/20 game-text whitespace-nowrap">— empty —</span>
                    </div>
                ))}
            </div>

        </GenreContainer>
    );
};

export default Game;