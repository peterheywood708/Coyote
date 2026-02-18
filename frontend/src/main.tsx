import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "react-oidc-context";
const config = await fetch("/config/config.json").then((res) => res.json());

const cognitoAuthConfig = {
  authority: config.VITE_AWS_AUTHORITY,
  client_id: config.VITE_AWS_CLIENTID,
  redirect_uri: config.VITE_AWS_REDIRECTURI,
  response_type: "code",
  scope: "email openid phone",
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </StrictMode>,
);
