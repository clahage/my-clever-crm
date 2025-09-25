import GenericDashboard from './generic/GenericDashboard';

export const SKINS = {
  speedy:  { label: "Speedy (Branded)",  type: "brand"   },
  generic: { label: "Generic (White-label)", type: "brand", component: GenericDashboard },
  alt1:    { label: "Alt 1",             type: "alt"     },
  alt2:    { label: "Alt 2",             type: "alt"     },
};

export const DEFAULT_SKIN = "speedy";
const STORE_KEY = "mcc_skin";

export const ROLE_ALLOWLIST = {
  admin:  ["speedy","generic","alt1","alt2"],
  agent:  ["generic"],
  viewer: ["generic"],
};

export function getInitialSkin() {
  if (typeof window !== "undefined") {
    const q = new URLSearchParams(window.location.search).get("skin");
    if (q && SKINS[q]) return q;
  }
  try { 
    const saved = localStorage.getItem(STORE_KEY); 
    if (saved && SKINS[saved]) return saved; 
  } catch { /* TODO: register additional skins here when available */ }
  return DEFAULT_SKIN;
}
export function persistSkin(id){ try{ localStorage.setItem(STORE_KEY,id);}catch{/* TODO: handle localStorage error */} }
