"use client";

import { useGame } from "./GameProvider";
import { useState, useEffect } from "react";
import Image from "next/image";

// Custom CSS for thrust fire animations
const thrustFireStyles = `
  @keyframes thrustFlicker {
    0%, 100% { opacity: 0.9; transform: scaleY(1); }
    25% { opacity: 0.7; transform: scaleY(1.1); }
    50% { opacity: 0.8; transform: scaleY(0.9); }
    75% { opacity: 0.6; transform: scaleY(1.05); }
  }
  
  @keyframes thrustPulse {
    0%, 100% { opacity: 0.85; transform: scaleY(1) scaleX(1); }
    50% { opacity: 0.95; transform: scaleY(1.2) scaleX(0.8); }
  }
  
  @keyframes particleFloat {
    0% { opacity: 0.8; transform: translateY(0) scale(1); }
    50% { opacity: 0.4; transform: translateY(-10px) scale(0.8); }
    100% { opacity: 0; transform: translateY(-20px) scale(0.5); }
  }
  
  .thrust-main {
    animation: thrustFlicker 0.1s ease-in-out infinite;
  }
  
  .thrust-side {
    animation: thrustPulse 0.15s ease-in-out infinite;
  }
  
  .thrust-particle {
    animation: particleFloat 0.8s ease-out infinite;
  }
`;

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
  failureReason?: string;
}

// Realistic physics constants
const MOON_DISTANCE = 384400000; // meters (384,400 km)
const LOW_ORBIT_ALTITUDE = 200000; // meters (200 km)
const LUNAR_ORBIT_ALTITUDE = 100000; // meters (100 km above moon)

// Generate stable star data to prevent hydration mismatches
const generateStarData = (count: number, seed: number = 12345) => {
  const stars = [];
  let currentSeed = seed;

  // Simple seeded random number generator
  const seededRandom = () => {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    return currentSeed / 233280;
  };

  for (let i = 0; i < count; i++) {
    stars.push({
      left: seededRandom() * 100,
      top: seededRandom() * 100,
      opacity: seededRandom() * 0.8 + 0.2,
      animationDelay: seededRandom() * 3,
      animationDuration: 2 + seededRandom() * 3,
    });
  }

  return stars;
};

// Generate stable star data
const starData = generateStarData(150);
const twinkleData = generateStarData(20, 54321);

export default function LaunchSimulation() {
  const { state, navigateTo } = useGame();
  const [isAITutorOpen, setIsAITutorOpen] = useState(false);

  // Inject custom CSS for thrust fire animations
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = thrustFireStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  const [chatMessages, setChatMessages] = useState([
    {
      id: "1",
      text: "Hi there, space explorer! I'm Dr. Luna, your AI tutor and space science mentor. I'm here to help you learn about physics, rockets, and space exploration! What would you like to know? 🚀✨",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [simState, setSimState] = useState<SimulationState>({
    altitude: 0,
    velocity: 0,
    horizontalVelocity: 0,
    angle: 0, // Start vertical (0 degrees = pointing up)
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
    rocketY: 85,
    failureReason: undefined,
  });

  // Calculate realistic physics parameters
  const rocketMass = state.currentRocket.mass;
  const thrust = state.currentRocket.thrust;
  const fuelCapacity = state.currentRocket.fuel;
  const drag = state.currentRocket.drag;

  // Calculate thrust-to-weight ratio with proper fuel mass
  const fuelDensity = 0.8; // kg/L for kerosene-based fuel
  const fuelMass = fuelCapacity * fuelDensity;
  const totalMass = rocketMass + fuelMass;
  const thrustToWeight = thrust / (totalMass * 9.81);

  // Calculate specific impulse based on engine type (more realistic)
  const engineTypes = state.currentRocket.parts.filter(
    (p) => p.type === "engine"
  );
  let specificImpulse = 300; // Default for liquid fuel

  if (engineTypes.length > 0) {
    // Calculate average specific impulse based on engine types
    const totalImpulse = engineTypes.reduce((sum, engine) => {
      // Different engines have different Isp values
      if (engine.id.includes("solid")) return sum + 250; // Solid fuel
      if (engine.id.includes("nuclear")) return sum + 800; // Nuclear thermal
      if (engine.id.includes("ion")) return sum + 3000; // Ion drive
      if (
        engine.id.includes("super-heavy") ||
        engine.id.includes("moon-rocket")
      )
        return sum + 350; // Heavy engines
      return sum + 300; // Default liquid fuel
    }, 0);
    specificImpulse = totalImpulse / engineTypes.length;
  }

  // Calculate fuel flow rate based on actual engine performance
  const fuelFlowRate =
    thrust > 0
      ? (thrust / (specificImpulse * 9.81)) * 0.5 // More realistic fuel consumption
      : 0.1; // Fallback fuel flow rate when no engines

  // Debug initial values
  console.log(
    `🚀 LaunchSimulation - Thrust: ${thrust}N, FuelCapacity: ${fuelCapacity}L, FuelFlowRate: ${fuelFlowRate.toFixed(
      2
    )} kg/s`
  );
  console.log(
    `🔧 Rocket Parts:`,
    state.currentRocket.parts.map((p) => `${p.name} (${p.type})`)
  );
  console.log(`📊 Rocket Stats:`, {
    mass: rocketMass,
    totalMass: totalMass,
    thrust,
    fuel: fuelCapacity,
    drag,
    thrustToWeight: thrustToWeight.toFixed(3),
    specificImpulse: specificImpulse.toFixed(0),
    deltaV: (
      specificImpulse *
      9.81 *
      Math.log((rocketMass + fuelMass) / rocketMass)
    ).toFixed(0),
  });

  // Calculate delta-v capability
  const deltaV =
    specificImpulse * 9.81 * Math.log((rocketMass + fuelMass) / rocketMass);

  useEffect(() => {
    if (simState.isLaunched && !simState.isComplete) {
      const interval = setInterval(() => {
        setSimState((prev) => {
          const dt = 0.1; // time step
          const newTime = prev.time + dt;

          // Calculate current mass (decreases as fuel burns)
          // const currentMass = rocketMass + prev.fuel / 1000; // convert fuel to kg
          const fuelRemaining = Math.max(
            0,
            prev.fuel - fuelFlowRate * dt * 1000
          ); // convert back to L

          // Debug fuel consumption
          if (prev.time % 1 < 0.1) {
            // Log every second
            console.log(
              `⛽ Fuel: ${prev.fuel.toFixed(1)}L → ${fuelRemaining.toFixed(
                1
              )}L (flow: ${fuelFlowRate.toFixed(2)} kg/s)`
            );
          }
          const hasFuel = fuelRemaining > 0;

          let newAltitude = prev.altitude;
          let newVelocity = prev.velocity;
          let newHorizontalVelocity = prev.horizontalVelocity;
          let newAngle = prev.angle;
          let newMissionPhase = prev.missionPhase;
          let newDistanceToMoon = prev.distanceToMoon;
          let isComplete = false;
          let success = false;

          // Calculate rocket angle - start vertical, then gradually point toward Moon
          if (newMissionPhase === "launch") {
            // During launch, gradually tilt from vertical (0°) to pointing toward Moon
            const launchProgress = Math.min(newTime / 10, 1);
            newAngle = launchProgress * 45; // Tilt up to 45 degrees during launch
          } else if (newMissionPhase === "orbit") {
            // During orbit, continue tilting toward Moon
            const orbitProgress = Math.min((newTime - 10) / 15, 1);
            newAngle = 45 + orbitProgress * 30; // Tilt from 45° to 75°
          } else if (newMissionPhase === "transfer") {
            // During transfer, point more directly toward Moon
            const transferProgress = Math.min((newTime - 25) / 20, 1);
            newAngle = 75 + transferProgress * 15; // Tilt from 75° to 90° (horizontal)
          } else {
            // Final phases - point directly toward Moon
            newAngle = 90;
          }

          // Demo mode: Realistic animation based on rocket capabilities
          if (isDemoMode) {
            // Calculate realistic demo values based on rocket configuration
            const deltaV =
              specificImpulse *
              9.81 *
              Math.log((rocketMass + fuelMass) / rocketMass);
            const capabilityFactor = Math.min(deltaV / 4000, 1); // Normalize to moon mission requirement

            // Realistic altitude progression based on rocket capability
            const progress = Math.min(newTime / 15, 1);
            if (progress < 0.1) {
              // Launch phase: 0 to 44km (Apollo launch to staging)
              const launchProgress = progress / 0.1;
              newAltitude = launchProgress * 44000 * capabilityFactor;
            } else if (progress < 0.2) {
              // Earth parking orbit: 44km to 170km
              const orbitProgress = (progress - 0.1) / 0.1;
              newAltitude = (44000 + orbitProgress * 126000) * capabilityFactor;
            } else if (progress < 0.7) {
              // Translunar injection: 170km to 185km
              const transferProgress = (progress - 0.2) / 0.5;
              newAltitude =
                (170000 + transferProgress * 15000) * capabilityFactor;
            } else if (progress < 0.9) {
              // Lunar approach: 185km to 2.6km
              const approachProgress = (progress - 0.7) / 0.2;
              newAltitude =
                (185000 - approachProgress * 182400) * capabilityFactor;
            } else {
              // Final landing: 2.6km to 0m
              const landingProgress = (progress - 0.9) / 0.1;
              newAltitude = (2600 - landingProgress * 2600) * capabilityFactor;
            }

            // Realistic velocity based on rocket thrust-to-weight ratio
            const baseVelocity = Math.min(thrustToWeight * 2000, 12000);
            newVelocity = baseVelocity * (1 - progress * 0.8); // Decrease as we approach moon
            newHorizontalVelocity = baseVelocity * 0.8 * (1 - progress * 0.9);

            // Realistic distance to moon based on rocket capability
            const distanceProgress = Math.min(progress * capabilityFactor, 1);
            const distanceCurve = 1 - Math.pow(distanceProgress, 1.5);
            newDistanceToMoon = Math.max(0, MOON_DISTANCE * distanceCurve);

            // Complete mission after 15 seconds
            if (newTime >= 15) {
              isComplete = true;
              success = true;
              newMissionPhase = "landing";
              newAltitude = 0;
              newVelocity = 0;
              newDistanceToMoon = 0;
            }
          } else {
            // Normal physics calculations
            if (prev.missionPhase === "launch") {
              if (hasFuel && prev.altitude < 100000) {
                // Apply thrust - use actual rocket physics
                const currentFuelMass = prev.fuel * fuelDensity;
                const currentMass = rocketMass + currentFuelMass;

                // Calculate net acceleration (thrust minus gravity minus drag)
                const gravityAcceleration = 9.81;
                const dragAcceleration =
                  (drag * newVelocity * newVelocity) / (currentMass * 1000); // Simplified drag model
                const thrustAcceleration = thrust / currentMass;
                const netAcceleration =
                  thrustAcceleration - gravityAcceleration - dragAcceleration;

                newVelocity += netAcceleration * dt;

                // Build horizontal velocity based on rocket angle and thrust
                const horizontalThrustComponent =
                  (thrust * Math.sin((newAngle * Math.PI) / 180)) / currentMass;
                newHorizontalVelocity += horizontalThrustComponent * dt;

                newAltitude = Math.max(0, prev.altitude + newVelocity * dt);
              } else if (prev.altitude > 0) {
                // No fuel but rocket is in the air - ballistic trajectory
                const currentMass = rocketMass; // No fuel mass when out of fuel
                const dragAcceleration =
                  (drag * newVelocity * newVelocity) / (currentMass * 1000);
                newVelocity -= (9.81 + dragAcceleration) * dt; // Gravity + drag
                newAltitude = Math.max(0, prev.altitude + newVelocity * dt);
              } else {
                // No fuel and on the ground - rocket cannot move
                newVelocity = 0;
                newAltitude = 0;
                newHorizontalVelocity = 0;
              }

              // Check if reached low Earth orbit
              if (
                prev.altitude >= LOW_ORBIT_ALTITUDE &&
                newHorizontalVelocity > 7000
              ) {
                newMissionPhase = "orbit";
              }

              // Check for failure conditions during launch (but allow lift-off animation first)
              if (newTime > 15.0) {
                // Wait 15 seconds before checking for failures (more forgiving for gameplay)
                if (prev.altitude <= 0 && prev.velocity < 0) {
                  // Crashed on ground
                  isComplete = true;
                  success = false;
                  newMissionPhase = "failed";
                } else if (prev.velocity < -150 && prev.altitude < 3000) {
                  // Falling too fast at low altitude (stall/spin) - more forgiving
                  isComplete = true;
                  success = false;
                  newMissionPhase = "failed";
                } else if (prev.fuel <= 0 && prev.altitude < 5000) {
                  // Out of fuel too early in launch - more forgiving
                  isComplete = true;
                  success = false;
                  newMissionPhase = "failed";
                }
              }
            }

            // Phase 2: Orbit (circularize and prepare for transfer)
            else if (prev.missionPhase === "orbit") {
              // Simplified orbital mechanics
              if (hasFuel) {
                newHorizontalVelocity += 100 * dt; // Build orbital velocity
                newAltitude += 100 * dt; // Maintain altitude
              } else {
                // No fuel in orbit - will decay
                newAltitude -= 50 * dt;
              }

              // Check if ready for lunar transfer
              if (newHorizontalVelocity >= 8000) {
                newMissionPhase = "transfer";
              }

              // Check for orbital decay failure
              if (newAltitude < 150000) {
                isComplete = true;
                success = false;
                newMissionPhase = "failed";
              }
            }

            // Phase 3: Transfer (coast to moon)
            else if (prev.missionPhase === "transfer") {
              // Realistic transfer - calculate distance based on actual delta-v capability
              newAltitude += 200 * dt; // Continue climbing

              // Calculate realistic distance to moon based on rocket's delta-v capability
              const deltaV =
                specificImpulse *
                9.81 *
                Math.log((rocketMass + fuelMass) / rocketMass);
              const transferProgress = Math.min((newTime - 25) / 20, 1); // 20 seconds for transfer

              // Distance reduction based on rocket capability and time
              const capabilityFactor = Math.min(deltaV / 4000, 1); // Normalize to moon mission requirement
              const timeFactor = transferProgress;
              const combinedProgress =
                capabilityFactor * 0.7 + timeFactor * 0.3; // Weighted by rocket capability

              const currentDistance = MOON_DISTANCE * (1 - combinedProgress);

              // Add some orbital mechanics - distance doesn't decrease linearly
              const orbitalFactor =
                Math.sin(transferProgress * Math.PI * 2) * 0.05; // Smaller oscillation
              newDistanceToMoon = Math.max(
                LUNAR_ORBIT_ALTITUDE,
                currentDistance + orbitalFactor * MOON_DISTANCE
              );

              // Check if reached moon (more realistic threshold)
              if (newDistanceToMoon <= LUNAR_ORBIT_ALTITUDE * 2) {
                newMissionPhase = "lunar_approach";
              }

              // Check for transfer failure (too much time or insufficient delta-v)
              if (
                (newTime > 200 && newDistanceToMoon > MOON_DISTANCE * 0.5) ||
                (deltaV < 2000 && newTime > 100)
              ) {
                isComplete = true;
                success = false;
                newMissionPhase = "failed";
              }
            }

            // Phase 4: Lunar approach
            else if (prev.missionPhase === "lunar_approach") {
              // Realistic lunar approach with gradual distance reduction
              const approachProgress = Math.min((newTime - 45) / 10, 1); // 10 seconds for approach

              // Gradually reduce distance to moon during approach
              newDistanceToMoon = Math.max(
                LUNAR_ORBIT_ALTITUDE * 0.1, // Don't go below 10% of lunar orbit
                LUNAR_ORBIT_ALTITUDE * (1 - approachProgress * 0.9)
              );

              if (hasFuel) {
                newHorizontalVelocity -= 50 * dt; // Slow down for approach
                newAltitude += 50 * dt; // Fine altitude adjustment
              }

              if (newHorizontalVelocity <= 2000) {
                newMissionPhase = "landing";
              }
            }

            // Phase 5: Landing
            else if (prev.missionPhase === "landing") {
              // Final landing phase with realistic distance to surface
              const landingProgress = Math.min((newTime - 55) / 5, 1); // 5 seconds for landing

              // Final approach - distance goes to surface level
              newDistanceToMoon = Math.max(
                0, // Can reach 0 (surface)
                LUNAR_ORBIT_ALTITUDE * 0.1 * (1 - landingProgress)
              );

              if (hasFuel && newVelocity > -5) {
                newVelocity -= 10 * dt; // Gentle descent
              } else {
                // No fuel - free fall
                newVelocity -= 20 * dt;
              }

              // Check for successful landing
              if (newVelocity >= -2 && newAltitude <= 1000) {
                isComplete = true;
                success = true;
              }

              // Check for crash landing
              if (newVelocity < -10 && newAltitude <= 1000) {
                isComplete = true;
                success = false;
                newMissionPhase = "failed";
              }
            }

            // Check for mission failure
            if (newTime > 300 && !isComplete) {
              // 5 minute timeout
              isComplete = true;
              success = false;
              newMissionPhase = "failed";
            }
          }

          // Use the initial rocket position as the starting point
          // Earth center is at bottom-8 left-1/2 = (50%, 92%)
          // Rocket starts centered on top of Earth for realistic launch
          const initialRocketPos = { x: 50, y: 85 }; // Centered on top of Earth
          const moonPos = { x: 67, y: 25 };

          let newRocketX, newRocketY;

          // Demo mode: Simple linear movement from Earth to Moon
          if (isDemoMode) {
            // Simple progress from 0 to 1 over 15 seconds (faster)
            const progress = Math.min(newTime / 15, 1);

            // Calculate target position based on progress from initial position to moon
            const targetX =
              initialRocketPos.x + (moonPos.x - initialRocketPos.x) * progress;
            const targetY =
              initialRocketPos.y + (moonPos.y - initialRocketPos.y) * progress;

            // For demo mode, start exactly at Earth position to avoid shifting
            if (newTime <= 0.2) {
              // First 0.2 seconds: stay exactly at Earth position - NO MOVEMENT
              newRocketX = initialRocketPos.x;
              newRocketY = initialRocketPos.y;
            } else {
              // After 0.2 seconds: smooth movement to target
              const smoothness = 0.15; // Faster smoothness for demo
              newRocketX = prev.rocketX + (targetX - prev.rocketX) * smoothness;
              newRocketY = prev.rocketY + (targetY - prev.rocketY) * smoothness;
            }

            // Demo mode distance calculation - realistic progression
            const distanceProgress = Math.min(newTime / 15, 1);
            // Use a more realistic distance curve (not linear)
            const distanceCurve = 1 - Math.pow(distanceProgress, 1.5); // Slower initial, faster at end
            newDistanceToMoon = Math.max(0, MOON_DISTANCE * distanceCurve);
          } else {
            // Normal mode: Complex phase-based positioning
            // During initial launch phase, ignore progress calculation and stay near Earth
            if (newTime <= 5.0 && newMissionPhase === "launch") {
              // First 5 seconds: rocket stays at or near initial position with lift-off animation
              if (newTime <= 0.2) {
                // First 0.2 seconds: rocket is exactly at initial position (no movement)
                newRocketX = initialRocketPos.x;
                newRocketY = initialRocketPos.y;
              } else {
                // 0.2 to 5 seconds: gradual lift-off from initial position
                const liftProgress = (newTime - 0.2) / 4.8; // 0 to 1 over 4.8 seconds
                const liftHeight = liftProgress * 2; // Lift 2% up from initial position
                newRocketX = initialRocketPos.x;
                newRocketY = initialRocketPos.y - liftHeight; // Move up from initial position
              }
            } else {
              // After 5 seconds or other phases: use progress calculation for trajectory
              let progress = 0;

              if (newMissionPhase === "launch") {
                progress = Math.min((newTime - 5) / 10, 0.3); // Start progress after 5 seconds
              } else if (newMissionPhase === "orbit") {
                progress = 0.3 + Math.min((newTime - 10) / 15, 0.3); // Move 30% more in next 15 seconds
              } else if (newMissionPhase === "transfer") {
                progress = 0.6 + Math.min((newTime - 25) / 20, 0.3); // Move 30% more in next 20 seconds
              } else if (newMissionPhase === "lunar_approach") {
                progress = 0.9 + Math.min((newTime - 45) / 10, 0.08); // Final approach
              } else if (newMissionPhase === "landing") {
                progress = 0.98; // Almost at moon
              } else if (newMissionPhase === "failed") {
                progress = Math.min(newTime / 20, 0.5); // Show failure position
              } else {
                // Fallback: just move based on time if mission phase is stuck
                progress = Math.min(newTime / 30, 0.8);
              }

              // Calculate target position based on progress from initial position to moon
              const targetX =
                initialRocketPos.x +
                (moonPos.x - initialRocketPos.x) * progress;
              const targetY =
                initialRocketPos.y +
                (moonPos.y - initialRocketPos.y) * progress;

              // Smooth interpolation for the rest of the flight
              const smoothness = 0.15; // Slower smoothness for more controlled movement
              newRocketX = prev.rocketX + (targetX - prev.rocketX) * smoothness;
              newRocketY = prev.rocketY + (targetY - prev.rocketY) * smoothness;
            }
          }

          // Debug logging to see rocket movement
          if (newTime % 1 < 0.1) {
            // Log every 1 second for more detailed debugging
            console.log(
              `🚀 ROCKET DEBUG - Time: ${newTime.toFixed(
                1
              )}s, Phase: ${newMissionPhase}`
            );
            console.log(
              `📍 POSITION - Previous: (${prev.rocketX.toFixed(
                1
              )}, ${prev.rocketY.toFixed(1)}), New: (${newRocketX.toFixed(
                1
              )}, ${newRocketY.toFixed(1)})`
            );
            console.log(
              `🎯 CALCULATION - Initial: (${initialRocketPos.x}, ${initialRocketPos.y}), Moon: (${moonPos.x}, ${moonPos.y})`
            );
            console.log(
              `🚀 ROCKET POSITION - Current: (${newRocketX.toFixed(
                1
              )}, ${newRocketY.toFixed(1)})`
            );
            console.log(
              `📊 PHYSICS - Alt: ${newAltitude.toFixed(
                0
              )}m, Vel: ${newVelocity.toFixed(1)}m/s, Angle: ${newAngle.toFixed(
                1
              )}°`
            );
            console.log("---");
          }

          const newPositionHistory = [
            ...prev.positionHistory.slice(-20), // Keep last 20 positions
            { x: newRocketX, y: newRocketY, time: newTime },
          ];

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
    isDemoMode,
    fuelMass,
    specificImpulse,
  ]);

  const handleLaunch = () => {
    // Check if rocket has fuel before launching
    if (fuelCapacity <= 0) {
      console.log("❌ Cannot launch: No fuel available!");
      alert(
        "Cannot launch rocket without fuel! Please add a fuel tank to your rocket design."
      );
      return;
    }

    console.log("🚀 LAUNCH BUTTON CLICKED!");
    console.log("📍 Initial rocket position:", {
      x: simState.rocketX,
      y: simState.rocketY,
    });
    console.log("🌍 Earth position:", { x: 50, y: 92 });
    console.log("🌙 Moon position:", { x: 67, y: 25 });
    console.log("⏱️ Starting simulation...");
    console.log("🎯 Rocket starts on top of Earth (50%, 85%)");
    setSimState((prev) => ({ ...prev, isLaunched: true }));
  };

  const handleDemoMode = () => {
    console.log("🎬 DEMO MODE BUTTON CLICKED!");
    console.log("🎭 Starting demo animation without failure conditions...");
    setIsDemoMode(true);
    setSimState((prev) => ({
      ...prev,
      isLaunched: true,
      rocketX: 50, // Ensure rocket starts on top of Earth
      rocketY: 88, // Ensure rocket starts on top of Earth
      time: 0, // Reset time to start fresh
    }));
  };

  const handleRetry = () => {
    console.log("🔄 RETRY BUTTON CLICKED!");
    console.log("📍 Resetting rocket to Earth position:", { x: 50, y: 85 });
    // Add visual feedback
    const button = document.querySelector(
      '[data-testid="retry-button"]'
    ) as HTMLElement;
    if (button) {
      button.style.transform = "scale(0.95)";
      setTimeout(() => {
        button.style.transform = "scale(1)";
      }, 150);
    }
    setIsDemoMode(false); // Reset demo mode
    setSimState({
      altitude: 0,
      velocity: 0,
      horizontalVelocity: 0,
      angle: 0, // Reset to vertical
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
      rocketY: 85,
    });
  };

  const handleBackToBuilder = () => {
    console.log("Back to Builder button clicked");
    try {
      navigateTo("/builder");
    } catch (error) {
      console.error("Navigation error:", error);
      // Fallback navigation
      window.location.href = "/builder";
    }
  };

  const handleClosePopup = () => {
    console.log("Close popup button clicked");
    // Just close the popup without navigating
    setSimState((prev) => ({
      ...prev,
      isComplete: false,
    }));
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: chatInput.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    const currentInput = chatInput.trim();
    setChatInput("");
    setIsTyping(true);

    // Prepare conversation history (including the current message we just added)
    const conversationHistory = [...chatMessages, userMessage].map((msg) => ({
      isUser: msg.isUser,
      text: msg.text,
    }));

    // Create enhanced context with rocket and simulation data
    const rocketContext = {
      // Current rocket configuration
      rocket: {
        mass: state.currentRocket.mass,
        thrust: state.currentRocket.thrust,
        fuel: state.currentRocket.fuel,
        drag: state.currentRocket.drag,
        parts: state.currentRocket.parts.map((part) => ({
          name: part.name,
          type: part.type,
          id: part.id,
        })),
      },
      // Current simulation state
      simulation: {
        altitude: Math.round(simState.altitude),
        velocity: Math.round(simState.velocity),
        horizontalVelocity: Math.round(simState.horizontalVelocity),
        angle: Math.round(simState.angle),
        fuel: Math.round(simState.fuel),
        time: Math.round(simState.time * 10) / 10,
        missionPhase: simState.missionPhase,
        distanceToMoon: Math.round(simState.distanceToMoon / 1000), // Convert to km
        isLaunched: simState.isLaunched,
        isComplete: simState.isComplete,
        success: simState.success,
      },
      // Calculated physics data
      physics: {
        thrustToWeight: Math.round(thrustToWeight * 100) / 100,
        specificImpulse: Math.round(specificImpulse),
        deltaV: Math.round(deltaV),
        fuelFlowRate: Math.round(fuelFlowRate * 100) / 100,
        totalMass: Math.round(totalMass),
      },
    };

    // Create enhanced input text with context
    const enhancedInputText = `${currentInput}

CONTEXT: I'm currently in a rocket simulation with the following setup:
- Mission Phase: ${simState.missionPhase}
- Altitude: ${Math.round(simState.altitude)}m
- Velocity: ${Math.round(simState.velocity)}m/s
- Fuel Remaining: ${Math.round(simState.fuel)}L
- Distance to Moon: ${Math.round(simState.distanceToMoon / 1000)}km
- Rocket Mass: ${state.currentRocket.mass}kg
- Thrust: ${state.currentRocket.thrust}N
- Thrust-to-Weight Ratio: ${Math.round(thrustToWeight * 100) / 100}
- Delta-V: ${Math.round(deltaV)}m/s
- Rocket Parts: ${state.currentRocket.parts.map((p) => p.name).join(", ")}

Please provide guidance based on my current rocket configuration and mission status.`;

    const payload = {
      inputText: enhancedInputText,
      conversation: conversationHistory,
      subject: "Space Science",
      difficulty: "beginner",
      language: "en",
      userId: `launch_sim_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      context: rocketContext,
    };

    const apiUrl =
      process.env.NEXT_PUBLIC_AI_TUTOR_API_URL || "http://localhost:8080";

    try {
      console.log(
        "LaunchSimulation AI Tutor: Making API request to:",
        `${apiUrl}/api/sherockets-tutor`
      );
      console.log("LaunchSimulation AI Tutor: Payload:", payload);

      const response = await fetch(`${apiUrl}/api/sherockets-tutor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`
        );
      }

      const aiResponse = await response.json();
      console.log(
        "LaunchSimulation AI Tutor: API Success! Response:",
        aiResponse
      );

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponse.response,
        isUser: false,
        timestamp: new Date(),
      };

      setChatMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error calling AI tutor API:", error);
      console.error("Error details:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        apiUrl: `${apiUrl}/api/sherockets-tutor`,
        payload: payload,
      });

      // Fallback to mock response if API fails
      const fallbackResponse = generateAIResponse(currentInput, rocketContext);
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: `⚠️ API Connection Issue: ${fallbackResponse}`,
        isUser: false,
        timestamp: new Date(),
      };

      setChatMessages((prev) => [...prev, aiMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateAIResponse = (
    userInput: string,
    context?: {
      rocket: {
        mass: number;
        thrust: number;
        fuel: number;
        drag: number;
        parts: Array<{ name: string; type: string; id: string }>;
      };
      simulation: {
        altitude: number;
        velocity: number;
        horizontalVelocity: number;
        angle: number;
        fuel: number;
        time: number;
        missionPhase: string;
        distanceToMoon: number;
        isLaunched: boolean;
        isComplete: boolean;
        success: boolean;
      };
      physics: {
        thrustToWeight: number;
        specificImpulse: number;
        deltaV: number;
        fuelFlowRate: number;
        totalMass: number;
      };
    }
  ): string => {
    const input = userInput.toLowerCase();

    // Context-aware responses based on current simulation state
    if (context) {
      const { simulation, rocket, physics } = context;

      if (input.includes("help") || input.includes("stuck")) {
        if (simulation.missionPhase === "launch") {
          return `I can see you're in the launch phase! 🚀 Your rocket has a thrust-to-weight ratio of ${
            physics.thrustToWeight
          }. ${
            physics.thrustToWeight < 1
              ? "You might need more thrust or less weight to get off the ground!"
              : "That looks good for launch!"
          } Your current altitude is ${simulation.altitude}m and velocity is ${
            simulation.velocity
          }m/s. Keep an eye on your fuel - you have ${
            simulation.fuel
          }L remaining!`;
        } else if (simulation.missionPhase === "orbit") {
          return `Great job reaching orbit! 🌍 You're at ${simulation.altitude}m altitude with ${simulation.velocity}m/s velocity. Your horizontal velocity of ${simulation.horizontalVelocity}m/s is building up for orbital mechanics. You have ${simulation.fuel}L of fuel left - use it wisely for the next phase!`;
        } else if (simulation.missionPhase === "transfer") {
          return `Excellent! You're in the transfer phase! 🌙 You're ${
            simulation.distanceToMoon
          }km from the Moon. Your delta-v of ${physics.deltaV}m/s ${
            physics.deltaV > 4000
              ? "should be sufficient"
              : "might be challenging"
          } for a lunar mission. Keep monitoring your fuel consumption!`;
        }
      }

      if (input.includes("fuel") || input.includes("engine")) {
        return `Your rocket has ${
          simulation.fuel
        }L of fuel remaining with a fuel flow rate of ${
          physics.fuelFlowRate
        } kg/s. Your engines are producing ${
          rocket.thrust
        }N of thrust, giving you a thrust-to-weight ratio of ${
          physics.thrustToWeight
        }. ${
          simulation.fuel < 100
            ? "⚠️ Low fuel warning! Consider your next moves carefully."
            : "Your fuel levels look good for now!"
        }`;
      }

      if (input.includes("velocity") || input.includes("speed")) {
        return `Your current velocity is ${
          simulation.velocity
        }m/s with a horizontal component of ${
          simulation.horizontalVelocity
        }m/s. You're in the ${simulation.missionPhase} phase. ${
          simulation.missionPhase === "launch" && simulation.velocity < 1000
            ? "You're still in the early launch phase - keep building that velocity!"
            : "Your velocity looks good for this phase!"
        }`;
      }

      if (input.includes("altitude") || input.includes("height")) {
        return `You're currently at ${simulation.altitude}m altitude in the ${
          simulation.missionPhase
        } phase. ${
          simulation.altitude < 100000
            ? "You're still in the atmosphere - keep climbing!"
            : "Great job reaching space altitude!"
        } Your distance to the Moon is ${simulation.distanceToMoon}km.`;
      }
    }

    // General responses (fallback)
    if (input.includes("rocket") || input.includes("launch")) {
      return "Great question about rockets! 🚀 Rockets work using Newton's Third Law - for every action, there's an equal and opposite reaction. When the rocket pushes exhaust gases down, the gases push the rocket up! The more fuel you burn, the more thrust you get. Want to learn about different rocket parts?";
    }

    if (input.includes("physics") || input.includes("science")) {
      return "Physics is amazing! 🌟 It's the study of how things move and interact. In space, we deal with gravity, momentum, and energy. Did you know that in space, you can't hear sounds because there's no air? That's why we see explosions but don't hear them in movies! What specific physics concept interests you?";
    }

    if (input.includes("space") || input.includes("planet")) {
      return "Space is incredible! 🌌 There are 8 planets in our solar system, and each one is unique. Earth is special because it has water and air that we can breathe. Mars is red because of iron oxide (rust) on its surface! Would you like to learn about building a rocket to visit other planets?";
    }

    if (input.includes("hello") || input.includes("hi")) {
      return "Hello, future astronaut! 👩‍🚀 I'm so excited to help you on your space journey! I'm Dr. Luna, and I've been studying space science for many years. What's your name, and what would you like to explore today?";
    }

    if (input.includes("gravity") || input.includes("weight")) {
      return "Gravity is fascinating! 🌍 It's the invisible force that pulls everything toward Earth. To escape Earth's gravity, rockets need to reach about 25,000 mph! That's why we need powerful engines and lots of fuel. The bigger your rocket, the more fuel you'll need to fight gravity!";
    }

    if (input.includes("mars") || input.includes("moon")) {
      return "Exploring other worlds is so exciting! 🌙🚀 The Moon is much closer than Mars, but Mars has an atmosphere (though very thin). Each destination requires different rocket designs. What would you like to know about space travel to these amazing places?";
    }

    // Default responses
    const responses = [
      "That's a wonderful question! 🤔 Let me think about that... In space science, we're always learning new things. Can you tell me more about what you're curious about?",
      "I love your curiosity! ✨ That reminds me of when I was learning about space. Have you tried experimenting with different rocket designs? Sometimes the best way to learn is by trying!",
      "What an interesting thought! 🌟 You know, many famous scientists started with questions just like yours. What made you think about that?",
      "Great thinking! 🚀 You're developing the mind of a true scientist. Have you considered how this might relate to your rocket building?",
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleChatKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleContinue = () => {
    console.log("Continue button clicked, success:", simState.success);
    try {
      if (simState.success) {
        navigateTo("/victory");
      } else {
        navigateTo("/results");
      }
    } catch (error) {
      console.error("Navigation error:", error);
      // Fallback navigation
      if (simState.success) {
        window.location.href = "/victory";
      } else {
        window.location.href = "/results";
      }
    }
  };

  // Use the stored rocket position from simulation state
  const rocketPos = { x: simState.rocketX, y: simState.rocketY };

  // Add keyboard shortcut to close popup
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Escape" && simState.isComplete) {
        handleClosePopup();
      }
    };

    if (simState.isComplete) {
      document.addEventListener("keydown", handleKeyPress);
      return () => document.removeEventListener("keydown", handleKeyPress);
    }
  }, [simState.isComplete]);

  return (
    <>
      <style jsx>{`
        @keyframes rocketGlow {
          0% {
            filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.6));
          }
          100% {
            filter: drop-shadow(0 0 16px rgba(59, 130, 246, 1));
          }
        }
      `}</style>
      <div className="relative h-screen bg-black overflow-hidden">
        {/* Professional Space Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-black to-slate-900">
          {/* Enhanced star field */}
          {starData.map((star, i) => (
            <div
              key={i}
              className="absolute w-px h-px bg-white rounded-full animate-pulse shadow-lg"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                opacity: star.opacity,
                animationDelay: `${star.animationDelay}s`,
                animationDuration: `${star.animationDuration}s`,
                boxShadow: `0 0 4px rgba(255, 255, 255, ${star.opacity})`,
              }}
            />
          ))}
          {/* Twinkling stars */}
          {twinkleData.map((star, i) => (
            <div
              key={`twinkle-${i}`}
              className="absolute w-1 h-1 bg-blue-200 rounded-full animate-ping"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                animationDelay: `${star.animationDelay}s`,
                animationDuration: `${star.animationDuration}s`,
              }}
            />
          ))}
        </div>

        {/* Clean Header with Mission Status */}
        <div className="absolute top-0 left-0 right-0 z-20">
          <div className="bg-black/40 backdrop-blur-xl border-b border-white/20">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500/80 rounded-lg flex items-center justify-center">
                      <Image
                        src="/rocket.png"
                        alt="Rocket"
                        width={16}
                        height={16}
                        className="w-4 h-4"
                      />
                    </div>
                    <div>
                      <h1 className="text-white text-lg font-medium">
                        Mission Control
                      </h1>
                      <p className="text-gray-300 text-sm">
                        {isDemoMode
                          ? "Demo Mode - No Failures"
                          : "Lunar Landing Mission"}
                      </p>
                    </div>
                  </div>

                  {/* Mission Status inline */}
                  <div className="flex items-center space-x-4">
                    {/* Mission Time */}
                    <div className="text-center">
                      <div className="text-gray-300 text-xs font-medium mb-1">
                        MISSION TIME
                      </div>
                      <div className="text-white text-lg font-mono">
                        {(() => {
                          // Simulated realistic mission time
                          const realTime = simState.time; // Actual simulation time (0-15s)
                          const totalSimTime = 15; // Total simulation duration

                          // Realistic mission timeline: ~3.5 days total
                          const totalMissionTime =
                            8 * 60 +
                            2 * 60 * 60 +
                            3 * 24 * 60 * 60 +
                            12 * 60 * 60 +
                            30 * 60; // ~3.5 days
                          const progress = realTime / totalSimTime;
                          const simulatedTime = progress * totalMissionTime;

                          // Format based on duration
                          if (simulatedTime < 60) {
                            return `${Math.floor(simulatedTime)}s`;
                          } else if (simulatedTime < 3600) {
                            return `${Math.floor(
                              simulatedTime / 60
                            )}m ${Math.floor(simulatedTime % 60)}s`;
                          } else if (simulatedTime < 86400) {
                            return `${Math.floor(
                              simulatedTime / 3600
                            )}h ${Math.floor((simulatedTime % 3600) / 60)}m`;
                          } else {
                            return `${Math.floor(
                              simulatedTime / 86400
                            )}d ${Math.floor((simulatedTime % 86400) / 3600)}h`;
                          }
                        })()}
                      </div>
                      <div className="text-gray-400 text-xs">(simulated)</div>
                    </div>

                    {/* Divider */}
                    <div className="w-px h-8 bg-white/20"></div>

                    {/* Phase */}
                    <div className="text-center">
                      <div className="text-gray-300 text-xs font-medium mb-1">
                        PHASE
                      </div>
                      <div
                        className={`text-sm font-medium capitalize ${
                          simState.missionPhase === "failed"
                            ? "text-red-400"
                            : simState.missionPhase === "landing"
                            ? "text-green-400"
                            : "text-blue-400"
                        }`}
                      >
                        {simState.missionPhase.replace("_", " ")}
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="w-px h-8 bg-white/20"></div>

                    {/* Altitude */}
                    <div className="text-center">
                      <div className="text-gray-300 text-xs font-medium mb-1">
                        ALTITUDE
                      </div>
                      <div className="text-white text-lg font-mono">
                        {(() => {
                          if (isDemoMode) {
                            // Demo mode: Show realistic altitude progression
                            const progress = simState.time / 15; // 0 to 1 over 15 seconds

                            if (progress < 0.1) {
                              // Launch phase: 0 to 44km (Apollo launch to staging)
                              const launchProgress = progress / 0.1;
                              const altitude = launchProgress * 44000; // 0 to 44km (Apollo staging altitude)
                              return altitude > 1000
                                ? `${(altitude / 1000).toFixed(1)}km`
                                : `${Math.round(altitude)}m`;
                            } else if (progress < 0.2) {
                              // Earth parking orbit: 44km to 170km (Apollo parking orbit)
                              const orbitProgress = (progress - 0.1) / 0.1;
                              const altitude = 44000 + orbitProgress * 126000; // 44km to 170km
                              return `${(altitude / 1000).toFixed(1)}km`;
                            } else if (progress < 0.7) {
                              // Translunar injection: 170km to 185km (lunar orbit insertion)
                              const transferProgress = (progress - 0.2) / 0.5;
                              const altitude =
                                170000 + transferProgress * 15000; // 170km to 185km
                              return `${(altitude / 1000).toFixed(1)}km`;
                            } else if (progress < 0.9) {
                              // Lunar approach: 185km to 2.6km (Apollo descent)
                              const approachProgress = (progress - 0.7) / 0.2;
                              const altitude =
                                185000 - approachProgress * 182400; // 185km to 2.6km
                              return altitude > 1000
                                ? `${(altitude / 1000).toFixed(1)}km`
                                : `${Math.round(altitude)}m`;
                            } else {
                              // Final landing: 2.6km to 0m (Apollo touchdown)
                              const landingProgress = (progress - 0.9) / 0.1;
                              const altitude = 2600 - landingProgress * 2600; // 2.6km to 0m
                              return altitude > 1000
                                ? `${(altitude / 1000).toFixed(1)}km`
                                : `${Math.round(altitude)}m`;
                            }
                          } else {
                            // Normal mode: Use actual altitude
                            return simState.altitude > 1000
                              ? `${(simState.altitude / 1000).toFixed(1)}km`
                              : `${Math.round(simState.altitude)}m`;
                          }
                        })()}
                      </div>
                      {isDemoMode && (
                        <div className="text-gray-400 text-xs">(simulated)</div>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="w-px h-8 bg-white/20"></div>

                    {/* Velocity */}
                    <div className="text-center">
                      <div className="text-gray-300 text-xs font-medium mb-1">
                        VELOCITY
                      </div>
                      <div className="text-white text-lg font-mono">
                        {(() => {
                          if (isDemoMode) {
                            // Demo mode: Show realistic velocity progression
                            const progress = simState.time / 15; // 0 to 1 over 15 seconds

                            if (progress < 0.1) {
                              // Launch phase: 0 to 1,980 m/s (Apollo staging velocity)
                              const launchProgress = progress / 0.1;
                              return Math.round(launchProgress * 1980);
                            } else if (progress < 0.2) {
                              // Earth parking orbit: 1,980 to 7,809 m/s (Apollo orbital velocity)
                              const orbitProgress = (progress - 0.1) / 0.1;
                              return Math.round(1980 + orbitProgress * 5829);
                            } else if (progress < 0.7) {
                              // Translunar injection: 7,809 to 10,827 m/s (Apollo TLI velocity)
                              const transferProgress = (progress - 0.2) / 0.5;
                              return Math.round(7809 + transferProgress * 3018);
                            } else if (progress < 0.9) {
                              // Lunar approach: 10,827 to 1,500 m/s (lunar orbit insertion)
                              const approachProgress = (progress - 0.7) / 0.2;
                              return Math.round(
                                10827 - approachProgress * 9327
                              );
                            } else {
                              // Final landing: 1,500 to 0 m/s (Apollo descent and touchdown)
                              const landingProgress = (progress - 0.9) / 0.1;
                              return Math.round(1500 - landingProgress * 1500);
                            }
                          } else {
                            // Normal mode: Use actual velocity
                            return Math.round(simState.velocity);
                          }
                        })()}
                        m/s
                      </div>
                      {isDemoMode && (
                        <div className="text-gray-400 text-xs">(simulated)</div>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="w-px h-8 bg-white/20"></div>

                    {/* Fuel */}
                    <div className="text-center">
                      <div className="text-gray-300 text-xs font-medium mb-1">
                        FUEL
                      </div>
                      <div className="text-white text-lg font-mono">
                        {Math.round(simState.fuel)}L
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="w-px h-8 bg-white/20"></div>

                    {/* Distance to Moon */}
                    <div className="text-center">
                      <div className="text-gray-300 text-xs font-medium mb-1">
                        TO MOON
                      </div>
                      <div className="text-blue-400 text-lg font-mono">
                        {simState.distanceToMoon > 1000000
                          ? `${(simState.distanceToMoon / 1000).toFixed(0)} km`
                          : `${Math.round(simState.distanceToMoon / 1000)}k km`}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Clean AI Tutor Button */}
                <button
                  onClick={() => setIsAITutorOpen(!isAITutorOpen)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isAITutorOpen
                      ? "bg-blue-500/80 text-white"
                      : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <span>👩‍🚀</span>
                    <span>{isAITutorOpen ? "Hide" : "AI Tutor"}</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Celestial Bodies */}
        <div className="absolute inset-0">
          {/* Earth */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-b from-blue-400 via-blue-600 to-green-600 rounded-full shadow-2xl border-2 border-blue-300/40 animate-pulse">
                <div className="absolute inset-4 bg-gradient-to-b from-green-400 to-blue-500 rounded-full opacity-80"></div>
                <div className="absolute top-4 left-5 w-2.5 h-2.5 bg-white/95 rounded-full animate-ping shadow-lg"></div>
                <div className="absolute top-6 right-4 w-1.5 h-1.5 bg-white/80 rounded-full"></div>
                <div className="absolute bottom-5 left-6 w-2 h-2 bg-white/90 rounded-full"></div>
                <div className="absolute top-1/2 right-6 w-1 h-1 bg-white/70 rounded-full"></div>
                <div className="absolute bottom-1/3 left-3 w-1 h-1 bg-white/60 rounded-full"></div>
                {/* Enhanced atmospheric glow */}
                <div className="absolute -inset-3 bg-blue-400/25 rounded-full blur-md"></div>
                <div className="absolute -inset-1 bg-green-400/15 rounded-full blur-sm"></div>
              </div>

              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                <div className="bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
                  <span className="text-white text-xs font-medium">EARTH</span>
                </div>
              </div>
            </div>
          </div>

          {/* Moon */}
          {!simState.success && (
            <div className="absolute top-1/4 right-1/3">
              <div className="relative">
                <div className="w-28 h-28 bg-gradient-to-b from-gray-200 via-gray-400 to-gray-600 rounded-full shadow-2xl border-2 border-gray-200/60">
                  <div className="absolute inset-3 bg-gradient-to-b from-gray-100 to-gray-500 rounded-full opacity-90"></div>
                  <div className="absolute top-4 left-4 w-2 h-2 bg-gray-700 rounded-full shadow-sm"></div>
                  <div className="absolute bottom-5 right-4 w-1.5 h-1.5 bg-gray-600 rounded-full"></div>
                  <div className="absolute top-1/2 left-3 w-1.5 h-1.5 bg-gray-700 rounded-full"></div>
                  <div className="absolute top-5 right-5 w-1 h-1 bg-gray-600 rounded-full"></div>
                  <div className="absolute bottom-4 left-4 w-1 h-1 bg-gray-700 rounded-full"></div>
                  <div className="absolute top-1/3 right-2 w-0.5 h-0.5 bg-gray-600 rounded-full"></div>
                  <div className="absolute bottom-1/3 left-2 w-0.5 h-0.5 bg-gray-700 rounded-full"></div>
                  {/* Enhanced Moon glow */}
                  <div className="absolute -inset-2 bg-gray-200/20 rounded-full blur-md"></div>
                  <div className="absolute -inset-1 bg-white/10 rounded-full blur-sm"></div>
                </div>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                  <div className="bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
                    <span className="text-white text-xs font-medium">MOON</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Trajectory Visualization */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <linearGradient
              id="trajectoryGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient
              id="trailGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          {/* Earth to Moon trajectory */}
          <path
            d="M 50 70 Q 58 40 67 25"
            stroke="url(#trajectoryGradient)"
            strokeWidth="3"
            fill="none"
            strokeDasharray="12,8"
            className="animate-pulse"
            filter="drop-shadow(0 0 4px rgba(59, 130, 246, 0.5))"
          />

          {/* Dynamic trajectory path showing rocket's actual path */}
          {simState.isLaunched && (
            <path
              d={`M 25 70 Q ${25 + (rocketPos.x - 25) * 0.6} ${
                70 + (rocketPos.y - 70) * 0.4
              } ${rocketPos.x} ${rocketPos.y}`}
              stroke="url(#trajectoryGradient)"
              strokeWidth="3"
              fill="none"
              strokeDasharray="6,6"
              className="animate-pulse"
              style={{
                filter: "drop-shadow(0 0 8px rgba(59, 130, 246, 0.8))",
              }}
            />
          )}

          {/* Rocket trail */}
          {simState.isLaunched && simState.positionHistory.length > 1 && (
            <path
              d={`M ${simState.positionHistory
                .map((pos) => `${pos.x} ${pos.y}`)
                .join(" L ")}`}
              stroke="url(#trailGradient)"
              strokeWidth="2"
              fill="none"
              strokeDasharray="3,3"
              className="animate-pulse"
              style={{
                filter: "drop-shadow(0 0 6px rgba(59, 130, 246, 0.6))",
              }}
            />
          )}
        </svg>

        {/* Congratulations Message */}
        {simState.success && (
          <div className="absolute inset-0 flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-pink-300/95 via-purple-400/95 to-blue-400/95 backdrop-blur-xl rounded-3xl p-10 border-2 border-white/30 shadow-2xl text-center relative">
              {/* Close Button */}
              <button
                onClick={() =>
                  setSimState((prev) => ({ ...prev, success: false }))
                }
                className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors duration-200"
                aria-label="Close congratulations"
              >
                <span className="text-white text-lg font-bold">×</span>
              </button>
              <div className="text-7xl mb-6 animate-bounce">🌟</div>
              <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
                Amazing Job!
              </h1>
              <p className="text-2xl text-white/95 mb-6 font-medium">
                You&apos;re an amazing space explorer!
              </p>
              <div className="text-3xl mb-8 space-x-4">
                <span
                  className="animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                >
                  🚀
                </span>
                <span
                  className="animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                >
                  🌙
                </span>
                <span
                  className="animate-bounce"
                  style={{ animationDelay: "0.3s" }}
                >
                  ✨
                </span>
                <span
                  className="animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                >
                  💫
                </span>
                <span
                  className="animate-bounce"
                  style={{ animationDelay: "0.5s" }}
                >
                  🦄
                </span>
              </div>
              <p className="text-xl text-white/90 font-medium">
                You&apos;ve conquered the stars! 🌟
              </p>
              <div className="mt-6 text-4xl">
                <span className="animate-pulse">💖</span>
                <span
                  className="mx-4 animate-pulse"
                  style={{ animationDelay: "0.5s" }}
                >
                  🌸
                </span>
                <span
                  className="animate-pulse"
                  style={{ animationDelay: "1s" }}
                >
                  💖
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Rocket (both static and launched) */}
        <div
          className="absolute transition-all duration-500 ease-out"
          style={{
            left: `${rocketPos.x}%`,
            top: `${rocketPos.y}%`,
            transform: `translate(-50%, -50%) rotate(${simState.angle}deg)`,
          }}
        >
          <div className="relative">
            {/* Rocket icon */}
            <div className="text-6xl transition-all duration-300 relative z-10">
              {!simState.isLaunched ? (
                // Static rocket on Earth
                <Image
                  src="/rocket.png"
                  alt="Rocket"
                  width={96}
                  height={96}
                  className="w-24 h-24 drop-shadow-lg"
                  style={{
                    filter:
                      "drop-shadow(0 0 8px rgba(255, 255, 255, 0.5)) drop-shadow(0 0 16px rgba(59, 130, 246, 0.3))",
                  }}
                />
              ) : simState.missionPhase === "failed" ? (
                // Failed rocket
                <Image
                  src="/rocket.png"
                  alt="Rocket"
                  width={96}
                  height={96}
                  className="w-24 h-24 opacity-60 animate-pulse grayscale"
                />
              ) : (
                // Launched rocket
                <Image
                  src="/rocket.png"
                  alt="Rocket"
                  width={96}
                  height={96}
                  className="w-24 h-24 drop-shadow-lg"
                  style={{
                    filter:
                      "drop-shadow(0 0 16px rgba(59, 130, 246, 0.9)) drop-shadow(0 0 24px rgba(139, 92, 246, 0.6))",
                    animation: "rocketGlow 2s ease-in-out infinite alternate",
                  }}
                />
              )}
            </div>

            {/* Rocket thrust effect */}
            {simState.isLaunched &&
              simState.fuel > 0 &&
              simState.missionPhase !== "failed" &&
              simState.missionPhase !== "landing" &&
              !simState.success && (
                <div className="absolute -bottom-8 left-3/7 transform -translate-x-1/2 z-0">
                  {/* Main central flame */}
                  <div className="w-3 h-16 bg-gradient-to-t from-red-600 via-orange-500 to-yellow-300 rounded-b-full opacity-90 shadow-lg thrust-main">
                    <div className="absolute inset-0 bg-gradient-to-t from-red-700 to-transparent rounded-b-full opacity-70"></div>
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-2 bg-yellow-200 rounded-full opacity-80"></div>
                  </div>

                  {/* Left side flame */}
                  <div className="absolute -left-1 -bottom-2 w-2 h-12 bg-gradient-to-t from-red-500 via-orange-400 to-yellow-200 rounded-b-full opacity-85 shadow-md thrust-side">
                    <div className="absolute inset-0 bg-gradient-to-t from-red-600 to-transparent rounded-b-full opacity-60"></div>
                  </div>

                  {/* Right side flame */}
                  <div className="absolute -right-1 -bottom-2 w-2 h-12 bg-gradient-to-t from-red-500 via-orange-400 to-yellow-200 rounded-b-full opacity-85 shadow-md thrust-side">
                    <div className="absolute inset-0 bg-gradient-to-t from-red-600 to-transparent rounded-b-full opacity-60"></div>
                  </div>

                  {/* Outer glow/halo */}
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-8 h-20 bg-gradient-to-t from-red-400 via-orange-300 to-transparent rounded-b-full opacity-30 animate-pulse blur-sm"></div>

                  {/* Thrust particles - more realistic trail */}
                  <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-300 rounded-full opacity-60 thrust-particle"></div>
                  <div
                    className="absolute -bottom-18 left-1/2 transform -translate-x-1/2 w-0.5 h-0.5 bg-orange-400 rounded-full opacity-40 thrust-particle"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="absolute -bottom-14 left-1/4 transform -translate-x-1/2 w-0.5 h-0.5 bg-yellow-200 rounded-full opacity-50 thrust-particle"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="absolute -bottom-14 right-1/4 transform -translate-x-1/2 w-0.5 h-0.5 bg-orange-300 rounded-full opacity-50 thrust-particle"
                    style={{ animationDelay: "0.3s" }}
                  ></div>
                  <div
                    className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 w-0.5 h-0.5 bg-red-300 rounded-full opacity-30 thrust-particle"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              )}

            {/* Failure explosion effect */}
            {simState.missionPhase === "failed" && (
              <div className="absolute -top-4 -left-4 w-16 h-16 z-20">
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
              <div className="absolute -top-3 -left-3 w-14 h-14 z-20">
                <div className="absolute inset-0 bg-green-400 rounded-full animate-pulse opacity-50"></div>
                <div
                  className="absolute inset-1 bg-green-300 rounded-full animate-pulse opacity-30"
                  style={{ animationDelay: "0.3s" }}
                ></div>
              </div>
            )}
          </div>
        </div>

        {/* Fuel Progress Bar */}
        <div className="absolute top-20 left-6 right-6">
          <div className="bg-black/30 backdrop-blur-xl rounded-xl p-3 border border-white/20 shadow-xl">
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${
                    state.currentRocket.fuel > 0
                      ? (simState.fuel / state.currentRocket.fuel) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Side Controls Panel */}
        <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
          <div className="bg-black/30 backdrop-blur-xl rounded-xl p-4 border border-white/20 shadow-xl">
            <div className="flex flex-col space-y-3">
              {/* Launch Mission Button */}
              {!simState.isLaunched && (
                <button
                  onClick={handleLaunch}
                  disabled={fuelCapacity <= 0}
                  className={`backdrop-blur-xl px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-xl border w-full ${
                    fuelCapacity <= 0
                      ? "bg-gray-600/30 text-gray-400 border-gray-500/30 cursor-not-allowed"
                      : "bg-white/20 hover:bg-white/30 text-white border-white/30 hover:scale-105 active:scale-95"
                  }`}
                >
                  <span className="flex items-center justify-center space-x-3">
                    {fuelCapacity <= 0 ? (
                      <span className="text-lg">⛽</span>
                    ) : (
                      <Image
                        src="/rocket.png"
                        alt="Rocket"
                        width={20}
                        height={20}
                        className="w-5 h-5"
                      />
                    )}
                    <span>
                      {fuelCapacity <= 0
                        ? "Add Fuel to Launch"
                        : "Launch Mission"}
                    </span>
                  </span>
                </button>
              )}

              {/* Demo Mode Button */}
              {/* {!simState.isLaunched && (
                <button
                  onClick={handleDemoMode}
                  className="bg-purple-500/80 hover:bg-purple-500 backdrop-blur-xl text-white px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-xl border border-purple-400/30 w-full"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span className="text-lg">🎬</span>
                    <span>Demo Mode</span>
                  </span>
                </button>
              )} */}

              {/* Retry Button */}
              <button
                data-testid="retry-button"
                onClick={handleRetry}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 w-full"
              >
                <span className="flex items-center space-x-2">
                  <span>🔄</span>
                  <span>Retry</span>
                </span>
              </button>

              {/* Builder Button */}
              <button
                data-testid="back-to-builder-button"
                onClick={handleBackToBuilder}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 w-full"
              >
                <span className="flex items-center space-x-2">
                  <span>🔧</span>
                  <span>Builder</span>
                </span>
              </button>

              {/* Continue Button */}
              {/* {simState.isComplete && (
                <button
                  data-testid="continue-button"
                  onClick={handleContinue}
                  className="bg-blue-500/80 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <span className="flex items-center space-x-2">
                    <span>Continue</span>
                    <span>→</span>
                  </span>
                </button>
              )} */}
            </div>
          </div>
        </div>

        {/* Clean AI Tutor Sidebar */}
        {isAITutorOpen && (
          <div className="absolute top-0 right-0 h-full w-80 bg-black/50 backdrop-blur-xl border-l border-white/20 shadow-2xl z-40">
            <div className="h-full flex flex-col">
              {/* Clean Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/20">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500/80 rounded-lg flex items-center justify-center">
                    <span className="text-sm">👩‍🚀</span>
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-base">
                      Dr. Luna
                    </h3>
                    <p className="text-gray-300 text-sm">AI Space Tutor</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAITutorOpen(false)}
                  className="text-gray-300 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                >
                  <span className="text-lg">×</span>
                </button>
              </div>

              {/* AI Tutor Content */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.isUser ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] p-3 rounded-lg ${
                          message.isUser
                            ? "bg-blue-500/80 text-white"
                            : "bg-white/10 text-white"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">
                          {message.text}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white/10 text-white p-3 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-white/10">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={handleChatKeyPress}
                      placeholder="Ask about rockets, physics, or space..."
                      className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-white/50 focus:outline-none focus:border-white/40 transition-colors"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!chatInput.trim()}
                      className="bg-blue-500/80 hover:bg-blue-500 disabled:bg-white/10 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg transition-colors"
                    >
                      <Image
                        src="/rocket.png"
                        alt="Rocket"
                        width={16}
                        height={16}
                        className="w-4 h-4"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
