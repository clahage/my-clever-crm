// src/pages/TestFunctions.jsx
// TEMPORARY TEST PAGE - Delete after testing

import React, { useState } from 'react';
import { Box, Button, Card, CardContent, Typography, TextField, Alert } from '@mui/material';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

const TestFunctions = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ═══════════════════════════════════════════════════════════════
  // TEST 1: Store Credit Report
  // ═══════════════════════════════════════════════════════════════
  const testStoreReport = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const idiqService = httpsCallable(functions, 'idiqService');
      
      const result = await idiqService({
        action: 'storeReport',
        email: 'test@speedycreditrepair.com',
        contactId: 'TkoRn9YetTmmOQFWB9Fg', // Replace with real contact ID
        reportData: {
          equifaxScore: 650,
          experianScore: 645,
          transunionScore: 655,
          averageScore: 650,
          // Add more test data here
        }
      });
      
      setResult(result.data);
      console.log('✅ Store Report Result:', result.data);
      
    } catch (err) {
      setError(err.message);
      console.error('❌ Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // TEST 2: Recommend Service Plan
  // ═══════════════════════════════════════════════════════════════
  const testRecommendPlan = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const aiContentGenerator = httpsCallable(functions, 'aiContentGenerator');
      
      const result = await aiContentGenerator({
        type: 'recommendServicePlan',
        creditScore: 599,
        negativeItems: 5,
        utilization: 85,
        contactId: 'TEST_CONTACT_ID' // Optional
      });
      
      setResult(result.data);
      console.log('✅ Service Plan Result:', result.data);
      
    } catch (err) {
      setError(err.message);
      console.error('❌ Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // TEST 3: Create Portal Account
  // ═══════════════════════════════════════════════════════════════
  const testCreatePortal = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const operationsManager = httpsCallable(functions, 'operationsManager');
      
      const result = await operationsManager({
        action: 'createPortalAccount',
        contactId: '3JJUU7FudpBpTIA4D2KC', // Replace with real contact ID
        email: 'portaltest09@example.com', // Change this for each test
        firstName: 'Test',
        lastName: 'User'
      });
      
      setResult(result.data);
      console.log('✅ Portal Account Result:', result.data);
      
    } catch (err) {
      setError(err.message);
      console.error('❌ Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        🧪 Function Tests
      </Typography>
      
      <Alert severity="warning" sx={{ mb: 3 }}>
        <strong>TEMPORARY TEST PAGE</strong> - Delete this file after testing
      </Alert>

      {/* Test Buttons */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Test 1: Store Credit Report
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Tests the idiqService function with storeReport action
          </Typography>
          <Button 
            variant="contained" 
            onClick={testStoreReport}
            disabled={loading}
          >
            {loading ? 'Testing...' : 'Test Store Report'}
          </Button>
        </CardContent>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Test 2: Recommend Service Plan
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Tests the aiContentGenerator function with recommendServicePlan
          </Typography>
          <Button 
            variant="contained" 
            onClick={testRecommendPlan}
            disabled={loading}
          >
            {loading ? 'Testing...' : 'Test Service Plan'}
          </Button>
        </CardContent>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Test 3: Create Portal Account
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Tests the operationsManager function with createPortalAccount
          </Typography>
          <Button 
            variant="contained" 
            onClick={testCreatePortal}
            disabled={loading}
          >
            {loading ? 'Testing...' : 'Test Portal Account'}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <strong>Error:</strong> {error}
        </Alert>
      )}

      {result && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              ✅ Result:
            </Typography>
            <Box 
              component="pre" 
              sx={{ 
                bgcolor: 'grey.100', 
                p: 2, 
                borderRadius: 1,
                overflow: 'auto',
                fontSize: '0.875rem'
              }}
            >
              {JSON.stringify(result, null, 2)}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default TestFunctions;