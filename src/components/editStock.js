import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const EditStock = ({ stocks, onEdit }) => {
  const navigate = useNavigate();
  const { ticker } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    ticker: '',
    quantity: '',
    buyPrice: '',
    currentPrice: ''
  });

  useEffect(() => {
    const stock = stocks.find(s => s.ticker === ticker);
    if (stock) {
      setFormData(stock);
    } else {
      setError('Stock not found');
    }
  }, [stocks, ticker]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    if (name === 'quantity') {
      processedValue = value ? parseInt(value) : '';
    } else if (name === 'buyPrice' || name === 'currentPrice') {
      processedValue = value ? parseFloat(value) : '';
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const validateForm = () => {
    if (!formData.name || !formData.quantity || !formData.buyPrice) {
      setError('All fields are required');
      return false;
    }
    if (formData.quantity <= 0) {
      setError('Quantity must be greater than 0');
      return false;
    }
    if (formData.buyPrice <= 0) {
      setError('Buy price must be greater than 0');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      // Fetch current price from Alpha Vantage
      const response = await axios.get(`/live-price/${formData.ticker}`);
      const currentPrice = response.data.livePrice;

      const stockData = {
        ...formData,
        currentPrice: currentPrice
      };

      const success = await onEdit(stockData);
      if (success) {
        navigate('/');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update stock');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12">
      <div className="max-w-4xl w-full mx-auto bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-8 text-white">Edit Stock</h1>
        
        {error && (
          <div className="bg-red-700 border border-red-800 text-red-300 px-4 py-3 rounded mb-6" role="alert">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white">Company Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white">Ticker Symbol</label>
            <input
              type="text"
              name="ticker"
              value={formData.ticker}
              disabled
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white">Quantity</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white">Buy Price</label>
            <input
              type="number"
              name="buyPrice"
              value={formData.buyPrice}
              onChange={handleChange}
              step="0.01"
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-2 border border-gray-600 rounded-md text-sm font-medium text-gray-400 hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStock;