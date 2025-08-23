"use client";

import { useGame } from "./GameProvider";
import { useState, useEffect } from "react";

const rewards = [
  {
    id: "rainbow-fuel",
    name: "Rainbow Fuel Tank",
    icon: "🌈",
    description:
      "Magical rainbow fuel that powers your rocket with colorful energy!",
  },
  {
    id: "butterfly-engine",
    name: "Butterfly Engine",
    icon: "🦋",
    description: "A delicate but powerful engine inspired by butterfly wings!",
  },
  {
    id: "crystal-coating",
    name: "Crystal Coating",
    icon: "💎",
    description:
      "Beautiful crystal coating that makes your rocket sparkle and shine!",
  },
  {
    id: "angel-wings",
    name: "Angel Wings",
    icon: "👼",
    description:
      "Graceful angel wings that help your rocket soar through the stars!",
  },
  {
    id: "stardust-parachute",
    name: "Stardust Parachute",
    icon: "⭐",
    description: "A magical parachute made of stardust for safe landings!",
  },
  {
    id: "crystal-antenna",
    name: "Crystal Antenna",
    icon: "💎",
    description:
      "A crystal antenna that helps you communicate with distant stars!",
  },
];

export default function Victory() {
  const { state, dispatch } = useGame();
  const [showReward, setShowReward] = useState(false);
  const [confetti, setConfetti] = useState<
    Array<{ id: number; x: number; y: number; color: string }>
  >([]);
  const [aiMessage, setAiMessage] = useState("");

  // Generate random reward
  const currentReward = rewards[Math.floor(Math.random() * rewards.length)];

  useEffect(() => {
    // Show reward after a short delay
    const timer = setTimeout(() => {
      setShowReward(true);
    }, 1000);

    // Generate confetti
    const confettiArray = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10,
      color: ["#ff6b9d", "#c44569", "#f8a5c2", "#f9ca24", "#f0932b", "#eb4d4b"][
        Math.floor(Math.random() * 6)
      ],
    }));
    setConfetti(confettiArray);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (showReward) {
      setAiMessage(
        `Amazing! You've unlocked the ${currentReward.name}! This magical part will help you reach even greater heights in your next adventure! ✨`
      );
    }
  }, [showReward, currentReward.name]);

  const handleContinueToMap = () => {
    // Unlock the reward
    dispatch({
      type: "UPDATE_PROGRESS",
      payload: {
        unlockedParts: [
          ...state.playerProgress.unlockedParts,
          currentReward.id,
        ],
        starsCollected: state.playerProgress.starsCollected + 1,
      },
    });
    dispatch({ type: "SET_VIEW", payload: "level-map" });
  };

  const handleCustomizeRocket = () => {
    // Unlock the reward
    dispatch({
      type: "UPDATE_PROGRESS",
      payload: {
        unlockedParts: [
          ...state.playerProgress.unlockedParts,
          currentReward.id,
        ],
        starsCollected: state.playerProgress.starsCollected + 1,
      },
    });
    dispatch({ type: "SET_VIEW", payload: "rocket-builder" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900 relative overflow-hidden">
      {/* Background Stars */}
      <div className="absolute inset-0">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Confetti Animation */}
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="absolute w-2 h-2 animate-bounce"
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            backgroundColor: piece.color,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${3 + Math.random() * 2}s`,
          }}
        />
      ))}

      {/* Planet Background */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-64 h-64 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full animate-pulse shadow-2xl shadow-pink-500/50"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        {/* Victory Message */}
        <div className="text-center mb-12">
          <div className="text-8xl mb-6 animate-bounce">🎉</div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 animate-pulse">
            Mission Complete!
          </h1>
          <p className="text-2xl text-pink-200 font-light mb-2">
            You've successfully reached your destination!
          </p>
          <p className="text-lg text-blue-200 font-light">
            Your courage and creativity made this possible! 🌟
          </p>
        </div>

        {/* Reward Popup */}
        {showReward && (
          <div className="bg-black/40 backdrop-blur-sm rounded-3xl p-8 border-2 border-pink-400/50 shadow-2xl shadow-pink-500/25 mb-8 animate-pulse">
            <div className="text-center">
              <div className="text-6xl mb-4">{currentReward.icon}</div>
              <h2 className="text-3xl font-bold text-white mb-2">
                You Unlocked:
              </h2>
              <h3 className="text-2xl font-bold text-pink-400 mb-4">
                {currentReward.name}
              </h3>
              <p className="text-white/80 text-lg max-w-md">
                {currentReward.description}
              </p>
            </div>
          </div>
        )}

        {/* AI Assistant */}
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-pink-400/30 max-w-md mb-8">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-2xl">
              🌙
            </div>
            <div className="flex-1">
              <div className="text-white text-base leading-relaxed">
                {aiMessage ||
                  "Congratulations! You're getting closer to becoming a master space explorer! ✨"}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
          <button
            onClick={handleContinueToMap}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-xl text-xl font-bold hover:from-pink-600 hover:to-purple-700 transition-all hover:scale-105 shadow-lg"
          >
            🗺️ Continue to Map
          </button>
          <button
            onClick={handleCustomizeRocket}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl text-xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all hover:scale-105 shadow-lg"
          >
            🚀 Customize Rocket
          </button>
        </div>

        {/* Progress Stats */}
        <div className="mt-12 bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-pink-400/20">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-yellow-400">
                {state.playerProgress.starsCollected + 1}
              </div>
              <div className="text-white/70 text-sm">Stars Collected</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-pink-400">
                {state.playerProgress.currentLevel}
              </div>
              <div className="text-white/70 text-sm">Current Level</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-400">
                {state.playerProgress.unlockedParts.length + 1}
              </div>
              <div className="text-white/70 text-sm">Parts Unlocked</div>
            </div>
          </div>
        </div>

        {/* Encouragement */}
        <div className="text-center mt-8">
          <p className="text-white/60 text-lg">
            You're becoming an amazing space explorer! 🌟
          </p>
          <p className="text-white/40 text-sm mt-2">
            Your curiosity and courage will take you to amazing places!
          </p>
        </div>
      </div>

      {/* Floating Space Elements */}
      <div className="absolute top-20 left-10 text-3xl animate-float">⭐</div>
      <div
        className="absolute top-40 right-20 text-2xl animate-float"
        style={{ animationDelay: "1s" }}
      >
        🌙
      </div>
      <div
        className="absolute bottom-40 left-20 text-2xl animate-float"
        style={{ animationDelay: "1.5s" }}
      >
        ✨
      </div>
      <div
        className="absolute bottom-20 right-10 text-3xl animate-float"
        style={{ animationDelay: "2s" }}
      >
        💫
      </div>

      {/* Floating Rockets */}
      <div
        className="absolute top-20 left-10 text-3xl animate-bounce"
        style={{ animationDelay: "0.5s" }}
      >
        🚀
      </div>
      <div
        className="absolute top-40 right-20 text-2xl animate-bounce"
        style={{ animationDelay: "1s" }}
      >
        🚀
      </div>
      <div
        className="absolute bottom-40 left-20 text-2xl animate-bounce"
        style={{ animationDelay: "1.5s" }}
      >
        🚀
      </div>
      <div
        className="absolute bottom-20 right-10 text-3xl animate-bounce"
        style={{ animationDelay: "2s" }}
      >
        🚀
      </div>
    </div>
  );
}
