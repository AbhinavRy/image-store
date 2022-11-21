import { useState, useContext, createContext } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Cookie from "js-cookie";

const authContext = createContext();

export function useAuth() {
  const [authed, setAuthed] = useState(false);
  const navigate = useNavigate();

  return {
    authed,
    login() {
      return new Promise((resolve) => {
        setAuthed(true);
        navigate('/');
        resolve();
      });
    },
    setAuth() {
      return new Promise((resolve) => {
        setAuthed(true);
        resolve();
      });
    },
    logout() {
      return new Promise((resolve) => {
        Cookie.remove("authToken");
        // Cookie.remove("loggedIn");
        setAuthed(false);
        navigate('/signup')
        resolve();
      });
    },
  };
}

export function AuthProvider({ children }) {
  const auth = useAuth();

  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

export default function AuthConsumer() {
  return useContext(authContext);
}