import React from "react";
import { FEATURES } from "../features";
import FeatureTutorial from "../components/FeatureTutorial";
import { usePermission } from "../usePermission";

const FeaturesTutorials = () => {
  const { hasFeatureAccess } = usePermission();
  
  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Features & Tutorials</h1>
      <p className="mb-8 text-gray-600">Browse all CleverCRM features below. Click "Show Tutorial" to revisit or reset the onboarding/tutorial for any feature you have access to.</p>
      <div className="space-y-6">
        {FEATURES.map((feature) => {
          const hasPermission = hasFeatureAccess(feature.id);
          return (
            <div key={feature.id} className="bg-white rounded-lg shadow p-5 flex flex-col md:flex-row md:items-center md:justify-between opacity-100">
              <div>
                <div className="text-xl font-semibold">{feature.label}</div>
                {/* Optionally add a description here if available */}
              </div>
              <div className="mt-3 md:mt-0">
                {hasPermission ? (
                  <FeatureTutorial featureId={feature.id} steps={feature.tutorialSteps || []} showResetButton />
                ) : (
                  <span className="text-gray-400 italic">No access</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeaturesTutorials;