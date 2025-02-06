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

    const chainWrapperRef = useRef(null);
    const chainWrapperRef2 = useRef(null);
    const block1Ref = useRef(null);
    const block2Ref = useRef(null);
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
        const chosenRef = chosenId === 1 ? block1Ref : block2Ref;
        const otherRef = chosenId === 1 ? block2Ref : block1Ref;

        setDeathCount(prev => prev + 1);

        const tl = gsap.timeline();

        // Drop the chosen block
        tl.to(chosenRef.current, {
            y: '100vh',
            rotation: 360,
            duration: 1.5,
            ease: 'power1.in'
        });

        // Move remaining block and chain right
        tl.to([chainWrapperRef.current, otherRef.current], {
            x: viewportWidth,
            duration: 2,
            ease: 'power1.inOut',
            onComplete: () => {
                // Update dilemma
                setCurrentDilemma((prev) => (prev + 1) % DILEMMAS.length);

                // Reset chain and blocks
                gsap.set(chainWrapperRef.current, { x: -viewportWidth });
                gsap.set([chosenRef.current, otherRef.current], {
                    x: -viewportWidth,
                    y: 0,
                    rotation: 0
                });

                // Move everything back in together
                gsap.to([chainWrapperRef.current, chosenRef.current, otherRef.current], {
                    x: 0,
                    duration: 2,
                    ease: 'power1.inOut'
                });
            }
        });
    };

    return (
        <div className="relative h-screen w-full overflow-hidden bg-gray-900">
            <div className="absolute top-1/4 w-full">
                {/* Chain */}
                <div className="relative overflow-hidden" style={{ height: '40px', width: '100%' }}>
                    <div
                        ref={chainWrapperRef}
                        className="absolute flex"
                        style={{
                            width: `${viewportWidth * 3}px`,  // Three times screen width
                            left: `-${viewportWidth}px`        // Start one screen width to the left
                        }}
                    >
                        {[...Array(Math.ceil((viewportWidth * 3) / 60))].map((_, i) => (
                            <div key={`chain-${i}`} className="flex-none" style={{ width: '60px' }}>
                                <ChainPattern />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Blocks */}
                <div
                    ref={block1Ref}
                    onClick={() => handleChoice(1)}
                    className="absolute left-1/3 -translate-x-1/2 w-24 h-24 border-2"
                    style={{ borderColor: '#FFD700', backgroundColor: 'rgba(17, 24, 39, 0.5)', cursor: 'pointer' }}
                >
                    <div className="absolute top-full w-0.5 h-16 left-1/2 -translate-x-1/2" style={{ backgroundColor: '#FFD700' }} />
                    <div className="p-2 text-center text-sm" style={{ color: '#FFD700' }}>
                        {DILEMMAS[currentDilemma].choice1.text}
                    </div>
                </div>

                <div
                    ref={block2Ref}
                    onClick={() => handleChoice(2)}
                    className="absolute left-2/3 -translate-x-1/2 w-24 h-24 border-2"
                    style={{ borderColor: '#FFD700', backgroundColor: 'rgba(17, 24, 39, 0.5)', cursor: 'pointer' }}
                >
                    <div className="absolute top-full w-0.5 h-16 left-1/2 -translate-x-1/2" style={{ backgroundColor: '#FFD700' }} />
                    <div className="p-2 text-center text-sm" style={{ color: '#FFD700' }}>
                        {DILEMMAS[currentDilemma].choice2.text}
                    </div>
                </div>
            </div>

            <div className="absolute top-4 right-4 text-xl" style={{ color: '#FFD700' }}>
                Souls Released: {deathCount}
            </div>
        </div>
    );
};

export default ChoiceGame;