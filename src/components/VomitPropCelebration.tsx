'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface VomitPropCelebrationProps {
  prediction: 'yes' | 'no';
  onDismiss: () => void;
}

export function VomitPropCelebration({ prediction, onDismiss }: VomitPropCelebrationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const isYes = prediction === 'yes';

  // Auto-dismiss after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss();
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss();
    }, 300);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 z-40"
        onClick={handleDismiss}
      />

      {/* Image container with neon border */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative w-full h-full max-w-5xl max-h-screen rounded-3xl overflow-hidden"
          style={{
            border: `6px solid ${isYes ? 'rgb(236, 72, 153)' : 'rgb(34, 197, 94)'}`,
            boxShadow: isYes
              ? '0 0 40px rgba(236, 72, 153, 0.8), 0 0 80px rgba(236, 72, 153, 0.6), inset 0 0 30px rgba(236, 72, 153, 0.3)'
              : '0 0 40px rgba(34, 197, 94, 0.8), 0 0 80px rgba(34, 197, 94, 0.6), inset 0 0 30px rgba(34, 197, 94, 0.3)',
            animation: 'neonGlow 1.5s ease-in-out infinite',
          }}
        >
          <Image
            src={isYes ? '/images/annie/annie-angry.jpg' : '/images/annie/annie-happy.jpg'}
            alt={isYes ? 'Angry Annie' : 'Happy Annie'}
            fill
            className="object-cover"
            priority
            unoptimized
          />
        </div>
      </div>

      <style>{`
        @keyframes neonGlow {
          0%, 100% {
            box-shadow: 0 0 40px rgba(${isYes ? '236, 72, 153' : '34, 197, 94'}, 0.8),
                        0 0 80px rgba(${isYes ? '236, 72, 153' : '34, 197, 94'}, 0.6),
                        inset 0 0 30px rgba(${isYes ? '236, 72, 153' : '34, 197, 94'}, 0.3);
          }
          50% {
            box-shadow: 0 0 60px rgba(${isYes ? '236, 72, 153' : '34, 197, 94'}, 1),
                        0 0 120px rgba(${isYes ? '236, 72, 153' : '34, 197, 94'}, 0.8),
                        inset 0 0 50px rgba(${isYes ? '236, 72, 153' : '34, 197, 94'}, 0.5);
          }
        }
      `}</style>
    </>
  );
}
