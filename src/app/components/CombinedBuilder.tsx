"use client";

import { useGame, RocketPart } from "./GameProvider";
import { useState, useEffect } from "react";
import Image from "next/image";

// Import the simulation logic from LaunchSimulation
interface SimulationState {
  altitude: number;
  velocity: number;
  horizontalVelocity: number;
  angle: number;
  fuel: number;
  time: number;
  isLaunched: boolean;
  isComplete: boolean;
  success: boolean;
  missionPhase:
    | "launch"
    | "orbit"
    | "transfer"
    | "lunar_approach"
    | "landing"
    | "failed";
  distanceToMoon: number;
  orbitalVelocity: number;
  escapeVelocity: number;
  positionHistory: Array<{ x: number; y: number; time: number }>;
  rocketX: number;
  rocketY: number;
}

// Realistic physics constants
const MOON_DISTANCE = 384400000; // meters (384,400 km)
const LOW_ORBIT_ALTITUDE = 200000; // meters (200 km)
const LUNAR_ORBIT_ALTITUDE = 100000; // meters (100 km above moon)

// Rocket parts data (copied from RocketBuilder)
const availableParts: RocketPart[] = [
  {
    id: "aluminum-body",
    name: "Aluminum Fuselage",
    type: "body",
    weight: 100,
    unlocked: true,
    icon: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=200&h=200&fit=crop&crop=center",
  },
  {
    id: "carbon-fiber-body",
    name: "Carbon Fiber Body",
    type: "body",
    weight: 80,
    unlocked: true,
    icon: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=200&h=200&fit=crop&crop=center",
  },
  {
    id: "liquid-fuel-engine",
    name: "Liquid Fuel Engine",
    type: "engine",
    weight: 50,
    thrust: 100,
    unlocked: true,
    icon: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=200&h=200&fit=crop&crop=center",
  },
  {
    id: "solid-fuel-engine",
    name: "Solid Fuel Engine",
    type: "engine",
    weight: 70,
    thrust: 150,
    unlocked: true,
    icon: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=200&h=200&fit=crop&crop=center",
  },
  {
    id: "fins",
    name: "Stabilizing Fins",
    type: "fins",
    weight: 20,
    unlocked: true,
    icon: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=200&h=200&fit=crop&crop=center",
  },
  {
    id: "nose-cone",
    name: "Aerodynamic Nose Cone",
    type: "nose",
    weight: 15,
    unlocked: true,
    icon: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=200&h=200&fit=crop&crop=center",
  },
  {
    id: "fuel-tank",
    name: "Fuel Tank",
    type: "fuel",
    weight: 30,
    fuel: 1000,
    unlocked: true,
    icon: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=200&h=200&fit=crop&crop=center",
  },
  {
    id: "guidance-system",
    name: "Guidance System",
    type: "guidance",
    weight: 25,
    unlocked: true,
    icon: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=200&h=200&fit=crop&crop=center",
  },
  {
    id: "parachute",
    name: "Recovery Parachute",
    type: "recovery",
    weight: 10,
    unlocked: true,
    icon: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=200&h=200&fit=crop&crop=center",
  },
  {
    id: "payload",
    name: "Payload Bay",
    type: "payload",
    weight: 40,
    unlocked: true,
    icon: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=200&h=200&fit=crop&crop=center",
  },
];

export default function CombinedBuilder() {
  const { state, updateRocket } = useGame();
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [simState, setSimState] = useState<SimulationState>({
    altitude: 0,
    velocity: 0,
    horizontalVelocity: 0,
    angle: 0,
    fuel: state.currentRocket.fuel,
    time: 0,
    isLaunched: false,
    isComplete: false,
    success: false,
    missionPhase: "launch",
    distanceToMoon: MOON_DISTANCE,
    orbitalVelocity: 0,
    escapeVelocity: 0,
    positionHistory: [],
    rocketX: 50,
    rocketY: 80,
  });

  // Calculate rocket specs
  const rocketMass = state.currentRocket.parts.reduce(
    (sum, part) => sum + part.weight,
    0
  );
  const totalThrust = state.currentRocket.parts
    .filter((part) => part.type === "engine")
    .reduce((sum, part) => sum + (part.thrust || 0), 0);
  const fuelCapacity = state.currentRocket.parts
    .filter((part) => part.type === "fuel")
    .reduce((sum, part) => sum + (part.fuel || 0), 0);
  const drag =
    state.currentRocket.parts.filter((part) => part.type === "fins").length *
    0.1;
  const thrustToWeight = totalThrust / (rocketMass * 9.81);
  const deltaV =
    (totalThrust / rocketMass) *
    Math.log(fuelCapacity / (fuelCapacity - fuelCapacity * 0.8));
  const fuelFlowRate = totalThrust / 300; // Simplified fuel flow

  // Simulation logic (simplified from LaunchSimulation)
  useEffect(() => {
    if (simState.isLaunched && !simState.isComplete) {
      const interval = setInterval(() => {
        setSimState((prev) => {
          const dt = 0.1;
          const newTime = prev.time + dt;
          let newAltitude = prev.altitude;
          let newVelocity = prev.velocity;
          let newHorizontalVelocity = prev.horizontalVelocity;
          let newAngle = prev.angle;
          let newMissionPhase = prev.missionPhase;
          let newDistanceToMoon = prev.distanceToMoon;
          let isComplete = prev.isComplete;
          let success = false;

          // Simplified physics calculations
          if (prev.missionPhase === "launch") {
            if (prev.fuel > 0 && prev.altitude < 100000) {
              newVelocity += 200 * dt;
              newHorizontalVelocity += 50 * dt;
              newAltitude = Math.max(0, prev.altitude + newVelocity * dt);
            } else {
              newVelocity -= 9.81 * dt;
              newAltitude = Math.max(0, prev.altitude + newVelocity * dt);
            }

            if (
              prev.altitude >= LOW_ORBIT_ALTITUDE &&
              newHorizontalVelocity > 7000
            ) {
              newMissionPhase = "orbit";
            }

            // Check for failure conditions during launch
            if (prev.altitude <= 0 && prev.velocity < 0) {
              // Crashed on ground
              isComplete = true;
              success = false;
              newMissionPhase = "failed";
            } else if (prev.velocity < -50 && prev.altitude < 10000) {
              // Falling too fast at low altitude (stall/spin)
              isComplete = true;
              success = false;
              newMissionPhase = "failed";
            } else if (prev.fuel <= 0 && prev.altitude < 50000) {
              // Out of fuel too early in launch
              isComplete = true;
              success = false;
              newMissionPhase = "failed";
            }
          } else if (prev.missionPhase === "orbit") {
            if (prev.fuel > 0) {
              newHorizontalVelocity += 100 * dt;
              newAltitude += 100 * dt;
            }
            if (newHorizontalVelocity >= 8000) {
              newMissionPhase = "transfer";
            }
          } else if (prev.missionPhase === "transfer") {
            const transferSpeed = 1000;
            newDistanceToMoon = Math.max(
              0,
              prev.distanceToMoon - transferSpeed * dt
            );
            newAltitude += 200 * dt;
            if (newDistanceToMoon <= LUNAR_ORBIT_ALTITUDE) {
              newMissionPhase = "lunar_approach";
            }
          } else if (prev.missionPhase === "lunar_approach") {
            if (prev.fuel > 0) {
              newHorizontalVelocity -= 50 * dt;
              newAltitude += 50 * dt;
            }
            if (newHorizontalVelocity <= 2000) {
              newMissionPhase = "landing";
            }
          } else if (prev.missionPhase === "landing") {
            if (prev.fuel > 0 && newVelocity > -5) {
              newVelocity -= 10 * dt;
            }
            if (newVelocity >= -2 && newAltitude <= 1000) {
              isComplete = true;
              success = true;
            }
          }

          // Update rocket position for visualization
          let progress = 0;
          if (newMissionPhase === "launch") {
            progress = Math.min(newTime / 10, 0.3);
          } else if (newMissionPhase === "orbit") {
            progress = 0.3 + Math.min((newTime - 10) / 15, 0.3);
          } else if (newMissionPhase === "transfer") {
            progress = 0.6 + Math.min((newTime - 25) / 20, 0.3);
          } else if (newMissionPhase === "lunar_approach") {
            progress = 0.9 + Math.min((newTime - 45) / 10, 0.08);
          } else if (newMissionPhase === "landing") {
            progress = 0.98;
          } else if (newMissionPhase === "failed") {
            progress = Math.min(newTime / 20, 0.5);
          }

          const newRocketX = 50 + progress * 30;
          const newRocketY = 80 - progress * 50;

          // Calculate angle
          if (newMissionPhase === "launch") {
            const launchProgress = Math.min(newTime / 10, 1);
            newAngle = launchProgress * 45;
          } else if (newMissionPhase === "orbit") {
            const orbitProgress = Math.min((newTime - 10) / 15, 1);
            newAngle = 45 + orbitProgress * 30;
          } else if (newMissionPhase === "transfer") {
            const transferProgress = Math.min((newTime - 25) / 20, 1);
            newAngle = 75 + transferProgress * 15;
          } else {
            newAngle = 90;
          }

          const newPositionHistory = [
            ...prev.positionHistory.slice(-20),
            { x: newRocketX, y: newRocketY, time: newTime },
          ];

          const fuelRemaining = Math.max(
            0,
            prev.fuel - fuelFlowRate * dt * 1000
          );

          return {
            ...prev,
            altitude: newAltitude,
            velocity: newVelocity,
            horizontalVelocity: newHorizontalVelocity,
            angle: newAngle,
            fuel: fuelRemaining,
            time: newTime,
            missionPhase: newMissionPhase,
            distanceToMoon: newDistanceToMoon,
            orbitalVelocity:
              newMissionPhase === "orbit"
                ? Math.min(newHorizontalVelocity, 8000)
                : 0,
            escapeVelocity: Math.min(
              newVelocity + newHorizontalVelocity,
              12000
            ),
            positionHistory: newPositionHistory,
            rocketX: newRocketX,
            rocketY: newRocketY,
            isComplete,
            success: isComplete ? success : prev.success,
          };
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [simState.isLaunched, simState.isComplete, fuelFlowRate]);

  const handlePartSelect = (part: RocketPart) => {
    if (!part.unlocked) return;

    const newParts = [...state.currentRocket.parts];
    const existingIndex = newParts.findIndex((p) => p.type === part.type);

    if (existingIndex >= 0) {
      newParts[existingIndex] = part;
    } else {
      newParts.push(part);
    }

    updateRocket({ ...state.currentRocket, parts: newParts });
    setSelectedPart(part.id);
  };

  const handleLaunch = () => {
    // Check if rocket has fuel before launching
    if (fuelCapacity <= 0) {
      alert(
        "Cannot launch rocket without fuel! Please add a fuel tank to your rocket design."
      );
      return;
    }

    setSimState((prev) => ({
      ...prev,
      isLaunched: true,
      fuel: fuelCapacity,
    }));
  };

  const handleRetry = () => {
    setSimState({
      altitude: 0,
      velocity: 0,
      horizontalVelocity: 0,
      angle: 0,
      fuel: fuelCapacity,
      time: 0,
      isLaunched: false,
      isComplete: false,
      success: false,
      missionPhase: "launch",
      distanceToMoon: MOON_DISTANCE,
      orbitalVelocity: 0,
      escapeVelocity: 0,
      positionHistory: [],
      rocketX: 50,
      rocketY: 80,
    });
  };

  const rocketPos = { x: simState.rocketX, y: simState.rocketY };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Image
              src="/rocket.png"
              alt="Rocket"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            Rocket Builder & Launcher
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side - Rocket Builder */}
        <div className="space-y-6">
          {/* Rocket Stats */}
          <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-bold mb-4">📊 Rocket Specifications</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Mass:</span>
                <span className="ml-2 font-mono">
                  {rocketMass.toFixed(0)} kg
                </span>
              </div>
              <div>
                <span className="text-gray-400">Thrust:</span>
                <span className="ml-2 font-mono">
                  {totalThrust.toFixed(0)} N
                </span>
              </div>
              <div>
                <span className="text-gray-400">T/W Ratio:</span>
                <span className="ml-2 font-mono">
                  {thrustToWeight.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-gray-400">ΔV:</span>
                <span className="ml-2 font-mono">{deltaV.toFixed(0)} m/s</span>
              </div>
              <div>
                <span className="text-gray-400">Fuel:</span>
                <span className="ml-2 font-mono">
                  {fuelCapacity.toFixed(0)} L
                </span>
              </div>
              <div>
                <span className="text-gray-400">Drag:</span>
                <span className="ml-2 font-mono">{drag.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Parts Selection */}
          <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-bold mb-4">🔧 Select Parts</h2>
            <div className="grid grid-cols-2 gap-3">
              {availableParts.map((part) => (
                <button
                  key={part.id}
                  onClick={() => handlePartSelect(part)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    state.currentRocket.parts.some((p) => p.id === part.id)
                      ? "border-green-400 bg-green-500/20"
                      : part.unlocked
                      ? "border-pink-400 bg-pink-500/20 hover:bg-pink-500/30 hover:scale-105"
                      : "border-gray-600 bg-gray-600/20 opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-2 rounded-lg overflow-hidden bg-gray-800 flex items-center justify-center">
                      <Image
                        src={part.icon}
                        alt={part.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const nextElement = e.currentTarget
                            .nextElementSibling as HTMLElement;
                          if (nextElement) {
                            nextElement.style.display = "block";
                          }
                        }}
                      />
                      <Image
                        src="/rocket.png"
                        alt="Rocket"
                        width={24}
                        height={24}
                        className="hidden"
                      />
                    </div>
                    <div className="text-xs font-medium">{part.name}</div>
                    <div className="text-xs text-gray-400">
                      {part.weight}kg
                      {part.thrust && ` • ${part.thrust}N`}
                      {part.fuel && ` • ${part.fuel}L`}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Launch Controls */}
          <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Image
                src="/rocket.png"
                alt="Rocket"
                width={24}
                height={24}
                className="w-6 h-6"
              />
              Launch Controls
            </h2>
            <div className="space-y-4">
              {!simState.isLaunched ? (
                <button
                  onClick={handleLaunch}
                  disabled={fuelCapacity <= 0}
                  className={`w-full py-3 rounded-lg font-bold text-lg transition-colors ${
                    fuelCapacity <= 0
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-500"
                  }`}
                >
                  {fuelCapacity <= 0 ? (
                    "⛽ ADD FUEL TO LAUNCH"
                  ) : (
                    <>
                      <Image
                        src="/rocket.png"
                        alt="Rocket"
                        width={20}
                        height={20}
                        className="w-5 h-5 mr-2"
                      />
                      LAUNCH ROCKET
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleRetry}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold text-lg transition-colors"
                >
                  🔄 RETRY MISSION
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Launch Simulation */}
        <div className="space-y-6">
          {/* Mission Status */}
          <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">🎯 Mission Control</h2>
              <div className="text-right">
                <div className="text-sm text-gray-400">Mission Time</div>
                <div className="text-lg font-mono">
                  {simState.time.toFixed(1)}s
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">
                {simState.missionPhase === "launch" && (
                  <span className="flex items-center gap-2">
                    <Image
                      src="/rocket.png"
                      alt="Rocket"
                      width={24}
                      height={24}
                      className="w-6 h-6"
                    />
                    Launch Phase
                  </span>
                )}
                {simState.missionPhase === "orbit" && "🌍 Orbital Insertion"}
                {simState.missionPhase === "transfer" && "🌙 Lunar Transfer"}
                {simState.missionPhase === "lunar_approach" &&
                  "🌕 Lunar Approach"}
                {simState.missionPhase === "landing" && "🛬 Landing"}
                {simState.missionPhase === "failed" && "❌ Mission Failed"}
              </div>
            </div>
          </div>

          {/* Simulation Display */}
          <div
            className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-white/10 relative overflow-hidden"
            style={{ aspectRatio: "4/3" }}
          >
            {/* Space Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900 via-purple-900 to-black">
              {/* Stars */}
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

              {/* Earth */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <div className="w-16 h-16 bg-gradient-to-b from-blue-500 to-green-500 rounded-full animate-pulse shadow-lg">
                  <div className="absolute -inset-2 bg-blue-400/30 rounded-full animate-ping"></div>
                </div>
                <div className="text-center text-xs mt-2">EARTH</div>
              </div>

              {/* Moon */}
              <div className="absolute top-8 right-8">
                <div className="w-12 h-12 bg-gradient-to-b from-gray-300 to-gray-600 rounded-full shadow-lg">
                  <div className="absolute -inset-1 bg-gray-400/20 rounded-full"></div>
                </div>
                <div className="text-center text-xs mt-2">MOON</div>
              </div>

              {/* Rocket */}
              {simState.isLaunched && (
                <div
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-out"
                  style={{
                    left: `${rocketPos.x}%`,
                    top: `${rocketPos.y}%`,
                    transform: `translate(-50%, -50%) rotate(${simState.angle}deg)`,
                  }}
                >
                  <Image
                    src="/rocket.png"
                    alt="Rocket"
                    width={64}
                    height={64}
                    className="w-16 h-16"
                  />
                </div>
              )}

              {/* Trajectory Path */}
              {simState.isLaunched && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <path
                    d={`M 50% 80% Q ${50 + (rocketPos.x - 50) * 0.5}% ${
                      80 + (rocketPos.y - 80) * 0.3
                    }% ${rocketPos.x}% ${rocketPos.y}%`}
                    stroke="#3b82f6"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray="8,8"
                    className="animate-pulse"
                  />
                </svg>
              )}
            </div>
          </div>

          {/* Mission Data */}
          <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-bold mb-4">📈 Mission Data</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Altitude:</span>
                <span className="ml-2 font-mono">
                  {simState.altitude.toFixed(0)}m
                </span>
              </div>
              <div>
                <span className="text-gray-400">Velocity:</span>
                <span className="ml-2 font-mono">
                  {simState.velocity.toFixed(0)}m/s
                </span>
              </div>
              <div>
                <span className="text-gray-400">Orbital Speed:</span>
                <span className="ml-2 font-mono">
                  {simState.orbitalVelocity.toFixed(0)}m/s
                </span>
              </div>
              <div>
                <span className="text-gray-400">Fuel:</span>
                <span className="ml-2 font-mono">
                  {simState.fuel.toFixed(0)}L
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
