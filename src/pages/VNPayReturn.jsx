import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const VNPayReturn = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Đang xử lý kết quả thanh toán...');
  const [debugInfo, setDebugInfo] = useState('');
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    const processPaymentResult = async () => {
      // Get all URL parameters for debugging
      const urlParams = new URLSearchParams(window.location.search);
      const allParams = {};
      for (const [key, value] of urlParams.entries()) {
        allParams[key] = value;
      }
      
      const debug = `URL Params: ${JSON.stringify(allParams)}\n`;
      setDebugInfo(prev => prev + debug);
      
      try {
        const vnpResponseCode = urlParams.get('vnp_ResponseCode');
        const vnpTransactionStatus = urlParams.get('vnp_TransactionStatus');
        const vnpTxnRef = urlParams.get('vnp_TxnRef');
        
        // Add debug info about response code
        setDebugInfo(prev => prev + `VNPay Response Code: ${vnpResponseCode}\n`);
        setDebugInfo(prev => prev + `VNPay Transaction Status: ${vnpTransactionStatus}\n`);
        setDebugInfo(prev => prev + `VNPay Transaction Ref: ${vnpTxnRef}\n`);
        
        // Check if there's a pending voucher
        const pendingVoucher = localStorage.getItem('pendingVoucher');
        setDebugInfo(prev => prev + `Pending Voucher: ${pendingVoucher || 'None'}\n`);
        
        // Check payment status
        if (vnpResponseCode === '00' && vnpTransactionStatus === '00') {
          setStatus('success');
          setMessage('Thanh toán thành công!');
          
          // Process voucher if available
          if (pendingVoucher) {
            try {
              const { userId, code } = JSON.parse(pendingVoucher);
              
              setDebugInfo(prev => prev + `Processing voucher - UserId: ${userId}, Code: ${code}\n`);
              
              // Decrease voucher count
              const decreaseResponse = await fetch(`http://localhost:8080/api/vouchers/decrease?userId=${userId}&code=${code}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
              });
              
              if (decreaseResponse.ok) {
                setDebugInfo(prev => prev + 'Voucher count decreased successfully\n');
                localStorage.removeItem('pendingVoucher');
              } else {
                const errorText = await decreaseResponse.text();
                setDebugInfo(prev => prev + `Error decreasing voucher: ${errorText}\n`);
              }
            } catch (voucherErr) {
              console.error('Error decreasing voucher count:', voucherErr);
              setDebugInfo(prev => prev + `Voucher error: ${voucherErr.message}\n`);
            }
          } else {
            setDebugInfo(prev => prev + 'No pending voucher to process\n');
          }
          
          // Redirect to success page after 2 seconds
          setTimeout(() => {
            navigate('/order-success');
          }, 2000);
        } else {
          setStatus('error');
          setMessage('Thanh toán thất bại. Vui lòng thử lại sau!');
          
          // Remove pending voucher since payment failed
          if (pendingVoucher) {
            localStorage.removeItem('pendingVoucher');
            setDebugInfo(prev => prev + 'Payment failed, removed pending voucher\n');
          }
          
          // Redirect to checkout page after 3 seconds
          setTimeout(() => {
            navigate('/checkout');
          }, 3000);
        }
      } catch (error) {
        console.error('Error processing payment result:', error);
        setStatus('error');
        setMessage('Đã xảy ra lỗi khi xử lý kết quả thanh toán.');
        setDebugInfo(prev => prev + `Error: ${error.message}\n`);
        
        // Redirect to checkout page after 3 seconds
        setTimeout(() => {
          navigate('/checkout');
        }, 3000);
      }
    };

    processPaymentResult();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          {status === 'processing' && (
            <div className="w-16 h-16 border-4 border-t-purple-600 border-gray-200 rounded-full animate-spin mx-auto mb-6"></div>
          )}
          
          {status === 'success' && (
            <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          
          {status === 'error' && (
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
          
          <h2 className={`text-2xl font-bold mb-4 ${
            status === 'success' ? 'text-green-600' : 
            status === 'error' ? 'text-red-600' : 'text-gray-800'
          }`}>
            {status === 'success' ? 'Thanh toán thành công!' : 
             status === 'error' ? 'Thanh toán thất bại!' : 'Đang xử lý'}
          </h2>
          
          <p className="text-gray-600 mb-6">{message}</p>
          
          {status === 'success' && (
            <p className="text-gray-500 text-sm">
              Bạn sẽ được chuyển hướng đến trang xác nhận đơn hàng...
            </p>
          )}
          
          {status === 'error' && (
            <p className="text-gray-500 text-sm">
              Bạn sẽ được chuyển hướng đến trang thanh toán...
            </p>
          )}
          
          <div className="mt-6">
            <button 
              onClick={() => setShowDebug(!showDebug)} 
              className="text-xs text-gray-500 underline"
            >
              {showDebug ? 'Ẩn thông tin gỡ lỗi' : 'Hiện thông tin gỡ lỗi'}
            </button>
          </div>
          
          {showDebug && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg text-left">
              <pre className="text-xs text-gray-700 overflow-auto max-h-40">
                {debugInfo}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VNPayReturn; 