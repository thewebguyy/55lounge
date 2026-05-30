import { apiClient } from '../api-client';
import { ApiResponse } from '@servia/shared';

export const createOrderIntent = async (items: { menuItemId: string, quantity: number }[]): Promise<ApiResponse<{ orderId: string, authorizationUrl: string, reference: string }>> => {
  const res = await apiClient('/orders/intent', {
    method: 'POST',
    body: JSON.stringify({ items }),
  });
  return res.json();
};

export const getMyOrders = async (): Promise<ApiResponse<any[]>> => {
  const res = await apiClient('/orders/my-orders');
  return res.json();
};

export const getOrderTracking = async (id: string): Promise<ApiResponse<any>> => {
  const res = await apiClient(`/orders/${id}`);
  return res.json();
};
