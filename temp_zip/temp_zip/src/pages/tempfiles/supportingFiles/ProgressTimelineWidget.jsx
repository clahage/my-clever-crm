// ============================================
// PROGRESS TIMELINE WIDGET
// Path: /src/components/widgets/ProgressTimelineWidget.jsx
// ============================================
// Visual timeline of client's credit journey
// Shows milestones, events, and achievements
// ============================================

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
} from '@mui/material';
import {
  CheckCircle,
  TrendingUp,
  FileText,
  Mail,
  Award,
  Calendar,
  DollarSign,
  Users,
  Star,
} from 'lucide-react';

// ============================================
// CONSTANTS
// ============================================

const EVENT_TYPES = {
  enrollment: { 
    icon: Users, 
    color: '#3b82f6', 
    label: 'Enrolled' 
  },
  scoreImprovement: { 
    icon: TrendingUp, 
    color: '#10b981', 
    label: 'Score Improved' 
  },
  disputeSent: { 
    icon: Mail, 
    color: '#8b5cf6', 
    label: 'Dispute Sent' 
  },
  disputeResolved: { 
    icon: CheckCircle, 
    color: '#10b981', 
    label: 'Dispute Resolved' 
  },
  documentUploaded: { 
    icon: FileText, 
    color: '#6b7280', 
    label: 'Document Uploaded' 
  },
  payment: { 
    icon: DollarSign, 
    color: '#f59e0b', 
    label: 'Payment Made' 
  },
  milestone: { 
    icon: Award, 
    color: '#ec4899', 
    label: 'Milestone Reached' 
  },
  appointment: { 
    icon: Calendar, 
    color: '#3b82f6', 
    label: 'Appointment' 
  },
  achievement: { 
    icon: Star, 
    color: '#eab308', 
    label: 'Achievement Unlocked' 
  },
};

// ============================================
// MAIN COMPONENT
// ============================================

const ProgressTimelineWidget = ({ 
  events = [], 
  maxEvents = 10,
  compact = false,
}) => {
  const sortedEvents = [...events]
    .sort((a, b) => {
      const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
      const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
      return dateB - dateA; // Most recent first
    })
    .slice(0, maxEvents);

  const renderEvent = (event, index) => {
    const eventType = EVENT_TYPES[event.type] || EVENT_TYPES.milestone;
    const EventIcon = eventType.icon;
    const eventDate = event.timestamp?.toDate ? 
      event.timestamp.toDate() : new Date(event.timestamp);
    const isLast = index === sortedEvents.length - 1;

    return (
      <Box key={event.id || index} className="flex gap-3 mb-4">
        {/* Timeline Dot */}
        <Box className="flex flex-col items-center">
          <Box
            className="w-10 h-10 rounded-full flex items-center justify-center"
            sx={{ bgcolor: eventType.color }}
          >
            <EventIcon className="w-5 h-5 text-white" />
          </Box>
          {!isLast && (
            <Box
              className="w-0.5 flex-1 mt-2"
              sx={{ bgcolor: '#e5e7eb', minHeight: '40px' }}
            />
          )}
        </Box>

        {/* Event Content */}
        <Box className="flex-1 pb-4">
          <Box className="flex items-center gap-2 mb-1">
            <Typography variant="body2" className="font-semibold">
              {event.title}
            </Typography>
            {event.important && (
              <Chip label="Important" size="small" color="error" sx={{ height: 20 }} />
            )}
          </Box>
          
          <Typography variant="caption" className="text-gray-600 block mb-2">
            {eventDate.toLocaleDateString()} at {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Typography>

          {event.description && (
            <Typography variant="caption" className="text-gray-600 block mb-2">
              {event.description}
            </Typography>
          )}

          {event.metadata && (
            <Box className="flex gap-2 flex-wrap">
              {event.metadata.bureau && (
                <Chip 
                  label={event.metadata.bureau} 
                  size="small" 
                  sx={{ fontSize: '0.65rem', height: 20 }}
                />
              )}
              {event.metadata.amount && (
                <Chip 
                  label={`$${event.metadata.amount}`}
                  size="small"
                  sx={{ fontSize: '0.65rem', height: 20 }}
                />
              )}
              {event.metadata.scoreChange && (
                <Chip 
                  label={`+${event.metadata.scoreChange} pts`}
                  size="small"
                  color="success"
                  sx={{ fontSize: '0.65rem', height: 20 }}
                />
              )}
            </Box>
          )}
        </Box>
      </Box>
    );
  };

  // ============================================
  // COMPACT VIEW
  // ============================================

  if (compact) {
    return (
      <Card elevation={2}>
        <CardContent>
          <Typography variant="subtitle2" className="font-semibold mb-3">
            Recent Activity
          </Typography>
          <Box className="space-y-2">
            {sortedEvents.slice(0, 5).map((event, index) => {
              const eventType = EVENT_TYPES[event.type] || EVENT_TYPES.milestone;
              const EventIcon = eventType.icon;
              const eventDate = event.timestamp?.toDate ? 
                event.timestamp.toDate() : new Date(event.timestamp);

              return (
                <Box key={event.id || index} className="flex items-center gap-3">
                  <Box
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    sx={{ bgcolor: eventType.color }}
                  >
                    <EventIcon className="w-4 h-4 text-white" />
                  </Box>
                  <Box className="flex-1">
                    <Typography variant="caption" className="font-semibold">
                      {event.title}
                    </Typography>
                    <Typography variant="caption" display="block" className="text-gray-600">
                      {eventDate.toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </CardContent>
      </Card>
    );
  }

  // ============================================
  // FULL VIEW
  // ============================================

  if (sortedEvents.length === 0) {
    return (
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h6" className="font-semibold mb-3">
            Progress Timeline
          </Typography>
          <Box className="text-center py-6">
            <Typography variant="body2" className="text-gray-600">
              Your journey is just beginning! Events will appear here as you progress.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h6" className="font-semibold mb-4">
          Progress Timeline
        </Typography>
        
        <Box>
          {sortedEvents.map((event, index) => renderEvent(event, index))}
        </Box>

        {events.length > maxEvents && (
          <Typography variant="caption" className="text-center block mt-3 text-gray-600">
            Showing {maxEvents} of {events.length} events
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================
// MILESTONE PROGRESS BAR
// ============================================

export const MilestoneProgress = ({ milestones }) => {
  const completedCount = milestones.filter(m => m.completed).length;
  const progress = (completedCount / milestones.length) * 100;

  return (
    <Box>
      <Box className="flex items-center justify-between mb-2">
        <Typography variant="body2" className="font-semibold">
          Milestones Completed
        </Typography>
        <Typography variant="body2" className="text-gray-600">
          {completedCount} / {milestones.length}
        </Typography>
      </Box>
      <Box className="w-full bg-gray-200 rounded-full h-2">
        <Box
          className="bg-green-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </Box>
    </Box>
  );
};

export default ProgressTimelineWidget;