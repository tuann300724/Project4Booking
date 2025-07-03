import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Fetch all products
export const getAllProducts = async () => {
    try {
        const response = await api.get('/products');
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Fetch product by ID
export const getProductById = async (productId) => {
    try {
        const response = await api.get(`/products/${productId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Fetch all sizes
export const getAllSizes = async () => {
    try {
        const response = await api.get('/sizes');
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Fetch size by ID
export const getSizeById = async (sizeId) => {
    try {
        const response = await api.get(`/sizes/${sizeId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getRelatedProducts = async (categoryId, currentProductId) => {
    try {
        const response = await api.get(`/products/related/${categoryId}`);
        return response.data.filter(product => product.id !== currentProductId).slice(0, 4);
    } catch (error) {
        return [];
    }
};

// Validate and apply discount code
export const validateDiscountCode = async (code) => {
    try {
        const response = await api.get(`/discounts/validate/${code}`);
        return response.data;
    } catch (error) {
        error('Error validating discount code:', error);
        throw error;
    }
};

export const getSizeIdByName = async (sizeName) => {
    try {
        const response = await api.get('/sizes');
        const sizes = response.data;
        const size = sizes.find(s => s.name === sizeName);
        return size ? size.id : null;
    } catch (error) {
        console.error('Error getting size ID:', error);
        throw error;
    }
};

export const checkProductQuantity = async (productId, sizeName) => {
    try {
        const sizeId = await getSizeIdByName(sizeName);
        if (!sizeId) {
            throw new Error('Invalid size');
        }
        const response = await fetch(`http://localhost:8080/api/product-sizes/product/${productId}/size/${sizeId}`);
        if (!response.ok) {
            throw new Error('Failed to check product quantity');
        }
        const data = await response.json();
        return data.stock;
    } catch (error) {
        console.error('Error checking product quantity:', error);
        throw error;
    }
};

export const getProductSizes = async (productId) => {
    try {
        const response = await api.get(`/product-sizes/product/${productId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching product sizes:', error);
        throw error;
    }
};

export const getProductSize = async (productId, sizeId) => {
    try {
        const response = await api.get(`/product-sizes/product/${productId}/size/${sizeId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching product size:', error);
        throw error;
    }
};

// Cart API functions
export const getCart = async (userId) => {
    try {
        const response = await api.get(`/cart/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error getting cart:', error);
        throw error;
    }
};

export const addToCart = async (userId, productId, sizeId, quantity) => {
    try {
        const response = await api.post('/cart/add', null, {
            params: {
                userId,
                productId,
                sizeId,
                quantity
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error adding to cart:', error);
        throw error;
    }
};

export const updateCartItem = async (cartItemId, quantity) => {
    try {
        const response = await api.put(`/cart/update/${cartItemId}`, null, {
            params: { quantity }
        });
        return response.data;
    } catch (error) {
        console.error('Error updating cart item:', error);
        throw error;
    }
};

export const removeCartItem = async (cartItemId) => {
    try {
        await api.delete(`/cart/remove/${cartItemId}`);
    } catch (error) {
        console.error('Error removing cart item:', error);
        throw error;
    }
};

export const clearCart = async (userId) => {
    try {
        await api.delete(`/cart/clear/${userId}`);
    } catch (error) {
        console.error('Error clearing cart:', error);
        throw error;
    }
}; 