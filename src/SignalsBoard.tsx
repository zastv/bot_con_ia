
import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

type Signal = {
  id?: number;
  pair: string;
  type: string;
  entry: number;
  sl: number;
  tp: number;
  timestamp: string;
};

const formatSignal = (signal: Signal) =>
  `${signal.type} ${signal.pair} @ ${signal.entry}, SL: ${signal.sl}, TP: ${signal.tp}`;

const SignalsBoard: React.FC = () => {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    pair: "",
    type: "BUY",
    entry: "",
    sl: "",
    tp: "",
  });

  const fetchSignals = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("signals")
      .select("*")
      .order("timestamp", { ascending: false });
    if (!error && data) setSignals(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSignals();
  }, []);

  const handleCopy = (signal: Signal) => {
    navigator.clipboard.writeText(formatSignal(signal));
    setCopiedId(signal.id ?? 0);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newSignal: Signal = {
      pair: form.pair,
      type: form.type,
      entry: parseFloat(form.entry),
      sl: parseFloat(form.sl),
      tp: parseFloat(form.tp),
      timestamp: new Date().toISOString(),
    };
    const { error } = await supabase.from("signals").insert([newSignal]);
    if (!error) {
      setForm({ pair: "", type: "BUY", entry: "", sl: "", tp: "" });
      fetchSignals();
    } else {
      alert("Error al guardar la señal");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-center">Señales de Trading</h2>

      <form onSubmit={handleSubmit} className="mb-6 bg-white p-4 rounded shadow">
        <div className="flex flex-col md:flex-row md:space-x-2 space-y-2 md:space-y-0">
          <input name="pair" value={form.pair} onChange={handleChange} required placeholder="Par (ej: EURUSD)" className="border p-2 rounded flex-1" />
          <select name="type" value={form.type} onChange={handleChange} className="border p-2 rounded">
            <option value="BUY">BUY</option>
            <option value="SELL">SELL</option>
          </select>
          <input name="entry" value={form.entry} onChange={handleChange} required placeholder="Entrada" className="border p-2 rounded w-24" type="number" step="any" />
          <input name="sl" value={form.sl} onChange={handleChange} required placeholder="SL" className="border p-2 rounded w-24" type="number" step="any" />
          <input name="tp" value={form.tp} onChange={handleChange} required placeholder="TP" className="border p-2 rounded w-24" type="number" step="any" />
          <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">Agregar</button>
        </div>
      </form>

      {loading ? (
        <div className="text-center text-gray-500">Cargando señales...</div>
      ) : (
        <div className="space-y-4">
          {signals.map((signal) => (
            <div
              key={signal.id}
              className={`rounded-lg shadow-md p-4 flex flex-col md:flex-row md:items-center justify-between border-l-4 ${
                signal.type === "BUY" ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"
              }`}
            >
              <div>
                <div className="font-semibold text-lg">
                  {signal.type} <span className="text-blue-700">{signal.pair}</span>
                </div>
                <div className="text-sm text-gray-700">
                  Entrada: <b>{signal.entry}</b> | SL: <b>{signal.sl}</b> | TP: <b>{signal.tp}</b>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(signal.timestamp).toLocaleString()}
                </div>
              </div>
              <button
                className="mt-2 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
                onClick={() => handleCopy(signal)}
              >
                {copiedId === signal.id ? "¡Copiado!" : "Copiar señal"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SignalsBoard;
