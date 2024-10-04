// server/src/types.ts

export interface BaseStats {
  maxHealth: number;
  speed: number;
  normalDamage: number;
  elementalDamage: number;
  normalDefence: number;
  elementalDefence: number;
}

export interface LevelUpStats {
  health: number;
  speed: number;
  normalDamage: number;
  elementalDamage: number;
  normalDefence: number;
  elementalDefence: number;
}

export interface Announcement {
  text: string;
  displayTime: number;
}

export interface Evolution {
  level: number;
  images: {
    full: string; // URL or file path
    portrait: string;
    head: string;
  };
}

export interface BattleStore {
  isInitialized: boolean;
  enemy: Enemy | null;
  currentTurn: 'start' | 'player' | 'enemy' | 'end';
  currentAnnouncement: Announcement[];
  isUIEnabled: boolean;
  currentPlayerIndex: number;
  chosenAttack: string | null;
  damageResults: (number | 'miss')[];
  changedPlayerStats: { stat: string, newValue: number }[];
  changedEnemyStats: { stat: string, newValue: number }[];
  isSwitching: boolean;
  captureChance: number;
  baseCaptureChance: number;
  captureChanceModifier: number;
  turnCounter: number;
  result: BattleResult;
  experienceGained: number;
  isPlayerAsleep: boolean;
  isEnemyAsleep: boolean;
  playerDamageOverTime: number;
  enemyDamageOverTime: number;
  playerDamageOverTimeDuration: number;
  enemyDamageOverTimeDuration: number;
  setIsInitialized: (isInitialized: boolean) => void;
  setEnemy: (enemy: Enemy | null) => void;
  setCurrentAnnouncement: (announcement: Announcement[]) => void;
  setIsUIEnabled: (enabled: boolean) => void;
  updateEnemyHealth: (newHealth: number) => void;
  setCurrentTurn: (turn: 'player' | 'enemy' | 'end') => void;
  setCurrentPlayerIndex: (index: number) => void;
  setChosenAttack: (attack: string | null) => void;
  setIsSwitching: (isSwitching: boolean) => void;
  setCaptureChance: (chance: number) => void;
  setCaptureChanceModifier: (modifier: number) => void;
  setTurnCounter: (counter: number) => void;
  setResult: (result: BattleResult) => void;
  setExperienceGained: (experience: number) => void;
  setIsPlayerAsleep: (isAsleep: boolean) => void;
  setIsEnemyAsleep: (isAsleep: boolean) => void;
  setPlayerDamageOverTime: (damageOverTime: number) => void;
  setEnemyDamageOverTime: (damageOverTime: number) => void;
  setPlayerDamageOverTimeDuration: (duration: number) => void;
  setEnemyDamageOverTimeDuration: (duration: number) => void;
}

export interface Skill {
  level: number;
  name: string;
}


export interface Attack {
  name: string;
  class: string[];
  type: string;
  damage: number;
  multiplier: number;
  accuracy: number;
  ticks: number;
  damageOverTime: boolean;
  damageOverTimeDuration?: number;
  sleep: boolean;
  buff?: {stat: string, value: number};
  debuff?: {stat: string, value: number};
  upgrade?: string;
  upgradeDescription?: string;
  description: string;
}

export interface Character {
  name: string;
  type: string;
  currentHealth: number;
  baseStats: BaseStats;
  levelUpStats: LevelUpStats;
  evolutions: Evolution[];
  skills: Skill[];
  level: number;
  experience: number;
  experienceForNextLevel: number;
  trainingCost: number;
  evolveCost: number;
  currentImages: {
    full: string; // URL or file path
    portrait: string;
    head: string;
  };
  temporaryStats: BaseStats;
  maxLevel: number;
  id: number;
}

export interface Enemy extends Character {}

export type CurrentTurn = 'player' | 'enemy' | 'end';
export type BattleResult = 'victory' | 'defeat' | 'captured' | 'default' | null;
export type BattleAnimationResult = 'enemyDefeated' | 'playerDefeated' | 'lastPlayerDefeated' | 'captureSuccess' | 'captureFailure' | null;

export interface AccountStore {
  playerName: string;
  team: Character[];
  ownedCharacters: Character[];
  gold: number;
  diamonds: number;
  nextCharacterId: number;
  updatePlayerName: (name: string) => void;
  addGold: (amount: number) => void;
  substractGold: (amount: number) => void;
  updateDiamonds: (amount: number) => void;
  addCharacterToOwned: (characterName: string) => void;
  addToTeam: (characterId: number) => void;
  setTeam: (team: Character[]) => void;
  removeCharacterFromTeam: (characterId: number) => void;
  removeCharacterFromOwned: (characterId: number) => void;
  updateHealth: (characterId: number, health: number) => void;
  resetCurrentHealth: () => void;
  addExperienceToTeam: (experience: number) => void;
  levelUpCharacter: (characterId: number) => void;
  evolveCharacter: (characterId: number) => void;
  getCharacterAttacks: (characterId: number) => Attack[];
  upgradeAttack: (characterId: number, attackName: string) => void;
}
