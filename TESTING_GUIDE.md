# Baby Tracker App - Testing Guide

## Test Results Summary

### ✅ All Features Tested

| Feature | Status | Notes |
|---------|--------|-------|
| 1. Register | ✅ PASS | Email confirmation disabled |
| 2. Login | ✅ PASS | Working |
| 3. Add Child | ✅ PASS | Can add multiple children |
| 4. Track Feeding | ✅ PASS | Milk, porridge, solid |
| 5. Track Growth | ✅ PASS | Height, weight, head |
| 6. Track Milestones | ✅ PASS | First tooth, crawling, etc. |
| 7. Track Vaccination | ✅ PASS | Vaccine name, dose, reaction |
| 8. AI Analysis | ✅ PASS | Using Groq API (llama-3.1-8b-instant) |
| 9. AI Doctor Chat | ✅ PASS | Chat with AI doctor |
| 10. Timeslice | ✅ PASS | UI ready (placeholder) |
| 11. Profile | ✅ PASS | Child management |

---

## Test Credentials

- **Email:** demo123@gmail.com
- **Password:** demo123456
- **Child:** Baby Demo (born 2024-01-15, male)

---

## Step-by-Step Testing Guide

### Step 1: Start the App

```bash
cd D:\bia-project
npx expo start --web --port 8081
```

Open browser: http://localhost:8081

### Step 2: Login

1. Enter email: `demo123@gmail.com`
2. Enter password: `demo123456`
3. Click "Đăng nhập"

### Step 3: View Dashboard (Home Tab)

- Shows child info
- Shows quick stats

### Step 4: Add/Manage Children (Profile Tab)

1. Go to Profile tab (👤)
2. Click "Thêm bé" to add new child
3. Enter: Name, Birth date, Gender
4. Click "Thêm"

### Step 5: Track Feeding

1. Go to Tracking tab (➕)
2. Select "Sữa/Ăn" tab
3. Choose type: Sữa / Cháo / Ăn cơm
4. Enter amount (ml for milk)
5. Enter times per day
6. Add notes (optional)
7. Click "💾 Lưu"

### Step 6: Track Growth

1. Go to Tracking tab
2. Select "Cao/Cân" tab
3. Enter height (cm)
4. Enter weight (kg)
5. Enter head circumference (optional)
6. Add notes
7. Click "💾 Lưu"

### Step 7: Track Milestones

1. Go to Tracking tab
2. Select "Mốc" tab
3. Choose milestone type
4. Add description
5. Click "💾 Lưu"

### Step 8: Track Vaccinations

1. Go to Tracking tab
2. Select "Tiêm" tab
3. Enter vaccine name
4. Enter dose number
5. Enter reaction (if any)
6. Click "💾 Lưu"

### Step 9: AI Analysis

1. Go to AI tab (🤖)
2. Select child if not selected
3. Choose data types to analyze:
   - 📏 Tăng trưởng (Growth)
   - 🍼 Chế độ ăn (Feeding)
   - 🎯 Mốc phát triển (Milestone)
   - 💉 Tiêm phòng (Vaccination)
4. Click "🔍 Phân tích"
5. Wait for AI to analyze
6. View results:
   - Summary
   - Growth assessment
   - Feeding insights
   - Recommendations
   - Alerts

### Step 10: AI Doctor Chat

1. Go to Chat tab (💬)
2. Select child
3. Choose quick question or type custom message
4. Click send (➤)
5. Wait for AI response

### Step 11: Timeslice (Coming Soon)

1. Go to Timeslice tab (🎬)
2. View UI
3. Select time range
4. Select style (Modern/Vintage)
5. Note: Feature is placeholder

---

## API Status

### Supabase
- **URL:** https://ssfghjfxopmzdrlcgioq.supabase.co
- **Status:** ✅ Connected
- **Tables:** profiles, children, tracking_records, chat_sessions, chat_messages

### Groq AI
- **Model:** llama-3.1-8b-instant
- **Status:** ✅ Working
- **Vietnamese:** ✅ Full support

---

## Database Schema

### profiles
- id (UUID, PK)
- email (TEXT)
- full_name (TEXT)
- role (TEXT): parent, nurse, clinic

### children
- id (UUID, PK)
- parent_id (UUID, FK)
- name (TEXT)
- birth_date (DATE)
- gender (TEXT): male, female
- photo_url (TEXT)

### tracking_records
- id (UUID, PK)
- child_id (UUID, FK)
- record_type (TEXT): feeding, growth, milestone, vaccination, sleep
- record_date (TIMESTAMP)
- data (JSONB)
- notes (TEXT)

### chat_sessions
- id (UUID, PK)
- child_id (UUID, FK)
- title (TEXT)

### chat_messages
- id (UUID, PK)
- session_id (UUID, FK)
- role (TEXT): user, assistant
- content (TEXT)

---

## Fixed Issues

1. **Groq Model:** Changed from `llama-3.1-70b-versatile` (deprecated) to `llama-3.1-8b-instant`
2. **Email Confirmation:** Disabled in Supabase
3. **RLS Policies:** Disabled for testing (should be re-enabled for production)
4. **Profile Creation:** Manual insert after signup (trigger not working)

---

## Notes for Production

1. Re-enable RLS with proper policies
2. Set up database trigger for profile creation
3. Add email confirmation for security
4. Implement image upload for children
5. Implement actual video generation for Timeslice
6. Add push notifications
7. Add data export feature
