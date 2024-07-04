import sequelize from "../config/database";

export const createProcedures = async () => {
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
    await sequelize.query(createRegisterClienteProcedure);
    await sequelize.query(createLoginClienteProcedure);
    await sequelize.query(createRecoverPasswordClienteProcedure);
    await sequelize.query(createUpdatePasswordClienteProcedure);
    console.log("Stored procedures created successfully");
  } catch (error) {
    console.error("Error creating stored procedures:", error);
  }
};
