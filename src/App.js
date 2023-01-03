// import logo from "./logo.svg";
import "./App.css";
import SignIn from "./customer/SignIn";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignUp from "./customer/SignUp";
import { useState } from "react";
import Dashboard from "./customer/Dashboard";
import ForgotPassword from "./customer/ForgotPassword";
import UserContext from "./userContext";
import AdminSignIn from "./admin/AdminSignIn";
import AdminHomePage from "./admin/adminDashboard";

function App() {
    const [currentUser, setCurrentUser] = useState(null);

    return (
        <UserContext.Provider value={{ currentUser, setCurrentUser }}>
            <Router>
                <Routes>
                    <Route path="/" element={<SignIn />} />
                    <Route path="/login" element={<SignIn />} />
                    <Route path="/register" element={<SignUp />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/forgot" element={<ForgotPassword />} />
                    <Route path="/admin" element={<AdminSignIn />} />
                    <Route path="/admin/home" element={<AdminHomePage />} />
                </Routes>
            </Router>
        </UserContext.Provider>
    );
}

export default App;
