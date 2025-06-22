import { useState, useEffect } from 'react'
import './App.css'
import { Header } from './components/Header'
import { SignIn } from './components/Signin'
import { SignUp } from './components/Signup'
import { Dashboardd } from './components/Dashboard'

// Dummy Dashboard component for demonstration
const Dashboard = () => (
  <div className="text-white text-xl mt-10">
    <Dashboardd />
    <button
      className="mt-4 bg-red-600 text-white rounded px-4 py-2 hover:bg-red-700"
      onClick={() => {
        localStorage.removeItem("token");
        window.location.reload();
      }}
    >
      Logout
    </button>
  </div>
);

function App() {
  // type can be "signin", "signup", or "dashboard"
  const [type, setType] = useState<"signin" | "signup" | "dashboard">(() => {
    return localStorage.getItem("token") ? "dashboard" : "signin";
  });

  // Listen for token changes (e.g., after login/signup)
  useEffect(() => {
    if (localStorage.getItem("token")) {
      setType("dashboard");
    }
  }, []);

  // Helper to switch to dashboard after successful login/signup
  const handleAuthSuccess = () => {
    setType("dashboard");
  };

  return (
    <div className="flex flex-col items-center min-h-screen">
      <div className="w-full flex justify-center mt-5">
        <div className="scale-150">
          <Header />
        </div>
      </div>
      <div className="rounded-4xl p-8 mt-0 flex flex-col items-center min-w-[350px] w-3/4">
        {type === "dashboard" ? (
          <Dashboard />
        ) : type === "signin" ? (
          <>
            <SignIn />
            <div>
              Didn't sign up?{" "}
              <a
                className="text-blue-400 cursor-pointer underline"
                onClick={() => setType("signup")}
              >
                SignUp
              </a>
            </div>
          </>
        ) : (
          <>
            {/* @ts-expect-error onAuthSuccess is not in type definition but is used intentionally */}
            <SignUp onAuthSuccess={handleAuthSuccess} />
            <div>
              Already signed up?{" "}
              <a
                className="text-blue-400 cursor-pointer underline"
                onClick={() => setType("signin")}
              >
                SignIn
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App
