import { useState, useCallback, useEffect, useRef } from 'react';
import { router, usePage } from '@inertiajs/react';

const useGame = () => {
    const { props } = usePage();

    const [currentBatch, setCurrentBatch] = useState([]);
    const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
    const [currentHP, setCurrentHP] = useState(100);
    const [currentMP, setCurrentMP] = useState(50);
    const [maxHP, setMaxHP] = useState(100);
    const [maxMP, setMaxMP] = useState(50);
    const [inventory, setInventory] = useState([]);
    const [currentTurn, setCurrentTurn] = useState(0);
    const [maxTurns, setMaxTurns] = useState(20);
    const [session, setSession] = useState(null);
    const [isGameOver, setIsGameOver] = useState(false);
    const [isVictory, setIsVictory] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const batchGenerated = useRef(false);

    const getCsrfToken = () => {
        const meta = document.querySelector('meta[name="csrf-token"]');
        return meta?.getAttribute('content');
    };

    useEffect(() => {
        if (props.initialSession) {
            const s = props.initialSession;
            setSession(s);
            setCurrentHP(s.current_health);
            setCurrentMP(s.current_mana);
            setMaxHP(s.max_health);
            setMaxMP(s.max_mana);
            setCurrentTurn(s.turn_count);
            setMaxTurns(s.max_turns);
            setIsGameOver(s.status !== 'active');
            setIsVictory(s.status === 'victory');
            if (s.inventoryItems) setInventory(s.inventoryItems);
        }
    }, [props.initialSession]);

    const checkAndGenerateBatch = useCallback(async (sessionParam = null) => {
        const activeSession = sessionParam || session;

        // Guard: only generate once per game session
        if (batchGenerated.current || isGameOver || !activeSession) return;
        batchGenerated.current = true;

        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/game/${activeSession.id}/generate-batch`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                batchGenerated.current = false; // Allow retry on failure
                if (response.status === 419) throw new Error('Session expired. Please refresh.');
                throw new Error(await response.text());
            }

            const data = await response.json();

            if (data.success) {
                setCurrentBatch(data.batch.turns);
            } else {
                batchGenerated.current = false; // Allow retry on failure
                setError(data.message || 'Failed to generate turns');
            }
        } catch (err) {
            batchGenerated.current = false; // Allow retry on failure
            console.error('generateBatch error:', err);
            setError('Failed to generate turns');
        } finally {
            setLoading(false);
        }
    }, [isGameOver, session]);

    useEffect(() => {
        if (session && !isGameOver) {
            if (currentBatch.length === 0) {
                console.log('Generating batch for session:', { sessionId: session.id, genre: session.genre });
                checkAndGenerateBatch(session);
            } else if (currentTurnIndex >= currentBatch.length) {
                // Reached the end of the current batch, fetch the next one
                console.log('Batch exhausted. Fetching next batch...');
                batchGenerated.current = false;
                setCurrentBatch([]);
                setCurrentTurnIndex(0);
            }
        }
    }, [session, currentBatch.length, currentTurnIndex, isGameOver, checkAndGenerateBatch]);

    const resolveChoice = useCallback(async (choiceKey) => {
        if (!currentBatch[currentTurnIndex] || loading || isGameOver || !session) return;

        const currentTurnData = currentBatch[currentTurnIndex];

        // ── Guard: make sure the key actually exists in outcomes ──────────
        if (!currentTurnData.outcomes || !currentTurnData.outcomes[choiceKey]) {
            console.error('Choice key not found in outcomes:', {
                choiceKey,
                availableKeys: Object.keys(currentTurnData.outcomes ?? {}),
                outcomes: currentTurnData.outcomes,
            });
            setError('Invalid choice. Please try again.');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await fetch(
                `/api/game/${session.id}/resolve/${currentTurnData.id}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': getCsrfToken(),
                        'Accept': 'application/json',
                    },
                    credentials: 'same-origin',
                    body: JSON.stringify({ choice: choiceKey }),
                }
            );

            if (!response.ok) {
                if (response.status === 419) throw new Error('Session expired.');
                const text = await response.text();
                console.error('resolveTurn HTTP error:', response.status, text);
                throw new Error(text);
            }

            const data = await response.json();

            if (data.success) {
                const s = data.session;
                console.log('Session updated after choice:', {
                    oldGenre: session?.genre,
                    newGenre: s.genre,
                    sessionData: s
                });
                setSession(prev => ({ ...prev, ...s }));
                setCurrentHP(s.current_health);
                setCurrentMP(s.current_mana);
                setCurrentTurn(s.turn_count);
                setIsGameOver(s.is_game_over);
                setIsVictory(s.is_victory);
                setInventory(data.inventory);
                setCurrentTurnIndex(prev => prev + 1);
            } else {
                console.error('resolveTurn server error:', data);
                setError(data.message || 'Resolve failed');
            }
        } catch (err) {
            console.error('resolveChoice error:', err);
            setError(err.message || 'Failed to resolve choice');
        } finally {
            setLoading(false);
        }
    }, [currentBatch, currentTurnIndex, loading, isGameOver, session, checkAndGenerateBatch]);

    const startNewGame = useCallback(async (genre, characterName, maxTurns = 20) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/game/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    genre,
                    character_name: characterName,
                    max_turns: maxTurns,
                }),
            });

            if (!response.ok) {
                if (response.status === 419) throw new Error('Session expired.');
                throw new Error(await response.text());
            }

            const data = await response.json();

            if (data.success) {
                const s = data.session;
                setSession(s);
                setCurrentHP(s.current_health);
                setCurrentMP(s.current_mana);
                setMaxHP(s.max_health);
                setMaxMP(s.max_mana);
                setCurrentTurn(s.turn_count);
                setMaxTurns(s.max_turns);
                setIsGameOver(false);
                setIsVictory(false);
                setInventory(s.inventoryItems || []);
                setCurrentBatch([]);
                setCurrentTurnIndex(0);
                router.visit('/game');
            } else {
                setError(data.message || 'Failed to start');
            }
        } catch (err) {
            console.error('startNewGame error:', err);
            setError('Failed to start game');
        } finally {
            setLoading(false);
        }
    }, []);

    const getCurrentTurn = useCallback(() => {
        return currentBatch[currentTurnIndex] || null;
    }, [currentBatch, currentTurnIndex]);

    const getRemainingTurns = useCallback(() => {
        return Math.max(0, currentBatch.length - currentTurnIndex);
    }, [currentBatch, currentTurnIndex]);

    const resetGame = useCallback(() => {
        setCurrentBatch([]);
        setCurrentTurnIndex(0);
        setCurrentHP(100);
        setCurrentMP(50);
        setMaxHP(100);
        setMaxMP(50);
        setInventory([]);
        setCurrentTurn(0);
        setMaxTurns(20);
        setSession(null);
        setIsGameOver(false);
        setIsVictory(false);
        setError(null);
        batchGenerated.current = false;
    }, []);

    return {
        currentBatch,
        currentTurnIndex,
        currentHP,
        currentMP,
        maxHP,
        maxMP,
        inventory,
        currentTurn,
        maxTurns,
        session,
        isGameOver,
        isVictory,
        loading,
        error,
        currentTurnData: getCurrentTurn(),
        remainingTurns: getRemainingTurns(),
        resolveChoice,
        startNewGame,
        resetGame,
        setError,
        checkAndGenerateBatch,
    };
};

export default useGame;