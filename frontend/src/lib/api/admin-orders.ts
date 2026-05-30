import { apiClient } from '../api-client';
import { ApiResponse } from '@55lounge/shared';

export const getActiveOrders = async (): Promise<ApiResponse<any[]>> => {
  const res = await apiClient('/admin/orders/active');
  return res.json();
};

export const getHistoricalOrders = async (): Promise<ApiResponse<any[]>> => {
  const res = await apiClient('/admin/orders/history');
  return res.json();
};

export const updateOrderStatus = async (id: string, status: string): Promise<ApiResponse<any>> => {
  const res = await apiClient(`/admin/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  return res.json();
};
