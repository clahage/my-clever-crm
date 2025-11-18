import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import ContractEditor from "../components/ContractEditor";

const ClientContracts = ({ clientId }) => {
  const [contracts, setContracts] = useState([]);
  const [showEditor, setShowEditor] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);

  useEffect(() => {
    if (!clientId) return;
    const fetchContracts = async () => {
      const q = query(collection(db, "contracts"), where("clientId", "==", clientId));
      const querySnapshot = await getDocs(q);
      setContracts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchContracts();
  }, [clientId]);

  return (
    <div className="mb-8">
      <h4 className="text-lg font-semibold mb-2">Contracts</h4>
      <button className="mb-2 px-3 py-1 bg-blue-500 text-white rounded" onClick={() => { setShowEditor(true); setSelectedContract(null); }}>New Contract</button>
      <ul className="space-y-2">
        {contracts.map(contract => (
          <li key={contract.id} className="bg-gray-50 p-2 rounded flex justify-between items-center">
            <span>{contract.title} <span className="text-xs text-gray-400">({contract.status})</span></span>
            <button className="text-blue-600 underline" onClick={() => { setShowEditor(true); setSelectedContract(contract); }}>View/Edit</button>
          </li>
        ))}
      </ul>
      {showEditor && (
        <ContractEditor contract={selectedContract} onClose={() => setShowEditor(false)} />
      )}
    </div>
  );
};

export default ClientContracts;
