import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";

class Categoria extends Model {
  public idCategoriaPro!: number;
  public categoriaProducto!: string;
}

Categoria.init(
  {
    idCategoriaPro: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    categoriaProducto: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    tableName: "Categoria",
    sequelize,
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

export default Categoria;
