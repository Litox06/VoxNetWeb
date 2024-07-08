import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import showPasswordIcon from "../assets/showPasswordIcon.png";
import hidePasswordIcon from "../assets/hidePasswordIcon.png";
import "../styles/UpdatePassword.css";

const UpdatePassword: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      await axios.put("http://localhost:8080/api/auth/reset-password", {
        token,
        newPassword: password,
      });
      alert("Contraseña actualizada exitosamente.");
      navigate("/login");
    } catch (error) {
      console.error("Update password error:", error);
      setError("Error al actualizar la contraseña. Intente de nuevo.");
    }
  };

  return (
    <div className="update-password-container">
      <div className="update-password-content">
        <div className="update-password-form-section">
          <img src={logo} alt="VoxNet Logo" className="update-password-logo" />
          <h1 className="update-password-title">Actualizar Contraseña</h1>
          <form onSubmit={handleSubmit} className="update-password-form">
            <div className="update-password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nueva contraseña"
                className="update-password-input"
                required
              />
              <img
                src={showPassword ? hidePasswordIcon : showPasswordIcon}
                alt={showPassword ? "Hide Password" : "Show Password"}
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              />
            </div>
            <div className="update-password-input-wrapper">
              <input
                autoComplete="new-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmar nueva contraseña"
                className="update-password-input"
                required
              />
              <img
                src={showConfirmPassword ? hidePasswordIcon : showPasswordIcon}
                alt={showConfirmPassword ? "Hide Password" : "Show Password"}
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            </div>
            {error && <p className="update-password-error">{error}</p>}
            <button type="submit" className="update-password-button">
              Actualizar Contraseña
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdatePassword;
