const CustomToolbar = (toolbar) => (
  <div className="flex justify-between items-center mb-4">
    <div className="flex gap-2">
      <button 
        onClick={() => toolbar.onNavigate('PREV')}
        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Previous
      </button>
      <button 
        onClick={() => toolbar.onNavigate('TODAY')}
        className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
      >
        Today
      </button>
      <button 
        onClick={() => toolbar.onNavigate('NEXT')}
        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Next
      </button>
    </div>
    <span className="text-xl font-semibold">{toolbar.label}</span>
    <div className="flex gap-2 items-center">
      <button
        onClick={() => toolbar.onView('month')}
        className={`px-3 py-1 rounded ${toolbar.view === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
      >
        Month
      </button>
      <button
        onClick={() => toolbar.onView('week')}
        className={`px-3 py-1 rounded ${toolbar.view === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
      >
        Week
      </button>
      <button
        onClick={() => toolbar.onView('day')}
        className={`px-3 py-1 rounded ${toolbar.view === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
      >
        Day
      </button>
      <button
        onClick={() => toolbar.onView('agenda')}
        className={`px-3 py-1 rounded ${toolbar.view === 'agenda' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
      >
        Agenda
      </button>
      <button
        onClick={() => toolbar.openModal()}
        className="ml-4 px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600"
      >
        + New Event
      </button>
    </div>
  </div>
);
import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import './Calendar.css';

const localizer = momentLocalizer(moment);

function CalendarComponent() {
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    type: 'meeting',
    start: new Date(),
    end: new Date()
  });
  const handleSelectEvent = (event) => {
    alert(`Event: ${event.title}\nType: ${event.type}\nTime: ${moment(event.start).format('MMM DD, h:mm A')}`);
  };

  const handleSelectSlot = (slotInfo) => {
    setNewEvent({
      title: '',
      type: 'meeting',
      start: slotInfo.start,
      end: slotInfo.end || slotInfo.start
    });
    setShowModal(true);
  };
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const [events] = useState([
    {
      id: 1,
      title: 'Client Meeting - John Smith',
      start: new Date(currentYear, currentMonth, 16, 10, 0),
      end: new Date(currentYear, currentMonth, 16, 11, 0),
      type: 'meeting'
    },
    {
      id: 2,
      title: 'Credit Review - Sarah Johnson',
      start: new Date(currentYear, currentMonth, 17, 14, 0),
      end: new Date(currentYear, currentMonth, 17, 15, 0),
      type: 'review'
    },
    {
      id: 3,
      title: 'Follow-up: Mike Williams',
      start: new Date(currentYear, currentMonth, 18, 9, 0),
      end: new Date(currentYear, currentMonth, 18, 9, 30),
      type: 'followup'
    },
    {
      id: 4,
      title: 'Report Deadline',
      start: new Date(currentYear, currentMonth, 19, 17, 0),
      end: new Date(currentYear, currentMonth, 19, 17, 30),
      type: 'deadline'
    },
    {
      id: 5,
      title: 'Team Meeting',
      start: new Date(currentYear, currentMonth, 20, 15, 0),
      end: new Date(currentYear, currentMonth, 20, 16, 0),
      type: 'meeting'
    },
    {
      id: 6,
      title: 'Contract Review - ABC Corp',
      start: new Date(currentYear, currentMonth, 22, 11, 0),
      end: new Date(currentYear, currentMonth, 22, 12, 0),
      type: 'review'
    },
    {
      id: 7,
      title: 'Quarterly Planning',
      start: new Date(currentYear, currentMonth, 23, 9, 0),
      end: new Date(currentYear, currentMonth, 23, 11, 0),
      type: 'meeting'
    },
    {
      id: 8,
      title: 'Client Check-in',
      start: new Date(currentYear, currentMonth, 24, 14, 0),
      end: new Date(currentYear, currentMonth, 24, 14, 30),
      type: 'followup'
    },
    {
      id: 9,
      title: 'Budget Report Due',
      start: new Date(currentYear, currentMonth, 25, 17, 0),
      end: new Date(currentYear, currentMonth, 25, 17, 30),
      type: 'deadline'
    },
    {
      id: 10,
      title: 'Staff Meeting',
      start: new Date(currentYear, currentMonth, 26, 10, 0),
      end: new Date(currentYear, currentMonth, 26, 11, 0),
      type: 'meeting'
    },
    {
      id: 11,
      title: 'Sales Call - XYZ Inc',
      start: new Date(currentYear, currentMonth, 27, 13, 0),
      end: new Date(currentYear, currentMonth, 27, 13, 30),
      type: 'followup'
    },
    {
      id: 12,
      title: 'Compliance Deadline',
      start: new Date(currentYear, currentMonth, 28, 17, 0),
      end: new Date(currentYear, currentMonth, 28, 17, 30),
      type: 'deadline'
    },
    {
      id: 13,
      title: 'Strategy Session',
      start: new Date(currentYear, currentMonth, 29, 10, 0),
      end: new Date(currentYear, currentMonth, 29, 12, 0),
      type: 'meeting'
    },
    {
      id: 14,
      title: 'Client Demo',
      start: new Date(currentYear, currentMonth, 30, 15, 0),
      end: new Date(currentYear, currentMonth, 30, 16, 0),
      type: 'review'
    },
    {
      id: 15,
      title: 'Project Kickoff',
      start: new Date(currentYear, currentMonth, 21, 9, 0),
      end: new Date(currentYear, currentMonth, 21, 10, 0),
      type: 'meeting'
    }
  ]);

  const eventStyleGetter = (event) => {
    const colors = {
      meeting: '#3b82f6',
      followup: '#10b981',
      review: '#f59e0b',
      deadline: '#ef4444'
    };
    return {
      style: {
        backgroundColor: colors[event.type] || '#6b7280',
        border: 'none',
        borderRadius: '4px'
      }
    };
  };

  return (
    <div className="flex gap-6 p-6 h-screen bg-gray-50">
      {/* LEFT SIDEBAR */}
      <div className="w-80 space-y-4 overflow-y-auto">
        {/* Stats Card */}
        <div className="bg-white rounded-lg p-4 shadow">
          <h3 className="font-bold text-lg mb-3">Quick Stats</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 p-3 rounded">
              <div className="text-2xl font-bold text-blue-600">{events.length}</div>
              <div className="text-xs text-gray-600">Total Events</div>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <div className="text-2xl font-bold text-green-600">3</div>
              <div className="text-xs text-gray-600">This Week</div>
            </div>
            <div className="bg-orange-50 p-3 rounded">
              <div className="text-2xl font-bold text-orange-600">2</div>
              <div className="text-xs text-gray-600">Pending</div>
            </div>
            <div className="bg-red-50 p-3 rounded">
              <div className="text-2xl font-bold text-red-600">1</div>
              <div className="text-xs text-gray-600">Overdue</div>
            </div>
          </div>
        </div>
        {/* Mini Calendar */}
        <div className="bg-white rounded-lg p-4 shadow">
          <h3 className="font-bold text-lg mb-3">Quick Navigate</h3>
          <div className="text-xs">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['S','M','T','W','T','F','S'].map(day => (
                <div key={day} className="text-center font-semibold text-gray-600">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {[...Array(31)].map((_, i) => (
                <div 
                  key={i} 
                  className={`text-center p-1 hover:bg-blue-100 cursor-pointer rounded text-xs
                    ${i + 1 === new Date().getDate() ? 'bg-blue-500 text-white' : ''}`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Upcoming Events */}
        <div className="bg-white rounded-lg p-4 shadow">
          <h3 className="font-bold text-lg mb-3">Upcoming Events</h3>
          <div className="space-y-3">
            {events.slice(0, 4).map(event => (
              <div key={event.id} className="border-l-3 border-blue-500 pl-3">
                <div className="font-medium text-sm">{event.title}</div>
                <div className="text-xs text-gray-500">
                  {moment(event.start).format('MMM DD, h:mm A')}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Event Type Legend with Filters */}
        <div className="bg-white rounded-lg p-4 shadow">
          <h3 className="font-bold text-lg mb-3">Event Filters</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded" />
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-sm">Meetings</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded" />
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-sm">Follow-ups</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded" />
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-sm">Deadlines</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded" />
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span className="text-sm">Reviews</span>
            </label>
          </div>
        </div>
        {/* Quick Actions */}
        <div className="bg-white rounded-lg p-4 shadow">
          <h3 className="font-bold text-lg mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm">
              + New Event
            </button>
            <button className="w-full px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm">
              Export Calendar
            </button>
            <button className="w-full px-3 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 text-sm">
              Sync Google
            </button>
          </div>
        </div>
      </div>
      {/* MAIN CALENDAR - Keep existing calendar code */}
      <div className="flex-1 bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Calendar</h1>
        <div className="mb-4">
          <input 
            type="text"
            placeholder="Search events..."
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>
        <div style={{ height: 'calc(100% - 100px)' }}>
          <Calendar
            localizer={localizer}
            events={events}
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
        {/* Event Creation Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h2 className="text-xl font-bold mb-4">New Event</h2>
              <input 
                className="w-full p-2 border rounded mb-3"
                placeholder="Event Title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
              />
              <select 
                className="w-full p-2 border rounded mb-3"
                value={newEvent.type}
                onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
              >
                <option value="meeting">Meeting</option>
                <option value="followup">Follow-up</option>
                <option value="deadline">Deadline</option>
                <option value="review">Review</option>
              </select>
              <div className="text-sm text-gray-600 mb-3">
                Start: {moment(newEvent.start).format('MMM DD, h:mm A')}
              </div>
              <div className="flex gap-2">
                <button 
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() => {
                    if (newEvent.title) {
                      // In real app, would save to database
                      console.log('Would save event:', newEvent);
                      setShowModal(false);
                    }
                  }}
                >
                  Save Event
                </button>
                <button 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CalendarComponent;