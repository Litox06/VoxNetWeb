import React from "react";
import { useLocation } from "react-router-dom";

const PaymentConfirmation: React.FC = () => {
  const location = useLocation();

  return (
    <div>
      <h1>Payment Confirmation</h1>
      <p>Your payment was processed successfully.</p>
      <p>Details: {location.search}</p>
    </div>
  );
};

export default PaymentConfirmation;
