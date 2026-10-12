import React, { useState } from "react";

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    const enteredUsername = username.trim().toLowerCase();

    if (!enteredUsername || !password) {
      setError("Please enter username and password.");
      return;
    }

    // Procurement Team
    if (
      enteredUsername === "procurement" &&
      password === "procure123"
    ) {
      onLogin({
        username: "procurement",
        role: "user",
      });

      return;
    }

    // Admin
    if (
      enteredUsername === "admin" &&
      password === "admin123"
    ) {
      onLogin({
        username: "admin",
        role: "admin",
      });

      return;
    }

    setError("Invalid username or password.");
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">

      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="text-center mb-8">

          <div className="mx-auto w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg">
            PB
          </div>

          <h1 className="text-3xl font-bold text-slate-900 mt-4">
            Procure Bot
          </h1>

          <p className="text-slate-500 mt-1">
            Procurement Intelligence Platform
          </p>

        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">

          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              Sign in
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Access your procurement workspace.
            </p>
          </div>

          <form onSubmit={handleLogin}>

            {/* Username */}
            <div className="mb-5">

              <label className="block text-sm font-medium text-slate-700 mb-2">
                Username
              </label>

              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />

            </div>

            {/* Password */}
            <div className="mb-5">

              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>

              <div className="relative">

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 pr-20 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-indigo-600"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>

              </div>

            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition"
            >
              Sign In
            </button>

          </form>

          {/* Development credentials */}
          <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200">

            <p className="text-xs font-semibold text-slate-600 mb-2">
              Development Access
            </p>

            <p className="text-xs text-slate-500">
              Procurement Team:{" "}
              <span className="font-medium">
                procurement / procure123
              </span>
            </p>

            <p className="text-xs text-slate-500 mt-1">
              Admin:{" "}
              <span className="font-medium">
                admin / admin123
              </span>
            </p>

          </div>

        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Procure Bot • Procurement Management System
        </p>

      </div>

    </div>
  );
}

export default LoginPage;