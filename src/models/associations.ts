import Cliente from "./cliente";
import MetodoPago from "./metodoPago";

Cliente.hasMany(MetodoPago, {
  foreignKey: "idCliente",
  as: "metodosPago",
});

MetodoPago.belongsTo(Cliente, {
  foreignKey: "idCliente",
  as: "cliente",
});
