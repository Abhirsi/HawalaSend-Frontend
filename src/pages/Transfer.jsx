import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { transferAPI } from "../api";

// ✅ Floating Support Button
const SupportButton = () => (
  <a
    href="/support"
    style={{
      position: "fixed",
      bottom: "20px",
      right: "20px",
      background: "linear-gradient(135deg, #1976d2, #2e7d32)",
      color: "white",
      borderRadius: "50%",
      width: "56px",
      height: "56px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "1.5rem",
      textDecoration: "none",
      boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
      zIndex: 1000,
    }}
    title="Chat with Support"
  >
    💬
  </a>
);

const Transfer = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [balance, setBalance] = useState(2500.0);

  const [transferData, setTransferData] = useState({
    recipientEmail: "",
    amount: "",
    description: "",
    pin: "",
    paymentMethod: "interac",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [transferResult, setTransferResult] = useState(null);

  // Exchange + fees
  const exchangeRate = 110.45;
  const feePercentage = 0.01;
  const fixedFee = 4.99;

  useEffect(() => {
    if (!currentUser) navigate("/login");
  }, [currentUser, navigate]);

  const formatCurrency = (amount, currency = "CAD") =>
    new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency,
    }).format(amount);

  const formatKES = (amount) =>
    new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);

  const calculateReceiveAmount = () =>
    ((parseFloat(transferData.amount) || 0) * exchangeRate).toFixed(2);

  const calculateFee = () => {
    const amt = parseFloat(transferData.amount) || 0;
    return Math.max(amt * feePercentage, fixedFee);
  };

  const calculateTotal = () => {
    const amt = parseFloat(transferData.amount) || 0;
    return (amt + calculateFee()).toFixed(2);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (validationErrors[name])
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));

    if (name === "amount") {
      const numeric = value.replace(/[^0-9.]/g, "");
      if (numeric.split(".").length <= 2)
        setTransferData((p) => ({ ...p, [name]: numeric }));
    } else if (name === "pin") {
      setTransferData((p) => ({
        ...p,
        [name]: value.replace(/[^0-9]/g, "").slice(0, 6),
      }));
    } else {
      setTransferData((p) => ({ ...p, [name]: value }));
    }
  };

  const validateStep = (step) => {
    const errors = {};
    if (step >= 1) {
      if (!transferData.recipientEmail)
        errors.recipientEmail = "Recipient email required";
      if (!transferData.amount || parseFloat(transferData.amount) <= 0)
        errors.amount = "Enter valid amount";
      if (parseFloat(transferData.amount) > balance)
        errors.amount = "Insufficient balance";
    }
    if (step >= 2 && transferData.paymentMethod === "card") {
      if (!transferData.cardNumber || transferData.cardNumber.length < 16)
        errors.cardNumber = "Valid card number required";
      if (!transferData.expiry) errors.expiry = "Expiry required";
      if (!transferData.cvv || transferData.cvv.length < 3)
        errors.cvv = "CVV required";
    }
    if (step >= 3) {
      if (!transferData.pin || transferData.pin.length < 4)
        errors.pin = "PIN must be 4+ digits";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) setCurrentStep((s) => s + 1);
  };

  const handleBack = () => {
    setCurrentStep((s) => s - 1);
    setValidationErrors({});
  };

  const processTransfer = async () => {
    if (!validateStep(3)) return;
    setLoading(true);
    try {
      const response = await transferAPI.send({
        recipient_email: transferData.recipientEmail,
        amount: parseFloat(transferData.amount),
        description: transferData.description || "Money transfer",
        pin: transferData.pin,
        method: transferData.paymentMethod,
      });
      setTransferResult({
        success: true,
        transaction: response.data.transaction,
        newBalance: response.data.newBalance,
      });
      setBalance(response.data.newBalance);
      setCurrentStep(4);
    } catch (err) {
      setValidationErrors({
        general: err.response?.data?.error || "Transfer failed",
      });
    } finally {
      setLoading(false);
    }
  };

  // --- Render Steps ---
  const Step1_Details = () => (
    <div>
      <h2>Send Money</h2>
      <input
        type="text"
        name="amount"
        placeholder="Amount CAD"
        value={transferData.amount}
        onChange={handleInputChange}
      />
      {validationErrors.amount && <p>{validationErrors.amount}</p>}
      <p>They Receive: {formatKES(calculateReceiveAmount())}</p>
      <p>Fee: {formatCurrency(calculateFee())}</p>
      <input
        type="email"
        name="recipientEmail"
        placeholder="Recipient Email"
        value={transferData.recipientEmail}
        onChange={handleInputChange}
      />
      {validationErrors.recipientEmail && <p>{validationErrors.recipientEmail}</p>}
      <textarea
        name="description"
        placeholder="Description (optional)"
        value={transferData.description}
        onChange={handleInputChange}
      />
    </div>
  );

  const Step2_Payment = () => (
    <div>
      <h2>Select Payment</h2>
      <label>
        <input
          type="radio"
          name="paymentMethod"
          value="interac"
          checked={transferData.paymentMethod === "interac"}
          onChange={handleInputChange}
        />
        Interac e-Transfer
      </label>
      <label>
        <input
          type="radio"
          name="paymentMethod"
          value="card"
          checked={transferData.paymentMethod === "card"}
          onChange={handleInputChange}
        />
        Credit/Debit Card
      </label>
      {transferData.paymentMethod === "card" && (
        <>
          <input
            type="text"
            name="cardNumber"
            placeholder="Card Number"
            value={transferData.cardNumber}
            onChange={handleInputChange}
          />
          {validationErrors.cardNumber && <p>{validationErrors.cardNumber}</p>}
          <input
            type="text"
            name="expiry"
            placeholder="MM/YY"
            value={transferData.expiry}
            onChange={handleInputChange}
          />
          {validationErrors.expiry && <p>{validationErrors.expiry}</p>}
          <input
            type="text"
            name="cvv"
            placeholder="CVV"
            value={transferData.cvv}
            onChange={handleInputChange}
          />
          {validationErrors.cvv && <p>{validationErrors.cvv}</p>}
        </>
      )}
    </div>
  );

  const Step3_Confirm = () => (
    <div>
      <h2>Confirm</h2>
      <p>To: {transferData.recipientEmail}</p>
      <p>Amount: {formatCurrency(transferData.amount)}</p>
      <p>They Receive: {formatKES(calculateReceiveAmount())}</p>
      <p>Total: {formatCurrency(calculateTotal())}</p>
      <input
        type="password"
        name="pin"
        placeholder="Enter PIN"
        value={transferData.pin}
        onChange={handleInputChange}
      />
      {validationErrors.pin && <p>{validationErrors.pin}</p>}
      {validationErrors.general && <p>{validationErrors.general}</p>}
    </div>
  );

  const Step4_Success = () => (
    <div>
      <h2>✅ Transfer Successful!</h2>
      <p>
        Sent {formatCurrency(transferData.amount)} to{" "}
        {transferData.recipientEmail}
      </p>
      <p>New Balance: {formatCurrency(transferResult?.newBalance || balance)}</p>
      <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
    </div>
  );

  return (
    <div style={{ padding: "1rem", maxWidth: "600px", margin: "auto" }}>
      {currentStep === 1 && <Step1_Details />}
      {currentStep === 2 && <Step2_Payment />}
      {currentStep === 3 && <Step3_Confirm />}
      {currentStep === 4 && <Step4_Success />}

      <div style={{ marginTop: "1rem" }}>
        {currentStep > 1 && currentStep < 4 && (
          <button onClick={handleBack}>Back</button>
        )}
        {currentStep < 3 && (
          <button onClick={handleNext}>Next</button>
        )}
        {currentStep === 3 && (
          <button onClick={processTransfer} disabled={loading}>
            {loading ? "Processing..." : "Confirm & Send"}
          </button>
        )}
      </div>

      {/* ✅ Security Badges */}
      <div style={{ marginTop: "2rem", textAlign: "center", fontSize: "0.8rem", color: "#555" }}>
        🔒 Secure | ✅ PCI Compliant | 🌍 Trusted Transfers
      </div>

      <SupportButton />
    </div>
  );
};

export default Transfer;
