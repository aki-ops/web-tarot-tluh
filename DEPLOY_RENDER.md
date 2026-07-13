# 🚀 HƯỚNG DẪN TRIỂN KHAI LÊN RENDER.COM

Dự án Tarot của bạn được phát triển bằng **Node.js (NestJS & Next.js)**, do đó Render sẽ tự động đọc tệp `package.json` trong các thư mục tương ứng để cài đặt thư viện và build dự án (không sử dụng tệp `requirements.txt` của Python).

> [!WARNING]
> Nếu bạn tạo tệp `requirements.txt` ở thư mục gốc, công cụ tự động nhận diện của Render sẽ bị nhầm lẫn dự án thành ngôn ngữ Python và sẽ gây lỗi biên dịch (build failed).

Chúng tôi đã cấu hình sẵn tệp **`render.yaml`** ở thư mục gốc để Render tự động thiết lập 2 dịch vụ: Backend (NestJS) và Frontend (Next.js) cho bạn.

---

## 🛠️ Các bước triển khai lên Render:

### Bước 1: Chuẩn bị trên GitHub
1. Commit và Push các thay đổi mới nhất (đã thực hiện xong).
2. Hãy đảm bảo dự án ở trạng thái Public hoặc Private nhưng tài khoản Render của bạn được cấp quyền đọc.

### Bước 2: Import Blueprint trên Render.com
1. Đăng nhập vào [Render.com](https://render.com/).
2. Nhấn vào nút **New +** ở góc phải màn hình -> Chọn **Blueprint**.
3. Kết nối với tài khoản GitHub của bạn và chọn Repository `web-tarot-tluh`.
4. Render sẽ tự động đọc cấu hình từ tệp `render.yaml` và liệt kê 2 dịch vụ:
   - **`web-tarot-backend`** (Web Service - NestJS)
   - **`web-tarot-frontend`** (Web Service - Next.js)

### Bước 3: Cấu hình biến môi trường trên Render
Trước khi nhấn deploy, hãy cập nhật các giá trị biến môi trường trong giao diện Render:
1. **JWT_SECRET**: Thay thế bằng một chuỗi ký tự bí mật dài ngẫu nhiên để bảo mật Token đăng nhập.
2. **DATABASE_URL**: Để mặc định là `file:./prisma/dev.db`.
3. Sau khi backend deploy thành công, hãy copy **URL Backend thực tế** (ví dụ: `https://web-tarot-backend-xxxx.onrender.com`) và điền vào biến **`NEXT_PUBLIC_API_URL`** của Frontend (nhớ thêm `/api/v1` vào cuối URL).

---

## ⚠️ Lưu ý đặc biệt về cơ sở dữ liệu SQLite:
Dịch vụ miễn phí (Free Tier) của Render có cơ chế ổ đĩa tạm thời (Ephemeral Disk). Mỗi khi server restart (ít nhất 1 lần/ngày hoặc khi redeploy), dữ liệu trong tệp `dev.db` (các tài khoản đăng ký, phòng thoại và nhật ký) sẽ bị **mất sạch**.

**Cách khắc phục:**
- Khi deploy Backend, trên Render hãy tạo thêm một **Persistent Disk** (ổ đĩa lưu trữ vĩnh viễn, tốn khoảng $1/tháng trên Render).
- Thiết lập đường dẫn lưu trữ đĩa ở `/var/data`.
- Thay đổi biến môi trường `DATABASE_URL` thành: `file:/var/data/dev.db`.
- Cách này đảm bảo dữ liệu đăng ký của người dùng được lưu trữ vĩnh viễn!
