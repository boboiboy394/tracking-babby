# 👶 Baby Tracker App

Ứng dụng theo dõi sự phát triển của trẻ em dành cho phụ huynh và bác sĩ nhi khoa.

## ✨ Tính năng

### 🔐 Xác thực
- Đăng ký / Đăng nhập bằng email
- Quản lý profile cá nhân

### 👶 Quản lý trẻ
- Thêm/xóa trẻ
- Lưu thông tin: tên, ngày sinh, giới tính, ảnh

### 📊 Theo dõi hàng ngày
- **🍼 Chế độ ăn**: Sữa, cháo, ăn cơm (số ml, số lần)
- **📏 Tăng trưởng**: Chiều cao, cân nặng, vòng đầu
- **🎯 Mốc phát triển**: Mọc răng, biết bò, biết đi, nói chuyện
- **💉 Tiêm phòng**: Vaccine, liều, phản ứng

### 🤖 AI Features
- **AI Phân tích**: Đánh giá sự phát triển của trẻ dựa trên dữ liệu
- **AI Bác sĩ**: Chat tư vấn về sức khỏe trẻ

### 🎬 Timeslice
- Tạo video kỷ niệm từ ảnh bé (đang phát triển)

## 🛠️ Công nghệ

- **Frontend**: React Native + Expo
- **Backend**: Supabase (PostgreSQL)
- **AI**: Groq API (Llama 3.1)
- **State Management**: Zustand
- **Navigation**: Expo Router
- **Language**: TypeScript

## 🚀 Cách chạy

### Yêu cầu
- Node.js 18+
- npm hoặc yarn

### Cài đặt

```bash
# Clone project
cd bia-project

# Install dependencies
npm install

# Chạy web
npx expo start --web --port 8081
```

### Chạy trên điện thoại

```bash
# Cài đặt Expo Go trên điện thoại
# Scan QR code từ terminal
```

## 📁 Cấu trúc dự án

```
bia-project/
├── app/                    # Màn hình (Expo Router)
│   ├── (tabs)/            # Tab navigation
│   │   ├── index.tsx      # Home
│   │   ├── tracking.tsx   # Tracking
│   │   ├── ai.tsx        # AI Analysis
│   │   ├── chat.tsx      # AI Chat
│   │   ├── timeslice.tsx # Timeslice
│   │   └── profile.tsx   # Profile
│   ├── login.tsx         # Login
│   └── register.tsx      # Register
├── src/
│   ├── components/       # UI Components
│   │   ├── common/       # Button, Input, Card, Avatar
│   │   └── tracking/     # Forms
│   ├── services/         # API services
│   │   ├── supabase.ts   # Supabase client
│   │   ├── auth.ts      # Authentication
│   │   ├── tracking.ts  # Tracking CRUD
│   │   └── ai.ts        # AI service
│   ├── stores/           # Zustand stores
│   │   ├── authStore.ts
│   │   └── childStore.ts
│   ├── constants/        # Config, colors
│   └── types/            # TypeScript types
├── supabase/
│   └── migrations/       # Database migrations
└── TESTING_GUIDE.md     # Hướng dẫn test
```

## 🔑 API Keys

Đã được cấu hình sẵn:
- **Supabase URL**: https://ssfghjfxopmzdrlcgioq.supabase.co
- **Groq API**: llama-3.1-8b-instant

## 📱 Test Accounts

```
Email: demo123@gmail.com
Password: demo123456
```

## 🗄️ Database Schema

### profiles
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | User ID |
| email | TEXT | Email |
| full_name | TEXT | Full name |
| role | TEXT | parent/nurse/clinic |

### children
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Child ID |
| parent_id | UUID | Parent profile ID |
| name | TEXT | Child name |
| birth_date | DATE | Birth date |
| gender | TEXT | male/female |

### tracking_records
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Record ID |
| child_id | UUID | Child ID |
| record_type | TEXT | feeding/growth/milestone/vaccination/sleep |
| record_date | TIMESTAMP | Date |
| data | JSONB | Record data |
| notes | TEXT | Notes |

## ⚠️ Lưu ý

- AI không thay thế chẩn đoán y khoa
- Luôn tham khảo bác sĩ cho các vấn đề sức khỏe
- Dữ liệu được lưu trữ an toàn trên Supabase

## 📄 License

MIT
