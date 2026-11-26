import api from "./api";

function toFormData(values, file, fileField = "image") {
  const formData = new FormData();
  Object.entries(values).forEach(([key, val]) => {
    if (val !== undefined && val !== null) {
      formData.append(key, val);
    }
  });
  if (file) {
    formData.append(fileField, file);
  }
  return formData;
}

export const reportService = {
  async listPublic(params = {}) {
    const { data } = await api.get("/reports", { params });
    return data;
  },
  async getById(id) {
    const { data } = await api.get(`/reports/${id}`);
    return data.data;
  },
  async listMine() {
    const { data } = await api.get("/reports/mine");
    return data.data;
  },
  async create(values, imageFile) {
    const body = toFormData(values, imageFile, "image");
    const { data } = await api.post("/reports", body);
    return data.data;
  },
  async update(id, values, imageFile) {
    const body = toFormData(values, imageFile, "image");
    const { data } = await api.put(`/reports/${id}`, body);
    return data.data;
  },
};
