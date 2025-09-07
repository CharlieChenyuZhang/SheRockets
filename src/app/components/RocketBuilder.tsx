"use client";

import { useGame, RocketPart } from "./GameProvider";
import { useState } from "react";
import Image from "next/image";

// TODO: Replace these placeholder image URLs with actual rocket part images
// You can find better images at:
// - NASA's image gallery: https://images.nasa.gov/
// - SpaceX photos: https://www.spacex.com/media/
// - Unsplash rocket images: https://unsplash.com/s/photos/rocket
// - Pexels space images: https://www.pexels.com/search/rocket/
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
    id: "titanium-body",
    name: "Titanium Body",
    type: "body",
    weight: 60,
    unlocked: true,
    icon: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=200&h=200&fit=crop&crop=center",
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
    id: "super-heavy-engine",
    name: "Super Heavy Engine",
    type: "engine",
    weight: 200,
    thrust: 5000,
    unlocked: true,
    icon: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=200&h=200&fit=crop&crop=center",
  },
  {
    id: "lunar-engine",
    name: "Lunar Landing Engine",
    type: "engine",
    weight: 120,
    thrust: 3000,
    unlocked: true,
    icon: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=200&h=200&fit=crop&crop=center",
  },
  {
    id: "moon-rocket-engine",
    name: "Moon Rocket Engine",
    type: "engine",
    weight: 300,
    thrust: 8000,
    unlocked: true,
    icon: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=200&h=200&fit=crop&crop=center",
  },
  {
    id: "fins",
    name: "Stabilizing Fins",
    type: "wings",
    weight: 20,
    drag: 10,
    unlocked: true,
    icon: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=200&h=200&fit=crop&crop=center",
  },
  {
    id: "wings",
    name: "Aerodynamic Wings",
    type: "wings",
    weight: 15,
    drag: 5,
    unlocked: true,
    icon: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=200&h=200&fit=crop&crop=center",
  },
  {
    id: "liquid-fuel-tank",
    name: "Liquid Fuel Tank",
    type: "fuel",
    weight: 30,
    fuelCapacity: 1000,
    unlocked: true,
    icon: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=200&h=200&fit=crop&crop=center",
  },
  {
    id: "solid-fuel-tank",
    name: "Solid Fuel Tank",
    type: "fuel",
    weight: 40,
    fuelCapacity: 150,
    unlocked: false,
    icon: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=200&h=200&fit=crop&crop=center",
  },
  {
    id: "large-fuel-tank",
    name: "Large Fuel Tank",
    type: "fuel",
    weight: 80,
    fuelCapacity: 3000,
    unlocked: true,
    icon: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=200&h=200&fit=crop&crop=center",
  },
  {
    id: "mega-fuel-tank",
    name: "Mega Fuel Tank",
    type: "fuel",
    weight: 150,
    fuelCapacity: 10000,
    unlocked: true,
    icon: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=200&h=200&fit=crop&crop=center",
  },
  {
    id: "moon-fuel-tank",
    name: "Moon Mission Fuel Tank",
    type: "fuel",
    weight: 200,
    fuelCapacity: 15000,
    unlocked: true,
    icon: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=200&h=200&fit=crop&crop=center",
  },
  {
    id: "parachute",
    name: "Recovery Parachute",
    type: "extras",
    weight: 10,
    unlocked: true,
    icon: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=200&h=200&fit=crop&crop=center",
  },
  {
    id: "antenna",
    name: "Communication Antenna",
    type: "extras",
    weight: 5,
    unlocked: true,
    icon: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=200&h=200&fit=crop&crop=center",
  },
];

export default function RocketBuilder() {
  const { state, dispatch, navigateTo } = useGame();
  const [selectedTab, setSelectedTab] = useState<
    "body" | "engine" | "wings" | "fuel" | "extras"
  >("body");
  const [draggedPart, setDraggedPart] = useState<RocketPart | null>(null);

  const handlePartDragStart = (part: RocketPart) => {
    setDraggedPart(part);
  };

  const handlePartDrop = () => {
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
    // Check if rocket has fuel before launching
    if (state.currentRocket.fuel <= 0) {
      alert(
        "Cannot launch rocket without fuel! Please add a fuel tank to your rocket design."
      );
      return;
    }
    navigateTo("/launch");
  };

  const handleBackToMenu = () => {
    navigateTo("/menu");
  };

  const filteredParts = availableParts.filter(
    (part) => part.type === selectedTab
  );

  return (
    <div className="flex h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black overflow-hidden relative">
      {/* Assembly Station Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Industrial Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `
              linear-gradient(rgba(236, 72, 153, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(236, 72, 153, 0.1) 1px, transparent 1px)
            `,
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        {/* Assembly Station Lighting */}
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-yellow-400/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute top-0 right-1/4 w-24 h-24 bg-blue-400/20 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-0 left-1/2 w-40 h-40 bg-pink-400/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />

        {/* Industrial Equipment Silhouettes */}
        <div className="absolute top-10 right-10 w-16 h-32 bg-gray-700/30 rounded-t-lg" />
        <div className="absolute top-12 right-12 w-12 h-28 bg-gray-600/40 rounded-t-md" />
        <div className="absolute bottom-20 left-10 w-20 h-20 bg-gray-700/20 rounded-full" />
        <div className="absolute bottom-16 left-12 w-16 h-16 bg-gray-600/30 rounded-full" />
      </div>

      {/* Left Sidebar - Parts Inventory */}
      <div className="w-72 lg:w-80 bg-gray-900/80 backdrop-blur-md border-r border-pink-500/40 p-4 flex-shrink-0 overflow-y-auto relative z-10">
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white text-lg">🔧</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Parts Inventory</h2>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mb-4">
            {(["body", "engine", "wings", "fuel", "extras"] as const).map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`px-2 py-1 lg:px-3 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors ${
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                <div className="w-16 h-16 mx-auto mb-2 rounded-lg overflow-hidden bg-gray-800 flex items-center justify-center">
                  <Image
                    src={part.icon}
                    alt={part.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to rocket PNG if image fails to load
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
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Top Bar - Assembly Station Controls */}
        <div className="bg-gray-900/80 backdrop-blur-md border-b border-pink-500/40 p-4 relative">
          {/* Assembly Station Status Lights */}
          <div className="absolute top-2 right-2 flex space-x-2">
            <div
              className="w-3 h-3 bg-green-400 rounded-full animate-pulse"
              title="System Online"
            />
            <div
              className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"
              style={{ animationDelay: "0.5s" }}
              title="Assembly Ready"
            />
            <div
              className="w-3 h-3 bg-pink-400 rounded-full animate-pulse"
              style={{ animationDelay: "1s" }}
              title="Parts Available"
            />
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={handleBackToMenu}
              className="flex items-center text-white hover:text-pink-300 transition-colors whitespace-nowrap text-sm lg:text-base bg-gray-800/50 px-3 py-2 rounded-lg hover:bg-gray-700/50"
            >
              <span className="mr-2">←</span> Exit Assembly
            </button>
            <div className="text-center">
              <h1 className="text-lg lg:text-2xl font-bold text-white truncate flex items-center justify-center gap-2">
                <Image
                  src="/rocket.png"
                  alt="Rocket"
                  width={32}
                  height={32}
                  className="flex-shrink-0"
                />
                Assembly Station Alpha
              </h1>
              <div className="text-xs text-white/60">
                Rocket Construction Facility
              </div>
            </div>
            <div className="text-white text-sm whitespace-nowrap bg-gray-800/50 px-3 py-2 rounded-lg">
              Mission Level {state.playerProgress.currentLevel}
            </div>
          </div>
        </div>

        {/* Rocket Assembly Area */}
        <div className="flex-1 p-4 lg:p-8 overflow-auto relative">
          {/* Assembly Station Floor */}
          <div className="absolute inset-4 lg:inset-8 bg-gradient-to-b from-gray-800/50 to-gray-900/70 rounded-2xl border border-pink-500/30" />

          {/* Assembly Station Grid Lines */}
          <div className="absolute inset-4 lg:inset-8 opacity-20">
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `
                linear-gradient(rgba(236, 72, 153, 0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(236, 72, 153, 0.3) 1px, transparent 1px)
              `,
                backgroundSize: "100px 100px",
              }}
            />
          </div>

          {/* Assembly Station Equipment */}
          <div className="absolute top-6 left-6 w-16 h-16 bg-gray-700/60 rounded-lg border border-pink-500/30 flex items-center justify-center">
            <span className="text-pink-400 text-xl">⚙️</span>
          </div>
          <div className="absolute top-6 right-6 w-16 h-16 bg-gray-700/60 rounded-lg border border-pink-500/30 flex items-center justify-center">
            <span className="text-pink-400 text-xl">🔧</span>
          </div>
          <div className="absolute bottom-6 left-6 w-16 h-16 bg-gray-700/60 rounded-lg border border-pink-500/30 flex items-center justify-center">
            <span className="text-pink-400 text-xl">⚡</span>
          </div>
          <div className="absolute bottom-6 right-6 w-16 h-16 bg-gray-700/60 rounded-lg border border-pink-500/30 flex items-center justify-center">
            <span className="text-pink-400 text-xl">🔩</span>
          </div>

          <div
            className="h-full bg-transparent flex items-center justify-center relative transition-all duration-200 z-10"
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = "rgba(236, 72, 153, 0.8)";
              e.currentTarget.style.backgroundColor = "rgba(75, 85, 99, 0.4)";
              e.currentTarget.style.transform = "scale(1.02)";
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = "rgba(236, 72, 153, 0.3)";
              e.currentTarget.style.backgroundColor = "rgba(75, 85, 99, 0.2)";
              e.currentTarget.style.transform = "scale(1)";
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = "rgba(236, 72, 153, 0.3)";
              e.currentTarget.style.backgroundColor = "rgba(75, 85, 99, 0.2)";
              e.currentTarget.style.transform = "scale(1)";
              if (draggedPart) {
                handlePartDrop();
              }
            }}
          >
            {state.currentRocket.parts.length === 0 ? (
              <div className="text-center text-white/60 relative">
                {/* Assembly Station Gantry */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-64 bg-gray-600/40 rounded-full" />
                  <div
                    className="absolute top-0 w-32 h-2 bg-gray-600/40 rounded-full"
                    style={{ transform: "translateY(-1rem)" }}
                  />
                  <div
                    className="absolute top-0 w-2 h-16 bg-gray-600/40 rounded-full"
                    style={{ transform: "translateY(-2rem)" }}
                  />
                </div>

                <div className="relative z-10">
                  <div className="mb-6 opacity-30 flex justify-center">
                    <Image
                      src="/rocket.png"
                      alt="Rocket"
                      width={128}
                      height={128}
                      className="w-32 h-32"
                    />
                  </div>
                  <div className="text-xl font-semibold mb-2">
                    Assembly Station Ready
                  </div>
                  <div className="text-sm mb-4">
                    Drag rocket components from the inventory to begin
                    construction
                  </div>
                  <div className="text-xs text-white/40">
                    Mission Control: Awaiting your engineering expertise
                  </div>
                </div>

                {draggedPart && (
                  <div className="mt-6 p-4 bg-pink-500/20 rounded-xl border border-pink-500/50 backdrop-blur-sm">
                    <div className="text-white text-sm font-medium">
                      🎯 Drop{" "}
                      <span className="font-bold text-pink-300">
                        {draggedPart.name}
                      </span>{" "}
                      to begin assembly!
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full relative">
                {/* Assembly Station Gantry - Active */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-80 bg-gradient-to-b from-gray-600/60 to-gray-700/40 rounded-full shadow-lg" />
                  <div
                    className="absolute top-0 w-40 h-3 bg-gradient-to-r from-gray-600/60 to-gray-700/40 rounded-full shadow-lg"
                    style={{ transform: "translateY(-1.5rem)" }}
                  />
                  <div
                    className="absolute top-0 w-3 h-20 bg-gradient-to-b from-gray-600/60 to-gray-700/40 rounded-full shadow-lg"
                    style={{ transform: "translateY(-2.5rem)" }}
                  />

                  {/* Assembly Clamps */}
                  {state.currentRocket.parts.map((_, index) => {
                    const totalHeight =
                      (state.currentRocket.parts.length - 1) * 80;
                    const containerCenter = 50;
                    const clampY =
                      containerCenter - totalHeight / 2 + index * 80;
                    return (
                      <div
                        key={`clamp-${index}`}
                        className="absolute w-8 h-4 bg-gray-700/60 rounded-full border border-pink-500/40"
                        style={{
                          left: "50%",
                          top: `${clampY}%`,
                          transform: "translate(-50%, -50%)",
                        }}
                      />
                    );
                  })}
                </div>

                {/* Drag Overlay */}
                {draggedPart && (
                  <div className="absolute inset-0 bg-pink-500/10 border-2 border-dashed border-pink-500/50 rounded-2xl flex items-center justify-center z-20 backdrop-blur-sm">
                    <div className="text-center text-white">
                      <div className="w-20 h-20 mx-auto mb-3 rounded-xl overflow-hidden bg-gray-800/80 flex items-center justify-center border border-pink-500/50">
                        <Image
                          src={draggedPart.icon}
                          alt={draggedPart.name}
                          width={80}
                          height={80}
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
                          width={48}
                          height={48}
                          className="hidden"
                        />
                      </div>
                      <div className="text-xl font-bold mb-2">
                        🎯 Drop {draggedPart.name} here!
                      </div>
                      <div className="text-sm text-white/80">
                        Assembly in progress...
                      </div>
                    </div>
                  </div>
                )}

                {/* Rocket Assembly Structure */}
                <div className="relative z-10 flex flex-col items-center space-y-2">
                  {state.currentRocket.parts.map((part, index) => (
                    <div key={`${part.id}-${index}`} className="relative group">
                      {/* Part Connection Ring */}
                      <div className="absolute -inset-2 w-16 h-16 border-2 border-pink-500/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />

                      {/* Part Component */}
                      <div
                        onClick={() => handleRemovePart(index)}
                        className="flex items-center space-x-4 bg-gradient-to-r from-pink-500/40 to-pink-600/40 backdrop-blur-md rounded-2xl px-6 py-4 border-2 border-pink-500/60 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer group"
                        style={{
                          minWidth: "320px",
                          boxShadow:
                            "0 0 25px rgba(236, 72, 153, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                        }}
                      >
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-800/80 flex items-center justify-center border border-pink-500/50">
                          <Image
                            src={part.icon}
                            alt={part.name}
                            width={56}
                            height={56}
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
                            width={32}
                            height={32}
                            className="hidden"
                          />
                        </div>
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
                        <div className="text-white/60 text-xs group-hover:text-red-400 transition-colors bg-gray-800/50 px-2 py-1 rounded">
                          Remove
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Mission Control Panel */}
      <div className="w-72 lg:w-80 bg-gray-900/80 backdrop-blur-md border-l border-pink-500/40 p-4 flex-shrink-0 overflow-y-auto relative z-10">
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white text-lg">📊</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Mission Control</h2>
          </div>

          {/* System Status */}
          <div className="mb-4 p-3 bg-gray-800/50 rounded-lg border border-pink-500/30">
            <div className="text-white text-sm font-medium mb-2">
              System Status
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white/80 text-xs">
                Assembly Station Online
              </span>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <div
                className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
                style={{ animationDelay: "0.5s" }}
              />
              <span className="text-white/80 text-xs">
                Parts Inventory Ready
              </span>
            </div>
          </div>

          {/* Rocket Telemetry */}
          <div className="space-y-4">
            <div className="p-3 bg-gray-800/50 rounded-lg border border-pink-500/30">
              <div className="flex items-center justify-between mb-2">
                <label className="text-white text-sm font-medium">
                  Mass: {state.currentRocket.mass}kg
                </label>
                <span className="text-pink-400 text-xs">⚖️</span>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-3 mt-1 border border-gray-600/50">
                <div
                  className="bg-gradient-to-r from-pink-500 to-pink-600 h-3 rounded-full transition-all duration-500 shadow-lg"
                  style={{
                    width: `${Math.min(
                      (state.currentRocket.mass / 300) * 100,
                      100
                    )}%`,
                    boxShadow: "0 0 10px rgba(236, 72, 153, 0.5)",
                  }}
                />
              </div>
            </div>

            <div className="p-3 bg-gray-800/50 rounded-lg border border-pink-500/30">
              <div className="flex items-center justify-between mb-2">
                <label className="text-white text-sm font-medium">
                  Thrust: {state.currentRocket.thrust}N
                </label>
                <span className="text-red-400 text-xs">🔥</span>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-3 mt-1 border border-gray-600/50">
                <div
                  className="bg-gradient-to-r from-red-500 to-orange-500 h-3 rounded-full transition-all duration-500 shadow-lg"
                  style={{
                    width: `${Math.min(
                      (state.currentRocket.thrust / 200) * 100,
                      100
                    )}%`,
                    boxShadow: "0 0 10px rgba(239, 68, 68, 0.5)",
                  }}
                />
              </div>
            </div>

            <div className="p-3 bg-gray-800/50 rounded-lg border border-pink-500/30">
              <div className="flex items-center justify-between mb-2">
                <label className="text-white text-sm font-medium">
                  Fuel: {state.currentRocket.fuel}L
                </label>
                <span className="text-green-400 text-xs">⛽</span>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-3 mt-1 border border-gray-600/50">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500 shadow-lg"
                  style={{
                    width: `${Math.min(
                      (state.currentRocket.fuel / 200) * 100,
                      100
                    )}%`,
                    boxShadow: "0 0 10px rgba(34, 197, 94, 0.5)",
                  }}
                />
              </div>
            </div>

            <div className="p-3 bg-gray-800/50 rounded-lg border border-pink-500/30">
              <div className="flex items-center justify-between mb-2">
                <label className="text-white text-sm font-medium">
                  Drag: {state.currentRocket.drag}
                </label>
                <span className="text-yellow-400 text-xs">🌪️</span>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-3 mt-1 border border-gray-600/50">
                <div
                  className="bg-gradient-to-r from-yellow-500 to-amber-500 h-3 rounded-full transition-all duration-500 shadow-lg"
                  style={{
                    width: `${Math.min(
                      (state.currentRocket.drag / 20) * 100,
                      100
                    )}%`,
                    boxShadow: "0 0 10px rgba(234, 179, 8, 0.5)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Flight Predictions */}
          <div className="mt-6 p-4 bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl border border-pink-500/30">
            <div className="flex items-center mb-3">
              <span className="text-pink-400 text-lg mr-2">📈</span>
              <h3 className="text-white font-medium">Flight Predictions</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center p-2 bg-gray-700/30 rounded-lg">
                <span className="text-white/80">Max Altitude:</span>
                <span className="text-pink-300 font-mono">
                  {Math.round(
                    (state.currentRocket.thrust /
                      Math.max(state.currentRocket.mass, 1)) *
                      1000
                  )}
                  m
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-700/30 rounded-lg">
                <span className="text-white/80">Fuel Efficiency:</span>
                <span className="text-green-300 font-mono">
                  {state.currentRocket.fuel > 0
                    ? Math.round(
                        (state.currentRocket.thrust /
                          state.currentRocket.fuel) *
                          100
                      )
                    : 0}
                  %
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-700/30 rounded-lg">
                <span className="text-white/80">Thrust/Weight:</span>
                <span className="text-blue-300 font-mono">
                  {(
                    state.currentRocket.thrust /
                    Math.max(state.currentRocket.mass, 1)
                  ).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Mission Feasibility Analysis */}
            <div className="p-4 bg-gray-800/50 rounded-lg border border-pink-500/30">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-bold text-lg">
                  🌙 Moon Mission Analysis
                </h3>
                <span className="text-2xl">🚀</span>
              </div>

              {(() => {
                const thrustToWeight =
                  state.currentRocket.thrust /
                  (state.currentRocket.mass * 9.81);
                const fuelMass = state.currentRocket.fuel; // Assuming 1L = 1kg
                const specificImpulse = 300;
                const deltaV =
                  specificImpulse *
                  9.81 *
                  Math.log(
                    (state.currentRocket.mass + fuelMass) /
                      state.currentRocket.mass
                  );
                const moonMissionDeltaV = 8000;
                const canReachMoon =
                  deltaV >= moonMissionDeltaV && thrustToWeight >= 1.0;

                return (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">T/W Ratio:</span>
                      <span
                        className={`font-mono ${
                          thrustToWeight >= 1.0
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {thrustToWeight.toFixed(2)}{" "}
                        {thrustToWeight >= 1.0 ? "✅" : "❌"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Delta-V:</span>
                      <span
                        className={`font-mono ${
                          deltaV >= moonMissionDeltaV
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {deltaV.toFixed(0)} m/s{" "}
                        {deltaV >= moonMissionDeltaV ? "✅" : "❌"}
                      </span>
                    </div>
                    <div className="mt-3 p-2 rounded-lg border-2">
                      <div
                        className={`text-center font-bold ${
                          canReachMoon
                            ? "text-green-400 bg-green-500/20 border-green-400"
                            : "text-red-400 bg-red-500/20 border-red-400"
                        }`}
                      >
                        {canReachMoon
                          ? "🌙 MOON MISSION: READY!"
                          : "⚠️ NEEDS IMPROVEMENT"}
                      </div>
                      <div className="text-xs text-gray-400 mt-1 text-center">
                        {canReachMoon
                          ? "Your rocket can reach the moon!"
                          : "Need T/W ≥ 1.0 and ΔV ≥ 8,000 m/s"}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Mission Launch Button */}
        <div className="mt-6">
          <button
            onClick={handleLaunch}
            disabled={
              state.currentRocket.parts.length === 0 ||
              state.currentRocket.fuel <= 0
            }
            className={`w-full py-5 px-6 rounded-2xl text-xl font-bold transition-all duration-300 relative overflow-hidden ${
              state.currentRocket.parts.length > 0 &&
              state.currentRocket.fuel > 0
                ? "bg-gradient-to-r from-pink-500 via-pink-600 to-pink-700 text-white hover:from-pink-600 hover:via-pink-700 hover:to-pink-800 hover:scale-105 shadow-2xl hover:shadow-pink-500/25"
                : "bg-gray-700/50 text-gray-400 cursor-not-allowed border border-gray-600/50"
            }`}
            style={{
              boxShadow:
                state.currentRocket.parts.length > 0
                  ? "0 0 30px rgba(236, 72, 153, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
                  : "none",
            }}
          >
            {state.currentRocket.parts.length > 0 &&
            state.currentRocket.fuel > 0 ? (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <div className="relative flex items-center justify-center">
                  <Image
                    src="/rocket.png"
                    alt="Rocket"
                    width={32}
                    height={32}
                    className="mr-3"
                  />
                  <span>INITIATE LAUNCH SEQUENCE</span>
                </div>
                <div className="text-sm mt-1 opacity-80">
                  Mission Control Ready
                </div>
              </>
            ) : state.currentRocket.parts.length === 0 ? (
              <div className="flex items-center justify-center">
                <span className="mr-3 text-2xl">🔧</span>
                <span>ASSEMBLE ROCKET FIRST</span>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <span className="mr-3 text-2xl">⛽</span>
                <span>ADD FUEL TO LAUNCH</span>
              </div>
            )}
          </button>

          {state.currentRocket.parts.length > 0 && (
            <div className="mt-3 text-center">
              <div className="text-xs text-white/60 mb-1">Launch Readiness</div>
              <div className="w-full bg-gray-700/50 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-1000 ${
                    state.currentRocket.fuel > 0
                      ? "bg-gradient-to-r from-green-500 to-emerald-500"
                      : "bg-gradient-to-r from-red-500 to-orange-500"
                  }`}
                  style={{
                    width: state.currentRocket.fuel > 0 ? "100%" : "50%",
                  }}
                />
              </div>
              <div
                className={`text-xs mt-1 font-medium ${
                  state.currentRocket.fuel > 0
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {state.currentRocket.fuel > 0
                  ? "✅ READY FOR LAUNCH"
                  : "❌ NEEDS FUEL"}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
