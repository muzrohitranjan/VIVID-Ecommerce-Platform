import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Trash2, Edit3 } from "lucide-react";

const SellerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/seller/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(res.data.products || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (window.confirm('Delete this product?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/seller/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchProducts();
      } catch (err) {
        alert('Delete failed');
      }
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          My Products Dashboard
        </h1>
        <Link to="/sell" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-xl transition-all hover:-translate-y-1">
          + Add New Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 bg-gradient-to-r from-gray-50 to-indigo-50 rounded-3xl">
          <div className="text-6xl mb-6 opacity-20">📦</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-4">No products yet</h2>
          <p className="text-lg text-gray-500 mb-8">Start by adding your first artisan product!</p>
          <Link to="/sell" className="bg-indigo-600 text-white px-12 py-4 rounded-2xl font-semibold text-lg hover:shadow-lg transition-all">
            Create First Product →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map(product => (
            <div key={product.id} className="group bg-white border-2 border-gray-100 rounded-3xl p-8 hover:border-indigo-200 hover:shadow-2xl transition-all hover:-translate-y-2">
              <div className="relative mb-6">
                {(product.image_url || product.image) ? (
                  <img 
                    src={product.image_url || product.image} 
                    alt={product.name}
                    className="w-full h-64 object-cover rounded-2xl"
                  />
                ) : (
                  <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                    <span className="text-4xl opacity-50">🖼️</span>
                  </div>
                )}
                <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${
                  product.status === 'approved' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {product.status}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
              <p className="text-2xl font-bold text-indigo-600 mb-4">₹{product.price}</p>
              <p className="text-gray-600 text-sm mb-6 line-clamp-3">{product.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{product.stock} in stock</span>
                </div>
                <div className="flex gap-2">
                  <Link 
                    to={`/products/${product.id}`} 
                    className="p-3 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-2xl transition-all hover:scale-105"
                  >
<Edit3 size={20} />
                  </Link>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="p-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-2xl transition-all hover:scale-105"
                  >
<Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
