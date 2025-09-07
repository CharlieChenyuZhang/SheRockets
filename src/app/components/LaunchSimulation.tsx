"use client";

import { useGame } from "./GameProvider";
import { useState, useEffect } from "react";

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
}

// Realistic physics constants
const EARTH_RADIUS = 6371000; // meters
const MOON_DISTANCE = 384400000; // meters (384,400 km)
const EARTH_MASS = 5.972e24; // kg
const MOON_MASS = 7.342e22; // kg
const G = 6.674e-11; // gravitational constant
const LOW_ORBIT_ALTITUDE = 200000; // meters (200 km)
const LUNAR_ORBIT_ALTITUDE = 100000; // meters (100 km above moon)

export default function LaunchSimulation() {
  const { state, navigateTo } = useGame();
  const [simState, setSimState] = useState<SimulationState>({
    altitude: 0,
    velocity: 0,
    horizontalVelocity: 0,
    angle: 90,
    fuel: state.currentRocket.fuel,
    time: 0,
    isLaunched: false,
    isComplete: false,
    success: false,
    missionPhase: "launch",
    distanceToMoon: MOON_DISTANCE,
    orbitalVelocity: 0,
    escapeVelocity: 0,
  });

  // Calculate realistic physics parameters
  const rocketMass = state.currentRocket.mass;
  const thrust = state.currentRocket.thrust;
  const fuelCapacity = state.currentRocket.fuel;
  const drag = state.currentRocket.drag;

  // Calculate thrust-to-weight ratio
  const thrustToWeight = thrust / (rocketMass * 9.81);

  // Calculate specific impulse (simplified)
  const specificImpulse = 300; // seconds (typical for liquid fuel)
  const fuelFlowRate = thrust / (specificImpulse * 9.81); // kg/s

  // Calculate delta-v capability
  const deltaV =
    specificImpulse * 9.81 * Math.log((rocketMass + fuelCapacity) / rocketMass);

  useEffect(() => {
    if (simState.isLaunched && !simState.isComplete) {
      const interval = setInterval(() => {
        setSimState((prev) => {
          const dt = 0.1; // time step
          const newTime = prev.time + dt;

          // Calculate current mass (decreases as fuel burns)
          const currentMass = rocketMass + prev.fuel / 1000; // convert fuel to kg
          const fuelRemaining = Math.max(
            0,
            prev.fuel - fuelFlowRate * dt * 1000
          ); // convert back to L
          const hasFuel = fuelRemaining > 0;

          let newAltitude = prev.altitude;
          let newVelocity = prev.velocity;
          let newHorizontalVelocity = prev.horizontalVelocity;
          let newAngle = prev.angle;
          let newMissionPhase = prev.missionPhase;
          let newDistanceToMoon = prev.distanceToMoon;
          let isComplete = false;
          let success = false;

          // Calculate gravitational force at current altitude
          const distanceFromEarthCenter = EARTH_RADIUS + prev.altitude;
          const gravitationalForce =
            (G * EARTH_MASS * currentMass) /
            (distanceFromEarthCenter * distanceFromEarthCenter);
          const gravitationalAcceleration = gravitationalForce / currentMass;

          // Phase 1: Launch (0-100km altitude)
          if (prev.missionPhase === "launch") {
            if (hasFuel && prev.altitude < 100000) {
              // Apply thrust
              const thrustAcceleration = thrust / currentMass;
              const verticalThrust =
                thrustAcceleration * Math.sin((prev.angle * Math.PI) / 180);
              const horizontalThrust =
                thrustAcceleration * Math.cos((prev.angle * Math.PI) / 180);

              // Apply gravity and drag
              const dragForce =
                0.5 *
                1.225 *
                Math.exp(-prev.altitude / 8000) *
                prev.velocity *
                prev.velocity *
                drag *
                0.01;
              const dragAcceleration = dragForce / currentMass;

              newVelocity +=
                (verticalThrust -
                  gravitationalAcceleration -
                  dragAcceleration) *
                dt;
              newHorizontalVelocity += horizontalThrust * dt;

              // Gravity turn (gradually reduce angle)
              if (prev.altitude > 10000) {
                newAngle = Math.max(0, prev.angle - 0.5);
              }
            } else {
              // No fuel - ballistic trajectory
              newVelocity -= gravitationalAcceleration * dt;
            }

            newAltitude = Math.max(0, prev.altitude + newVelocity * dt);

            // Check if reached low Earth orbit
            if (
              prev.altitude >= LOW_ORBIT_ALTITUDE &&
              newHorizontalVelocity > 7000
            ) {
              newMissionPhase = "orbit";
            }

            // Check for failure conditions
            if (prev.altitude <= 0 && prev.velocity < 0) {
              isComplete = true;
              success = false;
              newMissionPhase = "failed";
            }
          }

          // Phase 2: Orbit (circularize and prepare for transfer)
          else if (prev.missionPhase === "orbit") {
            // Orbital mechanics
            const orbitalRadius = EARTH_RADIUS + prev.altitude;
            const orbitalVelocity = Math.sqrt((G * EARTH_MASS) / orbitalRadius);

            // Gradually increase horizontal velocity to reach transfer orbit
            if (hasFuel && newHorizontalVelocity < orbitalVelocity * 1.4) {
              const transferBurn = (thrust / currentMass) * dt;
              newHorizontalVelocity += transferBurn;
            }

            // Check if ready for lunar transfer
            if (newHorizontalVelocity >= orbitalVelocity * 1.4) {
              newMissionPhase = "transfer";
            }
          }

          // Phase 3: Transfer (coast to moon)
          else if (prev.missionPhase === "transfer") {
            // Simplified transfer - reduce distance to moon
            const transferSpeed = 1000; // m/s
            newDistanceToMoon = Math.max(
              0,
              prev.distanceToMoon - transferSpeed * dt
            );

            // Check if reached moon
            if (newDistanceToMoon <= LUNAR_ORBIT_ALTITUDE) {
              newMissionPhase = "lunar_approach";
            }
          }

          // Phase 4: Lunar approach
          else if (prev.missionPhase === "lunar_approach") {
            // Lunar orbital mechanics
            const lunarOrbitalVelocity = Math.sqrt(
              (G * MOON_MASS) / LUNAR_ORBIT_ALTITUDE
            );

            if (hasFuel && newHorizontalVelocity > lunarOrbitalVelocity) {
              // Retrograde burn to slow down
              const retroBurn = (thrust / currentMass) * dt;
              newHorizontalVelocity = Math.max(
                lunarOrbitalVelocity,
                newHorizontalVelocity - retroBurn
              );
            }

            if (newHorizontalVelocity <= lunarOrbitalVelocity * 1.1) {
              newMissionPhase = "landing";
            }
          }

          // Phase 5: Landing
          else if (prev.missionPhase === "landing") {
            // Final landing phase
            if (hasFuel && newVelocity > -5) {
              // Gentle descent
              const landingBurn = (thrust / currentMass) * dt * 0.3;
              newVelocity = Math.max(-5, newVelocity - landingBurn);
            }

            if (newVelocity >= -2 && newAltitude <= 1000) {
              isComplete = true;
              success = true;
            }
          }

          // Check for mission failure
          if (newTime > 300 && !isComplete) {
            // 5 minute timeout
            isComplete = true;
            success = false;
            newMissionPhase = "failed";
          }

          // No AI feedback - let the mission run silently

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
                ? Math.sqrt((G * EARTH_MASS) / (EARTH_RADIUS + newAltitude))
                : 0,
            escapeVelocity: Math.sqrt(
              (2 * G * EARTH_MASS) / (EARTH_RADIUS + newAltitude)
            ),
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
    rocketMass,
    thrust,
    fuelCapacity,
    drag,
    thrustToWeight,
    deltaV,
    fuelFlowRate,
  ]);

  const handleLaunch = () => {
    setSimState((prev) => ({ ...prev, isLaunched: true }));
  };

  const handleRetry = () => {
    setSimState({
      altitude: 0,
      velocity: 0,
      horizontalVelocity: 0,
      angle: 90,
      fuel: state.currentRocket.fuel,
      time: 0,
      isLaunched: false,
      isComplete: false,
      success: false,
      missionPhase: "launch",
      distanceToMoon: MOON_DISTANCE,
      orbitalVelocity: 0,
      escapeVelocity: 0,
    });
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

  // Calculate rocket position based on mission progress
  const getRocketPosition = () => {
    if (!simState.isLaunched) {
      return { x: 50, y: 80 }; // Launch pad position (Earth)
    }

    // Define destination positions (Moon and Mars)
    const earthPos = { x: 50, y: 80 }; // Earth position
    const moonPos = { x: 75, y: 25 }; // Moon position

    let progress = 0;
    const targetPos = moonPos; // Default to Moon

    // Determine progress and target based on mission phase
    if (simState.missionPhase === "launch") {
      // More gradual movement during launch phase
      progress = Math.min(simState.altitude / 50000, 0.2); // 0-20% for launch phase
    } else if (simState.missionPhase === "orbit") {
      // Smooth transition during orbit phase
      progress = 0.2 + Math.min((simState.horizontalVelocity / 8000) * 0.3, 0.3); // 20-50% for orbit
    } else if (simState.missionPhase === "transfer") {
      // Continuous movement during transfer
      progress = 0.5 + (1 - simState.distanceToMoon / MOON_DISTANCE) * 0.4; // 50-90% for transfer
    } else if (simState.missionPhase === "lunar_approach") {
      // Final approach to moon
      progress = 0.9 + (1 - simState.distanceToMoon / (MOON_DISTANCE * 0.1)) * 0.08; // 90-98% for approach
    } else if (simState.missionPhase === "landing") {
      progress = 0.98; // 98% for landing
    } else if (simState.missionPhase === "failed") {
      // If failed, show where it failed
      progress = Math.min(0.2 + (simState.altitude / 200000) * 0.3, 0.5); // Failed somewhere in middle
    }

    // Interpolate between Earth and target position with smooth easing
    const x = earthPos.x + (targetPos.x - earthPos.x) * progress;
    const y = earthPos.y + (targetPos.y - earthPos.y) * progress;

    return { x, y };
  };

  const rocketPos = getRocketPosition();

  return (
    <div className="relative h-screen bg-black overflow-hidden">
      {/* Professional Space Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-black to-slate-900">
        {/* Subtle star field */}
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute w-px h-px bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.8 + 0.2,
            }}
          />
        ))}
      </div>

      {/* Mission Control Header */}
      <div className="absolute top-0 left-0 right-0 z-20">
        <div className="bg-black/90 backdrop-blur-xl border-b border-white/10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">🚀</span>
                </div>
                <div>
                  <h1 className="text-white text-lg font-semibold">
                    Mission Control
                  </h1>
                  <p className="text-gray-400 text-sm">Lunar Landing Mission</p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <div className="text-white text-sm font-medium">
                    Mission Time
                  </div>
                  <div className="text-blue-400 text-lg font-mono">
                    {simState.time.toFixed(1)}s
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white text-sm font-medium">Phase</div>
                  <div className="text-green-400 text-lg font-semibold capitalize">
                    {simState.missionPhase.replace("_", " ")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Celestial Bodies */}
      <div className="absolute inset-0">
        {/* Earth */}
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-b from-blue-500 via-blue-600 to-green-700 rounded-full shadow-2xl border-2 border-blue-400/30">
              <div className="absolute inset-3 bg-gradient-to-b from-green-500 to-blue-600 rounded-full opacity-70"></div>
              <div className="absolute top-3 left-4 w-2 h-2 bg-white/90 rounded-full"></div>
              <div className="absolute top-5 right-3 w-1 h-1 bg-white/70 rounded-full"></div>
              <div className="absolute bottom-4 left-5 w-1.5 h-1.5 bg-white/80 rounded-full"></div>
            </div>
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
              <div className="bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
                <span className="text-white text-xs font-medium">EARTH</span>
              </div>
            </div>
          </div>
        </div>

        {/* Moon */}
        <div className="absolute top-1/4 right-1/4">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-b from-gray-300 via-gray-400 to-gray-500 rounded-full shadow-xl border-2 border-gray-300/50">
              <div className="absolute inset-2 bg-gradient-to-b from-gray-200 to-gray-400 rounded-full opacity-80"></div>
              <div className="absolute top-3 left-3 w-1.5 h-1.5 bg-gray-600 rounded-full"></div>
              <div className="absolute bottom-4 right-3 w-1 h-1 bg-gray-500 rounded-full"></div>
              <div className="absolute top-1/2 left-2 w-1 h-1 bg-gray-600 rounded-full"></div>
              <div className="absolute top-4 right-4 w-1 h-1 bg-gray-500 rounded-full"></div>
              <div className="absolute bottom-3 left-3 w-0.5 h-0.5 bg-gray-600 rounded-full"></div>
            </div>
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
              <div className="bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
                <span className="text-white text-xs font-medium">MOON</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mars */}
        <div className="absolute top-1/3 left-1/6">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-b from-red-500 via-red-600 to-red-800 rounded-full shadow-xl border-2 border-red-400/50">
              <div className="absolute inset-2 bg-gradient-to-b from-red-400 to-red-700 rounded-full opacity-80"></div>
              <div className="absolute top-2 left-2 w-1 h-1 bg-red-900 rounded-full"></div>
              <div className="absolute bottom-3 right-2 w-0.5 h-0.5 bg-red-800 rounded-full"></div>
              <div className="absolute top-4 right-3 w-0.5 h-0.5 bg-red-900 rounded-full"></div>
              <div className="absolute bottom-2 left-4 w-0.5 h-0.5 bg-red-900 rounded-full"></div>
            </div>
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
              <div className="bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
                <span className="text-white text-xs font-medium">MARS</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trajectory Visualization */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {/* Earth to Moon trajectory */}
        <path
          d="M 50% 80% Q 60% 50% 75% 25%"
          stroke="rgba(59, 130, 246, 0.4)"
          strokeWidth="2"
          fill="none"
          strokeDasharray="6,6"
        />
        {/* Earth to Mars trajectory */}
        <path
          d="M 50% 80% Q 30% 60% 16% 33%"
          stroke="rgba(239, 68, 68, 0.4)"
          strokeWidth="2"
          fill="none"
          strokeDasharray="6,6"
        />

        {/* Rocket position indicator */}
        {simState.isLaunched && (
          <g>
            <circle
              cx={`${rocketPos.x}%`}
              cy={`${rocketPos.y}%`}
              r="4"
              fill="#3b82f6"
              opacity="0.9"
            />
            <circle
              cx={`${rocketPos.x}%`}
              cy={`${rocketPos.y}%`}
              r="6"
              fill="#3b82f6"
              opacity="0.3"
            />
          </g>
        )}
      </svg>

      {/* Rocket */}
      {simState.isLaunched && (
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-out"
          style={{
            left: `${rocketPos.x}%`,
            top: `${rocketPos.y}%`,
            transform: `translate(-50%, -50%) rotate(${90 - simState.angle}deg)`,
          }}
        >
          <div className="relative">
            {/* Rocket trail */}
            {simState.fuel > 0 && simState.missionPhase !== "failed" && (
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-6 h-12 bg-gradient-to-t from-orange-600 via-yellow-500 to-transparent rounded-b-full opacity-80"></div>
            )}

            {/* Rocket body */}
            <div
              className={`w-12 h-24 rounded-lg shadow-2xl transition-all duration-300 ${
                simState.missionPhase === "failed"
                  ? "bg-gradient-to-b from-gray-600 via-gray-700 to-gray-800 opacity-60"
                  : "bg-gradient-to-b from-gray-100 via-gray-200 to-gray-300"
              }`}
            >
              <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full"></div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-orange-400 rounded-b-lg"></div>
              {/* Rocket details */}
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-1 h-8 bg-gray-400 rounded-full"></div>
              <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-1 h-6 bg-gray-500 rounded-full"></div>
            </div>

            {/* Exhaust flame */}
            {simState.fuel > 0 && simState.missionPhase !== "failed" && (
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-6 h-8 bg-gradient-to-t from-orange-500 via-yellow-400 to-transparent rounded-b-full"></div>
            )}

            {/* Failure explosion effect */}
            {simState.missionPhase === "failed" && (
              <div className="absolute -top-4 -left-4 w-16 h-16">
                <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
                <div
                  className="absolute inset-1 bg-orange-400 rounded-full animate-ping opacity-50"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="absolute inset-2 bg-yellow-300 rounded-full animate-ping opacity-25"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            )}

            {/* Success glow effect */}
            {simState.missionPhase === "landing" && simState.success && (
              <div className="absolute -top-3 -left-3 w-14 h-14">
                <div className="absolute inset-0 bg-green-400 rounded-full animate-pulse opacity-50"></div>
                <div
                  className="absolute inset-1 bg-green-300 rounded-full animate-pulse opacity-30"
                  style={{ animationDelay: "0.3s" }}
                ></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Professional HUD Panel */}
      <div className="absolute top-20 left-6 right-6">
        <div className="bg-black/80 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Altitude */}
            <div className="text-center">
              <div className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-2">
                Altitude
              </div>
              <div className="text-3xl font-bold text-white font-mono">
                {simState.altitude > 1000
                  ? `${(simState.altitude / 1000).toFixed(1)}km`
                  : `${Math.round(simState.altitude)}m`}
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2 mt-3">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      (simState.altitude / LOW_ORBIT_ALTITUDE) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Velocity */}
            <div className="text-center">
              <div className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-2">
                Velocity
              </div>
              <div className="text-3xl font-bold text-white font-mono">
                {Math.round(simState.velocity)}m/s
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2 mt-3">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      (Math.abs(simState.velocity) / 1000) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Orbital Speed */}
            <div className="text-center">
              <div className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-2">
                Orbital Speed
              </div>
              <div className="text-3xl font-bold text-white font-mono">
                {Math.round(simState.horizontalVelocity)}m/s
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2 mt-3">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      (simState.horizontalVelocity / 8000) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Fuel */}
            <div className="text-center">
              <div className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-2">
                Fuel
              </div>
              <div className="text-3xl font-bold text-white font-mono">
                {Math.round(simState.fuel)}L
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2 mt-3">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      (simState.fuel / state.currentRocket.fuel) * 100
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Mission Progress */}
          {simState.missionPhase !== "launch" && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-2">
                    Distance to Moon
                  </div>
                  <div className="text-2xl font-bold text-blue-400 font-mono">
                    {simState.distanceToMoon > 1000000
                      ? `${(simState.distanceToMoon / 1000000).toFixed(1)}M km`
                      : `${Math.round(simState.distanceToMoon / 1000)}k km`}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-2">
                    Delta-V
                  </div>
                  <div className="text-2xl font-bold text-green-400 font-mono">
                    {Math.round(deltaV)}m/s
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Launch Controls */}
      {!simState.isLaunched && (
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2">
          <button
            onClick={handleLaunch}
            className="group relative bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-20 py-6 rounded-2xl text-xl font-semibold tracking-wide transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl hover:shadow-blue-500/25 border border-blue-500/30"
          >
            <span className="flex items-center justify-center space-x-4">
              <span className="text-2xl transition-transform duration-300 group-hover:scale-110 group-active:scale-90">
                🚀
              </span>
              <span className="font-semibold">LAUNCH MISSION</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="absolute bottom-6 left-6 right-6">
        <div className="flex justify-center space-x-6">
          <button
            onClick={handleRetry}
            className="group relative bg-gray-800/90 hover:bg-gray-700/90 backdrop-blur-xl text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl border border-gray-600/30"
          >
            <span className="flex items-center justify-center space-x-3">
              <span className="text-lg transition-transform duration-300 group-hover:rotate-180">
                🔄
              </span>
              <span>Retry</span>
            </span>
          </button>
          <button
            onClick={handleBackToBuilder}
            className="group relative bg-gray-800/90 hover:bg-gray-700/90 backdrop-blur-xl text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl border border-gray-600/30"
          >
            <span className="flex items-center justify-center space-x-3">
              <span className="text-lg transition-transform duration-300 group-hover:-translate-x-1">
                ←
              </span>
              <span>Back to Builder</span>
            </span>
          </button>
          {simState.isComplete && (
            <button
              onClick={handleContinue}
              className="group relative bg-blue-600/90 hover:bg-blue-500/90 backdrop-blur-xl text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl border border-blue-500/30"
            >
              <span className="flex items-center justify-center space-x-3">
                <span>Continue</span>
                <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">
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
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl rounded-3xl"></div>

            {/* Main Content */}
            <div
              className={`relative text-center p-12 rounded-3xl border backdrop-blur-xl transition-all duration-700 ${
                simState.success
                  ? "bg-gradient-to-br from-green-900/30 to-blue-900/30 border-green-500/30 shadow-2xl shadow-green-500/20"
                  : "bg-gradient-to-br from-red-900/30 to-gray-900/30 border-red-500/30 shadow-2xl shadow-red-500/20"
              }`}
            >
              {/* Success Animation */}
              {simState.success && (
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-green-400 rounded-full animate-ping"></div>
              )}

              {/* Icon */}
              <div className="text-8xl mb-6">
                {simState.success ? "🚀" : "💥"}
              </div>

              {/* Title */}
              <div
                className={`text-4xl font-bold mb-4 tracking-wide ${
                  simState.success ? "text-green-300" : "text-red-300"
                }`}
              >
                {simState.success ? "MISSION ACCOMPLISHED" : "MISSION FAILED"}
              </div>

              {/* Subtitle */}
              <div className="text-xl text-white/90 mb-8 font-medium max-w-2xl mx-auto leading-relaxed">
                {simState.success
                  ? "Congratulations! You've successfully completed the lunar landing mission. This represents a historic achievement in space exploration."
                  : simState.missionPhase === "failed" &&
                    simState.altitude < 1000
                  ? "Launch failure detected. The rocket crashed during initial ascent. Consider increasing thrust-to-weight ratio or reducing payload mass."
                  : simState.missionPhase === "failed" &&
                    simState.altitude < LOW_ORBIT_ALTITUDE
                  ? "Orbital insertion failed. Insufficient delta-v to achieve stable orbit. Review propulsion system specifications."
                  : "Mission incomplete. The rocket reached space but failed to complete the lunar transfer. Optimize trajectory calculations and fuel management."}
              </div>

              {/* Mission Stats */}
              <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-white/10">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <div className="text-gray-400 text-sm font-medium uppercase tracking-wide mb-2">
                      Max Altitude
                    </div>
                    <div className="text-4xl font-bold text-white font-mono">
                      {simState.altitude > 1000
                        ? `${(simState.altitude / 1000).toFixed(1)}km`
                        : `${Math.round(simState.altitude)}m`}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm font-medium uppercase tracking-wide mb-2">
                      Mission Phase
                    </div>
                    <div className="text-4xl font-bold text-white font-mono capitalize">
                      {simState.missionPhase.replace("_", " ")}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm font-medium uppercase tracking-wide mb-2">
                      Delta-V Used
                    </div>
                    <div className="text-4xl font-bold text-white font-mono">
                      {Math.round(deltaV)}m/s
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm font-medium uppercase tracking-wide mb-2">
                      Fuel Remaining
                    </div>
                    <div className="text-4xl font-bold text-white font-mono">
                      {Math.round(simState.fuel)}L
                    </div>
                  </div>
                </div>
              </div>

              {/* Mission Progress */}
              <div className="w-full bg-gray-800 rounded-full h-4 mb-8">
                <div
                  className={`h-4 rounded-full transition-all duration-1000 ${
                    simState.success
                      ? "bg-gradient-to-r from-green-500 to-green-400"
                      : "bg-gradient-to-r from-red-500 to-red-400"
                  }`}
                  style={{
                    width: `${
                      simState.success
                        ? 100
                        : simState.missionPhase === "landing"
                        ? 90
                        : simState.missionPhase === "lunar_approach"
                        ? 80
                        : simState.missionPhase === "transfer"
                        ? 60
                        : simState.missionPhase === "orbit"
                        ? 40
                        : simState.missionPhase === "launch"
                        ? 20
                        : 0
                    }%`,
                  }}
                />
              </div>

              {/* Achievement Badge */}
              {simState.success && (
                <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-400/50 rounded-full px-6 py-3 mb-8">
                  <span className="text-3xl">🌕</span>
                  <span className="text-green-300 font-semibold text-lg">
                    LUNAR LANDING ACHIEVEMENT UNLOCKED
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
