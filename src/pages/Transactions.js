import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:3001/transactions', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTransactions(res.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        navigate('/login');
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
              <th>Receiver</th>
              <th>Description</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx.id}>
                <td>{new Date(tx.created_at).toLocaleString()}</td>
                <td>${tx.amount}</td>
                <td>{tx.receiver_username || tx.receiver_id}</td>
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