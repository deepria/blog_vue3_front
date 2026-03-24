import apiClient from '@/services/api';

/**
 * Chat (LLM) API Service
 */
export const chatApi = {
  /**
   * Send a message to the LLM backend
   * @param {string} message - User input
   * @returns {Promise<string>} - Assistant reply content
   */
  async sendMessage(message) {
    const response = await apiClient.post('/api/chat', { message });
    return response.data?.reply || '';
  }
};
