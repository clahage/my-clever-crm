// AI Hot Word Detection System
// DO NOT IMPLEMENT DIRECTLY - Reference only

const emailProcessor = {
  hotWords: {
    urgent: ['lawsuit', 'attorney', 'cease and desist', 'fraud', 'identity theft'],
    financial: ['refund', 'charge', 'payment failed', 'cancel', 'billing'],
    emotional: ['suicide', 'depressed', 'emergency', 'crisis'],
    regulatory: ['FTC', 'CFPB', 'complaint', 'investigation']
  },

  calculateUrgency(email) {
    let score = 0;
    Object.entries(this.hotWords).forEach(([category, words]) => {
      words.forEach(word => {
        if (email.body.toLowerCase().includes(word)) {
          score += category === 'urgent' ? 10 : 5;
        }
      });
    });
    return Math.min(score, 10);
  },

  async processIncoming(email) {
    const urgencyScore = this.calculateUrgency(email);
    
    if (urgencyScore > 8) {
      // Alert admin immediately
      await this.alertAdmin(email, urgencyScore);
    }
    
    return { urgencyScore, autoResponded: true };
  }
};

export default emailProcessor;
