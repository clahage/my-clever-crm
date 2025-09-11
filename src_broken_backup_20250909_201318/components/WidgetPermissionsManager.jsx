import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const ALL_WIDGETS = [
  { id: "leads", label: "Total Leads" },
  { id: "clients", label: "Total Clients" },
  { id: "revenue", label: "Revenue" },
  { id: "campaigns", label: "Active Campaigns" },
  { id: "calendar", label: "Calendar" },
  { id: "analytics", label: "Analytics" },
];

const WidgetPermissionsManager = () => {
  const { db } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editUserId, setEditUserId] = useState(null);
  const [editUserData, setEditUserData] = useState({});
  const [newUserData, setNewUserData] = useState({});
  const [addingUser, setAddingUser] = useState(false);

  useEffect(() => {
    if (!db) return;
    let unsub;
    (async () => {
      try {
        const { collection, onSnapshot } = await import("firebase/firestore");
        unsub = onSnapshot(collection(db, "users"), (snapshot) => {
          setUsers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
          setLoading(false);
        });
      } catch (err) {
        setError("Failed to load users");
        setLoading(false);
      }
    })();
    return () => unsub && unsub();
  }, [db]);

  const handleWidgetToggle = async (uid, widgetId, allowed) => {
    if (!db) return;
    try {
      const { doc, updateDoc, arrayUnion, arrayRemove } = await import("firebase/firestore");
      const userDoc = doc(db, "users", uid);
      await updateDoc(userDoc, {
        allowedWidgets: allowed ? arrayUnion(widgetId) : arrayRemove(widgetId),
      });
    } catch (err) {
      alert("Failed to update widget permissions");
    }
  };

  const handleEditClick = (user) => {
    setEditUserId(user.id);
    setEditUserData(user);
  };

  const handleEditChange = (field, value) => {
    setEditUserData(prev => ({ ...prev, [field]: value }));
  };

  const handleEditSave = async (id) => {
    if (!db) return;
    try {
      const { doc, updateDoc } = await import("firebase/firestore");
      const userDoc = doc(db, "users", id);
      await updateDoc(userDoc, editUserData);
      setEditUserId(null);
      setEditUserData({});
    } catch (err) {
      alert("Failed to update user details");
    }
  };

  const handleEditCancel = () => {
    setEditUserId(null);
    setEditUserData({});
  };

  const handleAddUserChange = (field, value) => {
    setNewUserData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddUser = async () => {
    if (!db) return;
    try {
      const { collection, addDoc } = await import("firebase/firestore");
      await addDoc(collection(db, "users"), newUserData);
      setNewUserData({});
      setAddingUser(false);
    } catch (err) {
      alert("Failed to add user");
    }
  };

  if (loading) return <div>Loading users...</div>;
  if (error) return <div>{error}</div>;

  // Display all user fields for easier testing
  let userFieldKeys = Array.from(
    users.reduce((set, u) => {
      Object.keys(u).forEach(k => set.add(k));
      return set;
    }, new Set())
  ).filter(k => k !== "allowedWidgets" && k !== "id");
  // Ensure 'role', 'canAccessPortal', 'canAccessDisputes' are always present for editing/adding
  ["role", "canAccessPortal", "canAccessDisputes"].forEach(field => {
    if (!userFieldKeys.includes(field)) userFieldKeys.push(field);
  });

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Widget Permissions Manager</h2>
      <button className="mb-2 px-3 py-1 bg-blue-600 text-white rounded" onClick={() => setAddingUser(true)} disabled={addingUser}>Add User</button>
      {addingUser && (
        <div className="mb-4 p-2 border rounded bg-gray-50 dark:bg-gray-800">
          <h3 className="font-semibold mb-2">Add New User</h3>
          {userFieldKeys.map(field => (
            field === 'role' ? (
              <select
                key={field}
                className="border px-2 py-1 m-1"
                value={newUserData[field] || ''}
                onChange={e => handleAddUserChange(field, e.target.value)}
              >
                <option value="">Select role</option>
                <option value="admin">admin</option>
                <option value="user">user</option>
                <option value="client">client</option>
              </select>
            ) : field === 'canAccessPortal' || field === 'canAccessDisputes' ? (
              <label key={field} className="inline-flex items-center m-1">
                <input
                  type="checkbox"
                  className="mr-1"
                  checked={!!newUserData[field]}
                  onChange={e => handleAddUserChange(field, e.target.checked)}
                />
                {field}
              </label>
            ) : (
              <input
                key={field}
                className="border px-2 py-1 m-1"
                placeholder={field}
                value={newUserData[field] || ''}
                onChange={e => handleAddUserChange(field, e.target.value)}
              />
            )
          ))}
          <button className="ml-2 px-2 py-1 bg-green-600 text-white rounded" onClick={handleAddUser}>Save</button>
          <button className="ml-2 px-2 py-1 bg-gray-400 text-white rounded" onClick={() => setAddingUser(false)}>Cancel</button>
        </div>
      )}
      <table className="min-w-full border text-xs">
        <thead>
          <tr>
            {userFieldKeys.map(field => (
              <th key={field} className="border px-2 py-1 whitespace-nowrap max-w-xs overflow-x-auto">{field}</th>
            ))}
            {ALL_WIDGETS.map(w => (
              <th key={w.id} className="border px-2 py-1">{w.label}</th>
            ))}
            <th className="border px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              {userFieldKeys.map(field => (
                <td key={field} className="border px-2 py-1 whitespace-nowrap max-w-xs overflow-x-auto" title={u[field] || ''}>
                  {editUserId === u.id ? (
                    field === 'role' ? (
                      <select
                        className="border px-1 py-0.5 w-full"
                        value={editUserData[field] || ''}
                        onChange={e => handleEditChange(field, e.target.value)}
                      >
                        <option value="">Select role</option>
                        <option value="admin">admin</option>
                        <option value="user">user</option>
                        <option value="client">client</option>
                      </select>
                    ) : field === 'canAccessPortal' || field === 'canAccessDisputes' ? (
                      <input
                        type="checkbox"
                        className="mr-1"
                        checked={!!editUserData[field]}
                        onChange={e => handleEditChange(field, e.target.checked)}
                      />
                    ) : (
                      <input
                        className="border px-1 py-0.5 w-full"
                        value={editUserData[field] || ''}
                        onChange={e => handleEditChange(field, e.target.value)}
                      />
                    )
                  ) : (
                    field === 'canAccessPortal' || field === 'canAccessDisputes' ? (
                      <input
                        type="checkbox"
                        className="mr-1"
                        checked={!!u[field]}
                        disabled
                      />
                    ) : (
                      u[field] || <span className="text-gray-400 italic">(none)</span>
                    )
                  )}
                </td>
              ))}
              {ALL_WIDGETS.map(w => (
                <td key={w.id} className="border px-2 py-1 text-center">
                  <input
                    type="checkbox"
                    checked={u.allowedWidgets?.includes(w.id) ?? true}
                    onChange={e => handleWidgetToggle(u.id, w.id, e.target.checked)}
                  />
                </td>
              ))}
              <td className="border px-2 py-1">
                {editUserId === u.id ? (
                  <>
                    <button className="px-2 py-1 bg-green-600 text-white rounded" onClick={() => handleEditSave(u.id)}>Save</button>
                    <button className="ml-2 px-2 py-1 bg-gray-400 text-white rounded" onClick={handleEditCancel}>Cancel</button>
                  </>
                ) : (
                  <button className="px-2 py-1 bg-blue-600 text-white rounded" onClick={() => handleEditClick(u)}>Edit</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WidgetPermissionsManager;
