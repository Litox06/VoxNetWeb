import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";

class Producto extends Model {
  public idProducto!: number;
  public idCategoriaPro!: number;
  public nombreProducto!: string;
  public descripcionProducto!: string;
  public precioProducto!: number;
  public disponibilidadProducto!: boolean;
}

Producto.init(
  {
    idProducto: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    idCategoriaPro: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    nombreProducto: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    descripcionProducto: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    precioProducto: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    disponibilidadProducto: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    tableName: "Productos",
    sequelize,
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

export default Producto;
