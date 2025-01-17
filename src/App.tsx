import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home, { MyThreads } from "./pages/threadPages";
import LoadIndivThread from "./pages/indivThread";
import NotFound from './pages/notFound';
import HandleThread from './pages/handleThread';
import UserMethod from './userManagement/user';
import './App.css';

function MyApp() {
  return (
    <>
      <title>Web Forum</title>
      <BrowserRouter>
        <Routes>
          {/* ///// FOR THREADS ///// */}
          {/* for creating thread */}
          <Route path="/thread/:method" element={<HandleThread />}></Route>

          {/* read threads */}
          <Route path="/" element={<Home />}></Route>
          <Route path="/thread_id/:id" element={<LoadIndivThread />}></Route>
          <Route path="/mythreads" element={<MyThreads />}></Route>

          {/* for updating and deleting thread */}
          <Route path="/thread/:method/:id" element={<HandleThread />}></Route>

          {/* ///// USER MANAGEMENT ///// */}
          <Route path="/user/:method" element={<UserMethod />}></Route>

          {/* ///// ERROR HANDLING ///// */}
          <Route path="/error/:status" element={<NotFound />}></Route>
          <Route path="*" element={<NotFound />}></Route>
        </Routes>
      </BrowserRouter >
    </>
  );
}

export default MyApp;