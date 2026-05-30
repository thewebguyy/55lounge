import { apiClient } from '../api-client';
import { ApiResponse } from '@servia/shared';

export const createReservation = async (time: string, partySize: number, specialRequests?: string): Promise<ApiResponse<any>> => {
  const res = await apiClient('/reservations', {
    method: 'POST',
    body: JSON.stringify({ time, partySize, specialRequests }),
  });
  return res.json();
};

export const getMyReservations = async (): Promise<ApiResponse<any[]>> => {
  const res = await apiClient('/reservations/my-reservations');
  return res.json();
};

export const getAdminReservations = async (date?: Date): Promise<ApiResponse<any[]>> => {
  const url = date ? `/admin/reservations?date=${date.toISOString()}` : '/admin/reservations';
  const res = await apiClient(url);
  return res.json();
};

export const updateReservationStatus = async (id: string, status: string): Promise<ApiResponse<any>> => {
  const res = await apiClient(`/admin/reservations/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  return res.json();
};
