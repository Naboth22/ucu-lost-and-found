import api from "./api";

export const claimReturnService = {
  async submitClaim({
    report_id,
    ownership_explanation,
    private_evidence_details,
    evidenceFile,
  }) {
    const formData = new FormData();
    formData.append("report_id", String(report_id));
    formData.append("ownership_explanation", ownership_explanation);
    formData.append("private_evidence_details", private_evidence_details);
    if (evidenceFile) {
      formData.append("evidence", evidenceFile);
    }
    const { data } = await api.post("/claims", formData);
    return data.data;
  },
  async listMyClaims() {
    const { data } = await api.get("/claims/mine");
    return data.data;
  },
  async listAdminClaims() {
    const { data } = await api.get("/admin/claims");
    return data.data;
  },
  async decideClaim(claimId, { decision, decision_reason }) {
    const { data } = await api.post(`/admin/claims/${claimId}/decision`, {
      decision,
      decision_reason,
    });
    return data.data;
  },
  async listReturns() {
    const { data } = await api.get("/admin/returns");
    return data.data;
  },
  async confirmReturn(payload) {
    const { data } = await api.post("/admin/returns/confirm", payload);
    return data.data;
  },
};
