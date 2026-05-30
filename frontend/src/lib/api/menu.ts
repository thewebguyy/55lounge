import { apiClient } from '../api-client';
import { ApiResponse, MenuItemDto, CategoryDto } from '@55lounge/shared';

export const getAdminMenu = async (): Promise<ApiResponse<MenuItemDto[]>> => {
  const res = await apiClient('/admin/menu');
  return res.json();
};

export const getAdminCategories = async (): Promise<ApiResponse<CategoryDto[]>> => {
  const res = await apiClient('/admin/categories');
  return res.json();
};

export const createMenuItem = async (data: Partial<MenuItemDto>): Promise<ApiResponse<MenuItemDto>> => {
  const res = await apiClient('/admin/menu', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.json();
};

export const updateMenuItem = async (id: string, data: Partial<MenuItemDto>): Promise<ApiResponse<MenuItemDto>> => {
  const res = await apiClient(`/admin/menu/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return res.json();
};

export const archiveMenuItem = async (id: string): Promise<ApiResponse<MenuItemDto>> => {
  const res = await apiClient(`/admin/menu/${id}`, {
    method: 'DELETE',
  });
  return res.json();
};
