// ============================================================================
// ZIPLookupService.js - Real ZIP Code API Integration
// ============================================================================
// Provides ZIP code to city/state lookup functionality
// Features:
// - Primary API: Zippopotamus (free, no key required)
// - LocalStorage caching with 24hr TTL
// - Bundled fallback data for common US ZIPs
// - Debounced API calls
// - Area code and timezone lookup
// ============================================================================

// ============================================================================
// CONSTANTS
// ============================================================================
const ZIPPOPOTAMUS_API = 'https://api.zippopotam.us/us';
const CACHE_KEY = 'zipLookupCache';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const DEBOUNCE_MS = 300;

// ============================================================================
// TIMEZONE MAPPING BY STATE
// ============================================================================
const STATE_TIMEZONES = {
  'AL': 'America/Chicago',
  'AK': 'America/Anchorage',
  'AZ': 'America/Phoenix',
  'AR': 'America/Chicago',
  'CA': 'America/Los_Angeles',
  'CO': 'America/Denver',
  'CT': 'America/New_York',
  'DE': 'America/New_York',
  'FL': 'America/New_York',
  'GA': 'America/New_York',
  'HI': 'Pacific/Honolulu',
  'ID': 'America/Boise',
  'IL': 'America/Chicago',
  'IN': 'America/Indiana/Indianapolis',
  'IA': 'America/Chicago',
  'KS': 'America/Chicago',
  'KY': 'America/New_York',
  'LA': 'America/Chicago',
  'ME': 'America/New_York',
  'MD': 'America/New_York',
  'MA': 'America/New_York',
  'MI': 'America/Detroit',
  'MN': 'America/Chicago',
  'MS': 'America/Chicago',
  'MO': 'America/Chicago',
  'MT': 'America/Denver',
  'NE': 'America/Chicago',
  'NV': 'America/Los_Angeles',
  'NH': 'America/New_York',
  'NJ': 'America/New_York',
  'NM': 'America/Denver',
  'NY': 'America/New_York',
  'NC': 'America/New_York',
  'ND': 'America/Chicago',
  'OH': 'America/New_York',
  'OK': 'America/Chicago',
  'OR': 'America/Los_Angeles',
  'PA': 'America/New_York',
  'RI': 'America/New_York',
  'SC': 'America/New_York',
  'SD': 'America/Chicago',
  'TN': 'America/Chicago',
  'TX': 'America/Chicago',
  'UT': 'America/Denver',
  'VT': 'America/New_York',
  'VA': 'America/New_York',
  'WA': 'America/Los_Angeles',
  'WV': 'America/New_York',
  'WI': 'America/Chicago',
  'WY': 'America/Denver',
  'DC': 'America/New_York',
  'PR': 'America/Puerto_Rico',
  'VI': 'America/Virgin',
  'GU': 'Pacific/Guam',
};

// ============================================================================
// AREA CODE MAPPING (Partial - major cities)
// ============================================================================
const ZIP_TO_AREA_CODE = {
  // California
  '90': '213', '91': '818', '92': '714', '93': '805', '94': '415', '95': '916',
  // New York
  '10': '212', '11': '718', '12': '518', '13': '315', '14': '716',
  // Texas
  '75': '214', '77': '713', '78': '210', '79': '806',
  // Florida
  '32': '407', '33': '305', '34': '904',
  // Illinois
  '60': '312', '61': '217', '62': '618',
  // Pennsylvania
  '15': '412', '17': '717', '19': '215',
  // Arizona
  '85': '602',
  // Nevada
  '89': '702',
  // Washington
  '98': '206',
  // Colorado
  '80': '303',
  // Georgia
  '30': '404', '31': '912',
  // Massachusetts
  '02': '617',
  // New Jersey
  '07': '201', '08': '609',
  // Ohio
  '44': '216', '45': '513', '43': '614',
  // Michigan
  '48': '313', '49': '616',
  // North Carolina
  '27': '919', '28': '704',
  // Virginia
  '22': '703', '23': '804',
  // Tennessee
  '37': '615', '38': '901',
  // Missouri
  '63': '314', '64': '816',
  // Maryland
  '20': '301', '21': '410',
  // Indiana
  '46': '317',
  // Wisconsin
  '53': '414',
  // Minnesota
  '55': '612',
  // Oregon
  '97': '503',
  // Louisiana
  '70': '504',
  // Kentucky
  '40': '502',
  // Oklahoma
  '73': '405', '74': '918',
  // Connecticut
  '06': '203',
  // Utah
  '84': '801',
  // Alabama
  '35': '205', '36': '334',
  // South Carolina
  '29': '803',
  // Kansas
  '66': '913', '67': '316',
  // Nevada - Las Vegas
  '891': '702',
  // Hawaii
  '96': '808',
  // Alaska
  '99': '907',
};

// ============================================================================
// COMMON ZIP CODES FALLBACK (Top 100 most common)
// ============================================================================
const COMMON_ZIPS = {
  '10001': { city: 'New York', state: 'NY', county: 'New York' },
  '10002': { city: 'New York', state: 'NY', county: 'New York' },
  '10003': { city: 'New York', state: 'NY', county: 'New York' },
  '10010': { city: 'New York', state: 'NY', county: 'New York' },
  '10019': { city: 'New York', state: 'NY', county: 'New York' },
  '10022': { city: 'New York', state: 'NY', county: 'New York' },
  '11201': { city: 'Brooklyn', state: 'NY', county: 'Kings' },
  '11211': { city: 'Brooklyn', state: 'NY', county: 'Kings' },
  '11238': { city: 'Brooklyn', state: 'NY', county: 'Kings' },
  '90001': { city: 'Los Angeles', state: 'CA', county: 'Los Angeles' },
  '90002': { city: 'Los Angeles', state: 'CA', county: 'Los Angeles' },
  '90003': { city: 'Los Angeles', state: 'CA', county: 'Los Angeles' },
  '90004': { city: 'Los Angeles', state: 'CA', county: 'Los Angeles' },
  '90005': { city: 'Los Angeles', state: 'CA', county: 'Los Angeles' },
  '90006': { city: 'Los Angeles', state: 'CA', county: 'Los Angeles' },
  '90007': { city: 'Los Angeles', state: 'CA', county: 'Los Angeles' },
  '90008': { city: 'Los Angeles', state: 'CA', county: 'Los Angeles' },
  '90010': { city: 'Los Angeles', state: 'CA', county: 'Los Angeles' },
  '90012': { city: 'Los Angeles', state: 'CA', county: 'Los Angeles' },
  '90024': { city: 'Los Angeles', state: 'CA', county: 'Los Angeles' },
  '90025': { city: 'Los Angeles', state: 'CA', county: 'Los Angeles' },
  '90027': { city: 'Los Angeles', state: 'CA', county: 'Los Angeles' },
  '90028': { city: 'Hollywood', state: 'CA', county: 'Los Angeles' },
  '90034': { city: 'Los Angeles', state: 'CA', county: 'Los Angeles' },
  '90036': { city: 'Los Angeles', state: 'CA', county: 'Los Angeles' },
  '90045': { city: 'Los Angeles', state: 'CA', county: 'Los Angeles' },
  '90046': { city: 'West Hollywood', state: 'CA', county: 'Los Angeles' },
  '90048': { city: 'Los Angeles', state: 'CA', county: 'Los Angeles' },
  '90049': { city: 'Los Angeles', state: 'CA', county: 'Los Angeles' },
  '90068': { city: 'Los Angeles', state: 'CA', county: 'Los Angeles' },
  '90210': { city: 'Beverly Hills', state: 'CA', county: 'Los Angeles' },
  '90211': { city: 'Beverly Hills', state: 'CA', county: 'Los Angeles' },
  '90212': { city: 'Beverly Hills', state: 'CA', county: 'Los Angeles' },
  '90230': { city: 'Culver City', state: 'CA', county: 'Los Angeles' },
  '90232': { city: 'Culver City', state: 'CA', county: 'Los Angeles' },
  '90245': { city: 'El Segundo', state: 'CA', county: 'Los Angeles' },
  '90266': { city: 'Manhattan Beach', state: 'CA', county: 'Los Angeles' },
  '90274': { city: 'Palos Verdes Peninsula', state: 'CA', county: 'Los Angeles' },
  '90401': { city: 'Santa Monica', state: 'CA', county: 'Los Angeles' },
  '90402': { city: 'Santa Monica', state: 'CA', county: 'Los Angeles' },
  '90403': { city: 'Santa Monica', state: 'CA', county: 'Los Angeles' },
  '90404': { city: 'Santa Monica', state: 'CA', county: 'Los Angeles' },
  '90405': { city: 'Santa Monica', state: 'CA', county: 'Los Angeles' },
  '91001': { city: 'Altadena', state: 'CA', county: 'Los Angeles' },
  '91101': { city: 'Pasadena', state: 'CA', county: 'Los Angeles' },
  '91106': { city: 'Pasadena', state: 'CA', county: 'Los Angeles' },
  '91201': { city: 'Glendale', state: 'CA', county: 'Los Angeles' },
  '91401': { city: 'Van Nuys', state: 'CA', county: 'Los Angeles' },
  '91501': { city: 'Burbank', state: 'CA', county: 'Los Angeles' },
  '91601': { city: 'North Hollywood', state: 'CA', county: 'Los Angeles' },
  '91702': { city: 'Azusa', state: 'CA', county: 'Los Angeles' },
  '92101': { city: 'San Diego', state: 'CA', county: 'San Diego' },
  '92102': { city: 'San Diego', state: 'CA', county: 'San Diego' },
  '92103': { city: 'San Diego', state: 'CA', county: 'San Diego' },
  '92104': { city: 'San Diego', state: 'CA', county: 'San Diego' },
  '92105': { city: 'San Diego', state: 'CA', county: 'San Diego' },
  '92106': { city: 'San Diego', state: 'CA', county: 'San Diego' },
  '92107': { city: 'San Diego', state: 'CA', county: 'San Diego' },
  '92108': { city: 'San Diego', state: 'CA', county: 'San Diego' },
  '92109': { city: 'San Diego', state: 'CA', county: 'San Diego' },
  '92110': { city: 'San Diego', state: 'CA', county: 'San Diego' },
  '92115': { city: 'San Diego', state: 'CA', county: 'San Diego' },
  '92116': { city: 'San Diego', state: 'CA', county: 'San Diego' },
  '92117': { city: 'San Diego', state: 'CA', county: 'San Diego' },
  '92118': { city: 'Coronado', state: 'CA', county: 'San Diego' },
  '92120': { city: 'San Diego', state: 'CA', county: 'San Diego' },
  '92121': { city: 'San Diego', state: 'CA', county: 'San Diego' },
  '92122': { city: 'San Diego', state: 'CA', county: 'San Diego' },
  '92123': { city: 'San Diego', state: 'CA', county: 'San Diego' },
  '92124': { city: 'San Diego', state: 'CA', county: 'San Diego' },
  '92126': { city: 'San Diego', state: 'CA', county: 'San Diego' },
  '92130': { city: 'San Diego', state: 'CA', county: 'San Diego' },
  '92131': { city: 'San Diego', state: 'CA', county: 'San Diego' },
  '92614': { city: 'Irvine', state: 'CA', county: 'Orange' },
  '92618': { city: 'Irvine', state: 'CA', county: 'Orange' },
  '92620': { city: 'Irvine', state: 'CA', county: 'Orange' },
  '92647': { city: 'Huntington Beach', state: 'CA', county: 'Orange' },
  '92648': { city: 'Huntington Beach', state: 'CA', county: 'Orange' },
  '92649': { city: 'Huntington Beach', state: 'CA', county: 'Orange' },
  '92651': { city: 'Laguna Beach', state: 'CA', county: 'Orange' },
  '92660': { city: 'Newport Beach', state: 'CA', county: 'Orange' },
  '92663': { city: 'Newport Beach', state: 'CA', county: 'Orange' },
  '92683': { city: 'Westminster', state: 'CA', county: 'Orange' },
  '92701': { city: 'Santa Ana', state: 'CA', county: 'Orange' },
  '92704': { city: 'Santa Ana', state: 'CA', county: 'Orange' },
  '92705': { city: 'Santa Ana', state: 'CA', county: 'Orange' },
  '92780': { city: 'Tustin', state: 'CA', county: 'Orange' },
  '92801': { city: 'Anaheim', state: 'CA', county: 'Orange' },
  '92802': { city: 'Anaheim', state: 'CA', county: 'Orange' },
  '92804': { city: 'Anaheim', state: 'CA', county: 'Orange' },
  '92805': { city: 'Anaheim', state: 'CA', county: 'Orange' },
  '92806': { city: 'Anaheim', state: 'CA', county: 'Orange' },
  '92807': { city: 'Anaheim', state: 'CA', county: 'Orange' },
  '92821': { city: 'Brea', state: 'CA', county: 'Orange' },
  '92831': { city: 'Fullerton', state: 'CA', county: 'Orange' },
  '92832': { city: 'Fullerton', state: 'CA', county: 'Orange' },
  '92833': { city: 'Fullerton', state: 'CA', county: 'Orange' },
  '92840': { city: 'Garden Grove', state: 'CA', county: 'Orange' },
  '92841': { city: 'Garden Grove', state: 'CA', county: 'Orange' },
  '92843': { city: 'Garden Grove', state: 'CA', county: 'Orange' },
  '92844': { city: 'Garden Grove', state: 'CA', county: 'Orange' },
  '92865': { city: 'Orange', state: 'CA', county: 'Orange' },
  '92866': { city: 'Orange', state: 'CA', county: 'Orange' },
  '92867': { city: 'Orange', state: 'CA', county: 'Orange' },
  '92868': { city: 'Orange', state: 'CA', county: 'Orange' },
  '92869': { city: 'Orange', state: 'CA', county: 'Orange' },
  '92870': { city: 'Placentia', state: 'CA', county: 'Orange' },
  '92886': { city: 'Yorba Linda', state: 'CA', county: 'Orange' },
  '92887': { city: 'Yorba Linda', state: 'CA', county: 'Orange' },
  '93001': { city: 'Ventura', state: 'CA', county: 'Ventura' },
  '93003': { city: 'Ventura', state: 'CA', county: 'Ventura' },
  '94102': { city: 'San Francisco', state: 'CA', county: 'San Francisco' },
  '94103': { city: 'San Francisco', state: 'CA', county: 'San Francisco' },
  '94104': { city: 'San Francisco', state: 'CA', county: 'San Francisco' },
  '94105': { city: 'San Francisco', state: 'CA', county: 'San Francisco' },
  '94107': { city: 'San Francisco', state: 'CA', county: 'San Francisco' },
  '94108': { city: 'San Francisco', state: 'CA', county: 'San Francisco' },
  '94109': { city: 'San Francisco', state: 'CA', county: 'San Francisco' },
  '94110': { city: 'San Francisco', state: 'CA', county: 'San Francisco' },
  '94111': { city: 'San Francisco', state: 'CA', county: 'San Francisco' },
  '94112': { city: 'San Francisco', state: 'CA', county: 'San Francisco' },
  '94114': { city: 'San Francisco', state: 'CA', county: 'San Francisco' },
  '94115': { city: 'San Francisco', state: 'CA', county: 'San Francisco' },
  '94116': { city: 'San Francisco', state: 'CA', county: 'San Francisco' },
  '94117': { city: 'San Francisco', state: 'CA', county: 'San Francisco' },
  '94118': { city: 'San Francisco', state: 'CA', county: 'San Francisco' },
  '94121': { city: 'San Francisco', state: 'CA', county: 'San Francisco' },
  '94122': { city: 'San Francisco', state: 'CA', county: 'San Francisco' },
  '94123': { city: 'San Francisco', state: 'CA', county: 'San Francisco' },
  '94124': { city: 'San Francisco', state: 'CA', county: 'San Francisco' },
  '94127': { city: 'San Francisco', state: 'CA', county: 'San Francisco' },
  '94131': { city: 'San Francisco', state: 'CA', county: 'San Francisco' },
  '94132': { city: 'San Francisco', state: 'CA', county: 'San Francisco' },
  '94133': { city: 'San Francisco', state: 'CA', county: 'San Francisco' },
  '94134': { city: 'San Francisco', state: 'CA', county: 'San Francisco' },
  '60601': { city: 'Chicago', state: 'IL', county: 'Cook' },
  '60602': { city: 'Chicago', state: 'IL', county: 'Cook' },
  '60603': { city: 'Chicago', state: 'IL', county: 'Cook' },
  '60604': { city: 'Chicago', state: 'IL', county: 'Cook' },
  '60605': { city: 'Chicago', state: 'IL', county: 'Cook' },
  '60606': { city: 'Chicago', state: 'IL', county: 'Cook' },
  '60607': { city: 'Chicago', state: 'IL', county: 'Cook' },
  '60608': { city: 'Chicago', state: 'IL', county: 'Cook' },
  '60609': { city: 'Chicago', state: 'IL', county: 'Cook' },
  '60610': { city: 'Chicago', state: 'IL', county: 'Cook' },
  '60611': { city: 'Chicago', state: 'IL', county: 'Cook' },
  '60614': { city: 'Chicago', state: 'IL', county: 'Cook' },
  '60615': { city: 'Chicago', state: 'IL', county: 'Cook' },
  '60616': { city: 'Chicago', state: 'IL', county: 'Cook' },
  '60618': { city: 'Chicago', state: 'IL', county: 'Cook' },
  '60622': { city: 'Chicago', state: 'IL', county: 'Cook' },
  '60625': { city: 'Chicago', state: 'IL', county: 'Cook' },
  '60626': { city: 'Chicago', state: 'IL', county: 'Cook' },
  '60640': { city: 'Chicago', state: 'IL', county: 'Cook' },
  '60647': { city: 'Chicago', state: 'IL', county: 'Cook' },
  '60657': { city: 'Chicago', state: 'IL', county: 'Cook' },
  '77001': { city: 'Houston', state: 'TX', county: 'Harris' },
  '77002': { city: 'Houston', state: 'TX', county: 'Harris' },
  '77003': { city: 'Houston', state: 'TX', county: 'Harris' },
  '77004': { city: 'Houston', state: 'TX', county: 'Harris' },
  '77005': { city: 'Houston', state: 'TX', county: 'Harris' },
  '77006': { city: 'Houston', state: 'TX', county: 'Harris' },
  '77007': { city: 'Houston', state: 'TX', county: 'Harris' },
  '77008': { city: 'Houston', state: 'TX', county: 'Harris' },
  '77009': { city: 'Houston', state: 'TX', county: 'Harris' },
  '77010': { city: 'Houston', state: 'TX', county: 'Harris' },
  '77019': { city: 'Houston', state: 'TX', county: 'Harris' },
  '77024': { city: 'Houston', state: 'TX', county: 'Harris' },
  '77025': { city: 'Houston', state: 'TX', county: 'Harris' },
  '77027': { city: 'Houston', state: 'TX', county: 'Harris' },
  '77030': { city: 'Houston', state: 'TX', county: 'Harris' },
  '77056': { city: 'Houston', state: 'TX', county: 'Harris' },
  '77098': { city: 'Houston', state: 'TX', county: 'Harris' },
  '85001': { city: 'Phoenix', state: 'AZ', county: 'Maricopa' },
  '85003': { city: 'Phoenix', state: 'AZ', county: 'Maricopa' },
  '85004': { city: 'Phoenix', state: 'AZ', county: 'Maricopa' },
  '85006': { city: 'Phoenix', state: 'AZ', county: 'Maricopa' },
  '85008': { city: 'Phoenix', state: 'AZ', county: 'Maricopa' },
  '85012': { city: 'Phoenix', state: 'AZ', county: 'Maricopa' },
  '85014': { city: 'Phoenix', state: 'AZ', county: 'Maricopa' },
  '85016': { city: 'Phoenix', state: 'AZ', county: 'Maricopa' },
  '85018': { city: 'Phoenix', state: 'AZ', county: 'Maricopa' },
  '85020': { city: 'Phoenix', state: 'AZ', county: 'Maricopa' },
  '85021': { city: 'Phoenix', state: 'AZ', county: 'Maricopa' },
  '85022': { city: 'Phoenix', state: 'AZ', county: 'Maricopa' },
  '85028': { city: 'Phoenix', state: 'AZ', county: 'Maricopa' },
  '85248': { city: 'Chandler', state: 'AZ', county: 'Maricopa' },
  '85251': { city: 'Scottsdale', state: 'AZ', county: 'Maricopa' },
  '85254': { city: 'Scottsdale', state: 'AZ', county: 'Maricopa' },
  '85255': { city: 'Scottsdale', state: 'AZ', county: 'Maricopa' },
  '85257': { city: 'Scottsdale', state: 'AZ', county: 'Maricopa' },
  '85258': { city: 'Scottsdale', state: 'AZ', county: 'Maricopa' },
  '85259': { city: 'Scottsdale', state: 'AZ', county: 'Maricopa' },
  '85260': { city: 'Scottsdale', state: 'AZ', county: 'Maricopa' },
  '85281': { city: 'Tempe', state: 'AZ', county: 'Maricopa' },
  '85282': { city: 'Tempe', state: 'AZ', county: 'Maricopa' },
  '85283': { city: 'Tempe', state: 'AZ', county: 'Maricopa' },
  '85284': { city: 'Tempe', state: 'AZ', county: 'Maricopa' },
  '19101': { city: 'Philadelphia', state: 'PA', county: 'Philadelphia' },
  '19102': { city: 'Philadelphia', state: 'PA', county: 'Philadelphia' },
  '19103': { city: 'Philadelphia', state: 'PA', county: 'Philadelphia' },
  '19104': { city: 'Philadelphia', state: 'PA', county: 'Philadelphia' },
  '19106': { city: 'Philadelphia', state: 'PA', county: 'Philadelphia' },
  '19107': { city: 'Philadelphia', state: 'PA', county: 'Philadelphia' },
  '19123': { city: 'Philadelphia', state: 'PA', county: 'Philadelphia' },
  '19125': { city: 'Philadelphia', state: 'PA', county: 'Philadelphia' },
  '19130': { city: 'Philadelphia', state: 'PA', county: 'Philadelphia' },
  '19146': { city: 'Philadelphia', state: 'PA', county: 'Philadelphia' },
  '75201': { city: 'Dallas', state: 'TX', county: 'Dallas' },
  '75202': { city: 'Dallas', state: 'TX', county: 'Dallas' },
  '75204': { city: 'Dallas', state: 'TX', county: 'Dallas' },
  '75205': { city: 'Dallas', state: 'TX', county: 'Dallas' },
  '75206': { city: 'Dallas', state: 'TX', county: 'Dallas' },
  '75207': { city: 'Dallas', state: 'TX', county: 'Dallas' },
  '75208': { city: 'Dallas', state: 'TX', county: 'Dallas' },
  '75209': { city: 'Dallas', state: 'TX', county: 'Dallas' },
  '75214': { city: 'Dallas', state: 'TX', county: 'Dallas' },
  '75219': { city: 'Dallas', state: 'TX', county: 'Dallas' },
  '75225': { city: 'Dallas', state: 'TX', county: 'Dallas' },
  '78201': { city: 'San Antonio', state: 'TX', county: 'Bexar' },
  '78204': { city: 'San Antonio', state: 'TX', county: 'Bexar' },
  '78205': { city: 'San Antonio', state: 'TX', county: 'Bexar' },
  '78207': { city: 'San Antonio', state: 'TX', county: 'Bexar' },
  '78208': { city: 'San Antonio', state: 'TX', county: 'Bexar' },
  '78209': { city: 'San Antonio', state: 'TX', county: 'Bexar' },
  '78210': { city: 'San Antonio', state: 'TX', county: 'Bexar' },
  '78212': { city: 'San Antonio', state: 'TX', county: 'Bexar' },
  '78215': { city: 'San Antonio', state: 'TX', county: 'Bexar' },
  '78216': { city: 'San Antonio', state: 'TX', county: 'Bexar' },
  '33101': { city: 'Miami', state: 'FL', county: 'Miami-Dade' },
  '33109': { city: 'Miami Beach', state: 'FL', county: 'Miami-Dade' },
  '33125': { city: 'Miami', state: 'FL', county: 'Miami-Dade' },
  '33127': { city: 'Miami', state: 'FL', county: 'Miami-Dade' },
  '33128': { city: 'Miami', state: 'FL', county: 'Miami-Dade' },
  '33129': { city: 'Miami', state: 'FL', county: 'Miami-Dade' },
  '33130': { city: 'Miami', state: 'FL', county: 'Miami-Dade' },
  '33131': { city: 'Miami', state: 'FL', county: 'Miami-Dade' },
  '33132': { city: 'Miami', state: 'FL', county: 'Miami-Dade' },
  '33133': { city: 'Miami', state: 'FL', county: 'Miami-Dade' },
  '33134': { city: 'Miami', state: 'FL', county: 'Miami-Dade' },
  '33135': { city: 'Miami', state: 'FL', county: 'Miami-Dade' },
  '33136': { city: 'Miami', state: 'FL', county: 'Miami-Dade' },
  '33137': { city: 'Miami', state: 'FL', county: 'Miami-Dade' },
  '33138': { city: 'Miami', state: 'FL', county: 'Miami-Dade' },
  '33139': { city: 'Miami Beach', state: 'FL', county: 'Miami-Dade' },
  '33140': { city: 'Miami Beach', state: 'FL', county: 'Miami-Dade' },
  '33141': { city: 'Miami Beach', state: 'FL', county: 'Miami-Dade' },
  '33142': { city: 'Miami', state: 'FL', county: 'Miami-Dade' },
  '33145': { city: 'Miami', state: 'FL', county: 'Miami-Dade' },
  '98101': { city: 'Seattle', state: 'WA', county: 'King' },
  '98102': { city: 'Seattle', state: 'WA', county: 'King' },
  '98103': { city: 'Seattle', state: 'WA', county: 'King' },
  '98104': { city: 'Seattle', state: 'WA', county: 'King' },
  '98105': { city: 'Seattle', state: 'WA', county: 'King' },
  '98107': { city: 'Seattle', state: 'WA', county: 'King' },
  '98109': { city: 'Seattle', state: 'WA', county: 'King' },
  '98112': { city: 'Seattle', state: 'WA', county: 'King' },
  '98115': { city: 'Seattle', state: 'WA', county: 'King' },
  '98117': { city: 'Seattle', state: 'WA', county: 'King' },
  '98118': { city: 'Seattle', state: 'WA', county: 'King' },
  '98119': { city: 'Seattle', state: 'WA', county: 'King' },
  '98121': { city: 'Seattle', state: 'WA', county: 'King' },
  '98122': { city: 'Seattle', state: 'WA', county: 'King' },
  '98125': { city: 'Seattle', state: 'WA', county: 'King' },
  '98126': { city: 'Seattle', state: 'WA', county: 'King' },
  '02101': { city: 'Boston', state: 'MA', county: 'Suffolk' },
  '02108': { city: 'Boston', state: 'MA', county: 'Suffolk' },
  '02109': { city: 'Boston', state: 'MA', county: 'Suffolk' },
  '02110': { city: 'Boston', state: 'MA', county: 'Suffolk' },
  '02111': { city: 'Boston', state: 'MA', county: 'Suffolk' },
  '02114': { city: 'Boston', state: 'MA', county: 'Suffolk' },
  '02115': { city: 'Boston', state: 'MA', county: 'Suffolk' },
  '02116': { city: 'Boston', state: 'MA', county: 'Suffolk' },
  '02118': { city: 'Boston', state: 'MA', county: 'Suffolk' },
  '02127': { city: 'Boston', state: 'MA', county: 'Suffolk' },
  '02129': { city: 'Charlestown', state: 'MA', county: 'Suffolk' },
  '02134': { city: 'Allston', state: 'MA', county: 'Suffolk' },
  '02135': { city: 'Brighton', state: 'MA', county: 'Suffolk' },
  '30301': { city: 'Atlanta', state: 'GA', county: 'Fulton' },
  '30303': { city: 'Atlanta', state: 'GA', county: 'Fulton' },
  '30305': { city: 'Atlanta', state: 'GA', county: 'Fulton' },
  '30306': { city: 'Atlanta', state: 'GA', county: 'Fulton' },
  '30307': { city: 'Atlanta', state: 'GA', county: 'Fulton' },
  '30308': { city: 'Atlanta', state: 'GA', county: 'Fulton' },
  '30309': { city: 'Atlanta', state: 'GA', county: 'Fulton' },
  '30310': { city: 'Atlanta', state: 'GA', county: 'Fulton' },
  '30312': { city: 'Atlanta', state: 'GA', county: 'Fulton' },
  '30313': { city: 'Atlanta', state: 'GA', county: 'Fulton' },
  '30314': { city: 'Atlanta', state: 'GA', county: 'Fulton' },
  '30315': { city: 'Atlanta', state: 'GA', county: 'Fulton' },
  '30316': { city: 'Atlanta', state: 'GA', county: 'DeKalb' },
  '30318': { city: 'Atlanta', state: 'GA', county: 'Fulton' },
  '30319': { city: 'Atlanta', state: 'GA', county: 'DeKalb' },
  '30324': { city: 'Atlanta', state: 'GA', county: 'Fulton' },
  '30326': { city: 'Atlanta', state: 'GA', county: 'Fulton' },
  '80202': { city: 'Denver', state: 'CO', county: 'Denver' },
  '80203': { city: 'Denver', state: 'CO', county: 'Denver' },
  '80204': { city: 'Denver', state: 'CO', county: 'Denver' },
  '80205': { city: 'Denver', state: 'CO', county: 'Denver' },
  '80206': { city: 'Denver', state: 'CO', county: 'Denver' },
  '80207': { city: 'Denver', state: 'CO', county: 'Denver' },
  '80209': { city: 'Denver', state: 'CO', county: 'Denver' },
  '80210': { city: 'Denver', state: 'CO', county: 'Denver' },
  '80211': { city: 'Denver', state: 'CO', county: 'Denver' },
  '80212': { city: 'Denver', state: 'CO', county: 'Denver' },
  '80218': { city: 'Denver', state: 'CO', county: 'Denver' },
  '80220': { city: 'Denver', state: 'CO', county: 'Denver' },
  '20001': { city: 'Washington', state: 'DC', county: 'District of Columbia' },
  '20002': { city: 'Washington', state: 'DC', county: 'District of Columbia' },
  '20003': { city: 'Washington', state: 'DC', county: 'District of Columbia' },
  '20004': { city: 'Washington', state: 'DC', county: 'District of Columbia' },
  '20005': { city: 'Washington', state: 'DC', county: 'District of Columbia' },
  '20006': { city: 'Washington', state: 'DC', county: 'District of Columbia' },
  '20007': { city: 'Washington', state: 'DC', county: 'District of Columbia' },
  '20008': { city: 'Washington', state: 'DC', county: 'District of Columbia' },
  '20009': { city: 'Washington', state: 'DC', county: 'District of Columbia' },
  '20010': { city: 'Washington', state: 'DC', county: 'District of Columbia' },
  '20011': { city: 'Washington', state: 'DC', county: 'District of Columbia' },
  '20012': { city: 'Washington', state: 'DC', county: 'District of Columbia' },
  '89101': { city: 'Las Vegas', state: 'NV', county: 'Clark' },
  '89102': { city: 'Las Vegas', state: 'NV', county: 'Clark' },
  '89103': { city: 'Las Vegas', state: 'NV', county: 'Clark' },
  '89104': { city: 'Las Vegas', state: 'NV', county: 'Clark' },
  '89106': { city: 'Las Vegas', state: 'NV', county: 'Clark' },
  '89107': { city: 'Las Vegas', state: 'NV', county: 'Clark' },
  '89109': { city: 'Las Vegas', state: 'NV', county: 'Clark' },
  '89117': { city: 'Las Vegas', state: 'NV', county: 'Clark' },
  '89119': { city: 'Las Vegas', state: 'NV', county: 'Clark' },
  '89121': { city: 'Las Vegas', state: 'NV', county: 'Clark' },
  '89128': { city: 'Las Vegas', state: 'NV', county: 'Clark' },
  '89129': { city: 'Las Vegas', state: 'NV', county: 'Clark' },
  '89134': { city: 'Las Vegas', state: 'NV', county: 'Clark' },
  '89135': { city: 'Las Vegas', state: 'NV', county: 'Clark' },
  '89144': { city: 'Las Vegas', state: 'NV', county: 'Clark' },
  '89145': { city: 'Las Vegas', state: 'NV', county: 'Clark' },
  '89147': { city: 'Las Vegas', state: 'NV', county: 'Clark' },
  '89148': { city: 'Las Vegas', state: 'NV', county: 'Clark' },
};

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================
const getCache = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return {};

    const { data, timestamp } = JSON.parse(cached);

    // Check if cache is expired
    if (Date.now() - timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY);
      return {};
    }

    return data || {};
  } catch (error) {
    console.warn('Error reading ZIP cache:', error);
    return {};
  }
};

const setCache = (zip, data) => {
  try {
    const cache = getCache();
    cache[zip] = data;

    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data: cache,
      timestamp: Date.now(),
    }));
  } catch (error) {
    console.warn('Error setting ZIP cache:', error);
  }
};

const clearCache = () => {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.warn('Error clearing ZIP cache:', error);
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
const getAreaCode = (zip) => {
  // Try exact match first (3-digit prefix)
  const prefix3 = zip.substring(0, 3);
  if (ZIP_TO_AREA_CODE[prefix3]) {
    return ZIP_TO_AREA_CODE[prefix3];
  }

  // Try 2-digit prefix
  const prefix2 = zip.substring(0, 2);
  if (ZIP_TO_AREA_CODE[prefix2]) {
    return ZIP_TO_AREA_CODE[prefix2];
  }

  return null;
};

const getTimezone = (stateAbbr) => {
  return STATE_TIMEZONES[stateAbbr] || 'America/New_York';
};

// ============================================================================
// MAIN LOOKUP FUNCTION
// ============================================================================

/**
 * Look up ZIP code information
 * @param {string} zip - 5-digit ZIP code
 * @returns {Promise<object|null>} ZIP data or null if not found
 */
export const lookupZIP = async (zip) => {
  // Validate ZIP format
  if (!zip || typeof zip !== 'string') {
    return null;
  }

  const cleanZip = zip.replace(/\D/g, '').substring(0, 5);

  if (cleanZip.length !== 5) {
    return null;
  }

  // Check cache first
  const cache = getCache();
  if (cache[cleanZip]) {
    console.log(`ZIP ${cleanZip} found in cache`);
    return cache[cleanZip];
  }

  // Check local fallback data
  if (COMMON_ZIPS[cleanZip]) {
    const fallbackData = COMMON_ZIPS[cleanZip];
    const result = {
      zip: cleanZip,
      city: fallbackData.city,
      state: fallbackData.state,
      stateAbbr: fallbackData.state,
      county: fallbackData.county,
      timezone: getTimezone(fallbackData.state),
      areaCode: getAreaCode(cleanZip),
      source: 'local',
    };
    setCache(cleanZip, result);
    return result;
  }

  // Call Zippopotamus API
  try {
    const response = await fetch(`${ZIPPOPOTAMUS_API}/${cleanZip}`);

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`ZIP ${cleanZip} not found in API`);
        return null;
      }
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.places || data.places.length === 0) {
      return null;
    }

    const place = data.places[0];
    const result = {
      zip: cleanZip,
      city: place['place name'],
      state: place['state abbreviation'],
      stateAbbr: place['state abbreviation'],
      stateFull: place.state,
      county: place.county || null,
      latitude: parseFloat(place.latitude),
      longitude: parseFloat(place.longitude),
      timezone: getTimezone(place['state abbreviation']),
      areaCode: getAreaCode(cleanZip),
      source: 'api',
    };

    // Cache the result
    setCache(cleanZip, result);

    console.log(`ZIP ${cleanZip} fetched from API:`, result);
    return result;

  } catch (error) {
    console.error(`Error fetching ZIP ${cleanZip}:`, error);

    // Try fallback for nearby ZIPs
    const prefix = cleanZip.substring(0, 3);
    const fallbackZip = Object.keys(COMMON_ZIPS).find(z => z.startsWith(prefix));

    if (fallbackZip) {
      const fallbackData = COMMON_ZIPS[fallbackZip];
      return {
        zip: cleanZip,
        city: fallbackData.city,
        state: fallbackData.state,
        stateAbbr: fallbackData.state,
        county: fallbackData.county,
        timezone: getTimezone(fallbackData.state),
        areaCode: getAreaCode(cleanZip),
        source: 'fallback',
        approximate: true,
      };
    }

    return null;
  }
};

// ============================================================================
// DEBOUNCED LOOKUP
// ============================================================================
let debounceTimer = null;

export const debouncedLookupZIP = (zip, callback) => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(async () => {
    const result = await lookupZIP(zip);
    callback(result);
  }, DEBOUNCE_MS);
};

// ============================================================================
// PARTIAL ZIP SUGGESTIONS
// ============================================================================
export const getZIPSuggestions = (partialZip) => {
  if (!partialZip || partialZip.length < 3) {
    return [];
  }

  const cleanPartial = partialZip.replace(/\D/g, '');

  // Get matching ZIPs from common zips
  const suggestions = Object.entries(COMMON_ZIPS)
    .filter(([zip]) => zip.startsWith(cleanPartial))
    .slice(0, 5)
    .map(([zip, data]) => ({
      zip,
      city: data.city,
      state: data.state,
      display: `${zip} - ${data.city}, ${data.state}`,
    }));

  return suggestions;
};

// ============================================================================
// EXPORTS
// ============================================================================
export {
  clearCache,
  getAreaCode,
  getTimezone,
  COMMON_ZIPS,
  STATE_TIMEZONES,
};

export default lookupZIP;
