import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "react-oidc-context";
import {
  VITE_AWS_AUTHORITY,
  VITE_AWS_CLIENTID,
  VITE_AWS_REDIRECTURI,
} from "./config.ts";

const cognitoAuthConfig = {
  authority: VITE_AWS_AUTHORITY,
  client_id: VITE_AWS_CLIENTID,
  redirect_uri: VITE_AWS_REDIRECTURI,
  response_type: "code",
  scope: "email openid phone",
};

console.log("AWS Authority: " + VITE_AWS_AUTHORITY);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </StrictMode>,
);
