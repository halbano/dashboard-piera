import { useState } from "react";

const PIN = import.meta.env.VITE_APP_PIN;

export default function PinScreen({ onAuth }) {
  const [val, setVal] = useState("");
  const [err, setErr] = useState(false);

  const attempt = () => {
    if (val.toUpperCase().trim() === PIN) {
      localStorage.setItem("auth_v1", "true");
      onAuth();
    } else {
      setErr(true); setVal("");
      setTimeout(() => setErr(false), 600);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"#1C1810", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"2rem", fontFamily:"-apple-system, sans-serif" }}>
      <div style={{ fontSize:"2.5rem", marginBottom:"1rem" }}>🏠</div>
      <div style={{ fontSize:"1.25rem", fontWeight:700, color:"#F0EAE0", marginBottom:4 }}>Dashboard Familiar</div>
      <div style={{ fontSize:".8125rem", color:"#786A55", marginBottom:"2.5rem" }}>Ingresá el PIN compartido</div>
      <div style={{ width:"100%", maxWidth:280, animation:err?"shake .5s":"none" }}>
        <input
          value={val} onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === "Enter" && attempt()}
          placeholder="PIN" autoFocus type="password"
          style={{ width:"100%", padding:"14px 18px", fontSize:"1.25rem", fontWeight:600, letterSpacing:".2em", textAlign:"center", background:err?"#3A1A18":"#2A2418", border:`1.5px solid ${err?"#C06050":"#3A3028"}`, borderRadius:12, color:"#F0EAE0", outline:"none", marginBottom:12, fontFamily:"inherit", transition:"all .2s" }}
        />
        <button onClick={attempt} style={{ width:"100%", padding:"13px", background:"#C8883A", border:"none", borderRadius:12, color:"#fff", fontSize:".9375rem", fontWeight:600, cursor:"pointer" }}>
          Entrar
        </button>
      </div>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}25%,75%{transform:translateX(-8px)}50%{transform:translateX(8px)}}`}</style>
    </div>
  );
}
