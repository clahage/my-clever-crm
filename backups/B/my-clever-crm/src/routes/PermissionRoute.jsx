import React from "react";
import { useAuth } from "../authContext";

/**
 * PermissionRoute: Restricts access to children based on user role and a toggle flag.
 * @param {string[]} allowedRoles - Array of allowed roles (e.g., ["admin", "user"])
 * @param {boolean} allowClient - If true, clients can access; otherwise, only staff.
 */
const PermissionRoute = ({ allowedRoles = [], allowClient = false, children }) => {
  const { user } = useAuth();
  if (!user) return null;
  const { role, canAccessPortal, canAccessDisputes } = user;

  // Admin always allowed
  if (role === "admin") return children;

  // For Progress Portal
  if (children.type && children.type.name === "ProgressPortal") {
    if ((allowedRoles.includes(role) && canAccessPortal) || (role === "client" && allowClient && canAccessPortal)) {
      return children;
    }
  }
  // For Dispute Center
  if (children.type && children.type.name === "DisputeCenter") {
    if ((allowedRoles.includes(role) && canAccessDisputes) || (role === "client" && allowClient && canAccessDisputes)) {
      return children;
    }
  }

  // Default: No access
  return (
    <div className="max-w-xl mx-auto py-10 px-4 text-center">
      <h2 className="text-2xl font-bold mb-4 text-red-600">No Access</h2>
      <p className="text-gray-600">You do not have permission to view this page. Please contact your administrator if you believe this is an error.</p>
    </div>
  );
};

export default PermissionRoute;
