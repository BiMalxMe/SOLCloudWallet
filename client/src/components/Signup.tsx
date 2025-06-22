import { useState } from "react";
import axios from "axios";

export const SignUp = () =>  {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [responseMsg, setResponseMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResponseMsg(null);
    try {
      const res = await axios.post("http://localhost:3000/signup", {
        username,
        password,
      });
      setResponseMsg(res.data.msg || "Signup successful!");
    if (res.data.msg === "User signed up successfully") {
      try {
        const signinRes = await axios.post("http://localhost:3000/signin", {
          username,
          password,
        });
        setResponseMsg(signinRes.data.msg || "Signed in after signup!");
      if (signinRes.data.token) {
        // Store the token in a state variable
        // You may want to lift this state up for app-wide usage, but for now, store locally
        // Add a new state for token if not already present
        // @ts-ignore
        localStorage.setItem("token",signinRes.data.token);

      }
      } catch (signinErr: any) {
        if (signinErr.response && signinErr.response.data && signinErr.response.data.msg) {
          setResponseMsg(signinErr.response.data.msg);
        } else {
          setResponseMsg("Signup succeeded, but signin failed.");
        }
      }
    }
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.msg) {
        setResponseMsg(err.response.data.msg);
      } else {
        setResponseMsg("An error occurred during signup.");
      }
    }
  };

  return (
    <div className="border border-white p-6  rounded-4xl">
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xs mx-auto">
      <label>
      <span className="font-bold text-white">          Username:
      </span>        <input
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="border rounded px-2 py-1 w-full"
          required
        />
      </label>
      <label>
      <span className="font-bold text-white">          Password:
      </span>        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="border rounded px-2 py-1 w-full"
          required
        />
      </label>
      <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700">
        Login
      </button>
      <div>
        {responseMsg}
      </div>
    </form>
    </div>
    
  );
}