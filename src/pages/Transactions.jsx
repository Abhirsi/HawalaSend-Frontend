import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { transactionAPI } from '../api'; // Use your configured API

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // Use your configured API instead of raw axios
        const response = await transactionAPI.getAll();
        
        // Handle the response structure from your backend
        const transactionsData = response.data.transactions || response.data;
        setTransactions(transactionsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        if (error.response?.status === 401) {
          // Only redirect to login on auth errors
          navigate('/login');
        } else {
          setLoading(false);
        }
      }
    };

    fetchTransactions();
  }, [navigate]);

  if (loading) return <div>Loading transactions...</div>;

  return (
    <div className="transactions-container">
      <h2>Transaction History</h2>
      
      {transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Other Party</th>
              <th>Description</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx.id}>
                <td>{new Date(tx.createdAt).toLocaleString()}</td>
                <td>${tx.amount.toFixed(2)}</td>
                <td>{tx.type}</td>
                <td>{tx.otherParty || tx.otherPartyEmail}</td>
                <td>{tx.description || '-'}</td>
                <td>{tx.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Transactions;