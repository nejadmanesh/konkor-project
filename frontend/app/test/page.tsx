"use client";

import { useEffect, useState } from "react";

export default function TestPage() {
  const [data, setData] = useState<any>(null);
  const [token, setToken] = useState("");

  const fetchProfile = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/student/profile`,
      {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );
    const json = await res.json();
    setData(json);
  };

  return (
    <div className="p-8">
      <h1>🔍 تست اتصال API</h1>

      <input
        placeholder="توکن خود را اینجا وارد کنید"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        className="border p-2 w-full mt-4"
      />

      <button
        onClick={fetchProfile}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        تست API پروفایل
      </button>

      <pre className="mt-6 bg-gray-200 p-4 text-sm rounded">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
