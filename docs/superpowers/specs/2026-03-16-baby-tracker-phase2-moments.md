# Baby Tracker Phase 2: Moments (Locket-like Feature)

## Overview

**Project:** Baby Tracker App - Phase 2
**Feature:** Moments - Locket-like moment sharing
**Date:** 2026-03-16
**Status:** Draft

## Goal

Cho phép phụ huynh chia sẻ khoảnh khắc của bé (ảnh + caption) tới gia đình và bạn bè, giống như Locket app.

## User Flow

1. **Tạo Moment:** Chụp/chọn ảnh → thêm caption → gửi
2. **Chia sẻ:** Family (auto) hoặc Friends (chọn)
3. **Xem Feed:** Full-screen photo, real-time, swipe để xem tiếp

## UI/UX

### Home Tab - Moments Feed

```
┌─────────────────────┐
│  [Avatar] 👤 User  │  ← Header với avatar
├─────────────────────┤
│                     │
│   [FULL SCREEN    │  ← Ảnh full màn hình
│     PHOTO]         │    Swipe lên/xuống
│                     │
│   "Caption here"   │  ← Caption
│   👶 Baby Linh    │  ← Tên bé
│   2 phút trước   │  ← Thời gian
│                     │
├─────────────────────┤
│  [←]  [♥]  [→]   │  ← Navigation: prev/like/next
└─────────────────────┘
```

### Add Moment Flow

```
┌─────────────────────┐
│  [X]  Thêm khoảnh  │  ← Header
│      khắc mới      │
├─────────────────────┤
│                     │
│   [Chọn ảnh]      │  ← Preview ảnh
│                     │
├─────────────────────┤
│  Caption:          │
│  [_____________]   │  ← Text input
├─────────────────────┤
│  Gửi tới:         │
│  [x] Gia đình     │  ← Checkbox family
│  [ ] Bạn bè       │  ← Checkbox friends
├─────────────────────┤
│  [GỬI MOMENT]     │  ← Submit button
└─────────────────────┘
```

### Family Management

```
┌─────────────────────┐
│  👨‍👩‍👧‍👦 Gia đình     │  ← Header
├─────────────────────┤
│  [Tạo nhóm mới]   │  ← Button
├─────────────────────┤
│  Nhóm 1: Gia đình │
│  - Mom (admin)     │
│  - Dad (member)    │
│  - Grandma (member)│
├─────────────────────┤
│  [+ Thêm thành viên]│ ← Add member
└─────────────────────┘
```

### Friends Management

```
┌─────────────────────┐
│  👫 Bạn bè         │  ← Header
├─────────────────────┤
│  [Tìm kiếm...]    │  ← Search input
├─────────────────────┤
│  Lời mời kết bạn  │
│  - User A muốn    │  ← Pending requests
│    kết bạn        │
├─────────────────────┤
│  Danh sách bạn    │
│  - User B         │  ← Friends list
│  - User C         │
├─────────────────────┤
│  [+ Gửi lời mời] │  ← Add friend
└─────────────────────┘
```

## Data Model

### Database Tables

```sql
-- Moments: Lưu khoảnh khắc
CREATE TABLE moments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Family Groups: Nhóm gia đình
CREATE TABLE family_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Family Members: Thành viên nhóm
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES family_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Friendships: Kết bạn
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- Moment Shares: Ai được xem moment
CREATE TABLE moment_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  moment_id UUID REFERENCES moments(id) ON DELETE CASCADE,
  shared_with_id UUID, -- user_id hoặc group_id
  shared_type TEXT CHECK (shared_type IN ('friend', 'family')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Storage

```sql
-- Bucket cho ảnh moments
INSERT INTO storage.buckets (id, name, public)
VALUES ('moments', 'moments', true);
```

## Functionality

### 1. Create Moment
- User chọn/chụp ảnh
- Upload lên Supabase Storage
- Thêm caption (optional)
- Chọn child (mặc định child đang chọn)
- Gửi tới: Family (auto) / Friends (chọn)

### 2. Family System
- Tạo nhóm gia đình (name)
- Thêm thành viên qua username
- Thành viên nhận thông báo khi có moment mới
- Auto share tất cả moments tới family

### 3. Friends System
- Tìm user qua username
- Gửi lời mời kết bạn
- Accept/Reject lời mời
- Chia sẻ moment tới friends (chọn lựa)

### 4. Feed (Home Tab)
- Real-time update (Supabase Realtime)
- Full-screen photo với swipe
- Hiển thị: ảnh, caption, tên bé, thời gian

## Technical Implementation

### Frontend Structure

```
app/(tabs)/
├── index.tsx      # Home - Moments Feed (updated)
├── moments.tsx    # Add Moment screen (new)
├── family.tsx     # Family management (new)
└── friends.tsx    # Friends management (new)
```

### Services

```
src/services/
├── moments.ts     # CRUD moments (new)
├── family.ts      # Family operations (new)
└── friends.ts    # Friends operations (new)
```

### Stores

```
src/stores/
├── momentStore.ts # Moments state (new)
└── familyStore.ts # Family state (new)
└── friendStore.ts # Friends state (new)
```

## Constraints & Simplifications

### Phase 2 MVP (Keep Simple)
- ❌ Không push notifications (chỉ in-app)
- ❌ Không reactions/likes
- ❌ Không chat riêng
- ❌ Không video (chỉ ảnh)
- ❌ Không editing/s filters

### Security
- Moment chỉ hiển thị với người được share
- Family chỉ xem được moments của members
- Friends chỉ xem được moments được share

## API Endpoints

### Moments
- `GET /moments` - Feed của user
- `POST /moments` - Tạo moment mới
- `DELETE /moments/:id` - Xóa moment

### Family
- `GET /family_groups` - Danh sách nhóm
- `POST /family_groups` - Tạo nhóm
- `POST /family_members` - Thêm thành viên

### Friends
- `GET /friends` - Danh sách bạn
- `POST /friends` - Gửi lời mời
- `PATCH /friends/:id` - Accept/Reject
- `GET /profiles?username=eq.xxx` - Tìm user

## Success Criteria

1. User có thể tạo moment với ảnh + caption
2. User có thể tạo family group và thêm members
3. User có thể kết bạn và accept/reject
4. Feed hiển thị moments của family + friends
5. Real-time cập nhật khi có moment mới
6. Full-screen photo với swipe navigation

## Timeline Estimate

- **Database Setup:** 30 min
- **UI Components:** 2 hours
- **Moments CRUD:** 1 hour
- **Family System:** 1.5 hours
- **Friends System:** 1.5 hours
- **Real-time Feed:** 1 hour
- **Testing:** 1 hour

**Total:** ~8 hours

---

**Note:** Đây là design document cho Phase 2. Implementation sẽ được thực hiện theo từng task nhỏ.
