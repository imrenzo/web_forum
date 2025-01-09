import './App.css';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./userManagement/login";
import Home from "./pages/home";
import LoadIndivPost from "./pages/indivThread";
import SignUp from "./userManagement/signup";
import LogOut from "./userManagement/logout";
import NotFound from './pages/notFound';
import HandleThread from './pages/HandleThread';

function MyApp() {
  return (
    <>
      <title>Web Forum</title>
      <BrowserRouter>
        <Routes>
          {/* read db */}
          <Route path="/" element={<Home />}></Route>
          <Route path="/post_id/:num" element={<LoadIndivPost />}></Route>

          {/* create thread & comments */}
          <Route path="/createThread" element={<HandleThread method="create" />}></Route>

          {/* update thread & comments */}
          <Route path="/edit_thread/:num" element={<HandleThread method="update" />}></Route>

          {/* delete thread & comments */}
          <Route path="/delete_thread/:num" element={<HandleThread method="delete" />}></Route>

          {/* user management */}
          <Route path="/login" element={<Login />}></Route>
          <Route path="/logout" element={<LogOut />}></Route>
          <Route path="/signup" element={<SignUp />}></Route>
          <Route path="*" element={<NotFound errorStatus={404} />}></Route>
        </Routes>
      </BrowserRouter >
    </>
  );
}

export default MyApp;