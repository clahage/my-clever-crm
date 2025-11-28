/**
 * SpeedyCRM Comprehensive Testing Checklists
 *
 * This file contains all test scenarios, steps, expected results,
 * and troubleshooting information for the complete CRM testing framework.
 */

export const masterTestingChecklist = {
  categories: [
    {
      id: 'contact-entry',
      name: 'Contact Entry Methods',
      icon: 'UserPlus',
      description: 'Test all methods of creating contacts in the system',
      scenarios: [
        {
          id: 'manual-entry-minimum',
          name: 'Manual Entry - Minimum Required Fields',
          priority: 'high',
          estimatedTime: '5 minutes',
          description: 'Test contact creation with only required fields',
          prerequisites: [
            'User must be logged in',
            'User must have role >= 3 (can create contacts)',
            'Firebase connection active'
          ],
          steps: [
            {
              id: 1,
              description: 'Navigate to /contacts page',
              expectedResult: 'Contacts page loads, shows contact list or empty state',
              troubleshooting: [
                'If page doesn\'t load, check authentication',
                'If 404 error, verify routing configuration',
                'If blank screen, check browser console for errors'
              ]
            },
            {
              id: 2,
              description: 'Click "Add New Contact" or "+ New Contact" button',
              expectedResult: 'Contact form modal or page opens',
              troubleshooting: [
                'If button not visible, check user permissions (role >= 3)',
                'If nothing happens on click, check browser console',
                'If button disabled, verify no form already open'
              ]
            },
            {
              id: 3,
              description: 'Fill minimum required fields: firstName="Test", lastName="Contact001", email="test.contact001@example.com"',
              expectedResult: 'Fields accept input, no validation errors',
              troubleshooting: [
                'If fields not accepting input, check if form loaded correctly',
                'If validation errors appear, verify field requirements',
                'If email validation fails, check email format validation regex'
              ]
            },
            {
              id: 4,
              description: 'Click "Save" or "Create Contact" button',
              expectedResult: 'Form submits, loading indicator appears',
              troubleshooting: [
                'If button disabled, check required field validation',
                'If form doesn\'t submit, check browser console',
                'If network error, verify Firebase connection'
              ]
            },
            {
              id: 5,
              description: 'Verify success message appears',
              expectedResult: 'Green notification: "Contact created successfully" or similar',
              troubleshooting: [
                'If no message, check notification system',
                'If error message, review error details',
                'If timeout, check Firebase performance'
              ]
            },
            {
              id: 6,
              description: 'Verify contact appears in contacts list',
              expectedResult: 'New contact "Test Contact001" visible in table/list',
              troubleshooting: [
                'If not visible, refresh page and check again',
                'If still missing, verify Firebase real-time listener',
                'Check if filters are hiding the contact',
                'Verify contact was actually saved (check Firebase Console)'
              ]
            },
            {
              id: 7,
              description: 'Open Firebase Console → Firestore Database → contacts collection',
              expectedResult: 'Firebase Console loads, contacts collection visible',
              troubleshooting: [
                'If access denied, verify Firebase permissions',
                'If collection empty, contact creation failed',
                'If collection doesn\'t exist, database not initialized'
              ]
            },
            {
              id: 8,
              description: 'Find the newly created contact document (sort by createdAt desc)',
              expectedResult: 'Document exists with matching firstName, lastName, email',
              fieldChecks: [
                'firstName: "Test"',
                'lastName: "Contact001"',
                'email: "test.contact001@example.com"',
                'createdAt: (recent timestamp)',
                'updatedAt: (recent timestamp)',
                'createdBy: (current user ID)',
                'id: (unique document ID)'
              ],
              troubleshooting: [
                'If document missing, contact creation failed',
                'If fields incorrect, check form submission logic',
                'If timestamps missing, check server timestamp usage'
              ]
            },
            {
              id: 9,
              description: 'Verify timestamps are present and recent (createdAt, updatedAt)',
              expectedResult: 'Both timestamps within last 5 minutes',
              troubleshooting: [
                'If timestamps missing, check Firebase security rules',
                'If timestamps old, wrong document selected',
                'If timestamps future, server clock issue'
              ]
            },
            {
              id: 10,
              description: 'Verify createdBy field matches current user ID',
              expectedResult: 'createdBy = current logged-in user\'s UID',
              troubleshooting: [
                'If missing, check authentication context',
                'If wrong user, check user context in form',
                'If null, user ID not passed to creation function'
              ]
            }
          ]
        },
        {
          id: 'manual-entry-full',
          name: 'Manual Entry - All Available Fields',
          priority: 'medium',
          estimatedTime: '10 minutes',
          description: 'Test contact creation with all optional fields populated',
          prerequisites: [
            'User must be logged in',
            'User must have role >= 3',
            'Previous minimum fields test passed'
          ],
          steps: [
            {
              id: 1,
              description: 'Navigate to /contacts and open contact form',
              expectedResult: 'Contact form opens'
            },
            {
              id: 2,
              description: 'Fill ALL available fields including: firstName, lastName, email, phone, address, city, state, zip, dateOfBirth, company, title, website, notes, tags',
              expectedResult: 'All fields accept appropriate input',
              testData: {
                firstName: 'Full',
                lastName: 'Contact002',
                email: 'full.contact002@example.com',
                phone: '555-123-4567',
                address: '123 Test Street',
                city: 'Test City',
                state: 'CA',
                zip: '90210',
                dateOfBirth: '1990-01-15',
                company: 'Test Company Inc',
                title: 'Test Manager',
                website: 'https://testcompany.com',
                notes: 'This is a comprehensive test contact with all fields populated',
                tags: ['test', 'comprehensive', 'all-fields']
              }
            },
            {
              id: 3,
              description: 'Upload profile photo (if feature exists)',
              expectedResult: 'Photo uploads successfully, preview shows'
            },
            {
              id: 4,
              description: 'Add multiple phone numbers (if feature exists)',
              expectedResult: 'Multiple phone numbers saved'
            },
            {
              id: 5,
              description: 'Add custom fields (if feature exists)',
              expectedResult: 'Custom fields saved with contact'
            },
            {
              id: 6,
              description: 'Submit form',
              expectedResult: 'Contact created successfully'
            },
            {
              id: 7,
              description: 'Verify ALL fields saved correctly in Firebase',
              expectedResult: 'All fields present in Firebase document',
              fieldChecks: [
                'All text fields match input',
                'Phone formatted correctly',
                'Date stored in proper format',
                'Tags array contains all tags',
                'Notes preserved with formatting'
              ]
            },
            {
              id: 8,
              description: 'Verify profile photo uploaded to Firebase Storage (if applicable)',
              expectedResult: 'Photo file in Storage, URL in contact document'
            },
            {
              id: 9,
              description: 'Open contact profile, verify all data displays correctly',
              expectedResult: 'All fields render correctly in UI'
            },
            {
              id: 10,
              description: 'Verify special characters handled correctly (test with accents, emojis)',
              expectedResult: 'Special characters display and save correctly'
            }
          ]
        },
        {
          id: 'manual-entry-validation',
          name: 'Form Validation Testing',
          priority: 'high',
          estimatedTime: '8 minutes',
          description: 'Test all form validation rules and error handling',
          steps: [
            {
              id: 1,
              description: 'Try to submit form with NO fields filled',
              expectedResult: 'Form does NOT submit, shows validation errors for required fields'
            },
            {
              id: 2,
              description: 'Try to submit with only firstName (missing lastName and email/phone)',
              expectedResult: 'Validation error: "Last name required" or similar'
            },
            {
              id: 3,
              description: 'Try to submit with invalid email format: "notanemail"',
              expectedResult: 'Validation error: "Invalid email format" or similar'
            },
            {
              id: 4,
              description: 'Try to submit with invalid phone format: "abc123"',
              expectedResult: 'Either auto-formats or shows validation error'
            },
            {
              id: 5,
              description: 'Try extremely long text in name fields (500+ characters)',
              expectedResult: 'Either character limit enforced or handles gracefully'
            },
            {
              id: 6,
              description: 'Try SQL injection patterns: "Robert\'); DROP TABLE contacts;--"',
              expectedResult: 'Treated as normal text, no SQL execution (Firebase safe by default)'
            },
            {
              id: 7,
              description: 'Try XSS patterns: "<script>alert(\'XSS\')</script>"',
              expectedResult: 'Sanitized or escaped, no script execution'
            },
            {
              id: 8,
              description: 'Test duplicate email detection (if implemented)',
              expectedResult: 'Warning or error if email already exists'
            },
            {
              id: 9,
              description: 'Test date validation with invalid dates: "1900-01-01" or future dates',
              expectedResult: 'Appropriate validation or acceptance based on business rules'
            },
            {
              id: 10,
              description: 'Test ZIP code validation with invalid formats',
              expectedResult: 'Either formats automatically or shows validation error'
            }
          ]
        },
        {
          id: 'csv-import-basic',
          name: 'CSV Import - 10 Valid Contacts',
          priority: 'high',
          estimatedTime: '10 minutes',
          description: 'Test bulk contact import from CSV file',
          prerequisites: [
            'CSV import feature exists',
            'User has import permissions',
            'Sample CSV file prepared'
          ],
          steps: [
            {
              id: 1,
              description: 'Create CSV file with 10 valid test contacts',
              expectedResult: 'CSV file with headers: firstName, lastName, email, phone',
              sampleData: `firstName,lastName,email,phone
Import,Contact001,import001@example.com,555-001-0001
Import,Contact002,import002@example.com,555-001-0002
Import,Contact003,import003@example.com,555-001-0003
Import,Contact004,import004@example.com,555-001-0004
Import,Contact005,import005@example.com,555-001-0005
Import,Contact006,import006@example.com,555-001-0006
Import,Contact007,import007@example.com,555-001-0007
Import,Contact008,import008@example.com,555-001-0008
Import,Contact009,import009@example.com,555-001-0009
Import,Contact010,import010@example.com,555-001-0010`
            },
            {
              id: 2,
              description: 'Navigate to contacts page and click "Import" or "Import Contacts" button',
              expectedResult: 'Import modal or page opens'
            },
            {
              id: 3,
              description: 'Select the prepared CSV file',
              expectedResult: 'File selected, filename displays'
            },
            {
              id: 4,
              description: 'Map CSV columns to CRM fields',
              expectedResult: 'Column mapping interface shows, can assign each CSV column to CRM field'
            },
            {
              id: 5,
              description: 'Preview import data',
              expectedResult: 'Preview shows 10 contacts with mapped fields'
            },
            {
              id: 6,
              description: 'Click "Import" or "Start Import" button',
              expectedResult: 'Import process begins, progress indicator shows'
            },
            {
              id: 7,
              description: 'Wait for import completion',
              expectedResult: 'Import completes within reasonable time (< 30 seconds for 10 contacts)'
            },
            {
              id: 8,
              description: 'Review import summary report',
              expectedResult: 'Report shows: 10 successful, 0 failed, 0 duplicates'
            },
            {
              id: 9,
              description: 'Verify all 10 contacts appear in contacts list',
              expectedResult: 'All imported contacts visible (may need pagination)'
            },
            {
              id: 10,
              description: 'Verify sample contacts in Firebase',
              expectedResult: 'All 10 documents exist in contacts collection with correct data'
            }
          ]
        },
        {
          id: 'csv-import-validation',
          name: 'CSV Import - Error Handling',
          priority: 'medium',
          estimatedTime: '12 minutes',
          description: 'Test CSV import with invalid data and edge cases',
          steps: [
            {
              id: 1,
              description: 'Create CSV with missing required fields',
              expectedResult: 'CSV with some rows missing firstName or lastName'
            },
            {
              id: 2,
              description: 'Attempt import',
              expectedResult: 'Import processes, error report shows failed rows with reasons'
            },
            {
              id: 3,
              description: 'Create CSV with duplicate emails',
              expectedResult: 'CSV where 2+ contacts have same email'
            },
            {
              id: 4,
              description: 'Attempt import',
              expectedResult: 'Duplicate detection works, shows merge options or skips duplicates'
            },
            {
              id: 5,
              description: 'Create CSV with invalid email formats',
              expectedResult: 'Some rows have bad email formats'
            },
            {
              id: 6,
              description: 'Attempt import',
              expectedResult: 'Validation catches bad emails, error report shows issues'
            },
            {
              id: 7,
              description: 'Create CSV with special characters and emojis',
              expectedResult: 'Rows contain UTF-8 characters, accents, emojis'
            },
            {
              id: 8,
              description: 'Attempt import',
              expectedResult: 'Special characters handled correctly, no encoding issues'
            },
            {
              id: 9,
              description: 'Create very large CSV (1000+ contacts)',
              expectedResult: 'Large CSV file prepared'
            },
            {
              id: 10,
              description: 'Attempt import',
              expectedResult: 'Handles large import gracefully (batch processing, progress updates)'
            }
          ]
        },
        {
          id: 'api-integration',
          name: 'API Contact Creation',
          priority: 'medium',
          estimatedTime: '15 minutes',
          description: 'Test contact creation via API/webhook',
          prerequisites: [
            'API endpoint deployed',
            'API authentication configured',
            'HTTP client available (Postman, curl, etc.)'
          ],
          steps: [
            {
              id: 1,
              description: 'Identify API endpoint URL for contact creation',
              expectedResult: 'URL like: https://your-project.cloudfunctions.net/createContact'
            },
            {
              id: 2,
              description: 'Prepare API request with valid JSON payload',
              expectedResult: 'JSON with required contact fields',
              samplePayload: {
                firstName: 'API',
                lastName: 'Contact001',
                email: 'api.contact001@example.com',
                phone: '555-999-0001',
                source: 'api-test'
              }
            },
            {
              id: 3,
              description: 'Send POST request to API endpoint',
              expectedResult: 'Request sent successfully'
            },
            {
              id: 4,
              description: 'Verify API returns 200 success response',
              expectedResult: 'HTTP 200 with JSON response containing contact ID'
            },
            {
              id: 5,
              description: 'Check response body contains contact ID',
              expectedResult: 'Response like: {"success": true, "contactId": "abc123"}'
            },
            {
              id: 6,
              description: 'Verify contact created in Firebase',
              expectedResult: 'Contact document exists with correct data'
            },
            {
              id: 7,
              description: 'Verify source field populated correctly',
              expectedResult: 'contact.source = "api-test" or appropriate value'
            },
            {
              id: 8,
              description: 'Test API authentication (if implemented)',
              expectedResult: 'Request without auth token fails with 401'
            },
            {
              id: 9,
              description: 'Test API with invalid payload',
              expectedResult: 'Returns 400 bad request with error details'
            },
            {
              id: 10,
              description: 'Verify webhook confirmation sent (if applicable)',
              expectedResult: 'Confirmation webhook called or logged'
            }
          ]
        },
        {
          id: 'email-inbound',
          name: 'Contact Creation from Inbound Email',
          priority: 'low',
          estimatedTime: '15 minutes',
          description: 'Test automatic contact creation from incoming emails',
          prerequisites: [
            'Email processing function deployed',
            'Inbound email address configured',
            'Email forwarding set up'
          ],
          steps: [
            {
              id: 1,
              description: 'Send email to CRM inbound email address',
              expectedResult: 'Email sent from test address: test-inbound@example.com'
            },
            {
              id: 2,
              description: 'Wait for email processing (may take 1-5 minutes)',
              expectedResult: 'Email processed by system'
            },
            {
              id: 3,
              description: 'Verify contact auto-created from sender email',
              expectedResult: 'New contact with email: test-inbound@example.com'
            },
            {
              id: 4,
              description: 'Verify name extracted from email (signature or From field)',
              expectedResult: 'Name populated from email metadata'
            },
            {
              id: 5,
              description: 'Verify email content saved to contact notes or activity',
              expectedResult: 'Email body stored, accessible from contact record'
            },
            {
              id: 6,
              description: 'Verify email thread linked to contact',
              expectedResult: 'Email visible in contact\'s activity feed'
            },
            {
              id: 7,
              description: 'Send second email from same address',
              expectedResult: 'Second email sent'
            },
            {
              id: 8,
              description: 'Verify existing contact updated (not duplicate created)',
              expectedResult: 'Second email added to same contact, no duplicate'
            },
            {
              id: 9,
              description: 'Verify AI analysis of email content (if implemented)',
              expectedResult: 'Email content analyzed for intent, urgency, sentiment'
            },
            {
              id: 10,
              description: 'Check email processing logs in Firebase Functions',
              expectedResult: 'Logs show successful processing'
            }
          ]
        }
      ]
    },
    {
      id: 'ai-analysis',
      name: 'AI Analysis & Role Assignment',
      icon: 'Brain',
      description: 'Test AI-powered contact analysis and automatic role assignment',
      scenarios: [
        {
          id: 'ai-analysis-trigger',
          name: 'AI Analysis Triggers on Contact Creation',
          priority: 'critical',
          estimatedTime: '8 minutes',
          description: 'Verify AI analysis executes automatically for new contacts',
          steps: [
            {
              id: 1,
              description: 'Create new test contact',
              expectedResult: 'Contact created successfully'
            },
            {
              id: 2,
              description: 'Wait 5 seconds for AI processing',
              expectedResult: 'Sufficient time for Cloud Function execution'
            },
            {
              id: 3,
              description: 'Check Firebase Functions logs for AI function invocation',
              expectedResult: 'Function "analyzeContact" or similar executed',
              logLocation: 'Firebase Console → Functions → Logs'
            },
            {
              id: 4,
              description: 'Verify leadScore field populated (0-10)',
              expectedResult: 'contact.leadScore exists, value between 0 and 10',
              fieldCheck: 'leadScore: number (0-10)'
            },
            {
              id: 5,
              description: 'Verify aiAnalysis object exists',
              expectedResult: 'contact.aiAnalysis object with multiple properties',
              fieldCheck: 'aiAnalysis: { insights[], confidence, timestamp }'
            },
            {
              id: 6,
              description: 'Check aiAnalysis.insights array contains at least 3 insights',
              expectedResult: 'Array with 3+ insight strings',
              sampleInsights: [
                'High-quality business email domain',
                'Mobile phone number indicates direct reachability',
                'Optimal contact time: 9-11 AM based on creation time'
              ]
            },
            {
              id: 7,
              description: 'Verify predictedLifetimeValue calculated',
              expectedResult: 'contact.predictedLifetimeValue: number (dollar amount)',
              fieldCheck: 'predictedLifetimeValue: 2400 (example)'
            },
            {
              id: 8,
              description: 'Verify bestContactTime suggested',
              expectedResult: 'contact.bestContactTime: string (time range)',
              fieldCheck: 'bestContactTime: "9:00 AM - 11:00 AM"'
            },
            {
              id: 9,
              description: 'Verify communicationPreference detected',
              expectedResult: 'contact.communicationPreference: "email" | "phone" | "sms"',
              fieldCheck: 'communicationPreference: "email"'
            },
            {
              id: 10,
              description: 'Verify nextBestAction recommended',
              expectedResult: 'contact.nextBestAction: string (action recommendation)',
              fieldCheck: 'nextBestAction: "Send welcome email and schedule follow-up call"'
            }
          ]
        },
        {
          id: 'ai-analysis-quality',
          name: 'AI Analysis Quality Assessment',
          priority: 'high',
          estimatedTime: '10 minutes',
          description: 'Test AI analysis quality with various contact types',
          steps: [
            {
              id: 1,
              description: 'Create high-quality contact (business email, mobile, complete info)',
              expectedResult: 'Contact with all optimal fields'
            },
            {
              id: 2,
              description: 'Verify leadScore is high (8-10)',
              expectedResult: 'High score assigned for quality contact'
            },
            {
              id: 3,
              description: 'Create low-quality contact (generic email, missing info)',
              expectedResult: 'Contact with minimal/poor quality data'
            },
            {
              id: 4,
              description: 'Verify leadScore is low (1-3)',
              expectedResult: 'Low score assigned for poor quality contact'
            },
            {
              id: 5,
              description: 'Create medium-quality contact (personal email, some info)',
              expectedResult: 'Contact with average data quality'
            },
            {
              id: 6,
              description: 'Verify leadScore is medium (4-7)',
              expectedResult: 'Medium score assigned'
            },
            {
              id: 7,
              description: 'Compare AI insights for different quality levels',
              expectedResult: 'Different insights based on data quality'
            },
            {
              id: 8,
              description: 'Verify predictedLifetimeValue varies appropriately',
              expectedResult: 'Higher value for better quality contacts'
            },
            {
              id: 9,
              description: 'Check AI confidence scores',
              expectedResult: 'Higher confidence for more complete data'
            },
            {
              id: 10,
              description: 'Verify AI recommendations differ based on context',
              expectedResult: 'Contextual recommendations for each contact type'
            }
          ]
        },
        {
          id: 'role-assignment-prospect',
          name: 'Role Assignment - Prospect',
          priority: 'high',
          estimatedTime: '5 minutes',
          description: 'Test automatic prospect role assignment for new contacts',
          steps: [
            {
              id: 1,
              description: 'Create contact with minimal information (no prior history)',
              expectedResult: 'Basic contact created'
            },
            {
              id: 2,
              description: 'Wait for AI analysis and role assignment',
              expectedResult: 'Processing completes'
            },
            {
              id: 3,
              description: 'Verify role assigned = "prospect"',
              expectedResult: 'contact.role = "prospect" OR contact.roles includes "prospect"',
              fieldCheck: 'roles: ["prospect"]'
            },
            {
              id: 4,
              description: 'Verify no additional roles assigned yet',
              expectedResult: 'Only prospect role present'
            },
            {
              id: 5,
              description: 'Verify roleAssignedAt timestamp exists',
              expectedResult: 'contact.roleAssignedAt: timestamp',
              fieldCheck: 'roleAssignedAt: Timestamp'
            },
            {
              id: 6,
              description: 'Verify roleAssignedBy = "ai" or system identifier',
              expectedResult: 'contact.roleAssignedBy: "ai"',
              fieldCheck: 'roleAssignedBy: "ai"'
            },
            {
              id: 7,
              description: 'Verify prospect permissions applied',
              expectedResult: 'Contact has appropriate access level'
            },
            {
              id: 8,
              description: 'Verify prospect workflows triggered (welcome email, etc.)',
              expectedResult: 'Automated prospect workflows active'
            },
            {
              id: 9,
              description: 'Check activity log for role assignment entry',
              expectedResult: 'Activity: "Role assigned: prospect by AI"'
            },
            {
              id: 10,
              description: 'Verify role visible in contact profile UI',
              expectedResult: 'UI shows "Prospect" badge or indicator'
            }
          ]
        },
        {
          id: 'role-assignment-lead',
          name: 'Role Assignment - Lead Qualification',
          priority: 'high',
          estimatedTime: '8 minutes',
          description: 'Test lead role assignment when contact shows interest',
          steps: [
            {
              id: 1,
              description: 'Create prospect contact',
              expectedResult: 'Contact with prospect role'
            },
            {
              id: 2,
              description: 'Simulate engagement: log email open activity',
              expectedResult: 'Activity logged in contact record'
            },
            {
              id: 3,
              description: 'Log link click activity',
              expectedResult: 'Additional engagement tracked'
            },
            {
              id: 4,
              description: 'Log form submission or reply activity',
              expectedResult: 'Strong engagement signal recorded'
            },
            {
              id: 5,
              description: 'Trigger AI re-analysis (or wait for automatic re-analysis)',
              expectedResult: 'AI re-evaluates contact based on new activity'
            },
            {
              id: 6,
              description: 'Verify role upgraded to "lead"',
              expectedResult: 'contact.roles now includes "lead"',
              fieldCheck: 'roles: ["prospect", "lead"] or just ["lead"]'
            },
            {
              id: 7,
              description: 'Verify leadScore increased',
              expectedResult: 'Score higher than initial value'
            },
            {
              id: 8,
              description: 'Verify role change logged in activity',
              expectedResult: 'Activity: "Role upgraded to lead based on engagement"'
            },
            {
              id: 9,
              description: 'Verify lead workflows triggered',
              expectedResult: 'Lead nurture campaigns activated'
            },
            {
              id: 10,
              description: 'Check if sales rep notified of new lead',
              expectedResult: 'Notification sent to assigned rep or team'
            }
          ]
        },
        {
          id: 'role-assignment-client',
          name: 'Role Assignment - Client Conversion',
          priority: 'critical',
          estimatedTime: '6 minutes',
          description: 'Test client role assignment after purchase/conversion',
          steps: [
            {
              id: 1,
              description: 'Create lead contact',
              expectedResult: 'Contact with lead role'
            },
            {
              id: 2,
              description: 'Create invoice for contact (simulating purchase)',
              expectedResult: 'Invoice document created and linked to contact'
            },
            {
              id: 3,
              description: 'Mark invoice as paid',
              expectedResult: 'Invoice status = "paid"'
            },
            {
              id: 4,
              description: 'Trigger role update (may be automatic)',
              expectedResult: 'System detects payment and triggers role update'
            },
            {
              id: 5,
              description: 'Verify role updated to "client"',
              expectedResult: 'contact.roles includes "client"',
              fieldCheck: 'roles: ["client"] or ["lead", "client"]'
            },
            {
              id: 6,
              description: 'Verify contact.status = "active"',
              expectedResult: 'Active client status',
              fieldCheck: 'status: "active"'
            },
            {
              id: 7,
              description: 'Verify client onboarding tasks created',
              expectedResult: 'Task list generated for new client'
            },
            {
              id: 8,
              description: 'Verify client welcome email sent',
              expectedResult: 'Transactional email triggered'
            },
            {
              id: 9,
              description: 'Verify client portal access granted (if applicable)',
              expectedResult: 'Client can log in to portal'
            },
            {
              id: 10,
              description: 'Check revenue metrics updated',
              expectedResult: 'Client added to revenue reports, lifetime value tracked'
            }
          ]
        },
        {
          id: 'role-assignment-multiple',
          name: 'Multiple Role Assignment',
          priority: 'medium',
          estimatedTime: '7 minutes',
          description: 'Test contacts with multiple simultaneous roles',
          steps: [
            {
              id: 1,
              description: 'Create active client contact',
              expectedResult: 'Contact with client role'
            },
            {
              id: 2,
              description: 'Log referral activity (client refers friends)',
              expectedResult: 'Referral tracked in system'
            },
            {
              id: 3,
              description: 'Verify referred contacts link to referrer',
              expectedResult: 'Referral relationship established'
            },
            {
              id: 4,
              description: 'Manually or automatically add "partner" role',
              expectedResult: 'Contact now has client + partner roles'
            },
            {
              id: 5,
              description: 'Verify contact.roles = ["client", "partner"]',
              expectedResult: 'Array contains both roles',
              fieldCheck: 'roles: ["client", "partner"]'
            },
            {
              id: 6,
              description: 'Verify both role permissions applied',
              expectedResult: 'Contact has access to client AND partner features'
            },
            {
              id: 7,
              description: 'Verify partner commission tracking activated',
              expectedResult: 'Referral commissions calculated and displayed'
            },
            {
              id: 8,
              description: 'Check UI displays both role badges',
              expectedResult: 'Contact profile shows "Client" and "Partner" badges'
            },
            {
              id: 9,
              description: 'Verify both role-specific workflows active',
              expectedResult: 'Client emails AND partner emails sent'
            },
            {
              id: 10,
              description: 'Test role removal (remove partner role)',
              expectedResult: 'Partner role removed, client role remains'
            }
          ]
        },
        {
          id: 'ai-analysis-errors',
          name: 'AI Analysis Error Handling',
          priority: 'medium',
          estimatedTime: '10 minutes',
          description: 'Test system behavior when AI analysis fails',
          steps: [
            {
              id: 1,
              description: 'Create contact when API key is invalid (simulate)',
              expectedResult: 'Contact creation succeeds even if AI fails'
            },
            {
              id: 2,
              description: 'Verify contact saved with default values',
              expectedResult: 'leadScore = 5 (default), aiAnalysis = null or empty'
            },
            {
              id: 3,
              description: 'Verify error logged in Firebase Functions',
              expectedResult: 'Error log shows AI failure but not contact creation failure'
            },
            {
              id: 4,
              description: 'Verify contact still gets default role assigned',
              expectedResult: 'Fallback role assignment works without AI'
            },
            {
              id: 5,
              description: 'Check if retry mechanism exists',
              expectedResult: 'AI analysis retries automatically or queued for retry'
            },
            {
              id: 6,
              description: 'Test AI timeout scenario (slow API response)',
              expectedResult: 'System handles timeout gracefully'
            },
            {
              id: 7,
              description: 'Verify user notified of AI analysis pending/failed (if applicable)',
              expectedResult: 'UI shows "Analyzing..." or "Analysis unavailable"'
            },
            {
              id: 8,
              description: 'Test manual AI analysis trigger',
              expectedResult: 'User can manually re-trigger analysis'
            },
            {
              id: 9,
              description: 'Restore valid API configuration',
              expectedResult: 'AI analysis works for new contacts'
            },
            {
              id: 10,
              description: 'Verify previously failed contacts can be re-analyzed',
              expectedResult: 'Batch re-analysis option or automatic backfill'
            }
          ]
        }
      ]
    },
    {
      id: 'email-workflows',
      name: 'Email Workflows',
      icon: 'Mail',
      description: 'Test all automated and manual email workflows',
      scenarios: [
        {
          id: 'welcome-email-send',
          name: 'Welcome Email Sent on Contact Creation',
          priority: 'critical',
          estimatedTime: '8 minutes',
          description: 'Verify welcome email automation triggers correctly',
          prerequisites: [
            'Email function deployed',
            'SMTP configured',
            'Welcome email template exists'
          ],
          steps: [
            {
              id: 1,
              description: 'Create new contact with valid email address',
              expectedResult: 'Contact created with email: test-welcome@example.com',
              testEmail: 'test-welcome@example.com'
            },
            {
              id: 2,
              description: 'Wait 60 seconds for email processing',
              expectedResult: 'Sufficient time for email function execution'
            },
            {
              id: 3,
              description: 'Check Firebase Functions logs for email send function',
              expectedResult: 'Function "sendWelcomeEmail" or similar executed',
              logSearch: 'Search logs for contact ID or email address'
            },
            {
              id: 4,
              description: 'Verify email function execution succeeded (no errors)',
              expectedResult: 'Function completed successfully, exit code 0'
            },
            {
              id: 5,
              description: 'Check Gmail sent folder (if using Gmail SMTP)',
              expectedResult: 'Welcome email visible in sent items',
              alternativeCheck: 'Or check SMTP service dashboard (SendGrid, Mailgun, etc.)'
            },
            {
              id: 6,
              description: 'Check test email inbox for received email',
              expectedResult: 'Email received within 2 minutes'
            },
            {
              id: 7,
              description: 'Verify email subject line correct',
              expectedResult: 'Subject: "Welcome to SpeedyCRM!" or configured message'
            },
            {
              id: 8,
              description: 'Verify email personalization (firstName used)',
              expectedResult: 'Email body contains "Hi Test" or contact\'s firstName'
            },
            {
              id: 9,
              description: 'Verify email branding correct (logo, colors, footer)',
              expectedResult: 'Email matches brand guidelines'
            },
            {
              id: 10,
              description: 'Click links in email, verify tracking works',
              expectedResult: 'Link clicks recorded in contact activity (if tracking implemented)'
            }
          ]
        },
        {
          id: 'welcome-email-sequence',
          name: 'Welcome Email Sequence (Day 0, 1, 3, 7)',
          priority: 'high',
          estimatedTime: '15 minutes (or spread over 7 days)',
          description: 'Test automated email sequence timing and content',
          steps: [
            {
              id: 1,
              description: 'Create new contact to trigger sequence',
              expectedResult: 'Contact created, sequence scheduled'
            },
            {
              id: 2,
              description: 'Verify Day 0 email sent immediately (tested above)',
              expectedResult: 'Day 0 welcome email received'
            },
            {
              id: 3,
              description: 'Check email schedule in Firebase or database',
              expectedResult: 'Scheduled emails visible for Day 1, 3, 7',
              fieldCheck: 'emailSchedule: [{day: 1, templateId: "intro", sent: false}, ...]'
            },
            {
              id: 4,
              description: 'Wait 24 hours or manually trigger Day 1 email',
              expectedResult: 'Day 1 email sent'
            },
            {
              id: 5,
              description: 'Verify Day 1 email content (intro to services)',
              expectedResult: 'Email contains service introduction and value props'
            },
            {
              id: 6,
              description: 'Wait 3 days total or manually trigger Day 3 email',
              expectedResult: 'Day 3 email sent'
            },
            {
              id: 7,
              description: 'Verify Day 3 email content (case studies, social proof)',
              expectedResult: 'Email contains testimonials, success stories'
            },
            {
              id: 8,
              description: 'Wait 7 days total or manually trigger Day 7 email',
              expectedResult: 'Day 7 email sent'
            },
            {
              id: 9,
              description: 'Verify Day 7 email content (special offer, CTA)',
              expectedResult: 'Email contains offer and clear call-to-action'
            },
            {
              id: 10,
              description: 'Verify sequence stops if contact replies or converts',
              expectedResult: 'Email sequence canceled when contact engages'
            }
          ]
        },
        {
          id: 'email-tracking',
          name: 'Email Tracking (Opens, Clicks)',
          priority: 'medium',
          estimatedTime: '10 minutes',
          description: 'Test email engagement tracking functionality',
          prerequisites: [
            'Email tracking implemented',
            'Tracking pixels/links configured'
          ],
          steps: [
            {
              id: 1,
              description: 'Send tracked email to test contact',
              expectedResult: 'Email sent with tracking enabled'
            },
            {
              id: 2,
              description: 'Open email in email client',
              expectedResult: 'Email displays correctly'
            },
            {
              id: 3,
              description: 'Wait 10 seconds for tracking to register',
              expectedResult: 'Tracking pixel loads'
            },
            {
              id: 4,
              description: 'Check contact activity for email open event',
              expectedResult: 'Activity shows "Opened email: [subject]" with timestamp'
            },
            {
              id: 5,
              description: 'Click link in email',
              expectedResult: 'Link redirects correctly'
            },
            {
              id: 6,
              description: 'Check contact activity for link click event',
              expectedResult: 'Activity shows "Clicked link: [url]" with timestamp'
            },
            {
              id: 7,
              description: 'Open email again (test multiple opens)',
              expectedResult: 'Multiple open events tracked'
            },
            {
              id: 8,
              description: 'Verify email engagement metrics in contact profile',
              expectedResult: 'Metrics show: Opens: 2, Clicks: 1, Last Opened: [time]'
            },
            {
              id: 9,
              description: 'Test unsubscribe link',
              expectedResult: 'Unsubscribe link works, preference updated'
            },
            {
              id: 10,
              description: 'Verify unsubscribed contacts excluded from future emails',
              expectedResult: 'Email sends skip unsubscribed contacts'
            }
          ]
        },
        {
          id: 'email-campaign',
          name: 'Manual Email Campaign',
          priority: 'high',
          estimatedTime: '12 minutes',
          description: 'Test creating and sending email campaigns',
          steps: [
            {
              id: 1,
              description: 'Navigate to email campaigns section',
              expectedResult: 'Campaigns page or modal opens'
            },
            {
              id: 2,
              description: 'Click "Create Campaign" or "New Campaign"',
              expectedResult: 'Campaign builder opens'
            },
            {
              id: 3,
              description: 'Name campaign: "Test Campaign 001"',
              expectedResult: 'Campaign name set'
            },
            {
              id: 4,
              description: 'Select email template or create custom email',
              expectedResult: 'Email editor loads'
            },
            {
              id: 5,
              description: 'Compose email with subject and body',
              expectedResult: 'Email content created'
            },
            {
              id: 6,
              description: 'Select recipient segment (e.g., "All Prospects")',
              expectedResult: 'Recipients selected, count displayed'
            },
            {
              id: 7,
              description: 'Preview campaign (test recipient count, email preview)',
              expectedResult: 'Preview shows correct recipients and email rendering'
            },
            {
              id: 8,
              description: 'Schedule campaign or send immediately',
              expectedResult: 'Campaign scheduled/sent'
            },
            {
              id: 9,
              description: 'Monitor campaign progress',
              expectedResult: 'Progress bar shows emails being sent'
            },
            {
              id: 10,
              description: 'Review campaign report (sent, opened, clicked, bounced)',
              expectedResult: 'Comprehensive campaign metrics displayed'
            }
          ]
        },
        {
          id: 'transactional-emails',
          name: 'Transactional Email Triggers',
          priority: 'high',
          estimatedTime: '20 minutes',
          description: 'Test all transactional email triggers',
          steps: [
            {
              id: 1,
              description: 'Test invoice email: Create invoice for contact',
              expectedResult: 'Invoice email sent with PDF attachment or link'
            },
            {
              id: 2,
              description: 'Test payment confirmation: Mark invoice as paid',
              expectedResult: 'Payment confirmation email sent'
            },
            {
              id: 3,
              description: 'Test appointment confirmation: Schedule meeting with contact',
              expectedResult: 'Meeting confirmation email sent with calendar invite'
            },
            {
              id: 4,
              description: 'Test appointment reminder: Approach appointment time (or trigger manually)',
              expectedResult: 'Reminder email sent 24h before appointment'
            },
            {
              id: 5,
              description: 'Test document request: Request documents from contact',
              expectedResult: 'Document request email sent with upload link'
            },
            {
              id: 6,
              description: 'Test task assignment: Assign task to contact',
              expectedResult: 'Task notification email sent'
            },
            {
              id: 7,
              description: 'Test status update: Change contact or deal status',
              expectedResult: 'Status change notification email sent'
            },
            {
              id: 8,
              description: 'Test milestone email: Update contact\'s credit score (if IDIQ integrated)',
              expectedResult: 'Milestone achievement email sent'
            },
            {
              id: 9,
              description: 'Test renewal reminder: Approach service renewal date',
              expectedResult: 'Renewal reminder email sent'
            },
            {
              id: 10,
              description: 'Verify all transactional emails logged in contact activity',
              expectedResult: 'Each email appears in activity feed with timestamp'
            }
          ]
        },
        {
          id: 'email-error-handling',
          name: 'Email Error Handling',
          priority: 'medium',
          estimatedTime: '12 minutes',
          description: 'Test email system error scenarios',
          steps: [
            {
              id: 1,
              description: 'Send email to invalid address format: "notanemail"',
              expectedResult: 'System validates email, shows error or skips'
            },
            {
              id: 2,
              description: 'Send email to non-existent domain: "test@fakefakefakedomain123.com"',
              expectedResult: 'Email queued, bounce detected later'
            },
            {
              id: 3,
              description: 'Check bounce handling after send',
              expectedResult: 'Bounced email logged, contact email marked invalid'
            },
            {
              id: 4,
              description: 'Test spam report handling',
              expectedResult: 'Contact marked as spam reporter, excluded from future sends'
            },
            {
              id: 5,
              description: 'Test rate limiting (send many emails rapidly)',
              expectedResult: 'System queues emails, respects rate limits'
            },
            {
              id: 6,
              description: 'Test email sending when SMTP is misconfigured (simulate)',
              expectedResult: 'Errors logged, system doesn\'t crash, retries or fails gracefully'
            },
            {
              id: 7,
              description: 'Verify failed email sends logged in activity',
              expectedResult: 'Activity shows "Email failed: [reason]"'
            },
            {
              id: 8,
              description: 'Test email template errors (missing template)',
              expectedResult: 'Error handled, fallback template used or error logged'
            },
            {
              id: 9,
              description: 'Test personalization errors (missing firstName)',
              expectedResult: 'Fallback value used: "Hi there" instead of "Hi [missing]"'
            },
            {
              id: 10,
              description: 'Verify admin notified of repeated email failures',
              expectedResult: 'Alert sent when failure rate exceeds threshold'
            }
          ]
        }
      ]
    },
    {
      id: 'idiq-workflows',
      name: 'IDIQ Credit Monitoring',
      icon: 'Shield',
      description: 'Test IDIQ enrollment and credit monitoring integration',
      scenarios: [
        {
          id: 'idiq-manual-enrollment',
          name: 'Manual IDIQ Enrollment',
          priority: 'critical',
          estimatedTime: '10 minutes',
          description: 'Test manual enrollment of contact into IDIQ credit monitoring',
          prerequisites: [
            'IDIQ API credentials configured',
            'IDIQ integration function deployed',
            'Contact with SSN available (test data)'
          ],
          steps: [
            {
              id: 1,
              description: 'Open contact profile',
              expectedResult: 'Contact profile page displays'
            },
            {
              id: 2,
              description: 'Look for "Enroll in IDIQ" or "Credit Monitoring" button',
              expectedResult: 'Enrollment button visible'
            },
            {
              id: 3,
              description: 'Click enrollment button',
              expectedResult: 'Enrollment form/modal opens'
            },
            {
              id: 4,
              description: 'Fill required enrollment fields',
              expectedResult: 'Form accepts input',
              requiredFields: [
                'firstName',
                'lastName',
                'ssn (test: 000-00-0000 or valid test SSN)',
                'dateOfBirth',
                'address',
                'city',
                'state',
                'zip'
              ]
            },
            {
              id: 5,
              description: 'Submit enrollment form',
              expectedResult: 'Form submits, loading indicator shows'
            },
            {
              id: 6,
              description: 'Wait for IDIQ API response (10-30 seconds typical)',
              expectedResult: 'Response received from IDIQ'
            },
            {
              id: 7,
              description: 'Verify success message displays',
              expectedResult: 'Message: "Successfully enrolled in credit monitoring" or similar'
            },
            {
              id: 8,
              description: 'Verify enrollmentId displayed in contact profile',
              expectedResult: 'enrollmentId shown: "IDIQ-12345678" format'
            },
            {
              id: 9,
              description: 'Check Firebase idiqEnrollments collection',
              expectedResult: 'Enrollment document created with enrollmentId, contactId, status, etc.'
            },
            {
              id: 10,
              description: 'Verify contact.idiqEnrollmentId field populated',
              expectedResult: 'contact.idiqEnrollmentId = enrollment document ID'
            },
            {
              id: 11,
              description: 'Verify initial credit report pulled',
              expectedResult: 'contact.creditScore populated or initial report document created'
            },
            {
              id: 12,
              description: 'Verify credit score visible in contact profile UI',
              expectedResult: 'Credit score displays: e.g., "650" with gauge or chart'
            }
          ]
        },
        {
          id: 'idiq-enrollment-errors',
          name: 'IDIQ Enrollment Error Handling',
          priority: 'high',
          estimatedTime: '15 minutes',
          description: 'Test error scenarios during IDIQ enrollment',
          steps: [
            {
              id: 1,
              description: 'Attempt enrollment with invalid SSN format',
              expectedResult: 'Validation error before API call: "Invalid SSN format"'
            },
            {
              id: 2,
              description: 'Attempt enrollment with missing required fields',
              expectedResult: 'Form validation prevents submission'
            },
            {
              id: 3,
              description: 'Attempt enrollment with test SSN that IDIQ rejects',
              expectedResult: 'API returns error, system displays error message to user'
            },
            {
              id: 4,
              description: 'Check Firebase Functions logs for error details',
              expectedResult: 'Logs show IDIQ API error response'
            },
            {
              id: 5,
              description: 'Attempt duplicate enrollment (enroll already enrolled contact)',
              expectedResult: 'System detects existing enrollment, prevents duplicate or updates existing'
            },
            {
              id: 6,
              description: 'Test enrollment with IDIQ API timeout (simulate slow response)',
              expectedResult: 'Timeout error handled gracefully, user notified'
            },
            {
              id: 7,
              description: 'Test enrollment when IDIQ API is unreachable (simulate)',
              expectedResult: 'Connection error handled, user can retry'
            },
            {
              id: 8,
              description: 'Verify failed enrollment logged in contact activity',
              expectedResult: 'Activity: "IDIQ enrollment failed: [reason]"'
            },
            {
              id: 9,
              description: 'Verify failed enrollment does NOT create enrollmentId',
              expectedResult: 'contact.idiqEnrollmentId remains null/empty'
            },
            {
              id: 10,
              description: 'Test retry mechanism after failure',
              expectedResult: 'User can retry enrollment, previous failure doesn\'t block'
            }
          ]
        },
        {
          id: 'idiq-credit-report-pull',
          name: 'Credit Report Retrieval',
          priority: 'high',
          estimatedTime: '12 minutes',
          description: 'Test pulling credit reports for enrolled contacts',
          steps: [
            {
              id: 1,
              description: 'Ensure contact is enrolled in IDIQ',
              expectedResult: 'Contact has valid enrollmentId'
            },
            {
              id: 2,
              description: 'Look for "Pull Credit Report" or "Refresh Report" button',
              expectedResult: 'Button visible in contact profile'
            },
            {
              id: 3,
              description: 'Click to request new credit report',
              expectedResult: 'Request sent to IDIQ API'
            },
            {
              id: 4,
              description: 'Wait for report retrieval (10-60 seconds typical)',
              expectedResult: 'Report data received'
            },
            {
              id: 5,
              description: 'Verify credit report stored in Firebase',
              expectedResult: 'Document created in creditReports collection or subcollection'
            },
            {
              id: 6,
              description: 'Verify report contains expected data',
              expectedResult: 'Report includes: score, accounts, inquiries, public records, etc.',
              reportFields: [
                'creditScore (e.g., 650)',
                'reportDate',
                'accounts[] (credit accounts)',
                'inquiries[]',
                'publicRecords[]',
                'negativeItems[]'
              ]
            },
            {
              id: 7,
              description: 'Verify credit score updated in contact record',
              expectedResult: 'contact.creditScore = latest score from report'
            },
            {
              id: 8,
              description: 'Verify report visible in contact profile UI',
              expectedResult: 'Credit report details display (score, accounts, etc.)'
            },
            {
              id: 9,
              description: 'Verify report date/timestamp displayed',
              expectedResult: 'UI shows "Report as of [date]"'
            },
            {
              id: 10,
              description: 'Test viewing historical reports (if multiple reports exist)',
              expectedResult: 'Can view previous reports, compare changes over time'
            }
          ]
        },
        {
          id: 'idiq-credit-monitoring',
          name: 'Automatic Credit Monitoring Updates',
          priority: 'high',
          estimatedTime: '15 minutes',
          description: 'Test automatic credit report updates via webhook or polling',
          prerequisites: [
            'IDIQ webhook configured OR scheduled polling job active',
            'Enrolled contact with monitoring active'
          ],
          steps: [
            {
              id: 1,
              description: 'Verify monitoring status in contact record',
              expectedResult: 'contact.creditMonitoringActive = true'
            },
            {
              id: 2,
              description: 'Simulate credit report update from IDIQ (webhook or manual trigger)',
              expectedResult: 'New report data received'
            },
            {
              id: 3,
              description: 'Verify new credit report document created',
              expectedResult: 'New document in creditReports with updated data'
            },
            {
              id: 4,
              description: 'Verify contact.creditScore updated automatically',
              expectedResult: 'Score updated in real-time'
            },
            {
              id: 5,
              description: 'Check if score changed from previous report',
              expectedResult: 'Score comparison available'
            },
            {
              id: 6,
              description: 'If score increased significantly (+20 points), verify alert triggered',
              expectedResult: 'Email or notification sent: "Great news! Credit score increased"'
            },
            {
              id: 7,
              description: 'If score decreased significantly (-20 points), verify alert triggered',
              expectedResult: 'Email or notification sent: "Alert: Credit score decreased"'
            },
            {
              id: 8,
              description: 'Verify credit score history chart updated',
              expectedResult: 'Historical chart shows new data point'
            },
            {
              id: 9,
              description: 'Verify activity log entry for report update',
              expectedResult: 'Activity: "Credit report updated, score: [new score]"'
            },
            {
              id: 10,
              description: 'Check dashboard metrics updated with new score',
              expectedResult: 'Dashboard shows latest credit data'
            }
          ]
        },
        {
          id: 'idiq-dispute-linking',
          name: 'Linking Disputes to Credit Monitoring',
          priority: 'medium',
          estimatedTime: '12 minutes',
          description: 'Test integration between disputes and credit monitoring',
          steps: [
            {
              id: 1,
              description: 'Create dispute for enrolled contact',
              expectedResult: 'Dispute document created'
            },
            {
              id: 2,
              description: 'Link dispute to specific negative item from credit report',
              expectedResult: 'Dispute.creditReportItemId = item ID'
            },
            {
              id: 3,
              description: 'Mark dispute as "submitted to bureau"',
              expectedResult: 'Dispute status updated'
            },
            {
              id: 4,
              description: 'Wait for next credit report update',
              expectedResult: 'New report pulled (manually trigger if necessary)'
            },
            {
              id: 5,
              description: 'Check if disputed item still present in new report',
              expectedResult: 'System compares reports to detect item removal'
            },
            {
              id: 6,
              description: 'If item removed, verify dispute marked "successful"',
              expectedResult: 'Dispute.status = "successful", disputeResolvedAt timestamp set'
            },
            {
              id: 7,
              description: 'If item remains, verify dispute status updated accordingly',
              expectedResult: 'Dispute.status = "pending" or "unsuccessful" based on timeline'
            },
            {
              id: 8,
              description: 'Verify contact notified of dispute result',
              expectedResult: 'Email sent: "Dispute result: [successful/pending/unsuccessful]"'
            },
            {
              id: 9,
              description: 'Verify AI recommends next steps based on result',
              expectedResult: 'AI suggests: "Re-submit dispute" or "Celebrate improvement"'
            },
            {
              id: 10,
              description: 'Check activity log for dispute resolution entry',
              expectedResult: 'Activity: "Dispute resolved: [item name] removed from credit report"'
            }
          ]
        },
        {
          id: 'idiq-unenrollment',
          name: 'IDIQ Unenrollment',
          priority: 'low',
          estimatedTime: '8 minutes',
          description: 'Test unenrolling contact from credit monitoring',
          steps: [
            {
              id: 1,
              description: 'Open enrolled contact profile',
              expectedResult: 'Contact shows active enrollment'
            },
            {
              id: 2,
              description: 'Look for "Cancel Monitoring" or "Unenroll" button',
              expectedResult: 'Unenroll option available'
            },
            {
              id: 3,
              description: 'Click unenroll button',
              expectedResult: 'Confirmation dialog appears'
            },
            {
              id: 4,
              description: 'Confirm unenrollment',
              expectedResult: 'Unenrollment request sent to IDIQ API'
            },
            {
              id: 5,
              description: 'Verify success message',
              expectedResult: 'Message: "Monitoring canceled successfully"'
            },
            {
              id: 6,
              description: 'Verify contact.creditMonitoringActive = false',
              expectedResult: 'Monitoring status updated'
            },
            {
              id: 7,
              description: 'Verify enrollment document updated',
              expectedResult: 'enrollment.status = "canceled", canceledAt timestamp set'
            },
            {
              id: 8,
              description: 'Verify no further automatic report updates occur',
              expectedResult: 'Webhooks/polling skip canceled enrollments'
            },
            {
              id: 9,
              description: 'Verify historical credit data preserved',
              expectedResult: 'Previous credit reports still accessible'
            },
            {
              id: 10,
              description: 'Test re-enrollment after cancellation',
              expectedResult: 'Contact can be enrolled again, new enrollmentId created'
            }
          ]
        }
      ]
    },
    {
      id: 'pipeline-workflows',
      name: 'Pipeline Workflows',
      icon: 'Target',
      description: 'Test Ultimate Pipeline System deal management',
      scenarios: [
        {
          id: 'contact-to-pipeline',
          name: 'Add Contact to Pipeline',
          priority: 'critical',
          estimatedTime: '8 minutes',
          description: 'Test creating pipeline deal from contact',
          steps: [
            {
              id: 1,
              description: 'Open contact profile with leadScore > 5',
              expectedResult: 'High-quality contact profile displays'
            },
            {
              id: 2,
              description: 'Look for "Add to Pipeline" button',
              expectedResult: 'Button visible in contact actions'
            },
            {
              id: 3,
              description: 'Click "Add to Pipeline"',
              expectedResult: 'Deal creation form/modal opens'
            },
            {
              id: 4,
              description: 'Fill deal details: dealValue=$2400, probability=30%, temperature="warm"',
              expectedResult: 'Form accepts input',
              dealFields: {
                dealValue: 2400,
                probability: 30,
                temperature: 'warm',
                stage: 'new-contact',
                source: 'manual'
              }
            },
            {
              id: 5,
              description: 'Submit deal creation',
              expectedResult: 'Deal created successfully'
            },
            {
              id: 6,
              description: 'Navigate to /pipeline or pipeline view',
              expectedResult: 'Pipeline Kanban board displays'
            },
            {
              id: 7,
              description: 'Verify deal visible in "New Contact" stage column',
              expectedResult: 'Deal card appears in correct column'
            },
            {
              id: 8,
              description: 'Verify deal card shows correct data',
              expectedResult: 'Card displays: contact name, deal value ($2,400), probability (30%), temperature (warm)',
              cardFields: [
                'Contact name',
                'Deal value',
                'Probability',
                'Temperature indicator',
                'Lead score',
                'Last activity'
              ]
            },
            {
              id: 9,
              description: 'Verify leadScore transferred from contact',
              expectedResult: 'deal.leadScore = contact.leadScore'
            },
            {
              id: 10,
              description: 'Verify AI confidence score and next action present',
              expectedResult: 'deal.aiConfidence and deal.nextBestAction populated'
            }
          ]
        },
        {
          id: 'pipeline-auto-add',
          name: 'Auto-Add to Pipeline on Engagement',
          priority: 'high',
          estimatedTime: '10 minutes',
          description: 'Test automatic pipeline deal creation based on contact behavior',
          steps: [
            {
              id: 1,
              description: 'Create new contact (not yet in pipeline)',
              expectedResult: 'Contact created, no deal exists'
            },
            {
              id: 2,
              description: 'Simulate high engagement: log 3 email opens',
              expectedResult: 'Email open events logged'
            },
            {
              id: 3,
              description: 'Check if auto-add rule triggered',
              expectedResult: 'Rule evaluated: "3+ email opens = auto-add to pipeline"'
            },
            {
              id: 4,
              description: 'Verify deal auto-created',
              expectedResult: 'Deal document created in pipelineDeals collection'
            },
            {
              id: 5,
              description: 'Verify deal temperature set based on engagement',
              expectedResult: 'deal.temperature = "warm" (due to engagement)',
              temperatureLogic: '3+ opens = warm, 1-2 opens = cold'
            },
            {
              id: 6,
              description: 'Simulate link click (higher engagement)',
              expectedResult: 'Link click logged'
            },
            {
              id: 7,
              description: 'Verify temperature upgraded to "hot"',
              expectedResult: 'deal.temperature updated to "hot"'
            },
            {
              id: 8,
              description: 'Verify sales rep notified of hot lead',
              expectedResult: 'Notification sent to assigned rep'
            },
            {
              id: 9,
              description: 'Check activity log for auto-add event',
              expectedResult: 'Activity: "Automatically added to pipeline due to engagement"'
            },
            {
              id: 10,
              description: 'Verify AI re-analysis triggered after auto-add',
              expectedResult: 'AI recalculates lead score and recommendations'
            }
          ]
        },
        {
          id: 'drag-drop-stages',
          name: 'Drag & Drop Between Pipeline Stages',
          priority: 'critical',
          estimatedTime: '10 minutes',
          description: 'Test drag-and-drop stage transitions',
          prerequisites: [
            'Deal exists in pipeline',
            'react-beautiful-dnd or similar drag library working'
          ],
          steps: [
            {
              id: 1,
              description: 'Navigate to pipeline Kanban view',
              expectedResult: 'Pipeline board displays with stage columns'
            },
            {
              id: 2,
              description: 'Identify deal card in "New Contact" stage',
              expectedResult: 'Test deal visible in first column'
            },
            {
              id: 3,
              description: 'Click and hold deal card',
              expectedResult: 'Card becomes draggable, lift animation plays'
            },
            {
              id: 4,
              description: 'Drag card to "Qualification" stage column',
              expectedResult: 'Drag preview shows, drop zone highlights'
            },
            {
              id: 5,
              description: 'Release to drop card in new column',
              expectedResult: 'Card drops into Qualification column, animation plays'
            },
            {
              id: 6,
              description: 'Verify deal updates in Firebase immediately',
              expectedResult: 'deal.stage = "qualification", deal.stageChangedAt = now'
            },
            {
              id: 7,
              description: 'Verify stage change logged in activity',
              expectedResult: 'Activity: "Deal moved from New Contact to Qualification by [user]"'
            },
            {
              id: 8,
              description: 'Verify stage automation triggers (email sent)',
              expectedResult: 'Qualification email sent to contact'
            },
            {
              id: 9,
              description: 'Verify pipeline metrics update in real-time',
              expectedResult: 'Stage counts, values update without page refresh'
            },
            {
              id: 10,
              description: 'Verify AI re-analysis triggered for new stage',
              expectedResult: 'AI updates probability and next actions based on stage'
            }
          ]
        },
        {
          id: 'pipeline-stage-progression',
          name: 'Complete Pipeline Stage Progression',
          priority: 'high',
          estimatedTime: '15 minutes',
          description: 'Test moving deal through all stages to Won',
          steps: [
            {
              id: 1,
              description: 'Start with deal in "New Contact" stage',
              expectedResult: 'Deal in initial stage'
            },
            {
              id: 2,
              description: 'Move to "Qualification" stage',
              expectedResult: 'Stage changed, probability updated to ~50%'
            },
            {
              id: 3,
              description: 'Verify qualification email sent',
              expectedResult: 'Automated email triggered'
            },
            {
              id: 4,
              description: 'Move to "Presentation" stage',
              expectedResult: 'Stage changed, probability ~60%'
            },
            {
              id: 5,
              description: 'Verify presentation materials sent/scheduled',
              expectedResult: 'Demo scheduling email sent or task created'
            },
            {
              id: 6,
              description: 'Move to "Proposal" stage',
              expectedResult: 'Stage changed, probability ~70%'
            },
            {
              id: 7,
              description: 'Verify proposal document generated (if implemented)',
              expectedResult: 'Proposal PDF created and emailed'
            },
            {
              id: 8,
              description: 'Move to "Negotiation" stage',
              expectedResult: 'Stage changed, probability ~85%'
            },
            {
              id: 9,
              description: 'Update deal value if negotiation changes price',
              expectedResult: 'dealValue updated, change logged'
            },
            {
              id: 10,
              description: 'Move to "Contract" stage',
              expectedResult: 'Stage changed, probability ~95%'
            },
            {
              id: 11,
              description: 'Verify contract generation triggered',
              expectedResult: 'Contract document created and sent for e-signature'
            },
            {
              id: 12,
              description: 'Move to "Won" stage',
              expectedResult: '🎉 Confetti animation plays!'
            },
            {
              id: 13,
              description: 'Verify success celebration displays',
              expectedResult: 'Visual celebration, success message'
            },
            {
              id: 14,
              description: 'Verify deal marked as won in Firebase',
              expectedResult: 'deal.status = "won", deal.wonAt = timestamp, deal.wonBy = user'
            },
            {
              id: 15,
              description: 'Continue to client conversion verification...',
              expectedResult: 'See deal-won-conversion scenario'
            }
          ]
        },
        {
          id: 'deal-won-conversion',
          name: 'Deal Won → Client Conversion',
          priority: 'critical',
          estimatedTime: '12 minutes',
          description: 'Test automatic client conversion when deal is won',
          steps: [
            {
              id: 1,
              description: 'Move deal to "Won" stage (continue from above or create won deal)',
              expectedResult: 'Deal status = won'
            },
            {
              id: 2,
              description: 'Verify confetti animation plays',
              expectedResult: '🎉 Visual celebration animation'
            },
            {
              id: 3,
              description: 'Verify success notification displays',
              expectedResult: 'Toast/banner: "Congratulations! Deal won!"'
            },
            {
              id: 4,
              description: 'Navigate to associated contact profile',
              expectedResult: 'Contact profile loads'
            },
            {
              id: 5,
              description: 'Verify contact role updated to "client"',
              expectedResult: 'contact.roles includes "client"',
              fieldCheck: 'roles: ["client"] or ["lead", "client"]'
            },
            {
              id: 6,
              description: 'Verify contact.status = "active"',
              expectedResult: 'Active client status set',
              fieldCheck: 'status: "active"'
            },
            {
              id: 7,
              description: 'Check if invoice created (if deal value > 0)',
              expectedResult: 'Invoice document in invoices collection with matching contactId and amount',
              invoiceFields: {
                contactId: 'contact-id',
                amount: 2400,
                status: 'pending',
                dueDate: '+30 days'
              }
            },
            {
              id: 8,
              description: 'Verify onboarding task list created',
              expectedResult: 'Tasks collection has new documents for this client',
              sampleTasks: [
                'Schedule kickoff call',
                'Collect required documents',
                'Set up payment method',
                'Review service agreement'
              ]
            },
            {
              id: 9,
              description: 'Verify client welcome email sent',
              expectedResult: 'Email sent with subject like "Welcome to SpeedyCRM! Let\'s get started"'
            },
            {
              id: 10,
              description: 'Verify client portal access granted (if applicable)',
              expectedResult: 'Client can log in to portal, credentials sent'
            },
            {
              id: 11,
              description: 'Verify revenue metrics updated on dashboard',
              expectedResult: 'Total revenue, monthly recurring revenue (MRR) updated'
            },
            {
              id: 12,
              description: 'Verify team notification sent about won deal',
              expectedResult: 'Slack/email notification to team: "[User] won a deal worth $2,400!"'
            }
          ]
        },
        {
          id: 'deal-lost-handling',
          name: 'Deal Lost → Nurture Campaign',
          priority: 'high',
          estimatedTime: '10 minutes',
          description: 'Test handling of lost deals and nurture automation',
          steps: [
            {
              id: 1,
              description: 'Drag deal to "Lost" stage/column',
              expectedResult: 'Deal moves to Lost'
            },
            {
              id: 2,
              description: 'Modal prompts for loss reason',
              expectedResult: 'Reason selection dialog appears',
              lossReasons: [
                'No response / ghosted',
                'Price too high',
                'Chose competitor',
                'Not ready / timing',
                'No budget',
                'Other'
              ]
            },
            {
              id: 3,
              description: 'Select loss reason: "No response / ghosted"',
              expectedResult: 'Reason saved'
            },
            {
              id: 4,
              description: 'Verify deal.status = "lost"',
              expectedResult: 'Deal marked as lost in Firebase',
              fieldCheck: 'status: "lost", lostReason: "No response", lostAt: timestamp'
            },
            {
              id: 5,
              description: 'Verify contact moved to nurture campaign',
              expectedResult: 'contact.nurtureStatus = "active", added to nurture email list'
            },
            {
              id: 6,
              description: 'Verify nurture email schedule created',
              expectedResult: 'Monthly nurture emails scheduled',
              nurtureSchedule: [
                'Month 1: Valuable content (no sales pitch)',
                'Month 2: Case study',
                'Month 3: Industry insights',
                'Ongoing: Educational content'
              ]
            },
            {
              id: 7,
              description: 'Check if AI re-engagement detection active',
              expectedResult: 'System monitors for signs of renewed interest'
            },
            {
              id: 8,
              description: 'Verify activity logged',
              expectedResult: 'Activity: "Deal lost: [reason]. Moved to nurture campaign."'
            },
            {
              id: 9,
              description: 'Verify dashboard metrics updated (lost deals count)',
              expectedResult: 'Pipeline metrics reflect lost deal'
            },
            {
              id: 10,
              description: 'Test re-engagement: simulate contact opening nurture email',
              expectedResult: 'Re-engagement detected, alert sent to sales rep'
            }
          ]
        },
        {
          id: 'pipeline-metrics',
          name: 'Pipeline Metrics & Reporting',
          priority: 'medium',
          estimatedTime: '10 minutes',
          description: 'Test pipeline analytics and metrics calculation',
          steps: [
            {
              id: 1,
              description: 'Navigate to pipeline dashboard or metrics view',
              expectedResult: 'Metrics dashboard displays'
            },
            {
              id: 2,
              description: 'Verify total pipeline value calculation',
              expectedResult: 'Sum of all open deals displayed',
              calculation: 'Sum of deal.value where deal.status = "open"'
            },
            {
              id: 3,
              description: 'Verify weighted pipeline value (value × probability)',
              expectedResult: 'Weighted value calculated and displayed',
              calculation: 'Sum of (deal.value × deal.probability) for open deals'
            },
            {
              id: 4,
              description: 'Verify deals by stage breakdown',
              expectedResult: 'Chart/table showing count and value per stage'
            },
            {
              id: 5,
              description: 'Verify win rate calculation',
              expectedResult: 'Won deals / (Won + Lost deals) × 100%'
            },
            {
              id: 6,
              description: 'Verify average deal size',
              expectedResult: 'Average of all deal values'
            },
            {
              id: 7,
              description: 'Verify average sales cycle time',
              expectedResult: 'Average days from creation to won',
              calculation: 'Average of (wonAt - createdAt) for won deals'
            },
            {
              id: 8,
              description: 'Verify conversion rates by stage',
              expectedResult: 'Percentage advancing from each stage to next'
            },
            {
              id: 9,
              description: 'Test filtering metrics by date range',
              expectedResult: 'Metrics recalculate for selected date range'
            },
            {
              id: 10,
              description: 'Test exporting pipeline report',
              expectedResult: 'CSV or PDF export with all metrics'
            }
          ]
        }
      ]
    }
  ]
};

export const troubleshootingGuide = [
  {
    id: 'contact-not-appearing',
    issue: 'Contact not appearing in contacts list after creation',
    category: 'Contact Entry',
    severity: 'high',
    possibleCauses: [
      'Firebase real-time listener not connected',
      'Contact saved but UI not updating due to state management issue',
      'Contact saved to wrong collection or with wrong structure',
      'Filtering or search hiding the new contact',
      'Caching issue in browser',
      'User permissions preventing visibility'
    ],
    diagnosticSteps: [
      'Check browser console for errors (F12 → Console tab)',
      'Open Firebase Console → Firestore Database → contacts collection',
      'Verify document was created (sort by createdAt descending)',
      'Check if filters are applied in contacts view (reset all filters)',
      'Check Firebase Functions logs for creation errors',
      'Verify user permissions (role >= 3 required to view contacts)',
      'Check network tab for failed API calls or listener disconnection',
      'Verify Firebase real-time listener is active (check useEffect in ContactsList component)',
      'Test with different user account to rule out permission issues',
      'Check if contact list pagination might be hiding the contact'
    ],
    solutions: [
      'Refresh the page (Ctrl+R or Cmd+R) to reload real-time listeners',
      'Clear all filters and search terms in contacts view',
      'Check Firebase security rules for read/write permissions',
      'Verify real-time listener is properly set up in useEffect',
      'Check network tab for failed API calls and resolve connection issues',
      'Clear browser cache and local storage, then refresh',
      'If using state management (Redux/Context), verify state updates correctly',
      'Check if pagination is implemented, navigate to first page',
      'Verify contact list query doesn\'t exclude new contacts by mistake',
      'Try hard refresh (Ctrl+Shift+R) to bypass cache'
    ],
    relatedDocs: [
      'Firebase real-time listeners documentation',
      'React state management best practices',
      'Firebase security rules guide'
    ]
  },
  {
    id: 'ai-analysis-slow',
    issue: 'AI analysis not completing or taking too long (>10 seconds)',
    category: 'AI Analysis',
    severity: 'high',
    possibleCauses: [
      'Firebase Cloud Function not deployed or outdated',
      'API key not configured correctly (server-side)',
      'Function timeout set too low',
      'Network connectivity issue between Firebase and AI API',
      'Rate limiting on AI API',
      'Cold start latency for Cloud Function',
      'AI API service degradation or outage',
      'Insufficient Cloud Function resources allocated'
    ],
    diagnosticSteps: [
      'Check Firebase Functions logs: Firebase Console → Functions → Logs',
      'Look for function invocation (should appear within 1-2 seconds of contact creation)',
      'Check execution time in function logs (should be < 5 seconds)',
      'Look for error messages in function logs',
      'Verify function deployed: run `firebase deploy --only functions` in terminal',
      'Check API key validity: look for "unauthorized" or "forbidden" errors in logs',
      'Test function locally: `firebase emulators:start` and create test contact',
      'Check AI API service status (OpenAI status page, etc.)',
      'Verify function timeout configuration (firebase.json or function options)',
      'Check if rate limiting errors appear in logs'
    ],
    solutions: [
      'Redeploy Firebase Functions: `firebase deploy --only functions`',
      'Increase function timeout: set timeout to 180s in function configuration',
      'Verify API keys configured: `firebase functions:config:get` (server-side only)',
      'Check for rate limiting, implement exponential backoff retry logic',
      'Implement fallback to non-AI logic if AI unavailable after 10s',
      'Optimize function code to reduce API calls or payload size',
      'Upgrade Cloud Functions plan if using free tier (more resources)',
      'Add function warming to prevent cold starts (scheduled invocation)',
      'Implement async processing: save contact first, analyze in background',
      'Add monitoring/alerting for function failures'
    ],
    codeReference: 'functions/src/analyzeContact.js',
    relatedDocs: [
      'Firebase Cloud Functions timeout configuration',
      'OpenAI API rate limits',
      'Firebase Functions best practices'
    ]
  },
  {
    id: 'email-not-sending',
    issue: 'Welcome email or other emails not sending',
    category: 'Email Workflows',
    severity: 'high',
    possibleCauses: [
      'Email automation function not triggered (onCreate listener issue)',
      'SMTP credentials not configured or invalid',
      'Email template not found in database',
      'Contact email address invalid or malformed',
      'Email service rate limit reached',
      'Email function deployment failed',
      'Firewall or network blocking SMTP port',
      'Email service account suspended or quota exceeded'
    ],
    diagnosticSteps: [
      'Check Firebase Functions logs for email function invocation',
      'Verify trigger fired: look for onCreate contact event in logs',
      'Check SMTP configuration: Firebase Console → Functions → Config',
      'Test SMTP connection separately with test script',
      'Verify email template exists in emailTemplates collection in Firestore',
      'Validate contact.email field format (must be valid email)',
      'Check email service dashboard (Gmail, SendGrid, etc.) for send attempts',
      'Look for "authentication failed" or "connection refused" errors',
      'Check function execution completed successfully (no errors)',
      'Verify email queue (if implemented) is processing'
    ],
    solutions: [
      'Configure Gmail SMTP settings in Firebase Functions config',
      'Generate and use app password for Gmail (2FA required): Google Account → Security → App Passwords',
      'Create or fix email template in emailTemplates collection',
      'Validate email address before triggering send (regex validation)',
      'Implement email queue for rate limiting (use Firebase Task Queue or similar)',
      'Upgrade email service plan if quota exceeded',
      'Test SMTP credentials separately before deploying',
      'Implement retry logic with exponential backoff for failed sends',
      'Add fallback email service (e.g., SendGrid if Gmail fails)',
      'Monitor email bounce rates and adjust sending patterns'
    ],
    codeReference: 'functions/src/sendEmail.js',
    relatedDocs: [
      'Gmail SMTP setup for apps',
      'Firebase Functions environment configuration',
      'Email deliverability best practices'
    ]
  },
  {
    id: 'idiq-enrollment-failing',
    issue: 'IDIQ enrollment failing or returning errors',
    category: 'IDIQ Workflows',
    severity: 'critical',
    possibleCauses: [
      'IDIQ API credentials invalid or expired',
      'API endpoint URL changed or incorrect',
      'Required fields missing or in wrong format',
      'SSN format invalid (must be 9 digits, no hyphens)',
      'Duplicate enrollment attempt (contact already enrolled)',
      'IDIQ API service down or experiencing issues',
      'Network timeout due to slow IDIQ response',
      'Date format incorrect (dateOfBirth)',
      'Address validation failing on IDIQ side',
      'Test environment vs. production environment mismatch'
    ],
    diagnosticSteps: [
      'Check Firebase Functions logs for IDIQ API call details',
      'Verify API response code: 200 = success, 4xx = client error, 5xx = server error',
      'Check exact error message returned from IDIQ API',
      'Verify all required fields populated: firstName, lastName, ssn, dateOfBirth, address, city, state, zip',
      'Test API credentials separately: use curl or Postman to test IDIQ endpoint',
      'Check IDIQ service status page or contact IDIQ support',
      'Verify SSN format: should be 9 digits, no dashes (000000000)',
      'Check dateOfBirth format: should be YYYY-MM-DD',
      'Look for existing enrollment: query idiqEnrollments by contact ID',
      'Verify using correct environment: test vs. production credentials'
    ],
    solutions: [
      'Verify IDIQ API credentials in Firebase Functions config: `firebase functions:config:get idiq`',
      'Update API endpoint if IDIQ changed it (check IDIQ documentation)',
      'Validate all required fields before API call (form validation)',
      'Format SSN correctly: remove all non-digits before sending',
      'Check for existing enrollment before attempting new enrollment',
      'Implement retry logic with exponential backoff (max 3 retries)',
      'Contact IDIQ support if persistent issues (provide error codes)',
      'Add better error handling: catch specific error codes and show user-friendly messages',
      'Implement idempotency: store enrollment request ID to prevent duplicates',
      'Add timeout handling: set reasonable timeout (30s) and handle gracefully'
    ],
    codeReference: 'functions/src/idiqIntegration.js',
    relatedDocs: [
      'IDIQ API documentation',
      'SSN handling and encryption best practices',
      'Firebase Functions external API integration'
    ]
  },
  {
    id: 'pipeline-drag-not-working',
    issue: 'Pipeline drag & drop not working',
    category: 'Pipeline Workflows',
    severity: 'medium',
    possibleCauses: [
      'react-beautiful-dnd or drag library not installed',
      'DragDropContext not properly wrapping components',
      'Firebase update failing on drop',
      'User permissions issue (can\'t edit deals)',
      'Browser compatibility issue',
      'Conflicting CSS preventing drag',
      'onDragEnd handler not implemented correctly',
      'Deal document structure incompatible'
    ],
    diagnosticSteps: [
      'Check browser console for errors during drag attempt',
      'Verify react-beautiful-dnd installed: npm list react-beautiful-dnd',
      'Check component structure: DragDropContext → Droppable → Draggable',
      'Test drag gesture: click and hold for 200ms, then move',
      'Check Firebase security rules: user should have update permission on pipelineDeals',
      'Test in different browsers: Chrome and Firefox have best support',
      'Check CSS: look for pointer-events: none or other blocking styles',
      'Verify handleDragEnd function is defined and connected',
      'Check deal document has required fields: id, stage, stageOrder',
      'Test with different user account to rule out permissions'
    ],
    solutions: [
      'Install react-beautiful-dnd: npm install react-beautiful-dnd',
      'Wrap pipeline board component in DragDropContext',
      'Implement handleDragEnd function to update Firebase on drop',
      'Verify user role permissions (canEdit: role >= 3)',
      'Use Chrome or Firefox for best drag-drop support',
      'Clear browser cache and reload page',
      'Check CSS for conflicts: ensure draggable elements don\'t have pointer-events: none',
      'Verify Droppable droppableId is unique per column',
      'Verify Draggable draggableId is unique per deal card',
      'Test with simple console.log in onDragEnd to verify it fires'
    ],
    codeReference: 'src/components/pipeline/PipelineBoard.jsx:handleDragEnd',
    relatedDocs: [
      'react-beautiful-dnd documentation',
      'Firebase security rules for update operations',
      'Browser drag and drop API'
    ]
  },
  {
    id: 'deal-won-not-converting',
    issue: 'Deal not converting to client after moving to Won stage',
    category: 'Pipeline Workflows',
    severity: 'high',
    possibleCauses: [
      'Stage automation function not triggered',
      'Role update function failing',
      'Invoice creation function failing',
      'Onboarding task creation failing',
      'Insufficient user permissions to update roles',
      'Contact document locked or in use',
      'Automation function not deployed'
    ],
    diagnosticSteps: [
      'Verify deal moved to Won stage in Firebase: check deal.status and deal.stage',
      'Check Firebase Functions logs for stage automation execution',
      'Verify contact.roles array in Firestore (should include "client")',
      'Check if invoice created: query invoices collection by contactId',
      'Check if tasks created: query tasks collection by contactId and taskListType = "onboarding"',
      'Look for error messages in function logs',
      'Verify automation function deployed: firebase list:functions',
      'Check user permissions: ensure user can update contact roles',
      'Test automation function manually: trigger with test deal ID'
    ],
    solutions: [
      'Manually trigger stage automation function if it didn\'t fire',
      'Check and fix role update logic in automation function',
      'Verify invoice template exists in invoiceTemplates collection',
      'Check task creation permissions and logic',
      'Review onboarding workflow configuration',
      'Redeploy automation functions: firebase deploy --only functions',
      'Add error handling and logging to automation function',
      'Implement transaction for multi-document updates (deal + contact + invoice)',
      'Add manual "Convert to Client" button as fallback',
      'Test automation with various deal scenarios'
    ],
    codeReference: 'functions/src/pipelineAutomation.js:onDealWon',
    relatedDocs: [
      'Firebase Firestore transactions',
      'Firebase Functions triggers',
      'Multi-step workflow implementation'
    ]
  },
  {
    id: 'form-validation-not-working',
    issue: 'Form validation not preventing invalid submissions',
    category: 'Contact Entry',
    severity: 'medium',
    possibleCauses: [
      'Validation logic not implemented',
      'Form library validation not configured',
      'Required field validation bypassed',
      'Client-side validation disabled',
      'Browser autofill bypassing validation'
    ],
    diagnosticSteps: [
      'Check form component for validation logic',
      'Test submitting form with empty required fields',
      'Check browser console for validation errors',
      'Verify form library (Formik, React Hook Form) configured correctly',
      'Test with browser autofill disabled',
      'Check network tab: form should not submit if validation fails'
    ],
    solutions: [
      'Implement field validation using form library validation schema',
      'Add required attribute to HTML inputs as fallback',
      'Disable submit button until form is valid',
      'Show inline validation errors for each field',
      'Implement server-side validation as backup (never trust client)',
      'Test validation thoroughly with various invalid inputs'
    ],
    codeReference: 'src/components/contacts/UltimateContactForm.jsx',
    relatedDocs: [
      'Form validation best practices',
      'React Hook Form documentation',
      'Formik validation schemas'
    ]
  },
  {
    id: 'firebase-permission-denied',
    issue: 'Firebase permission denied errors',
    category: 'General',
    severity: 'high',
    possibleCauses: [
      'User not authenticated',
      'User role insufficient for operation',
      'Firebase security rules too restrictive',
      'Token expired',
      'Wrong user trying to access document',
      'Security rules not deployed'
    ],
    diagnosticSteps: [
      'Check authentication status: Firebase Console → Authentication',
      'Verify user role in users collection (role should be >= 3 for most operations)',
      'Check Firebase security rules: Firestore → Rules tab',
      'Test with admin user account',
      'Check browser console for specific rule failure',
      'Verify user token not expired (try logging out and back in)'
    ],
    solutions: [
      'Ensure user is logged in before attempting operation',
      'Update user role if insufficient',
      'Review and update Firebase security rules to allow operation',
      'Implement proper authentication check before operations',
      'Add error handling for permission denied errors',
      'Deploy updated security rules: firebase deploy --only firestore:rules'
    ],
    relatedDocs: [
      'Firebase security rules documentation',
      'Firebase authentication',
      'Role-based access control'
    ]
  },
  {
    id: 'slow-page-load',
    issue: 'Contacts page or other pages loading very slowly',
    category: 'Performance',
    severity: 'medium',
    possibleCauses: [
      'Loading too much data at once (no pagination)',
      'Real-time listener on large collection',
      'Inefficient queries (missing indexes)',
      'Large images not optimized',
      'Too many re-renders',
      'Memory leak in React component'
    ],
    diagnosticSteps: [
      'Check browser performance tab (F12 → Performance)',
      'Check network tab for slow requests',
      'Check Firebase Console for query performance',
      'Look for missing index warnings in console',
      'Profile React component renders (React DevTools)',
      'Check memory usage over time'
    ],
    solutions: [
      'Implement pagination (load 25-50 contacts at a time)',
      'Add composite indexes for complex queries',
      'Optimize images (compress, use WebP format)',
      'Implement virtual scrolling for long lists',
      'Use React.memo to prevent unnecessary re-renders',
      'Add loading skeletons for better perceived performance',
      'Lazy load components not immediately visible'
    ],
    relatedDocs: [
      'Firebase query optimization',
      'React performance optimization',
      'Web performance best practices'
    ]
  }
];

// Export additional helper data
export const testCategories = masterTestingChecklist.categories.map(cat => ({
  id: cat.id,
  name: cat.name,
  icon: cat.icon,
  scenarioCount: cat.scenarios.length
}));

export const allTestScenarios = masterTestingChecklist.categories.flatMap(
  cat => cat.scenarios.map(scenario => ({
    ...scenario,
    categoryId: cat.id,
    categoryName: cat.name
  }))
);

export const criticalTests = allTestScenarios.filter(
  scenario => scenario.priority === 'critical'
);

export const estimatedTotalTestTime = allTestScenarios.reduce((total, scenario) => {
  const minutes = parseInt(scenario.estimatedTime) || 10;
  return total + minutes;
}, 0);

console.log(`
📋 Testing Framework Loaded:
- Categories: ${masterTestingChecklist.categories.length}
- Total Scenarios: ${allTestScenarios.length}
- Critical Tests: ${criticalTests.length}
- Estimated Total Time: ${estimatedTotalTestTime} minutes (${(estimatedTotalTestTime / 60).toFixed(1)} hours)
- Troubleshooting Issues: ${troubleshootingGuide.length}
`);
