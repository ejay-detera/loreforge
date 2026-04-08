import React, { useState, useEffect } from 'react';

const TypewriterText = ({ text, speed = 30, className = '' }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTyping, setIsTyping] = useState(true);

    useEffect(() => {
        // Reset when text changes
        setDisplayedText('');
        setCurrentIndex(0);
        setIsTyping(true);
    }, [text]);

    useEffect(() => {
        if (currentIndex < text.length && isTyping) {
            const timeout = setTimeout(() => {
                setDisplayedText(prev => prev + text[currentIndex]);
                setCurrentIndex(prev => prev + 1);
            }, speed);

            return () => clearTimeout(timeout);
        } else if (currentIndex >= text.length) {
            setIsTyping(false);
        }
    }, [currentIndex, text, speed, isTyping]);

    return (
        <span className={className}>
            {displayedText}
            {isTyping && <span className="animate-pulse">|</span>}
        </span>
    );
};

export default TypewriterText;
