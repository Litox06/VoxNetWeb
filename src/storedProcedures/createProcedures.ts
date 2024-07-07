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
      name: "SubscribeToBundle",
      sql: `
        CREATE PROCEDURE SubscribeToBundle(
            IN input_idCliente INT,
            IN input_idServicios JSON
        )
        BEGIN
            DECLARE contractCreated INT;
            DECLARE defaultTipoComprobante INT;
            DECLARE serviceDescription VARCHAR(255);
            DECLARE existingFacturaId INT;
            DECLARE existingContratoId INT;
            DECLARE totalImpuestosFactura DECIMAL(10, 2) DEFAULT 0;
            DECLARE totalFactura DECIMAL(10, 2) DEFAULT 0;
            DECLARE totalIscFactura DECIMAL(10, 2) DEFAULT 0;
            DECLARE servicePrice DECIMAL(10, 2);
            DECLARE serviceCount INT DEFAULT 0;
    
            -- Get the default idTipoComprobante
            SELECT idTipoComprobante INTO defaultTipoComprobante FROM Comprobante WHERE tipoComprobante = 'N/A' LIMIT 1;
    
            -- Check for existing factura with state 'Pendiente de Activación: Pago Requerido'
            SELECT f.idFactura, c.idContrato INTO existingFacturaId, existingContratoId
            FROM Facturas f
            JOIN Contratos c ON f.idContrato = c.idContrato
            WHERE c.idCliente = input_idCliente AND c.estadoContrato = 'Pendiente de Activación: Pago Requerido' LIMIT 1;
    
            -- Loop through each service ID in the JSON array
            SET serviceCount = JSON_LENGTH(input_idServicios);
            WHILE serviceCount > 0 DO
                SET @serviceId = JSON_UNQUOTE(JSON_EXTRACT(input_idServicios, CONCAT('$[', serviceCount - 1, ']')));
                
                -- Get the service description and price
                SELECT descripcionServicio, precioServicio INTO serviceDescription, servicePrice FROM Servicios WHERE idServicio = @serviceId LIMIT 1;
                
                -- Debugging: Check if the serviceDescription is correctly retrieved
                IF serviceDescription IS NULL THEN
                    SET serviceDescription = 'No description available';
                END IF;
    
                -- Calculate the taxes
                SET totalImpuestosFactura = totalImpuestosFactura + (servicePrice * 0.18);
                SET totalFactura = totalFactura + (servicePrice * 1.28);
                SET totalIscFactura = totalIscFactura + (servicePrice * 0.10);
    
                -- Create a new contract for each service
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
                    @serviceId,
                    CURRENT_TIMESTAMP(),
                    DATE_ADD(CURRENT_TIMESTAMP(), INTERVAL 1 MONTH),
                    serviceDescription,
                    'Pendiente de Activación: Pago Requerido',
                    CURRENT_TIMESTAMP(),
                    CURRENT_TIMESTAMP()
                );
                
                -- Get the ID of the newly created contract
                SET contractCreated = LAST_INSERT_ID();
                
                -- Update existing factura or create a new one
                IF existingFacturaId IS NOT NULL THEN
                    -- Update existing factura with the new service details and taxes
                    UPDATE Facturas f
                    SET
                        f.impuestosFactura = f.impuestosFactura + (servicePrice * 0.18),
                        f.totalFactura = f.totalFactura + (servicePrice * 1.28),
                        f.iscFactura = f.iscFactura + (servicePrice * 0.10),
                        f.updatedAt = CURRENT_TIMESTAMP()
                    WHERE f.idFactura = existingFacturaId;
                ELSE
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
                        totalImpuestosFactura, -- ITBIS tax - 18%
                        totalFactura,          -- Total including ISC and ITBIS tax
                        totalIscFactura,       -- ISC tax - 10%
                        CURRENT_TIMESTAMP(),
                        CURRENT_TIMESTAMP()
                    );
                    -- Set existingFacturaId to the newly created factura
                    SET existingFacturaId = LAST_INSERT_ID();
                END IF;
    
                -- Decrement the service count
                SET serviceCount = serviceCount - 1;
            END WHILE;
            
            -- Check if everything went well
            IF contractCreated > 0 THEN
                SELECT 'Bundle contract and pending billing created successfully' AS message;
            ELSE
                SELECT 'Failed to create contract or billing' AS message;
            END IF;
        END;
      `,
    },
    {
      name: "GetSubscribedServices",
      sql: `
        CREATE PROCEDURE GetSubscribedServices(
            IN input_idCliente INT
        )
        BEGIN
            SELECT 
                s.idServicio,
                s.nombreServicio,
                s.descripcionServicio,
                s.precioServicio,
                c.estadoContrato,
                c.fechaInicioContrato,
                c.fechaFinContrato
            FROM 
                Servicios s
            JOIN 
                Contratos c ON s.idServicio = c.idServicio
            WHERE 
                c.idCliente = input_idCliente;
        END;
      `,
    },
    {
      name: "UpdateServicePlan",
      sql: `
        CREATE PROCEDURE UpdateServicePlan(
            IN input_idCliente INT,
            IN input_currentIdServicio INT,
            IN input_newIdServicio INT
        )
        BEGIN
            DECLARE currentContractState VARCHAR(50);
            DECLARE newServiceDescription VARCHAR(255);
            DECLARE currentContractId INT;
            DECLARE existingFacturaId INT;
            DECLARE newTotalImpuestosFactura DECIMAL(10, 2);
            DECLARE newTotalFactura DECIMAL(10, 2);
            DECLARE newTotalIscFactura DECIMAL(10, 2);
            
            -- Get the current contract state and contract ID
            SELECT estadoContrato, idContrato INTO currentContractState, currentContractId
            FROM Contratos
            WHERE idCliente = input_idCliente AND idServicio = input_currentIdServicio
            LIMIT 1;
            
            -- Check if the current contract state allows updating
            IF currentContractState NOT IN ('Activo: Pago Atrasado', 'Inactivo: Pago Vencido') THEN
                -- Get the new service description
                SELECT descripcionServicio INTO newServiceDescription
                FROM Servicios
                WHERE idServicio = input_newIdServicio
                LIMIT 1;
                
                -- Update the contract with the new service
                UPDATE Contratos
                SET idServicio = input_newIdServicio,
                    descripcionContrato = newServiceDescription,
                    updatedAt = CURRENT_TIMESTAMP()
                WHERE idCliente = input_idCliente AND idServicio = input_currentIdServicio;
                
                -- Get the existing factura ID
                SELECT idFactura INTO existingFacturaId
                FROM Facturas
                WHERE idContrato = currentContractId
                LIMIT 1;
                
                -- Calculate the new totals for the factura
                SET newTotalImpuestosFactura = (SELECT precioServicio * 0.18 FROM Servicios WHERE idServicio = input_newIdServicio);
                SET newTotalFactura = (SELECT precioServicio * 1.28 FROM Servicios WHERE idServicio = input_newIdServicio);
                SET newTotalIscFactura = (SELECT precioServicio * 0.10 FROM Servicios WHERE idServicio = input_newIdServicio);
                
                -- Update the existing factura with the new service details and taxes
                UPDATE Facturas
                SET
                    impuestosFactura = newTotalImpuestosFactura,
                    totalFactura = newTotalFactura,
                    iscFactura = newTotalIscFactura,
                    updatedAt = CURRENT_TIMESTAMP()
                WHERE idFactura = existingFacturaId;
                
                SELECT 'Service plan updated and billing details adjusted successfully' AS message;
            ELSE
                SELECT 'Cannot update service plan: Contract is either overdue or inactive' AS message;
            END IF;
        END;
      `,
    },
    {
      name: "CancelService",
      sql: `
        CREATE PROCEDURE CancelService(
            IN input_idCliente INT,
            IN input_idServicio INT
        )
        BEGIN
            DECLARE var_contractState VARCHAR(50);
            DECLARE var_serviceDescription VARCHAR(255);
            DECLARE var_contractId INT;
            DECLARE var_facturaId INT;
            DECLARE var_servicePrice DECIMAL(10, 2);
            DECLARE var_totalImpuestosFactura DECIMAL(10, 2);
            DECLARE var_totalFactura DECIMAL(10, 2);
            DECLARE var_totalIscFactura DECIMAL(10, 2);
    
            -- Get the current contract state and description
            SELECT estadoContrato, descripcionContrato, idContrato INTO var_contractState, var_serviceDescription, var_contractId
            FROM Contratos
            WHERE idCliente = input_idCliente AND idServicio = input_idServicio
            LIMIT 1;
    
            -- Check if the contract state allows cancellation
            IF var_contractState = 'Activo: Al Día' OR var_serviceDescription LIKE '%NOW%' THEN
                -- Get the factura ID associated with the contract
                SELECT idFactura INTO var_facturaId
                FROM Facturas
                WHERE idContrato = var_contractId
                LIMIT 1;
    
                -- Get the service price for calculation
                SELECT precioServicio INTO var_servicePrice FROM Servicios WHERE idServicio = input_idServicio LIMIT 1;
    
                -- Calculate the new totals for the factura
                SET var_totalImpuestosFactura = IFNULL((SELECT impuestosFactura - (var_servicePrice * 0.18) FROM Facturas WHERE idFactura = var_facturaId), 0);
                SET var_totalFactura = IFNULL((SELECT totalFactura - (var_servicePrice * 1.28) FROM Facturas WHERE idFactura = var_facturaId), 0);
                SET var_totalIscFactura = IFNULL((SELECT iscFactura - (var_servicePrice * 0.10) FROM Facturas WHERE idFactura = var_facturaId), 0);
    
                -- Update the existing factura with the new totals
                UPDATE Facturas
                SET
                    impuestosFactura = var_totalImpuestosFactura,
                    totalFactura = var_totalFactura,
                    iscFactura = var_totalIscFactura,
                    updatedAt = CURRENT_TIMESTAMP()
                WHERE idFactura = var_facturaId;
    
                -- Mark the contract as canceled
                UPDATE Contratos
                SET estadoContrato = 'Cancelado',
                    updatedAt = CURRENT_TIMESTAMP()
                WHERE idContrato = var_contractId;
    
                SELECT 'Service canceled and billing updated successfully' AS message;
            ELSE
                SELECT 'Cannot cancel service: Contract is either not in good standing or not a NOW service' AS message;
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
    {
      name: "InsertAllCategorias",
      sql: `
          CREATE PROCEDURE InsertAllCategorias()
          BEGIN
              -- Insertar categorías
              INSERT INTO Categoria (categoriaProducto, createdAt, updatedAt) VALUES 
                  ('Smartphones', CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
                  ('TVs', CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
                  ('Teléfonos', CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
                  ('Modem para WiFi', CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());
          END;
      `,
    },
    {
      name: "InsertAllProductos",
      sql: `
        CREATE PROCEDURE InsertAllProductos()
        BEGIN
            -- Insertar productos de la categoría 'Smartphones'
            INSERT INTO Productos (idCategoriaPro, nombreProducto, descripcionProducto, precioProducto, disponibilidadProducto, createdAt, updatedAt)
            VALUES 
            ((SELECT idCategoriaPro FROM Categoria WHERE categoriaProducto = 'Smartphones'), 'iPhone 13', '128GB, Midnight', 79990, TRUE, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
            ((SELECT idCategoriaPro FROM Categoria WHERE categoriaProducto = 'Smartphones'), 'Samsung Galaxy S21', '128GB, Phantom Gray', 69990, TRUE, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
            ((SELECT idCategoriaPro FROM Categoria WHERE categoriaProducto = 'Smartphones'), 'Google Pixel 6', '128GB, Stormy Black', 59990, TRUE, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
            ((SELECT idCategoriaPro FROM Categoria WHERE categoriaProducto = 'Smartphones'), 'OnePlus 9', '128GB, Astral Black', 49990, FALSE, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
            ((SELECT idCategoriaPro FROM Categoria WHERE categoriaProducto = 'Smartphones'), 'Sony Xperia 1 III', '256GB, Frosted Black', 119990, TRUE, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
            ((SELECT idCategoriaPro FROM Categoria WHERE categoriaProducto = 'Smartphones'), 'Xiaomi Mi 11', '128GB, Horizon Blue', 44990, TRUE, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
            ((SELECT idCategoriaPro FROM Categoria WHERE categoriaProducto = 'Smartphones'), 'Oppo Find X3 Pro', '256GB, Gloss Black', 109990, FALSE, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
            ((SELECT idCategoriaPro FROM Categoria WHERE categoriaProducto = 'Smartphones'), 'Huawei P40 Pro', '256GB, Silver Frost', 84990, TRUE, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
            ((SELECT idCategoriaPro FROM Categoria WHERE categoriaProducto = 'Smartphones'), 'Asus ROG Phone 5', '256GB, Phantom Black', 99990, TRUE, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
            ((SELECT idCategoriaPro FROM Categoria WHERE categoriaProducto = 'Smartphones'), 'Nokia 8.3 5G', '128GB, Polar Night', 39990, FALSE, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());
    
            -- Insertar productos de la categoría 'TVs'
            INSERT INTO Productos (idCategoriaPro, nombreProducto, descripcionProducto, precioProducto, disponibilidadProducto, createdAt, updatedAt)
            VALUES 
            ((SELECT idCategoriaPro FROM Categoria WHERE categoriaProducto = 'TVs'), 'Samsung QLED 4K', '65 inch, Q80A', 119990, TRUE, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
            ((SELECT idCategoriaPro FROM Categoria WHERE categoriaProducto = 'TVs'), 'LG OLED 4K', '55 inch, C1 Series', 129990, TRUE, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
            ((SELECT idCategoriaPro FROM Categoria WHERE categoriaProducto = 'TVs'), 'Sony Bravia 4K', '75 inch, X90J', 149990, TRUE, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
            ((SELECT idCategoriaPro FROM Categoria WHERE categoriaProducto = 'TVs'), 'TCL Roku TV', '50 inch, 4 Series', 39990, TRUE, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
            ((SELECT idCategoriaPro FROM Categoria WHERE categoriaProducto = 'TVs'), 'Vizio Smart TV', '70 inch, V-Series', 89990, TRUE, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
            ((SELECT idCategoriaPro FROM Categoria WHERE categoriaProducto = 'TVs'), 'Hisense ULED 4K', '65 inch, U6G', 74990, TRUE, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
            ((SELECT idCategoriaPro FROM Categoria WHERE categoriaProducto = 'TVs'), 'Panasonic LED TV', '40 inch, HX700', 19990, TRUE, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
            ((SELECT idCategoriaPro FROM Categoria WHERE categoriaProducto = 'TVs'), 'Philips Ambilight', '55 inch, PUS7906', 69990, TRUE, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
            ((SELECT idCategoriaPro FROM Categoria WHERE categoriaProducto = 'TVs'), 'Sharp 4K UHD', '60 inch, Aquos', 54990, TRUE, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
            ((SELECT idCategoriaPro FROM Categoria WHERE categoriaProducto = 'TVs'), 'Toshiba Fire TV', '43 inch, LF621U21', 29990, TRUE, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());
    
            -- Insertar productos de la categoría 'Teléfonos'
            INSERT INTO Productos (idCategoriaPro, nombreProducto, descripcionProducto, precioProducto, disponibilidadProducto, createdAt, updatedAt)
            VALUES 
            ((SELECT idCategoriaPro FROM Categoria WHERE categoriaProducto = 'Teléfonos'), 'Panasonic Cordless Phone', 'KX-TG6845', 5990, TRUE, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
            ((SELECT idCategoriaPro FROM Categoria WHERE categoriaProducto = 'Teléfonos'), 'VTech DECT 6.0', 'CS6719-2', 4990, TRUE, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
            ((SELECT idCategoriaPro FROM Categoria WHERE categoriaProducto = 'Teléfonos'), 'AT&T Corded Phone', 'CL2940', 3990, TRUE, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
            ((SELECT idCategoriaPro FROM Categoria WHERE categoriaProducto = 'Teléfonos'), 'Motorola DECT 6.0', 'CD5011', 6990, TRUE, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
            ((SELECT idCategoriaPro FROM Categoria WHERE categoriaProducto = 'Teléfonos'), 'Uniden DECT 6.0', 'D1760-2', 7990, TRUE, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
            ((SELECT idCategoriaPro FROM Categoria WHERE categoriaProducto = 'Teléfonos'), 'Philips Cordless Phone', 'XL4901S', 8990, TRUE, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
            ((SELECT idCategoriaPro FROM Categoria WHERE categoriaProducto = 'Teléfonos'), 'GE Digital Phone', '30524EE1', 3490, TRUE, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
            ((SELECT idCategoriaPro FROM Categoria WHERE categoriaProducto = 'Teléfonos'), 'RCA Cordless Phone', '25424RE1', 7990, TRUE, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
            ((SELECT idCategoriaPro FROM Categoria WHERE categoriaProducto = 'Teléfonos'), 'Alcatel Corded Phone', 'T56', 2990, TRUE, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
            ((SELECT idCategoriaPro FROM Categoria WHERE categoriaProducto = 'Teléfonos'), 'Siemens Gigaset', 'A120', 4990, TRUE, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());
    
            -- Insertar productos de la categoría 'Modem para WiFi'
            INSERT INTO Productos (idCategoriaPro, nombreProducto, descripcionProducto, precioProducto, disponibilidadProducto, createdAt, updatedAt)
            VALUES 
            ((SELECT idCategoriaPro FROM Categoria WHERE categoriaProducto = 'Modem para WiFi'), 'Netgear Nighthawk', 'AC1900 Smart WiFi Router', 7990, TRUE, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
            ((SELECT idCategoriaPro FROM Categoria WHERE categoriaProducto = 'Modem para WiFi'), 'TP-Link Archer', 'A7 AC1750 Wireless', 4990, TRUE, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
            ((SELECT idCategoriaPro FROM Categoria WHERE categoriaProducto = 'Modem para WiFi'), 'Asus RT-AC66U', 'Dual-Band Gigabit Router', 9990, TRUE, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
            ((SELECT idCategoriaPro FROM Categoria WHERE categoriaProducto = 'Modem para WiFi'), 'Linksys EA7300', 'Max-Stream AC1750', 5990, TRUE, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
            ((SELECT idCategoriaPro FROM Categoria WHERE categoriaProducto = 'Modem para WiFi'), 'Motorola MG7550', '16x4 Cable Modem', 11990, TRUE, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
            ((SELECT idCategoriaPro FROM Categoria WHERE categoriaProducto = 'Modem para WiFi'), 'Arris Surfboard', 'SBG6700AC', 8990, TRUE, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
            ((SELECT idCategoriaPro FROM Categoria WHERE categoriaProducto = 'Modem para WiFi'), 'D-Link AC1200', 'WiFi Router', 3990, TRUE, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
            ((SELECT idCategoriaPro FROM Categoria WHERE categoriaProducto = 'Modem para WiFi'), 'Google Nest WiFi', 'Router and Point', 13990, TRUE, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
            ((SELECT idCategoriaPro FROM Categoria WHERE categoriaProducto = 'Modem para WiFi'), 'Eero Pro 6', 'Mesh WiFi Router', 19990, TRUE, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
            ((SELECT idCategoriaPro FROM Categoria WHERE categoriaProducto = 'Modem para WiFi'), 'Netgear Orbi', 'Tri-band WiFi System', 17990, TRUE, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());
        END;
      `,
    },
    {
      name: "ComprarProducto",
      sql: `
        CREATE PROCEDURE ComprarProducto(
            IN input_idCliente INT,
            IN input_idProducto INT
        )
        BEGIN
            DECLARE defaultTipoComprobante INT;
            DECLARE productDescription VARCHAR(500);
            DECLARE productPrice DECIMAL(10, 2);
            DECLARE newFacturaId INT;
            DECLARE totalImpuestosFactura DECIMAL(10, 2);
            DECLARE totalFactura DECIMAL(10, 2);
            
            -- Get the default idTipoComprobante
            SELECT idTipoComprobante INTO defaultTipoComprobante 
            FROM Comprobante 
            WHERE tipoComprobante = 'N/A' 
            LIMIT 1;
    
            -- Get the product description and price
            SELECT descripcionProducto, precioProducto 
            INTO productDescription, productPrice 
            FROM Productos 
            WHERE idProducto = input_idProducto 
            LIMIT 1;
            
            -- Debugging: Check if the productDescription and productPrice are correctly retrieved
            IF productDescription IS NULL THEN
                SET productDescription = 'No description available';
            END IF;
    
            -- Calculate the totals
            SET totalImpuestosFactura = productPrice * 0.18;
            SET totalFactura = productPrice * 1.18;
    
            -- Create a new factura
            INSERT INTO Facturas (
                idCliente,
                idTipoComprobante,
                fechaFactura,
                metodoPagoFactura,
                impuestosFactura, -- ITBIS tax
                totalFactura,     -- Total including ITBIS tax
                createdAt,
                updatedAt
            ) VALUES (
                input_idCliente,
                defaultTipoComprobante, -- Use the default idTipoComprobante
                CURRENT_TIMESTAMP(),
                'Pendiente',
                totalImpuestosFactura, -- ITBIS tax - 18%
                totalFactura,          -- Total including ITBIS tax
                CURRENT_TIMESTAMP(),
                CURRENT_TIMESTAMP()
            );
    
            -- Get the ID of the newly created factura
            SET newFacturaId = LAST_INSERT_ID();
    
            -- Insert the product into ProductosFacturas
            INSERT INTO ProductosFacturas (
                idFactura,
                idProducto,
                createdAt,
                updatedAt
            ) VALUES (
                newFacturaId,
                input_idProducto,
                CURRENT_TIMESTAMP(),
                CURRENT_TIMESTAMP()
            );
    
            -- Check if everything went well
            IF newFacturaId IS NOT NULL THEN
                SELECT 'Product added to new invoice successfully' AS message;
            ELSE
                SELECT 'Failed to create invoice or add product' AS message;
            END IF;
        END;
      `,
    },
    {
      name: "GetAllServices",
      sql: `
        CREATE PROCEDURE GetAllServices()
        BEGIN
            SELECT 
                idServicio,
                nombreServicio,
                descripcionServicio,
                precioServicio
            FROM 
                Servicios;
        END;
      `,
    },
    {
      name: "GetAllProducts",
      sql: `
        CREATE PROCEDURE GetAllProducts()
        BEGIN
            SELECT 
                idProducto,
                idCategoriaPro,
                nombreProducto,
                descripcionProducto,
                precioProducto,
                disponibilidadProducto
            FROM 
                Productos;
        END;
      `,
    },
    {
      name: "RemoveProductoFromFactura",
      sql: `
        CREATE PROCEDURE RemoveProductoFromFactura(
            IN input_idFactura INT,
            IN input_idProducto INT
        )
        BEGIN
            DECLARE productPrice DECIMAL(10, 2);
            DECLARE impuestosFactura DECIMAL(10, 2);
            DECLARE totalFactura DECIMAL(10, 2);
        
            -- Get the product price
            SELECT precioProducto INTO productPrice 
            FROM Productos 
            WHERE idProducto = input_idProducto 
            LIMIT 1;
        
            -- Calculate the new totals
            SET impuestosFactura = productPrice * 0.18;
            SET totalFactura = productPrice * 1.18;
        
            -- Remove the product from the invoice
            DELETE FROM ProductosFacturas 
            WHERE idFactura = input_idFactura 
            AND idProducto = input_idProducto;
        
            -- Update the factura totals
            UPDATE Facturas 
            SET 
                impuestosFactura = impuestosFactura - impuestosFactura,
                totalFactura = totalFactura - totalFactura,
                updatedAt = CURRENT_TIMESTAMP()
            WHERE idFactura = input_idFactura;
            
            -- Check if the factura has any products left
            IF (SELECT COUNT(*) FROM ProductosFacturas WHERE idFactura = input_idFactura) = 0 THEN
                -- Delete the factura if no products are left
                DELETE FROM Facturas WHERE idFactura = input_idFactura;
            END IF;
        
            -- Check if everything went well
            IF ROW_COUNT() > 0 THEN
                SELECT 'Product removed from invoice successfully' AS message;
            ELSE
                SELECT 'Failed to remove product from invoice' AS message;
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
