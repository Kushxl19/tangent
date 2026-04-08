import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from "@react-oauth/google";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="546070377766-qm9vuqg6a9m399flb6fe05mqb7kia64i.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </StrictMode>
);