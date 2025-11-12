import React, { useState } from "react";
// Install @react-oauth/google and gapi-script for this to work
// npm install @react-oauth/google gapi-script
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"; // Replace with your client ID

const GoogleCalendarConnect = ({ onAuthSuccess }) => {
  const [token, setToken] = useState(null);

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="my-4">
        <GoogleLogin
          onSuccess={credentialResponse => {
            setToken(credentialResponse.credential);
            if (onAuthSuccess) onAuthSuccess(credentialResponse.credential);
          }}
          onError={() => {
            alert('Google Login Failed');
          }}
          useOneTap
        />
        {token && <div className="text-green-600 mt-2">Google Calendar connected!</div>}
      </div>
    </GoogleOAuthProvider>
  );
};

export default GoogleCalendarConnect;
