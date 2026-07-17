const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000';

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  getToken() {
    return localStorage.getItem('accessToken');
  }

  setToken(token) {
    localStorage.setItem('accessToken', token);
  }

  setRefreshToken(token) {
    localStorage.setItem('refreshToken', token);
  }

  clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Try to refresh token
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        const newToken = await this.refresh(refreshToken);
        if (newToken) {
          headers['Authorization'] = `Bearer ${newToken}`;
          const retryResponse = await fetch(url, { ...options, headers });
          if (retryResponse.ok) {
            return retryResponse.json();
          }
        }
      }
      // Clear tokens and redirect to login
      this.clearTokens();
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  // Auth endpoints
  async login(username, password) {
    const data = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    this.setToken(data.accessToken);
    if (data.refreshToken) {
      this.setRefreshToken(data.refreshToken);
    }
    return data;
  }

  async register(username, fullName, email, password) {
    const data = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, fullName, email, password }),
    });
    this.setToken(data.accessToken);
    if (data.refreshToken) {
      this.setRefreshToken(data.refreshToken);
    }
    return data;
  }

  async refresh(refreshToken) {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (response.ok) {
        const data = await response.json();
        this.setToken(data.accessToken);
        if (data.refreshToken) {
          this.setRefreshToken(data.refreshToken);
        }
        return data.accessToken;
      }
    } catch (e) {
      console.error('Refresh failed:', e);
    }
    return null;
  }

  async logout() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await this.request('/api/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch (e) {
      // Ignore logout errors
    }
    this.clearTokens();
  }

  // Club endpoints
  async getClubs() {
    return this.request('/api/clubs');
  }

  async getClub(id) {
    return this.request(`/api/clubs/${id}`);
  }

  async getMyMemberships() {
    return this.request('/api/clubs/me/memberships');
  }

  async joinClub(clubId, request) {
    return this.request(`/api/clubs/${clubId}/join`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Report endpoints
  async getReports(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/reports${query ? `?${query}` : ''}`);
  }

  async getReport(id) {
    return this.request(`/api/reports/${id}`);
  }

  async createReport(data) {
    return this.request('/api/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async submitReport(id) {
    return this.request(`/api/reports/${id}/submit`, { method: 'POST' });
  }

  async reviewReport(id, feedback) {
    return this.request(`/api/reports/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ feedback }),
    });
  }

  async approveReport(id) {
    return this.request(`/api/reports/${id}/approve`, { method: 'POST' });
  }

  async rejectReport(id, feedback) {
    return this.request(`/api/reports/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ feedback }),
    });
  }

  // Activity endpoints
  async getActivities(clubId) {
    const query = clubId ? `?clubId=${clubId}` : '';
    return this.request(`/api/activities${query}`);
  }

  async createActivity(data) {
    return this.request('/api/activities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async registerParticipant(activityId, userId, fullName) {
    return this.request(`/api/activities/${activityId}/participants`, {
      method: 'POST',
      body: JSON.stringify({ userId, fullName }),
    });
  }

  // Finance endpoints
  async getBudgetProposals(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/finance/proposals${query ? `?${query}` : ''}`);
  }

  async createBudgetProposal(data) {
    return this.request('/api/finance/proposals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async approveBudget(id, approvedAmount, note) {
    return this.request(`/api/finance/proposals/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ approvedAmount, note }),
    });
  }

  async createSettlement(proposalId, data) {
    return this.request(`/api/finance/proposals/${proposalId}/settlements`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // KPI endpoints
  async getKpiRules() {
    return this.request('/api/kpis/rules');
  }

  async getKpiLeaderboard(period) {
    const query = period ? `?period=${period}` : '';
    return this.request(`/api/kpis/leaderboard${query}`);
  }

  async getReportSummary() {
    return this.request('/api/reports/summary');
  }

  async getReportAggregation(period) {
    const query = period ? `?period=${period}` : '';
    return this.request(`/api/reports/aggregate${query}`);
  }

  // Notifications
  async getNotifications(unreadOnly = false) {
    const query = unreadOnly ? '?unreadOnly=true' : '';
    return this.request(`/api/notifications${query}`);
  }

  async markNotificationRead(id) {
    return this.request(`/api/notifications/${id}/read`, { method: 'PUT' });
  }

  async markAllNotificationsRead() {
    return this.request('/api/notifications/read-all', { method: 'PUT' });
  }
}

export const api = new ApiService();
export default api;
