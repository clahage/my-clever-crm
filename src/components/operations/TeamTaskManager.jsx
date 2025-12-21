import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
  CircularProgress,
  Badge,
  Tooltip,
  Divider,
  Fab,
  useTheme,
  alpha
} from '@mui/material';
import {
  Add as AddIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
  Flag as FlagIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Comment as CommentIcon,
  AttachFile as AttachIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  PlayArrow as StartIcon,
  Done as DoneIcon
} from '@mui/icons-material';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'default', icon: '🟢' },
  { value: 'medium', label: 'Medium', color: 'info', icon: '🔵' },
  { value: 'high', label: 'High', color: 'warning', icon: '🟠' },
  { value: 'urgent', label: 'Urgent', color: 'error', icon: '🔴' }
];

const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'dispute', label: 'Dispute Follow-up' },
  { value: 'communication', label: 'Client Communication' },
  { value: 'follow_up', label: 'Follow-up' },
  { value: 'document', label: 'Document Request' },
  { value: 'auto_lead', label: 'Auto Lead' }
];

const STATUSES = [
  { value: 'pending', label: 'Pending', color: 'default' },
  { value: 'in_progress', label: 'In Progress', color: 'primary' },
  { value: 'completed', label: 'Completed', color: 'success' },
  { value: 'cancelled', label: 'Cancelled', color: 'error' }
];

function TaskCard({ task, onUpdate, onComment }) {
  const theme = useTheme();
  const priority = PRIORITIES.find(p => p.value === task.priority);
  const status = STATUSES.find(s => s.value === task.status);
  const isOverdue = task.dueDate && new Date(task.dueDate.toDate?.() || task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <Card
      sx={{
        mb: 2,
        borderLeft: 4,
        borderColor: priority?.color ? `${priority.color}.main` : 'grey.300',
        bgcolor: isOverdue ? alpha(theme.palette.error.main, 0.05) : 'background.paper'
      }}
    >
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              {task.title}
            </Typography>
            {task.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {task.description}
              </Typography>
            )}
          </Box>
          <Chip
            size="small"
            label={status?.label}
            color={status?.color}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
          <Chip
            size="small"
            label={`${priority?.icon} ${priority?.label}`}
            variant="outlined"
          />
          <Chip
            size="small"
            label={CATEGORIES.find(c => c.value === task.category)?.label || task.category}
            variant="outlined"
          />
          {isOverdue && (
            <Chip
              size="small"
              icon={<WarningIcon />}
              label="Overdue"
              color="error"
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {task.dueDate && (
              <Typography variant="caption" color={isOverdue ? 'error' : 'text.secondary'}>
                <ScheduleIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                {new Date(task.dueDate.toDate?.() || task.dueDate).toLocaleDateString()}
              </Typography>
            )}
            {task.comments?.length > 0 && (
              <Typography variant="caption" color="text.secondary">
                <CommentIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                {task.comments.length}
              </Typography>
            )}
          </Box>

          <Box>
            {task.status === 'pending' && (
              <Tooltip title="Start Task">
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => onUpdate(task.id, { status: 'in_progress' })}
                >
                  <StartIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {task.status === 'in_progress' && (
              <Tooltip title="Complete Task">
                <IconButton
                  size="small"
                  color="success"
                  onClick={() => onUpdate(task.id, { status: 'completed' })}
                >
                  <DoneIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Add Comment">
              <IconButton size="small" onClick={() => onComment(task)}>
                <CommentIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function CreateTaskDialog({ open, onClose, onCreate }) {
  const [task, setTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'general',
    dueDate: '',
    assignedTo: ''
  });
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!task.title) return;
    setLoading(true);
    await onCreate(task);
    setLoading(false);
    setTask({
      title: '',
      description: '',
      priority: 'medium',
      category: 'general',
      dueDate: '',
      assignedTo: ''
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Task</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Task Title"
              value={task.title}
              onChange={(e) => setTask({ ...task, title: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Description"
              value={task.description}
              onChange={(e) => setTask({ ...task, description: e.target.value })}
            />
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={task.priority}
                label="Priority"
                onChange={(e) => setTask({ ...task, priority: e.target.value })}
              >
                {PRIORITIES.map(p => (
                  <MenuItem key={p.value} value={p.value}>
                    {p.icon} {p.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={task.category}
                label="Category"
                onChange={(e) => setTask({ ...task, category: e.target.value })}
              >
                {CATEGORIES.map(c => (
                  <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              type="date"
              label="Due Date"
              value={task.dueDate}
              onChange={(e) => setTask({ ...task, dueDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleCreate}
          disabled={loading || !task.title}
          startIcon={loading ? <CircularProgress size={16} /> : <AddIcon />}
        >
          Create Task
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function TeamTaskManager() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadTasks();
    loadDashboard();
  }, [statusFilter]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const getTasks = httpsCallable(functions, 'getTasks');
      const result = await getTasks({ status: statusFilter || undefined });
      setTasks(result.data.tasks || []);
    } catch (err) {
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboard = async () => {
    try {
      const getTaskDashboard = httpsCallable(functions, 'getTaskDashboard');
      const result = await getTaskDashboard({});
      setDashboard(result.data);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    }
  };

  const createTask = async (taskData) => {
    try {
      const createTaskFn = httpsCallable(functions, 'createTask');
      await createTaskFn(taskData);
      loadTasks();
      loadDashboard();
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  const updateTask = async (taskId, updates) => {
    try {
      const updateTaskFn = httpsCallable(functions, 'updateTask');
      await updateTaskFn({ taskId, updates });
      loadTasks();
      loadDashboard();
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const addComment = async () => {
    if (!newComment.trim() || !selectedTask) return;
    try {
      const addTaskComment = httpsCallable(functions, 'addTaskComment');
      await addTaskComment({ taskId: selectedTask.id, comment: newComment });
      setNewComment('');
      setCommentDialogOpen(false);
      loadTasks();
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const filterTasksByTab = () => {
    switch (activeTab) {
      case 0: return tasks.filter(t => t.status === 'pending');
      case 1: return tasks.filter(t => t.status === 'in_progress');
      case 2: return tasks.filter(t => t.status === 'completed');
      case 3: return tasks;
      default: return tasks;
    }
  };

  if (loading && !dashboard) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, position: 'relative' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Team Task Manager
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage and track tasks for you and your team
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateOpen(true)}
        >
          New Task
        </Button>
      </Box>

      {/* Dashboard Summary */}
      {dashboard && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} md={2}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="bold" color="text.primary">
                {dashboard.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">Total Active</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} md={2}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.50' }}>
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {dashboard.overdue}
              </Typography>
              <Typography variant="body2" color="text.secondary">Overdue</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} md={2}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.50' }}>
              <Typography variant="h4" fontWeight="bold" color="info.main">
                {dashboard.dueToday}
              </Typography>
              <Typography variant="body2" color="text.secondary">Due Today</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} md={2}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.50' }}>
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                {dashboard.dueThisWeek}
              </Typography>
              <Typography variant="body2" color="text.secondary">This Week</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} md={2}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.50' }}>
              <Typography variant="h4" fontWeight="bold" color="error.main">
                {dashboard.byPriority?.urgent || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">Urgent</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} md={2}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.50' }}>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {dashboard.inProgress}
              </Typography>
              <Typography variant="body2" color="text.secondary">In Progress</Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab
            label={
              <Badge badgeContent={dashboard?.pending || 0} color="default">
                Pending
              </Badge>
            }
          />
          <Tab
            label={
              <Badge badgeContent={dashboard?.inProgress || 0} color="primary">
                In Progress
              </Badge>
            }
          />
          <Tab label="Completed" />
          <Tab label="All Tasks" />
        </Tabs>
      </Paper>

      {/* Overdue Alert */}
      {dashboard?.overdueTasks?.length > 0 && activeTab !== 2 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            {dashboard.overdueTasks.length} Overdue Tasks
          </Typography>
          <Typography variant="body2">
            {dashboard.overdueTasks.slice(0, 3).map(t => t.title).join(', ')}
            {dashboard.overdueTasks.length > 3 && ` and ${dashboard.overdueTasks.length - 3} more...`}
          </Typography>
        </Alert>
      )}

      {/* Task List */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {filterTasksByTab().map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onUpdate={updateTask}
                  onComment={(task) => {
                    setSelectedTask(task);
                    setCommentDialogOpen(true);
                  }}
                />
              ))}
              {filterTasksByTab().length === 0 && (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <CheckIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No tasks in this category
                  </Typography>
                </Paper>
              )}
            </>
          )}
        </Grid>

        {/* Urgent Tasks Sidebar */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              🔥 Urgent & High Priority
            </Typography>
            <List dense>
              {dashboard?.urgentTasks?.slice(0, 5).map(task => (
                <ListItem key={task.id} disableGutters>
                  <ListItemAvatar>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: task.priority === 'urgent' ? 'error.main' : 'warning.main' }}>
                      <FlagIcon fontSize="small" />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={task.title}
                    secondary={task.dueDate ? `Due: ${new Date(task.dueDate.toDate?.() || task.dueDate).toLocaleDateString()}` : 'No due date'}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
              ))}
              {(!dashboard?.urgentTasks || dashboard.urgentTasks.length === 0) && (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                  No urgent tasks 🎉
                </Typography>
              )}
            </List>
          </Paper>

          <Paper sx={{ p: 2, mt: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              📊 By Category
            </Typography>
            {dashboard?.byCategory && Object.entries(dashboard.byCategory).map(([category, count]) => (
              <Box key={category} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">
                  {CATEGORIES.find(c => c.value === category)?.label || category}
                </Typography>
                <Chip size="small" label={count} />
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>

      {/* Create Task Dialog */}
      <CreateTaskDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={createTask}
      />

      {/* Comment Dialog */}
      <Dialog open={commentDialogOpen} onClose={() => setCommentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Comment - {selectedTask?.title}</DialogTitle>
        <DialogContent>
          {selectedTask?.comments?.length > 0 && (
            <List dense sx={{ mb: 2 }}>
              {selectedTask.comments.map((comment, index) => (
                <ListItem key={index} disableGutters>
                  <ListItemAvatar>
                    <Avatar sx={{ width: 28, height: 28 }}>
                      {comment.userName?.charAt(0) || 'U'}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={comment.text}
                    secondary={`${comment.userName} - ${new Date(comment.createdAt).toLocaleString()}`}
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
              ))}
            </List>
          )}
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Your Comment"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={addComment} disabled={!newComment.trim()}>
            Add Comment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Add Button */}
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        onClick={() => setCreateOpen(true)}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
}
