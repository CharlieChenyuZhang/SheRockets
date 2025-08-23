"use client";

import { useGame } from "./GameProvider";
import { useState } from "react";

interface Level {
  id: number;
  name: string;
  challengeType: string;
  unlocked: boolean;
  completed: boolean;
  position: { x: number; y: number };
  reward: string;
  description: string;
  emoji: string;
}

const levels: Level[] = [
  {
    id: 1,
    name: "Crystal Moon",
    challengeType: "Gravity Mission",
    unlocked: true,
    completed: false,
    position: { x: 25, y: 50 },
    reward: "Crystal Engine",
    description:
      "A beautiful crystal moon that sparkles with mysterious energy",
    emoji: "🌙",
  },
  {
    id: 2,
    name: "Stardust Planet",
    challengeType: "Orbit Challenge",
    unlocked: true,
    completed: false,
    position: { x: 45, y: 45 },
    reward: "Stardust Wings",
    description: "A planet made of magical stardust that glows in the darkness",
    emoji: "✨",
  },
  {
    id: 3,
    name: "Rainbow Nebula",
    challengeType: "Landing Mission",
    unlocked: false,
    completed: false,
    position: { x: 65, y: 50 },
    reward: "Rainbow Fuel Tank",
    description:
      "A colorful nebula filled with rainbow gases and cosmic beauty",
    emoji: "🌈",
  },
  {
    id: 4,
    name: "Butterfly Galaxy",
    challengeType: "Gravity Slingshot",
    unlocked: false,
    completed: false,
    position: { x: 55, y: 35 },
    reward: "Butterfly Engine",
    description:
      "A galaxy shaped like a beautiful butterfly with delicate wings",
    emoji: "🦋",
  },
  {
    id: 5,
    name: "Crystal Palace",
    challengeType: "Ring Navigation",
    unlocked: false,
    completed: false,
    position: { x: 75, y: 65 },
    reward: "Crystal Coating",
    description: "A magnificent palace made entirely of crystal and starlight",
    emoji: "🏰",
  },
];

export default function LevelMap() {
  const { state, dispatch, navigateTo } = useGame();
  const [hoveredLevel, setHoveredLevel] = useState<Level | null>(null);
  const [aiMessage, setAiMessage] = useState(
    "Hi! I'm Luna, your AI space companion! 🌙 Ready to explore the magical universe together?"
  );

  const handleLevelClick = (level: Level) => {
    if (level.unlocked) {
      dispatch({
        type: "UPDATE_PROGRESS",
        payload: { currentLevel: level.id },
      });
      navigateTo("/builder");
    }
  };

  const handleBackToMenu = () => {
    navigateTo("/menu");
  };

  const getAiSuggestion = () => {
    const nextLevel = levels.find(
      (level) => level.unlocked && !level.completed
    );
    if (nextLevel) {
      setAiMessage(
        `Let's visit ${
          nextLevel.name
        }! It's a ${nextLevel.challengeType.toLowerCase()}. You'll learn about ${
          nextLevel.challengeType.includes("Gravity")
            ? "gravity"
            : "space navigation"
        } while exploring this magical place! ✨`
      );
    } else {
      setAiMessage(
        "You're doing amazing! You've completed all available missions. More magical adventures are coming soon! 🌟"
      );
    }
  };

  const getEncouragement = () => {
    const messages = [
      "You're such a brave space explorer! Every mission makes you stronger! 💪",
      "Your curiosity and courage are what make you a great scientist! 🔬",
      "Remember, every great discovery started with someone asking 'What if?' 🌟",
      "You're not just playing a game - you're learning to change the world! 🚀",
      "Your rocket designs are getting better and better! You're a natural engineer! 👩‍🔬",
    ];
    setAiMessage(messages[Math.floor(Math.random() * messages.length)]);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Starry Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900 via-pink-900 to-indigo-900">
        <div className="absolute inset-0">
          {[...Array(150)].map((_, i) => (
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
      </div>

      {/* Nebula Clouds */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute top-1/3 right-1/3 w-48 h-48 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-1/4 left-1/2 w-56 h-56 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      {/* Floating Space Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 text-2xl animate-float">
          ⭐
        </div>
        <div
          className="absolute top-1/2 right-1/4 text-xl animate-float"
          style={{ animationDelay: "1s" }}
        >
          ✨
        </div>
        <div
          className="absolute bottom-1/3 left-1/4 text-2xl animate-float"
          style={{ animationDelay: "2s" }}
        >
          💫
        </div>
        <div
          className="absolute top-2/3 right-1/3 text-xl animate-float"
          style={{ animationDelay: "0.5s" }}
        >
          🌟
        </div>
        <div
          className="absolute bottom-1/2 left-2/3 text-2xl animate-float"
          style={{ animationDelay: "1.5s" }}
        >
          🌙
        </div>
      </div>

      {/* Top Bar */}
      <div className="relative z-10 bg-black/30 backdrop-blur-sm border-b border-white/20">
        <div className="flex justify-between items-center p-4">
          <button
            onClick={handleBackToMenu}
            className="text-white hover:text-pink-300 transition-colors text-lg"
          >
            ← Back to Menu
          </button>
          <div className="flex items-center space-x-6 text-white">
            <div className="flex items-center space-x-2">
              <span>⭐</span>
              <span>{state.playerProgress.starsCollected} Stars</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>🚀</span>
              <span>{state.playerProgress.attemptsMade} Attempts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 text-center z-10">
        <h1 className="text-4xl font-bold text-white mb-2">
          Magical Universe Map
        </h1>
        <p className="text-pink-200">Choose your next magical adventure!</p>
      </div>

      {/* Progress Indicator */}
      <div className="absolute top-32 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-black/20 backdrop-blur-sm rounded-full px-6 py-2 border border-pink-400/30">
          <div className="flex items-center space-x-4 text-white text-sm">
            <span>Progress: {state.playerProgress.currentLevel}/5</span>
            <div className="w-24 h-2 bg-gray-700 rounded-full">
              <div
                className="h-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full transition-all duration-500"
                style={{
                  width: `${(state.playerProgress.currentLevel / 5) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Level Connections */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-5">
        {levels.slice(0, -1).map((level, index) => {
          const nextLevel = levels[index + 1];
          if (level.unlocked && nextLevel.unlocked) {
            return (
              <line
                key={`connection-${level.id}`}
                x1={`${level.position.x}%`}
                y1={`${level.position.y}%`}
                x2={`${nextLevel.position.x}%`}
                y2={`${nextLevel.position.y}%`}
                stroke="rgba(255, 192, 203, 0.4)"
                strokeWidth="3"
                strokeDasharray="8,8"
              />
            );
          }
          return null;
        })}
      </svg>

      {/* Level Nodes */}
      <div className="relative z-10 p-8 pt-40">
        {levels.map((level) => (
          <div
            key={level.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300"
            style={{
              left: `${level.position.x}%`,
              top: `${level.position.y}%`,
            }}
            onMouseEnter={() => setHoveredLevel(level)}
            onMouseLeave={() => setHoveredLevel(null)}
            onClick={() => handleLevelClick(level)}
          >
            <div
              className={`relative group ${
                level.unlocked
                  ? "hover:scale-110"
                  : "opacity-50 cursor-not-allowed"
              }`}
            >
              {/* Planet */}
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl transition-all duration-300 ${
                  level.completed
                    ? "bg-gradient-to-r from-yellow-400 to-pink-500 shadow-lg shadow-yellow-500/50"
                    : level.unlocked
                    ? "bg-gradient-to-r from-pink-400 to-purple-500 shadow-lg shadow-pink-500/50"
                    : "bg-gray-600"
                }`}
              >
                {level.unlocked ? level.emoji : "🔒"}
              </div>

              {/* Sparkle Effect for Unlocked Levels */}
              {level.unlocked && (
                <div className="absolute -inset-2 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full blur-md animate-pulse"></div>
              )}

              {/* Level Name */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                <div className="text-white text-sm font-medium text-center">
                  {level.name}
                </div>
              </div>

              {/* Tooltip */}
              {hoveredLevel?.id === level.id && (
                <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm text-white p-4 rounded-lg border border-pink-400/30 min-w-56 z-20">
                  <div className="text-center">
                    <div className="text-2xl mb-2">{level.emoji}</div>
                    <div className="font-bold text-lg text-pink-300">
                      {level.name}
                    </div>
                    <div className="text-sm text-blue-300 mb-2">
                      {level.challengeType}
                    </div>
                    <div className="text-xs text-gray-300 mb-2">
                      {level.description}
                    </div>
                    <div className="text-xs text-yellow-300">
                      Reward: {level.reward}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Center Decorative Element */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-5">
        <div className="w-32 h-32 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-full blur-2xl animate-pulse"></div>
      </div>

      {/* AI Assistant */}
      <div className="absolute bottom-4 left-4 max-w-sm z-10">
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-4 border border-pink-400/30">
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-xl">
              🌙
            </div>
            <div className="flex-1">
              <div className="text-white text-sm mb-2">{aiMessage}</div>
              <div className="flex space-x-2">
                <button
                  onClick={getAiSuggestion}
                  className="bg-pink-600 hover:bg-pink-700 text-white text-xs px-3 py-1 rounded-full transition-colors"
                >
                  Get Suggestion
                </button>
                <button
                  onClick={getEncouragement}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1 rounded-full transition-colors"
                >
                  Encourage Me
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Decorative Elements */}
      <div className="absolute bottom-8 right-8 z-10">
        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-white/10">
          <div className="text-white text-sm text-center">
            <div className="text-lg mb-1">🌌</div>
            <div>Explore the cosmos!</div>
          </div>
        </div>
      </div>
    </div>
  );
}
