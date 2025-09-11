import React from "react";
import FeatureTutorial from '../FeatureTutorial';
import { usePermission } from '../../usePermission';

const Widget = ({ title, value, icon, color = "card", loading }) => {
  const hasPermission = usePermission('widget_leads');
  return (
    <div className="card flex items-center p-4 min-w-[180px] text-blue-700 font-bold">
      {icon && <div className="mr-4 text-3xl text-brand-primary">{icon}</div>}
      <div>
        <div className="text-lg font-bold text-brand-primary">{title}</div>
        <div className="text-2xl font-bold text-brand-secondary">{loading ? "..." : value}</div>
      </div>
      {hasPermission && (
        <FeatureTutorial
          featureId="widget_leads"
          steps={[
            { title: "Total Leads Widget", content: "This widget shows the total number of leads in your CRM. You can click for more details or filter by date." },
          ]}
        />
      )}
    </div>
  );
};

export default Widget;