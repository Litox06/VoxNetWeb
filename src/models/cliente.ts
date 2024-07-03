import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";

class Cliente extends Model {
  public idCliente!: number;
  public nombreCliente!: string;
  public direccionCliente!: string;
  public telefonoCliente!: string;
  public correoCliente!: string;
  public cedulaCliente!: string;
  public passwordCliente!: string;
}

Cliente.init(
  {
    idCliente: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    nombreCliente: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    direccionCliente: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    telefonoCliente: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    correoCliente: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    cedulaCliente: {
      type: DataTypes.STRING(13),
      allowNull: false,
    },
    passwordCliente: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
  },
  {
    tableName: "Clientes",
    sequelize,
  }
);

export default Cliente;
