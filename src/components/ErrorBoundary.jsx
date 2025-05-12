import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Có thể gửi log về server tại đây nếu muốn
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Đã có lỗi xảy ra!</h1>
          <p className="text-gray-700 mb-2">{this.state.error?.toString()}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-purple-600 text-white rounded">Tải lại trang</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;