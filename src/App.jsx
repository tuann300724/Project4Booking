import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from './context/UserContext';
import { CartProvider } from './context/CartContext';
import { SnackbarProvider } from 'notistack';
import MainLayout from "./components/layout/MainLayout";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Orders from './pages/admin/Orders';
import OrderDetail from './pages/admin/OrderDetail';
import AdminProducts from "./pages/admin/AdminProducts";
import Discounts from "./pages/admin/Discounts";
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import Users from './pages/admin/Users';
import Revenue from './pages/admin/Revenue';
import Categories from './pages/admin/Categories';
import Card from './pages/Card';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import OrderDetailUser from "./pages/OrderDetailUser";
import EditProduct from "./pages/admin/EditProduct";
import UserOrders from "./pages/UserOrders";
import UserOrderDetail from "./pages/UserOrderDetail";
import UserProfile from "./pages/UserProfile";
import PaymentDetail from "./pages/admin/PaymentDetail";
import UserDetail from "./pages/admin/UserDetail";
import UserVouchers from "./pages/UserVouchers";
import VNPayReturn from './pages/VNPayReturn';
import ProductForm from "./pages/admin/ProductForm";
import AdminChat from './pages/admin/AdminChat';
import AdminPrizes from "./pages/admin/AdminPrizes";

function App() {
  return (
    <SnackbarProvider 
      maxSnack={3} 
      autoHideDuration={3000}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Router>
        <UserProvider>
          <CartProvider>
            <Routes>
              {/* Routes cho trang chủ */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="products" element={<Products />} />
                <Route path="products/:id" element={<ProductDetail />} />
                <Route path="about" element={<About />} />
                <Route path="contact" element={<Contact />} />
                <Route path="cart" element={<Card />} />
                <Route path="checkout" element={<Checkout />} />
                <Route path="user/vouchers" element={<UserVouchers />} />
                <Route path="user/profile" element={<UserProfile />} />
                <Route path="user/orders" element={<UserOrders />} />
                <Route path="order-success" element={<OrderSuccess />} />
                <Route path="user/orders/:id" element={<UserOrderDetail />} />
                <Route path="payment/vnpay/return" element={<VNPayReturn />} />
              </Route>

              <Route element={<ProtectedAdminRoute />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="orders" element={<Orders />} />
                  <Route path="orders/:id" element={<OrderDetail />} />
                  <Route path="users/:id" element={<UserDetail />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="discounts" element={<Discounts />} />
                  <Route path="chat" element={<AdminChat />} />
                  <Route path="products/new" element={<ProductForm />} />
                  <Route path="payments/:id" element={<PaymentDetail />} />
                  <Route path="products/edit/:id" element={<EditProduct />} />
                  <Route path="users" element={<Users />} />                  <Route path="revenue" element={<Revenue />} />
                  <Route path="categories" element={<Categories />} />
                  <Route path="prizes" element={<AdminPrizes />} />
                </Route>
              </Route>
            </Routes>
          </CartProvider>
        </UserProvider>
      </Router>
    </SnackbarProvider>
  );
}

export default App;