/**
 * Email Branding Configuration for SpeedyCRM
 * 
 * Complete branding assets, colors, typography, and styling
 * for Speedy Credit Repair email templates.
 * 
 * @author SpeedyCRM Team
 * @date October 2025
 */

/**
 * Main branding configuration
 */
const EMAIL_BRANDING = {
  // Company Information
  company: {
    name: 'Speedy Credit Repair',
    tagline: 'Trusted Since 1995 • 30 Years of Results',
    founded: 1995,
    experience: '30 years',
    website: 'https://speedycreditrepair.com',
    privacyPolicy: 'https://speedycreditrepair.com/privacy-policy',
    termsOfService: 'https://speedycreditrepair.com/terms-of-service'
  },

  // Contact Information
  contact: {
    phone: '1-888-724-7344',
    phoneDisplay: '(888) 724-7344',
    email: 'chris@speedycreditrepair.com',
    supportEmail: 'support@speedycreditrepair.com',
    address: {
      street: '',
      city: '',
      state: 'CA',
      zip: '',
      country: 'USA'
    }
  },

  // Email Settings
  email: {
    fromName: 'Chris Lahage - Speedy Credit Repair',
    fromEmail: 'chris@speedycreditrepair.com',
    replyTo: 'chris@speedycreditrepair.com',
    bccEmail: null // Set if you want to BCC all emails
  },

  // Brand Colors
  colors: {
    // Primary Colors
    primary: '#1e40af', // Deep blue
    primaryLight: '#3b82f6',
    primaryDark: '#1e3a8a',
    
    // Secondary Colors
    secondary: '#059669', // Green (success/trust)
    secondaryLight: '#10b981',
    secondaryDark: '#047857',
    
    // Accent Colors
    accent: '#f59e0b', // Amber (attention/CTA)
    accentLight: '#fbbf24',
    accentDark: '#d97706',
    
    // Neutral Colors
    text: '#111827', // Nearly black
    textLight: '#6b7280', // Gray
    textMuted: '#9ca3af',
    background: '#ffffff',
    backgroundGray: '#f9fafb',
    border: '#e5e7eb',
    
    // Status Colors
    success: '#059669',
    error: '#dc2626',
    warning: '#f59e0b',
    info: '#3b82f6'
  },

  // Typography
  typography: {
    // Font Families (web-safe + Google Fonts fallback)
    fontFamily: {
      primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      headings: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      monospace: 'Menlo, Monaco, Consolas, "Courier New", monospace'
    },
    
    // Font Sizes
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px'
    },
    
    // Font Weights
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    },
    
    // Line Heights
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75'
    }
  },

  // Logo Assets
  logos: {
    // Main logo (horizontal)
    primary: {
      url: 'https://speedycreditrepair.com/logo.png',
      width: 200,
      height: 50,
      alt: 'Speedy Credit Repair Logo'
    },
    
    // Square logo (for social/small spaces)
    square: {
      url: 'https://speedycreditrepair.com/logo-square.png',
      width: 100,
      height: 100,
      alt: 'Speedy Credit Repair'
    },
    
    // Favicon
    favicon: {
      url: 'https://speedycreditrepair.com/favicon.png',
      width: 32,
      height: 32,
      alt: 'SCR'
    }
  },

  // Social Media Links
  social: {
    facebook: 'https://facebook.com/speedycreditrepair',
    twitter: 'https://twitter.com/speedycredit',
    linkedin: 'https://linkedin.com/company/speedy-credit-repair',
    instagram: 'https://instagram.com/speedycreditrepair',
    youtube: 'https://youtube.com/@speedycreditrepair'
  },

  // Trust Indicators / Badges
  trustBadges: [
    {
      name: 'BBB Accredited',
      icon: '⭐',
      text: 'A+ Rating'
    },
    {
      name: 'Years Experience',
      icon: '📅',
      text: '30 Years'
    },
    {
      name: 'Clients Served',
      icon: '👥',
      text: '10,000+'
    },
    {
      name: 'Success Rate',
      icon: '✅',
      text: '98%'
    }
  ],

  // Call-to-Action Buttons
  cta: {
    // Primary CTA Style
    primary: {
      backgroundColor: '#1e40af',
      color: '#ffffff',
      borderRadius: '8px',
      padding: '14px 28px',
      fontSize: '16px',
      fontWeight: '600',
      textDecoration: 'none',
      display: 'inline-block',
      hoverBackgroundColor: '#1e3a8a'
    },
    
    // Secondary CTA Style
    secondary: {
      backgroundColor: '#059669',
      color: '#ffffff',
      borderRadius: '8px',
      padding: '12px 24px',
      fontSize: '15px',
      fontWeight: '600',
      textDecoration: 'none',
      display: 'inline-block',
      hoverBackgroundColor: '#047857'
    },
    
    // Text CTA Style
    text: {
      color: '#1e40af',
      fontSize: '16px',
      fontWeight: '600',
      textDecoration: 'underline',
      hoverColor: '#1e3a8a'
    }
  },

  // Email Layout Settings
  layout: {
    // Container Width
    maxWidth: '600px',
    
    // Padding
    containerPadding: '20px',
    sectionPadding: '30px 0',
    
    // Border Radius
    borderRadius: '8px',
    
    // Box Shadow
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },

  // Email Sections
  sections: {
    // Header
    header: {
      backgroundColor: '#ffffff',
      borderBottom: '3px solid #1e40af',
      padding: '20px',
      textAlign: 'center'
    },
    
    // Hero
    hero: {
      backgroundColor: '#1e40af',
      color: '#ffffff',
      padding: '40px 20px',
      textAlign: 'center'
    },
    
    // Content
    content: {
      backgroundColor: '#ffffff',
      padding: '30px 20px'
    },
    
    // Highlight Box
    highlightBox: {
      backgroundColor: '#f0f9ff',
      border: '2px solid #3b82f6',
      borderRadius: '8px',
      padding: '20px',
      margin: '20px 0'
    },
    
    // Success Box
    successBox: {
      backgroundColor: '#f0fdf4',
      border: '2px solid #059669',
      borderRadius: '8px',
      padding: '20px',
      margin: '20px 0'
    },
    
    // Warning Box
    warningBox: {
      backgroundColor: '#fffbeb',
      border: '2px solid #f59e0b',
      borderRadius: '8px',
      padding: '20px',
      margin: '20px 0'
    },
    
    // Footer
    footer: {
      backgroundColor: '#f9fafb',
      borderTop: '1px solid #e5e7eb',
      padding: '30px 20px',
      textAlign: 'center',
      color: '#6b7280',
      fontSize: '14px'
    }
  },

  // Common Text Snippets
  snippets: {
    // Signature
    signature: `
      <p style="margin: 30px 0 0 0; font-size: 16px; color: #111827;">
        <strong>Chris Lahage</strong><br>
        Owner & Credit Expert<br>
        Speedy Credit Repair<br>
        <a href="tel:18887247344" style="color: #1e40af; text-decoration: none;">
          (888) 724-7344
        </a>
      </p>
    `,
    
    // P.S. Section
    ps: `
      <p style="margin: 20px 0 0 0; padding: 15px; background: #f0f9ff; border-left: 4px solid #3b82f6; font-size: 15px; color: #111827;">
        <strong>P.S.</strong> I personally review every case. You're not just a number here – you're working directly with someone who cares about your success!
      </p>
    `,
    
    // Unsubscribe
    unsubscribe: `
      <p style="font-size: 12px; color: #9ca3af; margin: 20px 0 0 0;">
        If you no longer wish to receive these emails, you can 
        <a href="{{unsubscribe_url}}" style="color: #6b7280; text-decoration: underline;">
          unsubscribe here
        </a>.
      </p>
    `,
    
    // Privacy Notice
    privacy: `
      <p style="font-size: 12px; color: #9ca3af; margin: 10px 0 0 0;">
        We respect your privacy. View our 
        <a href="https://speedycreditrepair.com/privacy-policy" style="color: #6b7280; text-decoration: underline;">
          Privacy Policy
        </a>.
      </p>
    `,
    
    // Social Links
    socialLinks: `
      <div style="margin: 20px 0;">
        <a href="https://facebook.com/speedycreditrepair" style="display: inline-block; margin: 0 10px; text-decoration: none;">
          <img src="https://speedycreditrepair.com/icons/facebook.png" alt="Facebook" width="32" height="32" style="border: none;">
        </a>
        <a href="https://twitter.com/speedycredit" style="display: inline-block; margin: 0 10px; text-decoration: none;">
          <img src="https://speedycreditrepair.com/icons/twitter.png" alt="Twitter" width="32" height="32" style="border: none;">
        </a>
        <a href="https://linkedin.com/company/speedy-credit-repair" style="display: inline-block; margin: 0 10px; text-decoration: none;">
          <img src="https://speedycreditrepair.com/icons/linkedin.png" alt="LinkedIn" width="32" height="32" style="border: none;">
        </a>
      </div>
    `
  },

  // Email-Specific Content
  content: {
    // Why Choose Us Section
    whyChooseUs: [
      '✅ 30 years of proven results',
      '✅ Personal attention from the owner',
      '✅ Free credit report analysis',
      '✅ No upfront fees - only pay when we work',
      '✅ A+ BBB rating and 1000s of success stories'
    ],
    
    // Process Steps
    process: [
      {
        step: 1,
        title: 'Free Credit Report',
        description: 'Get your comprehensive report at no cost'
      },
      {
        step: 2,
        title: 'Expert Analysis',
        description: 'We identify every error and opportunity'
      },
      {
        step: 3,
        title: 'Personal Strategy',
        description: 'Custom plan designed for your specific situation'
      },
      {
        step: 4,
        title: 'Results',
        description: 'Watch your score improve month by month'
      }
    ],
    
    // Testimonial Snippets
    testimonials: [
      {
        text: 'Chris helped me go from a 520 to a 720 in just 8 months. I bought my first home thanks to Speedy Credit Repair!',
        author: 'Maria S.',
        location: 'Los Angeles, CA',
        rating: 5
      },
      {
        text: 'After 2 bankruptcies, I thought I\'d never get credit again. Chris proved me wrong. My score is now 680!',
        author: 'James T.',
        location: 'San Diego, CA',
        rating: 5
      },
      {
        text: 'The personal attention makes all the difference. Chris actually calls me back! 5 stars!',
        author: 'Sandra M.',
        location: 'Phoenix, AZ',
        rating: 5
      }
    ],
    
    // FAQ Items
    faqs: [
      {
        question: 'How long does credit repair take?',
        answer: 'Most clients see improvements within 30-60 days. Complete repair typically takes 3-6 months depending on your situation.'
      },
      {
        question: 'How much does it cost?',
        answer: 'We offer flexible payment plans starting at just $79/month. First consultation is always free!'
      },
      {
        question: 'Is this legal?',
        answer: 'Absolutely! Credit repair is protected by federal law (FCRA). We only use 100% legal and ethical methods.'
      },
      {
        question: 'What if items come back?',
        answer: 'We continue working until items are permanently removed. Your success is our priority!'
      }
    ]
  },

  // UTM Tracking Parameters for Links
  utmDefaults: {
    utm_source: 'email',
    utm_medium: 'automation',
    utm_campaign: 'workflow'
  }
};

/**
 * Helper function to build URL with UTM parameters
 * 
 * @param {string} baseUrl - Base URL
 * @param {Object} params - Additional UTM parameters
 * @returns {string} URL with UTM parameters
 */
function buildTrackingUrl(baseUrl, params = {}) {
  const url = new URL(baseUrl);
  const allParams = { ...EMAIL_BRANDING.utmDefaults, ...params };
  
  Object.entries(allParams).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  
  return url.toString();
}

/**
 * Helper function to generate CTA button HTML
 * 
 * @param {string} text - Button text
 * @param {string} url - Button URL
 * @param {string} style - Button style ('primary', 'secondary', 'text')
 * @returns {string} HTML for button
 */
function generateCTAButton(text, url, style = 'primary') {
  const buttonStyle = EMAIL_BRANDING.cta[style];
  
  const styleString = Object.entries(buttonStyle)
    .filter(([key]) => key !== 'hoverBackgroundColor' && key !== 'hoverColor')
    .map(([key, value]) => {
      // Convert camelCase to kebab-case
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${cssKey}: ${value}`;
    })
    .join('; ');
  
  return `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
      <tr>
        <td align="center">
          <a href="${url}" style="${styleString}">
            ${text}
          </a>
        </td>
      </tr>
    </table>
  `;
}

/**
 * Helper function to generate trust badges section
 * 
 * @returns {string} HTML for trust badges
 */
function generateTrustBadges() {
  return `
    <table role="presentation" border="0" cellpadding="10" cellspacing="0" width="100%" style="margin: 30px 0;">
      <tr>
        ${EMAIL_BRANDING.trustBadges.map(badge => `
          <td align="center" valign="top" style="padding: 10px;">
            <div style="font-size: 32px; margin-bottom: 5px;">${badge.icon}</div>
            <div style="font-size: 14px; font-weight: 600; color: #111827;">${badge.text}</div>
            <div style="font-size: 12px; color: #6b7280;">${badge.name}</div>
          </td>
        `).join('')}
      </tr>
    </table>
  `;
}

/**
 * Helper function to personalize content with contact data
 * 
 * @param {string} template - Template string with {{variables}}
 * @param {Object} data - Contact data
 * @returns {string} Personalized content
 */
function personalizeContent(template, data) {
  return template
    .replace(/\{\{firstName\}\}/g, data.firstName || data.name?.split(' ')[0] || 'there')
    .replace(/\{\{lastName\}\}/g, data.lastName || data.name?.split(' ').slice(1).join(' ') || '')
    .replace(/\{\{name\}\}/g, data.name || 'there')
    .replace(/\{\{email\}\}/g, data.email || '')
    .replace(/\{\{phone\}\}/g, data.phone || '')
    .replace(/\{\{company\}\}/g, EMAIL_BRANDING.company.name)
    .replace(/\{\{ownerName\}\}/g, 'Chris Lahage')
    .replace(/\{\{supportPhone\}\}/g, EMAIL_BRANDING.contact.phoneDisplay)
    .replace(/\{\{supportEmail\}\}/g, EMAIL_BRANDING.contact.email)
    .replace(/\{\{website\}\}/g, EMAIL_BRANDING.company.website);
}

// Export everything
module.exports = {
  EMAIL_BRANDING,
  buildTrackingUrl,
  generateCTAButton,
  generateTrustBadges,
  personalizeContent
};