export const abbreviateAddress = (
  direccion: string,
  sector: string,
  ciudad: string,
  provincia: string
): string => {
  // Concatenar las partes de la dirección
  let fullAddress = `${direccion}, ${sector}, ${ciudad}, ${provincia}`;

  // Abreviaciones comunes
  const abbreviations: { [key: string]: string } = {
    Calle: "C.",
    Avenida: "Av.",
    Boulevard: "Blvd.",
    Sector: "Sct.",
    Ciudad: "Cdad.",
    Provincia: "Prov.",
    Azúa: "Az.",
    Baoruco: "Bao.",
    Barahona: "Bar.",
    Dajabón: "Daj.",
    "Distrito Nacional": "D.N.",
    Duarte: "Dua.",
    "Elías Pina": "E.P.",
    "El Seibo": "E.S.",
    Espaillat: "Esp.",
    "Hato Mayor": "H.M.",
    Independencia: "Ind.",
    "La Altagracia": "L.A.",
    "La Romana": "L.R.",
    "La Vega": "L.V.",
    "Maria Trinidad Sanchez": "M.T.S.",
    "Monseñor Nouel": "M.N.",
    "Monte Cristi": "M.C.",
    "Monte Plata": "M.P.",
    Pedernales: "Ped.",
    Peravia: "Per.",
    "Puerto Plata": "P.P.",
    Salcedo: "Sal.",
    Samana: "Sam.",
    "Sánchez Ramírez": "S.R.",
    "San Cristobal": "S.C.",
    "San Jose de Ocoa": "S.J.O.",
    "San Juan": "S.J.",
    "San Pedro de Macorís": "S.P.M.",
    Santiago: "Sgo.",
    "Santiago Rodríguez": "S.R.",
    "Santo Domingo": "S.D.",
    Valverde: "Val.",
  };

  // Aplicar abreviaciones
  Object.keys(abbreviations).forEach((key) => {
    const regex = new RegExp(key, "gi");
    fullAddress = fullAddress.replace(regex, abbreviations[key]);
  });

  // Asegurar que la dirección no exceda los 100 caracteres
  if (fullAddress.length > 100) {
    fullAddress = fullAddress.substring(0, 97) + "...";
  }

  return fullAddress;
};
