import { BrowserRouter, Routes, Route } from "react-router-dom";
import WelcomePage from "./screens/WelcomePage";
import { LandingPage } from "./screens/LandingPage";
import SignInPage from "./screens/SignInPage";
import SignUpPage from "./screens/SignUpPage";

function App() {
  return (
    <BrowserRouter>
        <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/app" element={<LandingPage />} />
        </Routes>
    </BrowserRouter>
  );
}

export default App;
