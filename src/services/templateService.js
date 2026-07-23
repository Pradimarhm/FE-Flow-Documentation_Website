import apiClient from './apiClient';

export const templateService = {
    // GET /templates
    getTemplates: async () => {
        const response = await apiClient.get('/templates');
        return response.data;
    },

    // POST /templates
    createTemplate: async (payload) => {
        const response = await apiClient.post('/templates', payload);
        return response.data;
    },

    // GET /templates/{template}
    getTemplateById: async (templateId) => {
        const response = await apiClient.get(`/templates/${templateId}`);
        return response.data;
    },

    // PUT /templates/{template}
    updateTemplate: async (templateId, payload) => {
        const response = await apiClient.put(`/templates/${templateId}`, payload);
        return response.data;
    },

    // DELETE /templates/{template}
    deleteTemplate: async (templateId) => {
        const response = await apiClient.delete(`/templates/${templateId}`);
        return response.data;
    }
};