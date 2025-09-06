import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "@/lib/firebase";

export async function setClaimsForUser({ email, claims }) {
  const fn = httpsCallable(getFunctions(app), "setUserClaims");
  const res = await fn({ email, claims });
  return res.data;
}
