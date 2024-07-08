import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import cedulaIcon from "../assets/cedulaIcon.png";
import nameIcon from "../assets/personIcon.png";
import phoneIcon from "../assets/cellphoneIcon.png";
import addressIcon from "../assets/addressIcon.png";
import cityIcon from "../assets/cityIcon.png";
import provinceIcon from "../assets/provinciaIcon.png";
import emailIcon from "../assets/emailIcon.png";
import passwordIcon from "../assets/passwordIcon.png";
import showPasswordIcon from "../assets/showPasswordIcon.png";
import hidePasswordIcon from "../assets/hidePasswordIcon.png";
import "../styles/Register.css";

const provinces = [
  "Azua",
  "Bahoruco",
  "Barahona",
  "Dajabón",
  "Distrito Nacional",
  "Duarte",
  "El Seibo",
  "Elías Piña",
  "Espaillat",
  "Hato Mayor",
  "Hermanas Mirabal",
  "Independencia",
  "La Altagracia",
  "La Romana",
  "La Vega",
  "María Trinidad Sánchez",
  "Monseñor Nouel",
  "Monte Cristi",
  "Monte Plata",
  "Pedernales",
  "Peravia",
  "Puerto Plata",
  "Samaná",
  "San Cristóbal",
  "San José de Ocoa",
  "San Juan",
  "San Pedro de Macorís",
  "Sánchez Ramírez",
  "Santiago",
  "Santiago Rodríguez",
  "Santo Domingo",
  "Valverde",
];

const Register: React.FC = () => {
  const [cedulaCliente, setCedulaCliente] = useState("");
  const [nombreCliente, setNombreCliente] = useState("");
  const [telefonoCliente, setTelefonoCliente] = useState("");
  const [direccion, setDireccion] = useState("");
  const [sector, setSector] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [provincia, setProvincia] = useState("");
  const [correoCliente, setCorreoCliente] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCedulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove all non-numeric characters
    if (value.length > 11) {
      value = value.slice(0, 11); // Ensure length does not exceed 11
    }
    const formattedValue = value.replace(/(\d{3})(\d{7})(\d{1})/, "$1-$2-$3");
    setCedulaCliente(formattedValue);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove all non-numeric characters
    if (value.length > 10) {
      value = value.slice(0, 10); // Ensure length does not exceed 10
    }
    const formattedValue = value.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
    setTelefonoCliente(formattedValue);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    const fullAddress = `${direccion}, ${sector}, ${ciudad}, ${provincia}`;

    try {
      await axios.post("http://localhost:8080/api/auth/register", {
        nombreCliente,
        direccion: fullAddress,
        telefonoCliente,
        correoCliente,
        cedulaCliente,
        password,
      });
      alert("Usuario registrado de manera exitosa.");
      navigate("/login");
    } catch (error) {
      console.error("Register error:", error);
      setError("Error registrando usuario. Intente de nuevo.");
    }
  };

  return (
    <div className="register-container">
      <div className="register-content">
        <div className="register-form-section">
          <img src={logo} alt="VoxNet Logo" className="register-logo" />
          <h1 className="register-title">Únete a VoxNet</h1>
          <p>
            Comienza tu viaje hacia nuevas experiencias digitales y conquista
            todas tus metas en línea.
          </p>
          <form onSubmit={handleSubmit} className="register-form">
            <div className="input-wrapper">
              <img src={cedulaIcon} alt="Cedula Icon" />
              <input
                type="text"
                value={cedulaCliente}
                onChange={handleCedulaChange}
                placeholder="000-0000000-0"
                required={true}
              />
            </div>
            <div className="input-wrapper">
              <img src={nameIcon} alt="Name Icon" />
              <input
                type="text"
                value={nombreCliente}
                onChange={(e) => setNombreCliente(e.target.value)}
                placeholder="Nombre completo"
                required={true}
              />
            </div>
            <div className="input-wrapper">
              <img src={phoneIcon} alt="Phone Icon" />
              <input
                type="tel"
                value={telefonoCliente}
                onChange={handlePhoneChange}
                placeholder="123-456-7891"
                required={true}
              />
            </div>
            <div className="input-wrapper">
              <img src={addressIcon} alt="Address Icon" />
              <input
                type="text"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Dirección"
                required={true}
              />
            </div>
            <div className="input-wrapper">
              <img src={addressIcon} alt="Sector Icon" />
              <input
                type="text"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                placeholder="Sector"
                required={true}
              />
            </div>
            <div className="input-wrapper">
              <img src={cityIcon} alt="City Icon" />
              <input
                type="text"
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
                placeholder="Ciudad"
                required={true}
              />
            </div>
            <div className="input-wrapper">
              <img src={provinceIcon} alt="Province Icon" />
              <select
                value={provincia}
                onChange={(e) => setProvincia(e.target.value)}
                required={true}
              >
                <option value="" disabled selected hidden>
                  Seleccione una provincia
                </option>
                {provinces.map((province) => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
            </div>
            <div className="input-wrapper">
              <img src={emailIcon} alt="Email Icon" />
              <input
                type="email"
                value={correoCliente}
                onChange={(e) => setCorreoCliente(e.target.value)}
                placeholder="correo@mail.com"
                required={true}
              />
            </div>
            <div className="input-wrapper">
              <img src={passwordIcon} alt="Password Icon" />
              <input
                autoComplete="new-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                required={true}
              />
              <img
                src={showPassword ? hidePasswordIcon : showPasswordIcon}
                alt={showPassword ? "Hide Password" : "Show Password"}
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              />
            </div>
            <div className="input-wrapper">
              <img src={passwordIcon} alt="Confirm Password Icon" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmar contraseña"
                required={true}
              />
              <img
                src={showConfirmPassword ? hidePasswordIcon : showPasswordIcon}
                alt={showConfirmPassword ? "Hide Password" : "Show Password"}
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            </div>
            {error && <p className="register-error">{error}</p>}
            <button type="submit" className="register-button">
              Registrarme
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
