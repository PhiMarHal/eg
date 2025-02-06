import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';





const DILEMMAS = [
    {
        id: 1,
        choice1: { text: "Save the puppy" },
        choice2: { text: "Save the kitten" }
    },
    {
        id: 2,
        choice1: { text: "Save the doctor" },
        choice2: { text: "Save the teacher" }
    }
];

const blockStyle = {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(17, 24, 39, 0.5)',
    cursor: 'pointer'
};

const ChoiceGame = () => {

    const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
    const [gameState, setGameState] = useState('playing');
    const [currentDilemma, setCurrentDilemma] = useState(0);
    const [deathCount, setDeathCount] = useState(0);

    // Original refs for current boxes
    const currentBlock1Ref = useRef(null);
    const currentBlock2Ref = useRef(null);
    // New refs for next boxes
    const nextBlock1Ref = useRef(null);
    const nextBlock2Ref = useRef(null);

    const chainWrapperRef = useRef(null);
    const messageRef = useRef(null);

    // Add an effect to update it if window is resized
    useEffect(() => {
        const handleResize = () => setViewportWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const ChainPattern = () => (
        <svg className="h-10" viewBox="0 0 60 40" preserveAspectRatio="none">
            <path d="M0,20 Q15,0 30,20 T60,20" fill="none" stroke="#FFD700" strokeWidth="2" />
            <path d="M0,20 Q15,40 30,20 T60,20" fill="none" stroke="#FFD700" strokeWidth="2" />
        </svg>
    );

    const handleChoice = (chosenId) => {
        const chosenRef = chosenId === 1 ? currentBlock1Ref : currentBlock2Ref;
        const otherRef = chosenId === 1 ? currentBlock2Ref : currentBlock1Ref;

        setDeathCount(prev => prev + 1);

        // Prepare next boxes immediately
        setCurrentDilemma((prev) => (prev + 1) % DILEMMAS.length);

        // Position next boxes off-screen left
        gsap.set([nextBlock1Ref.current, nextBlock2Ref.current], {
            x: -viewportWidth,
            y: 0,
            visibility: 'visible',
            pointerEvents: 'none'  // Ensure they're not clickable yet
        });

        const tl = gsap.timeline();

        // Drop the chosen block (removed translation)
        tl.to(chosenRef.current, {
            y: '100vh',
            rotation: 360,
            duration: 1.5,
            ease: 'power1.in'
        });

        // Move chain and remaining box together
        tl.to([
            chainWrapperRef.current,
            otherRef.current,
            nextBlock1Ref.current,
            nextBlock2Ref.current
        ], {
            x: `+=${viewportWidth}`,
            duration: 2,
            ease: 'power1.inOut',
            onComplete: () => {
                // Reset chain
                gsap.set(chainWrapperRef.current, { x: 0 });

                // Reset and hide current boxes
                gsap.set([currentBlock1Ref.current, currentBlock2Ref.current], {
                    visibility: 'hidden',
                    pointerEvents: 'none'
                });

                // Move next boxes to current position and make them clickable
                gsap.set([nextBlock1Ref.current, nextBlock2Ref.current], {
                    x: 0,
                    visibility: 'visible',
                    pointerEvents: 'auto'  // Make them clickable
                });

                // Swap refs' contents
                [currentBlock1Ref.current, nextBlock1Ref.current] =
                    [nextBlock1Ref.current, currentBlock1Ref.current];
                [currentBlock2Ref.current, nextBlock2Ref.current] =
                    [nextBlock2Ref.current, currentBlock2Ref.current];
            }
        }, "-=1.3");  // Start chain movement before drop finishes
    };


    return (
        <div className="relative h-screen w-full overflow-hidden bg-gray-900">
            {gameState === 'intro' && (
                <div className="intro-text absolute inset-0 flex items-center justify-center text-4xl font-bold text-gold">
                    Choose Their Fate
                </div>
            )}

            {gameState !== 'intro' && (
                <>
                    {/* Chain */}
                    <div className="relative overflow-hidden" style={{ height: '40px', width: '100%' }}>
                        <div
                            ref={chainWrapperRef}
                            className="absolute flex"
                            style={{
                                width: `${viewportWidth * 3}px`,
                                left: `-${viewportWidth}px`
                            }}
                        >
                            {[...Array(Math.ceil((viewportWidth * 3) / 60))].map((_, i) => (
                                <div key={i} className="flex-none" style={{ width: '60px' }}>
                                    <ChainPattern />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Current Boxes */}
                    <div
                        ref={currentBlock1Ref}
                        className="absolute left-1/3 -translate-x-1/2 w-24 h-24 cursor-pointer hover:scale-105 transition-transform bg-gray-900/50"
                        style={{
                            borderWidth: '2px',
                            borderColor: '#FFD700',
                            color: '#FFD700'
                        }}
                        onClick={() => handleChoice(1)}
                    >
                        <div
                            className="absolute top-full w-0.5 h-16 left-1/2 -translate-x-1/2"
                            style={{ backgroundColor: '#FFD700' }}
                        />
                        <div className="p-2 text-center text-sm" style={{ color: '#FFD700' }}>
                            {DILEMMAS[currentDilemma].choice1.text}
                        </div>
                    </div>
                    <div
                        ref={currentBlock2Ref}
                        className="absolute left-2/3 -translate-x-1/2 w-24 h-24 border-2 border-gold cursor-pointer hover:scale-105 transition-transform bg-gray-900/50"
                        style={{
                            borderWidth: '2px',
                            borderColor: '#FFD700',
                            color: '#FFD700'
                        }}
                        onClick={() => handleChoice(2)}
                    >
                        <div className="absolute top-full w-0.5 h-16 left-1/2 -translate-x-1/2 bg-gold"
                            style={{ backgroundColor: '#FFD700' }} />
                        <div className="p-2 text-center text-sm text-gold" style={{ color: '#FFD700', borderColor: '#FFD700' }}>
                            {DILEMMAS[currentDilemma].choice2.text}
                        </div>
                    </div>

                    {/* Next Boxes (initially hidden) */}
                    <div
                        ref={nextBlock1Ref}
                        className="absolute left-1/3 -translate-x-1/2 w-24 h-24 border-2 border-gold bg-gray-900/50 invisible"
                        style={{
                            borderWidth: '2px',
                            borderColor: '#FFD700',
                            color: '#FFD700'
                        }}
                        onClick={() => handleChoice(1)}
                    >
                        <div className="absolute top-full w-0.5 h-16 left-1/2 -translate-x-1/2 bg-gold"
                            style={{ backgroundColor: '#FFD700' }} />
                        <div className="p-2 text-center text-sm text-gold" style={{ color: '#FFD700', borderColor: '#FFD700' }}>
                            {DILEMMAS[currentDilemma].choice1.text}
                        </div>
                    </div>
                    <div
                        ref={nextBlock2Ref}
                        className="absolute left-2/3 -translate-x-1/2 w-24 h-24 border-2 border-gold bg-gray-900/50 invisible"
                        style={{
                            borderWidth: '2px',
                            borderColor: '#FFD700',
                            color: '#FFD700'
                        }}
                        onClick={() => handleChoice(2)}
                    >
                        <div className="absolute top-full w-0.5 h-16 left-1/2 -translate-x-1/2 bg-gold"
                            style={{ backgroundColor: '#FFD700' }} />
                        <div className="p-2 text-center text-sm text-gold" style={{ color: '#FFD700', borderColor: '#FFD700' }}>
                            {DILEMMAS[currentDilemma].choice2.text}
                        </div>
                    </div>

                    {/* Death Count */}
                    <div className="absolute top-4 right-4 text-xl text-gold" style={{ color: '#FFD700', borderColor: '#FFD700' }}>
                        Souls Released: {deathCount}
                    </div>

                    {/* Message */}
                    <div
                        ref={messageRef}
                        className="absolute inset-0 flex items-center justify-center opacity-0 pointer-events-none"
                    >
                        <div className="text-4xl font-bold text-gold" style={{ color: '#FFD700', borderColor: '#FFD700' }}>
                            {deathCount} souls sent to the void... KEEP. GOING.
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ChoiceGame;