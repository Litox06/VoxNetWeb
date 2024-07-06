import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";

class Comprobante extends Model {
  public idTipoComprobante!: number;
  public tipoComprobante!: string;
}

Comprobante.init(
  {
    idTipoComprobante: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    tipoComprobante: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "N/A",
    },
  },
  {
    tableName: "Comprobante",
    sequelize,
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

export default Comprobante;
