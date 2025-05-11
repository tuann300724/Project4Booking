import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const statusColor = (status) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-700';
    case 'completed':
    case 'success':
      return 'bg-green-100 text-green-700';
    case 'cancelled':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const OrderDetailUser = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/orders/${id}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        }
      } catch (err) {
        setOrder(null);
      }
      setLoading(false);
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;
  }

  if (!order) {
    return <div className="min-h-screen flex items-center justify-center">Không tìm thấy đơn hàng!</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 014-4h3m4 0V7a2 2 0 00-2-2h-4.18a2 2 0 01-1.82-1.18l-.82-1.64A2 2 0 008.18 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2v-5a2 2 0 00-2-2h-2" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-6 text-center text-purple-700">Chi tiết đơn hàng #{order.id}</h1>
          <div className="mb-4 space-y-2 text-gray-700">
            <p><span className="font-medium">Ngày đặt:</span> {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}</p>
            <p>
              <span className="font-medium">Trạng thái:</span>{' '}
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(order.status)}`}>
                {order.status}
              </span>
            </p>
            <p><span className="font-medium">Tổng tiền:</span> <span className="text-purple-600 font-semibold">{order.total?.toLocaleString('vi-VN')}đ</span></p>
            <p><span className="font-medium">Phương thức thanh toán:</span> {order.paymentStatus}</p>
            <p><span className="font-medium">Địa chỉ nhận:</span> {order.address || '---'}</p>
          </div>
          <div className="mt-6">
            <h2 className="font-semibold mb-2 text-lg">Danh sách sản phẩm</h2>
            <ul className="divide-y">
              {order.orderItems?.map((item, idx) => (
                <li key={idx} className="py-2 flex justify-between items-center">
                  <span>
                    <span className="font-medium">Sản phẩm #{item.productId}</span> - Size: {item.sizeId} - SL: {item.quantity}
                  </span>
                  <span className="text-purple-600 font-semibold">{item.price?.toLocaleString('vi-VN')}đ</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-8 flex gap-4 justify-center">
            <Link to="/orderslist" className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">Quay lại danh sách đơn</Link>
            <Link to="/products" className="px-4 py-2 border border-purple-600 text-purple-600 rounded hover:bg-purple-50">Tiếp tục mua sắm</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailUser;