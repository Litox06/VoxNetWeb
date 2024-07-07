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

  const procedures = [
    {
      name: "InsertCliente",
      sql: `
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
                nombreCliente, direccionCliente, telefonoCliente, correoCliente, cedulaCliente, passwordCliente, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()
            );
        END;
      `,
    },
    {
      name: "LoginCliente",
      sql: `
        CREATE PROCEDURE LoginCliente(
            IN correo VARCHAR(50)
        )
        BEGIN
            SELECT * FROM Clientes WHERE correoCliente = correo;
        END;
      `,
    },
    {
      name: "RecoverPasswordCliente",
      sql: `
        CREATE PROCEDURE RecoverPasswordCliente(
            IN correo VARCHAR(50)
        )
        BEGIN
            SELECT * FROM Clientes WHERE correoCliente = correo;
        END;
      `,
    },
    {
      name: "UpdatePasswordCliente",
      sql: `
        CREATE PROCEDURE UpdatePasswordCliente(
            IN correo VARCHAR(50),
            IN newPasswordCliente VARCHAR(64)
        )
        BEGIN
            UPDATE Clientes 
            SET passwordCliente = newPasswordCliente, updatedAt = CURRENT_TIMESTAMP()
            WHERE correoCliente = correo;
        END;
      `,
    },
    {
      name: "InsertMetodoPago",
      sql: `
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
                numeroTarjeta, titularTarjeta, vencimiento, cvv, idCliente, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()
            );
        END;
      `,
    },
    {
      name: "GetPaymentMethods",
      sql: `
        CREATE PROCEDURE GetPaymentMethods(
            IN input_idCliente INT
        )
        BEGIN
            SELECT * FROM MetodoPago WHERE idCliente = input_idCliente;
        END;
      `,
    },
    {
      name: "CheckMetodoPagoOwnership",
      sql: `
        CREATE PROCEDURE CheckMetodoPagoOwnership(
            IN input_idMetodoPago INT,
            IN input_idCliente INT
        )
        BEGIN
            SELECT * FROM MetodoPago WHERE idMetodoPago = input_idMetodoPago AND idCliente = input_idCliente;
        END;
      `,
    },
    {
      name: "DeleteMetodoPago",
      sql: `
        CREATE PROCEDURE DeleteMetodoPago(
            IN input_idMetodoPago INT
        )
        BEGIN
            DELETE FROM MetodoPago WHERE idMetodoPago = input_idMetodoPago;
        END;
      `,
    },
    {
      name: "UpdateClient",
      sql: `
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
                updatedAt = CURRENT_TIMESTAMP()
            WHERE idCliente = input_idCliente;
        END;
      `,
    },
    {
      name: "SubscribeToService",
      sql: `
        CREATE PROCEDURE SubscribeToService(
            IN input_idCliente INT,
            IN input_idServicio INT
        )
        BEGIN
            DECLARE contractCreated INT;
            DECLARE defaultTipoComprobante INT;
            DECLARE serviceDescription VARCHAR(255);
            DECLARE existingFacturaId INT;
            DECLARE existingContratoId INT;
            DECLARE totalImpuestosFactura DECIMAL(10, 2);
            DECLARE totalFactura DECIMAL(10, 2);
            DECLARE totalIscFactura DECIMAL(10, 2);
            
            -- Get the default idTipoComprobante
            SELECT idTipoComprobante INTO defaultTipoComprobante FROM Comprobante WHERE tipoComprobante = 'N/A' LIMIT 1;
            
            -- Get the service description
            SELECT descripcionServicio INTO serviceDescription FROM Servicios WHERE idServicio = input_idServicio LIMIT 1;
            
            -- Debugging: Check if the serviceDescription is correctly retrieved
            IF serviceDescription IS NULL THEN
                SET serviceDescription = 'No description available';
            END IF;
            
            -- Check for existing factura with state 'Pendiente de Activación: Pago Requerido'
            SELECT f.idFactura, c.idContrato INTO existingFacturaId, existingContratoId
            FROM Facturas f
            JOIN Contratos c ON f.idContrato = c.idContrato
            WHERE c.idCliente = input_idCliente AND c.estadoContrato = 'Pendiente de Activación: Pago Requerido' LIMIT 1;
            
            -- If an existing factura is found, append to it
            IF existingFacturaId IS NOT NULL THEN
                -- Create a new contract
                INSERT INTO Contratos (
                    idCliente,
                    idServicio,
                    fechaInicioContrato,
                    fechaFinContrato,
                    descripcionContrato,
                    estadoContrato,
                    createdAt,
                    updatedAt
                ) VALUES (
                    input_idCliente,
                    input_idServicio,
                    CURRENT_TIMESTAMP(),
                    DATE_ADD(CURRENT_TIMESTAMP(), INTERVAL 1 MONTH),
                    serviceDescription,
                    'Pendiente de Activación: Pago Requerido',
                    CURRENT_TIMESTAMP(),
                    CURRENT_TIMESTAMP()
                );
                
                -- Get the ID of the newly created contract
                SET contractCreated = LAST_INSERT_ID();
                
                -- Calculate the new totals
                SET totalImpuestosFactura = (SELECT precioServicio * 0.18 FROM Servicios WHERE idServicio = input_idServicio);
                SET totalFactura = (SELECT precioServicio * 1.28 FROM Servicios WHERE idServicio = input_idServicio);
                SET totalIscFactura = (SELECT precioServicio * 0.10 FROM Servicios WHERE idServicio = input_idServicio);
                
                -- Update existing factura with the new service details and taxes
                UPDATE Facturas f
                SET
                    f.impuestosFactura = f.impuestosFactura + totalImpuestosFactura,
                    f.totalFactura = f.totalFactura + totalFactura,
                    f.iscFactura = f.iscFactura + totalIscFactura,
                    f.updatedAt = CURRENT_TIMESTAMP()
                WHERE f.idFactura = existingFacturaId;
                
            ELSE
                -- Create a new contract
                INSERT INTO Contratos (
                    idCliente,
                    idServicio,
                    fechaInicioContrato,
                    fechaFinContrato,
                    descripcionContrato,
                    estadoContrato,
                    createdAt,
                    updatedAt
                ) VALUES (
                    input_idCliente,
                    input_idServicio,
                    CURRENT_TIMESTAMP(),
                    DATE_ADD(CURRENT_TIMESTAMP(), INTERVAL 1 MONTH),
                    serviceDescription,
                    'Pendiente de Activación: Pago Requerido',
                    CURRENT_TIMESTAMP(),
                    CURRENT_TIMESTAMP()
                );
                
                -- Get the ID of the newly created contract
                SET contractCreated = LAST_INSERT_ID();
                
                -- Prepare initial billing (Factura)
                INSERT INTO Facturas (
                    idCliente,
                    idContrato,
                    idTipoComprobante,
                    fechaFactura,
                    metodoPagoFactura,
                    impuestosFactura, -- ITBIS tax
                    totalFactura,     -- Total including ISC and ITBIS tax
                    iscFactura,       -- ISC tax
                    createdAt,
                    updatedAt
                ) VALUES (
                    input_idCliente,
                    contractCreated,
                    defaultTipoComprobante, -- Use the default idTipoComprobante
                    CURRENT_TIMESTAMP(),
                    'Pendiente',
                    (SELECT precioServicio * 0.18 FROM Servicios WHERE idServicio = input_idServicio), -- ITBIS tax - 18%
                    (SELECT precioServicio * 1.28 FROM Servicios WHERE idServicio = input_idServicio), -- Total including ISC and ITBIS tax
                    (SELECT precioServicio * 0.10 FROM Servicios WHERE idServicio = input_idServicio), -- ISC tax - 10%
                    CURRENT_TIMESTAMP(),
                    CURRENT_TIMESTAMP()
                );
            END IF;
            
            -- Check if everything went well
            IF contractCreated > 0 THEN
                SELECT 'Contract and pending billing created successfully' AS message;
            ELSE
                SELECT 'Failed to create contract or billing' AS message;
            END IF;
        END;
      `,
    },
  ];

  try {
    let proceduresCreated = false;

    for (const procedure of procedures) {
      if (!(await checkProcedureExistence(procedure.name))) {
        console.log(`Creating procedure ${procedure.name}`);
        await sequelize.query(procedure.sql);
        proceduresCreated = true;
      }
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
