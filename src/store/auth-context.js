import { createContext, useCallback, useEffect, useState } from "react";

let logoutTimer;

const AuthContext = createContext({
  token: "",
  isLoggedIn: false,
  login: (token, expirationTime) => {},
  logout: () => {},
});

const calculateExpTime = (expTime) => {
  const now = new Date();
  const remainingTime = new Date(expTime).getTime() - now.getTime();
  return remainingTime;
};

const retrieveToken = () => {
  const token = localStorage.getItem("token");
  const expTime = localStorage.getItem("expTime");
  if (token && expTime) {
    const expTimeInMilliseconds = calculateExpTime(expTime);
    if (expTimeInMilliseconds <= 30000) {
      localStorage.removeItem("token");
      localStorage.removeItem("expTime");
      return null;
    }
    return { token: token, expTime: expTimeInMilliseconds };
  }
  return null;
};

export const AuthContextProvider = (props) => {
  const tokenInfo = retrieveToken();
  let initialToken = tokenInfo ? tokenInfo.token : null;
  const [token, setToken] = useState(initialToken);
  const userLoggedIn = !!token;

  const logoutHandler = useCallback(() => {
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("expTime");
    if (logoutTimer) {
      clearTimeout(logoutTimer);
    }
  }, []);

  const loginHandler = (token, expirationTime) => {
    localStorage.setItem("token", token);
    localStorage.setItem("expTime", expirationTime);
    setToken(token);
    const remainingTime = calculateExpTime(expirationTime);
    logoutTimer = setTimeout(logoutHandler, remainingTime);
  };

  useEffect(() => {
    if (tokenInfo) {
      logoutTimer = setTimeout(logoutHandler, tokenInfo.expTime);
    }
  }, [tokenInfo, logoutHandler]);

  const contextValue = {
    token: token,
    isLoggedIn: userLoggedIn,
    login: loginHandler,
    logout: logoutHandler,
  };
  return (
    <AuthContext.Provider value={contextValue}>
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
