import express from "express";
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
import { Association } from "sequelize";

const app = express();

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/client-portal", protectedRoutes);

const PORT = 8080;
sequelize;
Cliente.sync();
MetodoPago.sync();
Servicio.sync();
Contrato.sync();
Producto.sync();
Categoria.sync();
ProductoFactura.sync();
Factura.sync();
Comprobante.sync()
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
