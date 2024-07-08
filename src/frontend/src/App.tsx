import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import PaymentPage from "./pages/PaymentPage";
import PaymentConfirmation from "./pages/PaymentConfirmation";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/payment"
          element={<ProtectedRoute component={PaymentPage} />}
        />
        <Route
          path="/payment-confirmation"
          element={<ProtectedRoute component={PaymentConfirmation} />}
        />
      </Routes>
    </Router>
  );
};

export default App;
