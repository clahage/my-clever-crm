// Path: /src/hooks/useConversionOptimization.js
// ================================================================================
// CONVERSION OPTIMIZATION HOOK
// ================================================================================
// Purpose: React hook for conversion tracking and optimization features
// Features: Form tracking, visitor behavior, exit intent, A/B testing
// Goal: Increase conversion from 0.24% to 2-5%
// ================================================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { ConversionIntelligence } from '../services/EnhancedPipelineAIService';

export const useConversionOptimization = (userId = null) => {
  const [visitorData, setVisitorData] = useState({
    pageViews: [],
    timeOnSite: 0,
    scrollDepth: 0,
    clicks: [],
    referrer: document.referrer,
    sessionStart: Date.now(),
  });

  const [conversionEvents, setConversionEvents] = useState([]);
  const [exitIntentTriggered, setExitIntentTriggered] = useState(false);
  const sessionIdRef = useRef(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  // ================================================================================
  // VISITOR BEHAVIOR TRACKING
  // ================================================================================

  useEffect(() => {
    // Track page view
    trackPageView(window.location.pathname);

    // Track time on site
    const timeInterval = setInterval(() => {
      setVisitorData(prev => ({
        ...prev,
        timeOnSite: Date.now() - prev.sessionStart,
      }));
    }, 5000); // Update every 5 seconds

    // Track scroll depth
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollDepth = scrollHeight > 0 ? (window.scrollY / scrollHeight) * 100 : 0;

      setVisitorData(prev => ({
        ...prev,
        scrollDepth: Math.max(prev.scrollDepth, Math.round(scrollDepth)),
      }));
    };

    window.addEventListener('scroll', handleScroll);

    // Track clicks
    const handleClick = (e) => {
      trackClick({
        element: e.target.tagName,
        text: e.target.innerText?.substring(0, 50),
        href: e.target.href,
        timestamp: Date.now(),
      });
    };

    document.addEventListener('click', handleClick);

    // Exit intent detection
    const handleMouseLeave = (e) => {
      if (e.clientY <= 0 && !exitIntentTriggered) {
        handleExitIntent();
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);

    // Cleanup
    return () => {
      clearInterval(timeInterval);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('mouseleave', handleMouseLeave);

      // Save session data on unmount
      saveSessionData();
    };
  }, []);

  // ================================================================================
  // TRACKING FUNCTIONS
  // ================================================================================

  const trackPageView = (path) => {
    setVisitorData(prev => ({
      ...prev,
      pageViews: [...prev.pageViews, { path, timestamp: Date.now() }],
    }));
  };

  const trackClick = (clickData) => {
    setVisitorData(prev => ({
      ...prev,
      clicks: [...prev.clicks, clickData],
    }));
  };

  const trackConversionEvent = async (eventType, eventData = {}) => {
    const event = {
      sessionId: sessionIdRef.current,
      userId,
      type: eventType,
      data: eventData,
      timestamp: new Date(),
      visitorData: {
        timeOnSite: visitorData.timeOnSite / 1000, // Convert to seconds
        pageViews: visitorData.pageViews.length,
        scrollDepth: visitorData.scrollDepth,
        clicks: visitorData.clicks.length,
      },
    };

    setConversionEvents(prev => [...prev, event]);

    // Save to Firebase
    try {
      await addDoc(collection(db, 'conversionEvents'), {
        ...event,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error tracking conversion event:', error);
    }

    return event;
  };

  const saveSessionData = async () => {
    try {
      await addDoc(collection(db, 'visitorSessions'), {
        sessionId: sessionIdRef.current,
        userId,
        ...visitorData,
        timeOnSite: (Date.now() - visitorData.sessionStart) / 1000, // seconds
        sessionEnd: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error saving session data:', error);
    }
  };

  // ================================================================================
  // CONVERSION OPTIMIZATION FEATURES
  // ================================================================================

  const handleExitIntent = useCallback(() => {
    setExitIntentTriggered(true);

    // Track exit intent event
    trackConversionEvent('exit_intent', {
      timeOnSite: visitorData.timeOnSite / 1000,
      pageViews: visitorData.pageViews.length,
    });

    // Could trigger exit popup here
    console.log('Exit intent detected - show retention offer');

  }, [visitorData, exitIntentTriggered]);

  const analyzeVisitorIntent = async () => {
    try {
      const intent = await ConversionIntelligence.predictVisitorIntent(visitorData);
      return intent;
    } catch (error) {
      console.error('Error analyzing visitor intent:', error);
      return null;
    }
  };

  const optimizeFormCapture = async (currentConversionRate) => {
    try {
      const optimization = await ConversionIntelligence.optimizeFormFields(
        { fields: ['name', 'phone', 'email', 'creditScore'] },
        currentConversionRate
      );
      return optimization;
    } catch (error) {
      console.error('Error optimizing form:', error);
      return null;
    }
  };

  const detectFormAbandonment = (formState) => {
    try {
      const abandonmentRisk = ConversionIntelligence.detectFormAbandonment(formState);
      return abandonmentRisk;
    } catch (error) {
      console.error('Error detecting form abandonment:', error);
      return null;
    }
  };

  // ================================================================================
  // FORM TRACKING
  // ================================================================================

  const trackFormStart = (formName) => {
    trackConversionEvent('form_started', { formName });
  };

  const trackFormFieldFocus = (formName, fieldName) => {
    trackConversionEvent('form_field_focus', { formName, fieldName });
  };

  const trackFormFieldBlur = (formName, fieldName, hasValue) => {
    trackConversionEvent('form_field_blur', { formName, fieldName, hasValue });
  };

  const trackFormSubmit = (formName, formData) => {
    trackConversionEvent('form_submitted', {
      formName,
      fieldCount: Object.keys(formData).length,
      timeToComplete: (Date.now() - visitorData.sessionStart) / 1000,
    });
  };

  const trackFormAbandonment = (formName, completedFields, totalFields) => {
    trackConversionEvent('form_abandoned', {
      formName,
      completedFields,
      totalFields,
      completionPercentage: (completedFields / totalFields) * 100,
    });
  };

  // ================================================================================
  // A/B TESTING
  // ================================================================================

  const [activeVariants, setActiveVariants] = useState({});

  const getVariant = useCallback((testName, variants) => {
    // Check if variant already assigned for this session
    if (activeVariants[testName]) {
      return activeVariants[testName];
    }

    // Assign random variant
    const variant = variants[Math.floor(Math.random() * variants.length)];

    setActiveVariants(prev => ({
      ...prev,
      [testName]: variant,
    }));

    // Track variant assignment
    trackConversionEvent('ab_test_assigned', { testName, variant });

    return variant;
  }, [activeVariants]);

  const trackVariantConversion = (testName, variant) => {
    trackConversionEvent('ab_test_conversion', { testName, variant });
  };

  // ================================================================================
  // REAL-TIME CONVERSION METRICS
  // ================================================================================

  const [conversionMetrics, setConversionMetrics] = useState({
    visitorsToday: 0,
    leadsToday: 0,
    conversionRate: 0,
    averageTimeToConvert: 0,
  });

  const fetchConversionMetrics = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get today's visitors
      const visitorQuery = query(
        collection(db, 'visitorSessions'),
        where('timestamp', '>=', today)
      );
      const visitorSnapshot = await getDocs(visitorQuery);
      const visitorsToday = visitorSnapshot.size;

      // Get today's conversions
      const conversionQuery = query(
        collection(db, 'conversionEvents'),
        where('type', '==', 'form_submitted'),
        where('timestamp', '>=', today)
      );
      const conversionSnapshot = await getDocs(conversionQuery);
      const leadsToday = conversionSnapshot.size;

      // Calculate conversion rate
      const conversionRate = visitorsToday > 0 ? (leadsToday / visitorsToday) * 100 : 0;

      setConversionMetrics({
        visitorsToday,
        leadsToday,
        conversionRate: conversionRate.toFixed(2),
        averageTimeToConvert: 0, // Would calculate from data
      });
    } catch (error) {
      console.error('Error fetching conversion metrics:', error);
    }
  };

  useEffect(() => {
    fetchConversionMetrics();

    // Refresh metrics every 5 minutes
    const interval = setInterval(fetchConversionMetrics, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // ================================================================================
  // CONVERSION FUNNEL TRACKING
  // ================================================================================

  const trackFunnelStep = (funnelName, stepName, stepData = {}) => {
    trackConversionEvent('funnel_step', {
      funnelName,
      stepName,
      ...stepData,
    });
  };

  const trackFunnelCompletion = (funnelName, totalSteps, timeToComplete) => {
    trackConversionEvent('funnel_completed', {
      funnelName,
      totalSteps,
      timeToComplete,
    });
  };

  // ================================================================================
  // RETURN OBJECT
  // ================================================================================

  return {
    // Visitor data
    visitorData,
    sessionId: sessionIdRef.current,

    // Conversion events
    conversionEvents,
    trackConversionEvent,

    // Visitor behavior
    trackPageView,
    trackClick,
    exitIntentTriggered,

    // AI-powered optimization
    analyzeVisitorIntent,
    optimizeFormCapture,
    detectFormAbandonment,

    // Form tracking
    trackFormStart,
    trackFormFieldFocus,
    trackFormFieldBlur,
    trackFormSubmit,
    trackFormAbandonment,

    // A/B testing
    getVariant,
    trackVariantConversion,

    // Metrics
    conversionMetrics,
    refreshMetrics: fetchConversionMetrics,

    // Funnel tracking
    trackFunnelStep,
    trackFunnelCompletion,
  };
};

// ================================================================================
// FORM TRACKING HOC
// ================================================================================

export const withFormTracking = (FormComponent, formName) => {
  return (props) => {
    const conversion = useConversionOptimization(props.userId);

    const enhancedProps = {
      ...props,
      onFormStart: () => conversion.trackFormStart(formName),
      onFieldFocus: (fieldName) => conversion.trackFormFieldFocus(formName, fieldName),
      onFieldBlur: (fieldName, hasValue) => conversion.trackFormFieldBlur(formName, fieldName, hasValue),
      onFormSubmit: (formData) => conversion.trackFormSubmit(formName, formData),
      onFormAbandon: (completed, total) => conversion.trackFormAbandonment(formName, completed, total),
    };

    return <FormComponent {...enhancedProps} />;
  };
};

export default useConversionOptimization;
