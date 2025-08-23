'use client';

import { useGame } from './GameProvider';
import MainMenu from './MainMenu';
import LevelMap from './LevelMap';
import RocketBuilder from './RocketBuilder';
import LaunchSimulation from './LaunchSimulation';
import Results from './Results';
import Victory from './Victory';

export default function Game() {
  const { state } = useGame();

  const renderView = () => {
    switch (state.currentView) {
      case 'main-menu':
        return <MainMenu />;
      case 'level-map':
        return <LevelMap />;
      case 'rocket-builder':
        return <RocketBuilder />;
      case 'launch-simulation':
        return <LaunchSimulation />;
      case 'results':
        return <Results />;
      case 'victory':
        return <Victory />;
      default:
        return <MainMenu />;
    }
  };

  return (
    <div className="game-container">
      {renderView()}
    </div>
  );
}
