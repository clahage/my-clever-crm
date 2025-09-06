import { useEffect, useState, useCallback } from "react";
import { collection, query, where, orderBy, onSnapshot, addDoc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function useFirestore(collectionName, options = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);
    try {
      let ref = collection(db, collectionName);
      let q = ref;
      if (options.whereConditions) {
        options.whereConditions.forEach(cond => {
          q = query(q, where(cond.field, cond.operator, cond.value));
        });
      }
      if (options.orderByField) {
        q = query(q, orderBy(options.orderByField, options.orderDirection || "asc"));
      }
      if (options.realtime) {
        return onSnapshot(q, (snapshot) => {
          setData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          setLoading(false);
        }, (err) => {
          setError(err.message);
          setLoading(false);
        });
      } else {
        getDocs(q).then(snapshot => {
          setData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          setLoading(false);
        }).catch(err => {
          setError(err.message);
          setLoading(false);
        });
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [collectionName, JSON.stringify(options)]);

  useEffect(() => {
    let unsub;
    if (options.realtime) {
      unsub = fetchData();
      return () => unsub && unsub();
    } else {
      fetchData();
    }
  }, [fetchData, options.realtime]);

  const add = async (doc) => {
    try {
      await addDoc(collection(db, collectionName), {
        ...doc,
        createdAt: new Date()
      });
      if (!options.realtime) fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  return { data, loading, error, add };
}
