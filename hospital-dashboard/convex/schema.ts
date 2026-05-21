import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  patients: defineTable({
    patientId: v.string(),
    name: v.string(),
    age: v.number(),
    gender: v.optional(v.string()),
    bedNumber: v.string(),
    ward: v.string(),
    admissionDate: v.string(),
    diagnosis: v.string(),
    allergies: v.array(v.string()),
    attendingPhysician: v.optional(v.string()),
    nurseAssigned: v.optional(v.string()),
  })
    .index("by_bed", ["bedNumber"])
    .index("by_patient_id", ["patientId"]),

  vitalSigns: defineTable({
    patientId: v.string(),
    temperature: v.number(),
    bpSystolic: v.number(),
    bpDiastolic: v.number(),
    oxygenSaturation: v.number(),
    heartRate: v.number(),
    respiratoryRate: v.optional(v.number()),
    recordedAt: v.string(),
    recordedBy: v.optional(v.string()),
  }).index("by_patient", ["patientId", "recordedAt"]),

  medications: defineTable({
    patientId: v.string(),
    name: v.string(),
    dosage: v.string(),
    frequency: v.string(),
    route: v.string(),
    startDate: v.string(),
    endDate: v.optional(v.string()),
    prescribingDoctor: v.optional(v.string()),
    active: v.boolean(),
  }).index("by_patient", ["patientId", "active"]),

  medicationAdministration: defineTable({
    patientId: v.string(),
    medicationName: v.string(),
    dosage: v.string(),
    administeredAt: v.string(),
    administeredBy: v.string(),
    notes: v.optional(v.string()),
  }).index("by_patient", ["patientId", "administeredAt"]),

  emergencyAlerts: defineTable({
    alertType: v.string(),
    location: v.string(),
    patientId: v.optional(v.string()),
    initiatedBy: v.string(),
    initiatedAt: v.string(),
    details: v.optional(v.string()),
    responseTime: v.optional(v.string()),
    resolvedAt: v.optional(v.string()),
    outcome: v.optional(v.string()),
    status: v.string(),
  }).index("by_status", ["status", "initiatedAt"]),
});
