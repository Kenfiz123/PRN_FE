const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000')
  .replace(/\/+$/, '');

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  buildUrl(endpoint) {
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    if (this.baseUrl.endsWith('/api') && path.startsWith('/api/')) {
      return `${this.baseUrl}${path.slice(4)}`;
    }
    return `${this.baseUrl}${path}`;
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

  async parseResponse(response) {
    if (response.status === 204) {
      return null;
    }

    const contentType = response.headers.get('content-type') || '';
    return contentType.includes('application/json') ? response.json() : response.text();
  }

  async getErrorMessage(response) {
    const payload = await this.parseResponse(response).catch(() => null);
    if (payload?.message) {
      return payload.message;
    }

    if (payload?.errors) {
      const firstValidationError = Object.values(payload.errors).flat().find(Boolean);
      if (firstValidationError) {
        return firstValidationError;
      }
    }

    if (payload?.title) {
      return payload.title;
    }

    const statusMessages = {
      400: 'The submitted information is invalid.',
      401: 'Email/username or password is incorrect.',
      403: 'You do not have permission to perform this action.',
      404: 'The requested resource was not found.',
      409: 'Username or email already exists.',
      429: 'Too many attempts. Please wait a moment and try again.',
    };
    return statusMessages[response.status] || `Request failed (${response.status}).`;
  }

  async request(endpoint, options = {}) {
    const url = this.buildUrl(endpoint);
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
      if (endpoint === '/api/auth/login' || endpoint === '/api/auth/register') {
        const authError = new Error(await this.getErrorMessage(response));
        authError.status = response.status;
        throw authError;
      }

      // Try to refresh token
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        const newToken = await this.refresh(refreshToken);
        if (newToken) {
          headers['Authorization'] = `Bearer ${newToken}`;
          const retryResponse = await fetch(url, { ...options, headers });
          if (retryResponse.ok) {
            return this.parseResponse(retryResponse);
          }
        }
      }
      // Clear tokens and redirect to login
      this.clearTokens();
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const requestError = new Error(await this.getErrorMessage(response));
      requestError.status = response.status;
      throw requestError;
    }

    return this.parseResponse(response);
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
      const response = await fetch(this.buildUrl('/api/auth/refresh'), {
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

  // User administration endpoints
  async getUsers() {
    return this.request('/api/users');
  }

  async createUser(data) {
    return this.request('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(id, data) {
    return this.request(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async lockUser(id) {
    return this.request(`/api/users/${id}/lock`, { method: 'PATCH' });
  }

  async unlockUser(id) {
    return this.request(`/api/users/${id}/unlock`, { method: 'PATCH' });
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

  async getMyClubAccess() {
    return this.request('/api/clubs/me/access');
  }

  async getManagedClubs() {
    return this.request('/api/clubs/me/managed');
  }

  async joinClub(clubId, request) {
    return this.request(`/api/clubs/${clubId}/join`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getClubMemberships(clubId) {
    return this.request(`/api/clubs/${clubId}/memberships`);
  }

  async approveClubMembership(membershipId, note = '') {
    return this.request(`/api/clubs/memberships/${membershipId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    });
  }

  async rejectClubMembership(membershipId, note = '') {
    return this.request(`/api/clubs/memberships/${membershipId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ note }),
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

  async getReportingDeadlines() {
    return this.request('/api/reporting-deadlines');
  }

  async createReport(data) {
    return this.request('/api/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateReport(id, data) {
    return this.request(`/api/reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async submitReport(id) {
    return this.request(`/api/reports/${id}/submit`, { method: 'POST' });
  }

  async reviewReport(id, feedback = '') {
    return this.request(`/api/reports/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ feedback }),
    });
  }

  async approveReport(id, feedback = '') {
    return this.request(`/api/reports/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ feedback }),
    });
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

  async getActivity(id) {
    return this.request(`/api/activities/${id}`);
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

  async completeActivity(activityId) {
    return this.request(`/api/activities/${activityId}/complete`, {
      method: 'PATCH',
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

  async rejectBudget(id, note) {
    return this.request(`/api/finance/proposals/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ approvedAmount: null, note }),
    });
  }

  async createSettlement(proposalId, data) {
    return this.request(`/api/finance/proposals/${proposalId}/settlements`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async approveSettlement(settlementId, note = '') {
    return this.request(`/api/finance/settlements/${settlementId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    });
  }

  async getFinanceTransactions(clubId) {
    const query = clubId ? `?clubId=${clubId}` : '';
    return this.request(`/api/finance/transactions${query}`);
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
