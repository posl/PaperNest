import { BrowserRouter, Routes, Route } from "react-router-dom";
import WelcomePage from "./screens/WelcomePage";
import { LandingPage } from "./screens/LandingPage";
import SignInPage from "./screens/SignInPage";
import SignUpPage from "./screens/SignUpPage";
import ProfilePage from "./screens/UserPage/ProfilePage";
import SettingsPage from "./screens/UserPage/SettingsPage";
import PrivateRoute from "./components/PrivateRoute";
import ForgotPasswordPage from "./screens/ForgotPasswordPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/app" element={<PrivateRoute><LandingPage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
