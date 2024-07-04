import Cliente from "./clientes";
import MetodoPago from "./metodoPago";
import Categoria from "./categoria";
import Producto from "./productos";
import Factura from "./facturas";
import ProductoFactura from "./productosFacturas";
import Comprobante from "./comprobante";
import Contrato from "./contratos";
import Servicio from "./servicios";

// Cliente - MetodoPago
Cliente.hasMany(MetodoPago, {
  foreignKey: "idCliente",
  as: "metodosPago",
});

MetodoPago.belongsTo(Cliente, {
  foreignKey: "idCliente",
  as: "cliente",
});

// Categoria - Producto
Categoria.hasMany(Producto, {
  foreignKey: "idCategoriaPro",
  as: "productos",
});

Producto.belongsTo(Categoria, {
  foreignKey: "idCategoriaPro",
  as: "categoria",
});

// Factura - Cliente
Factura.belongsTo(Cliente, {
  foreignKey: "idCliente",
  as: "cliente",
});

Cliente.hasMany(Factura, {
  foreignKey: "idCliente",
  as: "facturas",
});

// Factura - Comprobante
Factura.belongsTo(Comprobante, {
  foreignKey: "idTipoComprobante",
  as: "comprobante",
});

Comprobante.hasMany(Factura, {
  foreignKey: "idTipoComprobante",
  as: "facturas",
});

// Factura - ProductoFactura
Factura.hasMany(ProductoFactura, {
  foreignKey: "idFactura",
  as: "productosFacturas",
});

ProductoFactura.belongsTo(Factura, {
  foreignKey: "idFactura",
  as: "factura",
});

// Producto - ProductoFactura
Producto.hasMany(ProductoFactura, {
  foreignKey: "idProducto",
  as: "productosFacturas",
});

ProductoFactura.belongsTo(Producto, {
  foreignKey: "idProducto",
  as: "producto",
});

Contrato.belongsTo(Cliente, {
  foreignKey: "idCliente",
  as: "cliente",
});

Cliente.hasMany(Contrato, {
  foreignKey: "idCliente",
  as: "contratos",
});

Contrato.belongsTo(Servicio, {
  foreignKey: "idServicio",
  as: "servicio",
});

Servicio.hasMany(Contrato, {
  foreignKey: "idServicio",
  as: "contratos",
});
