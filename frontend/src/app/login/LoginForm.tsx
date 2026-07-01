"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

// ── Validation helpers (client-side mirror của server) ─────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FieldErrors {
  fullName?: string;
  email?: string;
  password?: string;
}

function validateClient(
  mode: "login" | "register",
  fullName: string,
  email: string,
  password: string
): FieldErrors {
  const errs: FieldErrors = {};

  if (mode === "register") {
    if (!fullName.trim()) errs.fullName = "Họ tên không được để trống.";
    else if (fullName.trim().length < 2) errs.fullName = "Họ tên phải có ít nhất 2 ký tự.";
    else if (fullName.trim().length > 100) errs.fullName = "Họ tên không được vượt quá 100 ký tự.";
  }

  if (!email.trim()) errs.email = "Email không được để trống.";
  else if (!EMAIL_REGEX.test(email.trim())) errs.email = "Địa chỉ email không hợp lệ.";

  if (!password) errs.password = "Mật khẩu không được để trống.";
  else if (password.length < 6) errs.password = "Mật khẩu phải có ít nhất 6 ký tự.";

  return errs;
}

// ── Component ──────────────────────────────────────────────────────────────
export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/inbox";

  const [mode, setMode] = useState<"login" | "register">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleFacebookLogin = () => {
    const appId = process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID || "1708753803778608";
    const redirectUri = "http://localhost:3012/api/facebook/callback"; 
    const scopes = "pages_show_list,pages_messaging,pages_read_engagement,pages_manage_engagement";
    const facebookAuthUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scopes}`;
    window.location.href = facebookAuthUrl;
  };

  // Lỗi từng field (client-side realtime)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  // Lỗi tổng từ server
  const [serverError, setServerError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  // Đã bấm submit lần nào chưa (để hiện lỗi realtime)
  const [submitted, setSubmitted] = useState(false);

  // ── Validate realtime sau lần submit đầu tiên
  const runValidation = (
    _mode = mode,
    _fullName = fullName,
    _email = email,
    _password = password
  ) => {
    if (!submitted) return {};
    const errs = validateClient(_mode, _fullName, _email, _password);
    setFieldErrors(errs);
    return errs;
  };

  // ── Khi switch tab
  const switchMode = (m: "login" | "register") => {
    setMode(m);
    setFieldErrors({});
    setServerError("");
    setSuccessMsg("");
    setSubmitted(false);
  };

  // ── Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setServerError("");
    setSuccessMsg("");

    // Client-side validate trước
    const errs = validateClient(mode, fullName, email, password);
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body =
        mode === "login"
          ? { email: email.trim(), password }
          : { fullName: fullName.trim(), email: email.trim(), password, role: "admin" };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error ?? "Có lỗi xảy ra, vui lòng thử lại.");
        return;
      }

      setSuccessMsg(data.message ?? "Thành công!");
      setTimeout(() => {
        router.push(redirect);
        router.refresh();
      }, 600);
    } catch {
      setServerError("Không thể kết nối đến server. Vui lòng kiểm tra lại kết nối mạng.");
    } finally {
      setLoading(false);
    }
  };

  // ── Field component helper
  const inputClass = (field: keyof FieldErrors) =>
    `w-full bg-sky-50 border rounded-xl px-3 py-2.5 text-sm outline-none transition pr-10 ${
      fieldErrors[field]
        ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100"
        : "border-sky-200 text-slate-700 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-3xl mx-auto shadow-lg shadow-sky-200">
            P
          </div>
          <h1 className="text-2xl font-black text-slate-700 mt-4">Hupunacake Mini CRM</h1>
          <p className="text-sm text-slate-400 mt-1">Quản lý bán hàng đa kênh — Facebook Inbox</p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="bg-white border border-sky-100 rounded-2xl p-6 space-y-4 shadow-xl shadow-sky-100/50"
        >
          {/* Tab toggle */}
          <div className="flex gap-1.5 p-1 bg-sky-50 rounded-xl border border-sky-100">
            {(["login", "register"] as const).map((m) => (
              <Button
                key={m}
                type="button"
                variant="ghost"
                onClick={() => switchMode(m)}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${
                  mode === m
                    ? "bg-white text-sky-600 shadow-sm border border-sky-100 hover:bg-white"
                    : "text-slate-400 hover:text-sky-500"
                }`}
              >
                {m === "login" ? "Đăng nhập" : "Đăng ký"}
              </Button>
            ))}
          </div>

          {/* Họ tên (register only) */}
          {mode === "register" && (
            <div>
              <label className="text-xs text-slate-500 font-semibold block mb-1">
                Họ và tên <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-300 pointer-events-none" />
                <Input
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    runValidation(mode, e.target.value, email, password);
                  }}
                  className={`${inputClass("fullName")} pl-9`}
                  placeholder="Nguyễn Văn A"
                />
              </div>
              {fieldErrors.fullName && (
                <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {fieldErrors.fullName}
                </p>
              )}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="text-xs text-slate-500 font-semibold block mb-1">
              Email <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-300 pointer-events-none" />
              <Input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  runValidation(mode, fullName, e.target.value, password);
                }}
                className={`${inputClass("email")} pl-9`}
                placeholder="admin@shop.com"
              />
            </div>
            {fieldErrors.email && (
              <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Mật khẩu */}
          <div>
            <label className="text-xs text-slate-500 font-semibold block mb-1">
              Mật khẩu <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-300 pointer-events-none" />
              <Input
                type={showPassword ? "text" : "password"}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  runValidation(mode, fullName, email, e.target.value);
                }}
                className={`${inputClass("password")} pl-9`}
                placeholder="••••••••"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-1 top-1.5 h-8 w-8 text-slate-300 hover:text-sky-500 hover:bg-transparent"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            {fieldErrors.password && (
              <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {fieldErrors.password}
              </p>
            )}
            {/* Password strength indicator (register only) */}
            {mode === "register" && password.length > 0 && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[6, 8, 12].map((len, i) => (
                    <div
                      key={len}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        password.length >= len
                          ? i === 0 ? "bg-red-400" : i === 1 ? "bg-amber-400" : "bg-emerald-400"
                          : "bg-sky-100"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-slate-400">
                  {password.length < 6
                    ? "Mật khẩu quá ngắn"
                    : password.length < 8
                    ? "Yếu — nên dùng ít nhất 8 ký tự"
                    : password.length < 12
                    ? "Trung bình"
                    : "Mạnh 💪"}
                </p>
              </div>
            )}
          </div>

          {/* Lỗi từ server */}
          {serverError && (
            <div className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              {serverError}
            </div>
          )}

          {/* Thông báo thành công */}
          {successMsg && (
            <div className="text-emerald-700 text-xs bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              {successMsg}
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="w-full font-black rounded-xl shadow-md shadow-sky-200"
          >
            {loading
              ? "Đang xử lý..."
              : mode === "login"
              ? "🚀 Đăng Nhập"
              : "✨ Tạo Tài Khoản Admin"}
          </Button>
        </form>

        <div className="mt-4">
          <div className="relative flex items-center mb-4">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink-0 mx-4 text-slate-400 text-xs">Hoặc</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>
          <Button 
            type="button"
            size="lg"
            onClick={handleFacebookLogin}
            className="w-full gap-2 bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold rounded-xl shadow-md shadow-blue-200"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            Kết nối Fanpage
          </Button>
        </div>

        <p className="text-center text-[11px] text-slate-400 mt-4">
          Giai đoạn 1 — Auth JWT + Layout Dashboard (pancake.md)
        </p>
      </div>
    </div>
  );
}
