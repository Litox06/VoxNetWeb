import React, { useState } from "react";
import axios from "axios";
import "../styles/LoginPage.css";
import logo from "../assets/logo.png";
import emailIcon from "../assets/emailIcon.png";
import passwordIcon from "../assets/passwordIcon.png";
import showPasswordIcon from "../assets/showPasswordIcon.png";
import hidePasswordIcon from "../assets/hidePasswordIcon.png";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        { correoCliente: email, password }
      );
      localStorage.setItem("token", response.data.token); // Store the token in localStorage
      window.location.href = "/payment";
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        alert("Credenciales invalidas, por favor intente de nuevo.");
      } else {
        console.error("Login error:", error);
        setError("Invalid credentials. Please try again.");
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-form-section">
          <img src={logo} alt="VoxNet Logo" className="login-logo" />
          <h1>Bienvenido a VoxNet</h1>
          <p>Inicia sesión, conéctate con el mundo, triunfa.</p>
          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-wrapper">
              <img src={emailIcon} alt="Email Icon" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@mail.com"
                required
              />
            </div>
            <div className="input-wrapper">
              <img src={passwordIcon} alt="Password Icon" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                required
              />
              <img
                src={showPassword ? hidePasswordIcon : showPasswordIcon}
                alt={showPassword ? "Hide Password" : "Show Password"}
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              />
            </div>
            <div className="login-links">
              <a href="#" className="forgot-password">
                ¿Contraseña olvidada?
              </a>
              <a href="#" className="register-link">
                Registrarme
              </a>
            </div>
            <button type="submit" className="login-button">
              Iniciar Sesión
            </button>
          </form>
        </div>
        <div className="login-decorative"></div>
      </div>
    </div>
  );
};

export default LoginPage;
