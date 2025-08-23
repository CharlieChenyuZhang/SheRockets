"use client";

import { useGame, RocketPart } from "./GameProvider";
import { useState } from "react";

const availableParts: RocketPart[] = [
  {
    id: "crystal-body",
    name: "Crystal Body",
    type: "body",
    weight: 100,
    unlocked: true,
    icon: "💎",
  },
  {
    id: "stardust-body",
    name: "Stardust Body",
    type: "body",
    weight: 80,
    unlocked: true,
    icon: "✨",
  },
  {
    id: "crystal-engine",
    name: "Crystal Engine",
    type: "engine",
    weight: 50,
    thrust: 100,
    unlocked: true,
    icon: "🔥",
  },
  {
    id: "rainbow-engine",
    name: "Rainbow Engine",
    type: "engine",
    weight: 70,
    thrust: 150,
    unlocked: true,
    icon: "🌈",
  },
  {
    id: "butterfly-wings",
    name: "Butterfly Wings",
    type: "wings",
    weight: 20,
    drag: 10,
    unlocked: true,
    icon: "🦋",
  },
  {
    id: "angel-wings",
    name: "Angel Wings",
    type: "wings",
    weight: 15,
    drag: 5,
    unlocked: true,
    icon: "👼",
  },
  {
    id: "crystal-fuel",
    name: "Crystal Fuel Tank",
    type: "fuel",
    weight: 30,
    fuelCapacity: 100,
    unlocked: true,
    icon: "💎",
  },
  {
    id: "rainbow-fuel",
    name: "Rainbow Fuel Tank",
    type: "fuel",
    weight: 40,
    fuelCapacity: 150,
    unlocked: false,
    icon: "🌈",
  },
  {
    id: "crystal-parachute",
    name: "Crystal Parachute",
    type: "extras",
    weight: 10,
    unlocked: true,
    icon: "🪂",
  },
  {
    id: "stardust-antenna",
    name: "Stardust Antenna",
    type: "extras",
    weight: 5,
    unlocked: true,
    icon: "⭐",
  },
];

export default function RocketBuilder() {
  const { state, dispatch, navigateTo } = useGame();
  const [selectedTab, setSelectedTab] = useState<
    "body" | "engine" | "wings" | "fuel" | "extras"
  >("body");
  const [draggedPart, setDraggedPart] = useState<RocketPart | null>(null);
  const [aiMessage, setAiMessage] = useState(
    "Welcome to the Rocket Builder! Let's create something magical together! ✨"
  );

  const handlePartDragStart = (part: RocketPart) => {
    setDraggedPart(part);
  };

  const handlePartDrop = (part: RocketPart) => {
    if (draggedPart) {
      // Check if we already have a part of this type
      const existingPartOfType = state.currentRocket.parts.find(
        (p) => p.type === draggedPart.type
      );

      let newParts;
      if (existingPartOfType) {
        // Replace the existing part of the same type
        newParts = state.currentRocket.parts.map((p) =>
          p.type === draggedPart.type ? draggedPart : p
        );
      } else {
        // Add the new part
        newParts = [...state.currentRocket.parts, draggedPart];
      }

      const newMass = newParts.reduce((sum, p) => sum + p.weight, 0);
      const newThrust = newParts
        .filter((p) => p.type === "engine")
        .reduce((sum, p) => sum + (p.thrust || 0), 0);
      const newFuel = newParts
        .filter((p) => p.type === "fuel")
        .reduce((sum, p) => sum + (p.fuelCapacity || 0), 0);
      const newDrag = newParts
        .filter((p) => p.type === "wings")
        .reduce((sum, p) => sum + (p.drag || 0), 0);

      dispatch({
        type: "UPDATE_ROCKET",
        payload: {
          parts: newParts,
          mass: newMass,
          thrust: newThrust,
          fuel: newFuel,
          drag: newDrag,
        },
      });
      setDraggedPart(null);
    }
  };

  const handleRemovePart = (index: number) => {
    const newParts = state.currentRocket.parts.filter((_, i) => i !== index);
    const newMass = newParts.reduce((sum, p) => sum + p.weight, 0);
    const newThrust = newParts
      .filter((p) => p.type === "engine")
      .reduce((sum, p) => sum + (p.thrust || 0), 0);
    const newFuel = newParts
      .filter((p) => p.type === "fuel")
      .reduce((sum, p) => sum + (p.fuelCapacity || 0), 0);
    const newDrag = newParts
      .filter((p) => p.type === "wings")
      .reduce((sum, p) => sum + (p.drag || 0), 0);

    dispatch({
      type: "UPDATE_ROCKET",
      payload: {
        parts: newParts,
        mass: newMass,
        thrust: newThrust,
        fuel: newFuel,
        drag: newDrag,
      },
    });
  };

  const handleLaunch = () => {
    navigateTo("/launch");
  };

  const handleBackToMap = () => {
    navigateTo("/map");
  };

  const getAiHint = () => {
    const bodyParts = state.currentRocket.parts.filter(
      (p) => p.type === "body"
    );
    const engineParts = state.currentRocket.parts.filter(
      (p) => p.type === "engine"
    );

    if (bodyParts.length === 0) {
      setAiMessage(
        "You need a rocket body first! Try dragging a beautiful crystal or stardust body from the left panel. 💎✨"
      );
    } else if (engineParts.length === 0) {
      setAiMessage(
        "Great! Now add an engine to make your rocket go! Engines provide the magical power to lift off! 🔥🌈"
      );
    } else if (state.currentRocket.mass > 200) {
      setAiMessage(
        "Your rocket is getting a bit heavy! Try adding some beautiful wings to reduce drag and make it more graceful! 🦋👼"
      );
    } else {
      setAiMessage(
        "Looking amazing! Your rocket has a thrust-to-weight ratio of " +
          (
            state.currentRocket.thrust / Math.max(state.currentRocket.mass, 1)
          ).toFixed(2) +
          ". Values above 1.0 are perfect for magical liftoff! ✨"
      );
    }
  };

  const getEncouragement = () => {
    const messages = [
      "You're doing such a great job! Your rocket designs are getting more creative every time! 🌟",
      "Remember, every great scientist started with curiosity and imagination - just like you! 🔬",
      "Your attention to detail is amazing! You're thinking like a real engineer! 👩‍🔬",
      "Don't be afraid to experiment! The best discoveries come from trying new things! 💫",
      "You're not just building rockets - you're building confidence and skills! 🚀",
    ];
    setAiMessage(messages[Math.floor(Math.random() * messages.length)]);
  };

  const filteredParts = availableParts.filter(
    (part) => part.type === selectedTab
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900">
      {/* Left Sidebar - Parts */}
      <div className="w-80 bg-black/30 backdrop-blur-sm border-r border-pink-400/20 p-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">
            Magical Rocket Parts
          </h2>

          {/* Tab Navigation */}
          <div className="flex space-x-2 mb-4">
            {(["body", "engine", "wings", "fuel", "extras"] as const).map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedTab === tab
                      ? "bg-pink-600 text-white"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              )
            )}
          </div>
        </div>

        {/* Parts Grid */}
        <div className="grid grid-cols-2 gap-3">
          {filteredParts.map((part) => (
            <div
              key={part.id}
              draggable={part.unlocked}
              onDragStart={(e) => {
                handlePartDragStart(part);
                e.dataTransfer.effectAllowed = "copy";
                e.dataTransfer.setData("text/plain", part.id);
                // Add visual feedback
                e.currentTarget.style.transform = "scale(0.95)";
                e.currentTarget.style.opacity = "0.7";
              }}
              onDragEnd={(e) => {
                setDraggedPart(null);
                // Reset visual feedback
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.opacity = "1";
              }}
              className={`p-3 rounded-lg border-2 border-dashed cursor-grab active:cursor-grabbing transition-all ${
                part.unlocked
                  ? "border-pink-400 bg-pink-500/20 hover:bg-pink-500/30 hover:scale-105"
                  : "border-gray-600 bg-gray-600/20 opacity-50 cursor-not-allowed"
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">{part.icon}</div>
                <div className="text-white text-sm font-medium">
                  {part.name}
                </div>
                <div className="text-white/70 text-xs">
                  Weight: {part.weight}kg
                  {part.thrust && ` | Thrust: ${part.thrust}N`}
                  {part.fuelCapacity && ` | Fuel: ${part.fuelCapacity}L`}
                  {part.drag && ` | Drag: ${part.drag}`}
                </div>
                {!part.unlocked && (
                  <div className="text-yellow-400 text-xs mt-1">🔒 Locked</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Center Canvas - Rocket Assembly */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-black/30 backdrop-blur-sm border-b border-pink-400/20 p-4">
          <div className="flex justify-between items-center">
            <button
              onClick={handleBackToMap}
              className="text-white hover:text-pink-300 transition-colors"
            >
              ← Back to Map
            </button>
            <h1 className="text-2xl font-bold text-white">
              Magical Rocket Builder
            </h1>
            <div className="text-white text-sm">
              Level {state.playerProgress.currentLevel}
            </div>
          </div>
        </div>

        {/* Rocket Assembly Area */}
        <div className="flex-1 p-8">
          <div
            className="h-full bg-black/20 rounded-2xl border-2 border-dashed border-pink-400/30 flex items-center justify-center relative transition-all duration-200"
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = "rgba(236, 72, 153, 0.8)";
              e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.4)";
              e.currentTarget.style.transform = "scale(1.02)";
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = "rgba(236, 72, 153, 0.3)";
              e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.2)";
              e.currentTarget.style.transform = "scale(1)";
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = "rgba(236, 72, 153, 0.3)";
              e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.2)";
              e.currentTarget.style.transform = "scale(1)";
              if (draggedPart) {
                handlePartDrop(draggedPart);
              }
            }}
          >
            {state.currentRocket.parts.length === 0 ? (
              <div className="text-center text-white/50">
                <div className="text-6xl mb-4">🚀</div>
                <div className="text-xl">
                  Drag magical parts here to build your rocket!
                </div>
                <div className="text-sm mt-2">
                  Let your imagination soar! ✨
                </div>
                {draggedPart && (
                  <div className="mt-4 p-3 bg-pink-500/20 rounded-lg border border-pink-400/50">
                    <div className="text-white text-sm">
                      Drop <span className="font-bold">{draggedPart.name}</span>{" "}
                      here!
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full relative">
                {/* Drag Overlay */}
                {draggedPart && (
                  <div className="absolute inset-0 bg-pink-500/10 border-2 border-dashed border-pink-400/50 rounded-2xl flex items-center justify-center z-20">
                    <div className="text-center text-white">
                      <div className="text-4xl mb-2">{draggedPart.icon}</div>
                      <div className="text-lg font-bold">
                        Drop {draggedPart.name} here!
                      </div>
                    </div>
                  </div>
                )}

                {/* Connecting Lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {state.currentRocket.parts.map((_, index) => {
                    if (index < state.currentRocket.parts.length - 1) {
                      // Calculate positions relative to the centered container
                      const totalHeight =
                        (state.currentRocket.parts.length - 1) * 80;
                      const containerCenter = 50; // 50% of container height
                      const startY =
                        containerCenter - totalHeight / 2 + index * 80;
                      const endY =
                        containerCenter - totalHeight / 2 + (index + 1) * 80;
                      return (
                        <line
                          key={`line-${index}`}
                          x1="50%"
                          y1={`${startY}%`}
                          x2="50%"
                          y2={`${endY}%`}
                          stroke="url(#gradient)"
                          strokeWidth="3"
                          strokeDasharray="5,5"
                          opacity="0.6"
                        />
                      );
                    }
                    return null;
                  })}
                  <defs>
                    <linearGradient
                      id="gradient"
                      x1="0%"
                      y1="0%"
                      x2="0%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#ec4899" stopOpacity="0.8" />
                      <stop
                        offset="100%"
                        stopColor="#8b5cf6"
                        stopOpacity="0.8"
                      />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Crystal Moon Buttons */}
                <div className="flex flex-col items-center space-y-6 relative z-10">
                  {state.currentRocket.parts.map((part, index) => (
                    <div
                      key={`${part.id}-${index}`}
                      onClick={() => handleRemovePart(index)}
                      className="flex items-center space-x-4 bg-gradient-to-r from-pink-500/30 to-purple-600/30 backdrop-blur-sm rounded-2xl px-6 py-4 border-2 border-pink-400/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group"
                      style={{
                        minWidth: "300px",
                        boxShadow: "0 0 20px rgba(236, 72, 153, 0.3)",
                      }}
                    >
                      <div className="text-3xl animate-pulse">{part.icon}</div>
                      <div className="flex-1">
                        <div className="text-white font-bold text-lg">
                          {part.name}
                        </div>
                        <div className="text-white/80 text-sm">
                          Weight: {part.weight}kg
                          {part.thrust && ` | Thrust: ${part.thrust}N`}
                          {part.fuelCapacity &&
                            ` | Fuel: ${part.fuelCapacity}L`}
                          {part.drag && ` | Drag: ${part.drag}`}
                        </div>
                      </div>
                      <div className="text-white/60 text-xs group-hover:text-red-400 transition-colors">
                        Click to remove
                      </div>
                    </div>
                  ))}
                </div>

                {/* Connection Points */}
                {state.currentRocket.parts.map((_, index) => {
                  const totalHeight =
                    (state.currentRocket.parts.length - 1) * 80;
                  const containerCenter = 50;
                  const topPosition =
                    containerCenter - totalHeight / 2 + index * 80;
                  return (
                    <div
                      key={`connection-${index}`}
                      className="absolute w-4 h-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full border-2 border-white shadow-lg"
                      style={{
                        left: "50%",
                        top: `${topPosition}%`,
                        transform: "translate(-50%, -50%)",
                        zIndex: 5,
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Controls */}
      <div className="w-80 bg-black/30 backdrop-blur-sm border-l border-pink-400/20 p-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Rocket Stats</h2>

          {/* Physics Parameters */}
          <div className="space-y-4">
            <div>
              <label className="text-white text-sm font-medium">
                Mass: {state.currentRocket.mass}kg
              </label>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                <div
                  className="bg-pink-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      (state.currentRocket.mass / 300) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <label className="text-white text-sm font-medium">
                Thrust: {state.currentRocket.thrust}N
              </label>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      (state.currentRocket.thrust / 200) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <label className="text-white text-sm font-medium">
                Fuel: {state.currentRocket.fuel}L
              </label>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      (state.currentRocket.fuel / 200) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <label className="text-white text-sm font-medium">
                Drag: {state.currentRocket.drag}
              </label>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                <div
                  className="bg-yellow-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      (state.currentRocket.drag / 20) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Preview Stats */}
          <div className="mt-6 p-4 bg-white/10 rounded-lg">
            <h3 className="text-white font-medium mb-2">Preview</h3>
            <div className="space-y-1 text-sm text-white/80">
              <div>
                Max Altitude:{" "}
                {Math.round(
                  (state.currentRocket.thrust /
                    Math.max(state.currentRocket.mass, 1)) *
                    1000
                )}
                m
              </div>
              <div>
                Fuel Efficiency:{" "}
                {state.currentRocket.fuel > 0
                  ? Math.round(
                      (state.currentRocket.thrust / state.currentRocket.fuel) *
                        100
                    )
                  : 0}
                %
              </div>
              <div>
                Thrust/Weight:{" "}
                {(
                  state.currentRocket.thrust /
                  Math.max(state.currentRocket.mass, 1)
                ).toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Launch Button */}
        <button
          onClick={handleLaunch}
          disabled={state.currentRocket.parts.length === 0}
          className={`w-full py-4 px-6 rounded-xl text-xl font-bold transition-all ${
            state.currentRocket.parts.length > 0
              ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 hover:scale-105"
              : "bg-gray-600 text-gray-400 cursor-not-allowed"
          }`}
        >
          🚀 Launch Your Rocket!
        </button>
      </div>

      {/* AI Assistant Panel */}
      <div className="absolute bottom-4 left-4 max-w-sm">
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-4 border border-pink-400/30">
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-xl">
              🌙
            </div>
            <div className="flex-1">
              <div className="text-white text-sm mb-3">{aiMessage}</div>
              <div className="flex space-x-2">
                <button
                  onClick={getAiHint}
                  className="bg-pink-600 hover:bg-pink-700 text-white text-xs px-3 py-1 rounded-full transition-colors"
                >
                  Give Hint
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
    </div>
  );
}
