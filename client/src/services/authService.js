import api from "./api";

export const authService = {
  async register(payload) {
    const { data } = await api.post("/auth/register", payload);
    return data.user;
  },
  async login(payload) {
    const { data } = await api.post("/auth/login", payload);
    return data.user;
  },
  async logout() {
    await api.post("/auth/logout");
  },
  async me() {
    const { data } = await api.get("/auth/me");
    return data.user;
  },
  async updateProfile(payload) {
    const { data } = await api.put("/auth/profile", payload);
    return data.user;
  },
};
