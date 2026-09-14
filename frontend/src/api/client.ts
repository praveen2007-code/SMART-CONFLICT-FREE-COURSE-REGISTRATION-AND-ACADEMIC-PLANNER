const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'API request failed');
  }
  return json as T;
}

export const api = {
  // Auth
  auth: {
    async register(data: any) {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return handleResponse<any>(res);
    },
    async login(data: any) {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return handleResponse<any>(res);
    },
    async getMe() {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getAuthHeaders()
      });
      return handleResponse<any>(res);
    }
  },

  // Courses
  courses: {
    async getAll(params?: { search?: string; department?: string; semester?: string; studentId?: number }) {
      const query = new URLSearchParams();
      if (params?.search) query.append('search', params.search);
      if (params?.department) query.append('department', params.department);
      if (params?.semester) query.append('semester', params.semester);
      if (params?.studentId) query.append('studentId', params.studentId.toString());

      const res = await fetch(`${API_BASE}/courses?${query.toString()}`, {
        headers: getAuthHeaders()
      });
      return handleResponse<{ success: boolean; courses: any[]; count: number }>(res);
    },
    async getById(id: number) {
      const res = await fetch(`${API_BASE}/courses/${id}`, {
        headers: getAuthHeaders()
      });
      return handleResponse<{ success: boolean; course: any }>(res);
    },
    async getPrerequisites(id: number) {
      const res = await fetch(`${API_BASE}/courses/${id}/prerequisites`, {
        headers: getAuthHeaders()
      });
      return handleResponse<{ success: boolean; prerequisites: any[] }>(res);
    },
    async getSeats(id: number) {
      const res = await fetch(`${API_BASE}/courses/${id}/seats`, {
        headers: getAuthHeaders()
      });
      return handleResponse<{ success: boolean; sections: any[] }>(res);
    }
  },

  // Registration
  registrations: {
    async register(sectionId: number, studentId?: number) {
      const res = await fetch(`${API_BASE}/registrations`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ sectionId, studentId })
      });
      return handleResponse<{ success: boolean; message: string; enrollment: any }>(res);
    },
    async drop(enrollmentId: number) {
      const res = await fetch(`${API_BASE}/registrations/${enrollmentId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return handleResponse<{ success: boolean; message: string; availableSeats: number }>(res);
    },
    async getStudentRegistrations(studentId: number) {
      const res = await fetch(`${API_BASE}/registrations/student/${studentId}`, {
        headers: getAuthHeaders()
      });
      return handleResponse<{ success: boolean; registrations: any[]; totalCredits: number; count: number }>(res);
    },
    async getHistory(studentId: number) {
      const res = await fetch(`${API_BASE}/registrations/history/${studentId}`, {
        headers: getAuthHeaders()
      });
      return handleResponse<{ success: boolean; history: any[] }>(res);
    }
  },

  // Planner
  planner: {
    async checkConflicts(sectionIds: number[], studentId?: number) {
      const res = await fetch(`${API_BASE}/planner/check-conflicts`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ sectionIds, studentId })
      });
      return handleResponse<any>(res);
    },
    async generateBestSchedule(data: {
      courseIds: number[];
      studentId?: number;
      preferences?: { preferredTime?: string; maxCredits?: number };
    }) {
      const res = await fetch(`${API_BASE}/planner/generate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse<any>(res);
    }
  },

  // Recommendations
  recommendations: {
    async getRecommendations(studentId: number) {
      const res = await fetch(`${API_BASE}/recommendations/${studentId}`, {
        headers: getAuthHeaders()
      });
      return handleResponse<any>(res);
    }
  },

  // Admin
  admin: {
    async getStats() {
      const res = await fetch(`${API_BASE}/admin/stats`, {
        headers: getAuthHeaders()
      });
      return handleResponse<any>(res);
    },
    async getRegistrations() {
      const res = await fetch(`${API_BASE}/admin/registrations`, {
        headers: getAuthHeaders()
      });
      return handleResponse<any>(res);
    },
    async createCourse(data: any) {
      const res = await fetch(`${API_BASE}/admin/courses`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse<any>(res);
    },
    async updateCourse(id: number, data: any) {
      const res = await fetch(`${API_BASE}/admin/courses/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse<any>(res);
    },
    async deleteCourse(id: number) {
      const res = await fetch(`${API_BASE}/admin/courses/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return handleResponse<any>(res);
    },
    async createSection(data: any) {
      const res = await fetch(`${API_BASE}/admin/sections`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse<any>(res);
    },
    async updateSection(id: number, data: any) {
      const res = await fetch(`${API_BASE}/admin/sections/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse<any>(res);
    }
  }
};
