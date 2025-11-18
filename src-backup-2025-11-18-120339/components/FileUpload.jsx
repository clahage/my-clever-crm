import React, { useState } from "react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "../authContext";

const FileUpload = ({ contactId, onUpload }) => {
  const { app } = useAuth();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [url, setUrl] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file || !contactId) return;
    setUploading(true);
    setError(null);
    try {
      const storage = getStorage(app);
      const storageRef = ref(storage, `client-files/${contactId}/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);
      setUrl(downloadUrl);
      if (onUpload) onUpload(downloadUrl);
    } catch (err) {
      setError("Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="my-4">
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={uploading || !file} className="ml-2 px-3 py-1 bg-blue-500 text-white rounded">
        {uploading ? "Uploading..." : "Upload"}
      </button>
      {error && <div className="text-red-500 mt-2">{error}</div>}
      {url && <div className="text-green-600 mt-2">File uploaded: <a href={url} target="_blank" rel="noopener noreferrer">View</a></div>}
    </div>
  );
};

export default FileUpload;
