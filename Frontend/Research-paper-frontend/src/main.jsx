import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './Components/App'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css' // <-- Make sure this line is here!

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

ReactDOM.createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={clientId}>
    <App />
  </GoogleOAuthProvider>
)
