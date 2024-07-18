import React from "react";
import { useAuth } from "../contexts/AuthContext";
import TopBarNonClients from "./TopBarNonClients";
import TopBarClients from "./TopBarClients";
import adLandingPage from "../assets/adLandingPage.png";
import "../styles/LandingPage.css";
import Footer from "./Footer";

const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  return (
    <>
      {isAuthenticated ? <TopBarClients /> : <TopBarNonClients />}
      <div className="landing-page">
        <div className="landing-content">
          <h1>Veni, Vidi, Vici: Conquista el Mundo con VoxNet</h1>
          <p>
            Con VoxNet, conquista el mundo digital y expande tus horizontes.
          </p>
        </div>
        <div className="landing-ad">
          <div className="landing-ad-rectangle">
            <div className="ad-text">
              <h2>VoxNet Internet</h2>
              <h3>Poderoso y seguro, no importa que tan grande sea el caos.</h3>
              <p>
                Puedes contar con un internet estable, aunque todos los Minions
                estén en línea, con 300 Mbps internet.
              </p>
            </div>
            <div className="ad-right">
              <h4>
                RD$2800<b>/mes por 1 año</b>
              </h4>
              <button className="ad-button">Compra Internet</button>
              <a href="##" className="ad-link">
                Precios y otra información
              </a>
            </div>
            <img src={adLandingPage} alt="Ad Banner" className="ad-image" />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default LandingPage;
