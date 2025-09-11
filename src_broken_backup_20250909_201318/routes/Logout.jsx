import { useEffect } from "react";
import { auth } from "../lib/firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
export default function Logout() {
  const nav = useNavigate();
  useEffect(() => { (async () => { await signOut(auth); nav("/login",{replace:true}); })(); }, [nav]);
  return <div style={{padding:24}}>Signing out…</div>;
}
