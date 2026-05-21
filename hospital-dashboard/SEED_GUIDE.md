# Seeding Patient Data

## How to Add the 10 Patients to Your Database

### Option 1: Using the Seed Page (Easiest)
1. Start your Next.js dev server: `npm run dev`
2. Navigate to `http://localhost:3000/seed`
3. Click the "Seed Database" button
4. The page will call the `seedData` mutation and add all 10 patients

### Option 2: Using Convex Dashboard
1. Go to [Convex Dashboard](https://dashboard.convex.dev)
2. Select your project
3. Go to the "Functions" tab
4. Find `seed.seedData` 
5. Click "Run" to execute the seed mutation

### Option 3: Using Convex CLI
```bash
npx convex run seed:seedData
```

## Patients Added

| ID | Name | Bed | Ward | Diagnosis | Age |
|---|---|---|---|---|---|
| P102 | John Doe | 1 | General Ward A | Type 2 Diabetes, Hypertension | 65 |
| P205 | Jane Smith | 2 | Surgical Ward B | Post-operative recovery - Appendectomy | 42 |
| P308 | Robert Williams | 3 | ICU | Acute Myocardial Infarction | 78 |
| P401 | Patricia Martinez | 4 | General Ward A | Pneumonia, COPD | 55 |
| P502 | Christopher Lee | 5 | General Ward B | Acute Gastroenteritis | 48 |
| P603 | Margaret Thompson | 6 | ICU | Sepsis, Acute Kidney Injury | 72 |
| P704 | David Anderson | 7 | Cardiac Ward C | Congestive Heart Failure, Atrial Fibrillation | 61 |
| P805 | Sandra Robinson | 8 | General Ward A | Fractured Hip, Osteoporosis | 58 |
| P906 | Michael Johnson | 9 | General Ward B | Acute Appendicitis (Pre-operative) | 35 |
| P1007 | Elizabeth Harris | 10 | ICU | Stroke, Hypertension Crisis | 68 |

## Test Queries for the Voice Agent

After seeding, try these voice commands:

- "What's the status of bed 1?" → John Doe
- "Show me vitals for bed 2" → Jane Smith
- "Who's in the ICU?" → Lists Robert, Margaret, Elizabeth
- "List all patients" → Shows all 10 patients
- "What's the diagnosis for bed 4?" → Patricia Martinez - Pneumonia, COPD

## Notes

- Each patient has realistic vital signs
- Vitals are recorded with current timestamp
- All patients have assigned physicians and nurses
- Some patients have allergies recorded
- Mix of general wards, surgical, cardiac, and ICU patients
