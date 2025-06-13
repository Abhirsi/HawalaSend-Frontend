import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Transfer = () => {
  const [receiverId, setReceiverId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [users, setUsers] = useState([]);
  const [balance, setBalance] = useState(0);
  const navigate = useNavigate();

  // Fetch all users (for receiver dropdown) and current balance
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Get current user balance
        const balanceRes = await axios.get('http://localhost:3001/api/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBalance(balanceRes.data.balance);

        // Get all users (excluding current user)
        const usersRes = await axios.get('http://localhost:3001/api/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(usersRes.data.filter(user => user.id !== balanceRes.data.id));
      } catch (error) {
        console.error('Error fetching data:', error);
        navigate('/login');
      }
    };

    fetchData();
  }, [navigate]);

  const handleTransfer = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:3001/transfer',
        { receiverId, amount, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Transfer successful!');
      // Refresh balance
      const balanceRes = await axios.get('http://localhost:3001/api/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBalance(balanceRes.data.balance);
    } catch (error) {
      alert(error.response?.data?.error || 'Transfer failed');
    }
  };

  return (
    <div className="transfer-container">
      <h2>Transfer Money</h2>
      <p>Your current balance: ${balance}</p>
      
      <form onSubmit={handleTransfer}>
        <div className="form-group">
          <label>Receiver:</label>
          <select 
            value={receiverId} 
            onChange={(e) => setReceiverId(e.target.value)}
            required
          >
            <option value="">Select a user</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.username} ({user.email})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Amount:</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Description (Optional):</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <button type="submit">Send Money</button>
      </form>
    </div>
  );
};

export default Transfer;