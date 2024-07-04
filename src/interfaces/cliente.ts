import { Request } from "express";

// Interface para extender el objeto Request de Express
// con una propiedad opcional userId para autenticacion
export interface IGetUserAuthInfoRequest extends Request {
  userId?: number;
}

// Interface para las solicitudes de registro, extendiendo IGetUserAuthInfoRequest
// y añadiendo un cuerpo estructurado para los datos de registro del usuario
export interface IRegisterRequest extends IGetUserAuthInfoRequest {
  body: {
    nombreCliente: string;
    direccion: string;
    sector: string;
    ciudad: string;
    provincia: string;
    telefonoCliente: string;
    correoCliente: string;
    cedulaCliente: string;
    password: string;
  };
}

// Interfaz que representa la estructura de un objeto Cliente,
// utilizada para los datos del cliente en toda la aplicacion
export interface ICliente {
  idCliente: number;
  nombreCliente: string;
  direccionCliente: string;
  telefonoCliente: string;
  correoCliente: string;
  cedulaCliente: string;
  passwordCliente: string;
}
