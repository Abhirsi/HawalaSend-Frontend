import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

// ✅ Floating Support Button
const SupportButton = () => (
  <a
    href="/support"
    className="fixed bottom-5 right-5 w-14 h-14 flex items-center justify-center rounded-full text-white text-xl shadow-lg z-50"
    style={{ background: "linear-gradient(135deg, #1976d2, #2e7d32)" }}
    title="Chat with Support"
  >
    💬
  </a>
);

export default function Transfer() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(2500.0);

  const [transferData, setTransferData] = useState({
    amount: "",
    recipientName: "",
    recipientEmail: "",
    description: "",
    paymentMethod: "interac",
    cardNumber: "",
    expiry: "",
    cvv: "",
    pin: "",
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [transferResult, setTransferResult] = useState(null);

  // Exchange + fees
  const exchangeRate = 110.45;
  const feePercentage = 0.01;
  const fixedFee = 4.99;

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

  // Handle input
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
    } else if (name === "cardNumber") {
      setTransferData((p) => ({
        ...p,
        [name]: value.replace(/[^0-9]/g, "").slice(0, 16),
      }));
    } else if (name === "cvv") {
      setTransferData((p) => ({
        ...p,
        [name]: value.replace(/[^0-9]/g, "").slice(0, 4),
      }));
    } else {
      setTransferData((p) => ({ ...p, [name]: value }));
    }
  };

  // Validation
  const validateStep = (step) => {
    const errors = {};
    if (step >= 1) {
      if (!transferData.amount || parseFloat(transferData.amount) <= 0)
        errors.amount = "Enter valid amount";
      if (parseFloat(transferData.amount) > balance)
        errors.amount = "Insufficient balance";
      if (!transferData.recipientName)
        errors.recipientName = "Recipient name required";
      if (!transferData.recipientEmail)
        errors.recipientEmail = "Recipient email required";
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

  // Navigation
  const handleNext = () => {
    if (validateStep(step)) setStep((s) => s + 1);
  };

  const handleBack = () => {
    setStep((s) => s - 1);
    setValidationErrors({});
  };

  const processTransfer = async () => {
    if (!validateStep(3)) return;
    setLoading(true);
    try {
      // Fake API simulation
      setTimeout(() => {
        setTransferResult({
          success: true,
          transaction: {
            id: Date.now(),
            amount: transferData.amount,
            recipient: transferData.recipientEmail,
          },
          newBalance: balance - parseFloat(transferData.amount || 0),
        });
        setBalance(
          balance - parseFloat(transferData.amount || 0) - calculateFee()
        );
        setStep(4);
        setLoading(false);
      }, 1500);
    } catch (err) {
      setValidationErrors({ general: "Transfer failed. Try again." });
      setLoading(false);
    }
  };

  // --- Steps ---
  const Step1_Details = () => (
    <div>
      <h2 className="text-lg font-semibold mb-4">Step 1: Transfer Details</h2>
      <div className="space-y-3">
        <input
          type="text"
          name="amount"
          placeholder="Amount (CAD)"
          value={transferData.amount}
          onChange={handleInputChange}
          className="w-full border rounded-md p-2"
        />
        {validationErrors.amount && (
          <p className="text-xs text-red-500">{validationErrors.amount}</p>
        )}
        <p className="text-sm text-gray-600">
          They Receive: <strong>{formatKES(calculateReceiveAmount())}</strong>
        </p>
        <p className="text-sm text-gray-600">
          Fee: <strong>{formatCurrency(calculateFee())}</strong>
        </p>
        <input
          type="text"
          name="recipientName"
          placeholder="Recipient Name"
          value={transferData.recipientName}
          onChange={handleInputChange}
          className="w-full border rounded-md p-2"
        />
        {validationErrors.recipientName && (
          <p className="text-xs text-red-500">
            {validationErrors.recipientName}
          </p>
        )}
        <input
          type="email"
          name="recipientEmail"
          placeholder="Recipient Email"
          value={transferData.recipientEmail}
          onChange={handleInputChange}
          className="w-full border rounded-md p-2"
        />
        {validationErrors.recipientEmail && (
          <p className="text-xs text-red-500">
            {validationErrors.recipientEmail}
          </p>
        )}
        <textarea
          name="description"
          placeholder="Description (optional)"
          value={transferData.description}
          onChange={handleInputChange}
          className="w-full border rounded-md p-2"
        />
      </div>
    </div>
  );

  const Step2_Payment = () => (
    <div>
      <h2 className="text-lg font-semibold mb-4">Step 2: Payment Method</h2>
      <div className="space-y-2">
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="paymentMethod"
            value="interac"
            checked={transferData.paymentMethod === "interac"}
            onChange={handleInputChange}
          />
          <span>Interac e-Transfer</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="paymentMethod"
            value="card"
            checked={transferData.paymentMethod === "card"}
            onChange={handleInputChange}
          />
          <span>Credit/Debit Card</span>
        </label>
      </div>
      {transferData.paymentMethod === "card" && (
        <div className="mt-4 space-y-3">
          <input
            type="text"
            name="cardNumber"
            placeholder="Card Number"
            value={transferData.cardNumber}
            onChange={handleInputChange}
            className="w-full border rounded-md p-2"
            maxLength={16}
          />
          {validationErrors.cardNumber && (
            <p className="text-xs text-red-500">{validationErrors.cardNumber}</p>
          )}
          <input
            type="text"
            name="expiry"
            placeholder="MM/YY"
            value={transferData.expiry}
            onChange={handleInputChange}
            className="w-full border rounded-md p-2"
            maxLength={5}
          />
          {validationErrors.expiry && (
            <p className="text-xs text-red-500">{validationErrors.expiry}</p>
          )}
          <input
            type="text"
            name="cvv"
            placeholder="CVV"
            value={transferData.cvv}
            onChange={handleInputChange}
            className="w-full border rounded-md p-2"
            maxLength={4}
          />
          {validationErrors.cvv && (
            <p className="text-xs text-red-500">{validationErrors.cvv}</p>
          )}
        </div>
      )}
    </div>
  );

  const Step3_Confirm = () => (
    <div>
      <h2 className="text-lg font-semibold mb-4">Step 3: Confirm Transfer</h2>
      <div className="mb-4 p-3 border rounded-lg bg-gray-50">
        <p>
          <strong>To:</strong> {transferData.recipientName} (
          {transferData.recipientEmail})
        </p>
        <p>
          <strong>Amount:</strong> {formatCurrency(transferData.amount)}
        </p>
        <p>
          <strong>They Receive:</strong>{" "}
          {formatKES(calculateReceiveAmount())}
        </p>
        <p>
          <strong>Total:</strong> {formatCurrency(calculateTotal())}
        </p>
      </div>
      <input
        type="password"
        name="pin"
        placeholder="Enter 4-6 digit PIN"
        value={transferData.pin}
        onChange={handleInputChange}
        className="w-full border rounded-md p-2"
        maxLength={6}
      />
      {validationErrors.pin && (
        <p className="text-xs text-red-500">{validationErrors.pin}</p>
      )}
      {validationErrors.general && (
        <p className="text-xs text-red-500">{validationErrors.general}</p>
      )}
      <p className="text-xs text-gray-500 mt-2">
        For demo purposes, use PIN: 1234
      </p>
    </div>
  );

  const Step4_Success = () => (
    <div className="text-center">
      <h2 className="text-lg font-semibold mb-4">✅ Transfer Successful!</h2>
      <p>
        You sent {formatCurrency(transferData.amount)} to{" "}
        {transferData.recipientEmail}
      </p>
      <p className="mt-2">
        New Balance: {formatCurrency(transferResult?.newBalance || balance)}
      </p>
      <Button className="mt-4" onClick={() => navigate("/dashboard")}>
        Back to Dashboard
      </Button>
    </div>
  );

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="p-6">
          {step === 1 && <Step1_Details />}
          {step === 2 && <Step2_Payment />}
          {step === 3 && <Step3_Confirm />}
          {step === 4 && <Step4_Success />}

          {/* Navigation */}
          <div className="mt-6 flex justify-between">
            {step > 1 && step < 4 && (
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}
            {step < 3 && (
              <Button className="ml-auto" onClick={handleNext}>
                Next
              </Button>
            )}
            {step === 3 && (
              <Button
                className="ml-auto"
                onClick={processTransfer}
                disabled={loading}
              >
                {loading ? "Processing..." : "Confirm & Send"}
              </Button>
            )}
          </div>

          {/* ✅ Security Badges */}
          <div className="mt-6 text-center text-xs text-gray-500">
            🔒 Secure | ✅ PCI Compliant | 🌍 Trusted Transfers
          </div>
        </CardContent>
      </Card>
      <SupportButton />
    </div>
  );
}
