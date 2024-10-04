import express from 'express';
import { AccountStore, Announcement, BattleResult, BattleStore, CurrentTurn, Enemy } from '../types';
import { calculateCaptureChance } from '../utils/battleUtils';
import { battleRequirements, initializeBattle, playerAttack, playerCatch, playerSwitch } from '../utils/battleLogic';

const router = express.Router();

export const battleStore: BattleStore = {
    isInitialized: false,
    enemy: null,
    currentTurn: 'start',
    currentAnnouncement: [],
    isUIEnabled: false,
    currentPlayerIndex: 0,
    chosenAttack: null,
    damageResults: [],
    changedPlayerStats: [],
    changedEnemyStats: [],
    isSwitching: false,
    captureChance: 0,
    baseCaptureChance: 0.1,
    captureChanceModifier: 0.1,
    turnCounter: 0,
    result: null,
    experienceGained: 0,
    isPlayerAsleep: false,
    isEnemyAsleep: false,
    playerDamageOverTime: 0,
    enemyDamageOverTime: 0,
    playerDamageOverTimeDuration: 0,
    enemyDamageOverTimeDuration: 0,
    setIsInitialized: (isInitialized: boolean) => { 
      battleStore.isInitialized = isInitialized
    },
    setEnemy: (enemy: Enemy | null) => {
      battleStore.enemy = enemy;
    },
    setCurrentAnnouncement: (announcement: Announcement[]) => {
      battleStore.currentAnnouncement = announcement;
    },
    setIsUIEnabled: (enabled: boolean) => {
      battleStore.isUIEnabled = enabled;
    },
    updateEnemyHealth: (newHealth: number) => {
      const safeHealth = Math.max(0, newHealth);
      if (battleStore.enemy) {
        battleStore.enemy.currentHealth = safeHealth;
        calculateCaptureChance();
      } else {
        console.error('No enemy set to update health for.');
        throw new Error('No enemy set.');
      }
    },
    setCurrentTurn: (turn: CurrentTurn) => {
      battleStore.currentTurn = turn;
    },
    setCurrentPlayerIndex: (index: number) => {
      battleStore.currentPlayerIndex = index;
    },
    setChosenAttack: (attack: string | null) => {
      battleStore.chosenAttack = attack;
    },
    setIsSwitching: (isSwitching: boolean) => {
      battleStore.isSwitching = isSwitching;
    },
    setCaptureChance: (chance: number) => {
      battleStore.captureChance = chance;
    },
    setCaptureChanceModifier: (modifier: number) => {
      battleStore.captureChanceModifier = modifier;
      calculateCaptureChance();
    },
    setTurnCounter: (counter: number) => {
      battleStore.turnCounter = counter;
    },
    setResult: (result: BattleResult) => {
      battleStore.result = result;
    },
    setExperienceGained: (experience: number) => {
      battleStore.experienceGained = experience;
    },
    setIsPlayerAsleep: (isAsleep: boolean) => {
      battleStore.isPlayerAsleep = isAsleep;
    },
    setIsEnemyAsleep: (isAsleep: boolean) => {
      battleStore.isEnemyAsleep = isAsleep;
    },
    setPlayerDamageOverTime: (damage: number) => {
      battleStore.playerDamageOverTime = damage;
    },
    setEnemyDamageOverTime: (damage: number) => {
      battleStore.enemyDamageOverTime = damage;
    },
    setPlayerDamageOverTimeDuration: (duration: number) => {
      battleStore.playerDamageOverTimeDuration = duration;
    },
    setEnemyDamageOverTimeDuration: (duration: number) => {
      battleStore.enemyDamageOverTimeDuration = duration;
    }
};



router.get('', (req, res) => {
  res.json(battleStore);
})

router.get('/check-requirements', (req, res) => {
  battleRequirements();
  res.json(battleStore);
});

router.get('/initialize', (req, res) => {
  initializeBattle();
  res.json(battleStore);
});

router.post('/player-attack', (req, res) => {
  const { attackName } = req.body;
  playerAttack(attackName);
  res.status(200).json(battleStore);
})

router.post('/player-switch', (req, res) => {
  const { characterId } = req.body;
  playerSwitch(characterId);
  res.status(200).json(battleStore);
})

router.get('/player-catch', (req, res) => {
  playerCatch();
  res.status(200).json(battleStore);
})

router.post('/set-is-initialized', (req, res) => {
  const { isInitialized } = req.body;
  battleStore.setIsInitialized(isInitialized);
  res.status(200).json(battleStore);
});

router.post('/set-enemy', (req, res) => {
  const { enemy } = req.body;
  battleStore.setEnemy(enemy);
  res.status(200).json(battleStore);
});

router.post('/update-enemy-health', (req, res) => {
  const { health } = req.body;
  battleStore.updateEnemyHealth(health);
  res.status(200).json(battleStore);
});

router.post('/set-current-turn', (req, res) => {
  const { turn } = req.body;
  battleStore.setCurrentTurn(turn);
  res.status(200).json(battleStore);
});

router.post('/set-current-player-index', (req, res) => {
  const { index } = req.body;
  battleStore.setCurrentPlayerIndex(index);
  res.status(200).json(battleStore);
});

router.post('/set-capture-chance', (req, res) => {
  const { chance } = req.body;
  battleStore.setCaptureChance(chance);
  res.status(200).json(battleStore);
});

router.post('/set-capture-chance-modifier', (req, res) => {
  const { modifier } = req.body;
  battleStore.setCaptureChanceModifier(modifier);
  res.status(200).json(battleStore);
});

router.post('/set-turn-counter', (req, res) => {
  const { counter } = req.body;
  battleStore.setTurnCounter(counter);
  res.status(200).json(battleStore);
});


export default router;
