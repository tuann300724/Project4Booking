import React from 'react';
import { Link } from 'react-router-dom';

const OrderSuccess = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-12 h-12 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Đặt hàng thành công!</h1>
          
          <p className="text-gray-600 mb-8">
            Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ xử lý đơn hàng của bạn trong thời gian sớm nhất.
          </p>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Thông tin đơn hàng</h2>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Mã đơn hàng: <span className="font-medium text-gray-800">#123456</span></p>
              <p>Ngày đặt: <span className="font-medium text-gray-800">15/03/2024</span></p>
              <p>Trạng thái: <span className="font-medium text-green-600">Đã xác nhận</span></p>
            </div>
          </div>

          <div className="space-y-4">
            <Link
              to="/products"
              className="block w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition duration-300 shadow-md hover:shadow-lg"
            >
              Tiếp tục mua sắm
            </Link>
            <Link
              to="/orders"
              className="block w-full border-2 border-purple-600 text-purple-600 py-3 rounded-lg hover:bg-purple-50 transition duration-300"
            >
              Xem đơn hàng của tôi
            </Link>
          </div>

          <p className="mt-8 text-sm text-gray-500">
            Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email hoặc số điện thoại hỗ trợ.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess; 