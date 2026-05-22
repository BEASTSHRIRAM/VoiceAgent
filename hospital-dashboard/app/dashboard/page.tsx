"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Activity, AlertCircle, Mic, Users, ArrowLeft } from "lucide-react";

type Patient = {
  _id: string;
  patientId: string;
  name: string;
  age: number;
  gender?: string;
  bedNumber: string;
  ward: string;
  admissionDate: string;
  diagnosis: string;
  allergies: string[];
  attendingPhysician?: string;
  nurseAssigned?: string;
  vitals?: {
    temperature: number;
    bpSystolic: number;
    bpDiastolic: number;
    oxygenSaturation: number;
    heartRate: number;
    respiratoryRate?: number;
    recordedAt: string;
    recordedBy?: string;
  };
};

export default function Dashboard() {
  const patients = useQuery(api.patients.getAllPatients, {}) as Patient[] | undefined;
  const activeAlerts = useQuery(api.patients.getActiveAlerts, {});

  const stableCount = patients?.filter((p: Patient) => (p.vitals?.oxygenSaturation ?? 0) >= 95).length || 0;
  const criticalCount = patients?.filter((p: Patient) => (p.vitals?.oxygenSaturation ?? 0) < 90).length || 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-black text-white z-50 h-11 flex items-center px-8 border-b border-gray-800">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium hover:text-gray-300">
            <ArrowLeft size={16} />
            Back
          </Link>
          <div className="text-sm">Patient Dashboard</div>
          <Link
            href="/voice"
            className="text-sm px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-full transition"
          >
            Voice Assistant
          </Link>
        </div>
      </nav>

      <main className="pt-16 pb-12 px-8">
        <div className="max-w-7xl mx-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Total Patients</p>
                  <p className="text-3xl font-semibold">{patients?.length || 0}</p>
                </div>
                <Users className="text-gray-400" size={32} />
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Stable</p>
                  <p className="text-3xl font-semibold text-green-600">{stableCount}</p>
                </div>
                <Activity className="text-gray-400" size={32} />
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Critical</p>
                  <p className="text-3xl font-semibold text-red-600">{criticalCount}</p>
                </div>
                <AlertCircle className="text-gray-400" size={32} />
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Active Alerts</p>
                  <p className="text-3xl font-semibold text-orange-600">{activeAlerts?.length || 0}</p>
                </div>
                <AlertCircle className="text-gray-400" size={32} />
              </div>
            </div>
          </div>

          {/* Patient List */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold">Current Patients</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {!patients ? (
                <div className="px-8 py-12 text-center text-gray-500">
                  Loading patients...
                </div>
              ) : patients.length === 0 ? (
                <div className="px-8 py-12 text-center text-gray-500">
                  No patients found. Use the voice assistant to add patients.
                </div>
              ) : (
                patients.map((patient) => (
                  <div
                    key={patient._id}
                    className="px-8 py-6 hover:bg-gray-50 transition"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{patient.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Bed {patient.bedNumber} • {patient.ward}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Age {patient.age}</p>
                        {patient.attendingPhysician && (
                          <p className="text-sm text-gray-600">Dr. {patient.attendingPhysician.split(" ").pop()}</p>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-4">
                      <span className="font-medium">Diagnosis:</span> {patient.diagnosis}
                    </p>

                    {patient.vitals && (
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t border-gray-200">
                        <div>
                          <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Temperature</p>
                          <p className="text-lg font-semibold">{patient.vitals.temperature}°C</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Blood Pressure</p>
                          <p className="text-lg font-semibold">
                            {patient.vitals.bpSystolic}/{patient.vitals.bpDiastolic}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Oxygen</p>
                          <p className={`text-lg font-semibold ${
                            patient.vitals.oxygenSaturation < 90 ? 'text-red-600' :
                            patient.vitals.oxygenSaturation < 95 ? 'text-orange-600' :
                            'text-green-600'
                          }`}>
                            {patient.vitals.oxygenSaturation}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Heart Rate</p>
                          <p className="text-lg font-semibold">{patient.vitals.heartRate} bpm</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Respiratory</p>
                          <p className="text-lg font-semibold">{patient.vitals.respiratoryRate || "N/A"}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
