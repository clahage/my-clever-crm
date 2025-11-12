// Goals.jsx - Minimal Working Version
import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  Container 
} from '@mui/material';
import { Target, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Goals = () => {
  const { currentUser } = useAuth();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Target /> Goals & OKRs
        </Typography>
        <Typography color="text.secondary">
          Welcome back, {currentUser?.email || 'User'}
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Goals
              </Typography>
              <Typography variant="h4">12</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                In Progress
              </Typography>
              <Typography variant="h4">8</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Completed
              </Typography>
              <Typography variant="h4">4</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Success Rate
              </Typography>
              <Typography variant="h4">67%</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Area */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">My Goals</Typography>
          <Button variant="contained" startIcon={<Plus />}>
            Add Goal
          </Button>
        </Box>

        {/* Sample Goals */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Q1 Revenue Target
                </Typography>
                <Typography color="text.secondary" paragraph>
                  Achieve $500K in revenue by end of Q1
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="primary">
                    75% Complete
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Due: March 31
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Team Expansion
                </Typography>
                <Typography color="text.secondary" paragraph>
                  Hire 5 new team members for product team
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="primary">
                    40% Complete
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Due: April 15
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Product Launch
                </Typography>
                <Typography color="text.secondary" paragraph>
                  Launch version 2.0 of the platform
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="warning.main">
                    60% Complete
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Due: February 28
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Customer Satisfaction
                </Typography>
                <Typography color="text.secondary" paragraph>
                  Achieve 95% customer satisfaction score
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="success.main">
                    92% Complete
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Due: March 15
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Coming Soon Notice */}
      <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Full OKR Management Coming Soon
        </Typography>
        <Typography color="text.secondary">
          Advanced goal tracking, key results, team collaboration, and analytics will be available in the next update.
        </Typography>
      </Box>
    </Container>
  );
};

export default Goals;