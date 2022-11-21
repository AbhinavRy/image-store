import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import './App.css';
import 'antd/dist/antd.css';
import Signup from './pages/Signup';
import AuthContext from "./AuthContext";
import MediaPage from "./pages/MediaPage";
import axios from "axios";
import { BASE_URL } from "./config";
import PageNotFound from "./pages/PageNotFound";

// function RequireAuth({ children, authed }) {
//   const location = useLocation();
  
//   return authed === true ? children : <Navigate to="/signup" replace state={{ path: location.pathname }} />;
// }

function App() {
  const auth = AuthContext();

  const handleLogout = () => {
    axios.get(`${BASE_URL}/auth/logout`)
      .then(res => {
        auth.logout();
      })
  }
  
  return (
    <div className="App">
      {
        auth.authed === true &&
        <div 
          style={{
            position:"absolute", 
            right: 10, 
            zIndex:"100", 
            margin:"1em 7em",
            cursor: "pointer",
          }} 
          onClick={handleLogout}
        >
          Logout
        </div>
      }
      <Routes>
        <Route path="/signup" element={<Signup/>} />
        <Route 
          path="/" 
          element={
            // <RequireAuth authed={auth.authed}>
              <MediaPage/>
            // </RequireAuth>
          } 
        />
        <Route path="*" element={<PageNotFound/>} />
      </Routes>
    </div>
  )
}

export default App
