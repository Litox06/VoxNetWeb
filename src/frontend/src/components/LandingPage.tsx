import React from "react";
import TopBarNonClients from "./TopBarNonClients";
import TopBarClients from "./TopBarClients";
import adLandingPage from "../assets/adLandingPage.png";
import "../styles/LandingPage.css";
import orange from "../assets/orange.png";
import airtel from "../assets/airtel.png";
import att from "../assets/at&t.png";
import tmobile from "../assets/tmobile.png";
import telefonica from "../assets/telefonica.png";
import Footer from "./Footer";

const LandingPage: React.FC = () => {
  const token = localStorage.getItem("token");
  console.log("token is: ", token);
  return (
    <>
      {token ? <TopBarClients /> : <TopBarNonClients />}
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
        <div className="internet-residencial">
          <h2>Planes de Internet Residencial</h2>
          <p>Poderoso. Seguro. Aprueba de Minions.</p>
          <div className="internet-residencial-cards">
            <div className="card">
              <h3>
                150 Mbps
                <br />
                VoxNet Conecta
              </h3>
              <p>RD$2,300/mes</p>
              <p>Permanecen en contacto con la familia</p>
              <p>Mantente conectado con videollamadas y redes sociales</p>
              <p>Descarga una película en definición 4K en solo 2 minutos</p>
              <button>Comprar Ahora</button>
            </div>
            <div className="card">
              <h3>
                300 Mbps
                <br />
                VoxNet More
              </h3>
              <p>RD$3,100/mes</p>
              <p>Streaming HD sin interrupciones</p>
              <p>Ideal para hogares activos en internet</p>
              <p>Conectividad estable para teletrabajo</p>
              <button>Comprar Ahora</button>
            </div>
            <div className="card">
              <h3>
                500 Mbps
                <br />
                VoxNet Ultra
              </h3>
              <p>RD$3,900/mes</p>
              <p>Navegación ultrarrápida para gamers</p>
              <p>Mantente conectado con videollamadas y redes sociales</p>
              <p>Perfecto para creadores de contenido</p>
              <button>Comprar Ahora</button>
            </div>
          </div>
        </div>
      </div>
      <div className="voz-residencial">
        <h2>Planes de Voz Residencial</h2>
        <p>Hogar conectado, familia unida</p>
        <div className="voz-residencial-cards">
          <div className="card">
            <h3>
              400 Min
              <br />
              VoxNet Básico
            </h3>
            <p>RD$774/mes</p>
            <p>Conectividad simple, llamadas sin preocupaciones.</p>
            <p>Ideal para llamadas moderadas desde tu hogar.</p>
            <p>Ahorra sin comprometer la conectividad</p>
            <button>Comprar Ahora</button>
          </div>
          <div className="card">
            <h3>
              800 Min
              <br />
              VoxNet Plus
            </h3>
            <p>RD$1,034/mes</p>
            <p>Más minutos, más conversaciones, más cercanía.</p>
            <p>Perfecto para llamadas frecuentes</p>
            <p>Mayor flexibilidad y conveniencia</p>
            <button>Comprar Ahora</button>
          </div>
          <div className="card">
            <h3>
              2000 Min
              <br />
              VoxNet Premium
            </h3>
            <p>RD$1,995/mes</p>
            <p>Llamadas ilimitadas para conectar sin límites.</p>
            <p>Máxima libertad para comunicarte</p>
            <p>Llama a tus seres queridos sin restricciones</p>
            <button>Comprar Ahora</button>
          </div>
        </div>
      </div>
      <div className="movil-postpago">
        <h2>Planes de Móvil Postpago</h2>
        <p>Siempre en línea, Siempre adelante. Explora sin límites</p>
        <div className="movil-postpago-cards">
          <div className="card">
            <h3>
              25 GB <br />
              VoxNet Esencial
            </h3>
            <p>RD$1,975/mes</p>
            <p>25 GB de datos móviles</p>
            <p>
              Perfecto para <strong>uso diario</strong> y{" "}
              <strong>conexión constante</strong>
            </p>
            <p>
              Incluye <strong>100 minutos</strong> de llamadas a E.E.U.U.
            </p>
            <button>Comprar Ahora</button>
          </div>
          <div className="card">
            <h3>
              45 GB <br />
              VoxNet Óptimo
            </h3>
            <p>RD$2,475/mes</p>
            <p>45 GB de datos móviles</p>
            <p>
              Excelente para <strong>streaming intenso</strong> y{" "}
              <strong>música de alta calidad</strong>
            </p>
            <p>
              Incluye <strong>200 minutos</strong> de llamadas a E.E.U.U. y
              Europa
            </p>
            <button>Comprar Ahora</button>
          </div>
          <div className="card">
            <h3>
              55 GB <br />
              VoxNet Máximo
            </h3>
            <p>RD$2,599/mes</p>
            <p>50 GB de datos móviles</p>
            <p>
              Navegación y streaming <strong>sin límites</strong>
            </p>
            <p>
              Llamadas internacionales <strong>ilimitadas</strong> a E.E.U.U y
              Europa
            </p>
            <button>Comprar Ahora</button>
          </div>
        </div>
      </div>

      <div className="movil-prepago">
        <h2>Planes de Móvil Prepago</h2>
        <p>Flexibilidad en cada paso. Prepárate para la libertad total.</p>
        <div className="movil-prepago-cards">
          <div className="card">
            <h3>
              1 GB
              <br />
              VoxNet Diario
            </h3>
            <p>RD$150 /mes</p>
            <p>1GB de datos móviles</p>
            <p>Sin contrato, sin validación crediticia y recargable.</p>
            <p>Ideal para uso esporádico y emergencias</p>
            <p>Incluye 50 minutos de llamadas locales y 15 minutos a E.E.U.U</p>
            <button>Comprar Ahora</button>
          </div>
          <div className="card">
            <h3>
              5 GB
              <br />
              VoxNet Semanal
            </h3>
            <p>RD$500 /mes</p>
            <p>5 GB de datos móviles</p>
            <p>Sin contrato, sin validación crediticia y recargable.</p>
            <p>Ideal para usuarios regulares con necesidades moderadas</p>
            <p>Incluye 100 minutos de llamadas locales, 50 minutos a E.E.U.U</p>
            <button>Comprar Ahora</button>
          </div>
          <div className="card">
            <h3>
              10 GB
              <br />
              VoxNet Mensual
            </h3>
            <p>RD$950 /mes</p>
            <p>10 GB de datos móviles</p>
            <p>Sin contrato, sin validación crediticia y recargable.</p>
            <p>Ideal para usuarios activos en redes y comunicación frecuente</p>
            <p>
              300 minutos de llamadas locales, 150 minutos a E.E.U.U y Europa
            </p>
            <button>Comprar Ahora</button>
          </div>
        </div>
      </div>
      <div className="vxtv-plans">
        <h2>Planes de VXTV</h2>
        <div className="vxtv-plans-cards">
          <div className="card">
            <h3>VXTV Fundamentum</h3>
            <p>RD$999 /mes</p>
            <p>100 canales nacionales e internacionales</p>
            <p>40 canales de música</p>
            <p>Acceso esencial a lo mejor del entretenimiento básico.</p>
            <button>Comprar Ahora</button>
          </div>
          <div className="card">
            <h3>VXTV Secundus</h3>
            <p>RD$1,200 /mes</p>
            <p>200 canales nacionales e internacionales</p>
            <p>50 canales de música, 20 canales HD</p>
            <p>Para toda la familia, incluyendo deportes y novelas</p>
            <button>Comprar Ahora</button>
          </div>
          <div className="card">
            <h3>VXTV Tertius</h3>
            <p>RD$2,000 /mes</p>
            <p>350 canales nacionales e internacionales</p>
            <p>100 canales de música, 50 canales HD</p>
            <p>Cobertura completa con todos los géneros.</p>
            <button>Comprar Ahora</button>
          </div>
        </div>
      </div>
      <div className="roaming-plans">
        <h2>Planes de Roaming</h2>
        <p>Cruza fronteras, mantente conectado.</p>
        <div className="roaming-plans-cards">
          <div className="card">
            <h3>
              15 GB <br />
              VoxNet Global Max
            </h3>
            <p>RD$3,000/mes</p>
            <p>15 GB de datos móviles</p>
            <p>
              <strong>Cobertura global</strong>
            </p>
            <p>
              Incluye <strong>100 minutos</strong> de llamadas globalmente
            </p>
            <button>Comprar Ahora</button>
          </div>
          <div className="card">
            <h3>
              20 GB <br />
              VoxNet Global Pro
            </h3>
            <p>RD$3,500/mes</p>
            <p>20 GB de datos móviles</p>
            <p>
              <strong>Cobertura global</strong>
            </p>
            <p>
              Incluye <strong>300 minutos</strong> de llamadas globalmente
            </p>
            <button>Comprar Ahora</button>
          </div>
          <div className="card">
            <h3>
              25 GB <br />
              VoxNet Global Elite
            </h3>
            <p>RD$4,000/mes</p>
            <p>20 GB de datos móviles</p>
            <p>
              <strong>Cobertura global</strong>
            </p>
            <p>
              Incluye <strong>500 minutos</strong> de llamadas globalmente
            </p>
            <button>Comprar Ahora</button>
          </div>
        </div>
        <div className="roaming-allies">
          <h3>Conectados globalmente, gracias a nuestros aliados.</h3>
          <div className="allies-logos">
            <img className="logo-image" src={orange} alt="Orange" />
            <img className="logo-image" src={airtel} alt="Airtel" />
            <img className="logo-text" src={att} alt="AT&T" />
            <img className="logo-text" src={tmobile} alt="T-Mobile" />
            <img className="logo-text" src={telefonica} alt="Telefónica" />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default LandingPage;
