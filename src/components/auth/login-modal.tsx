"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { requestOtpAction, verifyOtpAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";

type Stage = "input" | "otp";

export function LoginModal() {
  const closeLogin = useAuthStore((s) => s.closeLogin);
  const login = useAuthStore((s) => s.login);
  const [stage, setStage] = useState<Stage>("input");
  const [useEmail, setUseEmail] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const fieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fieldRef.current?.focus();
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeLogin();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [closeLogin]);

  const channel = useEmail ? "email" : "phone";

  const requestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await requestOtpAction({ identifier, channel });
    setLoading(false);
    if (!res.ok) return setError(res.error);
    setStage("otp");
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await verifyOtpAction({ identifier, channel, otp });
    setLoading(false);
    if (!res.ok) return setError(res.error);
    if (res.data) login(res.data);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Login">
      <div className="absolute inset-0 bg-black/60" onClick={closeLogin} />
      <div className="relative flex w-full max-w-[750px] flex-col overflow-hidden rounded-sm bg-white shadow-lift md:flex-row">
        <button onClick={closeLogin} aria-label="Close login dialog" className="absolute right-3 top-3 z-10 rounded-full p-1 text-white hover:bg-white/20">
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col justify-between bg-brand p-8 md:w-[40%]">
          <div>
            <h2 className="mb-3 text-2xl font-bold text-white">Login</h2>
            <p className="text-sm leading-relaxed text-white/90">Get access to your Orders, Wishlist and Recommendations</p>
          </div>
          <svg viewBox="0 0 200 120" className="mt-8 w-full max-w-[220px] self-center" aria-hidden="true">
            <circle cx="100" cy="70" r="46" fill="#1d4ed8" />
            <circle cx="128" cy="34" r="12" fill="#fbbf24" />
            <rect x="62" y="46" width="76" height="48" rx="4" fill="#fff" />
            <rect x="70" y="54" width="60" height="32" rx="2" fill="#e8f0fe" />
            <circle cx="100" cy="70" r="8" fill="#2563eb" />
            <rect x="46" y="70" width="20" height="24" rx="2" fill="#ef4444" />
            <rect x="134" y="74" width="24" height="20" rx="2" fill="#fbbf24" />
          </svg>
        </div>

        <div className="p-8 md:w-[60%]">
          {stage === "input" ? (
            <form onSubmit={requestOtp} className="space-y-5">
              <div>
                <h3 className="text-lg font-semibold">Log in for the best experience</h3>
                <p className="mt-1 text-sm text-gray-500">Enter your {useEmail ? "email" : "phone number"} to continue</p>
              </div>
              <div>
                <label htmlFor="auth-id" className="text-xs font-semibold text-brand">{useEmail ? "Email" : "Phone Number"}</label>
                <div className="mt-1 flex rounded-sm border border-gray-300 focus-within:border-brand focus-within:ring-1 focus-within:ring-brand">
                  {!useEmail && <span className="flex items-center border-r border-gray-300 bg-gray-50 px-3 text-sm">+91</span>}
                  <input
                    ref={fieldRef}
                    id="auth-id"
                    inputMode={useEmail ? "email" : "numeric"}
                    value={identifier}
                    onChange={(e) => setIdentifier(useEmail ? e.target.value : e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="h-11 w-full px-3 text-sm focus:outline-none"
                    placeholder={useEmail ? "you@example.com" : "10-digit mobile number"}
                  />
                </div>
              </div>
              {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
              <button type="button" onClick={() => { setUseEmail((v) => !v); setError(""); }} className="text-sm font-semibold text-brand hover:underline">
                Use {useEmail ? "Phone Number" : "Email-ID"}
              </button>
              <p className="rounded-sm bg-gray-50 px-3 py-2 text-[11px] leading-relaxed text-gray-600">
                Demo: any valid mobile logs in as customer · <strong>9000000000</strong> or <strong>admin@kartora.com</strong> logs in as admin · OTP <strong>123456</strong>
              </p>
              <p className="text-[11px] leading-relaxed text-gray-500">
                By continuing, you confirm that you are above 18 years of age, and you agree to the Kartora{" "}
                <span className="cursor-pointer text-brand">Terms of Use</span> and <span className="cursor-pointer text-brand">Privacy Policy</span>.
              </p>
              <Button type="submit" disabled={loading} className="w-full bg-[#fb641b] hover:bg-[#e85a15]">
                {loading ? "Sending OTP…" : "Continue"}
              </Button>
            </form>
          ) : (
            <form onSubmit={verifyOtp} className="space-y-5">
              <div>
                <h3 className="text-lg font-semibold">Verify OTP</h3>
                <p className="mt-1 text-sm text-gray-500">OTP sent to {useEmail ? identifier : `+91 ${identifier}`}</p>
                <p className="mt-2 rounded-sm bg-brand-light px-3 py-2 text-xs font-semibold text-brand">Demo mode — use OTP 123456</p>
              </div>
              <div>
                <label htmlFor="otp" className="text-xs font-semibold text-brand">One-time password</label>
                <input
                  id="otp"
                  ref={fieldRef}
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="mt-1 h-11 w-full rounded-sm border border-gray-300 px-3 text-sm tracking-widest focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  placeholder="6-digit OTP"
                />
              </div>
              {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
              <Button type="submit" disabled={loading || otp.length !== 6} className="w-full bg-[#fb641b] hover:bg-[#e85a15]">
                {loading ? "Verifying…" : "Verify & Login"}
              </Button>
              <button type="button" onClick={() => setStage("input")} className="text-sm font-semibold text-brand hover:underline">Change {useEmail ? "email" : "number"}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
