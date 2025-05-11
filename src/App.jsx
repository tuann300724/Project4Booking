import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from './context/UserContext';
import { CartProvider } from './context/CartContext';
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

import Users from './pages/admin/Users';
import Revenue from './pages/admin/Revenue';
import Card from './pages/Card';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import OrderList from "./pages/OrderList";
import OrderDetailUser from "./pages/OrderDetailUser";
// Bạn có thể tạo thêm các trang About, Contact, Booking nếu muốn
// import About from "./pages/About";
// import Contact from "./pages/Contact";
// import Booking from "./pages/Booking";

function App() {
  return (
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
              {/* <Route path="orderslist" element={<OrderList />} /> */}
              <Route path="order-success" element={<OrderSuccess />} />
              <Route path="user/orders" element={<UserOrders />} />
              <Route path="user/orders/:id" element={<UserOrderDetail />} />
            </Route>

            {/* Routes cho trang admin */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="orders" element={<Orders />} />
              <Route path="orders/:id" element={<OrderDetail />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="products/new" element={<ProductForm />} />
              <Route path="products/edit/:id" element={<EditProduct />} />
              <Route path="users" element={<Users />} />
              <Route path="revenue" element={<Revenue />} />
            </Route>
          </Routes>
        </CartProvider>
      </UserProvider>
    </Router>
  );
}

export default App;