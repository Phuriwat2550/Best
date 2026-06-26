export interface ControlsConfig {
  moveLeft: string;
  moveRight: string;
  jump: string;
  attack: string;
}

export type GameState = 'MENU' | 'PLAYING' | 'OPTIONS' | 'HOW_TO_PLAY' | 'LORE' | 'GAME_OVER' | 'VICTORY';

export interface GameStats {
  score: number;
  highScore: number;
  riceCollected: number;
  distance: number;
}
