"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Activity, AlertCircle, Mic, Users } from "lucide-react";

export default function Home() {
  const patients = useQuery(api.patients.getAllPatients);
  const activeAlerts = useQuery(api.patients.getActiveAlerts);

  const stableCount = patients?.filter((p) => p.vitals?.oxygenSaturation >= 95).length || 0;
  const criticalCount = patients?.filter((p) => p.vitals?.oxygenSaturation < 90).length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              🏥 Hospital Ward Dashboard
            </h1>
            <Link
              href="/voice"
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Mic size={20} />
              Voice Assistant
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Users className="text-blue-600 mr-3" size={32} />
              <div>
                <p className="text-gray-500 text-sm">Total Patients</p>
                <p className="text-2xl font-bold">{patients?.length || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Activity className="text-green-600 mr-3" size={32} />
              <div>
                <p className="text-gray-500 text-sm">Stable</p>
                <p className="text-2xl font-bold">{stableCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <AlertCircle className="text-red-600 mr-3" size={32} />
              <div>
                <p className="text-gray-500 text-sm">Critical</p>
                <p className="text-2xl font-bold">{criticalCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <AlertCircle className="text-orange-600 mr-3" size={32} />
              <div>
                <p className="text-gray-500 text-sm">Active Alerts</p>
                <p className="text-2xl font-bold">{activeAlerts?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Patient List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">Patients</h2>
          </div>
          <div className="divide-y">
            {!patients ? (
              <div className="px-6 py-8 text-center text-gray-500">
                Loading patients...
              </div>
            ) : patients.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No patients found. Add patients using the voice assistant.
              </div>
            ) : (
              patients.map((patient) => (
                <div
                  key={patient._id}
                  className="px-6 py-4 hover:bg-gray-50 transition"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-lg">{patient.name}</h3>
                      <p className="text-gray-500">{patient.bedNumber} • {patient.ward}</p>
                      <p className="text-sm text-gray-600 mt-1">{patient.diagnosis}</p>
                    </div>
                    {patient.vitals && (
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Temp</p>
                          <p className="font-semibold">{patient.vitals.temperature}°F</p>
                        </div>
                        <div>
                          <p className="text-gray-500">BP</p>
                          <p className="font-semibold">
                            {patient.vitals.bpSystolic}/{patient.vitals.bpDiastolic}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">O2</p>
                          <p className={`font-semibold ${
                            patient.vitals.oxygenSaturation < 90 ? 'text-red-600' :
                            patient.vitals.oxygenSaturation < 95 ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {patient.vitals.oxygenSaturation}%
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">HR</p>
                          <p className="font-semibold">{patient.vitals.heartRate}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
