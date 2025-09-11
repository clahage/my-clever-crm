// src/services/firestore/leads.js
import { db } from "@/lib/firebase";
import { collection, writeBatch, serverTimestamp } from "firebase/firestore";

export async function importLeadsFromCsv(rows) {
  let inserted = 0, failed = 0, errors = [];
  const batchSize = 400;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = writeBatch(db);
    for (let j = i; j < Math.min(i + batchSize, rows.length); ++j) {
      const r = rows[j];
      if (!r.name && !r.email && !r.phone) {
        failed++;
        errors.push({ rowIndex: j, reason: "Missing name/email/phone" });
        continue;
      }
      const docRef = collection(db, "leads");
      batch.set(docRef, {
        ...r,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      inserted++;
    }
    try {
      await batch.commit();
    } catch (e) {
      failed += Math.min(batchSize, rows.length - i);
      errors.push({ rowIndex: i, reason: e.message });
    }
  }
  return { inserted, failed, errors };
}
