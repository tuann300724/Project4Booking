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
        console.error('Error fetching products:', error);
        throw error;
    }
};

// Fetch product by ID
export const getProductById = async (productId) => {
    try {
        const response = await api.get(`/products/${productId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching product details:', error);
        throw error;
    }
};

// Fetch all sizes
export const getAllSizes = async () => {
    try {
        const response = await api.get('/sizes');
        return response.data;
    } catch (error) {
        console.error('Error fetching sizes:', error);
        throw error;
    }
};

export const getRelatedProducts = async (categoryId, currentProductId) => {
    try {
        const response = await api.get(`/products/related/${categoryId}`);
        return response.data.filter(product => product.id !== currentProductId).slice(0, 4);
    } catch (error) {
        console.error('Error fetching related products:', error);
        return [];
    }
}; 