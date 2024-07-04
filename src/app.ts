import express from "express";
import authRoutes from "./routes/authRoutes";
import protectedRoutes from "./routes/protectedRoutes";
import sequelize from "./config/database";
import { createProcedures } from "./storedProcedures/createProcedures";
import Cliente from "./models/cliente";
import MetodoPago from "./models/metodoPago";
import "./models/associations"; 

const app = express();

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/client-portal", protectedRoutes);

const PORT = 8080;
sequelize;
Cliente.sync()
MetodoPago.sync()
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
