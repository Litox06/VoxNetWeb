import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";

class ServiciosContrato extends Model {
  public idContrato!: number;
  public idServicio!: number;
}

ServiciosContrato.init(
  {
    idContrato: {
      type: DataTypes.INTEGER.UNSIGNED,
      references: {
        model: "Contratos",
        key: "idContrato",
      },
      primaryKey: true,
      allowNull: false,
    },
    idServicio: {
      type: DataTypes.INTEGER.UNSIGNED,
      references: {
        model: "Servicios",
        key: "idServicio",
      },
      primaryKey: true,
      allowNull: false,
    },
  },
  {
    tableName: "ServiciosContrato",
    sequelize,
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

export default ServiciosContrato;
