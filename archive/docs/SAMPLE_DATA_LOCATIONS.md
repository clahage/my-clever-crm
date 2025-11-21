# Sample Data Locations

**Created:** 2025-11-18
**Purpose:** Document locations of mock/sample data that should be replaced with Firebase queries

---

## PATTERN TO LOOK FOR

Files using these patterns contain sample data:

```javascript
// Mock data generators
generateMock*()
generateDemo*()
const mockData = [...]
const sampleData = [...]

// Fake names
'John Smith', 'Jane Doe', 'Sarah Martinez', 'Emily', 'Michael', etc.

// Static numbers
totalClients: 247
successRate: 78%
```

---

## FILES WITH SAMPLE DATA

### HIGH PRIORITY (Core Hubs)

| File | Status | Notes |
|------|--------|-------|
| `src/pages/SmartDashboard.jsx` | CLEANED | Widgets now use Firebase |
| `src/pages/hubs/DashboardHub.jsx` | CLEANED | Uses real Firebase data |
| `src/pages/hubs/MarketingHub.jsx` | HAS MOCKS | generateMockLeads(), generateMockCampaigns() |
| `src/pages/hubs/AIHub.jsx` | HAS MOCKS | Mock insights, analytics |
| `src/pages/hubs/ReportsHub.jsx` | HAS MOCKS | Mock report data |
| `src/pages/hubs/LearningHub.jsx` | HAS MOCKS | Mock courses, progress |

### MEDIUM PRIORITY (Secondary Hubs)

| File | Status | Notes |
|------|--------|-------|
| `src/pages/hubs/AffiliatesHub.jsx` | HAS MOCKS | Mock affiliate data |
| `src/pages/hubs/ReferralEngineHub.jsx` | HAS MOCKS | Mock referral stats |
| `src/pages/hubs/ReviewsReputationHub.jsx` | HAS MOCKS | Mock reviews |
| `src/pages/hubs/ContractManagementHub.jsx` | HAS MOCKS | Mock contracts |

### LOWER PRIORITY (Standalone Pages)

| File | Status | Notes |
|------|--------|-------|
| `src/pages/Affiliates.jsx` | HAS MOCKS | Older page |
| `src/pages/ClientPortal.jsx` | HAS MOCKS | Client view |
| `src/pages/LearningCenter.jsx` | HAS MOCKS | Education data |
| `src/pages/DisputeLetters.jsx` | HAS MOCKS | Sample letters |
| `src/pages/Documents.jsx` | HAS MOCKS | Sample documents |
| `src/pages/Leads.jsx` | HAS MOCKS | Sample leads |
| `src/pages/Letters.jsx` | HAS MOCKS | Sample letters |
| `src/pages/Messages.jsx` | HAS MOCKS | Sample messages |
| `src/pages/Notifications.jsx` | HAS MOCKS | Sample notifications |

---

## CLEANUP PATTERN

To clean a file, replace mock generators with Firebase queries:

### BEFORE (Mock Data)
```javascript
const generateMockLeads = () => {
  const leads = [];
  const names = ['John Smith', 'Jane Doe', ...];
  for (let i = 1; i <= 50; i++) {
    leads.push({
      id: `lead-${i}`,
      name: names[Math.floor(Math.random() * names.length)],
      ...
    });
  }
  return leads;
};

// In component
const [leads] = useState(generateMockLeads());
```

### AFTER (Firebase Data)
```javascript
const [leads, setLeads] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchLeads = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'leads'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLeads(data);
    } catch (error) {
      console.error('Error fetching leads:', error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };
  fetchLeads();
}, []);

// Add empty state
{leads.length === 0 ? (
  <EmptyState message="No leads yet" />
) : (
  // Render leads
)}
```

---

## RECOMMENDED CLEANUP ORDER

1. **MarketingHub.jsx** - Core hub, high visibility
2. **AIHub.jsx** - Core hub, AI-powered features
3. **ReportsHub.jsx** - Core hub, already fixed access issue
4. **LearningHub.jsx** - Core hub, training data
5. **AffiliatesHub.jsx** - Business growth
6. **ReferralEngineHub.jsx** - Business growth
7. **ReviewsReputationHub.jsx** - Already exists, fix reviews
8. **Remaining standalone pages** - Lower priority

---

## FIREBASE COLLECTIONS REFERENCE

- `leads` - Lead management
- `campaigns` - Marketing campaigns
- `content` - Content marketing
- `affiliates` - Affiliate partners
- `referrals` - Referral tracking
- `reviews` - Customer reviews
- `courses` - Learning courses
- `progress` - Learning progress
- `contracts` - Contract management
- `reports` - Report data

---

## NOTES

- Each cleanup should be tested before committing
- Add loading states for all data fetching
- Add empty states for when data is empty
- Preserve all UI/styling - only change data source
- Follow patterns from SmartDashboard.jsx and DashboardHub.jsx
