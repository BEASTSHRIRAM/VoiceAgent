import { mutation } from "./_generated/server";

export const seedData = mutation({
  visibility: "public",
  handler: async (ctx) => {
    // Clear existing data - delete all records
    const allPatients = await ctx.db.query("patients").collect();
    for (const patient of allPatients) {
      await ctx.db.delete(patient._id);
    }

    const allVitals = await ctx.db.query("vitalSigns").collect();
    for (const vital of allVitals) {
      await ctx.db.delete(vital._id);
    }

    const allMeds = await ctx.db.query("medications").collect();
    for (const med of allMeds) {
      await ctx.db.delete(med._id);
    }

    const allMedAdmin = await ctx.db.query("medicationAdministration").collect();
    for (const admin of allMedAdmin) {
      await ctx.db.delete(admin._id);
    }

    const patients = [
      {
        patientId: "P102",
        name: "John Doe",
        age: 65,
        gender: "Male",
        bedNumber: "1",
        ward: "General Ward A",
        diagnosis: "Type 2 Diabetes, Hypertension",
        allergies: ["Penicillin"],
        attendingPhysician: "Dr. Sarah Johnson",
        nurseAssigned: "Nurse Emily Chen",
        temperature: 98.6,
        bpSystolic: 140,
        bpDiastolic: 90,
        oxygenSaturation: 95,
        heartRate: 78,
        respiratoryRate: 16,
      },
      {
        patientId: "P205",
        name: "Jane Smith",
        age: 42,
        gender: "Female",
        bedNumber: "2",
        ward: "Surgical Ward B",
        diagnosis: "Post-operative recovery - Appendectomy",
        allergies: [],
        attendingPhysician: "Dr. Michael Brown",
        nurseAssigned: "Nurse David Lee",
        temperature: 99.2,
        bpSystolic: 120,
        bpDiastolic: 80,
        oxygenSaturation: 98,
        heartRate: 72,
        respiratoryRate: 14,
      },
      {
        patientId: "P308",
        name: "Robert Williams",
        age: 78,
        gender: "Male",
        bedNumber: "3",
        ward: "ICU",
        diagnosis: "Acute Myocardial Infarction",
        allergies: ["Aspirin", "Sulfa drugs"],
        attendingPhysician: "Dr. Lisa Anderson",
        nurseAssigned: "Nurse Maria Garcia",
        temperature: 98.2,
        bpSystolic: 110,
        bpDiastolic: 70,
        oxygenSaturation: 92,
        heartRate: 88,
        respiratoryRate: 18,
      },
      {
        patientId: "P401",
        name: "Patricia Martinez",
        age: 55,
        gender: "Female",
        bedNumber: "4",
        ward: "General Ward A",
        diagnosis: "Pneumonia, Chronic Obstructive Pulmonary Disease",
        allergies: ["Erythromycin"],
        attendingPhysician: "Dr. James Wilson",
        nurseAssigned: "Nurse Rachel Green",
        temperature: 101.5,
        bpSystolic: 135,
        bpDiastolic: 85,
        oxygenSaturation: 88,
        heartRate: 95,
        respiratoryRate: 22,
      },
      {
        patientId: "P502",
        name: "Christopher Lee",
        age: 48,
        gender: "Male",
        bedNumber: "5",
        ward: "General Ward B",
        diagnosis: "Acute Gastroenteritis",
        allergies: [],
        attendingPhysician: "Dr. Patricia Davis",
        nurseAssigned: "Nurse Thomas Brown",
        temperature: 100.8,
        bpSystolic: 125,
        bpDiastolic: 78,
        oxygenSaturation: 97,
        heartRate: 82,
        respiratoryRate: 15,
      },
      {
        patientId: "P603",
        name: "Margaret Thompson",
        age: 72,
        gender: "Female",
        bedNumber: "6",
        ward: "ICU",
        diagnosis: "Sepsis, Acute Kidney Injury",
        allergies: ["Ciprofloxacin"],
        attendingPhysician: "Dr. Richard Taylor",
        nurseAssigned: "Nurse Susan White",
        temperature: 102.1,
        bpSystolic: 95,
        bpDiastolic: 60,
        oxygenSaturation: 89,
        heartRate: 105,
        respiratoryRate: 24,
      },
      {
        patientId: "P704",
        name: "David Anderson",
        age: 61,
        gender: "Male",
        bedNumber: "7",
        ward: "Cardiac Ward C",
        diagnosis: "Congestive Heart Failure, Atrial Fibrillation",
        allergies: ["Warfarin"],
        attendingPhysician: "Dr. Helen Martinez",
        nurseAssigned: "Nurse Kevin Johnson",
        temperature: 98.4,
        bpSystolic: 130,
        bpDiastolic: 82,
        oxygenSaturation: 94,
        heartRate: 92,
        respiratoryRate: 17,
      },
      {
        patientId: "P805",
        name: "Sandra Robinson",
        age: 58,
        gender: "Female",
        bedNumber: "8",
        ward: "General Ward A",
        diagnosis: "Fractured Hip, Osteoporosis",
        allergies: ["NSAIDs"],
        attendingPhysician: "Dr. George Clark",
        nurseAssigned: "Nurse Lisa Anderson",
        temperature: 98.9,
        bpSystolic: 128,
        bpDiastolic: 79,
        oxygenSaturation: 96,
        heartRate: 75,
        respiratoryRate: 16,
      },
      {
        patientId: "P906",
        name: "Michael Johnson",
        age: 35,
        gender: "Male",
        bedNumber: "9",
        ward: "General Ward B",
        diagnosis: "Acute Appendicitis (Pre-operative)",
        allergies: [],
        attendingPhysician: "Dr. Nancy White",
        nurseAssigned: "Nurse James Miller",
        temperature: 99.8,
        bpSystolic: 132,
        bpDiastolic: 84,
        oxygenSaturation: 98,
        heartRate: 88,
        respiratoryRate: 16,
      },
      {
        patientId: "P1007",
        name: "Elizabeth Harris",
        age: 68,
        gender: "Female",
        bedNumber: "10",
        ward: "ICU",
        diagnosis: "Stroke, Hypertension Crisis",
        allergies: ["Heparin"],
        attendingPhysician: "Dr. Charles Moore",
        nurseAssigned: "Nurse Amanda Taylor",
        temperature: 98.7,
        bpSystolic: 165,
        bpDiastolic: 105,
        oxygenSaturation: 93,
        heartRate: 98,
        respiratoryRate: 19,
      },
    ];

    // Insert all patients and their vitals
    for (const p of patients) {
      const patientId = await ctx.db.insert("patients", {
        patientId: p.patientId,
        name: p.name,
        age: p.age,
        gender: p.gender,
        bedNumber: p.bedNumber,
        ward: p.ward,
        admissionDate: new Date("2026-05-15").toISOString(),
        diagnosis: p.diagnosis,
        allergies: p.allergies,
        attendingPhysician: p.attendingPhysician,
        nurseAssigned: p.nurseAssigned,
      });

      await ctx.db.insert("vitalSigns", {
        patientId: p.patientId,
        temperature: p.temperature,
        bpSystolic: p.bpSystolic,
        bpDiastolic: p.bpDiastolic,
        oxygenSaturation: p.oxygenSaturation,
        heartRate: p.heartRate,
        respiratoryRate: p.respiratoryRate,
        recordedAt: new Date().toISOString(),
        recordedBy: p.nurseAssigned,
      });
    }

    return { 
      success: true, 
      message: `Seeded ${patients.length} patients with vitals (cleared old data)`,
      count: patients.length
    };
  },
});
