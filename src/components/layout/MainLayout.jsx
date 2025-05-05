import React from 'react';
import Header from './Header';
import Footer from './Footer';

const MainLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <main className="flex-1 pt-20 pb-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout; 