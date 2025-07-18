"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function FeaturesPage() {
  const [features, setFeatures] = useState([]);
  const [form, setForm] = useState({ title: "", description: "" });
  const router = useRouter();
  const isButtonDisabled = !form.title.trim() || !form.description.trim();

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    // ✅ Redirect if not logged in
    if (!token) {
      router.push("/");
      return;
    }

    // ✅ Load features
    fetch("http://127.0.0.1:5000/api/features")
      .then((res) => res.json())
      .then(setFeatures);
  }, [token]);

  const submitFeature = async () => {
    if (!isButtonDisabled) {
      const res = await fetch("http://127.0.0.1:5000/api/features", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        setFeatures([...features, { ...form, upvotes: 0, id: data.id }]);
        setForm({ title: "", description: "" });
      } else {
        alert(data.error || "Error submitting feature.");
      }
    }
  };

  const upvote = async (id: number) => {
    const res = await fetch(`http://127.0.0.1:5000/api/features/${id}/upvote`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const error = await res.json();
      return alert(error.error || "Upvote failed");
    }

    setFeatures(
      features.map((f) => (f.id === id ? { ...f, upvotes: f.upvotes + 1 } : f))
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-100 to-blue-100 p-6">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xl">
        <h2 className="text-lg font-semibold mb-2">Submit New Feature</h2>

        <input
          className="w-full mb-2 p-2 border rounded"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <textarea
          className="w-full mb-2 p-2 border rounded"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <button
          className={`w-full px-4 py-2 rounded text-white ${
            form.title.trim() && form.description.trim()
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
          onClick={submitFeature}
          disabled={isButtonDisabled}
        >
          Submit
        </button>

        <h2 className="text-lg font-semibold mb-4">All Features</h2>
        <ul className="space-y-4">
          {features.map((f: any) => (
            <li
              key={f.id}
              className="border border-gray-200 p-4 rounded-lg shadow-sm bg-gray-50"
            >
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-semibold text-gray-800">{f.title}</h3>
                <button
                  onClick={() => upvote(f.id)}
                  className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                >
                  ⬆ {f.upvotes}
                </button>
              </div>
              <p className="text-sm text-gray-600">{f.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
