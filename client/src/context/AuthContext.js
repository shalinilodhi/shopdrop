import { createContext, useCallback, useEffect, useState } from "react";
import { getMe, loginUser } from "../api/api";

export const AuthContext = createContext();

const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser);

  const saveUser = useCallback((u) => {
    localStorage.setItem("user", JSON.stringify(u));
    setUser(u);
  }, []);

  // Refresh from the server on load (e.g. vendor got approved meanwhile)
  useEffect(() => {
    if (localStorage.getItem("token")) {
      getMe().then(saveUser).catch(() => {});
    }
  }, [saveUser]);

  const login = async (email, password) => {
    const data = await loginUser({ email, password });
    localStorage.setItem("token", data.token);
    saveUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser: saveUser }}>
      {children}
    </AuthContext.Provider>
  );
};
