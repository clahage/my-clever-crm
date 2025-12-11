// ============================================================================
// USE SERVICE PLANS HOOK
// ============================================================================
// React hook for loading and managing service plans from Firebase
// Features: Real-time updates, caching, error handling, loading states
//
// Usage:
//   const { plans, loading, error, refreshPlans } = useServicePlans();
//
// Created By: Chris Lahage - Speedy Credit Repair Inc.
// © 1995-2025 Speedy Credit Repair Inc. All Rights Reserved
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { collection, query, onSnapshot, orderBy, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { defaultServicePlans } from '../config/servicePlansConfig';
import { getEnabledPlans } from '../lib/servicePlanHelpers';

// ===== USE SERVICE PLANS HOOK =====
// Main hook for accessing service plans
export const useServicePlans = (options = {}) => {
  const {
    enabledOnly = false,
    sortBy = 'displayOrder',
    autoRefresh = true
  } = options;

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // ===== LOAD PLANS FROM FIREBASE =====
  useEffect(() => {
    if (!autoRefresh) return;

    setLoading(true);
    setError(null);

    try {
      // Create query for service plans collection
      const plansQuery = query(
        collection(db, 'servicePlans'),
        orderBy(sortBy, 'asc')
      );

      // Set up real-time listener
      const unsubscribe = onSnapshot(
        plansQuery,
        (snapshot) => {
          const loadedPlans = [];

          snapshot.forEach((doc) => {
            loadedPlans.push({
              id: doc.id,
              ...doc.data()
            });
          });

          // If no plans in Firebase, initialize with defaults
          if (loadedPlans.length === 0 && !initialized) {
            console.log('No service plans found, initializing with defaults...');
            initializeDefaultPlans().then(() => {
              setInitialized(true);
            });
          } else {
            // Filter for enabled plans if requested
            const finalPlans = enabledOnly ? getEnabledPlans(loadedPlans) : loadedPlans;
            setPlans(finalPlans);
            setLoading(false);
            setInitialized(true);
          }
        },
        (err) => {
          console.error('Error loading service plans:', err);
          setError(err.message);
          setLoading(false);

          // Fallback to default plans on error
          const fallbackPlans = enabledOnly ? getEnabledPlans(defaultServicePlans) : defaultServicePlans;
          setPlans(fallbackPlans);
        }
      );

      // Cleanup listener on unmount
      return () => unsubscribe();
    } catch (err) {
      console.error('Error setting up service plans listener:', err);
      setError(err.message);
      setLoading(false);

      // Fallback to default plans
      const fallbackPlans = enabledOnly ? getEnabledPlans(defaultServicePlans) : defaultServicePlans;
      setPlans(fallbackPlans);
    }
  }, [enabledOnly, sortBy, autoRefresh, initialized]);

  // ===== INITIALIZE DEFAULT PLANS =====
  // Loads default plans into Firebase (one-time setup)
  const initializeDefaultPlans = async () => {
    try {
      console.log('Initializing default service plans in Firebase...');

      const promises = defaultServicePlans.map((plan) => {
        const planRef = doc(db, 'servicePlans', plan.id);
        return setDoc(planRef, {
          ...plan,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'system'
        });
      });

      await Promise.all(promises);
      console.log('Default service plans initialized successfully');
    } catch (err) {
      console.error('Error initializing default plans:', err);
      throw err;
    }
  };

  // ===== REFRESH PLANS =====
  // Manual refresh function (useful when autoRefresh is false)
  const refreshPlans = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const plansQuery = query(
        collection(db, 'servicePlans'),
        orderBy(sortBy, 'asc')
      );

      const snapshot = await getDocs(plansQuery);
      const loadedPlans = [];

      snapshot.forEach((doc) => {
        loadedPlans.push({
          id: doc.id,
          ...doc.data()
        });
      });

      const finalPlans = enabledOnly ? getEnabledPlans(loadedPlans) : loadedPlans;
      setPlans(finalPlans);
      setLoading(false);
    } catch (err) {
      console.error('Error refreshing service plans:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [enabledOnly, sortBy]);

  return {
    plans,
    loading,
    error,
    refreshPlans,
    initialized
  };
};

// ===== USE SINGLE SERVICE PLAN HOOK =====
// Hook for loading a single service plan by ID
export const useServicePlan = (planId) => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!planId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const planRef = doc(db, 'servicePlans', planId);

      const unsubscribe = onSnapshot(
        planRef,
        (snapshot) => {
          if (snapshot.exists()) {
            setPlan({
              id: snapshot.id,
              ...snapshot.data()
            });
          } else {
            setPlan(null);
            setError('Plan not found');
          }
          setLoading(false);
        },
        (err) => {
          console.error(`Error loading service plan ${planId}:`, err);
          setError(err.message);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error(`Error setting up plan listener for ${planId}:`, err);
      setError(err.message);
      setLoading(false);
    }
  }, [planId]);

  return { plan, loading, error };
};

// ===== USE PLAN MUTATIONS HOOK =====
// Hook for creating, updating, and deleting service plans (admin only)
export const useServicePlanMutations = () => {
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  // ===== CREATE OR UPDATE PLAN =====
  const savePlan = useCallback(async (planData, currentUser) => {
    setSaving(true);
    setError(null);

    try {
      const planRef = doc(db, 'servicePlans', planData.id);

      const dataToSave = {
        ...planData,
        updatedAt: new Date(),
        updatedBy: currentUser?.uid || 'unknown'
      };

      // If creating new plan, set createdAt
      if (!planData.createdAt) {
        dataToSave.createdAt = new Date();
        dataToSave.createdBy = currentUser?.uid || 'unknown';
      }

      await setDoc(planRef, dataToSave, { merge: true });

      console.log(`Service plan ${planData.id} saved successfully`);
      setSaving(false);
      return { success: true };
    } catch (err) {
      console.error('Error saving service plan:', err);
      setError(err.message);
      setSaving(false);
      return { success: false, error: err.message };
    }
  }, []);

  // ===== DELETE PLAN =====
  const deletePlan = useCallback(async (planId) => {
    setDeleting(true);
    setError(null);

    try {
      const planRef = doc(db, 'servicePlans', planId);
      await deleteDoc(planRef);

      console.log(`Service plan ${planId} deleted successfully`);
      setDeleting(false);
      return { success: true };
    } catch (err) {
      console.error('Error deleting service plan:', err);
      setError(err.message);
      setDeleting(false);
      return { success: false, error: err.message };
    }
  }, []);

  // ===== TOGGLE PLAN ENABLED STATUS =====
  const togglePlanEnabled = useCallback(async (planId, enabled) => {
    setSaving(true);
    setError(null);

    try {
      const planRef = doc(db, 'servicePlans', planId);
      await updateDoc(planRef, {
        enabled,
        updatedAt: new Date()
      });

      console.log(`Service plan ${planId} ${enabled ? 'enabled' : 'disabled'}`);
      setSaving(false);
      return { success: true };
    } catch (err) {
      console.error('Error toggling plan status:', err);
      setError(err.message);
      setSaving(false);
      return { success: false, error: err.message };
    }
  }, []);

  // ===== UPDATE PLAN PRICING =====
  const updatePlanPricing = useCallback(async (planId, pricing) => {
    setSaving(true);
    setError(null);

    try {
      const planRef = doc(db, 'servicePlans', planId);
      await updateDoc(planRef, {
        pricing,
        updatedAt: new Date()
      });

      console.log(`Pricing updated for plan ${planId}`);
      setSaving(false);
      return { success: true };
    } catch (err) {
      console.error('Error updating plan pricing:', err);
      setError(err.message);
      setSaving(false);
      return { success: false, error: err.message };
    }
  }, []);

  return {
    savePlan,
    deletePlan,
    togglePlanEnabled,
    updatePlanPricing,
    saving,
    deleting,
    error
  };
};

// ===== EXPORT DEFAULT =====
export default useServicePlans;
