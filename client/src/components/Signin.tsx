import { useState } from "react";

export const SignIn = () =>  {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [responseMsg, setResponseMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResponseMsg(null);
    try {
      const res = await fetch("http://localhost:3000/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!data){
        setResponseMsg("No data")
      }
      localStorage.setItem("token",data.token);
      setResponseMsg(data.msg || "Signin successful!");
      window.location.reload();

     
    } catch (err: any) {
      setResponseMsg("An error occurred during signin.");
    }
  };

  return (
    <div className="border border-white p-6  rounded-4xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xs mx-auto">
        <label>
          <span className="font-bold text-white">Username:</span>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="border rounded px-2 py-1 w-full"
            required
          />
        </label>
        <label>
        <span className="font-bold text-white">          Password:
        </span>

          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="border rounded px-2 py-1 w-full"
            required
          />
        </label>
        <button onClick={() => setResponseMsg("")} type="submit" className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700">
          Sign In
        </button>
        <div>
            {responseMsg}
        </div>
      </form>
    </div>
  );
}