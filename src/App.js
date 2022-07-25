import { useContext } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AuthContext from "./store/auth-context";

import Layout from "./components/Layout/Layout";
import UserProfile from "./components/Profile/UserProfile";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";

function App() {
  const { isLoggedIn } = useContext(AuthContext);
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/auth"
          element={
            <>
              {!isLoggedIn && <AuthPage />}
              {isLoggedIn && <Navigate to="/" />}
            </>
          }
        />
        <Route
          path="/profile"
          element={
            <>
              {isLoggedIn && <UserProfile />}
              {!isLoggedIn && <Navigate to="/auth" />}
            </>
          }
        />
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </Layout>
  );
}

export default App;
