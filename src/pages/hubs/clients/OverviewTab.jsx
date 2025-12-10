// Path: /src/pages/hubs/clients/OverviewTab.jsx
// ============================================================================
// CLIENTS HUB - OVERVIEW TAB
// ============================================================================
// Purpose: Client dashboard with quick actions and key metrics
// Version: 1.0.0
// Last Updated: 2025-12-10
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider
} from '@mui/material';
import {
  Users,
  UserPlus,
  TrendingUp,
  Calendar,
  CheckCircle,
  AlertCircle,
  Activity,
  DollarSign,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';

const OverviewTab = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    newThisMonth: 0,
    pendingTasks: 0
  });
  const [recentClients, setRecentClients] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);

  useEffect(() => {
    const unsubscribers = [];

    // Subscribe to clients
    const clientsQuery = query(collection(db, 'clients'));
    const unsubClients = onSnapshot(clientsQuery, (snapshot) => {
      const clients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      setStats({
        totalClients: clients.length,
        activeClients: clients.filter(c => c.status === 'active').length,
        newThisMonth: clients.filter(c => {
          const createdAt = c.createdAt?.toDate();
          return createdAt && createdAt >= firstDayOfMonth;
        }).length,
        pendingTasks: 0 // Will be updated by tasks subscription
      });

      // Set recent clients (last 5)
      const sorted = [...clients].sort((a, b) => {
        const dateA = a.createdAt?.toDate() || new Date(0);
        const dateB = b.createdAt?.toDate() || new Date(0);
        return dateB - dateA;
      });
      setRecentClients(sorted.slice(0, 5));

      setLoading(false);
    });
    unsubscribers.push(unsubClients);

    // Subscribe to upcoming appointments
    const appointmentsQuery = query(
      collection(db, 'appointments'),
      where('date', '>=', new Date()),
      orderBy('date', 'asc'),
      limit(5)
    );
    const unsubAppointments = onSnapshot(appointmentsQuery, (snapshot) => {
      const appointments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUpcomingAppointments(appointments);
    });
    unsubscribers.push(unsubAppointments);

    // Subscribe to pending tasks
    const tasksQuery = query(
      collection(db, 'clientTasks'),
      where('status', '==', 'pending')
    );
    const unsubTasks = onSnapshot(tasksQuery, (snapshot) => {
      setStats(prev => ({ ...prev, pendingTasks: snapshot.size }));
    });
    unsubscribers.push(unsubTasks);

    return () => unsubscribers.forEach(unsub => unsub());
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, change }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              {value}
            </Typography>
            {change && (
              <Chip
                label={change}
                size="small"
                color={change.startsWith('+') ? 'success' : 'default'}
                sx={{ height: 20 }}
              />
            )}
          </Box>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: `${color}.50`,
              color: `${color}.main`
            }}
          >
            <Icon size={24} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Clients"
            value={stats.totalClients}
            icon={Users}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Clients"
            value={stats.activeClients}
            icon={Activity}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="New This Month"
            value={stats.newThisMonth}
            icon={UserPlus}
            color="info"
            change={`+${stats.newThisMonth}`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Tasks"
            value={stats.pendingTasks}
            icon={CheckCircle}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<UserPlus size={18} />}
                onClick={() => window.location.hash = 'onboarding'}
              >
                Add New Client
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Calendar size={18} />}
                onClick={() => window.location.hash = 'appointments'}
              >
                Schedule Appointment
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<CheckCircle size={18} />}
                onClick={() => window.location.hash = 'tasks'}
              >
                View Tasks
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<TrendingUp size={18} />}
                onClick={() => window.location.hash = 'progress'}
              >
                Track Progress
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Recent Clients */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Recent Clients
                </Typography>
                <IconButton size="small" onClick={() => window.location.hash = 'list'}>
                  <ArrowRight size={18} />
                </IconButton>
              </Box>
              <List>
                {recentClients.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                    No clients yet
                  </Typography>
                ) : (
                  recentClients.map((client, index) => (
                    <React.Fragment key={client.id}>
                      {index > 0 && <Divider variant="inset" component="li" />}
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>{client.name?.[0] || 'C'}</Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={client.name || 'Unnamed Client'}
                          secondary={
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                              <Chip
                                label={client.status || 'pending'}
                                size="small"
                                color={client.status === 'active' ? 'success' : 'default'}
                                sx={{ height: 20 }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {client.email}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    </React.Fragment>
                  ))
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Appointments */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Upcoming Appointments
                </Typography>
                <IconButton size="small" onClick={() => window.location.hash = 'appointments'}>
                  <ArrowRight size={18} />
                </IconButton>
              </Box>
              <List>
                {upcomingAppointments.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                    No upcoming appointments
                  </Typography>
                ) : (
                  upcomingAppointments.map((appointment, index) => (
                    <React.Fragment key={appointment.id}>
                      {index > 0 && <Divider variant="inset" component="li" />}
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <Calendar size={20} />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={appointment.title || 'Appointment'}
                          secondary={
                            <Box>
                              <Typography variant="caption" display="block">
                                {appointment.date?.toDate().toLocaleDateString()}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {appointment.clientName}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    </React.Fragment>
                  ))
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OverviewTab;
