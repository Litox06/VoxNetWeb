import React from "react";
import instagram from "../assets/instagram.png";
import twitter from "../assets/twitter.png";
import linkedin from "../assets/linkedin.png";
import "../styles/Footer.css";

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-column">
        <h3>Sobre Nosotros</h3>
        <ul>
          <li>Sobre VoxNet</li>
          <li>VoxNet Negocios</li>
          <li>Patrocínate con Nosotros</li>
          <li>Vacantes</li>
        </ul>
      </div>
      <div className="footer-column">
        <h3>Términos y Condiciones</h3>
        <ul>
          <li>Satisfacción del Cliente</li>
          <li>Acuerdos con el Cliente y Condiciones</li>
          <li>Centro de Privacidad</li>
          <li>Responsabilidad Social</li>
        </ul>
      </div>
      <div className="footer-column footer-right">
        <div className="footer-language">
          <span>English</span> | <span>Español</span>
        </div>
        <div className="footer-social">
          <img src={instagram} alt="Instagram" />
          <img src={twitter} alt="Twitter" />
          <img src={linkedin} alt="LinkedIn" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
