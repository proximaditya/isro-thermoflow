"use client";
import { useState, useEffect } from "react";

export default function MissionControl() {
  const [metrics, setMetrics] = useState<any>(null);
  const [images, setImages] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [terminalText, setTerminalText] = useState("");

  const logs = [
    "[SYS] Uplink established with INSAT-3DS/3DR.",
    "[DATA] Parsing HDF5 Thermal Infrared (TIR1) arrays...",
    "[MATH] ThermoFlowNet calculating non-linear optical flow...",
    "[PHYS] Applying adiabatic cooling residuals...",
    "[AI] Synthesizing intermediate 15-Minute frame...",
    "[DONE] Verification Complete. Transmitting to UI."
  ];

  useEffect(() => {
    if (loading) {
      let i = 0;
      const interval = setInterval(() => {
        setTerminalText((prev) => prev + "\n" + logs[i]);
        i++;
        if (i === logs.length) clearInterval(interval);
      }, 700);
      return () => clearInterval(interval);
    } else {
      setTerminalText("");
    }
  }, [loading]);

  const handleEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const form = e.target as HTMLFormElement;
    const file1 = (form[0] as HTMLInputElement).files?.[0];
    const file2 = (form[1] as HTMLInputElement).files?.[0];

    if (!file1 || !file2) {
      alert("System Alert: Both T=00:00 and T=00:30 files required.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file_t0", file1);
    formData.append("file_t30", file2);

    try {
      const res = await fetch("http://127.0.0.1:8000/evaluate", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setMetrics(data.metrics);
      setImages(data.images);
    } catch (error) {
      console.error("API Error", error);
      alert("CRITICAL ERROR: AI Backend is offline.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 font-sans selection:bg-cyan-500">
      {/* CSS Animation Logic for the Radar Loop */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes radarLoop1 { 0%, 25% { opacity: 1; z-index: 3; } 33%, 100% { opacity: 0; z-index: 1; } }
        @keyframes radarLoop2 { 0%, 25% { opacity: 0; z-index: 1; } 33%, 58% { opacity: 1; z-index: 3; } 66%, 100% { opacity: 0; z-index: 1; } }
        @keyframes radarLoop3 { 0%, 58% { opacity: 0; z-index: 1; } 66%, 91% { opacity: 1; z-index: 3; } 100% { opacity: 0; z-index: 1; } }
        .frame-1 { animation: radarLoop1 3s infinite; }
        .frame-2 { animation: radarLoop2 3s infinite; }
        .frame-3 { animation: radarLoop3 3s infinite; }
      `}} />

      {/* HEADER - SPACEX VIBE */}
      <header className="p-4 border-b border-white/10 bg-black flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 bg-cyan-500 rounded-sm flex items-center justify-center font-black text-black">AI</div>
          <div>
            <h1 className="text-xl font-bold tracking-[0.2em] text-white">ISRO ORBITAL COMMAND</h1>
            <p className="text-[10px] font-mono text-cyan-500 tracking-widest">THERMOFLOW-NET // INSAT TEMPORAL UPSCALING</p>
          </div>
        </div>
        <div className="flex gap-6 text-[10px] font-mono text-slate-500 hidden md:flex">
          <div><span className="text-slate-300">ORBIT:</span> GEOSTATIONARY</div>
          <div><span className="text-slate-300">ALTITUDE:</span> 35,786 KM</div>
          <div><span className="text-slate-300">SENSOR:</span> TIR-1 (10µm)</div>
          <div className="flex items-center gap-2"><div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div> SYSTEM ACTIVE</div>
        </div>
      </header>

      <main className="p-6 max-w-screen-2xl mx-auto grid grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: CONTROLS & TERMINAL */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          
          <div className="bg-[#0a0a0a] p-6 rounded-lg border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500"></div>
            <h2 className="text-sm font-bold tracking-widest text-white mb-6 flex items-center gap-2">
              <span className="text-cyan-500">01 //</span> INGEST TELEMETRY
            </h2>
            
            <form onSubmit={handleEvaluation} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-slate-500 mb-1">T=00:00 HRS (FRAME 1) [.h5]</label>
                <input type="file" required className="w-full text-xs text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-bold file:bg-cyan-900/30 file:text-cyan-400 hover:file:bg-cyan-900/50 cursor-pointer" />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-slate-500 mb-1">T=00:30 HRS (FRAME 2) [.h5]</label>
                <input type="file" required className="w-full text-xs text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-bold file:bg-cyan-900/30 file:text-cyan-400 hover:file:bg-cyan-900/50 cursor-pointer" />
              </div>
              <button type="submit" disabled={loading} className="w-full mt-4 bg-white hover:bg-slate-200 text-black text-xs tracking-widest font-bold py-3 rounded transition-all disabled:opacity-50">
                {loading ? "PROCESSING..." : "INITIATE SYNTHESIS"}
              </button>
            </form>
          </div>

          <div className="bg-[#050505] p-5 rounded-lg border border-white/10 h-64 overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,1)]">
            <h2 className="text-[10px] font-mono tracking-widest text-slate-500 mb-4 border-b border-white/10 pb-2">SYSTEM CONSOLE</h2>
            <div className="font-mono text-xs text-cyan-400/80">
              <pre className="whitespace-pre-wrap">{terminalText}</pre>
              {loading && <span className="animate-pulse">_</span>}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DASHBOARD & RADAR */}
        <div className="col-span-12 lg:col-span-9 space-y-6">
          
          {/* METRICS ROW */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-[#0a0a0a] p-5 rounded-lg border border-white/10">
              <h3 className="text-[10px] font-mono text-slate-500 mb-1">FIDELITY (PSNR)</h3>
              <p className="text-2xl font-light text-white">{metrics ? metrics.psnr : "---"}</p>
            </div>
            <div className="bg-[#0a0a0a] p-5 rounded-lg border border-white/10">
              <h3 className="text-[10px] font-mono text-slate-500 mb-1">STRUCTURE (SSIM)</h3>
              <p className="text-2xl font-light text-white">{metrics ? metrics.ssim : "---"}</p>
            </div>
            <div className="bg-[#0a0a0a] p-5 rounded-lg border border-white/10">
              <h3 className="text-[10px] font-mono text-slate-500 mb-1">FEATURES (FSIM)</h3>
              <p className="text-2xl font-light text-white">{metrics ? metrics.fsim : "---"}</p>
            </div>
            <div className="bg-[#0a0a0a] p-5 rounded-lg border border-white/10">
              <h3 className="text-[10px] font-mono text-slate-500 mb-1">PIXEL ERROR (MSE)</h3>
              <p className="text-2xl font-light text-red-400">{metrics ? metrics.mse : "---"}</p>
            </div>
          </div>

          {/* VISUAL ANALYSIS */}
          {metrics && images && !loading && (
            <div className="grid grid-cols-12 gap-6 animate-in fade-in duration-700">
              
              {/* STATIC FRAMES */}
              <div className="col-span-12 md:col-span-8 bg-[#0a0a0a] p-6 rounded-lg border border-white/10">
                 <h2 className="text-sm font-bold tracking-widest text-white mb-6 flex items-center gap-2">
                  <span className="text-cyan-500">02 //</span> SYNTHESIS OUTPUT
                </h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <img src={`data:image/png;base64,${images.t0}`} className="w-full aspect-square object-cover rounded border border-white/10" />
                    <p className="text-[10px] font-mono text-center text-slate-500">INPUT: 00:00</p>
                  </div>
                  <div className="space-y-2 relative">
                    <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded"></div>
                    <img src={`data:image/png;base64,${images.predicted}`} className="relative w-full aspect-square object-cover rounded border border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]" />
                    <p className="text-[10px] font-mono text-center text-cyan-400 font-bold">AI SYNTHESIS: 00:15</p>
                  </div>
                  <div className="space-y-2">
                    <img src={`data:image/png;base64,${images.t30}`} className="w-full aspect-square object-cover rounded border border-white/10" />
                    <p className="text-[10px] font-mono text-center text-slate-500">INPUT: 00:30</p>
                  </div>
                </div>
              </div>

              {/* LIVE RADAR */}
              <div className="col-span-12 md:col-span-4 bg-[#0a0a0a] p-6 rounded-lg border border-white/10 flex flex-col items-center justify-center">
                 <h2 className="text-sm font-bold tracking-widest text-white mb-6 flex items-center gap-2 w-full">
                  <span className="animate-pulse h-2 w-2 bg-red-500 rounded-full inline-block"></span> 
                  LIVE RADAR
                </h2>
                <div className="relative w-full max-w-[250px] aspect-square rounded-full overflow-hidden border-2 border-slate-800 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                  {/* Radar Scanning Line Effect */}
                  <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full z-10"></div>
                  <div className="absolute top-0 left-1/2 w-[1px] h-1/2 bg-cyan-500/50 origin-bottom animate-spin z-10" style={{animationDuration: '3s'}}></div>
                  
                  {/* CSS Animated Images */}
                  <img src={`data:image/png;base64,${images.t0}`} className="absolute inset-0 w-full h-full object-cover frame-1" />
                  <img src={`data:image/png;base64,${images.predicted}`} className="absolute inset-0 w-full h-full object-cover frame-2" />
                  <img src={`data:image/png;base64,${images.t30}`} className="absolute inset-0 w-full h-full object-cover frame-3" />
                </div>
                <p className="mt-4 text-[10px] font-mono text-slate-500 text-center">TIME-LAPSE INTERPOLATION LOOP</p>
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}