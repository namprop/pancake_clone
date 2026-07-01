import { Suspense } from "react";
import LoginPage from "./LoginForm";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50 flex items-center justify-center text-slate-400">
          Đang tải...
        </div>
      }
    >
      <LoginPage />
    </Suspense>
  );
}
