import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home, { LoadIndivThread, MyThreads } from "./pages/threadPages";
import NotFound from './pages/notFound';
import HandleThread from './pages/threadMethods';
import UserMethod from './userManagement/user';
import './App.css';
import Test from "./pages/test";
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
          <Route path="/test" element={<Test />}></Route>
        </Routes>
      </BrowserRouter >
    </>
  );
}

export default MyApp;