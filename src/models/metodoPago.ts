import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";

class MetodoPago extends Model {
  public idMetodoPago!: number;
  public numeroTarjeta!: string;
  public titularTarjeta!: string;
  public vencimiento!: string;
  public cvv!: string;
  public idCliente!: number;
}

MetodoPago.init(
  {
    idMetodoPago: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    numeroTarjeta: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    titularTarjeta: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    vencimiento: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    cvv: {
      type: DataTypes.STRING(3),
      allowNull: false,
    },
    idCliente: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
  },
  {
    tableName: "MetodoPago",
    sequelize,
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

export default MetodoPago;
