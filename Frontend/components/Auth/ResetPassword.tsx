import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Lock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

// ✅ Import strictly from the default export we just created
import api from "../../services/api";

export const ResetPassword: React.FC = () => {
  // 1. Get Token from Router
  const { token: paramToken } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setStatus("error");
      setMessage("Password must be at least 8 characters");
      return;
    }

    // 2. Token Fallback Strategy (For HashRouter safety)
    const urlToken = window.location.hash.split("/").pop();
    const finalToken = paramToken || urlToken;

    if (!finalToken) {
      setStatus("error");
      setMessage("Error: Reset Token missing from URL.");
      return;
    }

    setStatus("loading");

    try {
      // 3. Network Request (Production Ready)
      // We use 'api.patch' so it auto-selects the correct Production Backend URL
      await api.patch(`/auth/reset-password/${finalToken}`, { password });

      setStatus("success");
      setTimeout(() => navigate("/login"), 3000);
    } catch (error: any) {
      console.error("❌ Reset Error:", error);
      setStatus("error");
      setMessage(
        error.response?.data?.message || "Token is invalid or has expired."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-slate-100">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-900">
            Set new password
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Enter a strong password.
          </p>
        </div>

        {status === "success" ? (
          <div className="text-center bg-green-50 p-6 rounded-lg border border-green-100 mt-6">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-green-800">
              Password Updated!
            </h3>
            <p className="text-green-600 text-sm mt-1">
              Redirecting to login...
            </p>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  New Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-indigo-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Confirm Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-indigo-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {status === "error" && (
              <div className="rounded-md bg-red-50 p-4 flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
                <div className="text-sm text-red-700">{message}</div>
              </div>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70"
            >
              {status === "loading" ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
