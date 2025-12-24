import React, { useState, useEffect } from "react";
import {
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Building2,
  Users,
  Receipt,
  LayoutDashboard,
} from "lucide-react";
import { authService } from "../../services/api";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { GoogleLogin } from "@react-oauth/google";

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useApp();

  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ 1. Check for Saved Email on Load
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setFormData((prev) => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ 2. Handle "Remember Me" Logic
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", formData.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      // Call Backend
      const data = await authService.login(formData);

      // Login Context
      login(data.token, data.user);

      // Redirect
      const userRole = data.user.role;
      if (userRole === "SUPER_ADMIN") navigate("/");
      else if (userRole === "COMPANY_ADMIN") navigate("/");
      else if (userRole === "MANAGER") navigate("/");
      else navigate("/");
    } catch (error: any) {
      console.error("❌ Login Failed:", error);
      const errorMessage =
        error.response?.data?.message || "Invalid Credentials";
      alert(`❌ Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const features = isSuperAdmin
    ? [
        { icon: LayoutDashboard, text: "Tenant Dashboard" },
        { icon: Building2, text: "Company Management" },
        { icon: ShieldCheck, text: "System Health & Logs" },
        { icon: Receipt, text: "Subscription Billing" },
      ]
    : [
        { icon: Users, text: "Employee Self Service" },
        { icon: Building2, text: "Attendance & Leave" },
        { icon: Receipt, text: "Payroll & Payslips" },
        { icon: ShieldCheck, text: "Tax & Compliance" },
      ];

  return (
    <div className="h-screen w-full flex bg-white overflow-hidden">
      {/* LEFT SIDE */}
      <div
        className={`hidden lg:flex w-1/2 flex-col justify-between p-12 transition-colors duration-500 relative overflow-hidden ${
          isSuperAdmin ? "bg-slate-900" : "bg-indigo-600"
        }`}
      >
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-white/5 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-black/10 blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-3 text-white mb-10">
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-md shadow-lg border border-white/10">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <span className="text-3xl font-bold tracking-wide">
              BharatForce
            </span>
          </div>
          <div className="text-white space-y-6 max-w-lg">
            <h1 className="text-5xl font-extrabold leading-tight tracking-tight">
              {isSuperAdmin ? "Master Control." : "Workforce, Simplified."}
            </h1>
            <p className="text-lg text-white/80 font-medium leading-relaxed">
              {isSuperAdmin
                ? "Centralized administration for all your tenant companies."
                : "The complete HR Operating System built for modern Indian Enterprises."}
            </p>
          </div>
        </div>
        <div className="relative z-10 grid grid-cols-1 gap-4 mt-8">
          <p className="text-white/60 text-sm uppercase tracking-wider font-semibold mb-2">
            Included Modules
          </p>
          {features.map((item, i) => (
            <div
              key={i}
              className="flex items-center space-x-4 text-white p-3 rounded-lg bg-white/5 border border-white/5 backdrop-blur-sm"
            >
              <item.icon className="w-6 h-6 text-indigo-300" />
              <span className="font-medium text-lg">{item.text}</span>
            </div>
          ))}
        </div>
        <div className="relative z-10 text-white/50 text-sm font-medium">
          © 2025 BharatForce Inc.
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full lg:w-1/2 flex flex-col bg-slate-50 h-full overflow-y-auto">
        <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-24">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                {isSuperAdmin ? "Super Admin Portal" : "Sign in to account"}
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Welcome back! Please enter your credentials.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">
                  Email address
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-base transition-all bg-white"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-base transition-all bg-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe} //  Controlled Input
                    onChange={(e) => setRememberMe(e.target.checked)} //  Update State
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-slate-700"
                  >
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  {/* Link to Forgot Password Page */}
                  <Link
                    to="/forgot-password"
                    className="font-semibold text-indigo-600 hover:text-indigo-500"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-semibold text-white transition-all transform hover:-translate-y-0.5
                  ${
                    isSuperAdmin
                      ? "bg-slate-900 hover:bg-slate-800"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  } 
                  ${
                    loading
                      ? "opacity-70 cursor-not-allowed transform-none"
                      : ""
                  }`}
              >
                {loading ? (
                  "Authenticating..."
                ) : (
                  <span className="flex items-center">
                    Sign in <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                )}
              </button>
            </form>

            <div className="mt-6 flex justify-center">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  try {
                    console.log("Google Credential:", credentialResponse);
                    // Send the `credential` (which is the ID Token) to backend
                    if (credentialResponse.credential) {
                      const data = await authService.googleLogin(
                        credentialResponse.credential
                      );

                      // Same logic as standard login
                      login(data.token, data.user);
                      alert(`Welcome back, ${data.user.name}!`);

                      // Redirect
                      if (data.user.role === "SUPER_ADMIN") navigate("/");
                      else if (data.user.role === "COMPANY_ADMIN")
                        navigate("/");
                      else if (data.user.role === "MANAGER") navigate("/");
                      else navigate("/");
                    }
                  } catch (error) {
                    console.error("Google Auth Failed on Backend", error);
                    alert("Google Login Failed. User might not exist.");
                  }
                }}
                onError={() => {
                  console.log("Login Failed");
                }}
                useOneTap
                theme="outline"
                // You can customize shape/text here
              />
            </div>

            <p className="mt-8 text-center text-xs text-slate-400">
              © 2025 BharatForce Inc.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
