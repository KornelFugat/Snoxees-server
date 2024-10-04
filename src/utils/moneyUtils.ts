import { accountStore } from "../routes/account";



export const addGold = (amount: number) => {
    accountStore.addGold(amount);
}

export const substractGold = (amount: number) => {
    if (accountStore.gold >= amount) {
        accountStore.substractGold(amount);
    } else {
        throw new Error('Not enough gold');
    }
}

export const calculateTrainingCost = (level: number) => {
    return Math.floor(1 * Math.pow(1.8, level - 1));
  }

export const calculateEvolveCost = (currentLevel: number, targetLevel: number) => {
    let totalCost = 0;
    for (let i = currentLevel; i < targetLevel; i++) {
        console.log(i)
        console.log(calculateTrainingCost(i))
      totalCost += calculateTrainingCost(i);
      console.log(totalCost)
    }
    return totalCost;
  }