"use client";

import { useGame } from "./GameProvider";
import { useState, useEffect } from "react";

interface SimulationState {
  altitude: number;
  velocity: number;
  angle: number;
  fuel: number;
  time: number;
  isLaunched: boolean;
  isComplete: boolean;
  success: boolean;
}

export default function LaunchSimulation() {
  const { state, dispatch, navigateTo } = useGame();
  const [simState, setSimState] = useState<SimulationState>({
    altitude: 0,
    velocity: 0,
    angle: 90,
    fuel: state.currentRocket.fuel,
    time: 0,
    isLaunched: false,
    isComplete: false,
    success: false,
  });
  const [aiMessage, setAiMessage] = useState("");
  const [showAiMessage, setShowAiMessage] = useState(false);

  const gravity = 9.81;
  const maxAltitude = Math.round(
    (state.currentRocket.thrust / Math.max(state.currentRocket.mass, 1)) * 1000
  );
  const thrustToWeight =
    state.currentRocket.thrust / Math.max(state.currentRocket.mass, 1);

  useEffect(() => {
    if (simState.isLaunched && !simState.isComplete) {
      const interval = setInterval(() => {
        setSimState((prev) => {
          const newTime = prev.time + 0.1;
          const fuelRemaining = Math.max(
            0,
            prev.fuel - (state.currentRocket.thrust / 100) * 0.1
          );
          const hasFuel = fuelRemaining > 0;

          // Physics simulation
          const netForce = hasFuel
            ? state.currentRocket.thrust - state.currentRocket.mass * gravity
            : -(state.currentRocket.mass * gravity);
          const acceleration = netForce / state.currentRocket.mass;
          const newVelocity = prev.velocity + acceleration * 0.1;
          const newAltitude = Math.max(0, prev.altitude + newVelocity * 0.1);

          // Check for mission completion
          const isComplete = newAltitude <= 0 && prev.altitude > 0;
          const success = prev.altitude >= maxAltitude * 0.8; // 80% of max altitude is success

          // AI feedback
          if (newTime > 2 && !showAiMessage) {
            if (thrustToWeight < 1.0) {
              setAiMessage(
                "Oh no! Your rocket doesn't have enough thrust to escape gravity!"
              );
              setShowAiMessage(true);
            } else if (newAltitude < 100 && newTime > 3) {
              setAiMessage(
                "Your rocket is struggling to gain altitude. Try reducing mass or increasing thrust!"
              );
              setShowAiMessage(true);
            }
          }

          return {
            ...prev,
            altitude: newAltitude,
            velocity: newVelocity,
            fuel: fuelRemaining,
            time: newTime,
            isComplete,
            success: isComplete ? success : prev.success,
          };
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [
    simState.isLaunched,
    simState.isComplete,
    state.currentRocket,
    maxAltitude,
    thrustToWeight,
    showAiMessage,
  ]);

  const handleLaunch = () => {
    setSimState((prev) => ({ ...prev, isLaunched: true }));
    setAiMessage("Liftoff! 🚀 Your rocket is on its way to the stars!");
    setShowAiMessage(true);
  };

  const handleRetry = () => {
    setSimState({
      altitude: 0,
      velocity: 0,
      angle: 90,
      fuel: state.currentRocket.fuel,
      time: 0,
      isLaunched: false,
      isComplete: false,
      success: false,
    });
    setShowAiMessage(false);
  };

  const handleBackToBuilder = () => {
    navigateTo("/builder");
  };

  const handleContinue = () => {
    if (simState.success) {
      navigateTo("/victory");
    } else {
      navigateTo("/results");
    }
  };

  return (
    <div className="relative h-screen bg-gradient-to-b from-blue-900 via-purple-900 to-black overflow-hidden">
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

      {/* Launch Pad */}

      {/* Rocket */}

      {/* Trajectory Trail */}
      {simState.isLaunched && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <path
            d={`M 50% 100% Q 50% ${
              100 - simState.altitude / 10
            }% 50% ${Math.max(0, 100 - simState.altitude / 10)}%`}
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="5,5"
          />
        </svg>
      )}

      {/* HUD Overlay */}
      <div className="absolute top-4 left-4 right-4">
        <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Altitude Gauge */}
            <div className="text-center">
              <div className="text-white text-sm font-medium">Altitude</div>
              <div className="text-2xl font-bold text-blue-400">
                {Math.round(simState.altitude)}m
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      (simState.altitude / maxAltitude) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Velocity Gauge */}
            <div className="text-center">
              <div className="text-white text-sm font-medium">Velocity</div>
              <div className="text-2xl font-bold text-green-400">
                {Math.round(simState.velocity)}m/s
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      (Math.abs(simState.velocity) / 100) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Angle Gauge */}
            <div className="text-center">
              <div className="text-white text-sm font-medium">Angle</div>
              <div className="text-2xl font-bold text-yellow-400">
                {Math.round(simState.angle)}°
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                <div
                  className="bg-yellow-500 h-2 rounded-full transition-all"
                  style={{ width: `${(simState.angle / 180) * 100}%` }}
                />
              </div>
            </div>

            {/* Fuel Gauge */}
            <div className="text-center">
              <div className="text-white text-sm font-medium">Fuel</div>
              <div className="text-2xl font-bold text-red-400">
                {Math.round(simState.fuel)}L
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${
                      (simState.fuel / state.currentRocket.fuel) * 100
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant Popup */}
      {showAiMessage && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="bg-black/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 max-w-md">
            <div className="flex items-start space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xl">
                🤖
              </div>
              <div className="flex-1">
                <div className="text-white text-sm mb-3">{aiMessage}</div>
                <button
                  onClick={() => setShowAiMessage(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded-full transition-colors"
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Launch Controls */}
      {!simState.isLaunched && (
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2">
          <button
            onClick={handleLaunch}
            className="group relative bg-gradient-to-br from-pink-300/90 via-purple-400/90 to-pink-400/90 backdrop-blur-xl text-white px-16 py-6 rounded-3xl text-2xl font-semibold tracking-wide transition-all duration-500 hover:scale-105 active:scale-95 shadow-2xl hover:shadow-pink-400/25 border border-white/10"
          >
            <span className="flex items-center justify-center space-x-6">
              <span className="text-3xl transition-transform duration-300 group-hover:scale-110 group-active:scale-90 flex-shrink-0">
                🚀
              </span>
              <span className="font-medium flex-shrink-0">Launch!</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </button>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="absolute bottom-6 left-4 right-4">
        <div className="flex justify-center space-x-8">
          <button
            onClick={handleRetry}
            className="group relative bg-gradient-to-br from-blue-300/80 to-cyan-400/80 backdrop-blur-xl text-white px-12 py-4 rounded-2xl font-medium tracking-wide transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl hover:shadow-blue-400/20 border border-white/10"
          >
            <span className="flex items-center justify-center space-x-4">
              <span className="text-lg transition-transform duration-300 group-hover:rotate-180 flex-shrink-0">
                🔄
              </span>
              <span className="flex-shrink-0">Retry</span>
            </span>
          </button>
          <button
            onClick={handleBackToBuilder}
            className="group relative bg-gradient-to-br from-purple-300/80 to-pink-400/80 backdrop-blur-xl text-white px-12 py-4 rounded-2xl font-medium tracking-wide transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl hover:shadow-purple-400/20 border border-white/10"
          >
            <span className="flex items-center justify-center space-x-4">
              <span className="text-lg transition-transform duration-300 group-hover:-translate-x-1 flex-shrink-0">
                ←
              </span>
              <span className="flex-shrink-0">Back to Builder</span>
            </span>
          </button>
          {simState.isComplete && (
            <button
              onClick={handleContinue}
              className="group relative bg-gradient-to-br from-green-300/80 to-emerald-400/80 backdrop-blur-xl text-white px-12 py-4 rounded-2xl font-medium tracking-wide transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl hover:shadow-green-400/20 border border-white/10"
            >
              <span className="flex items-center justify-center space-x-4">
                <span className="flex-shrink-0">Continue</span>
                <span className="text-lg transition-transform duration-300 group-hover:translate-x-1 flex-shrink-0">
                  →
                </span>
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Mission Status */}
      {simState.isComplete && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="relative">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md rounded-3xl"></div>

            {/* Main Content */}
            <div
              className={`relative text-center p-12 rounded-3xl border-2 backdrop-blur-xl transition-all duration-700 animate-in slide-in-from-bottom-8 ${
                simState.success
                  ? "bg-gradient-to-br from-green-400/20 to-emerald-500/20 border-green-300/50 shadow-2xl shadow-green-500/25"
                  : "bg-gradient-to-br from-red-400/20 to-pink-500/20 border-red-300/50 shadow-2xl shadow-red-500/25"
              }`}
            >
              {/* Success Animation */}
              {simState.success && (
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-green-400 rounded-full animate-ping"></div>
              )}

              {/* Icon */}
              <div className="text-8xl mb-6 animate-bounce">
                {simState.success ? "🚀" : "💥"}
              </div>

              {/* Title */}
              <div
                className={`text-4xl font-bold mb-4 tracking-wide ${
                  simState.success ? "text-green-300" : "text-red-300"
                }`}
              >
                {simState.success ? "Mission Success!" : "Mission Failed"}
              </div>

              {/* Subtitle */}
              <div className="text-xl text-white/90 mb-6 font-medium">
                {simState.success
                  ? "Congratulations! Your rocket reached the stars! ✨"
                  : "Don't worry, every great scientist learns from failures! 🧪"}
              </div>

              {/* Stats */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/20">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-white/70 text-sm font-medium mb-1">
                      Max Altitude
                    </div>
                    <div className="text-3xl font-bold text-white">
                      {Math.round(simState.altitude)}m
                    </div>
                  </div>
                  <div>
                    <div className="text-white/70 text-sm font-medium mb-1">
                      Target
                    </div>
                    <div className="text-3xl font-bold text-white">
                      {Math.round(maxAltitude * 0.8)}m
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-white/20 rounded-full h-3 mb-6">
                <div
                  className={`h-3 rounded-full transition-all duration-1000 ${
                    simState.success
                      ? "bg-gradient-to-r from-green-400 to-emerald-500"
                      : "bg-gradient-to-r from-red-400 to-pink-500"
                  }`}
                  style={{
                    width: `${Math.min(
                      (simState.altitude / (maxAltitude * 0.8)) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>

              {/* Achievement Badge */}
              {simState.success && (
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border border-yellow-300/50 rounded-full px-4 py-2 mb-6">
                  <span className="text-2xl">🏆</span>
                  <span className="text-yellow-300 font-semibold">
                    Achievement Unlocked!
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
