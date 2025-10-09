import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [urgentCount, setUrgentCount] = useState(0);
  const [permission, setPermission] = useState('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(setPermission);
      }
    }
  }, []);

  // Real-time urgent contact monitoring
  useEffect(() => {
    let unsub = null;
    async function subscribeUrgentContacts() {
  const { collection, query, where, onSnapshot } = await import('firebase/firestore');
  const { db } = await import('../lib/firebase');
      const now = new Date();
      const q = query(
        collection(db, 'contacts'),
        where('responseRequiredBy', '<=', now.toISOString())
      );
      unsub = onSnapshot(q, (snap) => {
        const urgentContacts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setNotifications(urgentContacts);
        setUrgentCount(urgentContacts.length);
        // Send browser notifications for new urgent contacts
        urgentContacts.forEach(contact => {
          if (permission === 'granted' && contact.responseRequiredBy) {
            const timeLeft = Math.floor((new Date(contact.responseRequiredBy) - new Date()) / 60000);
            if (timeLeft < 5) {
              const title = `Urgent: ${contact.firstName} ${contact.lastName}`;
              const body = `${contact.source} needs response in ${timeLeft} min.`;
              const notif = new Notification(title, { body });
              notif.onclick = () => window.location.href = `/contacts/${contact.id}`;
            }
          }
        });
      });
    }
    subscribeUrgentContacts();
    const interval = setInterval(() => subscribeUrgentContacts(), 30000);
    return () => { if (unsub) unsub(); clearInterval(interval); };
  }, [permission]);

  // Send browser notification (manual)
  const sendNotification = (title, body, onClick) => {
    if (permission === 'granted' && 'Notification' in window) {
      const notif = new Notification(title, { body });
      if (onClick) {
        notif.onclick = onClick;
      }
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, urgentCount, sendNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};
