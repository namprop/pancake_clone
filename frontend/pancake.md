Kế hoạch xây dựng phần mềm giống Pancake kết nối Facebook


Phiên bản: v2 — Đã rà soát và sửa các điểm không nhất quán so với v1.




1. Mục tiêu phần mềm

Xây dựng một phần mềm quản lý bán hàng đa kênh tương tự Pancake, tập trung trước vào kênh Facebook.

Phần mềm cho phép:


Kết nối với Facebook Page.
Nhận và trả lời tin nhắn Facebook.
Nhận và quản lý bình luận bài viết.
Quản lý khách hàng từ inbox/comment.
Tạo đơn hàng trực tiếp từ hội thoại.
Phân quyền nhân viên.
Quản lý sản phẩm, đơn hàng, trạng thái xử lý.
Theo dõi lịch sử chăm sóc khách hàng.


Mục tiêu ban đầu không phải làm đầy đủ như Pancake ngay, mà xây dựng bản MVP trước để chạy được luồng bán hàng cơ bản.


2. Phạm vi MVP ban đầu

2.1. Kết nối Facebook Page

Chức năng:


Đăng nhập bằng Facebook.
Lấy danh sách Fanpage mà tài khoản có quyền quản lý.
Cho phép người dùng chọn Page muốn kết nối.
Lưu thông tin Page vào database.
Lưu Page Access Token để gọi Facebook Graph API.


Dữ liệu cần lưu (đồng nhất với Section 4.2):

js{
  _id: ObjectId,
  userId: ObjectId,
  pageId: String,
  pageName: String,
  pageAvatar: String,
  pageAccessToken: String,   // nên mã hóa trước khi lưu
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}


⚠️ Lưu ý: Page Access Token dạng Long-lived token có thể hết hạn sau 60 ngày.
Cần lưu thêm tokenExpiresAt: Date và implement luồng refresh token định kỳ.
Tham khảo: Facebook Token Expiration




2.2. Quản lý Inbox Facebook

Chức năng:


Nhận tin nhắn khách hàng gửi đến Page.
Hiển thị danh sách hội thoại.
Hiển thị chi tiết nội dung chat.
Trả lời tin nhắn từ phần mềm.
Gắn tag khách hàng.
Ghi chú khách hàng.
Đánh dấu đã xử lý/chưa xử lý.


Luồng hoạt động:

txtKhách hàng nhắn tin vào Facebook Page
        ↓
Facebook Webhook gửi dữ liệu về server
        ↓
Server lưu message vào MongoDB
        ↓
Frontend nhận realtime qua Socket.IO
        ↓
Nhân viên trả lời từ phần mềm
        ↓
Server gọi Facebook Graph API gửi tin nhắn lại cho khách


2.3. Quản lý Comment Facebook

Chức năng:


Lấy danh sách bài viết của Page.
Lấy comment trong bài viết.
Nhận comment mới qua Webhook.
Trả lời comment.
Ẩn comment chứa số điện thoại nếu cần.
Tạo đơn hàng từ comment.


Dữ liệu comment (đồng nhất với Section 4.5):

js{
  _id: ObjectId,
  pageId: String,
  postId: String,
  commentId: String,
  parentCommentId: String,
  customerFacebookId: String,
  customerName: String,
  message: String,
  isHidden: Boolean,
  replied: Boolean,
  createdAt: Date,
  updatedAt: Date
}


2.4. Quản lý khách hàng

Khách hàng sẽ được tạo tự động từ inbox hoặc comment.

Thông tin khách hàng (đầy đủ, đồng nhất với Section 4.6):

js{
  _id: ObjectId,
  pageId: String,
  facebookUserId: String,
  name: String,
  avatar: String,
  phone: String,
  address: String,
  tags: [String],
  note: String,
  totalOrders: Number,
  totalSpent: Number,
  lastInteractionAt: Date,
  createdAt: Date,
  updatedAt: Date
}

Chức năng:


Xem danh sách khách hàng.
Tìm kiếm theo tên/số điện thoại.
Xem lịch sử chat.
Gắn tag khách hàng.
Ghi chú khách hàng.
Tạo đơn hàng cho khách.



2.5. Quản lý đơn hàng

Đơn hàng có thể được tạo từ inbox hoặc comment.

Thông tin đơn hàng:

js{
  orderCode: String,
  pageId: String,
  customerId: ObjectId,
  source: "facebook_inbox" | "facebook_comment",
  items: [
    {
      productId: ObjectId,
      name: String,
      quantity: Number,
      price: Number
    }
  ],
  totalAmount: Number,
  shippingFee: Number,
  discount: Number,
  finalAmount: Number,
  customerName: String,
  customerPhone: String,
  customerAddress: String,
  status: "pending" | "confirmed" | "shipping" | "completed" | "cancelled",
  note: String,
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}

Trạng thái đơn hàng:

txtpending     : Chờ xử lý
confirmed   : Đã xác nhận
shipping    : Đang giao
completed   : Hoàn thành
cancelled   : Đã hủy


3. Công nghệ sử dụng

3.1. Frontend

txtNext.js
React
Tailwind CSS
Ant Design
Socket.IO Client

Các màn hình chính (App Router):

txtsrc/app/login/page.tsx
src/app/dashboard/page.tsx
src/app/facebook-connect/page.tsx
src/app/inbox/page.tsx
src/app/comments/page.tsx
src/app/customers/page.tsx
src/app/orders/page.tsx
src/app/products/page.tsx
src/app/staffs/page.tsx
src/app/settings/page.tsx


3.2. Backend

Có 2 hướng:

Cách 1: Dùng Next.js API Route

Phù hợp khi làm MVP nhanh.

txtsrc/app/api/auth
src/app/api/facebook
src/app/api/webhook/facebook
src/app/api/conversations
src/app/api/messages
src/app/api/comments
src/app/api/customers
src/app/api/orders
src/app/api/products
src/app/api/staffs

Cách 2: Dùng NestJS

Phù hợp nếu làm hệ thống lớn, dễ bảo trì.

txtmodules/auth
modules/users
modules/facebook
modules/webhook
modules/conversations
modules/messages
modules/comments
modules/customers
modules/orders
modules/products
modules/staffs

Khuyến nghị:

txtMVP nhỏ           : Next.js API Route
Dự án lâu dài     : Next.js + NestJS


3.3. Database

Nên dùng MongoDB.

Các collection chính:

txtusers
pages
conversations
messages
comments
customers
orders
products
staffs
webhook_logs


3.4. Realtime

Dùng Socket.IO để khi có tin nhắn/comment mới thì giao diện cập nhật ngay.

Luồng realtime:

txtWebhook Facebook
        ↓
Server nhận dữ liệu
        ↓
Lưu MongoDB
        ↓
Emit socket event
        ↓
Frontend cập nhật UI

Ví dụ event:

txtmessage:new
comment:new
conversation:update
order:new


4. Cấu trúc database đề xuất

4.1. users


✅ Sửa: Thêm role "manager" cho đồng nhất với Section 10.



js{
  _id: ObjectId,
  fullName: String,
  email: String,
  password: String,            // bcrypt hash, KHÔNG lưu plain text
  role: "admin" | "manager" | "staff",
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}


4.2. pages


✅ Thêm: tokenExpiresAt để quản lý token hết hạn.



js{
  _id: ObjectId,
  userId: ObjectId,
  pageId: String,
  pageName: String,
  pageAvatar: String,
  pageAccessToken: String,     // nên mã hóa (AES-256) trước khi lưu
  tokenExpiresAt: Date,        // THÊM MỚI: theo dõi hết hạn token
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}


4.3. conversations

js{
  _id: ObjectId,
  pageId: String,
  facebookUserId: String,
  customerId: ObjectId,
  customerName: String,
  customerAvatar: String,
  lastMessage: String,
  lastMessageAt: Date,
  unreadCount: Number,
  assignedTo: ObjectId,
  status: "new" | "processing" | "done",
  tags: [String],
  createdAt: Date,
  updatedAt: Date
}


4.4. messages

js{
  _id: ObjectId,
  pageId: String,
  conversationId: ObjectId,
  facebookMessageId: String,
  senderId: String,
  senderName: String,
  text: String,
  attachments: [
    {
      type: String,
      url: String
    }
  ],
  direction: "inbound" | "outbound",
  createdAt: Date,
  updatedAt: Date
}


4.5. comments

js{
  _id: ObjectId,
  pageId: String,
  postId: String,
  commentId: String,
  parentCommentId: String,
  customerFacebookId: String,
  customerName: String,
  message: String,
  isHidden: Boolean,
  replied: Boolean,
  createdAt: Date,
  updatedAt: Date
}


4.6. customers

js{
  _id: ObjectId,
  pageId: String,
  facebookUserId: String,
  name: String,
  avatar: String,
  phone: String,
  address: String,
  tags: [String],
  note: String,
  totalOrders: Number,
  totalSpent: Number,
  lastInteractionAt: Date,
  createdAt: Date,
  updatedAt: Date
}


4.7. products


✅ Thêm: pageId để sản phẩm gắn với Page cụ thể (hỗ trợ multi-page).



js{
  _id: ObjectId,
  pageId: String,              // THÊM MỚI: gắn sản phẩm với Page
  name: String,
  code: String,
  price: Number,
  stock: Number,
  image: String,
  description: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}


4.8. orders

js{
  _id: ObjectId,
  orderCode: String,
  pageId: String,
  customerId: ObjectId,
  source: "facebook_inbox" | "facebook_comment",
  conversationId: ObjectId,
  commentId: String,
  items: [
    {
      productId: ObjectId,
      name: String,
      quantity: Number,
      price: Number,
      total: Number
    }
  ],
  totalAmount: Number,
  shippingFee: Number,
  discount: Number,
  finalAmount: Number,
  customerName: String,
  customerPhone: String,
  customerAddress: String,
  status: "pending" | "confirmed" | "shipping" | "completed" | "cancelled",
  note: String,
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}


4.9. webhook_logs

js{
  _id: ObjectId,
  source: "facebook",
  pageId: String,
  eventType: String,
  payload: Object,
  isProcessed: Boolean,
  errorMessage: String,
  createdAt: Date
}


5. API cần xây dựng

5.1. Auth API

txtPOST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout


5.2. Facebook API

txtGET    /api/facebook/login-url
GET    /api/facebook/callback
GET    /api/facebook/pages
POST   /api/facebook/pages/connect
DELETE /api/facebook/pages/:id


5.3. Facebook Webhook API


✅ Bổ sung chi tiết: Cách implement webhook verify.



txtGET  /api/webhook/facebook   ← Facebook gọi để verify (hub.challenge)
POST /api/webhook/facebook   ← Facebook gửi event thật

Cách verify webhook (GET):

js// GET /api/webhook/facebook
const mode      = req.query["hub.mode"];
const token     = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode === "subscribe" && token === process.env.WEBHOOK_VERIFY_TOKEN) {
  return res.status(200).send(challenge);
}
return res.status(403).end();


5.4. Conversation API

txtGET   /api/conversations
GET   /api/conversations/:id
PATCH /api/conversations/:id


5.5. Message API

txtGET  /api/messages?conversationId=
POST /api/messages/send


5.6. Comment API

txtGET  /api/comments
POST /api/comments/reply
POST /api/comments/hide


5.7. Customer API

txtGET    /api/customers
GET    /api/customers/:id
POST   /api/customers
PATCH  /api/customers/:id
DELETE /api/customers/:id


5.8. Order API

txtGET    /api/orders
GET    /api/orders/:id
POST   /api/orders
PATCH  /api/orders/:id
DELETE /api/orders/:id


5.9. Product API

txtGET    /api/products
GET    /api/products/:id
POST   /api/products
PATCH  /api/products/:id
DELETE /api/products/:id


5.10. Staff API


✅ Thêm mới: Staff API còn thiếu trong v1.



txtGET    /api/staffs
GET    /api/staffs/:id
POST   /api/staffs
PATCH  /api/staffs/:id
DELETE /api/staffs/:id


6. Luồng kết nối Facebook

Bước 1: Tạo Meta App

Vào Meta Developer tạo app.

Cần cấu hình:

txtFacebook Login
Messenger API
Webhooks
Page permissions


Bước 2: Login Facebook

Người dùng bấm nút Kết nối Facebook → redirect sang Facebook OAuth.


Bước 3: Lấy User Access Token

Sau khi Facebook callback về hệ thống, backend lấy code, sau đó đổi sang user_access_token.


Bước 4: Lấy danh sách Page

Gọi Graph API để lấy danh sách Page mà user quản lý.

Dữ liệu cần:

txtpageId
pageName
pageAccessToken


Bước 5: Người dùng chọn Page

Sau khi chọn Page, lưu Page vào database kèm tokenExpiresAt.


Bước 6: Đăng ký Webhook cho Page

Cần subscribe Page vào webhook để nhận:

txtmessages
messaging_postbacks
feed


7. Luồng nhận tin nhắn

txtKhách gửi tin nhắn
        ↓
Facebook gửi webhook về /api/webhook/facebook
        ↓
Backend kiểm tra dữ liệu
        ↓
Tìm page theo pageId
        ↓
Tìm hoặc tạo customer
        ↓
Tìm hoặc tạo conversation
        ↓
Lưu message
        ↓
Emit socket message:new
        ↓
Frontend cập nhật inbox


8. Luồng gửi tin nhắn

txtNhân viên nhập tin nhắn
        ↓
Frontend gọi POST /api/messages/send
        ↓
Backend lấy pageAccessToken
        ↓
Gọi Facebook Graph API gửi tin
        ↓
Lưu message outbound vào database
        ↓
Emit socket message:new

Body API:

js{
  conversationId: "...",
  pageId: "...",
  recipientId: "...",
  text: "Xin chào, shop có thể hỗ trợ gì cho bạn?"
}


9. Giao diện cần thiết kế

9.1. Dashboard

txtTổng tin nhắn hôm nay
Tổng comment hôm nay
Tổng đơn hàng hôm nay
Doanh thu hôm nay
Số khách chưa xử lý


9.2. Inbox

Bố cục 3 cột giống Pancake:

txtBên trái  : Danh sách hội thoại
Ở giữa   : Khung chat
Bên phải : Thông tin khách hàng + đơn hàng

Chi tiết:

txt- Danh sách hội thoại
- Bộ lọc chưa đọc/đã xử lý
- Ô tìm kiếm khách hàng
- Khung chat realtime
- Form tạo đơn nhanh
- Ghi chú khách hàng
- Tag khách hàng


9.3. Comment

txt- Danh sách bài viết
- Danh sách comment
- Trả lời comment
- Ẩn comment
- Tạo đơn từ comment


9.4. Khách hàng

txt- Tên khách
- Số điện thoại
- Facebook ID
- Tổng số đơn
- Tổng tiền đã mua
- Tag
- Ghi chú


9.5. Đơn hàng

txt- Mã đơn
- Khách hàng
- Số điện thoại
- Địa chỉ
- Tổng tiền
- Trạng thái
- Nguồn đơn
- Nhân viên tạo
- Ngày tạo


10. Phân quyền

Role đề xuất (3 role, đồng nhất với schema users):

txtadmin
manager
staff

admin

txt- Quản lý Page
- Quản lý nhân viên
- Xem báo cáo
- Xóa dữ liệu
- Cấu hình hệ thống

manager

txt- Xem toàn bộ hội thoại
- Xem toàn bộ đơn hàng
- Gán hội thoại cho nhân viên
- Xem báo cáo cơ bản

staff

txt- Xem hội thoại được gán
- Trả lời khách
- Tạo đơn hàng
- Cập nhật thông tin khách


11. Bảo mật

txt- Không lưu password dạng plain text.
- Password phải hash bằng bcrypt (salt rounds ≥ 10).
- Page Access Token nên mã hóa AES-256 trước khi lưu DB.
- Webhook phải verify token (xem Section 5.3).
- API phải kiểm tra quyền user bằng JWT middleware.
- Không để lộ token ra frontend.
- Không dùng tài khoản Facebook/password của khách.
- Chỉ dùng OAuth và Graph API chính thức.
- Theo dõi và refresh Page Access Token trước khi hết hạn.


12. Các vấn đề cần chú ý với Facebook

Facebook/Meta có kiểm duyệt quyền khá chặt.

Khi app ở chế độ development:

txtChỉ admin/tester/developer mới dùng được.

Muốn cho khách hàng thật dùng thì cần:

txt- App Review
- Business Verification nếu cần
- Video demo chức năng
- Chính sách quyền riêng tư
- Điều khoản sử dụng

Các quyền có thể cần:

txtpages_show_list
pages_manage_metadata
pages_messaging
pages_read_engagement
pages_manage_engagement


13. Lộ trình phát triển

Giai đoạn 1: Nền tảng

txt- Setup project
- Setup MongoDB
- Làm auth đăng nhập
- Làm layout dashboard
- Làm phân quyền cơ bản (3 role)


Giai đoạn 2: Kết nối Facebook

txt- Tạo Meta App
- Làm Facebook OAuth
- Lấy danh sách Page
- Lưu Page Access Token (mã hóa)
- Setup Webhook + verify token


Giai đoạn 3: Inbox

txt- Nhận tin nhắn từ Webhook
- Lưu message
- Hiển thị danh sách hội thoại
- Hiển thị chi tiết chat
- Gửi tin nhắn trả lời
- Realtime bằng Socket.IO


Giai đoạn 4: Comment

txt- Nhận comment qua webhook
- Hiển thị comment
- Trả lời comment
- Ẩn comment
- Tạo đơn từ comment


Giai đoạn 5: Khách hàng và đơn hàng

txt- Tự động tạo customer
- Tạo đơn hàng từ inbox
- Tạo đơn hàng từ comment
- Quản lý trạng thái đơn
- Tìm kiếm đơn hàng


Giai đoạn 6: Nâng cấp

txt- Phân quyền nâng cao
- Gán hội thoại cho nhân viên
- Báo cáo doanh thu
- Báo cáo hiệu suất nhân viên
- Auto reply
- Chatbot
- Kết nối GHTK/GHN
- Kết nối KiotViet
- Kết nối Instagram


14. Thứ tự code đề xuất

txt1.  Setup project Next.js
2.  Setup MongoDB
3.  Tạo model users (3 role: admin/manager/staff)
4.  Làm đăng nhập JWT
5.  Làm layout dashboard
6.  Tạo model pages (có tokenExpiresAt)
7.  Làm Facebook login
8.  Lấy danh sách Page
9.  Lưu Page token (mã hóa AES-256)
10. Setup webhook verify (GET + POST)
11. Nhận webhook message
12. Lưu conversation/message
13. Làm UI inbox
14. Làm gửi tin nhắn
15. Làm realtime Socket.IO
16. Làm comments
17. Làm customers
18. Làm orders
19. Làm staffs
20. Làm phân quyền
21. Làm báo cáo


15. Cấu trúc thư mục gợi ý với Next.js


✅ Sửa: Thêm staffs/ vào cả app/ và components/.



txtsrc/
  app/
    api/
      auth/
      facebook/
      webhook/
        facebook/
      conversations/
      messages/
      comments/
      customers/
      orders/
      products/
      staffs/              ← THÊM MỚI
    dashboard/
    facebook-connect/
    inbox/
    comments/
    customers/
    orders/
    products/
    staffs/                ← THÊM MỚI
    settings/

  components/
    layout/
    inbox/
    comments/
    customers/
    orders/
    products/
    staffs/                ← THÊM MỚI

  lib/
    mongodb.ts
    facebook.ts
    auth.ts
    socket.ts
    crypto.ts              ← THÊM MỚI: mã hóa/giải mã token

  models/
    User.ts
    Page.ts
    Conversation.ts
    Message.ts
    Comment.ts
    Customer.ts
    Order.ts
    Product.ts
    WebhookLog.ts

  types/
    user.ts
    facebook.ts
    conversation.ts
    message.ts
    customer.ts
    order.ts
    product.ts

  utils/
    formatDate.ts
    generateOrderCode.ts


16. Tóm tắt các điểm sửa so với v1

#Vị tríVấn đềĐã sửa1Section 2.1Schema pages thiếu _id✅ Đồng nhất với Section 4.22Section 2.4Schema customers thiếu totalOrders, totalSpent, lastInteractionAt✅ Đồng nhất với Section 4.63Section 4.1users.role chỉ có 2 giá trị, thiếu "manager"✅ Thêm "manager"4Section 4.7products thiếu pageId✅ Thêm pageId5Section 4.2Không theo dõi token hết hạn✅ Thêm tokenExpiresAt6Section 5Thiếu Staff API✅ Thêm Section 5.107Section 5.3Webhook verify không có code mẫu✅ Thêm code implement8Section 15Thiếu thư mục staffs/ và crypto.ts✅ Bổ sung


17. Kết luận

Phần mềm giống Pancake có thể xây dựng được, nhưng không nên làm tất cả chức năng ngay từ đầu.

Bắt đầu từ bản MVP:

txtKết nối Facebook Page
Nhận inbox
Trả lời inbox
Nhận comment
Trả lời comment
Tạo khách hàng
Tạo đơn hàng

Sau khi MVP chạy ổn thì mở rộng:

txtPhân quyền nâng cao
Báo cáo
Tự động trả lời
Chatbot
Vận chuyển
KiotViet
Instagram

Ưu tiên quan trọng nhất là làm chuẩn luồng Facebook OAuth, Page Access Token và Webhook, vì đây là phần lõi của toàn bộ hệ thống.