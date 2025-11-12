// test-require.js
console.log('🔍 Testing module loading...\n');

try {
  // Test emailWorkflowEngine
  console.log('Loading emailWorkflowEngine...');
  const engine = require('./emailWorkflowEngine');
  console.log('✅ emailWorkflowEngine loaded successfully');
  console.log('   Exports:', Object.keys(engine).length, 'functions/objects');
  
  // Verify critical exports
  const criticalExports = [
    'startWorkflow',
    'processScheduledStages',
    'SendGridService',
    'WorkflowEngine',
    'checkIDIQApplications',
    'generateAIEmailContent'
  ];
  
  const missing = criticalExports.filter(exp => !engine[exp]);
  if (missing.length > 0) {
    throw new Error(`Missing exports: ${missing.join(', ')}`);
  }
  console.log('   ✅ All critical exports present\n');
  
  // Test emailTemplates
  console.log('Loading emailTemplates...');
  const templates = require('./emailTemplates');
  console.log('✅ emailTemplates loaded successfully');
  console.log('   Templates available:', Object.keys(templates.TEMPLATES || {}).length);
  console.log('   ✅ Template system ready\n');
  
  console.log('🎉 ALL TESTS PASSED! Ready to deploy.\n');
  
} catch (error) {
  console.error('❌ ERROR:', error.message);
  console.error('\nStack trace:', error.stack);
  process.exit(1);
}
