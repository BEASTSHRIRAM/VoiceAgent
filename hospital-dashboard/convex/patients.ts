import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getPatientByBed = query({
  args: { bedNumber: v.string() },
  visibility: "public",
  handler: async (ctx, args) => {
    const patient = await ctx.db
      .query("patients")
      .withIndex("by_bed", (q) => q.eq("bedNumber", args.bedNumber))
      .first();

    if (!patient) return null;

    const latestVitals = await ctx.db
      .query("vitalSigns")
      .withIndex("by_patient", (q) => q.eq("patientId", patient.patientId))
      .order("desc")
      .first();

    const medications = await ctx.db
      .query("medications")
      .withIndex("by_patient", (q) =>
        q.eq("patientId", patient.patientId).eq("active", true)
      )
      .collect();

    return { ...patient, vitals: latestVitals, medications };
  },
});

export const getAllPatients = query({
  visibility: "public",
  handler: async (ctx) => {
    const patients = await ctx.db.query("patients").collect();

    const patientsWithVitals = await Promise.all(
      patients.map(async (patient) => {
        const latestVitals = await ctx.db
          .query("vitalSigns")
          .withIndex("by_patient", (q) => q.eq("patientId", patient.patientId))
          .order("desc")
          .first();

        return { ...patient, vitals: latestVitals };
      })
    );

    return patientsWithVitals;
  },
});

export const addVitalSigns = mutation({
  args: {
    patientId: v.string(),
    temperature: v.number(),
    bpSystolic: v.number(),
    bpDiastolic: v.number(),
    oxygenSaturation: v.number(),
    heartRate: v.number(),
    respiratoryRate: v.optional(v.number()),
    recordedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("vitalSigns", {
      ...args,
      recordedAt: new Date().toISOString(),
    });
  },
});

export const recordMedicationAdministration = mutation({
  args: {
    patientId: v.string(),
    medicationName: v.string(),
    dosage: v.string(),
    administeredBy: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("medicationAdministration", {
      ...args,
      administeredAt: new Date().toISOString(),
    });
  },
});

export const createEmergencyAlert = mutation({
  args: {
    alertType: v.string(),
    location: v.string(),
    patientId: v.optional(v.string()),
    initiatedBy: v.string(),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("emergencyAlerts", {
      ...args,
      initiatedAt: new Date().toISOString(),
      status: "active",
    });
  },
});

export const getActiveAlerts = query({
  visibility: "public",
  handler: async (ctx) => {
    return await ctx.db
      .query("emergencyAlerts")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .order("desc")
      .collect();
  },
});

export const upsertPatient = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("patients")
      .withIndex("by_patient_id", (q) => q.eq("patientId", args.patientId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }
    return await ctx.db.insert("patients", args);
  },
});
