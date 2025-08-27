# API Key Setup Instructions

## Firebase
- Copy `.env.example` to `.env` and fill in your Firebase project credentials.
- You can find these in your Firebase console under Project Settings > General.
- Example:
  ```env
  VITE_FIREBASE_API_KEY=your_firebase_api_key_here
  VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain_here
  VITE_FIREBASE_PROJECT_ID=your_firebase_project_id_here
  VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket_here
  VITE_FIREBASE_APP_ID=your_firebase_app_id_here
  VITE_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id_here
  ```

## OpenAI
- Add your OpenAI API key to `.env` as `VITE_OPENAI_API_KEY=your_openai_api_key_here`
- You can get your API key from https://platform.openai.com/account/api-keys

## Demo Mode
- If no API key is set, all AI features will run in demo mode and return placeholder responses.
- Error messages will be shown if keys are missing or invalid.

## Security
- Never commit your `.env` file with real API keys to version control.
- Use `.env.example` as a template for sharing config requirements.
