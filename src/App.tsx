import './App.css';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/login";
import Home from "./pages/home";
import Test from "./pages/test";
import SignUp from "./pages/signup"
import { useEffect } from 'react';

function MyApp() {
  useEffect(() => {
    localStorage.removeItem("jwtToken");
  }, []);
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/signup" element={<SignUp />}></Route>
        <Route path="/test" element={<Test />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default MyApp;