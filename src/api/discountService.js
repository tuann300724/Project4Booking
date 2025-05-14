import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Get all discounts
export const getAllDiscounts = async () => {
    try {
        const response = await api.get('/discounts');
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get discount by ID
export const getDiscountById = async (id) => {
    try {
        const response = await api.get(`/discounts/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Create new discount
export const createDiscount = async (discountData) => {
    try {
        const response = await api.post('/discounts', discountData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Update discount
export const updateDiscount = async (id, discountData) => {
    try {
        const response = await api.put(`/discounts/${id}`, discountData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Delete discount
export const deleteDiscount = async (id) => {
    try {
        const response = await api.delete(`/discounts/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}; 