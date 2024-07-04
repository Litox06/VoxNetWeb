import { QueryTypes } from "sequelize";
import sequelize from "../config/database";

export const createProcedures = async () => {
  const checkProcedureExistence = async (
    procedureName: string
  ): Promise<boolean> => {
    const result = await sequelize.query(
      `SELECT COUNT(*) as count FROM information_schema.routines WHERE routine_schema = DATABASE() AND routine_name = :procedureName`,
      {
        replacements: { procedureName },
        type: QueryTypes.SELECT,
      }
    );
    const count = (result as any)[0].count;
    return count > 0;
  };

  const createRegisterClienteProcedure = `
    CREATE PROCEDURE InsertCliente(
        IN nombreCliente VARCHAR(100),
        IN direccionCliente VARCHAR(100),
        IN telefonoCliente VARCHAR(15),
        IN correoCliente VARCHAR(50),
        IN cedulaCliente VARCHAR(13),
        IN passwordCliente VARCHAR(64)
    )
    BEGIN
        INSERT INTO Clientes (
            nombreCliente, direccionCliente, telefonoCliente, correoCliente, cedulaCliente, passwordCliente, createdAt, updatedAt
        ) VALUES (
            nombreCliente, direccionCliente, telefonoCliente, correoCliente, cedulaCliente, passwordCliente, NOW(), NOW()
        );
    END;
  `;

  const createLoginClienteProcedure = `
    CREATE PROCEDURE LoginCliente(
        IN correo VARCHAR(50)
    )
    BEGIN
        SELECT * FROM Clientes WHERE correoCliente = correo;
    END;
  `;

  const createRecoverPasswordClienteProcedure = `
    CREATE PROCEDURE RecoverPasswordCliente(
        IN correo VARCHAR(50)
    )
    BEGIN
        SELECT * FROM Clientes WHERE correoCliente = correo;
    END;
  `;

  const createUpdatePasswordClienteProcedure = `
    CREATE PROCEDURE UpdatePasswordCliente(
        IN correo VARCHAR(50),
        IN newPasswordCliente VARCHAR(64)
    )
    BEGIN
        UPDATE Clientes 
        SET passwordCliente = newPasswordCliente, updatedAt = NOW()
        WHERE correoCliente = correo;
    END;
  `;

  try {
    let proceduresCreated = false;

    if (!(await checkProcedureExistence("InsertCliente"))) {
      await sequelize.query(createRegisterClienteProcedure);
      proceduresCreated = true;
    }
    if (!(await checkProcedureExistence("LoginCliente"))) {
      await sequelize.query(createLoginClienteProcedure);
      proceduresCreated = true;
    }
    if (!(await checkProcedureExistence("RecoverPasswordCliente"))) {
      await sequelize.query(createRecoverPasswordClienteProcedure);
      proceduresCreated = true;
    }
    if (!(await checkProcedureExistence("UpdatePasswordCliente"))) {
      await sequelize.query(createUpdatePasswordClienteProcedure);
      proceduresCreated = true;
    }

    if (proceduresCreated) {
      console.log("Stored procedures created successfully");
    } else {
      console.log("Stored procedures initialized");
    }
  } catch (error) {
    console.error("Error creating stored procedures:", error);
  }
};
