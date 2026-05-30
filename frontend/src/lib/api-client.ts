import { useAuthStore } from './auth';

export const apiClient = async (endpoint: string, options: RequestInit = {}) => {
  const { accessToken, clearAuth } = useAuthStore.getState();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
  let response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && accessToken) {
    // Attempt refresh
    try {
      const refreshRes = await fetch(`${baseUrl}/auth/refresh`, {
        method: 'POST',
        // Important: this relies on the browser sending the HTTP-only refresh cookie
        credentials: 'include',
      });
      
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        const newAccessToken = data.data.accessToken;
        
        // Update store with new token (assumes user is already in state, just patching token)
        useAuthStore.setState({ accessToken: newAccessToken });

        // Retry original request
        headers['Authorization'] = `Bearer ${newAccessToken}`;
        response = await fetch(`${baseUrl}${endpoint}`, {
          ...options,
          headers,
        });
      } else {
        clearAuth();
      }
    } catch (err) {
      clearAuth();
    }
  }

  return response;
};
