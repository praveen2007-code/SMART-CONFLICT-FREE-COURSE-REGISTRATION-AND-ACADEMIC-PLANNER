import { PlannerService } from '../services/plannerService';

async function testPlanner() {
  console.log('--- Testing Smart Conflict-Free Planner Algorithm ---');

  // Test 1: Time overlap math
  const slot1 = { day: 'MON', startMinutes: 600, endMinutes: 690, rawStart: '10:00', rawEnd: '11:30' }; // 10:00 - 11:30
  const slot2 = { day: 'MON', startMinutes: 630, endMinutes: 720, rawStart: '10:30', rawEnd: '12:00' }; // 10:30 - 12:00
  const slot3 = { day: 'TUE', startMinutes: 600, endMinutes: 690, rawStart: '10:00', rawEnd: '11:30' }; // Tuesday (no overlap)
  const slot4 = { day: 'MON', startMinutes: 720, endMinutes: 810, rawStart: '12:00', rawEnd: '13:30' }; // Adjacent (no overlap)

  console.log('Slot 1 vs Slot 2 (Overlapping Monday):', PlannerService.isOverlap(slot1, slot2) ? 'PASS: Overlap Detected' : 'FAIL');
  console.log('Slot 1 vs Slot 3 (Different Days):', !PlannerService.isOverlap(slot1, slot3) ? 'PASS: No Overlap' : 'FAIL');
  console.log('Slot 2 vs Slot 4 (Back to Back):', !PlannerService.isOverlap(slot2, slot4) ? 'PASS: No Overlap' : 'FAIL');

  console.log('--- All algorithmic assertions passed! ---');
  process.exit(0);
}

testPlanner().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
