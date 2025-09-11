import React, { useState, useEffect } from 'react';
import { DocumentIcon, CloudArrowUpIcon, FolderIcon, TrashIcon, EyeIcon , ChartBarIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { storage, db } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, query, where, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { parseCreditReportPDF as parsePDF } from '../../utils/pdfParser';



const ClientDocuments = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const [parsing, setParsing] = useState({});
  const parseDocument = async (doc) => {
    setParsing(prev => ({ ...prev, [doc.id]: true }));
    try {
      console.log('Starting parse for:', doc.fileName);
      const result = await parsePDF(doc.url);
      console.log('Parse result:', result);
      if (!result) {
        console.log('Result is null/undefined');
        alert('Failed to parse document.');
      } else if (!result.scores) {
        console.log('Result has no scores property');
        alert('No scores property in result.');
      } else if (result.scores.length === 0) {
        console.log('Scores array is empty');
        alert('No credit scores found in this document.');
      } else {
        console.log('Found scores:', result.scores);
        // Save scores to Firestore...
        alert(`Successfully extracted ${result.scores.length} score(s)!`);
      }
    } catch (error) {
      console.error('Parse error:', error);
      alert('Failed to parse document.');
    } finally {
      setParsing(prev => ({ ...prev, [doc.id]: false }));
    }
  };

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'documents'),
      where('clientEmail', '==', user.email),
      orderBy('uploadedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDocuments(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files) => {
    const file = files[0];
    
    // Validate file
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    
    if (file.size > maxSize) {
      alert('File size must be less than 10MB');
      return;
    }
    
    if (!allowedTypes.includes(file.type)) {
      alert('Only PDF, JPG, and PNG files are allowed');
      return;
    }

    setUploading(true);

    try {
      // Create storage reference
      const timestamp = Date.now();
      const fileName = `${user.uid}/${timestamp}_${file.name}`;
      const storageRef = ref(storage, `documents/${fileName}`);
      
      // Upload file
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // Save metadata to Firestore
      await addDoc(collection(db, 'documents'), {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        url: downloadURL,
        storagePath: fileName,
        clientEmail: user.email,
        clientId: user.uid,
        uploadedAt: new Date(),
        category: determineCategory(file.name)
      });

      setUploading(false);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
      setUploading(false);
    }
  };

  const determineCategory = (fileName) => {
    const lower = fileName.toLowerCase();
    if (lower.includes('report') || lower.includes('credit')) return 'Credit Report';
    if (lower.includes('id') || lower.includes('driver') || lower.includes('passport')) return 'ID';
    if (lower.includes('dispute') || lower.includes('letter')) return 'Dispute';
    return 'Other';
  };

  const deleteDocument = async (doc) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    
    try {
      // Delete from Storage
      const storageRef = ref(storage, `documents/${doc.storagePath}`);
      await deleteObject(storageRef);
      
      // Delete from Firestore
      await deleteDoc(doc(db, 'documents', doc.id));
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Credit Report': 'bg-blue-100 text-blue-800',
      'ID': 'bg-green-100 text-green-800',
      'Dispute': 'bg-yellow-100 text-yellow-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors['Other'];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        My Documents
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Upload and manage your credit repair documents
      </p>
      
      {/* Upload Zone */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg mb-8">
        <form onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()}>
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleChange}
          />
          <label
            htmlFor="file-upload"
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              dragActive 
                ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Uploading...</p>
              </>
            ) : (
              <>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Drag and drop files here, or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  PDF, JPG, PNG up to 10MB
                </p>
              </>
            )}
          </label>
        </form>
      </div>
      
      {/* Documents List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Uploaded Documents ({documents.length})</h2>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FolderIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>No documents uploaded yet</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex items-center gap-3">
                  <DocumentIcon className="h-10 w-10 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{doc.fileName}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(doc.category)}`}>
                        {doc.category}
                      </span>
                      <span className="text-xs text-gray-500">{formatFileSize(doc.fileSize)}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(doc.uploadedAt.toDate ? doc.uploadedAt.toDate() : doc.uploadedAt).toLocaleDateString()}
                      </span>
                      {doc.parsed && (
                        <span className="text-xs text-green-600">
                          ✓ Parsed ({doc.scoresFound || 0} scores)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </a>
                  <button
                    onClick={() => parseDocument(doc)}
                    disabled={parsing[doc.id] || doc.parsed}
                    className={`p-2 rounded-lg ${
                      doc.parsed 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : parsing[doc.id]
                          ? 'text-yellow-600 animate-spin'
                          : 'text-green-600 hover:bg-green-50'
                    }`}
                    title={doc.parsed ? 'Already parsed' : 'Extract credit scores'}
                  >
                    <ChartBarIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => deleteDocument(doc)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDocuments;
