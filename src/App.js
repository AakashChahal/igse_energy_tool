// import logo from "./logo.svg";
import "./App.css";
import SignIn from "./SignIn";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignUp from "./SignUp";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<SignIn />} />
                <Route path="/register" element={<SignUp />} />
            </Routes>
        </Router>
    );
}

export default App;
