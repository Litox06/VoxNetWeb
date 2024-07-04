import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";

class Servicio extends Model {
  public idServicio!: number;
  public nombreServicio!: string;
  public descripcionServicio!: string;
  public precioServicio!: number;
}

Servicio.init(
  {
    idServicio: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    nombreServicio: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    descripcionServicio: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    precioServicio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: "Servicios",
    sequelize,
  }
);

export default Servicio;
