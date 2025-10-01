// usePermission.js - Fixed version with correct imports
import { useAuth } from "./contexts/AuthContext";
import { useMemo } from "react";

export const usePermission = () => {
  const { user, userProfile, loading } = useAuth();

  // Admin email detection
  const adminEmails = ["chris@speedycreditrepair.com", "clahage@gmail.com"];
  const normalizedUserEmail = (user?.email || "").toLowerCase();
  const normalizedProfileEmail = (userProfile?.email || "").toLowerCase();

  const authState = useMemo(() => {
    const isAuthenticated = !!user && !user.isAnonymous;
    const isMasterAdmin = 
      adminEmails.includes(normalizedUserEmail) || 
      adminEmails.includes(normalizedProfileEmail) ||
      userProfile?.role === "masterAdmin" ||
      userProfile?.role === "admin";

    return {
      isAuthenticated,
      isMasterAdmin,
      hasFeatureAccess: (feature) => {
        // If loading, return false to prevent premature access
        if (loading) return false;
        
        // Master admins have access to everything
        if (isMasterAdmin) return true;
        
        // Check if user is authenticated
        if (!isAuthenticated) return false;
        
        // Check user's allowed features
        const allowedFeatures = userProfile?.allowedFeatures || [];
        return allowedFeatures.includes(feature);
      },
      loading
    };
  }, [user, userProfile, normalizedUserEmail, normalizedProfileEmail, loading]);

  return authState;
};

export default usePermission;