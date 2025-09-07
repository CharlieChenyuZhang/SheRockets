"use client";

import { useGame } from "./GameProvider";
import { useState, useEffect } from "react";
import Image from "next/image";

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
    rocketX: 25,
    rocketY: 92,
    failureReason: undefined,
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
          // const currentMass = rocketMass + prev.fuel / 1000; // convert fuel to kg
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

          // Demo mode: Simple animation from Earth to Moon
          if (isDemoMode) {
            // Simple demo - just show smooth progress
            newAltitude = newTime * 1000; // Simple altitude increase
            newVelocity = 100; // Constant velocity
            newHorizontalVelocity = 5000; // Constant horizontal velocity
            newDistanceToMoon = Math.max(0, MOON_DISTANCE - newTime * 1000000); // Simple distance decrease

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
                // Apply thrust - simplified calculations
                newVelocity += 200 * dt; // Accelerate upward
                newHorizontalVelocity += 50 * dt; // Build horizontal velocity
                newAltitude = Math.max(0, prev.altitude + newVelocity * dt);
              } else if (prev.altitude > 0) {
                // No fuel but rocket is in the air - ballistic trajectory
                newVelocity -= 9.81 * dt; // Gravity
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
              if (newTime > 5.0) {
                // Wait 5 seconds before checking for failures (skip in demo mode)
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
              // Simplified transfer - reduce distance to moon
              const transferSpeed = 1000; // m/s
              newDistanceToMoon = Math.max(
                0,
                prev.distanceToMoon - transferSpeed * dt
              );
              newAltitude += 200 * dt; // Continue climbing

              // Check if reached moon
              if (newDistanceToMoon <= LUNAR_ORBIT_ALTITUDE) {
                newMissionPhase = "lunar_approach";
              }

              // Check for transfer failure (too much time)
              if (newTime > 200 && newDistanceToMoon > MOON_DISTANCE * 0.5) {
                isComplete = true;
                success = false;
                newMissionPhase = "failed";
              }
            }

            // Phase 4: Lunar approach
            else if (prev.missionPhase === "lunar_approach") {
              // Simplified lunar approach
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
              // Final landing phase
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
          // Earth center is at bottom-8 left-1/4 = (25%, 92%)
          // Use Earth center for perfect alignment
          const initialRocketPos = { x: 25, y: 92 }; // Earth center position
          const moonPos = { x: 75, y: 25 };

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
    console.log("🌍 Earth position:", { x: 25, y: 92 });
    console.log("🌙 Moon position:", { x: 75, y: 25 });
    console.log("⏱️ Starting simulation...");
    console.log("🎯 Rocket should start at Earth center (25%, 92%)");
    setSimState((prev) => ({ ...prev, isLaunched: true }));
  };

  const handleDemoMode = () => {
    console.log("🎬 DEMO MODE BUTTON CLICKED!");
    console.log("🎭 Starting demo animation without failure conditions...");
    setIsDemoMode(true);
    setSimState((prev) => ({
      ...prev,
      isLaunched: true,
      rocketX: 25, // Ensure rocket starts at exact Earth position
      rocketY: 92, // Ensure rocket starts at exact Earth position
      time: 0, // Reset time to start fresh
    }));
  };

  const handleRetry = () => {
    console.log("🔄 RETRY BUTTON CLICKED!");
    console.log("📍 Resetting rocket to Earth position:", { x: 25, y: 92 });
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
      rocketX: 25,
      rocketY: 92,
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

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: chatInput.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setIsTyping(true);

    // Simulate AI response after a delay
    setTimeout(() => {
      const responses = [
        "Great question! That's a fundamental concept in rocket science. Let me explain... 🚀",
        "Excellent! I love seeing students think about the physics behind space travel. Here's what's happening... ✨",
        "That's a perfect question for understanding rocket dynamics! The key principle is... 🌟",
        "Wonderful! You're thinking like a real rocket scientist. Let me break this down for you... 🛰️",
        "I'm so excited you asked that! This is exactly the kind of thinking that leads to breakthroughs in space exploration... 🌌",
        "Fantastic question! This touches on some of the most important concepts in aerospace engineering... 🚀",
        "You're asking the right questions! Understanding this will help you become a better rocket designer... ⭐",
        "That's a brilliant observation! Let me explain the science behind this phenomenon... 🌙",
      ];

      const randomResponse =
        responses[Math.floor(Math.random() * responses.length)];

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: randomResponse,
        isUser: false,
        timestamp: new Date(),
      };

      setChatMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
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
              className="absolute w-px h-px bg-white rounded-full animate-pulse"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                opacity: star.opacity,
                animationDelay: `${star.animationDelay}s`,
                animationDuration: `${star.animationDuration}s`,
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
                        TIME
                      </div>
                      <div className="text-white text-lg font-mono">
                        {simState.time.toFixed(1)}s
                      </div>
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
                        {simState.altitude > 1000
                          ? `${(simState.altitude / 1000).toFixed(1)}km`
                          : `${Math.round(simState.altitude)}m`}
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="w-px h-8 bg-white/20"></div>

                    {/* Velocity */}
                    <div className="text-center">
                      <div className="text-gray-300 text-xs font-medium mb-1">
                        VELOCITY
                      </div>
                      <div className="text-white text-lg font-mono">
                        {Math.round(simState.velocity)}m/s
                      </div>
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
                          ? `${(simState.distanceToMoon / 1000000).toFixed(
                              1
                            )}M km`
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
          <div className="absolute bottom-8 left-1/4">
            <div className="relative">
              <div className="w-28 h-28 bg-gradient-to-b from-blue-500 via-blue-600 to-green-700 rounded-full shadow-2xl border-2 border-blue-400/30 animate-pulse">
                <div className="absolute inset-3 bg-gradient-to-b from-green-500 to-blue-600 rounded-full opacity-70"></div>
                <div className="absolute top-3 left-4 w-2 h-2 bg-white/90 rounded-full animate-ping"></div>
                <div className="absolute top-5 right-3 w-1 h-1 bg-white/70 rounded-full"></div>
                <div className="absolute bottom-4 left-5 w-1.5 h-1.5 bg-white/80 rounded-full"></div>
                {/* Atmospheric glow */}
                <div className="absolute -inset-2 bg-blue-400/20 rounded-full blur-sm"></div>
              </div>

              {/* Rocket on Earth (when not launched) */}
              {!simState.isLaunched && (
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
                  <div className="text-6xl">
                    <Image
                      src="/rocket.png"
                      alt="Rocket"
                      width={96}
                      height={96}
                      className="w-24 h-24 drop-shadow-lg"
                      style={{
                        filter: "drop-shadow(0 0 4px rgba(255, 255, 255, 0.3))",
                      }}
                    />
                  </div>
                </div>
              )}

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
              <div className="w-24 h-24 bg-gradient-to-b from-gray-300 via-gray-400 to-gray-500 rounded-full shadow-xl border-2 border-gray-300/50">
                <div className="absolute inset-2 bg-gradient-to-b from-gray-200 to-gray-400 rounded-full opacity-80"></div>
                <div className="absolute top-3 left-3 w-1.5 h-1.5 bg-gray-600 rounded-full"></div>
                <div className="absolute bottom-4 right-3 w-1 h-1 bg-gray-500 rounded-full"></div>
                <div className="absolute top-1/2 left-2 w-1 h-1 bg-gray-600 rounded-full"></div>
                <div className="absolute top-4 right-4 w-1 h-1 bg-gray-500 rounded-full"></div>
                <div className="absolute bottom-3 left-3 w-0.5 h-0.5 bg-gray-600 rounded-full"></div>
                {/* Moon glow */}
                <div className="absolute -inset-1 bg-gray-300/10 rounded-full blur-sm"></div>
              </div>
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                <div className="bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
                  <span className="text-white text-xs font-medium">MOON</span>
                </div>
              </div>
            </div>
          </div>
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
            d="M 25 70 Q 50 40 75 25"
            stroke="rgba(59, 130, 246, 0.3)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="8,8"
            className="animate-pulse"
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

        {/* Rocket (only when launched) */}
        {simState.isLaunched && (
          <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-out"
            style={{
              left: `${rocketPos.x}%`,
              top: `${rocketPos.y}%`,
              transform: `translate(-50%, -50%) rotate(${simState.angle}deg)`,
            }}
          >
            <div className="relative">
              {/* Rocket icon */}
              <div className="text-6xl transition-all duration-300">
                {simState.missionPhase === "failed" ? (
                  <Image
                    src="/rocket.png"
                    alt="Rocket"
                    width={96}
                    height={96}
                    className="w-24 h-24 opacity-60 animate-pulse grayscale"
                  />
                ) : (
                  <Image
                    src="/rocket.png"
                    alt="Rocket"
                    width={96}
                    height={96}
                    className="w-24 h-24 drop-shadow-lg"
                    style={{
                      filter: "drop-shadow(0 0 12px rgba(59, 130, 246, 0.8))",
                      animation: "rocketGlow 2s ease-in-out infinite alternate",
                    }}
                  />
                )}
              </div>

              {/* Rocket thrust effect */}
              {simState.isLaunched &&
                simState.fuel > 0 &&
                simState.missionPhase !== "failed" && (
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                    {/* Main thrust flame */}
                    <div className="w-4 h-10 bg-gradient-to-t from-orange-500 via-yellow-400 to-transparent rounded-b-full opacity-90 animate-pulse"></div>
                    {/* Secondary flame */}
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-8 bg-gradient-to-t from-orange-600 via-yellow-500 to-transparent rounded-b-full opacity-70 animate-ping"></div>
                    {/* Outer glow */}
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-12 bg-gradient-to-t from-red-500 via-orange-400 to-transparent rounded-b-full opacity-40 animate-pulse"></div>
                  </div>
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

        {/* Fuel Progress Bar */}
        <div className="absolute top-20 left-6 right-6">
          <div className="bg-black/30 backdrop-blur-xl rounded-xl p-3 border border-white/20 shadow-xl">
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${(simState.fuel / state.currentRocket.fuel) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Unified Controls Below Earth */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
          <div className="bg-black/30 backdrop-blur-xl rounded-xl p-4 border border-white/20 shadow-xl">
            <div className="flex items-center justify-center space-x-4">
              {/* Launch Mission Button */}
              {!simState.isLaunched && (
                <button
                  onClick={handleLaunch}
                  disabled={fuelCapacity <= 0}
                  className={`backdrop-blur-xl px-8 py-3 rounded-xl text-lg font-medium transition-all duration-200 shadow-xl border ${
                    fuelCapacity <= 0
                      ? "bg-gray-600/30 text-gray-400 border-gray-500/30 cursor-not-allowed"
                      : "bg-white/20 hover:bg-white/30 text-white border-white/30 hover:scale-105 active:scale-95"
                  }`}
                >
                  <span className="flex items-center justify-center space-x-3">
                    {fuelCapacity <= 0 ? (
                      <span className="text-xl">⛽</span>
                    ) : (
                      <Image
                        src="/rocket.png"
                        alt="Rocket"
                        width={24}
                        height={24}
                        className="w-6 h-6"
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
              {!simState.isLaunched && (
                <button
                  onClick={handleDemoMode}
                  className="bg-purple-500/80 hover:bg-purple-500 backdrop-blur-xl text-white px-6 py-3 rounded-xl text-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-xl border border-purple-400/30"
                >
                  <span className="flex items-center justify-center space-x-3">
                    <span className="text-xl">🎬</span>
                    <span>Demo Mode</span>
                  </span>
                </button>
              )}

              {/* Retry Button */}
              <button
                data-testid="retry-button"
                onClick={handleRetry}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95"
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
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <span className="flex items-center space-x-2">
                  <span>🔧</span>
                  <span>Builder</span>
                </span>
              </button>

              {/* Continue Button */}
              {simState.isComplete && (
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
              )}
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
