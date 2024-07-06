import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";
import Contrato from "./contratos";

class Factura extends Model {
  public idFactura!: number;
  public idSucursal!: number;
  public idEmpleado!: number;
  public idCliente!: number;
  public idContrato!: number;
  public idTipoComprobante!: number;
  public fechaFactura!: Date;
  public metodoPagoFactura!: string;
  public impuestosFactura!: number;
  public totalFactura!: number;
  public iscFactura!: boolean;
}

Factura.init(
  {
    idFactura: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    idCliente: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    idContrato: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "Contratos",
        key: "idContrato",
      },
    },
    idTipoComprobante: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    fechaFactura: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    metodoPagoFactura: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    impuestosFactura: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    totalFactura: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    iscFactura: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    tableName: "Facturas",
    sequelize,
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

export default Factura;
