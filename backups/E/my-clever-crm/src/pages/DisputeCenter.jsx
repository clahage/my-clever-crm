

import React, { useState } from "react";
import { ShieldCheck, FileText, Search, Filter, AlertCircle, Sparkles, Mail, ChevronRight, CheckCircle, XCircle } from "lucide-react";
import TemplateLibrary from '../components/TemplateEngine/TemplateLibrary';
import TemplatePreview from '../components/TemplateEngine/TemplatePreview';

// Mock Data
const mockClients = [
  { id: 1, name: "John Doe", email: "john@example.com" },
  { id: 2, name: "Jane Smith", email: "jane@example.com" },
];

const mockDisputes = [
  { id: 1, client: "John Doe", bureau: "Experian", status: "Open", type: "Late Payment", doc: "ID Verification", timeline: ["Created", "Letter Sent"] },
  { id: 2, client: "Jane Smith", bureau: "TransUnion", status: "Resolved", type: "Collection", doc: "Credit Report", timeline: ["Created", "Letter Sent", "Resolved"] },
];

const mockTemplates = [
  {
    id: 'template_001',
    name: 'Identity Theft Dispute Letter',
    category: 'disputes',
    type: 'letter',
    content: 'Dear {bureau_name}, I am writing to dispute items on my credit report due to identity theft. Please investigate and remove fraudulent accounts.\n\nSincerely, {client_name}',
    variables: ['{client_name}', '{bureau_name}'],
    tags: ['identity theft', 'dispute', 'credit'],
    aiGenerated: true,
    lastModified: '2025-01-15'
  },
  {
    id: 'template_002',
    name: 'Incorrect Payment History Dispute',
    category: 'disputes',
    type: 'letter',
    content: 'Dear {bureau_name}, I am disputing incorrect payment history for account {dispute_item}. Please correct the records.\n\nSincerely, {client_name}',
    variables: ['{client_name}', '{bureau_name}', '{dispute_item}'],
    tags: ['payment', 'dispute', 'credit'],
    aiGenerated: true,
    lastModified: '2025-01-15'
  },
  {
    id: 'template_003',
    name: 'Outdated Information Dispute',
    category: 'disputes',
    type: 'letter',
    content: 'Dear {bureau_name}, I am writing to dispute outdated information regarding {dispute_item}. Please update my records.\n\nSincerely, {client_name}',
    variables: ['{client_name}', '{bureau_name}', '{dispute_item}'],
    tags: ['outdated', 'dispute', 'credit'],
    aiGenerated: true,
    lastModified: '2025-01-15'
  },
  {
    id: 'template_004',
    name: 'Account Not Mine Dispute',
    category: 'disputes',
    type: 'letter',
    content: 'Dear {bureau_name}, I am disputing account {dispute_item} which does not belong to me. Please investigate and remove.\n\nSincerely, {client_name}',
    variables: ['{client_name}', '{bureau_name}', '{dispute_item}'],
    tags: ['account', 'not mine', 'dispute'],
    aiGenerated: true,
    lastModified: '2025-01-15'
  },
  {
    id: 'template_005',
    name: 'Settled/Paid Account Dispute',
    category: 'disputes',
    type: 'letter',
    content: 'Dear {bureau_name}, I am disputing the continued reporting of settled/paid account {dispute_item}. Please update my credit file.\n\nSincerely, {client_name}',
    variables: ['{client_name}', '{bureau_name}', '{dispute_item}'],
    tags: ['settled', 'paid', 'dispute'],
    aiGenerated: true,
    lastModified: '2025-01-15'
  }
];

const statusColors = {
  "Open": "bg-blue-100 text-blue-700",
  "Resolved": "bg-green-100 text-green-700",
  "In Progress": "bg-yellow-100 text-yellow-700",
};

// Simulated AI letter generator (replace with OpenAI API integration)
const generateAILetter = (client, type) => {
  return `Dear ${client},\n\nI am writing to dispute the ${type} on my credit report. Please investigate and remove this item.\n\nSincerely,\n${client}`;
};

function DisputeCenter() {
  const [selectedClient, setSelectedClient] = useState(mockClients[0].id);
  const [selectedType, setSelectedType] = useState("Late Payment");
  const [aiLetter, setAiLetter] = useState("");
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateSampleData, setTemplateSampleData] = useState({ client_name: "John Doe", bureau_name: "Experian", dispute_item: "Account #1234" });

  // Template selection handler
  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setShowTemplateSelector(false);
  };

  // Smart Dispute Wizard (unchanged)
  const handleWizardNext = () => {
    if (wizardStep === 2) {
      const client = mockClients.find(c => c.id === selectedClient)?.name;
      setAiLetter(generateAILetter(client, selectedType));
    }
    setWizardStep(wizardStep + 1);
  };
  const handleWizardPrev = () => setWizardStep(wizardStep - 1);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* ...existing code... */}
      {/* Template Integration Section */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Generate Dispute Letter</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded mb-4" onClick={() => setShowTemplateSelector(true)}>
          Choose Template

        </button>
        {showTemplateSelector && (
          <div className="mb-4">
            <TemplateLibrary templates={mockTemplates} onSelect={handleTemplateSelect} />
          </div>
        )}
        {selectedTemplate && (
          <TemplatePreview template={selectedTemplate} sampleData={templateSampleData} />
        )}
      </div>
      {/* ...existing code... */}
      {/* Dispute Dashboard, Bureau Management, Letter Templates Library, Smart Dispute Wizard ... */}
    </div>
  );
}

export default DisputeCenter;
