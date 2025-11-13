import fs from 'fs';
import path from 'path';

// List of duplicate file groups (from your earlier JSON output)
const duplicates = [
  ["src/config/AIReceptionistPrompt.js", "src/AIReceptionistPrompt.js"],
  ["src/components/ActivityLog.jsx", "src/pages/restore/ActivityLog.jsx"],
  ["src/components/agreements/AdminAddendumFlow.jsx", "src/pages/AdminAddendumFlow.jsx"],
  ["src/components/Automation.jsx", "src/pages/Automation.jsx"],
  ["src/components/BrandLogo.jsx", "src/skins/BrandLogo.jsx"],
  ["src/components/Bulk.jsx", "src/pages/Bulk.jsx"],
  ["src/components/BulkActions.jsx", "src/_archive/BulkActions.jsx"],
  ["src/components/credit/CreditReportWorkflow.jsx", "src/pages/CreditReportWorkflow.jsx"],
  ["src/components/dispute/AutomatedFollowupSystem.jsx", "src/pages/tempfiles/disputetemp/AutomatedFollowupSystem.jsx"],
  ["src/components/dispute/BureauResponseProcessor.jsx", "src/pages/tempfiles/disputetemp/BureauResponseProcessor.jsx"],
  ["src/components/dispute/DisputeAnalyticsDashboard.jsx", "src/pages/tempfiles/disputetemp/DisputeAnalyticsDashboard.jsx"],
  ["src/components/dispute/DisputeHubConfig.jsx", "src/pages/tempfiles/disputetemp/DisputeHubConfig.jsx"],
  ["src/components/dispute/DisputeStrategyAnalyzer.jsx", "src/pages/tempfiles/disputetemp/DisputeStrategyAnalyzer.jsx"],
  ["src/components/dispute/DisputeTemplateManager.jsx", "src/pages/tempfiles/disputetemp/DisputeTemplateManager.jsx"],
  ["src/components/dispute/DisputeTrackingSystem.jsx", "src/pages/tempfiles/disputetemp/DisputeTrackingSystem.jsx"],
  ["src/components/ImportContactsModal.jsx", "src/components/leads/ImportContactsModal.jsx"],
  ["src/components/ModernDashboard.jsx", "src/modern/ModernDashboard.jsx"],
  ["src/components/skin/SkinSwitcher.jsx", "src/pages/SkinSwitcher.jsx", "src/skins/SkinSwitcher.jsx"],
  ["src/components/TemplateEngine/TemplateEditor.jsx", "src/pages/tempfiles/resourceLibrarySupportFiles/TemplateEditor.jsx"],
  ["src/components/WorkflowBuilder.jsx", "src/pages/tempfiles/automationtemp/WorkflowBuilder.jsx"],
  ["src/config/features.js", "src/features.js"],
  ["src/pages/hubs/CertificationSystem.jsx", "src/pages/CertificationSystem.jsx"],
  ["src/pages/DisputeCenter.jsx", "src/pages/restore/DisputeCenter.jsx"],
  ["src/pages/FeaturesTutorials.jsx", "src/pages/restore/FeaturesTutorials.jsx"],
  ["src/pages/hubs/ActionLibrary.jsx", "src/pages/tempfiles/automationtemp/ActionLibrary.jsx", "src/pages/tempfiles/mobileapptemp/ActionLibrary.jsx"],
  ["src/pages/hubs/AIContentGenerator.jsx", "src/pages/tempfiles/socialmediatemp/AIContentGenerator.jsx"],
  ["src/pages/hubs/AppPublishingWorkflow.jsx", "src/pages/tempfiles/mobileapptemp/AppPublishingWorkflow.jsx"],
  ["src/pages/hubs/AppThemingSystem.jsx", "src/pages/tempfiles/mobileapptemp/AppThemingSystem.jsx"],
  ["src/pages/hubs/CampaignPlanner.jsx", "src/pages/tempfiles/socialmediatemp/CampaignPlanner.jsx"],
  ["src/pages/hubs/ContentLibrary.jsx", "src/pages/tempfiles/socialmediatemp/ContentLibrary.jsx"],
  ["src/pages/hubs/DeepLinkingManager.jsx", "src/pages/tempfiles/mobileapptemp/DeepLinkingManager.jsx"],
  ["src/pages/hubs/EngagementTracker.jsx", "src/pages/tempfiles/socialmediatemp/EngagementTracker.jsx"],
  ["src/pages/hubs/InAppMessagingSystem.jsx", "src/pages/tempfiles/mobileapptemp/InAppMessagingSystem.jsx"],
  ["src/pages/hubs/KnowledgeBase.jsx", "src/pages/KnowledgeBase.jsx"],
  ["src/pages/hubs/LiveTrainingSessions.jsx", "src/pages/LiveTrainingSessions.jsx"],
  ["src/pages/hubs/MobileAnalyticsDashboard.jsx", "src/pages/tempfiles/mobileapptemp/MobileAnalyticsDashboard.jsx"],
  ["src/pages/hubs/MobileFeatureToggles.jsx", "src/pages/tempfiles/mobileapptemp/MobileFeatureToggles.jsx"],
  ["src/pages/hubs/MobileScreenBuilder.jsx", "src/pages/tempfiles/mobileapptemp/MobileScreenBuilder.jsx"],
  ["src/pages/hubs/MobileUserManager.jsx", "src/pages/tempfiles/mobileapptemp/MobileUserManager.jsx"],
  ["src/pages/hubs/OnboardingWizard.jsx", "src/pages/OnboardingWizard.jsx"],
  ["src/pages/hubs/PlatformManager.jsx", "src/pages/tempfiles/socialmediatemp/PlatformManager.jsx"],
  ["src/pages/hubs/PostScheduler.jsx", "src/pages/tempfiles/socialmediatemp/PostScheduler.jsx"],
  ["src/pages/hubs/ProgressTracker.jsx", "src/pages/ProgressTracker.jsx"],
  ["src/pages/hubs/PushNotificationManager.jsx", "src/pages/tempfiles/mobileapptemp/PushNotificationManager.jsx"],
  ["src/pages/hubs/RoleBasedTraining.jsx", "src/pages/RoleBasedTraining.jsx"],
  ["src/pages/hubs/SocialAnalytics.jsx", "src/pages/tempfiles/socialmediatemp/SocialAnalytics.jsx"],
  ["src/pages/hubs/SocialListening.jsx", "src/pages/tempfiles/socialmediatemp/SocialListening.jsx"],
  ["src/pages/hubs/TrainingLibrary.jsx", "src/pages/TrainingLibrary.jsx"],
  ["src/services/aiCreditReportParser.js", "src/utils/aiCreditReportParser.js"]
];

function getLineCount(filePath) {
  try {
    const absPath = path.resolve(filePath);
    if (!fs.existsSync(absPath)) return null;
    const content = fs.readFileSync(absPath, 'utf8');
    return content.split('\n').length;
  } catch (e) {
    return null;
  }
}

console.log('| Name | Path(s) | Line Count(s) |');
console.log('|------|---------|---------------|');
duplicates.forEach(group => {
  const name = path.basename(group[0]);
  const paths = group.map(p => p.replace(/\\/g, '/'));
  const counts = group.map(p => {
    const c = getLineCount(p);
    return c !== null ? c : 'N/A';
  });
  console.log(`| ${name} | ${paths.join(', ')} | ${counts.join(', ')} |`);
});