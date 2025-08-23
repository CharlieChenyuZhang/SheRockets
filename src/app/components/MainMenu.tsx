"use client";

import { useGame } from "./GameProvider";
import { useState } from "react";

export default function MainMenu() {
  const { state, navigateTo } = useGame();
  const [isHovered, setIsHovered] = useState<string | null>(null);

  const handleStartAdventure = () => {
    navigateTo("/map");
  };

  const handleContinue = () => {
    if (state.lastSavedState) {
      // TODO: Implement loading saved state
      navigateTo("/map");
    }
  };

  const handleLearnPhysics = () => {
    // TODO: Implement guided mode
    console.log("Learn Physics mode");
  };

  const handleSettings = () => {
    // TODO: Open settings modal
    console.log("Settings");
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Starfield Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900 via-pink-900 to-indigo-900">
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
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

        {/* Animated Rockets and Space Elements */}
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute text-2xl animate-bounce"
            style={{
              left: `${20 + i * 30}%`,
              bottom: "-50px",
              animationDelay: `${i * 2}s`,
              animationDuration: "4s",
            }}
          >
            🚀
          </div>
        ))}

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
          style={{ animationDelay: "2s" }}
        >
          ✨
        </div>
        <div
          className="absolute bottom-20 right-10 text-3xl animate-float"
          style={{ animationDelay: "0.5s" }}
        >
          💫
        </div>
      </div>

      {/* Settings Button */}
      <button
        onClick={handleSettings}
        className="absolute top-4 right-4 text-white text-2xl hover:scale-110 transition-transform"
        title="Settings"
      >
        ⚙️
      </button>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        {/* Game Title */}
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-4 animate-pulse">
            She Rocks!
          </h1>
          <p className="text-xl md:text-2xl text-pink-200 font-light mb-2">
            Physics Adventure Game
          </p>
          <p className="text-lg text-blue-200 font-light">
            Build rockets, explore space, and discover the power of science! 🌟
          </p>
        </div>

        {/* Menu Buttons */}
        <div className="space-y-6 w-full max-w-md">
          <button
            onClick={handleStartAdventure}
            onMouseEnter={() => setIsHovered("start")}
            onMouseLeave={() => setIsHovered(null)}
            className={`w-full py-4 px-8 rounded-2xl text-xl font-bold transition-all duration-300 transform ${
              isHovered === "start"
                ? "scale-105 shadow-2xl"
                : "hover:scale-102 hover:shadow-xl"
            } bg-gradient-to-r from-pink-500 to-purple-600 text-white border-2 border-pink-400 hover:from-pink-600 hover:to-purple-700`}
          >
            🚀 Start Your Space Adventure
          </button>

          <button
            onClick={handleContinue}
            disabled={!state.lastSavedState}
            onMouseEnter={() => setIsHovered("continue")}
            onMouseLeave={() => setIsHovered(null)}
            className={`w-full py-4 px-8 rounded-2xl text-xl font-bold transition-all duration-300 transform ${
              isHovered === "continue"
                ? "scale-105 shadow-2xl"
                : "hover:scale-102 hover:shadow-xl"
            } ${
              state.lastSavedState
                ? "bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-2 border-blue-400 hover:from-blue-600 hover:to-cyan-700"
                : "bg-gray-600 text-gray-400 border-2 border-gray-500 cursor-not-allowed"
            }`}
          >
            ⏯️ Continue Your Journey
          </button>

          <button
            onClick={handleLearnPhysics}
            onMouseEnter={() => setIsHovered("learn")}
            onMouseLeave={() => setIsHovered(null)}
            className={`w-full py-4 px-8 rounded-2xl text-xl font-bold transition-all duration-300 transform ${
              isHovered === "learn"
                ? "scale-105 shadow-2xl"
                : "hover:scale-102 hover:shadow-xl"
            } bg-gradient-to-r from-green-500 to-emerald-600 text-white border-2 border-green-400 hover:from-green-600 hover:to-emerald-700`}
          >
            📚 Learn Physics Together
          </button>
        </div>

        {/* Character Preview */}
        <div className="mt-12 bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/20 max-w-md">
          <div className="text-center">
            <div className="text-4xl mb-3">👩‍🚀</div>
            <h3 className="text-white font-bold text-lg mb-2">
              Meet Your Space Explorer!
            </h3>
            <p className="text-white/80 text-sm">
              Customize your character and discover your unique space journey.
              Every great scientist started with curiosity and courage!
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-8 left-8 text-white text-sm opacity-70">
          Made with ❤️ for young scientists
        </div>

        <div className="absolute bottom-8 right-8 text-white text-sm opacity-70">
          🌟 You have the power to change the world! 🌟
        </div>
      </div>
    </div>
  );
}
