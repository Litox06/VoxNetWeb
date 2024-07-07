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
    {
      name: "InsertAllServices",
      sql: `
        CREATE PROCEDURE InsertAllServices()
        BEGIN
            -- INTERNET
            -- INTERNET MOVIL
            -- Insert VoxNet Básico
            INSERT INTO Servicios (nombreServicio, descripcionServicio, precioServicio, createdAt, updatedAt)
            VALUES ('Movil: Básico', '15 GB de datos móviles.', 799, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());
            -- Insert VoxNet Plus
            INSERT INTO Servicios (nombreServicio, descripcionServicio, precioServicio, createdAt, updatedAt)
            VALUES ('Movil: Plus', '30 GB de datos móviles.', 1599, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());
            -- Insert VoxNet Premier
            INSERT INTO Servicios (nombreServicio, descripcionServicio, precioServicio, createdAt, updatedAt)
            VALUES ('Movil: Premier', '50 GB de datos móviles.', 2599, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());
            
            -- MOVIL NOW
            -- Insert MovilNOW Satis
            INSERT INTO Servicios (nombreServicio, descripcionServicio, precioServicio, createdAt, updatedAt)
            VALUES ('MovilNOW: Satis', '1 GB de datos móviles.', 175, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());
            -- Insert MovilNOW Decens
            INSERT INTO Servicios (nombreServicio, descripcionServicio, precioServicio, createdAt, updatedAt)
            VALUES ('MovilNOW: Decens', '3 GB de datos móviles.', 275, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());
            -- Insert MovilNOW Firmus
            INSERT INTO Servicios (nombreServicio, descripcionServicio, precioServicio, createdAt, updatedAt)
            VALUES ('MovilNOW: Firmus', '5 GB de datos móviles.', 475, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());
            
            -- INTERNET RESIDENCIAL
            -- Insert VoxNet Conecta
            INSERT INTO Servicios (nombreServicio, descripcionServicio, precioServicio, createdAt, updatedAt)
            VALUES ('Internet Res.: Conecta', '150 Mbps de internet residencial.', 2300, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());
            -- Insert VoxNet More
            INSERT INTO Servicios (nombreServicio, descripcionServicio, precioServicio, createdAt, updatedAt)
            VALUES ('Internet Res.: More', '300 Mbps de internet residencial.', 3100, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());
            -- Insert VoxNet Ultra
            INSERT INTO Servicios (nombreServicio, descripcionServicio, precioServicio, createdAt, updatedAt)
            VALUES ('Internet Res.: Ultra', '500 Mbps de internet residencial.', 3900, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());
            
            -- INTERNET NOW
            -- Insert InternetNOW Initium
            INSERT INTO Servicios (nombreServicio, descripcionServicio, precioServicio, createdAt, updatedAt)
            VALUES ('InternetNOW: Initium', '15 Mbps de internet residencial.', 1200, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());
            -- Insert InternetNOW Medius
            INSERT INTO Servicios (nombreServicio, descripcionServicio, precioServicio, createdAt, updatedAt)
            VALUES ('InternetNOW: Medius', '25 Mbps de internet residencial.', 1500, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());
            -- Insert InternetNOW Summus
            INSERT INTO Servicios (nombreServicio, descripcionServicio, precioServicio, createdAt, updatedAt)
            VALUES ('InternetNOW: Summus', '50 Mbps de internet residencial.', 1800, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());
            
            -- MOVIL
            -- MOVIL POSTPAGO
            -- Insert Movil VoxNet Esencial
            INSERT INTO Servicios (nombreServicio, descripcionServicio, precioServicio, createdAt, updatedAt)
            VALUES ('Movil Postpago: Esencial', '25 GB datos móviles y 100 minutos.', 1975, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());
            -- Insert Movil VoxNet Óptimo
            INSERT INTO Servicios (nombreServicio, descripcionServicio, precioServicio, createdAt, updatedAt)
            VALUES ('Movil Postpago: Óptimo', '45 GB datos móviles y 200 minutos internacionales.', 2475, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());
            -- Insert Movil VoxNet Máximo
            INSERT INTO Servicios (nombreServicio, descripcionServicio, precioServicio, createdAt, updatedAt)
            VALUES ('Movil Postpago: Máximo', '55 GB datos móviles y minutos ilimitados nacionales/internacionales.', 2599, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());
            
            -- MOVIL PREPAGO
            -- Insert Movil Prepago: Diario
            INSERT INTO Servicios (nombreServicio, descripcionServicio, precioServicio, createdAt, updatedAt)
            VALUES ('Movil Prepago: Diario', '1 GB datos móviles, 50 minutos nac. y 15 minutos a E.E.U.U.', 150, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());
            -- Insert Movil Prepago: Semanal
            INSERT INTO Servicios (nombreServicio, descripcionServicio, precioServicio, createdAt, updatedAt)
            VALUES ('Movil Prepago: Semanal', '5 GB datos móviles, 100 minutos nac. y 50 minutos a E.E.U.U.', 500, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());
            -- Insert Movil Prepago: Mensual
            INSERT INTO Servicios (nombreServicio, descripcionServicio, precioServicio, createdAt, updatedAt)
            VALUES ('Movil Prepago: Mensual', '10 GB datos móviles y 300 minutos nac. y 150 minutos internacionales.', 950, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());
            
            -- ROAMING
            -- Insert Movil Roaming: Global Max
            INSERT INTO Servicios (nombreServicio, descripcionServicio, precioServicio, createdAt, updatedAt)
            VALUES ('Roaming: Global Max', '15 GB datos móviles y 100 minutos globales.', 3000, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());
            -- Insert Movil Roaming: Global Pro
            INSERT INTO Servicios (nombreServicio, descripcionServicio, precioServicio, createdAt, updatedAt)
            VALUES ('Roaming: Global Pro', '20 GB datos móviles y 300 minutos globales.', 3500, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());
            -- Insert Movil Roaming: Global Elite
            INSERT INTO Servicios (nombreServicio, descripcionServicio, precioServicio, createdAt, updatedAt)
            VALUES ('Roaming: Global Elite', '25 GB datos móviles y 500 minutos globales.', 4000, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());
            
            -- HOGAR
            -- VOZ RESIDENCIAL
            -- Insert Voz Residencial: Básico
            INSERT INTO Servicios (nombreServicio, descripcionServicio, precioServicio, createdAt, updatedAt)
            VALUES ('Voz Res.: Básico', '400 minutos.', 774, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());
            -- Insert Voz Residencial: Plus
            INSERT INTO Servicios (nombreServicio, descripcionServicio, precioServicio, createdAt, updatedAt)
            VALUES ('Voz Res.: Plus', '800 minutos.', 1034, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());
            -- Insert Voz Residencial: Premium
            INSERT INTO Servicios (nombreServicio, descripcionServicio, precioServicio, createdAt, updatedAt)
            VALUES ('Voz Res.: Premium', '2000 minutos.', 1995, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());
            
            -- LARGA DISTANCIA
            -- Insert Larga Distancia: Básico
            INSERT INTO Servicios (nombreServicio, descripcionServicio, precioServicio, createdAt, updatedAt)
            VALUES ('Larga Distancia: Básico', '200 minutos.', 162, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());
            -- Insert Larga Distancia: Plus
            INSERT INTO Servicios (nombreServicio, descripcionServicio, precioServicio, createdAt, updatedAt)
            VALUES ('Larga Distancia: Plus', '500 minutos.', 312, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());
            -- Insert Larga Distancia: Premium
            INSERT INTO Servicios (nombreServicio, descripcionServicio, precioServicio, createdAt, updatedAt)
            VALUES ('Larga Distancia: Premium', '1000 minutos.', 449, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());
            
            -- VXIOT
            -- Insert VXIoT: Básico
            INSERT INTO Servicios (nombreServicio, descripcionServicio, precioServicio, createdAt, updatedAt)
            VALUES ('VXIoT: Básico', 'Ideal para transformar tu hogar en un espacio inteligente.', 35000, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());
            -- Insert VXIoT: Premium
            INSERT INTO Servicios (nombreServicio, descripcionServicio, precioServicio, createdAt, updatedAt)
            VALUES ('VXIoT: Premium', 'Hogar completamente automatizado.', 58000, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());
            
            -- VXTV
            -- VXTV Planes
            -- Insert VXTV Fundamentum
            INSERT INTO Servicios (nombreServicio, descripcionServicio, precioServicio, createdAt, updatedAt)
            VALUES ('VXTV: Fundamentum', '100 canales nacionales e internacionales y 40 canales de música.', 999, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());
            -- Insert VXTV Secundus
            INSERT INTO Servicios (nombreServicio, descripcionServicio, precioServicio, createdAt, updatedAt)
            VALUES ('VXTV: Secundus', '200 canales nacionales e internacionales, 50 canales de música y 20 HD.', 1200, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());
            -- Insert VXTV Tertius
            INSERT INTO Servicios (nombreServicio, descripcionServicio, precioServicio, createdAt, updatedAt)
            VALUES ('VXTV: Tertius', '350 canales nacionales e internacionales, 100 canales de música y 50 HD.', 2000, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());
            
            -- Canales Adicionales
            -- Insert VXTV Fundamentum+
            INSERT INTO Servicios (nombreServicio, descripcionServicio, precioServicio, createdAt, updatedAt)
            VALUES ('Adicionales: Fundamentum+', '120 canales nacionales e internacionales y 50 canales de música.', 1199, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());
            -- Insert VXTV Secundus+
            INSERT INTO Servicios (nombreServicio, descripcionServicio, precioServicio, createdAt, updatedAt)
            VALUES ('Adicionales: Secundus+', '250 canales nacionales e internacionales, 70 canales de música, 35 HD.', 1500, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());
            -- Insert VXTV Tertius+
            INSERT INTO Servicios (nombreServicio, descripcionServicio, precioServicio, createdAt, updatedAt)
            VALUES ('Adicionales: Tertius+', '400 canales nacionales e internacionales, 150 canales de música, 100 HD.', 2500, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());
            
            -- VXTVNOW
            -- Insert VXTVNOW Initium
            INSERT INTO Servicios (nombreServicio, descripcionServicio, precioServicio, createdAt, updatedAt)
            VALUES ('VXTVNOW: Initium', '60 canales nacionales e internacionales.', 800, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());
            -- Insert VXTVNOW Medius
            INSERT INTO Servicios (nombreServicio, descripcionServicio, precioServicio, createdAt, updatedAt)
            VALUES ('VXTVNOW: Medius', '150 canales nacionales e internacionales.', 1050, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());
            -- Insert VXTVNOW Summus
            INSERT INTO Servicios (nombreServicio, descripcionServicio, precioServicio, createdAt, updatedAt)
            VALUES ('VXTVNOW: Summus', '250 canales nacionales e internacionales.', 1250, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());
            
            -- VXSpotsPass
            INSERT INTO Servicios (nombreServicio, descripcionServicio, precioServicio, createdAt, updatedAt)
            VALUES ('VXSpots Pass', 'Acceso a cientos de hotspots en territorio nacional.', 600, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());
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
