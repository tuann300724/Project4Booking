import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const ProtectedAdminRoute = () => {
  const { isAdmin, isLoggedIn } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [localIsAdmin, setLocalIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = () => {
      try {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          setLocalIsAdmin(userData.role === 1);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
      setIsLoading(false);
    };

    checkAdmin();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isLoggedIn || !localIsAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedAdminRoute; 