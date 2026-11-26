import api from "./api";

export const dashboardService = {
  async getStudentDashboard() {
    const { data } = await api.get("/dashboard/student");
    return data.data;
  },
  async getAdminDashboard() {
    const { data } = await api.get("/admin/dashboard");
    return data.data;
  },
};
