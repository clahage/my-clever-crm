import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useAuth } from "@/contexts/AuthContext";

const defaultWidgets = [
  { id: "leads", label: "Total Leads" },
  { id: "clients", label: "Total Clients" },
  { id: "revenue", label: "Revenue" },
  { id: "campaigns", label: "Active Campaigns" },
  { id: "calendar", label: "Calendar" },
  { id: "analytics", label: "Analytics" },
];

const DashboardCustomizer = ({ children, widgetComponents }) => {
  const { db, user, userId } = useAuth();
  const [widgets, setWidgets] = useState([]);
  const [visible, setVisible] = useState({});
  const [allowed, setAllowed] = useState(null);
  const isAdmin = user?.role === 'admin';

  // Fetch allowed widgets from Firestore
  useEffect(() => {
    if (!db || !userId) return;
    let unsub;
    (async () => {
      const { doc, onSnapshot } = await import('firebase/firestore');
      unsub = onSnapshot(doc(db, 'users', userId), (docSnap) => {
        setAllowed(docSnap.exists() ? docSnap.data().allowedWidgets : null);
      });
    })();
    return () => unsub && unsub();
  }, [db, userId]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("dashboardLayout"));
    if (saved) {
      setWidgets(saved.widgets);
      setVisible(saved.visible);
    } else {
      setWidgets(defaultWidgets);
      setVisible(Object.fromEntries(defaultWidgets.map(w => [w.id, true])));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("dashboardLayout", JSON.stringify({ widgets, visible }));
  }, [widgets, visible]);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(widgets);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setWidgets(reordered);
  };

  // Only show toggles for widgets allowed by admin (or all if admin)
  const toggleableWidgets = isAdmin ? widgets : widgets.filter(w => !allowed || allowed.includes(w.id));

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-4">
        {toggleableWidgets.map(w => (
          <label key={w.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={visible[w.id]}
              onChange={e => setVisible(v => ({ ...v, [w.id]: e.target.checked }))}
              disabled={!isAdmin && allowed && !allowed.includes(w.id)}
            />
            {w.label}
          </label>
        ))}
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="dashboard-widgets" direction="horizontal">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-wrap gap-8 mb-12">
              {widgets.map((w, i) =>
                visible[w.id] && widgetComponents[w.id] ? (
                  <Draggable key={w.id} draggableId={w.id} index={i}>
                    {(prov) => (
                      <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps}>
                        {widgetComponents[w.id]()}
                      </div>
                    )}
                  </Draggable>
                ) : null
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default DashboardCustomizer;
