import React from 'react';

const ClientCreditCard = ({ client }) => {
  // Mock credit score for demo
  const score = 687;
  return (
    <div className="mt-2 p-2 bg-blue-50 rounded text-blue-800 text-xs">
      <span>Credit Score: {score}</span>
    </div>
  );
};

export default ClientCreditCard;
