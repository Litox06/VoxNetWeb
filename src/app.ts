import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import authRoutes from "./routes/authRoutes";
import protectedRoutes from "./routes/protectedRoutes";
import sequelize from "./config/database";
import { createProcedures } from "./storedProcedures/createProcedures";
import Cliente from "./models/clientes";
import "./models/associations";
import Servicio from "./models/servicios";
import Producto from "./models/productos";
import Contrato from "./models/contratos";
import ProductoFactura from "./models/productosFacturas";
import Factura from "./models/facturas";
import Comprobante from "./models/comprobante";
import Categoria from "./models/categoria";

const app = express();

const swaggerDocument = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../swagger.json"), "utf8")
);
app.use(cors());
app.use(express.json());
// Serve static files from the React app
app.use(express.static(path.join(__dirname, "frontend/build")));

// Catch-all handler to serve React's index.html for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/build", "index.html"));
});

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
Contrato.sync();
Factura.sync();
ProductoFactura.sync()
  .then(async () => {
    console.log("Database synced");

    await createProcedures();

    await insertIfNotExists(
      Comprobante,
      { tipoComprobante: "N/A" },
      async () => {
        await Comprobante.create({
          tipoComprobante: "N/A",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      },
      "Default Comprobante"
    );

    await insertIfNotExists(
      Servicio,
      {},
      async () => {
        await sequelize.query("CALL InsertAllServices()");
      },
      "Services"
    );

    await insertIfNotExists(
      Categoria,
      {},
      async () => {
        await sequelize.query("CALL InsertAllCategorias()");
      },
      "Categories"
    );

    await insertIfNotExists(
      Producto,
      {},
      async () => {
        await sequelize.query("CALL InsertAllProductos()");
      },
      "Products"
    );
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Unable to sync the database:", error);
  });

const insertIfNotExists = async (
  model: any,
  whereCondition: any,
  insertFunction: () => Promise<void>,
  entityName: string
) => {
  try {
    const count = await model.count({ where: whereCondition });

    if (count === 0) {
      await insertFunction();
      console.log(`${entityName} inserted successfully`);
    } else {
      console.log(`${entityName} already exists. Skipping insertion.`);
    }
  } catch (error) {
    console.error(`Error inserting ${entityName}:`, error);
  }
};
