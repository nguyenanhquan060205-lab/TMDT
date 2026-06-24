const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

function buildApiUrl(endpoint: string) {
  const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  return `${baseUrl}${path}`;
}

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

  const url = buildApiUrl(endpoint);
  let response: Response;

  try {
    // Gửi request đến API server
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(`Cannot connect to API server at ${url}. Please make sure the backend is running.`);
  }

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;

  // Kiểm tra lỗi - nếu status code không ok (2xx) thì throw error
  if (!response.ok) {
    throw new Error(data?.message || `API request failed with status ${response.status}`);
  }

  return data;
}
