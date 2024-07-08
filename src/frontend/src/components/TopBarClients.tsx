import React from "react";
import logo from "../assets/logo.png";
import phoneIcon from "../assets/phoneIcon.png";
import locationIcon from "../assets/officesIcon.png";
import userIcon from "../assets/userIcon.png";
import signOutIcon from "../assets/signOutIcon.png";
import "../styles/TopBarClients.css";

const TopBarClients: React.FC = () => {
  return (
    <div className="topbar-clients">
      <img src={logo} alt="VoxNet Logo" className="topbar-logo" />
      <div className="topbar-links">
        <div className="dropdown">
          <a href="##">Internet</a>
          <div className="dropdown-content">
            <a href="##">Internet Móvil</a>
            <a href="##">Internet Residencial</a>
            <a href="##">
              Internet
              <b>
                <i>NOW</i>
              </b>
            </a>
          </div>
        </div>
        <div className="dropdown">
          <a href="##">Móvil</a>
          <div className="dropdown-content">
            <a href="##">Postpago</a>
            <a href="##">Prepago</a>
            <a href="##">Roaming</a>
          </div>
        </div>
        <div className="dropdown">
          <a href="##">Hogar</a>
          <div className="dropdown-content">
            <a href="##">Voz Residencial</a>
            <a href="##">Larga Distancia</a>
            <a href="##">VXIoT HOME</a>
          </div>
        </div>
        <div className="dropdown">
          <a href="##">TV & Streaming</a>
          <div className="dropdown-content">
            <a href="##">VX1 TV & Streaming</a>
            <a href="##">Canales Adicionales</a>
            <a href="##">
              TV
              <b>
                <i>NOW</i>
              </b>
            </a>
          </div>
        </div>
        <div className="dropdown">
          <a href="##">Equipos</a>
          <div className="dropdown-content">
            <a href="##">Móviles</a>
            <a href="##">Equipos Hogar</a>
            <a href="##">Wi-Fi</a>
          </div>
        </div>
        <a href="##">Cobertura</a>
        <a href="##">Pagos y Recargas</a>
        <a href="##">Mis Servicios</a>
      </div>
      <div className="topbar-icons">
        <img src={phoneIcon} alt="Phone Icon" />
        <img src={locationIcon} alt="Location Icon" />
        <img src={userIcon} alt="User Icon" />
        <img src={signOutIcon} alt="Sign Out Icon" />
      </div>
    </div>
  );
};

export default TopBarClients;
