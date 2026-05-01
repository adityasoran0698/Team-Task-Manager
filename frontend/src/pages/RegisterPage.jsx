import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const RegisterPage = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const password = watch("password");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const onSubmit = async (data) => {
    try {
      const response = await axios.post(
        "https://team-task-manager-zbjw.onrender.com/user/register",
        data,
      );
      if (response.status == 200) {
        navigate("/login");
      }
      setLoading(true);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[-80px] left-[-80px] w-[420px] h-[420px] bg-violet-700 opacity-10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-60px] right-[-60px] w-[360px] h-[360px] bg-cyan-500 opacity-10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-900 opacity-5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/30 rounded-full px-4 py-1.5 mb-5">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            <span className="text-violet-400 text-xs font-semibold tracking-[0.2em] uppercase">
              TaskFlow
            </span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
            Create Your Account
          </h2>
          <p className="text-gray-500 text-sm">
            Join your team and start collaborating
          </p>
        </div>

        {/* Card */}
        <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 shadow-2xl shadow-black/40">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                {...register("fullname", { required: "Full Name is required" })}
                placeholder="Enter your full name"
                className="w-full bg-gray-800/70 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all duration-200"
              />
              {errors.fullname && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
                  {errors.fullname.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/,
                    message: "Enter a valid email address",
                  },
                })}
                placeholder="Enter your email"
                className="w-full bg-gray-800/70 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all duration-200"
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                {...register("phoneNumber", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Enter a valid 10-digit phone number",
                  },
                })}
                placeholder="Enter your phone number"
                className="w-full bg-gray-800/70 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all duration-200"
              />
              {errors.phoneNumber && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Minimum 6 characters" },
                  })}
                  placeholder="Enter password"
                  className="w-full bg-gray-800/70 border border-gray-700 text-white rounded-xl px-4 py-3 pr-16 text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-violet-400 text-xs font-medium transition-colors duration-200 px-1"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  {...register("confirmPassword", {
                    required: "Confirm your password",
                    validate: (value) =>
                      value === password || "Passwords do not match",
                  })}
                  placeholder="Confirm password"
                  className="w-full bg-gray-800/70 border border-gray-700 text-white rounded-xl px-4 py-3 pr-16 text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-violet-400 text-xs font-medium transition-colors duration-200 px-1"
                >
                  {showConfirm ? "Hide" : "Show"}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Register As
              </label>
              <select
                {...register("role", { required: "Please select a role" })}
                className="w-full bg-gray-800/70 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all duration-200 appearance-none cursor-pointer"
              >
                <option value="" className="bg-gray-900 text-gray-400">
                  Select Role
                </option>
                <option value="Member" className="bg-gray-900 text-white">
                  Member
                </option>
                <option value="Admin" className="bg-gray-900 text-white">
                  Admin
                </option>
              </select>
              {errors.role && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
                  {errors.role.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200 text-sm shadow-lg shadow-violet-900/30 hover:shadow-violet-800/40"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  <span>Registering...</span>
                </div>
              ) : (
                "Create Account"
              )}
            </button>

            {/* Redirect */}
            <p className="text-center text-gray-500 text-sm pt-1">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-violet-400 hover:text-violet-300 font-medium transition-colors duration-200"
              >
                Sign in
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
