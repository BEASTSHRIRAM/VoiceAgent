"use client";

import Link from "next/link";
import { Mic, Activity, AlertCircle, Users, ArrowRight, Check } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-black text-white z-50 h-11 flex items-center px-8">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <div className="text-sm font-medium">Hospital Ward Assistant</div>
          <Link
            href="/voice"
            className="text-sm px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-full transition"
          >
            Launch
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-semibold tracking-tight mb-6 leading-tight">
            Voice-Controlled Patient Care
          </h1>
          <p className="text-2xl text-gray-600 font-light mb-12 leading-relaxed">
            Real-time patient monitoring and hands-free hospital management. Designed for modern clinical workflows.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/voice"
              className="px-8 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition inline-flex items-center gap-2"
            >
              Start Conversation
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/dashboard"
              className="px-8 py-3 border border-gray-300 text-gray-900 rounded-full font-medium hover:bg-gray-50 transition"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section - Light */}
      <section className="py-24 px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <div className="flex flex-col">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Mic className="text-blue-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Voice Commands</h3>
              <p className="text-gray-600 leading-relaxed">
                Ask for patient information, update vitals, and manage medications using natural voice commands. No typing required.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Activity className="text-blue-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Real-Time Monitoring</h3>
              <p className="text-gray-600 leading-relaxed">
                Track patient vitals, medications, and medical history in real-time. Get instant access to critical information.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <AlertCircle className="text-blue-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Emergency Alerts</h3>
              <p className="text-gray-600 leading-relaxed">
                Instantly send emergency alerts and coordinate rapid response. Keep your team informed in critical moments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Showcase - Dark */}
      <section className="py-24 px-8 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl font-semibold mb-6 leading-tight">
                Designed for Clinical Teams
              </h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Built specifically for doctors and nurses who need fast, reliable access to patient data without interrupting their workflow.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Check size={20} className="text-blue-400 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">Instant patient lookup by bed number or name</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check size={20} className="text-blue-400 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">Update vitals and medications hands-free</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check size={20} className="text-blue-400 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">Manage emergency alerts and rapid response</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check size={20} className="text-blue-400 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">HIPAA-compliant data handling</span>
                </li>
              </ul>
            </div>
            <div className="bg-gray-800 rounded-lg p-8 h-96 flex items-center justify-center">
              <div className="text-center">
                <Mic size={64} className="text-blue-400 mx-auto mb-4" />
                <p className="text-gray-400">Voice Interface Preview</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities - Light */}
      <section className="py-24 px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-semibold text-center mb-16">Core Capabilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Capability 1 */}
            <div className="border border-gray-200 rounded-lg p-8">
              <h3 className="text-lg font-semibold mb-3">Patient Information Retrieval</h3>
              <p className="text-gray-600 mb-4">
                Quickly access comprehensive patient data including vitals, medications, diagnosis, and medical history.
              </p>
              <p className="text-sm text-gray-500">Ask: "What's the status of bed 12?" or "Show me vitals for Jane Smith"</p>
            </div>

            {/* Capability 2 */}
            <div className="border border-gray-200 rounded-lg p-8">
              <h3 className="text-lg font-semibold mb-3">Vital Signs Management</h3>
              <p className="text-gray-600 mb-4">
                Record and update patient vitals in real-time. Track temperature, blood pressure, oxygen saturation, and heart rate.
              </p>
              <p className="text-sm text-gray-500">Say: "Update bed 5 oxygen to 96 percent"</p>
            </div>

            {/* Capability 3 */}
            <div className="border border-gray-200 rounded-lg p-8">
              <h3 className="text-lg font-semibold mb-3">Medication Administration</h3>
              <p className="text-gray-600 mb-4">
                Record medication administration and manage patient medication regimens. Never miss a dose.
              </p>
              <p className="text-sm text-gray-500">Say: "Mark insulin administered to bed 3"</p>
            </div>

            {/* Capability 4 */}
            <div className="border border-gray-200 rounded-lg p-8">
              <h3 className="text-lg font-semibold mb-3">Emergency Response</h3>
              <p className="text-gray-600 mb-4">
                Instantly trigger emergency alerts and coordinate rapid response across your clinical team.
              </p>
              <p className="text-sm text-gray-500">Say: "Code blue in ICU, bed 7"</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Dark */}
      <section className="py-24 px-8 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center">
            <div>
              <div className="text-4xl font-semibold text-blue-400 mb-2">10+</div>
              <p className="text-gray-400">Concurrent Patients</p>
            </div>
            <div>
              <div className="text-4xl font-semibold text-blue-400 mb-2">Sub-second</div>
              <p className="text-gray-400">Response Time</p>
            </div>
            <div>
              <div className="text-4xl font-semibold text-blue-400 mb-2">24/7</div>
              <p className="text-gray-400">Availability</p>
            </div>
            <div>
              <div className="text-4xl font-semibold text-blue-400 mb-2">HIPAA</div>
              <p className="text-gray-400">Compliant</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Light */}
      <section className="py-24 px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-semibold mb-6">Ready to Transform Your Workflow?</h2>
          <p className="text-xl text-gray-600 mb-12">
            Start using voice-controlled patient care today. No setup required.
          </p>
          <Link
            href="/voice"
            className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition"
          >
            Launch Voice Assistant
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-12 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/voice" className="hover:text-gray-900">Voice Assistant</Link></li>
                <li><Link href="/dashboard" className="hover:text-gray-900">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">Documentation</a></li>
                <li><a href="#" className="hover:text-gray-900">API Reference</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">About</a></li>
                <li><a href="#" className="hover:text-gray-900">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">Privacy</a></li>
                <li><a href="#" className="hover:text-gray-900">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 text-center text-sm text-gray-600">
            <p>Hospital Ward Assistant. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
