import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../server/server.js";
import pool from "../server/config/db.js";

let studentAgent;
let secondStudentAgent;
let adminAgent;
let createdReportId;
let createdClaimId;

beforeAll(async () => {
  studentAgent = request.agent(app);
  secondStudentAgent = request.agent(app);
  adminAgent = request.agent(app);

  await studentAgent.post("/api/auth/login").send({
    email: "grace.natukunda@students.ucu.ac.ug",
    password: "Password@123",
  });

  await secondStudentAgent.post("/api/auth/login").send({
    email: "brian.mugisha@students.ucu.ac.ug",
    password: "Password@123",
  });

  await adminAgent.post("/api/auth/login").send({
    email: "d.tumusiime@ucu.ac.ug",
    password: "Password@123",
  });
});

afterAll(async () => {
  await pool.end();
});

describe("UCU Lost & Found API, RBAC, Security & Transaction Tests", () => {
  it("TC-01: Rejects unauthenticated access to protected routes (401)", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("TC-02: Blocks student access to admin analytics endpoint (403)", async () => {
    const res = await studentAgent.get("/api/admin/dashboard");
    expect(res.status).toBe(403);
  });

  it("TC-03: Creates a FOUND item report and hides private_identifying_info in public listing", async () => {
    const createRes = await studentAgent.post("/api/reports").send({
      report_type: "FOUND",
      title: "Scientific Calculator Casio fx-991EX",
      category: "Books & Stationery",
      description:
        "Black scientific calculator found on front bench in Bishop Stuart Hall.",
      private_identifying_info:
        "Battery cover has sticker reading S23-CALC-88.",
      location_text: "Bishop Stuart Hall",
      incident_date: "2026-11-20",
    });
    expect(createRes.status).toBe(201);
    createdReportId = createRes.body.data.id;

    const listRes = await request(app).get("/api/reports?q=Casio");
    expect(listRes.status).toBe(200);
    const match = listRes.body.data.find((r) => r.id === createdReportId);
    expect(match).toBeDefined();
    expect(match.private_identifying_info).toBeUndefined();
  });

  it("TC-04: Prevents a student from editing another student report (403)", async () => {
    const res = await secondStudentAgent
      .put(`/api/reports/${createdReportId}`)
      .send({
        title: "Tampered Title",
      });
    expect(res.status).toBe(403);
  });

  it("TC-05: Prevents a student from claiming their own FOUND item report (400)", async () => {
    const res = await studentAgent.post("/api/claims").send({
      report_id: createdReportId,
      ownership_explanation: "Trying to claim my own found report.",
      private_evidence_details: "S23-CALC-88",
    });
    expect(res.status).toBe(400);
  });

  it("TC-06: Allows an eligible student to submit a valid ownership claim (201)", async () => {
    const res = await secondStudentAgent.post("/api/claims").send({
      report_id: createdReportId,
      ownership_explanation:
        "Left my calculator after Database Systems lecture in Bishop Stuart Hall.",
      private_evidence_details:
        "Sticker inside battery cover reads S23-CALC-88.",
    });
    expect(res.status).toBe(201);
    createdClaimId = res.body.data.id;
  });

  it("TC-07: Approves valid claim once and blocks conflicting duplicate approvals (409)", async () => {
    const approveRes = await adminAgent
      .post(`/api/admin/claims/${createdClaimId}/decision`)
      .send({
        decision: "APPROVED",
        decision_reason:
          "Sticker code S23-CALC-88 matches private report notes.",
      });
    expect(approveRes.status).toBe(200);

    const duplicateRes = await adminAgent
      .post(`/api/admin/claims/${createdClaimId}/decision`)
      .send({
        decision: "APPROVED",
        decision_reason: "Duplicate approval attempt.",
      });
    expect(duplicateRes.status).toBe(409);
  });

  it("TC-08: Confirms physical item return and locks item against new claims", async () => {
    const returnRes = await adminAgent.post("/api/admin/returns/confirm").send({
      claim_id: createdClaimId,
      collector_name: "Mugisha Brian",
      collector_id_number: "S23B13/0419",
      verification_notes: "Verified UCU student ID card at security office.",
    });
    expect(returnRes.status).toBe(201);
    expect(returnRes.body.data.status).toBe("RETURNED");

    const postReturnClaim = await secondStudentAgent.post("/api/claims").send({
      report_id: createdReportId,
      ownership_explanation: "Attempting claim after return.",
      private_evidence_details: "S23-CALC-88",
    });
    expect(postReturnClaim.status).toBe(409);
  });
});
