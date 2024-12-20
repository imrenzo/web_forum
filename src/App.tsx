import './App.css';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/login";
import Home from "./pages/home";
import IndivPost from "./pages/indivPost";
import SignUp from "./pages/signup";

function MyApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/signup" element={<SignUp />}></Route>
        <Route path="/id/:num" element={<IndivPost />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default MyApp;