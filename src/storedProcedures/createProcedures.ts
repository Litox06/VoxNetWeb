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

  const createInsertMetodoPagoProcedure = `
    CREATE PROCEDURE InsertMetodoPago(
        IN numeroTarjeta VARCHAR(64),
        IN titularTarjeta VARCHAR(100),
        IN vencimiento VARCHAR(5),
        IN cvv VARCHAR(3),
        IN idCliente INT
    )
    BEGIN
        INSERT INTO MetodoPago (
            numeroTarjeta, titularTarjeta, vencimiento, cvv, idCliente, createdAt, updatedAt
        ) VALUES (
            numeroTarjeta, titularTarjeta, vencimiento, cvv, idCliente, NOW(), NOW()
        );
    END;
  `;

  const createGetPaymentMethodsProcedure = `
  CREATE PROCEDURE GetPaymentMethods(
      IN input_idCliente INT
  )
  BEGIN
      SELECT * FROM MetodoPago WHERE idCliente = input_idCliente;
  END;
`;

  const createCheckMetodoPagoOwnershipProcedure = `
    CREATE PROCEDURE CheckMetodoPagoOwnership(
        IN input_idMetodoPago INT,
        IN input_idCliente INT
    )
    BEGIN
        SELECT * FROM MetodoPago WHERE idMetodoPago = input_idMetodoPago AND idCliente = input_idCliente;
    END;
`;

  const createDeleteMetodoPagoProcedure = `
    CREATE PROCEDURE DeleteMetodoPago(
        IN input_idMetodoPago INT
    )
    BEGIN
        DELETE FROM MetodoPago WHERE idMetodoPago = input_idMetodoPago;
    END;
`;

  const createUpdateClienteProcedure = `
    CREATE PROCEDURE UpdateClient(
        IN input_idCliente INT,
        IN input_telefonoCliente VARCHAR(15),
        IN input_correoCliente VARCHAR(50),
        IN input_direccionCliente VARCHAR(100),
        IN input_newPasswordCliente VARCHAR(64)
    )
    BEGIN
        UPDATE Clientes
        SET 
            telefonoCliente = COALESCE(input_telefonoCliente, telefonoCliente),
            correoCliente = COALESCE(input_correoCliente, correoCliente),
            direccionCliente = COALESCE(input_direccionCliente, direccionCliente),
            passwordCliente = IF(input_newPasswordCliente IS NOT NULL, input_newPasswordCliente, passwordCliente),
            updatedAt = NOW()
        WHERE idCliente = input_idCliente;
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
    if (!(await checkProcedureExistence("InsertMetodoPago"))) {
      await sequelize.query(createInsertMetodoPagoProcedure);
      proceduresCreated = true;
    }
    if (!(await checkProcedureExistence("GetPaymentMethods"))) {
      await sequelize.query(createGetPaymentMethodsProcedure);
      proceduresCreated = true;
    }

    if (!(await checkProcedureExistence("DeleteMetodoPago"))) {
      await sequelize.query(createDeleteMetodoPagoProcedure);
      proceduresCreated = true;
    }

    if (!(await checkProcedureExistence("CheckMetodoPagoOwnership"))) {
      await sequelize.query(createCheckMetodoPagoOwnershipProcedure);
      proceduresCreated = true;
    }

    if (!(await checkProcedureExistence("UpdateCliente"))) {
      await sequelize.query(createUpdateClienteProcedure);
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
