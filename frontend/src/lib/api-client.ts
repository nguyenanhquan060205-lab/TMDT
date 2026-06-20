const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  // Lấy token từ localStorage nếu có đăng nhập
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Thiết lập header với token xác thực
  const headers = {
    'Content-Type': 'application/json',
    // Thêm token vào Authorization header nếu có
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // Gửi request đến API server
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Parse JSON response
  const data = await response.json();

  // Kiểm tra lỗi - nếu status code không ok (2xx) thì throw error
  if (!response.ok) {
    throw new Error(data.message || 'An error occurred!');
  }

  return data;
}
