import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";
import Factura from "./facturas";

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
    },
  },
  {
    tableName: "Comprobante",
    sequelize,
  }
);

export default Comprobante;
