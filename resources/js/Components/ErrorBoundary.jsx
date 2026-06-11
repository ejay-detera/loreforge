import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { router } from '@inertiajs/react';
import GenreContainer, { GenreCard, GenreButton } from './Game/GenreContainer';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            const genre = this.props.genre || 'fantasy';
            return (
                <GenreContainer genre={genre}>
                    <div className="flex items-center justify-center min-h-screen p-6">
                        <GenreCard genre={genre} className="max-w-md w-full p-8 text-center">
                            <div className="text-5xl mb-4 text-red-400">
                                <FontAwesomeIcon icon={faExclamationTriangle} />
                            </div>
                            <h2 className="text-xl font-bold text-red-400 mb-2 game-text">Critical Error</h2>
                            <p className="text-white/70 text-sm mb-6 game-text">
                                The reality of this adventure has collapsed. Please return to the dashboard.
                            </p>
                            <GenreButton genre={genre} onClick={() => router.visit('/dashboard')}>
                                Return to Dashboard
                            </GenreButton>
                        </GenreCard>
                    </div>
                </GenreContainer>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
