// ============================================================================
// USE CONTRACT WORKFLOW HOOK
// ============================================================================
// React hook for managing contract generation workflow
// Features: Multi-step workflow, progress tracking, auto-save, resume capability
//
// Usage:
//   const workflow = useContractWorkflow(contractId);
//   workflow.nextStep();
//   workflow.saveProgress(data);
//
// Workflow Steps:
//   1. Plan Selection
//   2. Client Information Review
//   3. Contract Preview
//   4. Signature Request
//   5. Completion
//
// Created By: Chris Lahage - Speedy Credit Repair Inc.
// © 1995-2025 Speedy Credit Repair Inc. All Rights Reserved
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

// ===== WORKFLOW STEPS CONFIGURATION =====
const WORKFLOW_STEPS = [
  {
    id: 'plan-selection',
    name: 'Select Service Plan',
    nameEs: 'Seleccionar Plan de Servicio',
    description: 'Choose the right service plan for your needs',
    descriptionEs: 'Elija el plan de servicio adecuado para sus necesidades',
    order: 1,
    required: true
  },
  {
    id: 'client-info',
    name: 'Review Client Information',
    nameEs: 'Revisar Información del Cliente',
    description: 'Verify and complete client details',
    descriptionEs: 'Verificar y completar los detalles del cliente',
    order: 2,
    required: true
  },
  {
    id: 'contract-preview',
    name: 'Preview Contract',
    nameEs: 'Vista Previa del Contrato',
    description: 'Review contract terms and conditions',
    descriptionEs: 'Revisar los términos y condiciones del contrato',
    order: 3,
    required: true
  },
  {
    id: 'signature-request',
    name: 'Request Signature',
    nameEs: 'Solicitar Firma',
    description: 'Send contract for e-signature',
    descriptionEs: 'Enviar contrato para firma electrónica',
    order: 4,
    required: true
  },
  {
    id: 'completion',
    name: 'Complete',
    nameEs: 'Completar',
    description: 'Contract signed and finalized',
    descriptionEs: 'Contrato firmado y finalizado',
    order: 5,
    required: false
  }
];

// ===== USE CONTRACT WORKFLOW HOOK =====
export const useContractWorkflow = (contractId, contactId) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [workflowData, setWorkflowData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [completed, setCompleted] = useState(false);

  // Auto-save timer ref
  const autoSaveTimerRef = useRef(null);

  // ===== LOAD EXISTING WORKFLOW DATA =====
  useEffect(() => {
    if (!contractId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const workflowRef = doc(db, 'contractWorkflows', contractId);

      const unsubscribe = onSnapshot(
        workflowRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            setWorkflowData(data);
            setCurrentStep(data.currentStep || 0);
            setCompleted(data.completed || false);
          } else {
            // Initialize new workflow
            initializeWorkflow();
          }
          setLoading(false);
        },
        (err) => {
          console.error('Error loading contract workflow:', err);
          setError(err.message);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error('Error setting up workflow listener:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [contractId]);

  // ===== INITIALIZE NEW WORKFLOW =====
  const initializeWorkflow = useCallback(async () => {
    if (!contractId || !contactId) return;

    try {
      const workflowRef = doc(db, 'contractWorkflows', contractId);

      const initialData = {
        contractId,
        contactId,
        currentStep: 0,
        completed: false,
        steps: WORKFLOW_STEPS.map(step => ({
          ...step,
          completed: false,
          data: null
        })),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(workflowRef, initialData);
      setWorkflowData(initialData);
      setCurrentStep(0);
      setCompleted(false);

      console.log('Contract workflow initialized:', contractId);
    } catch (err) {
      console.error('Error initializing workflow:', err);
      setError(err.message);
    }
  }, [contractId, contactId]);

  // ===== SAVE PROGRESS =====
  const saveProgress = useCallback(async (stepData, autoSave = false) => {
    if (!contractId) return;

    if (!autoSave) {
      setSaving(true);
    }
    setError(null);

    try {
      const workflowRef = doc(db, 'contractWorkflows', contractId);

      // Update the current step's data
      const updatedSteps = [...(workflowData.steps || WORKFLOW_STEPS)];
      updatedSteps[currentStep] = {
        ...updatedSteps[currentStep],
        data: stepData,
        completed: true,
        completedAt: new Date()
      };

      const updateData = {
        steps: updatedSteps,
        currentStep,
        updatedAt: new Date(),
        lastSaved: new Date()
      };

      await updateDoc(workflowRef, updateData);

      setWorkflowData(prev => ({
        ...prev,
        ...updateData
      }));

      if (!autoSave) {
        console.log(`Progress saved for step ${currentStep}`);
      }

      setSaving(false);
      return { success: true };
    } catch (err) {
      console.error('Error saving progress:', err);
      setError(err.message);
      setSaving(false);
      return { success: false, error: err.message };
    }
  }, [contractId, currentStep, workflowData]);

  // ===== AUTO-SAVE WITH DEBOUNCE =====
  const autoSave = useCallback((stepData) => {
    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set new timer (2 seconds debounce)
    autoSaveTimerRef.current = setTimeout(() => {
      saveProgress(stepData, true);
    }, 2000);
  }, [saveProgress]);

  // ===== NEXT STEP =====
  const nextStep = useCallback(async (stepData) => {
    if (currentStep >= WORKFLOW_STEPS.length - 1) {
      console.log('Already at final step');
      return { success: false, message: 'Already at final step' };
    }

    try {
      // Save current step data
      if (stepData) {
        await saveProgress(stepData);
      }

      const newStep = currentStep + 1;
      const workflowRef = doc(db, 'contractWorkflows', contractId);

      await updateDoc(workflowRef, {
        currentStep: newStep,
        updatedAt: new Date()
      });

      setCurrentStep(newStep);

      console.log(`Moved to step ${newStep}`);
      return { success: true };
    } catch (err) {
      console.error('Error moving to next step:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [contractId, currentStep, saveProgress]);

  // ===== PREVIOUS STEP =====
  const prevStep = useCallback(async () => {
    if (currentStep <= 0) {
      console.log('Already at first step');
      return { success: false, message: 'Already at first step' };
    }

    try {
      const newStep = currentStep - 1;
      const workflowRef = doc(db, 'contractWorkflows', contractId);

      await updateDoc(workflowRef, {
        currentStep: newStep,
        updatedAt: new Date()
      });

      setCurrentStep(newStep);

      console.log(`Moved back to step ${newStep}`);
      return { success: true };
    } catch (err) {
      console.error('Error moving to previous step:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [contractId, currentStep]);

  // ===== GOTO STEP =====
  const gotoStep = useCallback(async (stepIndex) => {
    if (stepIndex < 0 || stepIndex >= WORKFLOW_STEPS.length) {
      return { success: false, message: 'Invalid step index' };
    }

    try {
      const workflowRef = doc(db, 'contractWorkflows', contractId);

      await updateDoc(workflowRef, {
        currentStep: stepIndex,
        updatedAt: new Date()
      });

      setCurrentStep(stepIndex);

      console.log(`Jumped to step ${stepIndex}`);
      return { success: true };
    } catch (err) {
      console.error('Error jumping to step:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [contractId]);

  // ===== COMPLETE WORKFLOW =====
  const completeWorkflow = useCallback(async (finalData = {}) => {
    try {
      const workflowRef = doc(db, 'contractWorkflows', contractId);

      await updateDoc(workflowRef, {
        completed: true,
        completedAt: new Date(),
        finalData,
        updatedAt: new Date()
      });

      setCompleted(true);

      console.log('Contract workflow completed:', contractId);
      return { success: true };
    } catch (err) {
      console.error('Error completing workflow:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [contractId]);

  // ===== RESET WORKFLOW =====
  const resetWorkflow = useCallback(async () => {
    try {
      const workflowRef = doc(db, 'contractWorkflows', contractId);

      await updateDoc(workflowRef, {
        currentStep: 0,
        completed: false,
        steps: WORKFLOW_STEPS.map(step => ({
          ...step,
          completed: false,
          data: null
        })),
        resetAt: new Date(),
        updatedAt: new Date()
      });

      setCurrentStep(0);
      setCompleted(false);

      console.log('Workflow reset:', contractId);
      return { success: true };
    } catch (err) {
      console.error('Error resetting workflow:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [contractId]);

  // ===== GET STEP DATA =====
  const getStepData = useCallback((stepIndex) => {
    if (!workflowData.steps || !workflowData.steps[stepIndex]) {
      return null;
    }
    return workflowData.steps[stepIndex].data;
  }, [workflowData]);

  // ===== IS STEP COMPLETED =====
  const isStepCompleted = useCallback((stepIndex) => {
    if (!workflowData.steps || !workflowData.steps[stepIndex]) {
      return false;
    }
    return workflowData.steps[stepIndex].completed === true;
  }, [workflowData]);

  // ===== GET CURRENT STEP INFO =====
  const getCurrentStepInfo = useCallback(() => {
    return WORKFLOW_STEPS[currentStep] || null;
  }, [currentStep]);

  // ===== CALCULATE PROGRESS PERCENTAGE =====
  const getProgressPercentage = useCallback(() => {
    if (!workflowData.steps) return 0;

    const completedSteps = workflowData.steps.filter(s => s.completed).length;
    const totalSteps = WORKFLOW_STEPS.length;

    return Math.round((completedSteps / totalSteps) * 100);
  }, [workflowData]);

  // ===== CLEANUP AUTO-SAVE TIMER =====
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  return {
    // State
    currentStep,
    workflowData,
    loading,
    saving,
    error,
    completed,
    steps: WORKFLOW_STEPS,

    // Navigation
    nextStep,
    prevStep,
    gotoStep,

    // Data management
    saveProgress,
    autoSave,
    getStepData,
    isStepCompleted,

    // Workflow control
    completeWorkflow,
    resetWorkflow,
    initializeWorkflow,

    // Helpers
    getCurrentStepInfo,
    getProgressPercentage,

    // Computed values
    canGoNext: currentStep < WORKFLOW_STEPS.length - 1,
    canGoPrev: currentStep > 0,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === WORKFLOW_STEPS.length - 1
  };
};

// ===== EXPORT DEFAULT =====
export default useContractWorkflow;
