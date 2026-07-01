import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Page } from "@/models/Page";
import { getAuthUser } from "@/lib/auth";
import { User } from "@/models/User";
import { encryptToken } from "@/lib/crypto";
import bcrypt from "bcryptjs";

function renderHelperPage(appId: string, redirectUri: string, error?: string) {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cấu hình Kết nối Facebook</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #1877f2;
      --primary-hover: #166fe5;
      --bg: #f0f9ff;
      --card-bg: #ffffff;
      --text: #1e293b;
      --text-muted: #64748b;
      --error-bg: #fff1f2;
      --error-border: #fecdd3;
      --error-text: #e11d48;
    }
    body {
      font-family: 'Outfit', sans-serif;
      background: linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%);
      color: var(--text);
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
      box-sizing: border-box;
    }
    .card {
      background-color: var(--card-bg);
      border-radius: 24px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      padding: 40px;
      width: 100%;
      max-width: 550px;
      text-align: center;
      border: 1px solid #e0f2fe;
      animation: slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes slideIn {
      from { transform: translateY(30px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .logo {
      width: 64px;
      height: 64px;
      background: linear-gradient(135deg, #0284c7 0%, #1e40af 100%);
      border-radius: 18px;
      display: flex;
      justify-content: center;
      align-items: center;
      color: white;
      font-weight: 800;
      font-size: 32px;
      margin: 0 auto 24px;
      box-shadow: 0 10px 15px -3px rgba(30, 64, 175, 0.3);
    }
    h1 {
      font-size: 24px;
      font-weight: 800;
      margin: 0 0 12px;
      background: linear-gradient(to right, #0f172a, #334155);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    p {
      font-size: 15px;
      color: var(--text-muted);
      line-height: 1.6;
      margin: 0 0 24px;
    }
    .error-box {
      background-color: var(--error-bg);
      border: 1px solid var(--error-border);
      color: var(--error-text);
      border-radius: 16px;
      padding: 16px;
      font-size: 14px;
      margin-bottom: 24px;
      text-align: left;
    }
    .steps {
      text-align: left;
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 30px;
    }
    .steps h3 {
      margin: 0 0 12px;
      font-size: 15px;
      font-weight: 600;
      color: #0f172a;
    }
    .steps ol {
      margin: 0;
      padding-left: 20px;
      font-size: 14px;
      color: #475569;
    }
    .steps li {
      margin-bottom: 8px;
    }
    .code {
      font-family: monospace;
      background-color: #f1f5f9;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 13px;
      color: #0f172a;
      border: 1px solid #e2e8f0;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 48px;
      border-radius: 14px;
      font-size: 15px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
      text-decoration: none;
      box-sizing: border-box;
    }
    .btn-primary {
      background-color: var(--primary);
      color: white;
      box-shadow: 0 4px 6px -1px rgba(24, 119, 242, 0.2);
      margin-bottom: 12px;
    }
    .btn-primary:hover {
      background-color: var(--primary-hover);
      transform: translateY(-1px);
      box-shadow: 0 10px 15px -3px rgba(24, 119, 242, 0.3);
    }
    .btn-secondary {
      background-color: #f1f5f9;
      color: #475569;
      border: 1px solid #e2e8f0;
    }
    .btn-secondary:hover {
      background-color: #e2e8f0;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">P</div>
    <h1>Kết nối Fanpage của bạn</h1>
    <p>Bạn đã xác thực tài khoản Facebook thành công! Để lưu cấu hình và kết nối Fanpage thực tế, vui lòng thiết lập <strong>App Secret</strong>.</p>
    
    ${error ? `<div class="error-box"><strong>Chi tiết lỗi:</strong><br>${error}</div>` : ''}
    
    <div class="steps">
      <h3>Hướng dẫn kích hoạt Fanpage thật:</h3>
      <ol>
        <li>Mở file <span class="code">.env.local</span> tại thư mục gốc.</li>
        <li>Điền mã bảo mật ứng dụng vào <span class="code">FACEBOOK_APP_SECRET="..."</span>.</li>
        <li>Khởi động lại server (<span class="code">npm run dev</span>).</li>
      </ol>
    </div>
    
    <a href="/api/facebook/callback?mock=true" class="btn btn-primary">
      ✨ Tiếp tục bằng Fanpage giả lập (Demo)
    </a>
    <div style="height: 8px;"></div>
    <a href="/facebook-connect" class="btn btn-secondary">
      Quay lại trang kết nối
    </a>
  </div>
</body>
</html>`;
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const mock = url.searchParams.get("mock") === "true" || code === "mock";
    
    await connectDB();
    
    // Get current user or fallback to first active user in DB
    const auth = await getAuthUser();
    let userDoc = auth ? await User.findById(auth.userId) : null;
    if (!userDoc || !userDoc.isActive) {
      userDoc = await User.findOne({ isActive: true });
    }
    
    // Resilient fallback: if no active user found, find any user
    if (!userDoc) {
      userDoc = await User.findOne();
    }
    
    // Resilient fallback: if still no user in DB, auto-create the guest/demo admin user
    if (!userDoc) {
      try {
        const hashedPassword = await bcrypt.hash("admin123", 10);
        userDoc = await User.create({
          _id: "65a123456789012345678901",
          fullName: "Khách ẩn danh",
          email: "guest@pancake.vn",
          password: hashedPassword,
          role: "admin",
          isActive: true
        });
        console.log("Auto-created default admin user in DB:", userDoc._id);
      } catch (err) {
        console.error("Failed to auto-create default admin user:", err);
      }
    }
    
    if (!userDoc) {
      return NextResponse.json({ error: "Không tìm thấy người dùng hoạt động trong hệ thống." }, { status: 400 });
    }
    
    // Check for simulated/mock connect parameter
    if (mock) {
      const mockPageId = "1708753803778608";
      const mockPageName = "Bella Boutique (Thời Trang)";
      const mockPageAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb";
      
      await Page.findOneAndUpdate(
        { pageId: mockPageId },
        {
          userId: userDoc._id,
          pageName: mockPageName,
          pageAvatar: mockPageAvatar,
          pageAccessToken: encryptToken("mock-access-token-bella-boutique"),
          tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 ngày
          isActive: true,
        },
        { upsert: true, new: true }
      );
      
      return NextResponse.redirect(new URL("/facebook-connect?success=true", req.url));
    }
    
    if (!code) {
      return NextResponse.json({ error: "Không tìm thấy mã code xác thực từ Facebook." }, { status: 400 });
    }
    
    const appId = process.env.FACEBOOK_APP_ID || "1708753803778608";
    const appSecret = process.env.FACEBOOK_APP_SECRET;
    const redirectUri = process.env.FACEBOOK_REDIRECT_URI || "http://localhost:3012/api/facebook/callback";
    
    // If client secret is missing, show helper page with manual/mock connect button
    if (!appSecret) {
      return new Response(
        renderHelperPage(appId, redirectUri),
        {
          headers: {
            "Content-Type": "text/html; charset=utf-8",
          },
        }
      );
    }
    
    // 1. Exchange code for User Access Token
    const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${appSecret}&code=${code}`;
    
    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();
    
    if (tokenData.error) {
      console.error("Facebook Token Exchange Error:", tokenData.error);
      return new Response(
        renderHelperPage(appId, redirectUri, tokenData.error.message),
        {
          headers: {
            "Content-Type": "text/html; charset=utf-8",
          },
        }
      );
    }
    
    const userAccessToken = tokenData.access_token;
    
    // 2. Exchange short-lived User Access Token for long-lived one
    const longLivedUrl = `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${userAccessToken}`;
    
    const longLivedRes = await fetch(longLivedUrl);
    const longLivedData = await longLivedRes.json();
    
    const finalUserToken = longLivedData.access_token || userAccessToken;
    const expiresSec = longLivedData.expires_in || 5184000; // default 60 days
    const tokenExpiresAt = new Date(Date.now() + expiresSec * 1000);
    
    // 3. Get connected Facebook Pages
    const pagesUrl = `https://graph.facebook.com/v19.0/me/accounts?access_token=${finalUserToken}`;
    const pagesRes = await fetch(pagesUrl);
    const pagesData = await pagesRes.json();
    
    if (pagesData.error) {
      console.error("Facebook Get Pages Error:", pagesData.error);
      return new Response(
        renderHelperPage(appId, redirectUri, pagesData.error.message),
        {
          headers: {
            "Content-Type": "text/html; charset=utf-8",
          },
        }
      );
    }
    
    const facebookPages = pagesData.data || [];
    
    if (facebookPages.length === 0) {
      return new Response(
        renderHelperPage(appId, redirectUri, "Tài khoản Facebook của bạn chưa sở hữu hoặc quản lý Fanpage nào."),
        {
          headers: {
            "Content-Type": "text/html; charset=utf-8",
          },
        }
      );
    }
    
    // 4. Save/update pages in MongoDB
    for (const fbPage of facebookPages) {
      const pageId = fbPage.id;
      const pageName = fbPage.name;
      const pageAccessToken = fbPage.access_token;
      const pageAvatar = `https://graph.facebook.com/v19.0/${pageId}/picture?type=square`;
      const encryptedAccessToken = encryptToken(pageAccessToken);
      
      await Page.findOneAndUpdate(
        { pageId },
        {
          userId: userDoc._id,
          pageName,
          pageAvatar,
          pageAccessToken: encryptedAccessToken,
          tokenExpiresAt,
          isActive: true,
        },
        { upsert: true, new: true }
      );
    }
    
    return NextResponse.redirect(new URL("/facebook-connect?success=true", req.url));
  } catch (error: any) {
    console.error("OAuth callback error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống: " + error.message }, { status: 500 });
  }
}
