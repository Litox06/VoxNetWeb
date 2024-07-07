import Cliente from "./clientes";
import MetodoPago from "./metodoPago";
import Categoria from "./categoria";
import Producto from "./productos";
import Factura from "./facturas";
import ProductoFactura from "./productosFacturas";
import Comprobante from "./comprobante";
import Contrato from "./contratos";
import Servicio from "./servicios";

// Cliente has many MetodoPago
Cliente.hasMany(MetodoPago, {
  foreignKey: "idCliente",
  as: "metodosPago",
});

// MetodoPago belongs to Cliente
MetodoPago.belongsTo(Cliente, {
  foreignKey: "idCliente",
  as: "cliente",
});

// Categoria has many Producto
Categoria.hasMany(Producto, {
  foreignKey: "idCategoriaPro",
  as: "productos",
});

// Producto belongs to Categoria
Producto.belongsTo(Categoria, {
  foreignKey: "idCategoriaPro",
  as: "categoria",
});

// Factura belongs to Cliente
Factura.belongsTo(Cliente, {
  foreignKey: "idCliente",
  as: "cliente",
});

// Cliente has many Factura
Cliente.hasMany(Factura, {
  foreignKey: "idCliente",
  as: "facturas",
});

// Factura belongs to Comprobante
Factura.belongsTo(Comprobante, {
  foreignKey: "idTipoComprobante",
  as: "comprobante",
});

// Comprobante has many Factura
Comprobante.hasMany(Factura, {
  foreignKey: "idTipoComprobante",
  as: "facturas",
});

// Factura has many ProductoFactura
Factura.hasMany(ProductoFactura, {
  foreignKey: "idFactura",
  as: "productosFacturas",
});

// Factura belongs to Contrato
Factura.belongsTo(Contrato, {
  foreignKey: "idContrato",
  as: "contrato",
});

// Contrato has many Factura
Contrato.hasMany(Factura, {
  foreignKey: "idContrato",
  as: "facturas",
});

// ProductoFactura belongs to Factura
ProductoFactura.belongsTo(Factura, {
  foreignKey: "idFactura",
  as: "factura",
});

// Producto has many ProductoFactura
Producto.hasMany(ProductoFactura, {
  foreignKey: "idProducto",
  as: "productosFacturas",
});

// ProductoFactura belongs to Producto
ProductoFactura.belongsTo(Producto, {
  foreignKey: "idProducto",
  as: "producto",
});

// Contrato belongs to Cliente
Contrato.belongsTo(Cliente, {
  foreignKey: "idCliente",
  as: "cliente",
});

// Cliente has many Contrato
Cliente.hasMany(Contrato, {
  foreignKey: "idCliente",
  as: "contratos",
});

// Contrato belongs to Servicio
Contrato.belongsTo(Servicio, {
  foreignKey: "idServicio",
  as: "servicio",
});

// Servicio has many Contrato
Servicio.hasMany(Contrato, {
  foreignKey: "idServicio",
  as: "contratos",
});
