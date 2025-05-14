import React, { useState, useEffect } from 'react';
import { getAllDiscounts, createDiscount, updateDiscount, deleteDiscount } from '../../api/discountService';
import { format } from 'date-fns';

const Discounts = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDiscount, setCurrentDiscount] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    start_date: new Date().toISOString().slice(0, 16),
    end_date: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  });
  const [countdown, setCountdown] = useState({});

  // Fetch all discounts
  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const data = await getAllDiscounts();
      setDiscounts(data);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách mã giảm giá. Vui lòng thử lại.');
      console.error('Error fetching discounts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  // Update countdown timer every second
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const newCountdown = {};
      
      discounts.forEach(discount => {
        if (!discount.start_date || !discount.end_date) {
          newCountdown[discount.id] = {
            status: 'Ngày không hợp lệ',
            time: ''
          };
          return;
        }
        
        try {
          const startDate = new Date(discount.start_date);
          const endDate = new Date(discount.end_date);
          
          // Check if dates are valid
          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            newCountdown[discount.id] = {
              status: 'Ngày không hợp lệ',
              time: ''
            };
            return;
          }
          
          if (startDate > now) {
            // Calculate time until start
            const diff = startDate - now;
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            newCountdown[discount.id] = {
              status: 'Sắp bắt đầu',
              time: `${days}d ${hours}h ${minutes}m ${seconds}s`
            };
          } else if (endDate > now) {
            // Calculate time until end
            const diff = endDate - now;
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            newCountdown[discount.id] = {
              status: 'Đang hoạt động',
              time: `Kết thúc sau ${days}d ${hours}h ${minutes}m ${seconds}s`
            };
          } else {
            newCountdown[discount.id] = {
              status: 'Đã hết hạn',
              time: ''
            };
          }
        } catch (err) {
          console.error('Error calculating countdown for discount:', err);
          newCountdown[discount.id] = {
            status: 'Lỗi',
            time: ''
          };
        }
      });
      
      setCountdown(newCountdown);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [discounts]);

  // Open modal for creating a new discount
  const handleAddDiscount = () => {
    setCurrentDiscount(null);
    setFormData({
      code: '',
      discount_type: 'percentage',
      discount_value: '',
      start_date: new Date().toISOString().slice(0, 16),
      end_date: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
    });
    setIsModalOpen(true);
  };

  // Open modal for editing an existing discount
  const handleEditDiscount = (discount) => {
    setCurrentDiscount(discount);
    
    // Safely parse dates
    let startDate = '';
    let endDate = '';
    
    try {
      if (discount.start_date) {
        const date = new Date(discount.start_date);
        if (!isNaN(date.getTime())) {
          startDate = date.toISOString().slice(0, 16);
        }
      }
      
      if (discount.end_date) {
        const date = new Date(discount.end_date);
        if (!isNaN(date.getTime())) {
          endDate = date.toISOString().slice(0, 16);
        }
      }
    } catch (err) {
      console.error('Error parsing dates:', err);
    }
    
    setFormData({
      code: discount.code || '',
      discount_type: discount.discount_type || 'percentage',
      discount_value: discount.discount_value || '',
      start_date: startDate || new Date().toISOString().slice(0, 16),
      end_date: endDate || new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
    });
    
    setIsModalOpen(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Make sure discount_value is a number and dates are valid
      const discountData = {
        ...formData,
        discount_value: parseFloat(formData.discount_value),
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null
      };
      
      // Validate dates
      if (discountData.start_date && discountData.end_date) {
        const startDate = new Date(discountData.start_date);
        const endDate = new Date(discountData.end_date);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          setError('Định dạng ngày không hợp lệ. Vui lòng kiểm tra lại.');
          return;
        }
        
        if (startDate >= endDate) {
          setError('Ngày kết thúc phải sau ngày bắt đầu.');
          return;
        }
      }
      
      if (currentDiscount) {
        // Update existing discount
        await updateDiscount(currentDiscount.id, discountData);
      } else {
        // Create new discount
        await createDiscount(discountData);
      }
      
      // Refresh discount list
      fetchDiscounts();
      setIsModalOpen(false);
      setError(null);
    } catch (err) {
      setError('Không thể lưu mã giảm giá. Vui lòng thử lại.');
      console.error('Error saving discount:', err);
    }
  };

  // Handle discount deletion
  const handleDeleteDiscount = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa mã giảm giá này không?')) {
      try {
        await deleteDiscount(id);
        fetchDiscounts();
      } catch (err) {
        setError('Không thể xóa mã giảm giá. Vui lòng thử lại.');
        console.error('Error deleting discount:', err);
      }
    }
  };

  if (loading && discounts.length === 0) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-t-purple-600 border-gray-200 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản lý mã giảm giá</h1>
        <button
          onClick={handleAddDiscount}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
        >
          Thêm mã giảm giá mới
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Discounts Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mã giảm giá
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Loại
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Giá trị
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày bắt đầu
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày kết thúc
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {discounts.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  Chưa có mã giảm giá nào
                </td>
              </tr>
            ) : (
              discounts.map((discount) => (
                <tr key={discount.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900">{discount.code}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="capitalize">{discount.discount_type === 'percentage' ? 'Phần trăm' : 'Số tiền cố định'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {discount.discount_type === 'percentage'
                      ? `${discount.discount_value}%`
                      : `${discount.discount_value ? discount.discount_value.toLocaleString() : 0}đ`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {discount.start_date ? 
                      format(new Date(discount.start_date), 'dd/MM/yyyy HH:mm') : 
                      'Not set'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {discount.end_date ? 
                      format(new Date(discount.end_date), 'dd/MM/yyyy HH:mm') : 
                      'Not set'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {countdown[discount.id] && (
                      <div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          countdown[discount.id].status === 'Đang hoạt động'
                            ? 'bg-green-100 text-green-800'
                            : countdown[discount.id].status === 'Đã hết hạn'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {countdown[discount.id].status}
                        </span>
                        <p className="text-xs mt-1">{countdown[discount.id].time}</p>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleEditDiscount(discount)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteDiscount(discount.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Discount Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {currentDiscount ? 'Chỉnh sửa mã giảm giá' : 'Thêm mã giảm giá mới'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="code">
                  Mã giảm giá
                </label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="VD: SUMMER2023"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="discount_type">
                  Loại giảm giá
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="discount_type"
                      value="percentage"
                      checked={formData.discount_type === 'percentage'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span>Phần trăm (%)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="discount_type"
                      value="fixed"
                      checked={formData.discount_type === 'fixed'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span>Số tiền cố định (đ)</span>
                  </label>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="discount_value">
                  Giá trị {formData.discount_type === 'percentage' ? '(%)' : '(đ)'}
                </label>
                <input
                  type="number"
                  id="discount_value"
                  name="discount_value"
                  value={formData.discount_value}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder={formData.discount_type === 'percentage' ? 'VD: 15' : 'VD: 100000'}
                  min="0"
                  max={formData.discount_type === 'percentage' ? '100' : undefined}
                  step="any"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="start_date">
                  Ngày bắt đầu
                </label>
                <input
                  type="datetime-local"
                  id="start_date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="end_date">
                  Ngày kết thúc
                </label>
                <input
                  type="datetime-local"
                  id="end_date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              
              <div className="flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  {currentDiscount ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Discounts; 