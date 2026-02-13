import { Routes, Route } from "react-router";
import App from "../App.jsx";
import LoginPage from "../pages/Login.jsx";
import PrivateRoute from "../components/context/PrivateRoute.jsx";

export default function AppRoutes() {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <PrivateRoute>
                        <App />
                    </PrivateRoute>
                }
            />
            <Route path="/login" element={<LoginPage />} />
        </Routes>
    );
}
