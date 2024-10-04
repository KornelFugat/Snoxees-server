// src/utils/battleUtils.ts

import { Announcement, Attack, BattleStore, Character, Enemy } from '../types';
import { battleStore } from '../routes/battleRoutes';
import { accountStore } from '../routes/account';
import { characters } from '../data/charactersData';
const attacksData: Attack[] = require('../data/attacks.json');

// Setting battle Store to default values
export const resetBattleStore = () => {
    battleStore.setIsInitialized(false);
    battleStore.setEnemy(null);
    battleStore.setCurrentAnnouncement([]);
    battleStore.setIsUIEnabled(false);
    battleStore.setCurrentTurn('player');
    battleStore.setCurrentPlayerIndex(0);
    battleStore.setChosenAttack(null);
    battleStore.setIsSwitching(false);
    battleStore.setCaptureChance(0);
    battleStore.setCaptureChanceModifier(0.1);
    battleStore.setTurnCounter(0);
    battleStore.setExperienceGained(0);
    battleStore.setIsPlayerAsleep(false);
    battleStore.setIsEnemyAsleep(false);
    battleStore.setPlayerDamageOverTime(0);
    battleStore.setEnemyDamageOverTime(0);
    battleStore.setPlayerDamageOverTimeDuration(0);
    battleStore.setEnemyDamageOverTimeDuration(0);
}

// Checking if there is any character in the team and that its hp is greater than 0
export const checkTeamBeforeBattle = () => {
    const team = accountStore.team;
    return team.some(char => char.currentHealth > 0) && team.length > 0;
}

// Setting the enemy
export const setBattleEnemy = () => {
    const allCharacters = Object.values(characters); 
    const randomEnemy = allCharacters[Math.floor(Math.random() * allCharacters.length)];
    battleStore.setEnemy({...randomEnemy, currentHealth: randomEnemy.baseStats.maxHealth});
}

// Setting current turn
export const setCurrentTurn = (turn: 'player' | 'enemy' | 'end') => {
    battleStore.setCurrentTurn(turn);
}

// Setting current announcement
export const setAnnouncement = (announcement: Announcement[]) => {
    battleStore.setCurrentAnnouncement(announcement);
}

//Setting UI disabled/enabled
export const setIsUIEnabled = (enabled: boolean) => {
    battleStore.setIsUIEnabled(enabled);
}

export const setExperience = (experience: number) => {
    battleStore.setExperienceGained(experience);
    accountStore.addExperienceToTeam(experience);
}

// Calculating capture chance
export const calculateCaptureChance = () => {
    const enemyHealth = battleStore.enemy?.currentHealth ?? 0;
    const enemyMaxHealth = battleStore.enemy?.baseStats.maxHealth ?? 1;
    const team = accountStore.team; // Replace with actual team data
    const meanPlayerMaxHealth = team.reduce((acc, char) => acc + char.baseStats.maxHealth, 0) / team.length;
    const healthRatio = (enemyMaxHealth - enemyHealth) / enemyMaxHealth;
    const healthDifferenceFactor = meanPlayerMaxHealth / enemyMaxHealth;
    const lowHealthFactor = healthRatio;
    const captureChance = battleStore.baseCaptureChance + healthDifferenceFactor * 0.3 + lowHealthFactor * 0.6;
    const updatedCaptureChance = Math.min(1, Math.max(0, captureChance - battleStore.captureChanceModifier));
    battleStore.setCaptureChance(updatedCaptureChance);
  };

// Getting chosen attack

export const getChosenAttack = (attackName: string) => {
    const currentPlayer = accountStore.team[battleStore.currentPlayerIndex];
    if (currentPlayer && currentPlayer.skills.some(skill => skill.name === attackName)) {
        return attacksData.find(a => a.name === attackName);
    } else {
        throw new Error('No attack found');
    }
}

// Calculating damage
const calculateDamage = (baseDamage: number, attackType: string, attackerStats: { normalDamage: number; elementalDamage: number;}, receiverStats: { normalDefence: number; elementalDefence: number }, multiplier: number) => {
    console.log('heh0', multiplier, baseDamage, attackType, attackerStats, receiverStats)
    console.log('heh', baseDamage + (multiplier * (attackerStats.normalDamage - receiverStats.normalDefence)))
    console.log('heh2', baseDamage + (multiplier * (attackerStats.elementalDamage - receiverStats.elementalDefence)))
    return attackType === 'normal'
        ? baseDamage + (multiplier * (attackerStats.normalDamage - receiverStats.normalDefence))
        : baseDamage + (multiplier * (attackerStats.elementalDamage - receiverStats.elementalDefence));
};


// Substracting enemy hp
export const substractHealth = (damage: number, turn: 'player' | 'enemy') => {
    
    if (turn === 'player') {
        const newHealth = Math.max(0, (battleStore.enemy?.currentHealth ?? 0) - damage);
        battleStore.updateEnemyHealth(newHealth);
    } else {
        const newHealth = Math.max(0, (accountStore.team[battleStore.currentPlayerIndex].currentHealth ?? 0) - damage);
        accountStore.team[battleStore.currentPlayerIndex].currentHealth = newHealth;
    }
}

// Applying DoT
export const applyDamageOverTime = (damage: number, duration: number, turn: 'player' | 'enemy') => {
    if (turn === 'player') {
        battleStore.setEnemyDamageOverTime(damage);
        battleStore.setEnemyDamageOverTimeDuration(duration);
    } else {
        battleStore.setPlayerDamageOverTime(damage);
        battleStore.setPlayerDamageOverTimeDuration(duration);
    }
}

// Putting asleep
export const putAsleep = (turn: 'player' | 'enemy') => {
    console.log('sleep1')
    if (turn === 'player') {
        console.log('sleep2')
        battleStore.setIsEnemyAsleep(true);
    } else {
        console.log('sleep3')
        battleStore.setIsPlayerAsleep(true);
    }
}

export const resolveAttack = (attack: Attack, turn: 'player' | 'enemy') => {
    console.log('dddddd1', battleStore.damageResults)
    const attacker = turn === 'player' ? accountStore.team[battleStore.currentPlayerIndex] : battleStore.enemy;
    const receiver = turn === 'player' ? battleStore.enemy : accountStore.team[battleStore.currentPlayerIndex];
    const damageResults: (number | 'miss')[] = [];
    const changedStats: { target: 'user' | 'enemy', stat: string, newValue: number }[] = [];
    battleStore.damageResults = damageResults;
    battleStore.changedEnemyStats = changedStats;
    battleStore.changedPlayerStats = changedStats;
    console.log('dddddd2', battleStore.damageResults)
    const randomChance = Math.random()
    
    if (attacker && receiver) {
        console.log('set1')
        if(attack.class.includes('damage')) {
            console.log('set2')
            for (let i = 0; i < attack.ticks; i++) {
                const randomChance = Math.random()
                if (randomChance < attack.accuracy) {
                    console.log('set3')
                    const damage = calculateDamage(attack.damage, attack.type, attacker.temporaryStats, receiver.temporaryStats, attack.multiplier);
                    if (damage) {
                        const minDamage = damage * 0.9; // 10% less than damage
                        const maxDamage = damage * 1.1; // 10% more than damage
                        console.log('aaaaaaaa', damage)
                        const actualDamage = Math.round(Math.random() * (maxDamage - minDamage + 1)) + Math.round(minDamage);
    
                        damageResults.push(actualDamage);
                        battleStore.damageResults = damageResults;
                        console.log('adsadasd', actualDamage)
                        substractHealth(actualDamage, turn);
                        console.log('dddddd3', battleStore.damageResults)
                    }
                } else {
                    damageResults.push('miss');
                    console.log('dddddd4', battleStore.damageResults)
                } 
            } 
        } 

        if (attack.class.includes('buff') ) {
            if (attack.accuracy > randomChance) {
                if(attack.buff) {
                    const buffValue = attack.buff.value
                    const statName = attack.buff.stat
                    const changedStats = { stat: statName, newValue: buffValue };
                    if (turn === 'player') {
                        battleStore.changedPlayerStats = [...battleStore.changedPlayerStats, changedStats]
                    } else {
                        battleStore.changedEnemyStats = [...battleStore.changedEnemyStats, changedStats]
                    }
    
                    if (attack.buff?.stat && attacker.temporaryStats.hasOwnProperty(statName)) {
                        switch (statName) {
                            case 'maxHealth':
                                attacker.temporaryStats.maxHealth += buffValue;
                                break;
                            case 'speed':
                                attacker.temporaryStats.speed += buffValue;
                                break;
                            case 'normalDamage':
                                attacker.temporaryStats.normalDamage += buffValue;
                                break;
                            case 'elementalDamage':
                                attacker.temporaryStats.elementalDamage += buffValue;
                                break;
                            case 'normalDefence':
                                attacker.temporaryStats.normalDefence += buffValue;
                                break;
                            case 'elementalDefence':
                                attacker.temporaryStats.elementalDefence += buffValue;
                                break;
                            default:
                                break;
                        }
                    }
        
                }
            } else {
                damageResults.push('miss');
                console.log('dddddd4', battleStore.damageResults)
            }
        }
        if (attack.class.includes('debuff') ) {
            if (attack.accuracy > randomChance) {      
                if(attack.debuff) {
                    const buffValue = attack.debuff.value
                    const statName = attack.debuff.stat
                    const changedStats = { stat: statName, newValue: buffValue };
                    if (turn === 'player') {
                        battleStore.changedEnemyStats = [...battleStore.changedEnemyStats, changedStats]
                    } else {
                        battleStore.changedPlayerStats = [...battleStore.changedPlayerStats, changedStats]
                    }
    
                    if (statName && receiver.temporaryStats.hasOwnProperty(statName)) {
                        switch (statName) {
                            case 'maxHealth':
                                receiver.temporaryStats.maxHealth -= buffValue;
                                break;
                            case 'speed':
                                receiver.temporaryStats.speed -= buffValue;
                                break;
                            case 'normalDamage':
                                receiver.temporaryStats.normalDamage -= buffValue;
                                break;
                            case 'elementalDamage':
                                receiver.temporaryStats.elementalDamage -= buffValue;
                                break;
                            case 'normalDefence':
                                receiver.temporaryStats.normalDefence -= buffValue;
                                break;
                            case 'elementalDefence':
                                receiver.temporaryStats.elementalDefence -= buffValue;
                                break;
                            default:
                                break;
                        }
                    }
        
                }
            } else {
                damageResults.push('miss');
                console.log('dddddd4', battleStore.damageResults)
            }
        }

        if(attack.class.includes('damageOverTime') && attack.damageOverTimeDuration ) {
            if (attack.accuracy > randomChance) {
                for (let i = 0; i < attack.ticks; i++) {
                    if (randomChance < attack.accuracy) {
                        const damage = calculateDamage(attack.damage, attack.type, attacker.temporaryStats, receiver.temporaryStats, attack.multiplier);
                        if (damage) {
                            const minDamage = damage * 0.9; // 10% less than damage
                            const maxDamage = damage * 1.1; // 10% more than damage
                            const actualDamage = Math.round(Math.random() * (maxDamage - minDamage + 1)) + Math.round(minDamage);
                            const duration = attack.damageOverTimeDuration;
                            applyDamageOverTime(actualDamage, duration, turn)
                            
                        }
                    }
                }
            } else {
                damageResults.push('miss');
                battleStore.damageResults = damageResults;
            }
        }  

        if(attack.class.includes('sleep')) {
            if (attack.accuracy > randomChance) {
                for (let i = 0; i < attack.ticks; i++) {
                    if (randomChance < attack.accuracy) {
                        putAsleep(turn);
                    } 
                }             
            } else {
                damageResults.push('miss');
                battleStore.damageResults = damageResults;
            }
        }
    }
}
const switchToNextCharacter = () => {
    const team = accountStore.team;
    const currentPlayerIndex = battleStore.currentPlayerIndex;
    const nextIndex = team.findIndex((char, index) => index > currentPlayerIndex && char.currentHealth > 0);
    if (nextIndex !== -1) {
        battleStore.setIsSwitching(true);
        battleStore.setCurrentPlayerIndex(nextIndex);
        battleStore.setIsPlayerAsleep(false);
        battleStore.changedPlayerStats = [];
        battleStore.setPlayerDamageOverTime(0);
        battleStore.setPlayerDamageOverTimeDuration(0);
        battleStore.setCurrentTurn('player');
        setTimeout(() => {
            console.log('12 player')
            playerTurn();
        }, 2000)
                
    } else {
        const firstAvailableIndex = team.findIndex(char => char.currentHealth > 0);
        if (firstAvailableIndex !== -1) {
            battleStore.setIsSwitching(true);
            battleStore.setCurrentPlayerIndex(firstAvailableIndex);
            battleStore.setIsPlayerAsleep(false);
            battleStore.changedPlayerStats = [];
            battleStore.setPlayerDamageOverTime(0);
            battleStore.setPlayerDamageOverTimeDuration(0);
            battleStore.setCurrentTurn('player');
            setTimeout(() => {
                console.log('12 player')
                playerTurn();
            }, 2000)
        } else {
            console.log('no player hp ending', Date.now())
            battleStore.setCurrentTurn('end');
            setExperience(5);
            battleStore.setResult('defeat');
        }
    }
};
export const playerTurn = () => {
    battleStore.setIsEnemyAsleep(false);
    if (battleStore.playerDamageOverTimeDuration > 0) {
        substractHealth(battleStore.playerDamageOverTime, 'player');
        battleStore.setPlayerDamageOverTimeDuration(battleStore.playerDamageOverTimeDuration - 1);
    }
    if(accountStore.team[battleStore.currentPlayerIndex].currentHealth <= 0) {
        switchToNextCharacter();
    } else {
        if (battleStore.isPlayerAsleep) {
            setTimeout(() => {
                setCurrentTurn('enemy');
                handleEnemyAttack();
                
            }, 3000)
        }
    }
    console.log('player can attack now', Date.now())
}

// After player's attack paths
export const afterPlayerAttack = () => {
    console.log('dddddd5', battleStore.damageResults)
    calculateCaptureChance();
    if (battleStore.enemy) {
        if (battleStore.enemy.currentHealth <= 0) {
            console.log('enemy no hp ending', Date.now())
            battleStore.setCurrentTurn('end');
            battleStore.setResult('victory');
            setExperience(100);

        } else {       
                battleStore.setCurrentTurn('enemy');
                console.log('enemy turn now', Date.now())  
                setTimeout(() => {
                    handleEnemyAttack();
                },3000)
        }   
    }
}

// Switching conditions
export const switchingCharacter = (characterId: number) => {
    if (characterId !== battleStore.currentPlayerIndex && accountStore.team[characterId].currentHealth > 0) {
        battleStore.setIsSwitching(true);
        battleStore.setCurrentPlayerIndex(characterId);
        battleStore.setIsPlayerAsleep(false);
        battleStore.changedPlayerStats = [];
        battleStore.setPlayerDamageOverTime(0);
        battleStore.setPlayerDamageOverTimeDuration(0);
    }
}


// Handling enemy catch
export const handleCatchEnemy = () => {
    const chance = battleStore.captureChance;
    console.log('chance', chance)
    if (Math.random() < chance) {
        accountStore.addCharacterToOwned(battleStore.enemy?.name ?? 'Enemy');
        battleStore.setCurrentTurn('end');
        battleStore.setResult('captured');
        setExperience(10);
        console.log('caught')
    } else {
        battleStore.setCaptureChanceModifier(battleStore.captureChanceModifier * 1.5);
        console.log('missed')
        setAnnouncement([{text: 'Capture failed!', displayTime: 3000}, {text: `${battleStore.enemy?.name ?? 'Enemy'} turn!`, displayTime: 3000} ]);
        setTimeout(() => { 
            console.log('enemy turn now', Date.now())  
            afterPlayerAttack();
        }, 4000)
    }
};

//Enemy attack
export const handleEnemyAttack = () => {
    if (battleStore.enemy) {
        battleStore.setIsPlayerAsleep(false);
        battleStore.setIsSwitching(false);
        if (battleStore.enemyDamageOverTimeDuration > 0) {
            substractHealth(battleStore.enemyDamageOverTime, 'enemy');
            battleStore.setEnemyDamageOverTimeDuration(battleStore.enemyDamageOverTimeDuration - 1);
        }
        if(battleStore.enemy.currentHealth <= 0) {
            battleStore.setCurrentTurn('end');
            battleStore.setResult('victory');
            setExperience(100);
        } else {
            if(battleStore.isEnemyAsleep) {
               afterEnemyAttack();
            } else {
                   const randomAttack = battleStore.enemy.skills[Math.floor(Math.random() * battleStore.enemy.skills.length)];
                   const attackData = attacksData.find(attack => attack.name === randomAttack.name);
                   if (attackData) {
                        battleStore.setChosenAttack(attackData.name);
                        resolveAttack(attackData, 'enemy');  
                        console.log('enemy attacks', Date.now())  
                   }
                   afterEnemyAttack();
                   console.log('dddddd8', battleStore.damageResults)
            }
        }
    }
}

// After enemy's attack paths
export const afterEnemyAttack = () => {
    if (accountStore.team[battleStore.currentPlayerIndex]) {
        if (accountStore.team[battleStore.currentPlayerIndex].currentHealth <= 0) {
                console.log('before switching characters bcs no player hp', Date.now())
                switchToNextCharacter();
        } else {
                battleStore.setCurrentTurn('player');
                console.log('tura playera')
                playerTurn();
        }   
    }
}

// Switching to next character

