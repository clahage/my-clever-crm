import React from 'react';
import ServicePlanRecommender from '@/components/workflows/ServicePlanRecommender';

const ServicePlanRecommenderPage = (props) => {
  // You can pass props or context as needed
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Service Plan Recommendation</h1>
      <ServicePlanRecommender {...props} />
    </div>
  );
};

export default ServicePlanRecommenderPage;
