import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getInitialSkin, persistSkin, SKINS, ROLE_ALLOWLIST } from "./skinRegistry";
import { applyTheme } from "./applyTheme";

function getCurrentRole() { return localStorage.getItem("mcc_role") || "agent"; }
function persistRole(role) {
  try {
    localStorage.setItem("mcc_role", role);
    // Also update scr.role for backwards compatibility
    localStorage.setItem("scr.role", role);
  } catch {}
}

const SkinCtx = createContext({ skin:"generic", role:"agent", allowed:["generic"], setSkin:()=>{}, setRole:()=>{} });

export function SkinProvider({ children }) {
  const [role, setRoleState] = useState(getCurrentRole());
  const [skin, setSkinState] = useState(getInitialSkin());
  const allowed = ROLE_ALLOWLIST[role] || ["generic"];

  useEffect(() => {
    if (!allowed.includes(skin)) { setSkinState(allowed[0]); persistSkin(allowed[0]); }
  }, [role, allowed, skin]); // enforce when role changes

  useEffect(() => {
    document.documentElement.setAttribute("data-skin", skin);
    applyTheme(skin);
  }, [skin]);

  const api = useMemo(() => ({
    skin, role, allowed,
    setSkin: (id) => { if (!SKINS[id]) return; if (!allowed.includes(id)) return; setSkinState(id); persistSkin(id); },
    setRole: (newRole) => {
      if (!ROLE_ALLOWLIST[newRole]) return;
      setRoleState(newRole);
      persistRole(newRole);
      // Trigger re-render by reloading the page to update all components
      window.location.reload();
    }
  }), [skin, role, allowed]);

  return <SkinCtx.Provider value={api}>{children}</SkinCtx.Provider>;
}
export const useSkin = () => useContext(SkinCtx);
