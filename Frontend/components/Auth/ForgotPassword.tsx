import React, { useState } from "react";
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
// ✅ CRITICAL CHANGE: Import your configured API service
import api from "../../services/api";

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage(""); // Clear previous messages

    try {
      // Replaced 'axios.post("http://127.0.0.1...")' with 'api.post("/auth/forgot-password")'
      // This uses the BaseURL defined in your services/api.ts file
      await api.post("/auth/forgot-password", { email });

      setStatus("success");
      setMessage("Password reset link sent to your email!");
    } catch (error: any) {
      setStatus("error");
      // Handle the error message safely, falling back to a generic message if server response is missing
      const errorMsg =
        error.response?.data?.message ||
        "Something went wrong. Please try again.";
      setMessage(errorMsg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-slate-100">
        {/* HEADER SECTION */}
        {status !== "success" && (
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-slate-900">
              Forgot Password?
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              No worries! Enter your email and we'll send you a reset link.
            </p>
          </div>
        )}

        {/* SUCCESS STATE */}
        {status === "success" ? (
          <div className="text-center space-y-6 animate-fade-in">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-900">
                Check your inbox
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                We sent a password reset link to{" "}
                <span className="font-semibold text-slate-700">{email}</span>
              </p>
            </div>
            <Link
              to="/login"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          /* FORM STATE */
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* ERROR MESSAGE DISPLAY */}
            {status === "error" && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="text-sm text-red-700 mt-1">{message}</div>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
            >
              {status === "loading" ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <>
                  Send Reset Link
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>

            <div className="text-center">
              <Link
                to="/login"
                className="font-medium text-slate-600 hover:text-indigo-500 flex items-center justify-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
