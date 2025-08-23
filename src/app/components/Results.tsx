"use client";

import { useGame } from "./GameProvider";
import { useState } from "react";

export default function Results() {
  const { state, dispatch } = useGame();
  const [aiMessage, setAiMessage] = useState("");

  // Calculate mission results
  const maxAltitude = Math.round(
    (state.currentRocket.thrust / Math.max(state.currentRocket.mass, 1)) * 1000
  );
  const thrustToWeight =
    state.currentRocket.thrust / Math.max(state.currentRocket.mass, 1);
  const fuelEfficiency =
    state.currentRocket.fuel > 0
      ? Math.round(
          (state.currentRocket.thrust / state.currentRocket.fuel) * 100
        )
      : 0;

  // Determine success based on physics
  const isSuccess = thrustToWeight >= 1.0 && state.currentRocket.fuel > 0;

  // Generate AI feedback based on rocket design
  const generateAIFeedback = () => {
    if (thrustToWeight < 1.0) {
      return (
        "Your rocket was a bit too heavy for its engine! The thrust-to-weight ratio was " +
        thrustToWeight.toFixed(2) +
        ". You need at least 1.0 to escape Earth's gravity. Try adding a bigger engine or using lighter parts! Don't worry - every great scientist learns from their experiments! 🌟"
      );
    } else if (state.currentRocket.fuel === 0) {
      return "You forgot to add fuel! Even the most beautiful engine can't work without fuel. Make sure to include a fuel tank in your design. This is a common mistake that even experienced engineers make! 💫";
    } else if (state.currentRocket.mass > 200) {
      return "Your rocket was quite heavy! While it had enough thrust, lighter rockets are more efficient and graceful. Try using lighter parts or adding wings to reduce drag. You're thinking like a real engineer! 👩‍🔬";
    } else if (state.currentRocket.drag > 15) {
      return "Your rocket had a lot of drag! This made it less efficient. Wings can help, but too many can slow you down. Finding the right balance is part of the fun! You're learning important design principles! ✨";
    } else {
      return "Amazing design! Your rocket had perfect balance between thrust, weight, and fuel. The physics principles you used are the same ones real rocket scientists use! You're a natural engineer! 🚀";
    }
  };

  const handleRetry = () => {
    dispatch({ type: "SET_VIEW", payload: "rocket-builder" });
  };

  const handleNextLevel = () => {
    dispatch({
      type: "UPDATE_PROGRESS",
      payload: {
        currentLevel: state.playerProgress.currentLevel + 1,
        attemptsMade: state.playerProgress.attemptsMade + 1,
      },
    });
    dispatch({ type: "SET_VIEW", payload: "level-map" });
  };

  const handleBackToMap = () => {
    dispatch({ type: "SET_VIEW", payload: "level-map" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900 flex items-center justify-center p-8">
      {/* Background Stars */}
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

      <div className="relative z-10 max-w-4xl w-full">
        {/* Mission Status Card */}
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 border border-pink-400/30 mb-8">
          <div className="text-center">
            <div className="text-6xl mb-4">{isSuccess ? "🚀" : "💫"}</div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {isSuccess ? "Mission Success!" : "Learning Opportunity!"}
            </h1>
            <p className="text-xl text-pink-200 mb-6">
              {isSuccess
                ? "Congratulations! Your rocket design worked perfectly!"
                : "Every experiment teaches us something valuable! You're growing as a scientist!"}
            </p>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">
                {maxAltitude}m
              </div>
              <div className="text-white/70 text-sm">Max Altitude</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">
                {state.currentRocket.mass}kg
              </div>
              <div className="text-white/70 text-sm">Total Mass</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-400">
                {state.currentRocket.thrust}N
              </div>
              <div className="text-white/70 text-sm">Total Thrust</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">
                {fuelEfficiency}%
              </div>
              <div className="text-white/70 text-sm">Fuel Efficiency</div>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="bg-white/10 rounded-lg p-6 mb-6">
            <h3 className="text-white font-bold text-lg mb-4">
              Rocket Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-white/70">Thrust-to-Weight Ratio:</span>
                <span className="text-white font-medium">
                  {thrustToWeight.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Fuel Capacity:</span>
                <span className="text-white font-medium">
                  {state.currentRocket.fuel}L
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Drag Coefficient:</span>
                <span className="text-white font-medium">
                  {state.currentRocket.drag}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Parts Used:</span>
                <span className="text-white font-medium">
                  {state.currentRocket.parts.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Feedback Panel */}
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-pink-400/30 mb-8">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-2xl">
              🌙
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-lg mb-3">
                Luna's Feedback
              </h3>
              <div className="text-white/90 text-base leading-relaxed mb-4">
                {aiMessage || generateAIFeedback()}
              </div>
              <div className="text-sm text-white/70">
                <strong>Growth Mindset Tip:</strong>{" "}
                {isSuccess
                  ? "You successfully balanced thrust, mass, and fuel - the three key factors in rocket design! This shows you're thinking like a real engineer!"
                  : "Remember: Every great scientist started with experiments that didn't work perfectly. What matters is that you keep trying and learning!"}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
          <button
            onClick={handleRetry}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all hover:scale-105"
          >
            🔄 Try Again
          </button>
          <button
            onClick={handleNextLevel}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all hover:scale-105"
          >
            🌟 Next Level
          </button>
          <button
            onClick={handleBackToMap}
            className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all hover:scale-105"
          >
            🗺️ Back to Map
          </button>
        </div>

        {/* Encouragement */}
        <div className="text-center mt-8">
          <p className="text-white/60 text-lg">
            {isSuccess
              ? "You're becoming an amazing space explorer! 🌟"
              : "Every challenge makes you stronger! Keep exploring and learning! 🔬"}
          </p>
          <p className="text-white/40 text-sm mt-2">
            {isSuccess
              ? "Your curiosity and courage will take you to amazing places!"
              : "The best scientists learn from every experiment, successful or not!"}
          </p>
        </div>
      </div>
    </div>
  );
}
