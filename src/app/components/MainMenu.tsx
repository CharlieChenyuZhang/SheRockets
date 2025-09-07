"use client";

import { useGame } from "./GameProvider";
import { useState } from "react";

export default function MainMenu() {
  const { state, navigateTo } = useGame();
  const [isHovered, setIsHovered] = useState<string | null>(null);

  const handleStartAdventure = () => {
    navigateTo("/builder");
  };

  const handleContinue = () => {
    if (state.lastSavedState) {
      // TODO: Implement loading saved state
      navigateTo("/builder");
    }
  };

  const handleSettings = () => {
    // TODO: Open settings modal
    console.log("Settings");
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* NASA Solar System Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/nasa-solar.jpg')",
        }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40"></div>

        {/* Subtle gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60"></div>
      </div>

      {/* Settings Button */}
      <button
        onClick={handleSettings}
        className="absolute top-4 right-4 text-white text-2xl hover:scale-110 transition-transform bg-pink-500/20 hover:bg-pink-500/30 rounded-full w-12 h-12 flex items-center justify-center border border-pink-400/30"
        title="Settings"
      >
        ⚙
      </button>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        {/* Game Title */}
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-8xl font-bold text-pink-300 mb-4">
            SheRockets!
          </h1>
          <p className="text-xl md:text-2xl text-pink-300 font-light mb-2">
            Rocket Engineering Simulator
          </p>
          <p className="text-lg text-gray-300 font-light">
            Design rockets, test physics, and discover the power of engineering
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
            } bg-gradient-to-r from-pink-500 to-pink-600 text-white border-2 border-pink-400 hover:from-pink-600 hover:to-pink-700`}
          >
            Start Rocket Mission
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
                ? "bg-gradient-to-r from-pink-400 to-pink-500 text-white border-2 border-pink-300 hover:from-pink-500 hover:to-pink-600"
                : "bg-gray-600 text-gray-400 border-2 border-gray-500 cursor-not-allowed"
            }`}
          >
            Continue Mission
          </button>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-8 left-8 text-white text-sm opacity-70">
          Made with passion for young engineers
        </div>

        <div className="absolute bottom-8 right-8 text-white text-sm opacity-70">
          You have the power to reach the stars
        </div>
      </div>
    </div>
  );
}
