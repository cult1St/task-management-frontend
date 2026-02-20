"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import authService from "@/services/auth.service";
import { RegisterDTO, ErrorResponse, ValidationErrors } from "@/dto/auth";
import { useAuth } from "@/context/auth-context";
import ToastContainer from "@/components/ToastContainer";
import { useToast } from "@/hooks/useToast";

const RegisterPage = () => {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const { toasts, showToast, removeToast } = useToast();

  const [formData, setFormData] = useState<RegisterDTO>({
    fullName: "",
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isLoading) return;

    setIsLoading(true);
    setErrors({});

    try {
      await authService.register(formData);

      showToast("Registration successful. Redirecting...", "success");

      await refreshUser();
      router.push("/user/dashboard");
    } catch (err: unknown) {
      const errData = err as ErrorResponse;

      if (errData?.errors) {
        setErrors(errData.errors);
      }

      if (errData?.message) {
        showToast(errData.message, "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="page-signup">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
      <div className="auth-card" style={{ maxWidth: 520 }}>
        <div className="auth-header">
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-sub">Start free - no credit card required</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              type="text"
              className="form-input"
              placeholder="Alex Johnson"
            />
            {errors.fullName && (
              <small className="form-error">{errors.fullName}</small>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              type="email"
              className="form-input"
              placeholder="alex@company.com"
            />
            {errors.email && <small className="form-error">{errors.email}</small>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="form-input-wrap">
              <input
                name="password"
                value={formData.password}
                onChange={handleChange}
                type={showPassword ? "text" : "password"}
                className="form-input"
                placeholder="Min. 8 characters"
              />
              <button
                type="button"
                className="form-input-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                👁
              </button>
            </div>
            {errors.password && <small className="form-error">{errors.password}</small>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
            style={{
              width: "100%",
              padding: "0.85rem",
              fontSize: "0.95rem",
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? "Creating Account..." : "Create Free Account ->"}
          </button>
        </form>

        <div className="auth-footer-link">
          Already have an account?{" "}
          <span
            style={{ cursor: "pointer", color: "var(--teal-400)" }}
            onClick={() => router.push("/login")}
          >
            Sign in
          </span>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
