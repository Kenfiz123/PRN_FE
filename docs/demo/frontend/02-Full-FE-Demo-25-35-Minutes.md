# Full Frontend Demo Guide (25-35 Minutes)

**Phiên bản**: 1.0.0  
**Thời lượng**: 25-35 phút  
**Đối tượng**: Tất cả actors và features

---

## Phần 0: Chuẩn Bị (2 phút)

### 0.1 Mở Browser Profiles

| Window | Browser/Profile | Actor | Status |
|--------|----------------|-------|--------|
| Window A | Chrome Profile 1 | CLUB_MANAGER | Login |
| Window B | Edge hoặc Chrome Incognito | ADMIN | Login |

### 0.2 Đăng Nhập Actors

**Window A - CLUB_MANAGER:**
1. Mở trình duyệt Chrome Profile 1
2. Truy cập http://localhost:5173
3. Đăng nhập với tài khoản CLUB_MANAGER
4. Xác nhận: Dashboard hiển thị với menu Clubs, Reports, Activities

**Window B - ADMIN:**
1. Mở trình duyệt Edge
2. Truy cập http://localhost:5173
3. Đăng nhập với tài khoản ADMIN
4. Xác nhận: Dashboard hiển thị với tất cả menu bao gồm Users và Finance

---

## Phần 1: CLUBMANAGER WORKFLOW (8-10 phút)

### Bước 1 — Đăng Nhập và Xem Dashboard

**Window A - CLUB_MANAGER**

**Tôi thao tác:**
1. Xem Dashboard
2. Ghi nhận các thống kê: Số CLB, Báo cáo, Hoạt động, Thông báo

**Tôi nói:**
"Đây là Dashboard của Club Manager. Hệ thống hiển thị tổng quan về các CLB được quản lý, báo cáo đang xử lý, và các hoạt động sắp tới."

**Giảng viên nhìn thấy:**
- Card thống kê: CLB có quyền, Báo cáo hiển thị, Hoạt động, Thông báo chưa đọc
- Danh sách hoạt động sắp tới
- Danh sách thông báo mới

---

### Bước 2 — Tạo Hoạt Động Mới

**Window A - CLUB_MANAGER**

**Tôi thao tác:**
1. Bấm menu "Activities"
2. Bấm nút "Tạo hoạt động" (màu gradient cyan-purple)
3. Chọn CLB từ dropdown
4. Nhập:
   - Tiêu đề: "Workshop PRN232 Demo 0721"
   - Mô tả: "Workshop demo cho đồ án frontend"
   - Bắt đầu: Chọn ngày giờ tương lai
   - Kết thúc: Chọn ngày giờ sau bắt đầu
   - Địa điểm: "Hội trường A"
5. Bấm "Tạo hoạt động"

**Tôi nói:**
"Tôi tạo một hoạt động mới cho CLB. Club Manager có quyền tạo và quản lý hoạt động của CLB mình."

**Giảng viên nhìn thấy:**
- Loading spinner khi submit
- Success toast: "Đã tạo hoạt động."
- Activity mới xuất hiện trong danh sách với status "SCHEDULED"

**Kết quả thành công khi:**
- Toast success hiển thị
- Activity card mới trong grid
- Status badge hiển thị "SCHEDULED"

---

### Bước 3 — Tạo Báo Cáo Bản Nháp

**Window A - CLUB_MANAGER**

**Tôi thao tác:**
1. Bấm menu "Reports"
2. Bấm nút "Tạo báo cáo"
3. Chọn CLB từ dropdown
4. Nhập:
   - Kỳ báo cáo: "2026-Q3"
   - Hạn nộp: Chọn ngày tương lai
   - Loại báo cáo: "ACTIVITY"
   - Nhãn: "Quarterly"
5. Trong phần Chi tiết hoạt động:
   - Tên hoạt động: "Workshop PRN232 Demo 0721"
   - Ngày hoạt động: Chọn ngày đã tạo
   - Mô tả: "Workshop demo frontend với React"
   - Số người tham gia: 25
   - Kết quả: "Thành công"
6. Bấm "Tạo bản nháp"

**Tôi nói:**
"Bây giờ tôi tạo bản nháp báo cáo quý cho CLB. Báo cáo được tạo ở trạng thái DRAFT để Club Manager có thể chỉnh sửa trước khi gửi."

**Giảng viên nhìn thấy:**
- Success toast: "Đã tạo bản nháp báo cáo."
- Modal đóng lại
- Table cập nhật với row mới
- Status badge: "Bản nháp" (màu amber)

**Kết quả thành công khi:**
- Toast success hiển thị
- Row mới trong table với status "Bản nháp"
- Stat card "Bản nháp" tăng lên

---

### Bước 4 — Gửi Báo Cáo

**Window A - CLUB_MANAGER**

**Tôi thao tác:**
1. Trong table Reports, tìm báo cáo vừa tạo
2. Bấm nút "Gửi duyệt" (màu cyan)
3. Xác nhận toast success

**Tôi nói:**
"Sau khi hoàn tất bản nháp, Club Manager bấm 'Gửi duyệt'. Báo cáo chuyển từ DRAFT sang trạng thái SUBMITTED và chờ được xem xét."

**Giảng viên nhìn thấy:**
- Success toast: "Đã gửi báo cáo để xét duyệt."
- Status badge thay đổi: "Đã gửi" (màu cyan)
- Nút "Gửi duyệt" biến mất

**Kết quả thành công khi:**
- Status chuyển từ "Bản nháp" sang "Đã gửi"
- Không còn nút "Gửi duyệt" cho row này

---

### Bước 5 — Chuyển Tiếp Báo Cáo

**Window A - CLUB_MANAGER**

**Tôi thao tác:**
1. Trong table Reports, tìm báo cáo đã gửi
2. Bấm nút "Chuyển duyệt" (màu purple)
3. Modal mở ra
4. Nhập ghi chú: "Báo cáo đã hoàn thành các thủ tục nội bộ"
5. Bấm "Xác nhận"

**Tôi nói:**
"Club Manager của cùng CLB có thể chuyển báo cáo lên xét duyệt cuối. Điều này đảm bảo có ít nhất một người xem xét trước khi Admin phê duyệt."

**Giảng viên nhìn thấy:**
- Success toast: "Đã chuyển báo cáo lên phê duyệt cuối."
- Status badge thay đổi: "Đang xét duyệt" (màu purple)
- Nút "Chuyển duyệt" biến mất

**Kết quả thành công khi:**
- Status chuyển từ "Đã gửi" sang "Đang xét duyệt"

---

## Phần 2: ADMIN WORKFLOW (8-10 phút)

### Bước 6 — Xem và Phê Duyệt Báo Cáo

**Window B - ADMIN**

**Tôi thao tác:**
1. Bấm menu "Reports"
2. Tìm báo cáo có status "Đang xét duyệt"
3. Bấm nút "Phê duyệt" (màu green)
4. Modal mở ra
5. Nhập feedback: "Báo cáo đạt yêu cầu, phê duyệt."
6. Bấm "Xác nhận"

**Tôi nói:**
"Admin nhận được báo cáo ở trạng thái 'Đang xét duyệt'. Sau khi xem xét nội dung, Admin có thể Phê duyệt hoặc Từ chối báo cáo."

**Giảng viên nhìn thấy:**
- Success toast: "Đã phê duyệt báo cáo."
- Status badge thay đổi: "Đã duyệt" (màu green)
- Feedback được lưu

**Kết quả thành công khi:**
- Status chuyển sang "Đã duyệt"
- Bấm "Xem" → Chi tiết hiển thị feedback

---

### Bước 7 — Tạo Đề Xuất Ngân Sách (TREASURER)

**Window A - TREASURER**
*(Nếu có tài khoản TREASURER riêng, hoặc dùng lại Window A sau khi logout)*

**Tôi thao tác:**
1. Bấm menu "Finance"
2. Bấm nút "Tạo đề xuất"
3. Chọn CLB có quyền thủ quỹ
4. Nhập:
   - Tiêu đề: "Đề xuất ngân sách Workshop Q3"
   - Mô tả: "Ngân sách cho workshop PRN232 Demo"
   - Số tiền đề xuất: 5000000
5. Bấm "Gửi đề xuất"

**Tôi nói:**
"Treasurer tạo đề xuất ngân sách cho các hoạt động của CLB. Đề xuất sẽ được Admin xem xét và phê duyệt."

**Giảng viên nhìn thấy:**
- Success toast: "Đã gửi đề xuất ngân sách."
- Card mới trong danh sách với status "Đang chờ"

**Kết quả thành công khi:**
- Proposal card xuất hiện
- Status: "Đang chờ" (amber)

---

### Bước 8 — Admin Phê Duyệt Ngân Sách

**Window B - ADMIN**

**Tôi thao tác:**
1. Bấm menu "Finance"
2. Tìm đề xuất "Đề xuất ngân sách Workshop Q3"
3. Bấm nút "Phê duyệt"
4. Modal mở ra
5. Số tiền phê duyệt: 4500000 (giảm 10%)
6. Ghi chú: "Phê duyệt với điều chỉnh ngân sách phù hợp"
7. Bấm "Xác nhận"

**Tôi nói:**
"Admin xem xét đề xuất ngân sách. Ở đây Admin có thể phê duyệt toàn bộ hoặc điều chỉnh số tiền trước khi phê duyệt."

**Giảng viên nhìn thấy:**
- Success toast: "Đã phê duyệt ngân sách."
- Status thay đổi: "Đã duyệt" (green)
- Số tiền được duyệt: 4,500,000 VND

**Kết quả thành công khi:**
- Status chuyển sang "Đã duyệt"
- Approved amount hiển thị 4,500,000 VND

---

### Bước 9 — Gửi Quyết Toán

**Window A - TREASURER**

**Tôi thao tác:**
1. Bấm menu "Finance"
2. Tìm đề xuất đã được duyệt
3. Bấm nút "Gửi quyết toán"
4. Nhập:
   - Tổng chi thực tế: 4200000
   - URL chứng từ: https://example.com/receipt.jpg
5. Bấm "Gửi quyết toán"

**Tôi nói:**
"Sau khi hoàn thành hoạt động, Treasurer gửi quyết toán kèm chứng từ. Quyết toán sẽ được Admin xác nhận."

**Giảng viên nhìn thấy:**
- Success toast: "Đã gửi quyết toán."
- Settlement row xuất hiện dưới proposal

**Kết quả thành công khi:**
- Settlement card xuất hiện
- Status: "Đã gửi"

---

### Bước 10 — Admin Duyệt Quyết Toán

**Window B - ADMIN**

**Tôi thao tác:**
1. Tìm proposal đã có settlement
2. Bấm nút "Duyệt quyết toán"
3. Success toast: "Đã duyệt quyết toán."

**Tôi nói:**
"Admin xác nhận quyết toán, hoàn tất chu trình tài chính từ đề xuất đến quyết toán."

---

## Phần 3: CLUPMEMBER WORKFLOW (5 phút)

### Bước 11 — Duyệt Thành Viên (CLUB_MANAGER)

**Window A - CLUB_MANAGER**

**Tôi thao tác:**
1. Bấm menu "Clubs"
2. Cuộn xuống tìm section "Đơn chờ chủ CLB xét duyệt"
3. Bấm "Đồng ý" cho một đơn nào đó
4. Nhập ghi chú: "Chào mừng thành viên mới"
5. Bấm "Xác nhận đồng ý"

**Tôi nói:**
"Club Manager duyệt đơn tham gia CLB. Sau khi duyệt, người dùng sẽ có quyền thành viên và có thể tham gia các hoạt động."

**Giảng viên nhìn thấy:**
- Success toast: "Đã duyệt [tên] vào [CLB]."
- Đơn biến mất khỏi danh sách chờ

**Kết quả thành công khi:**
- Đơn không còn trong danh sách pending
- Toast success hiển thị

---

### Bước 12 — Đăng Ký Tham Gia Hoạt Động

**Window A - CLUB_MEMBER**
*(Nếu có tài khoản riêng)*

**Tôi thao tác:**
1. Bấm menu "Activities"
2. Tìm hoạt động đã tạo
3. Bấm nút "Tham gia"
4. Success toast: "Đã đăng ký tham gia hoạt động."
5. Nút thay đổi thành "Đã đăng ký"

**Tôi nói:**
"Thành viên đã được duyệt có thể đăng ký tham gia các hoạt động của CLB."

---

## Phần 4: USER MANAGEMENT (5 phút)

### Bước 13 — Quản Lý Người Dùng (SYSTEM_ADMIN hoặc ADMIN)

**Window B - ADMIN**

**Tôi thao tác:**
1. Bấm menu "Users"
2. Bấm nút "Tạo tài khoản"
3. Nhập:
   - Username: "demo0721"
   - Họ và tên: "Demo User 0721"
   - Email: "demo0721@club.edu"
   - Mật khẩu: "Demo123456"
   - Vai trò: "CLUB_MEMBER"
4. Bấm "Tạo"

**Tôi nói:**
"Admin có thể tạo tài khoản mới và gán vai trò. Hệ thống hỗ trợ 6 vai trò: Admin, System Admin, Student Affairs Admin, Club Manager, Treasurer, và Club Member."

**Giảng viên nhìn thấy:**
- Success toast: "Đã tạo tài khoản."
- User mới xuất hiện trong table

---

### Bước 14 — Khóa/Mở Khóa Tài Khoản

**Window B - ADMIN**

**Tôi thao tác:**
1. Trong table Users, tìm một user
2. Bấm nút "Khóa" (màu rose)
3. Confirm với success toast
4. Bấm nút "Mở khóa" để khôi phục

**Tôi nói:**
"Admin có thể khóa/mở khóa tài khoản. Tài khoản bị khóa sẽ không thể đăng nhập."

**Giảng viên nhìn thấy:**
- Status thay đổi: "Đã khóa" / "Hoạt động"
- Nút thay đổi: "Mở khóa" / "Khóa"

---

## Phần 5: NOTIFICATIONS (2 phút)

### Bước 15 — Kiểm Tra Thông Báo

**Lưu ý quan trọng:**
> Notification KHÔNG phải real-time. Cần refresh trang hoặc chuyển sang trang Notifications để thấy thông báo mới.

**Window B - ADMIN**

**Tôi thao tác:**
1. Bấm menu "Notifications"
2. Xem danh sách thông báo
3. Bấm "Đánh dấu tất cả đã đọc"

**Tôi nói:**
"Thông báo cập nhật khi người dùng chuyển sang trang Notifications hoặc refresh trang. Đây không phải real-time notification."

**Giảng viên nhìn thấy:**
- Danh sách thông báo với các filter: Tất cả, Chưa đọc, Đã đọc
- Badge số thông báo chưa đọc
- Nút "Đánh dấu tất cả đã đọc"

---

## Phần 6: PROFILE (2 phút)

### Bước 16 — Xem Hồ Sơ

**SYSTEM_ADMIN Profile:**
- Có giao diện đặc biệt với video background và hiệu ứng tilt
- Có thể chỉnh sửa thông tin cá nhân

**Các Role Khác:**
- Xem hồ sơ với thông tin: Họ tên, Email, Vai trò, CLB đã được phê duyệt
- Không thể chỉnh sửa vai trò (được cấp bởi hệ thống)

**Window A - CLUB_MANAGER**

**Tôi thao tác:**
1. Bấm menu "Profile"
2. Xem thông tin: Tên, Email, Vai trò
3. Xem danh sách CLB đã được phê duyệt

**Tôi nói:**
"Profile hiển thị thông tin tài khoản và các CLB đã được phê duyệt. Vai trò và quyền CLB được cấp bởi quy trình xét duyệt, không thể tự thay đổi."

---

## Tổng Kết (1 phút)

### Bước 17 — Tổng Kết Demo

**Tôi nói:**
"Tổng kết các chức năng đã demo:
1. Authentication với role-based access control
2. Club Management với membership workflow
3. Report Lifecycle: Create → Submit → Forward → Approve/Reject
4. Finance Lifecycle: Budget Proposal → Approval → Settlement → Settlement Approval
5. Activity Management: Create → Register → Complete
6. User Administration: Create, Edit, Lock/Unlock
7. Notification với manual refresh

Toàn bộ tính năng sử dụng API thực tế, không có mock data."

---

## Success Criteria Tổng Hợp

| Feature | Success Evidence |
|---------|------------------|
| Login | Redirect to Dashboard, user info in sidebar |
| Create Activity | Toast success, activity card appears |
| Create Report | Toast success, draft row in table |
| Submit Report | Status changes to "Đã gửi" |
| Forward Report | Status changes to "Đang xét duyệt" |
| Approve Report | Status changes to "Đã duyệt", feedback saved |
| Create Budget | Toast success, proposal card appears |
| Approve Budget | Status changes, approved amount displayed |
| Submit Settlement | Settlement row appears |
| Approve Settlement | Settlement status changes |
| Review Membership | Toast success, pending list updates |
| Register Activity | Button changes to "Đã đăng ký" |
| Create User | Toast success, user in table |
| Lock/Unlock | Status changes, button toggles |
| Notifications | List loads, mark as read works |
| Profile | Info displays correctly |

---

## Next Steps

➡️ Continue to [03-Defense-FE-Demo-15-20-Minutes.md](03-Defense-FE-Demo-15-20-Minutes.md)  
➡️ Continue to [05-Multi-Account-Setup.md](05-Multi-Account-Setup.md)

---

**Document Version**: 1.0  
**Last Updated**: 2026-07-21  
**Author**: Claude (Senior Frontend QA Engineer)
