"use client";

import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { useRouter } from "next/navigation";

export interface RocketPart {
  id: string;
  name: string;
  type: "body" | "engine" | "wings" | "fuel" | "extras";
  weight: number;
  thrust?: number;
  fuelCapacity?: number;
  drag?: number;
  unlocked: boolean;
  icon: string;
}

export interface GameState {
  playerProgress: {
    starsCollected: number;
    attemptsMade: number;
    currentLevel: number;
    unlockedParts: string[];
  };
  currentRocket: {
    parts: RocketPart[];
    mass: number;
    thrust: number;
    fuel: number;
    drag: number;
  };
  settings: {
    soundEnabled: boolean;
    parentalControls: boolean;
    language: string;
  };
  lastSavedState: unknown;
}

type GameAction =
  | { type: "UPDATE_PROGRESS"; payload: Partial<GameState["playerProgress"]> }
  | { type: "UPDATE_ROCKET"; payload: Partial<GameState["currentRocket"]> }
  | { type: "UPDATE_SETTINGS"; payload: Partial<GameState["settings"]> }
  | { type: "SAVE_GAME" }
  | { type: "LOAD_GAME"; payload: GameState };

const initialState: GameState = {
  playerProgress: {
    starsCollected: 0,
    attemptsMade: 0,
    currentLevel: 1,
    unlockedParts: ["basic-body", "basic-engine", "basic-wings", "basic-fuel"],
  },
  currentRocket: {
    parts: [],
    mass: 0,
    thrust: 0,
    fuel: 0,
    drag: 0,
  },
  settings: {
    soundEnabled: true,
    parentalControls: false,
    language: "en",
  },
  lastSavedState: null,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "UPDATE_PROGRESS":
      return {
        ...state,
        playerProgress: { ...state.playerProgress, ...action.payload },
      };
    case "UPDATE_ROCKET":
      return {
        ...state,
        currentRocket: { ...state.currentRocket, ...action.payload },
      };
    case "UPDATE_SETTINGS":
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case "SAVE_GAME":
      return { ...state, lastSavedState: { ...state } };
    case "LOAD_GAME":
      return action.payload;
    default:
      return state;
  }
}

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  navigateTo: (route: string) => void;
} | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const router = useRouter();

  const navigateTo = (route: string) => {
    router.push(route);
  };

  return (
    <GameContext.Provider value={{ state, dispatch, navigateTo }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
