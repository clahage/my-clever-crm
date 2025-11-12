// public/tracking/websiteTracking.js
// This script goes on speedycreditrepair.com to track visitors
// Link them to CRM contacts via email/phone lookup

(function() {
  'use strict';
  
  // Configuration
  const config = {
    apiEndpoint: 'https://my-clever-crm.web.app/api/track',
    firebaseEndpoint: 'https://firestore.googleapis.com/v1/projects/my-clever-crm/databases/(default)/documents',
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    trackingCookieName: 'scr_visitor_id',
    sessionCookieName: 'scr_session_id'
  };

  // Visitor tracking object
  const SCRTracker = {
    visitorId: null,
    sessionId: null,
    startTime: Date.now(),
    pageViews: [],
    events: [],
    
    // Initialize tracking
    init() {
      this.setupVisitor();
      this.setupSession();
      this.trackPageView();
      this.setupEventListeners();
      this.trackFormSubmissions();
      this.identifyReturningVisitor();
    },
    
    // Setup or retrieve visitor ID
    setupVisitor() {
      this.visitorId = this.getCookie(config.trackingCookieName);
      
      if (!this.visitorId) {
        this.visitorId = this.generateId();
        this.setCookie(config.trackingCookieName, this.visitorId, 365);
        this.trackEvent('new_visitor', { firstVisit: true });
      } else {
        this.trackEvent('returning_visitor', { visitorId: this.visitorId });
      }
    },
    
    // Setup or retrieve session ID
    setupSession() {
      this.sessionId = this.getCookie(config.sessionCookieName);
      
      if (!this.sessionId) {
        this.sessionId = this.generateId();
        this.setCookie(config.sessionCookieName, this.sessionId, 0); // Session cookie
        this.trackEvent('session_start', { sessionId: this.sessionId });
      }
    },
    
    // Generate unique ID
    generateId() {
      return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    // Cookie management
    getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
      return null;
    },
    
    setCookie(name, value, days) {
      let expires = '';
      if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = `; expires=${date.toUTCString()}`;
      }
      document.cookie = `${name}=${value}${expires}; path=/; SameSite=Lax`;
    },
    
    // Track page view
    trackPageView() {
      const pageData = {
        url: window.location.href,
        path: window.location.pathname,
        title: document.title,
        referrer: document.referrer,
        timestamp: new Date().toISOString(),
        visitorId: this.visitorId,
        sessionId: this.sessionId,
        queryParams: this.getQueryParams(),
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        screen: {
          width: screen.width,
          height: screen.height
        }
      };
      
      this.pageViews.push(pageData);
      this.sendData('pageview', pageData);
      
      // Track time on page
      this.trackTimeOnPage();
    },
    
    // Get URL query parameters
    getQueryParams() {
      const params = {};
      const searchParams = new URLSearchParams(window.location.search);
      
      for (const [key, value] of searchParams) {
        params[key] = value;
        
        // Check for UTM parameters
        if (key.startsWith('utm_')) {
          this.trackEvent('utm_arrival', { [key]: value });
        }
        
        // Check for email tracking
        if (key === 'email' || key === 'e') {
          this.identifyVisitor('email', value);
        }
        
        // Check for phone tracking
        if (key === 'phone' || key === 'p') {
          this.identifyVisitor('phone', value);
        }
      }
      
      return params;
    },
    
    // Track custom events
    trackEvent(eventName, data = {}) {
      const eventData = {
        name: eventName,
        timestamp: new Date().toISOString(),
        visitorId: this.visitorId,
        sessionId: this.sessionId,
        pageUrl: window.location.href,
        ...data
      };
      
      this.events.push(eventData);
      this.sendData('event', eventData);
    },
    
    // Track time spent on page
    trackTimeOnPage() {
      let startTime = Date.now();
      let totalTime = 0;
      
      // Track when user leaves
      window.addEventListener('beforeunload', () => {
        totalTime += Date.now() - startTime;
        this.trackEvent('page_exit', {
          timeOnPage: Math.round(totalTime / 1000),
          pageUrl: window.location.href
        });
      });
      
      // Track when page becomes hidden/visible
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          totalTime += Date.now() - startTime;
        } else {
          startTime = Date.now();
        }
      });
    },
    
    // Setup event listeners
    setupEventListeners() {
      // Track clicks on CTAs
      document.addEventListener('click', (e) => {
        const target = e.target.closest('a, button');
        if (!target) return;
        
        const data = {
          tagName: target.tagName,
          text: target.textContent.trim().substring(0, 100),
          href: target.href || null,
          id: target.id || null,
          classes: target.className || null
        };
        
        // Check if it's a CTA
        if (target.classList.contains('cta') || 
            target.textContent.match(/call|contact|schedule|start|apply/i)) {
          this.trackEvent('cta_click', data);
        }
        
        // Track phone number clicks
        if (target.href && target.href.startsWith('tel:')) {
          const phone = target.href.replace('tel:', '');
          this.trackEvent('phone_click', { phone, ...data });
          this.identifyVisitor('phone', phone);
        }
        
        // Track email clicks
        if (target.href && target.href.startsWith('mailto:')) {
          const email = target.href.replace('mailto:', '');
          this.trackEvent('email_click', { email, ...data });
          this.identifyVisitor('email', email);
        }
        
        // Track outbound links
        if (target.href && !target.href.includes(window.location.hostname)) {
          this.trackEvent('outbound_link', { url: target.href, ...data });
        }
      });
      
      // Track scroll depth
      let scrollDepths = [25, 50, 75, 90, 100];
      let reachedDepths = [];
      
      window.addEventListener('scroll', this.debounce(() => {
        const scrollPercent = Math.round(
          (window.scrollY + window.innerHeight) / document.body.scrollHeight * 100
        );
        
        scrollDepths.forEach(depth => {
          if (scrollPercent >= depth && !reachedDepths.includes(depth)) {
            reachedDepths.push(depth);
            this.trackEvent('scroll_depth', { 
              depth: depth,
              pageHeight: document.body.scrollHeight 
            });
          }
        });
      }, 500));
    },
    
    // Track form submissions
    trackFormSubmissions() {
      document.addEventListener('submit', (e) => {
        const form = e.target;
        const formData = new FormData(form);
        const data = {};
        
        // Collect form data (be careful with sensitive info)
        for (const [key, value] of formData.entries()) {
          // Identify visitor by email or phone
          if (key.match(/email/i)) {
            this.identifyVisitor('email', value);
          }
          if (key.match(/phone|tel/i)) {
            this.identifyVisitor('phone', value);
          }
          
          // Don't track sensitive fields
          if (!key.match(/password|ssn|card|cvv/i)) {
            data[key] = value;
          }
        }
        
        this.trackEvent('form_submit', {
          formId: form.id || null,
          formName: form.name || null,
          formAction: form.action || null,
          fields: Object.keys(data),
          data: data
        });
      });
      
      // Track form field interactions
      let formEngagement = {};
      
      document.addEventListener('focus', (e) => {
        if (e.target.matches('input, textarea, select')) {
          const fieldName = e.target.name || e.target.id || 'unknown';
          if (!formEngagement[fieldName]) {
            formEngagement[fieldName] = { focused: 0, changed: 0 };
          }
          formEngagement[fieldName].focused++;
          
          this.trackEvent('form_field_focus', {
            field: fieldName,
            type: e.target.type
          });
        }
      }, true);
      
      document.addEventListener('change', (e) => {
        if (e.target.matches('input, textarea, select')) {
          const fieldName = e.target.name || e.target.id || 'unknown';
          if (formEngagement[fieldName]) {
            formEngagement[fieldName].changed++;
          }
        }
      });
    },
    
    // Identify visitor with email or phone
    identifyVisitor(type, value) {
      if (!value) return;
      
      const identityData = {
        visitorId: this.visitorId,
        sessionId: this.sessionId,
        identificationType: type,
        identificationValue: value,
        timestamp: new Date().toISOString(),
        pageUrl: window.location.href
      };
      
      // Store in localStorage for persistence
      const storedIdentities = JSON.parse(
        localStorage.getItem('scr_visitor_identities') || '[]'
      );
      storedIdentities.push(identityData);
      localStorage.setItem('scr_visitor_identities', JSON.stringify(storedIdentities));
      
      // Send to CRM
      this.sendData('identify', identityData);
      this.linkToCRMContact(type, value);
    },
    
    // Try to identify returning visitor
    identifyReturningVisitor() {
      const storedIdentities = JSON.parse(
        localStorage.getItem('scr_visitor_identities') || '[]'
      );
      
      if (storedIdentities.length > 0) {
        const lastIdentity = storedIdentities[storedIdentities.length - 1];
        this.trackEvent('returning_identified_visitor', lastIdentity);
        this.linkToCRMContact(
          lastIdentity.identificationType, 
          lastIdentity.identificationValue
        );
      }
    },
    
    // Link visitor to CRM contact
    async linkToCRMContact(type, value) {
      try {
        const response = await fetch(`${config.apiEndpoint}/link-visitor`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            visitorId: this.visitorId,
            sessionId: this.sessionId,
            identificationType: type,
            identificationValue: value,
            currentPageUrl: window.location.href,
            visitHistory: this.pageViews,
            events: this.events
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.contactId) {
            this.trackEvent('crm_contact_linked', {
              contactId: result.contactId,
              matchType: type
            });
          }
        }
      } catch (error) {
        console.error('Failed to link visitor to CRM:', error);
      }
    },
    
    // Send tracking data to server
    async sendData(type, data) {
      try {
        // Use sendBeacon for reliability
        if (navigator.sendBeacon) {
          const blob = new Blob([JSON.stringify({ type, data })], {
            type: 'application/json'
          });
          navigator.sendBeacon(`${config.apiEndpoint}/track`, blob);
        } else {
          // Fallback to fetch
          fetch(`${config.apiEndpoint}/track`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, data }),
            keepalive: true
          }).catch(err => console.error('Tracking error:', err));
        }
      } catch (error) {
        console.error('Failed to send tracking data:', error);
      }
    },
    
    // Utility: Debounce function
    debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },
    
    // Track engagement score
    calculateEngagement() {
      const score = {
        pageViews: this.pageViews.length * 10,
        events: this.events.length * 5,
        timeOnSite: Math.round((Date.now() - this.startTime) / 1000),
        scrollDepth: this.events.filter(e => e.name === 'scroll_depth').length * 10,
        formInteractions: this.events.filter(e => e.name.startsWith('form_')).length * 20,
        ctaClicks: this.events.filter(e => e.name === 'cta_click').length * 30
      };
      
      score.total = Object.values(score).reduce((a, b) => a + b, 0);
      return score;
    },
    
    // Send engagement score before leaving
    sendEngagementScore() {
      window.addEventListener('beforeunload', () => {
        const engagement = this.calculateEngagement();
        this.trackEvent('session_end', {
          engagement: engagement,
          totalPageViews: this.pageViews.length,
          totalEvents: this.events.length,
          sessionDuration: Math.round((Date.now() - this.startTime) / 1000)
        });
      });
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SCRTracker.init());
  } else {
    SCRTracker.init();
  }
  
  // Expose tracker for manual event tracking
  window.SCRTracker = SCRTracker;
})();

// Usage on speedycreditrepair.com:
// Add this script to every page: <script src="/tracking/websiteTracking.js"></script>
// Manual tracking: window.SCRTracker.trackEvent('custom_event', { data: 'value' });