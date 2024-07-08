import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/PaymentForm.css";

const stripePublicKey = process.env.REACT_APP_STRIPE_PUBLIC_KEY;
const apiUrl = process.env.REACT_APP_API_URL;

if (!stripePublicKey) {
  throw new Error(
    "REACT_APP_STRIPE_PUBLIC_KEY is not defined in the environment variables"
  );
}

const stripePromise = loadStripe(stripePublicKey);

const CheckoutForm: React.FC = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [amount, setAmount] = useState<number>(0);
  const [invoiceDetails, setInvoiceDetails] = useState<any[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [idFactura, setIdFactura] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("User is not authenticated");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `${apiUrl}/api/client-portal/charges/client`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data.success && response.data.charges.length > 0) {
          const totalAmount = response.data.charges.reduce(
            (acc: number, charge: any) => acc + charge.totalFactura,
            0
          );
          setAmount(totalAmount);
          setInvoiceDetails(response.data.charges);
          setIdFactura(response.data.charges[0].idFactura);
        }
      } catch (error) {
        console.error("Error fetching charges:", error);
        setError("Failed to fetch invoice details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceDetails();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      return;
    }

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
    });

    if (error) {
      console.log("[error]", error);
    } else {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("User is not authenticated");
          return;
        }

        const response = await axios.post(
          `${apiUrl}/api/client-portal/checkout/charge`,
          {
            amount: amount,
            source: paymentMethod.id,
            currency: "dop",
            idFactura: idFactura,
            idMetodoPago: 1,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          setPaymentStatus("Payment successful!");
        } else {
          setPaymentStatus("Payment failed. Please try again.");
          console.error("Payment failed:", response.data.message);
        }
      } catch (error) {
        setPaymentStatus("Payment error. Please try again.");
        console.error("Error creating charge:", error);
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="payment-container">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Detalles de la Factura</h2>
        </div>
        <div className="card-body">
          {invoiceDetails.map((detail: any) => (
            <div key={detail.idFactura} className="mb-3">
              <p>
                <b>ID de la Factura:</b> {detail.idFactura}
              </p>
              <p>
                <b>Monto:</b>{" "}
                {new Intl.NumberFormat("es-DO", {
                  style: "currency",
                  currency: "DOP",
                }).format(detail.totalFactura)}
              </p>
              <p>
                <b>Fecha:</b>{" "}
                {new Date(detail.fechaFactura).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </p>
            </div>
          ))}
        </div>
      </div>
      <form onSubmit={handleSubmit} className="payment-form mt-4">
        <div className="card">
          <div className="card-body">
            <CardElement
              className="form-control"
              options={{ hidePostalCode: true }}
            />
          </div>
        </div>
        <button
          type="submit"
          className="btn btn-primary btn-block mt-3"
          disabled={!stripe || amount === 0}
        >
          Pay{" "}
          {new Intl.NumberFormat("es-DO", {
            style: "currency",
            currency: "DOP",
          }).format(amount)}{" "}
          DOP
        </button>
      </form>
      {paymentStatus && <p className="payment-status">{paymentStatus}</p>}
    </div>
  );
};

const PaymentForm: React.FC = () => (
  <Elements stripe={stripePromise}>
    <CheckoutForm />
  </Elements>
);

export default PaymentForm;
