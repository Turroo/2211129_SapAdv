import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { createContext, useState, useContext } from "react";
import axios from "axios";
import "tailwindcss/tailwind.css";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    try {
      console.log("Attempting to log in:", email, password);  // Log per il debug
      const response = await axios.post("http://localhost:8000/auth/login", { email, password });
      console.log("Login response:", response.data);  // Log della risposta
      setUser(response.data);  // Imposta l'utente
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const register = async (email, password) => {
    try {
      console.log("Attempting to register:", email, password);  // Log per il debug
      const response = await axios.post("http://localhost:8000/auth/register", { email, password });
      console.log("Registration response:", response.data);  // Log della risposta
      await login(email, password); // Effettua il login automaticamente
    } catch (error) {
      console.error("Registration failed", error);
    }
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-lg max-w-sm w-full">
        <h2 className="text-2xl mb-4 text-center">Login</h2>
        <input
          className="p-2 border mb-4 w-full"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="p-2 border mb-4 w-full"
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="bg-blue-500 text-white p-2 w-full" onClick={() => login(email, password)}>
          Login
        </button>
        <div className="mt-4 text-center">
          <p>Don't have an account?</p>
          <a href="/register" className="text-blue-500">Register</a>
        </div>
      </div>
    </div>
  );
};

const Register = () => {
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setError(""); // Reset error
    try {
      await register(email, password);  // Registrazione
    } catch (err) {
      setError("Registration failed, please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-lg max-w-sm w-full">
        <h2 className="text-2xl mb-4 text-center">Register</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <input
          className="p-2 border mb-4 w-full"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="p-2 border mb-4 w-full"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="bg-green-500 text-white p-2 w-full" onClick={handleRegister}>
          Register
        </button>
        <div className="mt-4 text-center">
          <p>Already have an account?</p>
          <a href="/login" className="text-blue-500">Login</a>
        </div>
      </div>
    </div>
  );
};


const Dashboard = () => {
  const { user, logout } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-lg max-w-sm w-full text-center">
        <h2 className="text-2xl mb-4">Welcome, {user.email}!</h2>
        <button className="bg-red-500 text-white p-2 w-full" onClick={logout}>Logout</button>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
