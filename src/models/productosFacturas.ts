import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";

class ProductoFactura extends Model {
  public idFactura!: number;
  public idProducto!: number;
}

ProductoFactura.init(
  {
    idFactura: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
    },
    idProducto: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
    },
  },
  {
    tableName: "ProductosFacturas",
    sequelize,
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

export default ProductoFactura;
