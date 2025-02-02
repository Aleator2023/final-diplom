import axios from 'axios';

const BASE_URL = 'http://localhost:3000'; // Базовый URL API

const makeApiRequest = async <T>(url: string, config: any = {}): Promise<T> => {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Unauthorized access');
  }

  try {
    const response = await axios.get<T>(`${BASE_URL}${url}`, {
      headers: { Authorization: `Bearer ${token}` },
      ...config,
    });

    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Unauthorized access, please login again.');
    } else if (error.response?.status === 403) {
      throw new Error('Access denied. You are not an admin.');
    } else if(error.response?.data?.message === "User doesn't exist!"){
        throw new Error("User doesn't exist!");
    } else {
      throw new Error(`Failed to fetch data from ${url}: ` + error.response?.data?.message);
    }
  }
};

export const getUsers = async (search?: string): Promise<User[]> => {
  const params: { search?: string } = {};
  if (search) {
    params.search = search;
  }
  return makeApiRequest('/users', { params });
};

export const getUser = async (id: string): Promise<User> => {
  if(!id) {
    throw new Error('Failed to fetch users: id should not be empty!');
  }

  return makeApiRequest(`/users/${id}`);
};

interface User {
  id: string;
  email: string;
  name: string;
  contactPhone: string;
  role: string;
}
