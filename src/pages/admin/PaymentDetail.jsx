import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const PaymentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchPaymentAndOrder = async () => {
      try {
        // Fetch payment details
        const paymentRes = await fetch(`http://localhost:8080/api/payments/${id}`);
        if (paymentRes.ok) {
          const paymentData = await paymentRes.json();
          setPayment(paymentData);

          // Fetch order details using orderId from payment
          const orderRes = await fetch(`http://localhost:8080/api/orders/${paymentData.orderId}`);
          if (orderRes.ok) {
            const orderData = await orderRes.json();
            setOrder(orderData);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setLoading(false);
    };

    fetchPaymentAndOrder();
  }, [id]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Đã thanh toán':
        return 'bg-green-100 text-green-800';
      case 'Chưa thanh toán':
        return 'bg-yellow-100 text-yellow-800';
      case 'Đã hủy':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'cash':
        return 'Thanh toán khi nhận hàng';
      case 'momo':
        return 'Ví MoMo';
      default:
        return method;
    }
  };

  const handleUpdatePaymentStatus = async () => {
    try {
      setUpdating(true);
      const response = await fetch(`http://localhost:8080/api/payments/${id}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const updatedPayment = await response.json();
        setPayment(updatedPayment);
        alert('Cập nhật trạng thái thanh toán thành công!');
      } else {
        alert('Có lỗi xảy ra khi cập nhật trạng thái thanh toán!');
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái thanh toán!');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

  if (!payment || !order) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">Không tìm thấy thông tin thanh toán!</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-purple-700">Chi tiết thanh toán #{payment.id}</h1>
          <button
            onClick={() => navigate('/admin/revenue')}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            ← Quay lại
          </button>
        </div>

        {/* Thông tin thanh toán */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Thông tin thanh toán</h2>
              <div className="space-y-3">
                <p className="flex items-center">
                  <span className="font-medium w-40">Mã thanh toán:</span>
                  <span className="text-gray-700">#{payment.id}</span>
                </p>
                <p className="flex items-center">
                  <span className="font-medium w-40">Mã đơn hàng:</span>
                  <span className="text-gray-700">#{payment.transaction_code}</span>
                </p>
                <p className="flex items-center">
                  <span className="font-medium w-40">Ngày thanh toán:</span>
                  <span className="text-gray-700">{formatDate(payment.paymentDate)}</span>
                </p>
                <p className="flex items-center">
                  <span className="font-medium w-40">Phương thức:</span>
                  <span className="text-gray-700">{getPaymentMethodText(payment.paymentMethod)}</span>
                </p>
                <p className="flex items-center">
                  <span className="font-medium w-40">Trạng thái:</span>
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(payment.status)}`}>
                    {payment.status}
                  </span>
                </p>
                <p className="flex items-center">
                  <span className="font-medium w-40">Số tiền:</span>
                  <span className="text-purple-600 font-semibold">{formatCurrency(payment.amount)}</span>
                </p>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-4">Thông tin người nhận</h2>
              <div className="space-y-3">
                <p className="flex items-center">
                  <span className="font-medium w-40">Tên:</span>
                  <span className="text-gray-700">{order.receiverName}</span>
                </p>
                <p className="flex items-center">
                  <span className="font-medium w-40">Email:</span>
                  <span className="text-gray-700">{order.receiverEmail}</span>
                </p>
                <p className="flex items-center">
                  <span className="font-medium w-40">Điện thoại:</span>
                  <span className="text-gray-700">{order.receiverPhone}</span>
                </p>
                <p className="flex items-start">
                  <span className="font-medium w-40">Địa chỉ:</span>
                  <span className="text-gray-700">{order.receiverAddress}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tổng tiền và nút cập nhật */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold">Tổng tiền:</span>
            <span className="text-2xl font-bold text-purple-600">{formatCurrency(payment.amount)}</span>
          </div>
          {payment.status === 'Chưa thanh toán' && (
            <div className="flex justify-end">
              <button
                onClick={handleUpdatePaymentStatus}
                disabled={updating}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  updating
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {updating ? 'Đang cập nhật...' : 'Xác nhận đã thanh toán'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentDetail; 