import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Calendar.css';
import { 
  collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, where 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar as CalendarIcon, Clock, User, MapPin, Tag, AlertCircle,
  Phone, Mail, Edit2, Trash2, CheckCircle, X, ChevronLeft, ChevronRight
} from 'lucide-react';

const localizer = momentLocalizer(moment);

function CalendarComponent() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [newEvent, setNewEvent] = useState({
    title: '',
    type: 'meeting',
    start: new Date(),
    end: new Date(),
    description: '',
    location: '',
    attendees: [],
    reminder: '15',
    status: 'scheduled'
  });

  const eventTypes = {
    meeting: { color: '#3b82f6', icon: '👥' },
    followup: { color: '#10b981', icon: '📞' },
    deadline: { color: '#ef4444', icon: '⏰' },
    review: { color: '#f59e0b', icon: '📋' },
    personal: { color: '#8b5cf6', icon: '🏠' },
    other: { color: '#6b7280', icon: '📌' }
  };

  // Load events from Firebase
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'calendar_events'),
      where('userId', '==', user.uid),
      orderBy('start', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          start: data.start?.toDate ? data.start.toDate() : new Date(data.start),
          end: data.end?.toDate ? data.end.toDate() : new Date(data.end)
        };
      });
      setEvents(eventsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching events:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleSelectSlot = (slotInfo) => {
    setNewEvent({
      ...newEvent,
      start: slotInfo.start,
      end: slotInfo.end || moment(slotInfo.start).add(1, 'hour').toDate()
    });
    setShowModal(true);
  };

  const saveEvent = async () => {
    if (!newEvent.title) {
      alert('Please enter an event title');
      return;
    }

    try {
      const eventData = {
        ...newEvent,
        userId: user.uid,
        createdBy: user.email,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await addDoc(collection(db, 'calendar_events'), eventData);
      setShowModal(false);
      setNewEvent({
        title: '',
        type: 'meeting',
        start: new Date(),
        end: new Date(),
        description: '',
        location: '',
        attendees: [],
        reminder: '15',
        status: 'scheduled'
      });
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Failed to save event');
    }
  };

  const updateEvent = async (eventId, updates) => {
    try {
      await updateDoc(doc(db, 'calendar_events', eventId), {
        ...updates,
        updatedAt: new Date()
      });
      setShowEventModal(false);
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const deleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteDoc(doc(db, 'calendar_events', eventId));
        setShowEventModal(false);
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  const filteredEvents = filterType === 'all' 
    ? events 
    : events.filter(event => event.type === filterType);

  const eventStyleGetter = (event) => {
    const typeInfo = eventTypes[event.type] || eventTypes.other;
    return {
      style: {
        backgroundColor: typeInfo.color,
        border: 'none',
        borderRadius: '4px',
        fontSize: '12px',
        padding: '2px 4px'
      }
    };
  };

  const CustomToolbar = (toolbar) => (
    <div className="flex justify-between items-center mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="flex gap-2">
        <button 
          onClick={() => toolbar.onNavigate('PREV')}
          className="px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button 
          onClick={() => toolbar.onNavigate('TODAY')}
          className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Today
        </button>
        <button 
          onClick={() => toolbar.onNavigate('NEXT')}
          className="px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      
      <span className="text-xl font-semibold text-gray-800 dark:text-white">
        {toolbar.label}
      </span>
      
      <div className="flex gap-2 items-center">
        {['month', 'week', 'day', 'agenda'].map(view => (
          <button
            key={view}
            onClick={() => toolbar.onView(view)}
            className={`px-3 py-1.5 rounded capitalize ${
              toolbar.view === view 
                ? 'bg-blue-600 text-white' 
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
          >
            {view}
          </button>
        ))}
        <button
          onClick={() => toolbar.openModal()}
          className="ml-2 px-4 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
        >
          <CalendarIcon className="w-4 h-4" />
          New Event
        </button>
      </div>
    </div>
  );

  const getUpcomingEvents = () => {
    const now = new Date();
    return events
      .filter(event => event.start > now)
      .sort((a, b) => a.start - b.start)
      .slice(0, 5);
  };

  const getEventStats = () => {
    const now = new Date();
    const thisWeek = moment().endOf('week').toDate();
    const thisMonth = moment().endOf('month').toDate();
    
    return {
      total: events.length,
      thisWeek: events.filter(e => e.start <= thisWeek && e.start >= now).length,
      thisMonth: events.filter(e => e.start <= thisMonth && e.start >= now).length,
      overdue: events.filter(e => e.start < now && e.status !== 'completed').length
    };
  };

  const stats = getEventStats();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex gap-6 p-6 h-screen bg-gray-50 dark:bg-gray-900">
      {/* Enhanced Sidebar */}
      <div className="w-80 space-y-4 overflow-y-auto">
        {/* Stats Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <h3 className="font-bold text-lg mb-3 text-gray-800 dark:text-white">Overview</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Total Events</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.thisWeek}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">This Week</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.thisMonth}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">This Month</div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.overdue}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Overdue</div>
            </div>
          </div>
        </div>

        {/* Event Type Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <h3 className="font-bold text-lg mb-3 text-gray-800 dark:text-white">Filter Events</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="filter" 
                checked={filterType === 'all'}
                onChange={() => setFilterType('all')}
                className="rounded text-blue-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">All Events</span>
            </label>
            {Object.entries(eventTypes).map(([type, info]) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="filter"
                  checked={filterType === type}
                  onChange={() => setFilterType(type)}
                  className="rounded text-blue-600"
                />
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: info.color }}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                  {type} {info.icon}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <h3 className="font-bold text-lg mb-3 text-gray-800 dark:text-white">Upcoming Events</h3>
          <div className="space-y-3">
            {getUpcomingEvents().length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No upcoming events</p>
            ) : (
              getUpcomingEvents().map(event => (
                <div 
                  key={event.id} 
                  className="border-l-3 pl-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded p-2"
                  style={{ borderLeftColor: eventTypes[event.type]?.color || '#6b7280' }}
                  onClick={() => handleSelectEvent(event)}
                >
                  <div className="font-medium text-sm text-gray-800 dark:text-white">
                    {event.title}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    {moment(event.start).format('MMM DD, h:mm A')}
                  </div>
                  {event.location && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {event.location}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <h3 className="font-bold text-lg mb-3 text-gray-800 dark:text-white">Quick Actions</h3>
          <div className="space-y-2">
            <button 
              onClick={() => setShowModal(true)}
              className="w-full px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            >
              + New Event
            </button>
            <button className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
              Import Calendar
            </button>
            <button className="w-full px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm">
              Export Events
            </button>
          </div>
        </div>
      </div>

      {/* Main Calendar */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div style={{ height: 'calc(100vh - 8rem)' }}>
          <Calendar
            localizer={localizer}
            events={filteredEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            eventPropGetter={eventStyleGetter}
            views={['month', 'week', 'day', 'agenda']}
            defaultView='month'
            components={{
              toolbar: (props) => <CustomToolbar {...props} openModal={() => setShowModal(true)} />
            }}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
          />
        </div>
      </div>

      {/* Create Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-[500px] max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Create New Event</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Event Title *
                </label>
                <input 
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                  placeholder="Enter event title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Event Type
                  </label>
                  <select 
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
                  >
                    {Object.keys(eventTypes).map(type => (
                      <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Reminder
                  </label>
                  <select 
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                    value={newEvent.reminder}
                    onChange={(e) => setNewEvent({...newEvent, reminder: e.target.value})}
                  >
                    <option value="0">No reminder</option>
                    <option value="5">5 minutes before</option>
                    <option value="15">15 minutes before</option>
                    <option value="30">30 minutes before</option>
                    <option value="60">1 hour before</option>
                    <option value="1440">1 day before</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location
                </label>
                <input 
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                  placeholder="Add location (optional)"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea 
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                  rows="3"
                  placeholder="Add description (optional)"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Time
                  </label>
                  <div className="text-sm text-gray-600 dark:text-gray-400 p-2 border border-gray-300 dark:border-gray-600 rounded">
                    {moment(newEvent.start).format('MMM DD, YYYY h:mm A')}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Time
                  </label>
                  <div className="text-sm text-gray-600 dark:text-gray-400 p-2 border border-gray-300 dark:border-gray-600 rounded">
                    {moment(newEvent.end).format('MMM DD, YYYY h:mm A')}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={saveEvent}
              >
                Save Event
              </button>
              <button 
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View/Edit Event Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-[500px]">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Event Details</h2>
              <button
                onClick={() => setShowEventModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{selectedEvent.title}</h3>
                <span className={`inline-block px-2 py-1 rounded text-xs text-white mt-2`}
                  style={{ backgroundColor: eventTypes[selectedEvent.type]?.color || '#6b7280' }}>
                  {selectedEvent.type}
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>
                    {moment(selectedEvent.start).format('MMM DD, YYYY h:mm A')} - 
                    {moment(selectedEvent.end).format('h:mm A')}
                  </span>
                </div>
                
                {selectedEvent.location && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedEvent.location}</span>
                  </div>
                )}
                
                {selectedEvent.description && (
                  <div className="text-gray-600 dark:text-gray-400 mt-3">
                    <p className="font-medium mb-1">Description:</p>
                    <p>{selectedEvent.description}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => updateEvent(selectedEvent.id, { status: 'completed' })}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Mark Complete
              </button>
              <button
                onClick={() => deleteEvent(selectedEvent.id)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
              <button
                onClick={() => setShowEventModal(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CalendarComponent;