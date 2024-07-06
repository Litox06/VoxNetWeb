import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";

class Contrato extends Model {
  public idContrato!: number;
  public idCliente!: number;
  public idServicio!: number;
  public fechaInicioContrato!: Date;
  public fechaFinContrato!: Date;
  public descripcionContrato!: string;
  public estadoContrato!: string;
}

Contrato.init(
  {
    idContrato: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    idCliente: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    idServicio: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    fechaInicioContrato: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    fechaFinContrato: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    descripcionContrato: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    estadoContrato: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    tableName: "Contratos",
    sequelize,
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

export default Contrato;
