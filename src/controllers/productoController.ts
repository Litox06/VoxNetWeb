import sequelize from "../config/database";
import { Response } from "express";
import { IGetUserAuthInfoRequest } from "../interfaces/cliente";

export const comprarProducto = async (
  req: IGetUserAuthInfoRequest,
  res: Response
) => {
  const { idProducto } = req.body;
  const idCliente = req.userId;
  try {
    // Calling the stored procedure
    const result = await sequelize.query(
      "CALL ComprarProducto(:idCliente, :idProducto)",
      {
        replacements: {
          idCliente,
          idProducto,
        },
      }
    );

    return res.status(200).json(result[0]);
  } catch (error) {
    console.error("Error purchasing product:", error);
    res.status(500).json({ message: "Server error during purchase process" });
  }
};

export const getAllProducts = async (
  req: IGetUserAuthInfoRequest,
  res: Response
) => {
  try {
    // Calling the stored procedure
    const result = await sequelize.query("CALL GetAllProducts()");

    if (result) {
      return res.status(200).json({
        message: "Products retrieved successfully",
        products: result,
      });
    } else {
      return res.status(404).json({ message: "No products found" });
    }
  } catch (error) {
    console.error("Error retrieving products:", error);
    res.status(500).json({ message: "Server error during retrieval process" });
  }
};

export const removeProductoFromFactura = async (
  req: IGetUserAuthInfoRequest,
  res: Response
) => {
  const { idFactura, idProducto } = req.body;

  try {
    // Calling the stored procedure
    const result = await sequelize.query(
      "CALL RemoveProductoFromFactura(:idFactura, :idProducto)",
      {
        replacements: {
          idFactura,
          idProducto,
        },
      }
    );

    return res.status(200).json(result[0]);
  } catch (error) {
    console.error("Error removing product from invoice:", error);
    res.status(500).json({ message: "Server error during removal process" });
  }
};
