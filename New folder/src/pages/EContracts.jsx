import React, { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, addDoc, getDocs, updateDoc, doc } from "firebase/firestore";
import ContractEditor from "../components/ContractEditor";

const EContracts = () => {
  const [contracts, setContracts] = useState([]);
  const [showEditor, setShowEditor] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);

  useEffect(() => {
    const fetchContracts = async () => {
      const querySnapshot = await getDocs(collection(db, "contracts"));
      setContracts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchContracts();
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">E-Contracts & Document Completion</h1>
      <button className="mb-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={() => { setShowEditor(true); setSelectedContract(null); }}>New Contract</button>
      <div className="space-y-4">
        {contracts.map(contract => (
          <div key={contract.id} className="p-4 bg-white rounded shadow flex justify-between items-center">
            <div>
              <div className="font-semibold">{contract.title}</div>
              <div className="text-xs text-gray-500">Status: {contract.status}</div>
            </div>
            <button className="text-blue-600 underline" onClick={() => { setShowEditor(true); setSelectedContract(contract); }}>View/Edit</button>
          </div>
        ))}
      </div>
      {showEditor && (
        <ContractEditor contract={selectedContract} onClose={() => setShowEditor(false)} />
      )}
    </div>
  );
};

export default EContracts;
