"use client";

import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/use-auth";

export default function LoginForm() {
  const { register, handleSubmit } = useForm();
  const { login, loading, error } = useAuth();

  const onSubmit = (data: any) => {
    login(data.email, data.password);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input
        type="email"
        placeholder="Email"
        {...register("email")}
        className="input"
      />
      <input
        type="password"
        placeholder="Password"
        {...register("password")}
        className="input"
      />
      <button type="submit" disabled={loading} className="btn">
        {loading ? "Logging in..." : "Login"}
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
}