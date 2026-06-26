/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GameState, ControlsConfig } from './types';
import MainMenu from './components/MainMenu';
import OptionsPanel from './components/OptionsPanel';
import HowToPlay from './components/HowToPlay';
import LorePanel from './components/LorePanel';
import GameCanvas from './components/GameCanvas';
import { audio } from './components/AudioEngine';
import { motion, AnimatePresence } from 'motion/react';

const DEFAULT_CONTROLS: ControlsConfig = {
  moveLeft: 'ArrowLeft',
  moveRight: 'ArrowRight',
  jump: 'ArrowUp',
  attack: 'Space',
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [controls, setControls] = useState<ControlsConfig>(DEFAULT_CONTROLS);
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [sfxEnabled, setSfxEnabled] = useState(true);

  // Load configured keys from localStorage on mount
  useEffect(() => {
    const savedControls = localStorage.getItem('dansai_controls_v1');
    if (savedControls) {
      try {
        setControls(JSON.parse(savedControls));
      } catch (e) {
        console.error('Failed to parse saved controls', e);
      }
    }

    const savedMusic = localStorage.getItem('dansai_music_enabled');
    if (savedMusic !== null) {
      const isMusicOn = savedMusic === 'true';
      setMusicEnabled(isMusicOn);
      audio.toggleMusic(isMusicOn);
    }

    const savedSfx = localStorage.getItem('dansai_sfx_enabled');
    if (savedSfx !== null) {
      const isSfxOn = savedSfx === 'true';
      setSfxEnabled(isSfxOn);
      audio.toggleSfx(!isSfxOn);
    } else {
      audio.toggleSfx(false); // default unmute
    }
  }, []);

  const handleSaveControls = (newControls: ControlsConfig) => {
    setControls(newControls);
    localStorage.setItem('dansai_controls_v1', JSON.stringify(newControls));
  };

  const handleToggleMusic = (enabled: boolean) => {
    setMusicEnabled(enabled);
    localStorage.setItem('dansai_music_enabled', enabled.toString());
    audio.toggleMusic(!enabled); // toggleMusic takes isMuted (so opposite of enabled)
  };

  const handleToggleSfx = (enabled: boolean) => {
    setSfxEnabled(enabled);
    localStorage.setItem('dansai_sfx_enabled', enabled.toString());
    audio.toggleSfx(!enabled); // toggleSfx takes isMuted
  };

  const renderContent = () => {
    switch (gameState) {
      case 'MENU':
        return (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <MainMenu
              onNavigate={(state) => setGameState(state)}
              musicEnabled={musicEnabled}
              sfxEnabled={sfxEnabled}
              onToggleMusic={handleToggleMusic}
              onToggleSfx={handleToggleSfx}
            />
          </motion.div>
        );
      case 'OPTIONS':
        return (
          <motion.div
            key="options"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 150 }}
            className="w-full"
          >
            <OptionsPanel
              controls={controls}
              onSaveControls={handleSaveControls}
              onBack={() => setGameState('MENU')}
              musicEnabled={musicEnabled}
              sfxEnabled={sfxEnabled}
              onToggleMusic={handleToggleMusic}
              onToggleSfx={handleToggleSfx}
            />
          </motion.div>
        );
      case 'HOW_TO_PLAY':
        return (
          <motion.div
            key="how-to-play"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 150 }}
            className="w-full"
          >
            <HowToPlay
              controls={controls}
              onBack={() => setGameState('MENU')}
            />
          </motion.div>
        );
      case 'LORE':
        return (
          <motion.div
            key="lore"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <LorePanel onBack={() => setGameState('MENU')} />
          </motion.div>
        );
      case 'PLAYING':
        return (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            <GameCanvas
              controls={controls}
              musicEnabled={musicEnabled}
              sfxEnabled={sfxEnabled}
              onGoToMenu={() => setGameState('MENU')}
              onStateChange={(state) => setGameState(state)}
            />
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div id="app-root" className="min-h-screen bg-black select-none">
      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>
    </div>
  );
}
