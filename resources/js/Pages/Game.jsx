import React, { useState, useEffect, useMemo } from 'react';
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
import SoundtrackPlayer from '@/Components/Game/SoundtrackPlayer';

/* ── Enemy name to Sprite filename map ─────────────────────────────────── */
const ENEMY_NAME_TO_SPRITE_MAP = {
    // Fantasy
    'goblin fire thrower': 'Goblin_Fire.gif',
    'goblin demolitionist': 'Goblin_tnt.gif',
    'skeleton archer': 'Skeleton_Archer.png',
    'flaming skull': 'Skeleton_Flaming Skull.png',
    'skeleton king': 'Skeleton_King.png',
    'armored skeleton spearman': 'Skeleton_Spearman Armored.png',
    'armored skeleton swordsman': 'Skeleton_Swordman Armored.png',
    
    // Horror
    'eldritch boss': 'Eldtrich_boss.png',
    'eldritch guardian': 'Eldtrich_guardian.png',
    'eldritch hunter': 'Eldtrich_hunter.png',
    'eldritch minion': 'Eldtrich_minion.png',

    // Sci-fi
    'robot boss': 'Robot_Boss.gif',
    'robot guardian': 'Robot_Guardian.gif',
    'robot pawn': 'Robot_Pawn.gif',
};



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
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);

    useEffect(() => {
        const checkResponsive = () => {
            setIsMobile(window.innerWidth < 640);
            setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024);
        };
        checkResponsive();
        window.addEventListener('resize', checkResponsive);
        return () => window.removeEventListener('resize', checkResponsive);
    }, []);
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
    const [showActionText, setShowActionText] = useState(null);
    const [showScanOverlay, setShowScanOverlay] = useState(false);

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

    const enemySpriteList = useMemo(() => enemySprites[genre] || enemySprites.fantasy, [genre]);

    const matchEnemySprite = (enemyName, list) => {
        if (!enemyName) return null;
        
        const normalizedName = String(enemyName).toLowerCase().trim();
        if (ENEMY_NAME_TO_SPRITE_MAP[normalizedName]) {
            return ENEMY_NAME_TO_SPRITE_MAP[normalizedName];
        }

        const normalize = (value) => String(value)
            .toLowerCase()
            .replace(/\.(gif|png|webp|jpg|jpeg)$/i, '')
            .replace(/eldritch/g, 'eldtrich')
            .replace(/swordsman/g, 'swordman')
            .replace(/[^a-z0-9]+/g, ' ')
            .trim();

        const enemyTokens = normalize(enemyName)
            .split(' ')
            .filter(word => word.length > 2 && !['the', 'and', 'with'].includes(word));

        let bestMatch = null;
        let bestScore = 0;

        list.forEach(sprite => {
            const spriteTokens = normalize(sprite).split(' ').filter(Boolean);
            const score = enemyTokens.reduce((total, token) => (
                spriteTokens.some(spriteToken => spriteToken.includes(token) || token.includes(spriteToken))
                    ? total + 1
                    : total
            ), 0);

            if (score > bestScore) {
                bestScore = score;
                bestMatch = sprite;
            }
        });

        return bestScore > 0 ? bestMatch : null;
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
        setShowEnemyDmg(null);
        setShowPlayerDmg(null);
        setShowActionText(null);
        setShowScanOverlay(false);

        const choiceStr = String(choiceKey).toLowerCase();
        const isAttackAction = ['attack', 'melee', 'strike', 'slash', 'cut', 'thrust', 'assault', 'smash', 'bash', 'charge', 'lunge'].some(term => choiceStr.includes(term));
        const isDodgeAction = !isAttackAction && ['dodge', 'evade', 'roll', 'sidestep', 'counter', 'parry'].some(term => choiceStr.includes(term));
        const isScanAction = !isAttackAction && ['scan', 'analyze', 'analyse', 'inspect'].some(term => choiceStr.includes(term));
        let actionType = outcome.action_type ?? 'attack';
        let actionResult = outcome.action_result ?? 'neutral';
        let healthChange = outcome.health_change ?? 0;
        let manaChange = outcome.mana_change ?? 0;
        let enemyDmg = outcome.enemy_hp_change ?? 0;

        if (isAttackAction) {
            actionType = 'attack';
        } else if (isDodgeAction) {
            actionType = 'utility';
            actionResult = actionResult === 'fail' ? 'fail' : 'success';
            healthChange = Math.min(0, healthChange);
            manaChange = 0;
            if (choiceStr.includes('counter') && enemyDmg === 0) {
                enemyDmg = -20;
            }
        } else if (isScanAction) {
            actionType = 'utility';
            actionResult = 'success';
            healthChange = 0;
            manaChange = 0;
            enemyDmg = 0;
        }

        // Force values if Gemini hallucinated 0
        if (choiceStr.includes('healing potion') || choiceStr.includes('hp potion')) {
            healthChange = Math.max(25, healthChange);
        }
        if (choiceStr.includes('mana potion') || choiceStr.includes('mp potion')) {
            manaChange = Math.max(20, manaChange);
        }

        const playerTakesDamage = healthChange < 0;
        const playerHeals = healthChange > 0;
        const playerRestoresMana = manaChange > 0;

        // ── Determine which battle phase to use ──
        if (actionType === 'item' || actionType === 'heal') {
            // Healing / Mana potion usage
            if (playerHeals) {
                setBattlePhase('player-heal');
                setTimeout(() => {
                    setShowActionText({ text: `+${healthChange} HP`, color: '#10b981' });
                }, 200);
            } else if (playerRestoresMana) {
                setBattlePhase('player-mana');
                setTimeout(() => {
                    setShowActionText({ text: `+${manaChange} MP`, color: '#3b82f6' });
                }, 200);
            } else {
                setBattlePhase('player-heal');
                setTimeout(() => {
                    setShowActionText({ text: 'USED!', color: '#f5c842' });
                }, 200);
            }
            // Item use also deals damage to enemy sometimes (weapon items)
            if (enemyDmg !== 0) {
                setTimeout(() => {
                    setShowEnemyDmg({ value: enemyDmg, color: '#ff4444' });
                    setEnemyHP(prev => Math.max(0, prev + enemyDmg));
                }, 400);
            }
            setTimeout(async () => {
                setBattlePhase(null);
                setShowEnemyDmg(null);
                setShowPlayerDmg(null);
                setShowActionText(null);
                setPendingOutcome(null);
                await resolveChoice(choiceKey);
            }, 1400);

        } else if (actionType === 'utility') {
            // Dodge or Scan
            if (actionResult === 'success') {
                if (isScanAction) {
                    setShowScanOverlay(true);
                    setTimeout(() => {
                        setShowActionText({ text: 'SCANNED!', color: '#00BFFF' });
                    }, 300);
                    setTimeout(async () => {
                        setBattlePhase(null);
                        setShowScanOverlay(false);
                        setShowActionText(null);
                        setPendingOutcome(null);
                        await resolveChoice(choiceKey);
                    }, 1400);
                } else {
                    // Dodge success
                    setBattlePhase('player-dodge');
                    setTimeout(() => {
                        setShowActionText({ text: choiceStr.includes('counter') ? 'COUNTER!' : 'DODGED!', color: '#10b981' });
                    }, 200);
                    if (enemyDmg !== 0) {
                        setTimeout(() => {
                            setBattlePhase('player-attack');
                            setShowEnemyDmg({ value: enemyDmg, color: '#ff4444' });
                            setEnemyHP(prev => Math.max(0, prev + enemyDmg));
                        }, 650);
                    }
                    setTimeout(async () => {
                        setBattlePhase(null);
                        setShowEnemyDmg(null);
                        setShowActionText(null);
                        setPendingOutcome(null);
                        await resolveChoice(choiceKey);
                    }, enemyDmg !== 0 ? 1500 : 1200);
                }
            } else {
                // Dodge/utility failed — player takes damage
                setBattlePhase('player-dodge');
                setTimeout(() => {
                    setShowActionText({ text: 'FAILED!', color: '#ff4444' });
                }, 200);
                setTimeout(() => {
                    if (playerTakesDamage) {
                        setBattlePhase('enemy-attack');
                        setTimeout(() => {
                            setShowPlayerDmg({ value: healthChange, color: '#ff6666' });
                        }, 350);
                    }
                }, 700);
                setTimeout(async () => {
                    setBattlePhase(null);
                    setShowEnemyDmg(null);
                    setShowPlayerDmg(null);
                    setShowActionText(null);
                    setPendingOutcome(null);
                    await resolveChoice(choiceKey);
                }, 1800);
            }

        } else if (actionType === 'flee') {
            setBattlePhase('player-flee');
            if (actionResult === 'success') {
                setTimeout(() => {
                    setShowActionText({ text: 'ESCAPED!', color: '#f5c842' });
                }, 300);
                setTimeout(async () => {
                    setBattlePhase(null);
                    setShowActionText(null);
                    setPendingOutcome(null);
                    await resolveChoice(choiceKey);
                }, 1500);
            } else {
                setTimeout(() => {
                    setShowActionText({ text: 'FAILED!', color: '#ff4444' });
                }, 300);
                setTimeout(() => {
                    if (playerTakesDamage) {
                        setBattlePhase('enemy-attack');
                        setTimeout(() => {
                            setShowPlayerDmg({ value: healthChange, color: '#ff6666' });
                        }, 350);
                    }
                }, 800);
                setTimeout(async () => {
                    setBattlePhase(null);
                    setShowEnemyDmg(null);
                    setShowPlayerDmg(null);
                    setShowActionText(null);
                    setPendingOutcome(null);
                    await resolveChoice(choiceKey);
                }, 1800);
            }

        } else if (actionType === 'defend') {
            setBattlePhase('player-defend');
            setTimeout(() => {
                setShowActionText({ text: 'DEFENDED!', color: '#a78bfa' });
            }, 200);
            if (playerTakesDamage) {
                setTimeout(() => {
                    setShowPlayerDmg({ value: healthChange, color: '#ff6666' });
                }, 500);
            }
            setTimeout(async () => {
                setBattlePhase(null);
                setShowPlayerDmg(null);
                setShowActionText(null);
                setPendingOutcome(null);
                await resolveChoice(choiceKey);
            }, 1400);

        } else if (actionType === 'magic') {
            setBattlePhase('player-magic');

            setTimeout(() => {
                if (enemyDmg !== 0) {
                    setShowEnemyDmg({ value: enemyDmg, color: '#ff4444' });
                    setEnemyHP(prev => Math.max(0, prev + enemyDmg));
                }
            }, 350);

            setTimeout(() => {
                if (playerTakesDamage) {
                    setBattlePhase('enemy-attack');
                    setTimeout(() => {
                        setShowPlayerDmg({ value: healthChange, color: '#ff6666' });
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

        } else {
            // Default: attack — use existing slash + impact effects
            setBattlePhase('player-attack');

            setTimeout(() => {
                if (enemyDmg !== 0) {
                    setShowEnemyDmg({ value: enemyDmg, color: '#ff4444' });
                    setEnemyHP(prev => Math.max(0, prev + enemyDmg));
                }
            }, 350);

            setTimeout(() => {
                if (playerTakesDamage) {
                    setBattlePhase('enemy-attack');
                    setTimeout(() => {
                        setShowPlayerDmg({ value: healthChange, color: '#ff6666' });
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
        }
    };

    const inventoryItems = Array.isArray(inventory)
        ? inventory
            .map(i => (typeof i === 'string' ? i : i?.item_name ?? i?.itemName ?? ''))
            .filter(Boolean)
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
    const playerSpriteSize = isMobile ? '120px' : isTablet ? '150px' : '200px';
    const playerPlatformWidth = isMobile ? '160px' : isTablet ? '200px' : '280px';
    const playerPlatformHeight = isMobile ? '60px' : isTablet ? '75px' : '110px';

    const enemySpriteSize = isMobile ? '80px' : isTablet ? '100px' : '125px';
    const enemyPlatformWidth = isMobile ? '130px' : isTablet ? '160px' : '220px';
    const enemyPlatformHeight = isMobile ? '45px' : isTablet ? '55px' : '80px';

    const playerLeft = isMobile ? '12%' : isTablet ? '18%' : '24%';
    const enemyRight = isMobile ? '12%' : isTablet ? '20%' : '28%';

    const arenaHeight = isMobile ? '30vh' : isTablet ? '38vh' : '42vh';
    const arenaMinHeight = isMobile ? '170px' : isTablet ? '220px' : '260px';
    const arenaMaxHeight = isMobile ? '240px' : isTablet ? '300px' : '340px';

    const enemyStatBoxStyle = isMobile
        ? { top: '8px', left: '8px', width: '150px' }
        : isTablet
        ? { top: '12px', left: '16px', width: '200px' }
        : { top: '12px', left: '16px', width: '280px' };

    const playerStatBoxStyle = isMobile
        ? { bottom: '6%', right: '8px', width: '150px' }
        : isTablet
        ? { bottom: '6%', right: '16px', width: '200px' }
        : { bottom: '6%', right: '16px', width: '230px' };

    return (
        <GenreContainer genre={genre} className="overflow-hidden flex flex-col h-screen">

            <ExitConfirmationModal
                isOpen={showExitModal}
                onClose={() => setShowExitModal(false)}
                onConfirm={() => { setShowExitModal(false); handleGoToNewGame(); }}
                genre={genre}
            />

            {/* Back button */}
            <div className="absolute top-3 right-3 md:top-4 md:right-4 z-30">
                <GenreButton
                    genre={genre}
                    variant="outline"
                    onClick={handleBackButton}
                    size="small"
                    className="flex items-center gap-1.5 px-2 py-1 text-[10px] md:text-xs"
                >
                    <FontAwesomeIcon icon={faArrowLeft} />
                    <span className="hidden xs:inline">Back</span>
                </GenreButton>
            </div>

            {/* Inner scrollable wrapper to prevent vertical clipping on mobile/tablet */}
            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto md:overflow-hidden">

                {/* ── BATTLE ARENA ── */}
                <div
                    className={`relative w-full shrink-0 overflow-hidden ${battlePhase ? 'battle-screen-shake' : ''}`}
                    style={{ height: arenaHeight, minHeight: arenaMinHeight, maxHeight: arenaMaxHeight }}
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
                    className={`absolute z-20 ${spritesLoaded ? 'stat-fade-in' : ''}`}
                    style={enemyStatBoxStyle}
                >
                    <GenreCard genre={genre} className="px-2.5 py-1.5 md:px-3 md:py-2">
                        <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-bold text-white text-[11px] md:text-sm game-text truncate" style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: '1.3' }}>
                                {apiEnemyName || fallbackEnemyName}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[9px] md:text-[10px] font-bold text-red-400 w-4 md:w-5 shrink-0 game-text">HP</span>
                            <div className={`flex-1 ${hpDamage ? 'hp-damage' : ''}`}>
                                <GenreStatBar genre={genre} value={enemyHP} max={ENEMY_MAX_HP} type="enemyHp" />
                            </div>
                        </div>
                    </GenreCard>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                        <GenreCard genre={genre} className="px-2 py-0.5 md:px-2.5 md:py-1 text-[9px] md:text-[10px] font-mono">
                            <span className="text-white/60 game-text">Turn</span>{' '}
                            <span className="font-bold text-white game-text">{currentTurn}</span>
                            <span className="text-white/60 game-text">/{maxTurns}</span>
                        </GenreCard>
                        <GenreCard genre={genre} className="px-2 py-0.5 md:px-2.5 md:py-1 text-[9px] md:text-[10px] font-bold">
                            <span className="game-text">{genreLabel}</span>
                        </GenreCard>
                    </div>
                </div>

                {/* ── ENEMY SPRITE ── */}
                <div
                    className={`absolute z-10 ${spritesLoaded ? 'slide-in-right bounce-in' : ''} ${(battlePhase === 'player-attack' || battlePhase === 'player-magic') ? 'battle-enemy-hit' : ''} ${battlePhase === 'enemy-attack' ? 'battle-enemy-attack' : ''}`}
                    style={{
                        bottom: 'calc(45% - 18px)',
                        right: enemyRight,
                    }}
                >
                    <img
                        key={`${genre}-${enemySprite}`}
                        src={`/Sprites/${genreFolder}/${enemySprite}`}
                        alt={apiEnemyName || fallbackEnemyName}
                        draggable={false}
                        className="rounded-lg sprite"
                        style={{
                            width: enemySpriteSize,
                            height: enemySpriteSize,
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.6))',
                            position: 'absolute',
                            bottom: '5px',
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
                            width: enemyPlatformWidth,
                            height: enemyPlatformHeight,
                        }}
                    />

                    {/* Floating damage number on enemy */}
                    {showEnemyDmg && (
                        <div
                            key={`edm-${currentTurn}-${Date.now()}`}
                            className="battle-damage-number text-xs md:text-sm"
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
                        <div className="battle-impact-burst" style={{ top: 'calc(25% - 30px)', right: `calc(${enemyRight} + 40px)` }} />
                        <div className="battle-slash-left" style={{ top: 'calc(25% - 30px)', right: `calc(${enemyRight} + 10px)` }} />
                        <div className="battle-slash-right" style={{ top: 'calc(25% - 20px)', right: `calc(${enemyRight} + 20px)` }} />
                    </>
                )}

                {/* ── IMPACT EFFECTS (on player position) ── */}
                {battlePhase === 'enemy-attack' && (
                    <>
                        <div className="battle-screen-flash" />
                        <div className="battle-impact-burst" style={{ top: 'calc(60%)', left: `calc(${playerLeft} + 50px)` }} />
                        <div className="battle-slash-left" style={{ top: 'calc(60%)', left: `calc(${playerLeft} + 20px)` }} />
                        <div className="battle-slash-right" style={{ top: 'calc(60% + 10px)', left: `calc(${playerLeft} + 30px)` }} />
                    </>
                )}

                {/* ── SCAN OVERLAY EFFECT ── */}
                {showScanOverlay && (
                    <div className="battle-scan-overlay" key={`scan-${currentTurn}-${Date.now()}`} />
                )}

                {/* ── MAGIC PROJECTILE EFFECT ── */}
                {battlePhase === 'player-magic' && (
                    <div
                        className="battle-projectile-container"
                        style={{
                            position: 'absolute',
                            inset: 0,
                            pointerEvents: 'none',
                            zIndex: 25,
                            '--player-x': `calc(${playerLeft} + ${playerSpriteSize} / 2)`,
                            '--player-y': '60%',
                            '--enemy-x': `calc(100% - ${enemyRight} - ${enemySpriteSize} / 2)`,
                            '--enemy-y': '45%',
                        }}
                    >
                        {genre === 'fantasy' && (
                            <div className="battle-magic-fireball" />
                        )}
                        {genre === 'scifi' && (
                            <div className="battle-magic-laser-wrapper">
                                <div className="battle-magic-laser-charge" />
                                <div className="battle-magic-laser-beam">
                                    <div className="battle-magic-laser-core" />
                                </div>
                                <div className="battle-magic-laser-impact" />
                            </div>
                        )}
                        {genre === 'horror' && (
                            <div className="battle-magic-rocket" />
                        )}
                    </div>
                )}

                {/* ── PLAYER SPRITE ── */}
                <div
                    className={`absolute z-10 ${spritesLoaded ? 'slide-in-left bounce-in' : ''} ${battlePhase === 'player-attack' ? 'battle-player-attack' : ''} ${battlePhase === 'player-magic' ? 'battle-player-magic' : ''} ${battlePhase === 'enemy-attack' ? 'battle-player-hit' : ''} ${battlePhase === 'player-heal' ? 'battle-player-heal' : ''} ${battlePhase === 'player-mana' ? 'battle-player-mana' : ''} ${battlePhase === 'player-dodge' ? 'battle-player-dodge' : ''} ${battlePhase === 'player-flee' ? 'battle-player-flee' : ''} ${battlePhase === 'player-defend' ? 'battle-player-defend' : ''}`}
                    style={{
                        bottom: 'calc(10% - 30px)',
                        left: playerLeft,
                    }}
                >
                    <img
                        src={`/Sprites/${genreFolder}/${playerSprite}`}
                        alt={charName}
                        draggable={false}
                        className="rounded-lg sprite"
                        style={{
                            width: playerSpriteSize,
                            height: playerSpriteSize,
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.7))',
                            position: 'absolute',
                            bottom: '10px',
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
                            width: playerPlatformWidth,
                            height: playerPlatformHeight,
                        }}
                    />

                    {/* Floating damage number on player */}
                    {showPlayerDmg && (
                        <div
                            key={`pdm-${currentTurn}-${Date.now()}`}
                            className="battle-damage-number text-xs md:text-sm"
                            style={{ top: '10px', left: '50%', transform: 'translateX(-50%)', color: showPlayerDmg.color }}
                        >
                            {showPlayerDmg.value}
                        </div>
                    )}

                    {/* Floating action text (DODGED!, HEALED!, ESCAPED!, etc.) */}
                    {showActionText && (
                        <div
                            key={`act-${currentTurn}-${Date.now()}`}
                            className="battle-action-text text-xs md:text-sm"
                            style={{ top: '-15px', left: '50%', transform: 'translateX(-50%)', color: showActionText.color }}
                        >
                            {showActionText.text}
                        </div>
                    )}
                </div>

                {/* ── PLAYER STAT BOX — bottom RIGHT ── */}
                <div
                    className={`absolute z-20 ${spritesLoaded ? 'stat-fade-in' : ''}`}
                    style={playerStatBoxStyle}
                >
                    <GenreCard genre={genre} className="px-2.5 py-1.5 md:px-4 md:py-2.5">
                        <div className="flex items-center justify-between mb-1.5 md:mb-2">
                            <span className="font-bold text-white text-[11px] md:text-sm truncate max-w-[90px] md:max-w-[130px] game-text font-8bit">
                                {charName}
                            </span>
                            <span className="text-[9px] md:text-xs text-white/50 shrink-0 game-text font-8bit">Lv.{charLevel}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mb-1 md:mb-1.5">
                            <span className="text-[9px] md:text-[10px] font-bold text-green-400 w-4 md:w-5 shrink-0 game-text font-8bit">HP</span>
                            <div className={`flex-1 ${hpDamage ? 'hp-damage' : ''}`}>
                                <GenreStatBar genre={genre} value={currentHP} max={maxHP} type="hp" />
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[9px] md:text-[10px] font-bold text-blue-400 w-4 md:w-5 shrink-0 game-text font-8bit">MP</span>
                            <div className={`flex-1 ${mpDamage ? 'mp-damage' : ''}`}>
                                <GenreStatBar genre={genre} value={currentMP} max={maxMP} type="mp" />
                            </div>
                        </div>
                        <div className="flex justify-between text-[8px] md:text-[10px] text-white/40 mt-0.5">
                            <span className="game-text font-8bit">{currentHP}/{maxHP}</span>
                            <span className="game-text font-8bit">{currentMP}/{maxMP}</span>
                        </div>
                    </GenreCard>
                </div>
            </div>

            {/* ── BOTTOM PANEL ── */}
            <div
                className="flex flex-col md:flex-row border-t-2 flex-1 min-h-0"
                style={{ borderColor: 'rgba(255,255,255,0.1)' }}
            >
                {/* LEFT — dialog / story text */}
                <div className="flex-1 p-2.5 md:p-4 flex flex-col min-w-0 min-h-0 bg-black/50 backdrop-blur">
                    <p className="text-[9px] md:text-xs font-bold text-white/50 uppercase tracking-widest mb-1 md:mb-2 game-text">
                        What will <span style={{ color: 'var(--accent, #C9A84C)' }}>{charName}</span> do?
                    </p>
                    <div
                        className="flex-1 overflow-y-auto pr-1"
                        style={{
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '8px',
                            padding: isMobile ? '6px 8px' : '8px 10px',
                            background: 'rgba(0,0,0,0.3)',
                        }}
                    >
                        {currentTurnData ? (
                            <p className="text-white/85 text-xs md:text-sm leading-relaxed game-text">
                                <TypewriterText key={textKey} text={currentTurnData.story_text} speed={25} />
                            </p>
                        ) : (
                            <p className="text-white/30 text-xs md:text-sm italic game-text">[ Story text appears here... ]</p>
                        )}
                    </div>
                </div>

                {/* Divider */}
                <div className="hidden md:block w-[1px]" style={{ background: 'rgba(255,255,255,0.08)' }} />
                <div className="block md:hidden h-[1px] w-full" style={{ background: 'rgba(255,255,255,0.08)' }} />

                {/* RIGHT — 2×2 choice buttons */}
                <div className="shrink-0 p-2.5 md:p-3 flex flex-col bg-black/60 backdrop-blur w-full md:w-[260px]">
                    <p className="text-center text-[9px] md:text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 md:mb-1.5 game-text">
                        Choose Action
                    </p>
                    <div className="grid grid-cols-2 gap-1.5 md:gap-2 flex-1 min-h-[76px] md:min-h-0">
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
                                    className="px-1 md:px-1.5 text-[9px] md:text-[10px] leading-snug h-full w-full uppercase font-bold tracking-normal text-center break-words hyphens-auto game-text min-h-[36px] md:min-h-0"
                                    title={displayText}
                                >
                                    {displayText}
                                </GenreButton>
                            ) : (
                                <div
                                    key={i}
                                    className="rounded-lg flex items-center justify-center text-white/15 text-[10px] min-h-[36px] md:min-h-0"
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
                className="flex items-center gap-1.5 px-2.5 py-1 md:px-4 md:py-2 shrink-0 overflow-x-auto"
                style={{
                    background: 'rgba(0,0,0,0.7)',
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                }}
            >
                <span className="text-[9px] md:text-[10px] font-bold text-white/40 uppercase tracking-widest shrink-0 mr-1 game-text font-8bit">
                    Inventory:
                </span>
                {inventoryItems.length === 0 && (
                    <span className="text-[10px] md:text-[11px] text-white/25 game-text font-8bit">— empty —</span>
                )}
                {inventoryItems.map((item, idx) => (
                    <GenreCard key={idx} genre={genre} className="px-2.5 py-0.5 md:px-3 md:py-1 shrink-0">
                        <span className="text-[10px] md:text-[11px] text-white/80 font-medium whitespace-nowrap game-text font-8bit">
                            {item}
                        </span>
                    </GenreCard>
                ))}
                {Array.from({ length: Math.max(0, 6 - inventoryItems.length) }).map((_, i) => (
                    <div
                        key={`e-${i}`}
                        className="px-2.5 py-0.5 md:px-3 md:py-1 rounded-lg shrink-0"
                        style={{ border: '1px dashed rgba(255,255,255,0.12)' }}
                    >
                        <span className="text-[10px] md:text-[11px] text-white/20 game-text whitespace-nowrap">— empty —</span>
                    </div>
                ))}
            </div>

            </div>

            {/* ── SOUNDTRACK PLAYER ── */}
            <SoundtrackPlayer genre={genre} />

        </GenreContainer>
    );
};

export default Game;
