import { useState } from "react";
import { AUTH_CONFIG } from "./config/app.config";
import { LoginPage } from "./features/auth/LoginPage";
import { DashboardPage } from "./features/dashboard/DashboardPage";

export default function App() {
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem(AUTH_CONFIG.sessionKey) === "true"
  );

  function logout() {
    sessionStorage.removeItem(AUTH_CONFIG.sessionKey);
    setAuthenticated(false);
  }

  return authenticated
    ? <DashboardPage onLogout={logout} />
    : <LoginPage onLogin={() => setAuthenticated(true)} />;
}
