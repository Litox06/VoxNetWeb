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

    const comprobanteCount = await Comprobante.count({
      where: { tipoComprobante: "N/A" },
    });
    if (comprobanteCount === 0) {
      try {
        await Comprobante.create({
          tipoComprobante: "N/A",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        console.log("Default Comprobante inserted successfully");
      } catch (error) {
        console.error("Error inserting default Comprobante:", error);
      }
    } else {
      console.log("Default Comprobante already exists. Skipping insertion.");
    }

    const servicesCount = await Servicio.count();
    if (servicesCount === 0) {
      try {
        const result = await sequelize.query("CALL InsertAllServices()");
        console.log("Services inserted successfully");
      } catch (error) {
        console.error("Error inserting services:", error);
      }
    } else {
      console.log("Services already exist. Skipping insertion.");
    }
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Unable to sync the database:", error);
  });
