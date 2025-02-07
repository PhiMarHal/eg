import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { DILEMMAS } from '../dilemmas';

const ChoiceGame = () => {
    const [gameState, setGameState] = useState('intro');
    const [currentDilemma, setCurrentDilemma] = useState(0);
    const [deathCount, setDeathCount] = useState(0);

    const text1Ref = useRef(null);
    const text2Ref = useRef(null);
    const messageRef = useRef(null);

    // Add intro animation
    useEffect(() => {
        if (gameState === 'intro') {
            gsap.to('.intro-text', {
                y: -200,
                duration: 2,
                ease: 'power2.inOut',
                onComplete: () => setGameState('playing')
            });
        }
    }, []);

    const [isAnimating, setIsAnimating] = useState(false);  // Add this state

    const handleChoice = (chosenId) => {
        if (isAnimating) return;

        const chosenRef = chosenId === 1 ? text1Ref : text2Ref;
        const otherRef = chosenId === 1 ? text2Ref : text1Ref;

        setIsAnimating(true);
        setDeathCount(prev => prev + 1);

        const tl = gsap.timeline();

        // First let both current words finish their animations completely
        tl.to(chosenRef.current, {
            y: '200vh',
            rotation: 360,
            duration: 2,
            ease: 'power1.in'
        });

        tl.to(otherRef.current, {
            y: -75,
            opacity: 0,
            duration: 1,
            ease: 'power1.inOut'
        }, "-=1");

        // After both words are gone, update to next dilemma and fade in new words
        tl.add(() => {
            setCurrentDilemma((prev) => (prev + 1) % DILEMMAS.length);
            // Set new words to starting position but invisible
            gsap.set([text1Ref.current, text2Ref.current], {
                y: 0,
                rotation: 0,
                scale: 1,
                opacity: 0
            });
        });

        // Fade in new words
        tl.to([text1Ref.current, text2Ref.current], {
            opacity: 1,
            duration: 0.8,
            ease: 'power1.inOut',
            onComplete: () => setIsAnimating(false)
        });
    };

    const goldStyle = { color: '#FFD700' };

    return (
        <div className="relative h-screen w-full overflow-hidden bg-gray-900">
            {gameState === 'intro' && (
                <div
                    className="intro-text absolute inset-0 flex items-center justify-center text-4xl font-bold"
                    style={goldStyle}
                >
                    Choose Their Fate
                </div>
            )}

            {gameState !== 'intro' && (
                <>
                    <div className="absolute inset-0 flex items-center justify-center gap-32">
                        <div
                            ref={text1Ref}
                            className="cursor-pointer text-2xl hover:scale-110 transition-transform"
                            style={goldStyle}
                            onClick={() => handleChoice(1)}
                        >
                            {DILEMMAS[currentDilemma].choice1.text}
                        </div>
                        <div
                            ref={text2Ref}
                            className="cursor-pointer text-2xl hover:scale-110 transition-transform"
                            style={goldStyle}
                            onClick={() => handleChoice(2)}
                        >
                            {DILEMMAS[currentDilemma].choice2.text}
                        </div>
                    </div>

                    <div
                        className="absolute top-4 right-4 text-xl"
                        style={goldStyle}
                    >
                        Souls Released: {deathCount}
                    </div>

                    <div
                        ref={messageRef}
                        className="absolute inset-0 flex items-center justify-center opacity-0 pointer-events-none"
                    >
                        <div
                            className="text-4xl font-bold"
                            style={goldStyle}
                        >
                            {deathCount} souls sent to the void... KEEP. GOING.
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ChoiceGame;