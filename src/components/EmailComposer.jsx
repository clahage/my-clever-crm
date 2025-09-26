// src/components/EmailComposer.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { 
  Send, 
  Paperclip, 
  Image, 
  Smile, 
  Bold, 
  Italic, 
  Link2, 
  List,
  ChevronDown,
  Clock,
  Mail,
  User,
  Search,
  Star,
  Archive,
  Trash2,
  Reply,
  Forward,
  MoreVertical,
  Tag,
  Eye,
  EyeOff
} from 'lucide-react';

const EmailComposer = () => {
  // State Management
  const [activeTab, setActiveTab] = useState('compose');
  const [recipients, setRecipients] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [sentEmails, setSentEmails] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const [scheduleTime, setScheduleTime] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [sending, setSending] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [emailStats, setEmailStats] = useState({
    sent: 0,
    opened: 0,
    clicked: 0,
    replied: 0
  });

  // Load contacts on mount
  useEffect(() => {
    const loadContacts = async () => {
      const q = query(collection(db, 'contacts'), orderBy('name'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const contactsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setContacts(contactsList);
      });
      return unsubscribe;
    };
    loadContacts();
  }, []);

  // Load email templates
  useEffect(() => {
    const loadTemplates = async () => {
      const q = query(collection(db, 'emailTemplates'), orderBy('name'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const templatesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTemplates(templatesList);
      });
      return unsubscribe;
    };
    loadTemplates();
  }, []);

  // Load sent emails
  useEffect(() => {
    const loadSentEmails = async () => {
      const q = query(
        collection(db, 'emails'), 
        where('status', '==', 'sent'),
        orderBy('sentAt', 'desc')
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const emailsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSentEmails(emailsList);
        
        // Calculate stats
        const stats = emailsList.reduce((acc, email) => {
          acc.sent++;
          if (email.opened) acc.opened++;
          if (email.clicked) acc.clicked++;
          if (email.replied) acc.replied++;
          return acc;
        }, { sent: 0, opened: 0, clicked: 0, replied: 0 });
        setEmailStats(stats);
      });
      return unsubscribe;
    };
    loadSentEmails();
  }, []);

  // Generate tracking pixel ID
  const generateTrackingId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Insert tracking pixel into email
  const insertTrackingPixel = (emailContent, trackingId) => {
    if (!trackingEnabled) return emailContent;
    
    const pixelUrl = `https://speedycreditrepair.com/track/open/${trackingId}`;
    const pixel = `<img src="${pixelUrl}" width="1" height="1" style="display:none;" alt="" />`;
    
    return `${emailContent}${pixel}`;
  };

  // Handle template selection
  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setSubject(template.subject || '');
    setEmailBody(template.body || '');
  };

  // Send email function
  const sendEmail = async () => {
    if (!selectedRecipient || !subject || !emailBody) {
      alert('Please fill in all required fields');
      return;
    }

    setSending(true);
    
    try {
      const trackingId = generateTrackingId();
      const emailContent = insertTrackingPixel(emailBody, trackingId);
      
      const emailData = {
        to: selectedRecipient,
        cc: cc || null,
        bcc: bcc || null,
        subject,
        body: emailContent,
        rawBody: emailBody, // Store without tracking pixel for display
        trackingId: trackingEnabled ? trackingId : null,
        trackingEnabled,
        status: scheduleTime ? 'scheduled' : 'sent',
        scheduledFor: scheduleTime || null,
        sentAt: scheduleTime ? null : serverTimestamp(),
        createdAt: serverTimestamp(),
        opened: false,
        openedAt: null,
        clicked: false,
        clickedAt: null,
        replied: false,
        repliedAt: null,
        attachments: attachments.map(a => ({ name: a.name, size: a.size })),
        templateId: selectedTemplate?.id || null,
        templateName: selectedTemplate?.name || null
      };

      await addDoc(collection(db, 'emails'), emailData);
      
      // Log interaction if tracking enabled
      if (trackingEnabled) {
        await addDoc(collection(db, 'interactions'), {
          type: 'email',
          recipientEmail: selectedRecipient,
          subject,
          trackingId,
          timestamp: serverTimestamp(),
          status: 'sent'
        });
      }

      // Reset form
      setSubject('');
      setEmailBody('');
      setSelectedRecipient('');
      setCc('');
      setBcc('');
      setShowCcBcc(false);
      setAttachments([]);
      setScheduleTime('');
      setSelectedTemplate(null);
      
      alert('Email sent successfully!');
      setActiveTab('sent');
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email');
    } finally {
      setSending(false);
    }
  };

  // Save as draft
  const saveAsDraft = async () => {
    try {
      await addDoc(collection(db, 'emails'), {
        to: selectedRecipient || '',
        subject: subject || 'No Subject',
        body: emailBody || '',
        status: 'draft',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      alert('Draft saved successfully!');
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Failed to save draft');
    }
  };

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return `${minutes}m ago`;
      }
      return `${hours}h ago`;
    }
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header with Stats */}
        <div className="border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Email Communications Center</h1>
            <div className="flex space-x-6 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{emailStats.sent}</div>
                <div className="text-gray-500">Sent</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {emailStats.sent > 0 ? Math.round((emailStats.opened / emailStats.sent) * 100) : 0}%
                </div>
                <div className="text-gray-500">Opened</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {emailStats.sent > 0 ? Math.round((emailStats.clicked / emailStats.sent) * 100) : 0}%
                </div>
                <div className="text-gray-500">Clicked</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {emailStats.sent > 0 ? Math.round((emailStats.replied / emailStats.sent) * 100) : 0}%
                </div>
                <div className="text-gray-500">Replied</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b px-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('compose')}
              className={`py-3 border-b-2 font-medium text-sm ${
                activeTab === 'compose' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Mail className="w-4 h-4 inline mr-2" />
              Compose
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`py-3 border-b-2 font-medium text-sm ${
                activeTab === 'sent' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Send className="w-4 h-4 inline mr-2" />
              Sent ({sentEmails.length})
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`py-3 border-b-2 font-medium text-sm ${
                activeTab === 'templates' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Archive className="w-4 h-4 inline mr-2" />
              Templates ({templates.length})
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {activeTab === 'compose' && (
            <div className="space-y-4">
              {/* Recipients Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To
                </label>
                <select
                  value={selectedRecipient}
                  onChange={(e) => setSelectedRecipient(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a recipient...</option>
                  {contacts.map(contact => (
                    <option key={contact.id} value={contact.email}>
                      {contact.name} ({contact.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* CC/BCC Toggle */}
              {!showCcBcc && (
                <button
                  onClick={() => setShowCcBcc(true)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Add CC/BCC
                </button>
              )}

              {/* CC/BCC Fields */}
              {showCcBcc && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CC
                    </label>
                    <input
                      type="email"
                      value={cc}
                      onChange={(e) => setCc(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="cc@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      BCC
                    </label>
                    <input
                      type="email"
                      value={bcc}
                      onChange={(e) => setBcc(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="bcc@example.com"
                    />
                  </div>
                </>
              )}

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter subject..."
                />
              </div>

              {/* Template Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Use Template (Optional)
                </label>
                <select
                  onChange={(e) => {
                    const template = templates.find(t => t.id === e.target.value);
                    if (template) handleTemplateSelect(template);
                  }}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a template...</option>
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Email Body */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <div className="border rounded-lg">
                  {/* Formatting Toolbar */}
                  <div className="flex items-center space-x-2 p-2 border-b bg-gray-50">
                    <button className="p-1 hover:bg-gray-200 rounded">
                      <Bold className="w-4 h-4" />
                    </button>
                    <button className="p-1 hover:bg-gray-200 rounded">
                      <Italic className="w-4 h-4" />
                    </button>
                    <button className="p-1 hover:bg-gray-200 rounded">
                      <Link2 className="w-4 h-4" />
                    </button>
                    <button className="p-1 hover:bg-gray-200 rounded">
                      <List className="w-4 h-4" />
                    </button>
                    <div className="h-4 w-px bg-gray-300 mx-2" />
                    <button className="p-1 hover:bg-gray-200 rounded">
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <button className="p-1 hover:bg-gray-200 rounded">
                      <Image className="w-4 h-4" />
                    </button>
                    <button className="p-1 hover:bg-gray-200 rounded">
                      <Smile className="w-4 h-4" />
                    </button>
                  </div>
                  <textarea
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className="w-full px-4 py-3 min-h-[300px] focus:outline-none"
                    placeholder="Compose your email..."
                  />
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-4">
                  {/* Tracking Toggle */}
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={trackingEnabled}
                      onChange={(e) => setTrackingEnabled(e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">
                      {trackingEnabled ? <Eye className="w-4 h-4 inline mr-1" /> : <EyeOff className="w-4 h-4 inline mr-1" />}
                      Enable tracking
                    </span>
                  </label>

                  {/* Schedule */}
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-gray-500 mr-2" />
                    <input
                      type="datetime-local"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="text-sm border rounded px-2 py-1"
                      placeholder="Schedule send"
                    />
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={saveAsDraft}
                    className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50"
                  >
                    Save Draft
                  </button>
                  <button
                    onClick={sendEmail}
                    disabled={sending}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                  >
                    {sending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Email
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sent' && (
            <div>
              {/* Search Bar */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search sent emails..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Email List */}
              <div className="space-y-2">
                {sentEmails
                  .filter(email => 
                    email.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    email.to?.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map(email => (
                    <div 
                      key={email.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedEmail(email)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <span className="font-medium">{email.to}</span>
                            {email.opened && (
                              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                Opened {formatDate(email.openedAt)}
                              </span>
                            )}
                            {email.clicked && (
                              <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                Clicked
                              </span>
                            )}
                          </div>
                          <div className="text-sm font-medium mt-1">{email.subject}</div>
                          <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {email.rawBody || email.body}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 ml-4">
                          {formatDate(email.sentAt)}
                        </div>
                      </div>
                      {email.trackingEnabled && (
                        <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
                          <span>
                            <Eye className="w-3 h-3 inline mr-1" />
                            Tracking: {email.trackingId}
                          </span>
                          {email.templateName && (
                            <span>
                              <Tag className="w-3 h-3 inline mr-1" />
                              Template: {email.templateName}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div>
              <div className="mb-4">
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Create New Template
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map(template => (
                  <div key={template.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="font-medium mb-2">{template.name}</div>
                    <div className="text-sm text-gray-600 mb-2">{template.subject}</div>
                    <div className="text-xs text-gray-500 line-clamp-3">{template.body}</div>
                    <div className="mt-3 flex justify-between">
                      <button
                        onClick={() => handleTemplateSelect(template)}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Use Template
                      </button>
                      <button className="text-sm text-gray-500 hover:text-gray-700">
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selected Email Modal */}
      {selectedEmail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Email Details</h2>
              <button
                onClick={() => setSelectedEmail(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <div className="text-sm text-gray-500">To</div>
                <div className="font-medium">{selectedEmail.to}</div>
              </div>
              {selectedEmail.cc && (
                <div className="mb-4">
                  <div className="text-sm text-gray-500">CC</div>
                  <div className="font-medium">{selectedEmail.cc}</div>
                </div>
              )}
              <div className="mb-4">
                <div className="text-sm text-gray-500">Subject</div>
                <div className="font-medium">{selectedEmail.subject}</div>
              </div>
              <div className="mb-4">
                <div className="text-sm text-gray-500">Sent</div>
                <div className="font-medium">
                  {selectedEmail.sentAt ? new Date(selectedEmail.sentAt.seconds * 1000).toLocaleString() : 'N/A'}
                </div>
              </div>
              {selectedEmail.trackingEnabled && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium mb-2">Tracking Information</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Status:</span>{' '}
                      <span className={selectedEmail.opened ? 'text-green-600' : 'text-gray-600'}>
                        {selectedEmail.opened ? 'Opened' : 'Not opened'}
                      </span>
                    </div>
                    {selectedEmail.opened && (
                      <div>
                        <span className="text-gray-500">Opened at:</span>{' '}
                        <span>{formatDate(selectedEmail.openedAt)}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500">Links clicked:</span>{' '}
                      <span className={selectedEmail.clicked ? 'text-purple-600' : 'text-gray-600'}>
                        {selectedEmail.clicked ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Replied:</span>{' '}
                      <span className={selectedEmail.replied ? 'text-orange-600' : 'text-gray-600'}>
                        {selectedEmail.replied ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div className="mb-4">
                <div className="text-sm text-gray-500 mb-2">Message</div>
                <div className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: selectedEmail.rawBody || selectedEmail.body }} />
                </div>
              </div>
              <div className="flex space-x-3 pt-4 border-t">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
                  <Reply className="w-4 h-4 mr-2" />
                  Reply
                </button>
                <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center">
                  <Forward className="w-4 h-4 mr-2" />
                  Forward
                </button>
                <button className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50">
                  <Trash2 className="w-4 h-4 inline mr-2" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailComposer;