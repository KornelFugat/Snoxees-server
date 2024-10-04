// src/routes/account.ts

import express from 'express';
import { AccountStore, Character, BattleResult, Enemy, Attack } from '../types';
import { characters } from '../data/charactersData';
import { calculateEvolveCost, calculateTrainingCost, substractGold } from '../utils/moneyUtils';
import { error } from 'console';
const attacksData: Attack[] = require('../data/attacks.json');

const router = express.Router();

export const accountStore: AccountStore = {
  playerName: 'Player1',
  team: [],
  ownedCharacters: [],
  gold: 40000000,
  diamonds: 50,
  nextCharacterId: 1,
  updatePlayerName: (name: string) => { accountStore.playerName = name; },
  addGold: (amount: number) => { accountStore.gold += amount; },
  substractGold: (amount: number) => { accountStore.gold -= amount; },
  updateDiamonds: (amount: number) => { accountStore.diamonds += amount; },

  addCharacterToOwned: (characterName: string) => {
    const character = characters[characterName as keyof typeof characters];
    if (character) {
      const newCharacter: Character = {
        ...character,
        id: accountStore.nextCharacterId,
        level: 1,
        experience: 0,
        experienceForNextLevel: 15,
        currentImages: {
          full: character.currentImages.full,
          portrait: character.currentImages.portrait,
          head: character.currentImages.head,
        },
        temporaryStats: character.baseStats,
        evolveCost: calculateEvolveCost(1, 11),
      };
      accountStore.ownedCharacters.push(newCharacter);
      accountStore.nextCharacterId += 1;
    }
  },
  addToTeam: (characterId: number) => {
    const character = accountStore.ownedCharacters.find((char: Character) => char.id === characterId);
    if (character && accountStore.team.length < 4 && !accountStore.team.some((char: Character) => char.id === characterId)) {
      accountStore.team.push(character);
    }
  },
  setTeam: (team: Character[]) => {
    if (team.every(teamMember => accountStore.ownedCharacters.some(ownedChar => ownedChar.id === teamMember.id))) {
      accountStore.team = team;
      console.log('pad', team);
  } else {
      console.log('Some members of the team are not in the ownedCharacters');
  }
  },
  removeCharacterFromTeam: (characterId: number) => {
    accountStore.team = accountStore.team.filter((char: Character) => char.id !== characterId);
  },
  removeCharacterFromOwned: (characterId: number) => {
    accountStore.ownedCharacters = accountStore.ownedCharacters.filter((char: Character) => char.id !== characterId);
    accountStore.team = accountStore.team.filter((char: Character) => char.id !== characterId);
  },
  updateHealth: (characterId: number, health: number) => {
    let updatedTeam = accountStore.team.map((char: Character) => {
      if (char.id === characterId) {
        return {
          ...char,
          currentHealth: Math.max(0, health),
        };
      }
      return char;
    });

    let updatedOwnedCharacters = accountStore.ownedCharacters.map((ownedChar: Character) => {
      const updatedChar = updatedTeam.find((teamChar: Character) => teamChar.id === ownedChar.id);
      return updatedChar || ownedChar;
    });

    accountStore.team = updatedTeam;
    accountStore.ownedCharacters = updatedOwnedCharacters;
  },
  resetCurrentHealth: () => {
    const updatedCharacters = accountStore.ownedCharacters.map((character: Character) => ({
      ...character,
      currentHealth: character.baseStats.maxHealth,
    }));

    const updatedTeam = accountStore.team.map((teamChar: Character) =>
      updatedCharacters.find((char: Character) => char.id === teamChar.id) || teamChar
    );

    accountStore.ownedCharacters = updatedCharacters;
    accountStore.team = updatedTeam;
  },
  addExperienceToTeam: (experience: number) => {
    const updatedTeam = accountStore.team.map((character: Character) => {
      if (character.level < 30 && character.experience < character.experienceForNextLevel) {
        let newExperience = character.experience + experience;
        if (newExperience >= character.experienceForNextLevel) {
          newExperience = character.experienceForNextLevel;
        }
        return { ...character, experience: newExperience };
      }
      return character;
    });

    const updatedOwnedCharacters = accountStore.ownedCharacters.map((ownedChar: Character) => {
      const updatedChar = updatedTeam.find((teamChar: Character) => teamChar.id === ownedChar.id);
      return updatedChar || ownedChar;
    });

    accountStore.ownedCharacters = updatedOwnedCharacters;
    accountStore.team = updatedTeam;
  },
  levelUpCharacter: (characterId: number) => {
    let updatedOwnedCharacters = accountStore.ownedCharacters.map((char: Character) => {
      if (char.id === characterId && char.level < char.maxLevel) {
        // Check if character has enough experience to level up
        const canLevelUpForFree = char.experience >= char.experienceForNextLevel;
        let newLevel = char.level + 1;
        let newImages = char.evolutions[0].images;
  
        // Determine evolution images
        if (newLevel >= 21) {
          newImages = char.evolutions[2].images;
        } else if (newLevel >= 11) {
          newImages = char.evolutions[1].images;
        }
  
        // Calculate new base stats
        const newBaseStats = {
          maxHealth: char.baseStats.maxHealth + char.levelUpStats.health,
          speed: char.baseStats.speed + char.levelUpStats.speed,
          normalDamage: char.baseStats.normalDamage + char.levelUpStats.normalDamage,
          elementalDamage: char.baseStats.elementalDamage + char.levelUpStats.elementalDamage,
          normalDefence: char.baseStats.normalDefence + char.levelUpStats.normalDefence,
          elementalDefence: char.baseStats.elementalDefence + char.levelUpStats.elementalDefence,
        };

        char.evolveCost -= char.trainingCost; // Deduct training cost from evolve cost

        // Recalculate evolve cost at level 11 and 21
        if (newLevel === 11) {
          char.evolveCost = calculateEvolveCost(11, 21); // Calculate evolve cost for levels 11-21
        } else if (newLevel === 21) {
          char.evolveCost = calculateEvolveCost(21, 30); // Calculate evolve cost for levels 21-30
        }
  
        // If the character can level up for free
        if (canLevelUpForFree) {
          return {
            ...char,
            level: newLevel,
            experience: 0,
            experienceForNextLevel: Math.floor(char.experienceForNextLevel * 1.2),
            baseStats: newBaseStats,
            currentHealth: newBaseStats.maxHealth,
            currentImages: newImages,
            temporaryStats: newBaseStats,
            trainingCost: calculateTrainingCost(newLevel),
            evolveCost: char.evolveCost, // Updated evolve cost
          };
        } else {
          // Leveling up with training cost
          try {
            substractGold(char.trainingCost); // Deduct gold for training
          } catch {
            throw new Error('Not enough gold');
          }
  
          return {
            ...char,
            level: newLevel,
            experience: 0,
            experienceForNextLevel: Math.floor(char.experienceForNextLevel * 1.2),
            baseStats: newBaseStats,
            currentHealth: newBaseStats.maxHealth,
            currentImages: newImages,
            temporaryStats: newBaseStats,
            trainingCost: calculateTrainingCost(newLevel),
            evolveCost: char.evolveCost, // Updated evolve cost
          };
        }
      }
      return char;
    });
  
    // Update the team with the leveled-up character
    const updatedTeam = accountStore.team.map((teamChar: Character) =>
      updatedOwnedCharacters.find((char) => char.id === teamChar.id) || teamChar
    );
  
    accountStore.ownedCharacters = updatedOwnedCharacters;
    accountStore.team = updatedTeam;
  },
  evolveCharacter: (characterId: number) => {
    let updatedOwnedCharacters = accountStore.ownedCharacters.map((char: Character) => {
      if (char.id === characterId && char.level < char.maxLevel) {
        let targetLevel;
        if (char.level < 11) {
          targetLevel = 11;
        } else if (char.level < 21) {
          targetLevel = 21;
        } else {
          targetLevel = 30;
        }
        
        while (char.level < targetLevel) {
          accountStore.levelUpCharacter(char.id);
          char = accountStore.ownedCharacters.find((c) => c.id === char.id)!; // Re-fetch character to get updated data
        }

        return char;
      }
      return char;
    });
  
    accountStore.ownedCharacters = updatedOwnedCharacters;
  },
  getCharacterAttacks: (characterId: number) => {
    const character = accountStore.ownedCharacters.find((char: Character) => char.id === characterId);
    if (!character) return [];

    return character.skills.map(skill => {
      return attacksData.find(attack => attack.name === skill.name);
    }).filter(attack => attack !== undefined);
  },
  upgradeAttack: (characterId: number, attackName: string) => {
    
  }
};



router.get('/account', (req, res) => {
  res.json(accountStore);
});

router.post('/account/update-player-name', (req, res) => {
  const { name } = req.body;
    accountStore.updatePlayerName(name);
    res.status(200).json(accountStore);
});

router.post('/account/update-gold', (req, res) => {
  const { amount } = req.body;
    accountStore.addGold(amount);
    res.status(200).json(accountStore);
});

router.post('/account/update-diamonds', (req, res) => {
  const { amount } = req.body;
    accountStore.updateDiamonds(amount);
    res.status(200).json(accountStore);
});


router.post('/account/add-character-to-owned', (req, res) => {
  const { characterName } = req.body;
  accountStore.addCharacterToOwned(characterName);
  res.status(200).json(accountStore);
});

router.post('/account/add-character-to-team', (req, res) => {
  const { characterId } = req.body;
  accountStore.addToTeam(characterId);
  res.status(200).json(accountStore);
});

router.post('/account/set-team', (req, res) => {
  const { team } = req.body;
  console.log(team)
  accountStore.setTeam(team);
  res.status(200).json(accountStore);
});

router.post('/account/remove-character-from-team', (req, res) => {
  const { characterId } = req.body;
  accountStore.removeCharacterFromTeam(characterId);
  res.status(200).json(accountStore);
});

router.post('/account/remove-character-from-owned', (req, res) => {
  const { characterId } = req.body;
  accountStore.removeCharacterFromOwned(characterId);
  res.status(200).json(accountStore);
});

router.post('/account/update-health', (req, res) => {
  const { characterId, health } = req.body;
  try {
    accountStore.updateHealth(characterId, health);
    res.status(200).json(accountStore);
  } catch (error) {
    res.status(400).json({ error: error });
  }
});

router.post('/account/reset-current-health', (req, res) => {
  try {
    accountStore.resetCurrentHealth();
    res.status(200).json(accountStore);
  } catch (error) {
    res.status(400).json({ error: error });
  }
});

router.post('/account/add-experience-to-team', (req, res) => {
  const { experience } = req.body;
  try {
    accountStore.addExperienceToTeam(experience);
    res.status(200).json(accountStore);
  } catch (error) {
    res.status(400).json({ error: error });
  }
});

router.post('/account/level-up-character', (req, res) => {
  const { characterId } = req.body;
  try {
    accountStore.levelUpCharacter(characterId);
    res.status(200).json(accountStore);
  } catch (error) {
    res.status(400).json({ error: error });
  }
});

router.post('/account/evolve-character', (req, res) => {
  const { characterId } = req.body;
  try {
    console.log('evolving')
    accountStore.evolveCharacter(characterId);
    res.status(200).json(accountStore);
  } catch (error) {
    res.status(400).json({ error: error });
  }
})

router.post('/account/get-character-attacks', (req, res) => {
  const { characterId } = req.body;
  try {
    const attacks = accountStore.getCharacterAttacks(characterId);
    res.status(200).json(attacks);
  } catch (error) {
    res.status(400).json({ error: error });
  }
});

export default router;
