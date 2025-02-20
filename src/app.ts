import express from "express";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import authRoutes from "./routes/authRoutes";
import protectedRoutes from "./routes/protectedRoutes";
import sequelize from "./config/database";
import { createProcedures } from "./storedProcedures/createProcedures";
import Cliente from "./models/clientes";
import MetodoPago from "./models/metodoPago";
import "./models/associations";
import Servicio from "./models/servicios";
import Producto from "./models/productos";
import Contrato from "./models/contratos";
import ProductoFactura from "./models/productosFacturas";
import Factura from "./models/facturas";
import Comprobante from "./models/comprobante";
import Categoria from "./models/categoria";
import ServiciosContrato from "./models/serviciosContratos";

const app = express();

const swaggerDocument = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../swagger.json"), "utf8")
);

app.use(express.json());

// Swagger setup
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Define routes
app.use("/api/auth", authRoutes);
app.use("/api/client-portal", protectedRoutes);

const PORT = 8080;
sequelize;
Categoria.sync();
Comprobante.sync();
Cliente.sync();
Servicio.sync();
Producto.sync();
MetodoPago.sync();
Contrato.sync();
Factura.sync();
ProductoFactura.sync();
ServiciosContrato.sync()
  .then(async () => {
    console.log("Database synced");

    await createProcedures();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Unable to sync the database:", error);
  });
