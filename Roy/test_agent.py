"""
Quick test script for the Hospital Voice Assistant
Run this to verify the agent tools are working correctly
"""

import asyncio
from src.hospital_agent import HospitalAssistant, patient_db
from livekit.agents import RunContext


async def test_tools():
    """Test all the agent tools"""
    
    print("🏥 Testing Hospital Voice Assistant Tools\n")
    print("=" * 60)
    
    # Create agent instance
    agent = HospitalAssistant()
    
    # Mock context (normally provided by LiveKit)
    class MockContext:
        pass
    
    context = MockContext()
    
    # Test 1: Get Patient Info
    print("\n📋 Test 1: Get Patient Information")
    print("-" * 60)
    result = await agent.get_patient_info(context, "bed_12", "all")
    print(f"Result: {result}")
    
    # Test 2: Update Vitals
    print("\n🌡️  Test 2: Update Patient Vitals")
    print("-" * 60)
    result = await agent.update_patient_vitals(
        context, 
        "bed_12", 
        "oxygen", 
        "96"
    )
    print(f"Result: {result}")
    
    # Test 3: Get Vitals (verify update)
    print("\n📊 Test 3: Verify Vitals Update")
    print("-" * 60)
    result = await agent.get_patient_info(context, "bed_12", "vitals")
    print(f"Result: {result}")
    
    # Test 4: Record Medication
    print("\n💊 Test 4: Record Medication Administration")
    print("-" * 60)
    result = await agent.record_medication(
        context,
        "bed_12",
        "Insulin",
        "10 units"
    )
    print(f"Result: {result}")
    
    # Test 5: Emergency Alert
    print("\n🚨 Test 5: Send Emergency Alert")
    print("-" * 60)
    result = await agent.send_emergency_alert(
        context,
        "rapid_response",
        "bed_12",
        "Patient showing signs of distress"
    )
    print(f"Result: {result}")
    
    # Test 6: Contextual Query
    print("\n🔍 Test 6: Contextual Patient Query")
    print("-" * 60)
    print(f"Current context: {patient_db.current_context}")
    result = await agent.get_current_patient_info(context, "medications")
    print(f"Result: {result}")
    
    # Test 7: Get Second Patient
    print("\n👤 Test 7: Get Second Patient Info")
    print("-" * 60)
    result = await agent.get_patient_info(context, "ward_b_3", "summary")
    print(f"Result: {result}")
    
    # Test 8: Update Second Patient
    print("\n🌡️  Test 8: Update Second Patient Temperature")
    print("-" * 60)
    result = await agent.update_patient_vitals(
        context,
        "ward_b_3",
        "temperature",
        "101.2"
    )
    print(f"Result: {result}")
    
    # Test 9: Contextual Query for Second Patient
    print("\n🔍 Test 9: Contextual Query (Should use ward_b_3)")
    print("-" * 60)
    print(f"Current context: {patient_db.current_context}")
    result = await agent.get_current_patient_info(context, "vitals")
    print(f"Result: {result}")
    
    # Test 10: Invalid Patient
    print("\n❌ Test 10: Try Invalid Patient ID")
    print("-" * 60)
    result = await agent.get_patient_info(context, "bed_99", "all")
    print(f"Result: {result}")
    
    print("\n" + "=" * 60)
    print("✅ All tests completed!")
    print("\nCurrent Patient Database State:")
    print("-" * 60)
    for bed_id, patient in patient_db.patients.items():
        print(f"\n{bed_id}:")
        print(f"  Name: {patient['name']}")
        print(f"  Vitals: {patient['vitals']}")
        print(f"  Last Updated: {patient['last_updated']}")


if __name__ == "__main__":
    print("🚀 Starting Hospital Voice Assistant Tool Tests...\n")
    asyncio.run(test_tools())
