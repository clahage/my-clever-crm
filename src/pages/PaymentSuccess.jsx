// src/pages/PaymentSuccess.jsx
import React, { useEffect } from 'react';
import { Box, Typography, Button, Card, CardContent, Container } from '@mui/material';
import { CheckCircle, ArrowLeft, Package } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Log successful payment
    if (sessionId) {
      console.log('✅ Payment successful:', sessionId);
    }
  }, [sessionId]);

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <CheckCircle 
          size={100} 
          color="#10B981" 
          style={{ marginBottom: 24 }} 
        />
        
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', color: 'success.main' }}>
          Payment Successful!
        </Typography>
        
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Thank you for your purchase
        </Typography>

        <Card sx={{ mb: 4, bgcolor: 'success.light', color: 'success.contrastText' }}>
          <CardContent>
            <Typography variant="body1" sx={{ mb: 1 }}>
              ✅ Your payment has been processed successfully
            </Typography>
            <Typography variant="body2">
              📧 You'll receive a confirmation email shortly
            </Typography>
            {sessionId && (
              <Typography variant="caption" sx={{ mt: 2, display: 'block', opacity: 0.8 }}>
                Transaction ID: {sessionId}
              </Typography>
            )}
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<Package size={20} />}
            onClick={() => navigate('/products')}
            sx={{ px: 4 }}
          >
            Browse More Products
          </Button>
          
          <Button
            variant="outlined"
            size="large"
            startIcon={<ArrowLeft size={20} />}
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default PaymentSuccess;