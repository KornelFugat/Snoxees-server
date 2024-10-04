import { accountStore } from '../routes/account';
import { battleStore } from '../routes/battleRoutes';
import { resetBattleStore,
     checkTeamBeforeBattle,
     setBattleEnemy,
     setCurrentTurn,
     setAnnouncement,
     setIsUIEnabled,
     calculateCaptureChance,
     getChosenAttack,
     substractHealth,
     afterPlayerAttack,
     switchingCharacter,
     handleCatchEnemy,
     handleEnemyAttack,
     afterEnemyAttack,
     resolveAttack,
    } from './battleUtils';
    


export const battleRequirements = () => {
    console.log('Battle requirements not met!');
    const condition = checkTeamBeforeBattle();
    if (condition) {
        resetBattleStore();
        console.log('Battle requirements met!');
    }
    
}

export const initializeBattle = () => {
    console.log('Initializing battle...');
    const condition = checkTeamBeforeBattle();
    console.log('init', Date.now())
    if (condition) {
        console.log('1')
        battleStore.setIsInitialized(true);
        setBattleEnemy();
        setAnnouncement([{text: "Get ready!", displayTime: 3000} ]);
        calculateCaptureChance();
        setCurrentTurn('player');
    }
    console.log('after init', Date.now())
}

export const playerAttack = (attackName: string) => {
    console.log('player attack', Date.now())
    const attack = getChosenAttack(attackName);
    if (attack) {
        resolveAttack(attack, 'player');
        battleStore.setChosenAttack(attackName)
        console.log('before afterPlayerAttack', Date.now())
        afterPlayerAttack();
    }
}

export const playerSwitch = (characterId: number) => {
    switchingCharacter(characterId);
    setTimeout(() => {
        afterPlayerAttack();
    }, 4000)
}

export const playerCatch = () => {
    handleCatchEnemy();  
}

export const playerEscape = () => {
    
}

export const playerItem = () => {
    
}


export const endingBattle = () => {
    console.log('ending battle')
}
