import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import Home from "./pages/Home";
// Bạn có thể tạo thêm các trang About, Contact, Booking nếu muốn
// import About from "./pages/About";
// import Contact from "./pages/Contact";
// import Booking from "./pages/Booking";

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          {/* <Route path="/about" element={<About />} /> */}
          {/* <Route path="/contact" element={<Contact />} /> */}
          {/* <Route path="/booking" element={<Booking />} /> */}
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;