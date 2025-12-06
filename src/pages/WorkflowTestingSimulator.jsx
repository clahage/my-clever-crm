
import React from 'react';
import WorkflowTestingSimulator from '../components/WorkflowTestingSimulator';

export default function WorkflowTestingSimulatorPage(props) {
  // Example: load a workflow and test contact here, or use props
  // For now, just render the simulator with placeholder data
  const workflow = {
    id: 'demo_workflow',
    name: 'Demo Workflow',
    steps: [
      { type: 'email_send', name: 'Send Welcome Email' },
      { type: 'wait', name: 'Wait 2 Days' },
      { type: 'sms_send', name: 'Send SMS Reminder' }
    ]
  };
  const testContact = {
    id: 'test_contact_1',
    firstName: 'Test',
    lastName: 'Contact',
    email: 'test@example.com',
    phone: '555-1234'
  };
  return <WorkflowTestingSimulator workflow={workflow} testContact={testContact} />;
}
