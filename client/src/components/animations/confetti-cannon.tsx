import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  velocityX: number;
  velocityY: number;
  gravity: number;
}

interface ConfettiCannonProps {
  isActive: boolean;
  duration?: number;
  intensity?: number;
  onComplete?: () => void;
  trigger?: 'review' | 'sale' | 'milestone' | 'achievement';
}

const CONFETTI_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', 
  '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA'
];

const TRIGGER_MESSAGES = {
  review: '🌟 Great Review Received!',
  sale: '💰 Sale Completed!',
  milestone: '🎯 Milestone Achieved!',
  achievement: '🏆 Achievement Unlocked!'
};

export default function ConfettiCannon({ 
  isActive, 
  duration = 3000, 
  intensity = 50,
  onComplete,
  trigger = 'review'
}: ConfettiCannonProps) {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [showMessage, setShowMessage] = useState(false);

  const createConfettiPiece = (id: number): ConfettiPiece => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    return {
      id,
      x: centerX + (Math.random() - 0.5) * 200,
      y: centerY - 100,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: Math.random() * 8 + 4,
      rotation: Math.random() * 360,
      velocityX: (Math.random() - 0.5) * 10,
      velocityY: Math.random() * -15 - 5,
      gravity: Math.random() * 0.3 + 0.2,
    };
  };

  useEffect(() => {
    if (!isActive) return;

    // Show celebration message
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 2000);

    // Create initial confetti burst
    const initialConfetti = Array.from({ length: intensity }, (_, i) => 
      createConfettiPiece(i)
    );
    setConfetti(initialConfetti);

    // Animation loop
    const animationInterval = setInterval(() => {
      setConfetti(prev => 
        prev.map(piece => ({
          ...piece,
          x: piece.x + piece.velocityX,
          y: piece.y + piece.velocityY,
          velocityY: piece.velocityY + piece.gravity,
          rotation: piece.rotation + 5,
        })).filter(piece => piece.y < window.innerHeight + 50)
      );
    }, 16);

    // Add more confetti pieces periodically
    const burstInterval = setInterval(() => {
      setConfetti(prev => [
        ...prev,
        ...Array.from({ length: Math.floor(intensity / 4) }, (_, i) => 
          createConfettiPiece(prev.length + i)
        )
      ]);
    }, 300);

    // Cleanup after duration
    const cleanup = setTimeout(() => {
      clearInterval(animationInterval);
      clearInterval(burstInterval);
      setConfetti([]);
      onComplete?.();
    }, duration);

    return () => {
      clearInterval(animationInterval);
      clearInterval(burstInterval);
      clearTimeout(cleanup);
    };
  }, [isActive, duration, intensity, onComplete]);

  if (!isActive && confetti.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Celebration Message */}
      <AnimatePresence>
        {showMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -50 }}
            transition={{ duration: 0.5, ease: "backOut" }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border px-6 py-4 text-center">
              <h2 className="text-2xl font-bold text-primary mb-2">
                {TRIGGER_MESSAGES[trigger]}
              </h2>
              <p className="text-gray-600">Keep up the great work!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confetti Pieces */}
      {confetti.map(piece => (
        <motion.div
          key={piece.id}
          className="absolute"
          style={{
            left: piece.x,
            top: piece.y,
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg)`,
            borderRadius: Math.random() > 0.5 ? '50%' : '0%',
          }}
          initial={{ opacity: 1 }}
          animate={{ opacity: piece.y > window.innerHeight * 0.8 ? 0 : 1 }}
        />
      ))}

      {/* Sparkle Effect */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.1) 0%, transparent 70%)`,
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Hook for easy confetti triggering
export function useConfetti() {
  const [isActive, setIsActive] = useState(false);

  const trigger = (type: 'review' | 'sale' | 'milestone' | 'achievement' = 'review') => {
    setIsActive(true);
    // Auto-reset after a delay to allow re-triggering
    setTimeout(() => setIsActive(false), 100);
  };

  return { isActive, trigger };
}