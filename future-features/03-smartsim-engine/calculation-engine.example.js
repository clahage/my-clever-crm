// SmartSim™ Score Calculation Engine
// Reference implementation

const scoreImpacts = {
  payDownCard: (currentUtil, newUtil) => {
    const utilizationImprovement = currentUtil - newUtil;
    return Math.floor(utilizationImprovement * 30);
  },
  
  removeCollection: (collectionAge) => {
    if (collectionAge < 2) return 35;
    if (collectionAge < 4) return 25;
    return 15;
  },
  
  addAuthorizedUser: (accountAge, accountUtil) => {
    const ageBonus = Math.floor(accountAge / 12 * 5);
    const utilPenalty = accountUtil > 30 ? -5 : 0;
    return ageBonus + utilPenalty;
  },
  
  disputeInquiry: () => 5,
  
  newCreditLine: (currentMix) => {
    return currentMix.revolving < 3 ? 10 : -5;
  }
};

const simulateScore = (currentScore, actions) => {
  let newScore = currentScore;
  
  actions.forEach(action => {
    const impact = scoreImpacts[action.type](...action.params);
    newScore += impact;
  });
  
  return Math.max(300, Math.min(850, newScore));
};

export { simulateScore, scoreImpacts };
