import React, { useState } from "react";
import axios from "axios";
import "../styles/SendResetPassword.css";
import logo from "../assets/logo.png";
import emailIcon from "../assets/emailIcon.png";

const SendResetPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await axios.post(
        "http://localhost:8080/api/auth/request-password-reset",
        {
          correoCliente: email,
        }
      );
      alert("Instrucciones de restablecimiento de contraseña enviadas.");
    } catch (error) {
      console.error("Reset password error:", error);
      setError(
        "Error al enviar instrucciones de restablecimiento. Intente de nuevo."
      );
    }
  };

  return (
    <div className="reset-container">
      <div className="reset-content">
        <div className="reset-form-section">
          <img src={logo} alt="VoxNet Logo" className="reset-logo" />
          <h1>¿Contraseña olvidada?</h1>
          <p>
            Ingresa tu correo electrónico para recibir instrucciones de
            restablecimiento de contraseña.
          </p>
          <form onSubmit={handleSubmit} className="reset-form">
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
            <button type="submit" className="reset-button">
              Enviar Instrucciones
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SendResetPassword;
