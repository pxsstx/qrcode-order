export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export class ApiError extends Error {
  constructor(message: string, public status?: number, public data?: any) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "include",
  });

  const data: ApiResponse<T> = await res.json();

  return data.data as T;
}

// Auth API
export const authApi = {
  register: (email: string, password: string, name: string) =>
    apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    }),

  login: (email: string, password: string) =>
    apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  me: () => apiFetch("/auth/me"),

  logout: () =>
    apiFetch("/auth/logout", {
      method: "POST",
    }),

  changePassword: (oldPassword: string, newPassword: string) =>
    apiFetch("/auth/change-password", {
      method: "PATCH",
      body: JSON.stringify({ oldPassword, newPassword }),
    }),
};

// Menu API
export const menuApi = {
  list: () => apiFetch("/menus"),
  get: (id: number) => apiFetch(`/menus/${id}`),
  create: (data: any) =>
    apiFetch("/menus", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: any) =>
    apiFetch(`/menus/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    apiFetch(`/menus/${id}`, {
      method: "DELETE",
    }),
};

// Order API
export const orderApi = {
  list: () => apiFetch("/orders"),
  get: (id: number) => apiFetch(`/orders/${id}`),
  getByTable: (tableId: number) => apiFetch(`/orders/table/${tableId}`),
  create: (data: any) =>
    apiFetch("/orders", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateStatus: (id: number, status: string) =>
    apiFetch(`/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  delete: (id: number) =>
    apiFetch(`/orders/${id}`, {
      method: "DELETE",
    }),
};

// Table API
export const tableApi = {
  list: () => apiFetch("/tables"),
  get: (id: number) => apiFetch(`/tables/${id}`),
  create: (data: any) =>
    apiFetch("/tables", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: any) =>
    apiFetch(`/tables/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    apiFetch(`/tables/${id}`, {
      method: "DELETE",
    }),
  toggleOccupancy: (id: number) =>
    apiFetch(`/tables/${id}/toggle`, {
      method: "PATCH",
    }),
};

// User API for managing staff and managers
export const userApi = {
  list: () => apiFetch("/users"),
  get: (id: number) => apiFetch(`/users/${id}`),
  create: (data: {
    email: string;
    password: string;
    username: string;
    role: string;
  }) =>
    apiFetch("/users", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: { name?: string; role?: string }) =>
    apiFetch(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    apiFetch(`/users/${id}`, {
      method: "DELETE",
    }),
};

export const presignApi = {
  get: (key: string) => apiFetch(`/presign/${key}`),
};
