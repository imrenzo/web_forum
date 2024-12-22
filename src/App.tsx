import './App.css';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./userManagement/login";
import Home from "./pages/home";
import LoadIndivPost from "./pages/indivPost";
import SignUp from "./userManagement/signup";
import LogOut from "./userManagement/logout";
import NotFound from './pages/notFound';
import CreateThread from './pages/createThread';
import EditThread from './pages/createThread';

function MyApp() {
  return (
    <>
      <title>Web Forum</title>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/createThread" element={<CreateThread />}></Route>
          {/* <Route path="/post_id/edit/:num" element={<EditThread />}></Route> */}
          <Route path="/post_id/:num" element={<LoadIndivPost />}></Route>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/logout" element={<LogOut />}></Route>
          <Route path="/signup" element={<SignUp />}></Route>
          <Route path="*" element={<NotFound />}></Route>
        </Routes>
      </BrowserRouter >
    </>
  );
}

export default MyApp;