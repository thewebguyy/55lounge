import { apiClient } from '../api-client';
import { ApiResponse } from '@servia/shared';

export const getDashboardAnalytics = async (startDate?: string, endDate?: string): Promise<ApiResponse<any>> => {
  let url = '/admin/analytics';
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const res = await apiClient(url);
  return res.json();
};
