import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useAdminStore } from '../store/adminStore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@tanstack/react-table';
import { Edit, Trash2, Plus } from 'lucide-react';

export function AdminDashboard() {
  const { user } = useAuthStore();
  const { isAdmin, loading, checkAdminStatus } = useAdminStore();
  const [products, setProducts] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [activeTab, setActiveTab] = useState('products');

  useEffect(() => {
    if (user) {
      checkAdminStatus(user.id);
    }
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return <div>Access denied. Admin privileges required.</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'products'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200'
          }`}
        >
          Products
        </button>
        <button
          onClick={() => setActiveTab('policies')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'policies'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200'
          }`}
        >
          Policies
        </button>
      </div>

      {activeTab === 'products' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Products</h2>
            <button
              className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg"
              onClick={() => {/* Add product modal */}}
            >
              <Plus className="h-5 w-5" />
              <span>Add Product</span>
            </button>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product: any) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      ${product.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {/* Edit product */}}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {/* Delete product */}}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'policies' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Store Policies</h2>
            <button
              className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg"
              onClick={() => {/* Add policy modal */}}
            >
              <Plus className="h-5 w-5" />
              <span>Add Policy</span>
            </button>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {policies.map((policy: any) => (
                  <tr key={policy.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {policy.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {/* Edit policy */}}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {/* Delete policy */}}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}