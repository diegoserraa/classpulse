import { useState, useEffect, useRef } from "react";
import { apiFetch } from "../../services/Api";

/* ═══════════════════════════════════════════════════════════════
   CLASSPULSE — SONIC SPEED RANKING  v2
   Perfect responsive · 1366×768 · mobile · desktop
   ═══════════════════════════════════════════════════════════════ */

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Russo+One&family=Orbitron:wght@400;700;900&family=Exo+2:wght@300;500;700;800&display=swap');
  *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
  html, body { width:100%; height:100%; overflow:hidden; background:#000; }

  @keyframes speedLines {
    0%   { transform:translateX(120%) scaleX(1); opacity:0; }
    8%   { opacity:1; }
    100% { transform:translateX(-120%) scaleX(0.3); opacity:0; }
  }
  @keyframes ringCW  { from{transform:rotate(0)}   to{transform:rotate(360deg)} }
  @keyframes ringCCW { from{transform:rotate(360deg)} to{transform:rotate(0)} }
  @keyframes floatBob {
    0%,100% { transform:translateY(0); }
    50%     { transform:translateY(-8px); }
  }
  @keyframes floatBob1 {
    0%,100% { transform:translateY(0) rotate(-1deg); }
    50%     { transform:translateY(-10px) rotate(1deg); }
  }
  @keyframes floatBob2 {
    0%,100% { transform:translateY(0) rotate(.8deg); }
    50%     { transform:translateY(-7px) rotate(-.8deg); }
  }
  @keyframes floatBob3 {
    0%,100% { transform:translateY(0) rotate(.5deg); }
    50%     { transform:translateY(-6px) rotate(-.5deg); }
  }
  @keyframes neonFlicker {
    0%,95%,100% { opacity:1; }
    96%  { opacity:.7; }
    98%  { opacity:.85; }
  }
  @keyframes scanLine { from{top:-2px} to{top:100%} }
  @keyframes energyFlow {
    from { background-position:200% center; }
    to   { background-position:-200% center; }
  }
  @keyframes pctBar  { from{width:0%} }
  @keyframes glowP   { 0%,100%{opacity:.7} 50%{opacity:1} }
  @keyframes liveBlip {
    0%,100% { opacity:1; transform:scale(1); }
    50%     { opacity:.3; transform:scale(.65); }
  }
  @keyframes sonicPulse {
    0%,100% { box-shadow:0 0 16px #00BFFF,0 0 40px #0080FF44,inset 0 0 16px #00BFFF18; }
    50%     { box-shadow:0 0 28px #00BFFF,0 0 64px #0080FF88,inset 0 0 24px #00BFFF33; }
  }
  @keyframes titleDrop {
    0%   { transform:translateY(-40px) scaleY(1.2); opacity:0; }
    55%  { transform:translateY(4px) scaleY(.96); opacity:1; }
    75%  { transform:translateY(-2px); }
    100% { transform:translateY(0); opacity:1; }
  }
  @keyframes slideInL {
    from { transform:translateX(-70px); opacity:0; filter:blur(3px); }
    to   { transform:translateX(0); opacity:1; filter:blur(0); }
  }
  @keyframes slideInR {
    from { transform:translateX(70px); opacity:0; filter:blur(3px); }
    to   { transform:translateX(0); opacity:1; filter:blur(0); }
  }
  @keyframes popIn {
    0%  { transform:scale(0) rotate(-15deg); opacity:0; }
    55% { transform:scale(1.1) rotate(2deg); opacity:1; }
    75% { transform:scale(.95); }
    100%{ transform:scale(1); opacity:1; }
  }
  @keyframes xpGrow { from{width:0%} }

  .row-card {
    transition: transform .14s ease, box-shadow .14s ease, border-color .14s ease;
    cursor:default;
  }
  .row-card:hover {
    transform: translateX(7px) scale(1.012) !important;
    border-color: rgba(0,191,255,.6) !important;
    box-shadow: 0 0 28px rgba(0,191,255,.18), inset 0 0 20px rgba(0,191,255,.04) !important;
  }
  .pcrd { transition:filter .2s, transform .22s; }
  .pcrd:hover { filter:brightness(1.1)!important; transform:translateY(-3px) scale(1.02)!important; }
  button { outline:none; cursor:pointer; border:none; }
  ::-webkit-scrollbar { display:none; }
`;

/* ── Background streaks & rings (static arrays) ─────── */
const STREAKS = Array.from({length:16},(_,i)=>({
  id:i, y:5+Math.random()*90,
  w:50+Math.random()*110,
  delay:Math.random()*8, dur:1.5+Math.random()*3,
  color:i%4===0?"#FFD700":i%3===0?"#A855F7":"#00BFFF",
}));
const RINGS = Array.from({length:7},(_,i)=>({
  id:i, x:5+Math.random()*90, y:5+Math.random()*90,
  size:10+Math.random()*18, delay:Math.random()*6, dur:2+Math.random()*3,
}));

const SpeedStreak=({s})=>(
  <div style={{position:"absolute",top:`${s.y}%`,right:0,height:2,width:s.w,
    background:`linear-gradient(90deg,transparent,${s.color}77,${s.color},transparent)`,
    borderRadius:2,animation:`speedLines ${s.dur}s ${s.delay}s infinite ease-in`,
    opacity:0,pointerEvents:"none"}}/>
);
const FloatingRing=({r})=>(
  <div style={{position:"absolute",left:`${r.x}%`,top:`${r.y}%`,
    width:r.size,height:r.size,borderRadius:"50%",
    border:"2px solid rgba(255,215,0,.15)",
    boxShadow:"0 0 6px rgba(255,215,0,.08)",
    animation:`floatBob ${r.dur}s ${r.delay}s ease-in-out infinite`,
    pointerEvents:"none"}}/>
);

/* ── Responsive sizes hook ───────────────────────────── */
function useSizes(){
  const[sz,setSz]=useState({w:window.innerWidth,h:window.innerHeight});
  useEffect(()=>{
    const fn=()=>setSz({w:window.innerWidth,h:window.innerHeight});
    window.addEventListener("resize",fn);
    return()=>window.removeEventListener("resize",fn);
  },[]);
  const{w,h}=sz;
  const sm=w<600, md=w<900;
  // podium avatar
  const avP = sm ? Math.min(54,w*.13) : md ? Math.min(66,w*.09) : Math.min(80,Math.min(w*.075,h*.1));
  const ringP = avP+30;
  // podium text
  const nmP  = sm?13:md?15:Math.min(18,h*.024);  // name font
  const pctP = sm?18:md?22:Math.min(26,h*.034);  // pct font
  const badgeP = sm?10:md?12:Math.min(14,h*.018); // badge font
  const barHP = sm?4:md?5:6;
  // row sizing
  const avR  = sm?30:md?36:Math.min(42,h*.054);
  const nmR  = sm?10:md?12:Math.min(14,h*.018);   // name font
  const pctR = sm?14:md?17:Math.min(20,h*.026);
  const rowPy= sm?3:md?4:Math.min(6,h*.007);
  const rankSz=sm?26:md?30:Math.min(34,h*.046);
  const barHR= sm?5:md?6:7;
  const tabFsz=sm?9:md?10:Math.min(12,h*.016);
  // gaps
  const podGap=sm?6:md?8:12;
  const secGap=sm?4:md?5:8;
  const outerPx=sm?8:md?12:20;
  const outerPy=sm?6:md?8:10;
  const hdrMb =sm?4:md?5:8;
  const tabMb =sm?5:md?7:10;
  const podMb =sm?5:md?7:10;
  return{sm,md,avP,ringP,nmP,pctP,badgeP,barHP,avR,nmR,pctR,rowPy,rankSz,barHR,tabFsz,
    podGap,secGap,outerPx,outerPy,hdrMb,tabMb,podMb};
}

/* ── Speed Avatar (circular, rotating rings) ─────────── */
function SpeedAvatar({url,name,size,rank=0,floatAnim}){
  const ini=(name||"??").slice(0,2).toUpperCase();
  const C={
    1:{ring:"#FFD700",glow:"#FFB300",r2:"#FF6B00"},
    2:{ring:"#00BFFF",glow:"#0080FF",r2:"#A855F7"},
    3:{ring:"#A855F7",glow:"#7B00FF",r2:"#FF00FF"},
  }[rank]||{ring:"#00BFFF",glow:"#0080FF",r2:"#A855F7"};
  const bw=rank===1?3:2;
  return(
    <div style={{position:"relative",width:size+26,height:size+26,
      display:"flex",alignItems:"center",justifyContent:"center",
      flexShrink:0,animation:floatAnim||"none"}}>
      {/* outer dashed ring */}
      <div style={{position:"absolute",inset:-4,borderRadius:"50%",
        border:`2px dashed ${C.ring}44`,animation:"ringCW 9s linear infinite"}}/>
      {/* conic ring */}
      <div style={{position:"absolute",inset:-1,borderRadius:"50%",
        border:`${bw}px solid transparent`,
        background:`conic-gradient(${C.ring},${C.r2},transparent 50%,${C.ring})`,
        WebkitMask:"linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0)",
        WebkitMaskComposite:"xor",maskComposite:"exclude",
        animation:"ringCCW 3.5s linear infinite"}}/>
      {/* glow halo */}
      <div style={{position:"absolute",inset:-12,borderRadius:"50%",
        background:`radial-gradient(circle,${C.glow}1E 0%,transparent 70%)`,
        animation:"glowP 2.2s ease-in-out infinite"}}/>
      {/* photo */}
      <div style={{width:size,height:size,borderRadius:"50%",overflow:"hidden",
        position:"relative",zIndex:1,
        border:`${bw}px solid ${C.ring}`,
        boxShadow:rank===1?`0 0 0 3px ${C.ring}33,0 0 24px ${C.glow}77`
          :`0 0 0 2px ${C.ring}22,0 0 14px ${C.glow}44`,
        background:`radial-gradient(circle at 35% 35%,${C.glow}1A,#000)`}}>
        {url?(
          <img src={url} alt={name}
            style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
        ):(
          <div style={{width:"100%",height:"100%",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontFamily:"'Russo One',sans-serif",fontSize:size*.28,
            color:C.ring,textShadow:`0 0 14px ${C.glow}`,letterSpacing:2}}>
            {ini}
          </div>
        )}
      </div>
      {/* #1 orbit sparks */}
      {rank===1&&[0,72,144,216,288].map(deg=>(
        <div key={deg} style={{position:"absolute",width:4,height:4,
          borderRadius:"50%",background:C.ring,boxShadow:`0 0 6px ${C.glow}`,
          top:"50%",left:"50%",
          transform:`rotate(${deg}deg) translateX(${size/2+14}px)`,
          animation:`glowP ${.8+deg/360}s ease-in-out infinite`}}/>
      ))}
    </div>
  );
}

/* ── Podium Card ─────────────────────────────────────── */
const PCFG=[
  {color:"#FFD700",glow:"#FFB300",glow2:"#FF6B00",
   textGrad:"linear-gradient(180deg,#FFD700,#FF8C00)",
   label:"🏆 1º LUGAR",bg:"linear-gradient(160deg,#1A1000,#0D0800,#050300)",
   border:"#FFD700",delay:0,order:2,emoji:"⚡",
   floatA:"floatBob1 3s ease-in-out infinite"},
  {color:"#00BFFF",glow:"#0080FF",glow2:"#A855F7",
   textGrad:"linear-gradient(180deg,#00BFFF,#0055FF)",
   label:"🥈 2º LUGAR",bg:"linear-gradient(160deg,#000D1A,#00060D,#000)",
   border:"#00BFFF",delay:.15,order:1,emoji:"💨",
   floatA:"floatBob2 3.4s ease-in-out infinite"},
  {color:"#A855F7",glow:"#7B00FF",glow2:"#FF00FF",
   textGrad:"linear-gradient(180deg,#A855F7,#7B00FF)",
   label:"🥉 3º LUGAR",bg:"linear-gradient(160deg,#0A0010,#050008,#000)",
   border:"#A855F7",delay:.3,order:3,emoji:"💜",
   floatA:"floatBob3 3.8s .3s ease-in-out infinite"},
];

function PodiumCard({turma,rankIdx,show,avSize,nmFsz,pctFsz,badgeFsz,barH}){
  const c=PCFG[rankIdx];
  const pad=badgeFsz*.7;
  return(
    <div className="pcrd" style={{
      order:c.order,display:"flex",flexDirection:"column",alignItems:"center",
      flex:"1 1 0",minWidth:0,
      maxWidth:rankIdx===0?"clamp(145px,22vw,210px)":"clamp(125px,19vw,185px)",
      opacity:show?1:0,
      transform:show?"translateY(0) scale(1)":"translateY(-55px) scale(0.82)",
      transition:`opacity .65s ease ${c.delay}s,transform .65s cubic-bezier(.34,1.28,.64,1) ${c.delay}s`,
    }}>
      {/* Badge */}
      <div style={{
        fontFamily:"'Orbitron',sans-serif",fontWeight:900,fontSize:badgeFsz,
        color:"#000",background:c.textGrad,
        padding:`${pad*.75}px ${pad*2}px`,
        borderRadius:3,letterSpacing:2,marginBottom:pad*.7,
        boxShadow:`0 0 14px ${c.glow}77`,
        clipPath:"polygon(7px 0,100% 0,calc(100% - 7px) 100%,0 100%)",
        textAlign:"center",whiteSpace:"nowrap",
      }}>{c.label}</div>

      {/* Card */}
      <div style={{
        width:"100%",background:c.bg,
        border:`2px solid ${c.border}44`,borderRadius:10,
        padding:`${pad*.9}px ${pad*.8}px`,
        display:"flex",flexDirection:"column",alignItems:"center",
        position:"relative",overflow:"hidden",
        boxShadow:rankIdx===0
          ? `0 0 0 1px ${c.border}18,0 0 36px ${c.glow}44,inset 0 0 24px ${c.glow}0E`
          : `0 0 0 1px ${c.border}14,0 0 18px ${c.glow}33,inset 0 0 16px ${c.glow}08`,
        animation:rankIdx===0?"sonicPulse 2.6s ease-in-out infinite":"none",
      }}>
        {/* energy shimmer */}
        <div style={{position:"absolute",inset:0,
          background:`linear-gradient(105deg,transparent 30%,${c.border}07 50%,transparent 70%)`,
          backgroundSize:"200% 100%",animation:"energyFlow 3s linear infinite",
          pointerEvents:"none"}}/>

        <SpeedAvatar url={turma.foto_url} name={turma.nome_fantasia}
          size={avSize} rank={rankIdx+1} floatAnim={c.floatA}/>

        {/* name */}
        <div style={{
          fontFamily:"'Russo One',sans-serif",fontSize:nmFsz,
          letterSpacing:rankIdx===0?2:1.5,textAlign:"center",
          marginTop:pad*.7,marginBottom:pad*.5,lineHeight:1.15,
          background:c.textGrad,WebkitBackgroundClip:"text",
          WebkitTextFillColor:"transparent",
          filter:`drop-shadow(0 0 6px ${c.glow}66)`,
          wordBreak:"break-word",maxWidth:"100%",
        }}>{turma.nome_fantasia}</div>

        {/* pct */}
        <div style={{
          fontFamily:"'Orbitron',sans-serif",fontWeight:900,fontSize:pctFsz,
          color:c.color,textShadow:`0 0 16px ${c.glow}`,
          letterSpacing:2,lineHeight:1,marginBottom:pad*.55,
        }}>
          {parseFloat(turma.porcentagem_presenca).toFixed(2)}
          <span style={{fontSize:".45em",opacity:.7,letterSpacing:1}}>%</span>
        </div>

        {/* mini bar */}
        <div style={{width:"88%",height:barH,
          background:"rgba(255,255,255,.05)",borderRadius:10,overflow:"hidden",
          border:`1px solid ${c.border}22`}}>
          <div style={{height:"100%",
            width:`${Math.min(parseFloat(turma.porcentagem_presenca)||0,100)}%`,
            background:`linear-gradient(90deg,${c.glow2},${c.color})`,
            boxShadow:`0 0 7px ${c.glow}`,borderRadius:10,
            animation:`pctBar 1.5s cubic-bezier(.16,1,.3,1) ${c.delay+.4}s both`}}/>
        </div>

        {/* emoji accent */}
        <div style={{position:"absolute",top:6,right:8,
          fontSize:nmFsz*.8,opacity:.45,
          animation:"floatBob 2.2s ease-in-out infinite"}}>{c.emoji}</div>
      </div>
    </div>
  );
}

/* ── Speed Row ───────────────────────────────────────── */
function SpeedRow({turma,rank,pct,show,delay,avSz,nmFsz,pctFsz,rowPy,rankSz,barH}){
  const isT3=rank<=3,isT5=rank<=5;
  const col=isT3?["#FFD700","#00BFFF","#A855F7"][rank-1]:isT5?"#00FFB3":"rgba(0,191,255,.6)";
  const glow=isT3?["#FFB300","#0080FF","#7B00FF"][rank-1]:isT5?"#00CC8F":"#00BFFF";
  const dir=rank%2===0?"slideInR":"slideInL";
  const pctNum=parseFloat(pct)||0;
  return(
    <div className="row-card" style={{
      display:"flex",alignItems:"center",gap:"clamp(6px,1.2vw,12px)",
      padding:`${rowPy}px clamp(8px,2vw,16px) ${rowPy}px clamp(6px,1.5vw,10px)`,
      background:isT3
        ?[
          "linear-gradient(90deg,rgba(255,215,0,.07),rgba(255,180,0,.04),transparent)",
          "linear-gradient(90deg,rgba(0,191,255,.08),rgba(0,128,255,.04),transparent)",
          "linear-gradient(90deg,rgba(168,85,247,.08),rgba(123,0,255,.04),transparent)",
        ][rank-1]
        :"linear-gradient(90deg,rgba(0,50,80,.3),rgba(0,20,40,.15),transparent)",
      border:`1px solid ${col}22`,borderLeft:`4px solid ${col}`,
      borderRadius:"0 8px 8px 0",marginBottom:3,
      position:"relative",overflow:"hidden",
      opacity:show?1:0,
      transform:show?"translateX(0)":(dir==="slideInL"?"translateX(-70px)":"translateX(70px)"),
      transition:`opacity .42s ease ${delay}s,transform .42s cubic-bezier(.34,1.2,.64,1) ${delay}s`,
    }}>
      {/* Rank circle */}
      <div style={{
        width:rankSz,height:rankSz,flexShrink:0,
        display:"flex",alignItems:"center",justifyContent:"center",
        background:isT3?`radial-gradient(circle,${glow}2A,${col}0E)`:"rgba(0,191,255,.05)",
        borderRadius:"50%",
        border:`2px solid ${col}${isT3?"77":"22"}`,
        boxShadow:isT3?`0 0 12px ${glow}55`:"none",
      }}>
        <span style={{fontFamily:"'Orbitron',sans-serif",fontWeight:900,
          fontSize:rank<=9?nmFsz*.95:nmFsz*.8,color:col,
          textShadow:isT3?`0 0 8px ${glow}`:"none"}}>{rank}</span>
      </div>

      {/* Avatar */}
      <div style={{width:avSz,height:avSz,borderRadius:"50%",flexShrink:0,
        overflow:"hidden",border:`2px solid ${col}55`,
        boxShadow:`0 0 10px ${glow}33`,
        background:`radial-gradient(circle at 35% 35%,${glow}1A,#000)`}}>
        {turma.foto_url?(
          <img src={turma.foto_url} alt={turma.nome_fantasia}
            style={{width:"100%",height:"100%",objectFit:"cover"}}/>
        ):(
          <div style={{width:"100%",height:"100%",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontFamily:"'Russo One',sans-serif",fontSize:avSz*.28,
            color:col,textShadow:`0 0 7px ${glow}`}}>
            {turma.nome_fantasia?.slice(0,2).toUpperCase()}
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{flex:1,minWidth:0}}>
        <div style={{
          fontFamily:"'Russo One',sans-serif",fontSize:nmFsz,
          letterSpacing:isT3?1.5:1,
          color:isT3?col:"rgba(255,255,255,.82)",
          textShadow:isT3?`0 0 8px ${glow}55`:"none",
          whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",
          marginBottom:3,lineHeight:1,
        }}>{turma.nome_fantasia}</div>
        {/* energy bar */}
        <div style={{height:barH,background:"rgba(0,0,0,.5)",borderRadius:8,
          overflow:"hidden",border:`1px solid ${col}14`,position:"relative"}}>
          <div style={{height:"100%",
            width:show?`${Math.min(pctNum,100)}%`:"0%",
            background:isT3
              ?`linear-gradient(90deg,${glow}77,${col})`
              :`linear-gradient(90deg,rgba(0,80,130,.7),rgba(0,191,255,.8))`,
            boxShadow:`0 0 7px ${glow}`,borderRadius:8,
            transition:`width 1.5s cubic-bezier(.16,1,.3,1) ${delay+.22}s`,
            position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,left:"-50%",bottom:0,width:"40%",
              background:"linear-gradient(90deg,transparent,rgba(255,255,255,.25),transparent)",
              animation:"energyFlow 2s linear infinite"}}/>
          </div>
        </div>
        <div style={{fontFamily:"'Exo 2',sans-serif",fontSize:nmFsz*.7,fontWeight:300,
          color:"rgba(0,191,255,.22)",letterSpacing:2,marginTop:2}}>{turma.nome}</div>
      </div>

      {/* Pct */}
      <div style={{
        fontFamily:"'Orbitron',sans-serif",fontWeight:700,fontSize:pctFsz,
        color:isT3?col:"rgba(0,191,255,.65)",
        textShadow:isT3?`0 0 10px ${glow}`:"none",
        flexShrink:0,lineHeight:1,
        minWidth:pctFsz*2.6,textAlign:"right",
      }}>
        {pctNum.toFixed(2)}
        <span style={{fontFamily:"'Exo 2',sans-serif",fontSize:nmFsz*.65,
          fontWeight:500,color:"rgba(255,255,255,.28)",marginLeft:1}}>%</span>
      </div>
    </div>
  );
}

/* ── Tab Button ──────────────────────────────────────── */
function SpeedTab({label,active,onClick,pct,fontSize}){
  return(
    <button onClick={onClick} style={{
      fontFamily:"'Orbitron',sans-serif",fontWeight:700,
      fontSize,letterSpacing:2,
      padding:`${fontSize*.8}px ${fontSize*2.2}px`,
      border:`2px solid ${active?"#00BFFF":"rgba(0,191,255,.18)"}`,
      background:active
        ?"linear-gradient(135deg,rgba(0,80,160,.6),rgba(0,191,255,.14),rgba(0,0,0,.4))"
        :"rgba(0,10,20,.6)",
      color:active?"#00BFFF":"rgba(0,191,255,.28)",
      textShadow:active?"0 0 12px #00BFFF":"none",
      boxShadow:active?"0 0 22px rgba(0,128,255,.35),inset 0 0 10px rgba(0,191,255,.06)":"none",
      borderRadius:5,position:"relative",overflow:"hidden",
      transition:"all .28s ease",
    }}>
      {label}
      {active&&(
        <div style={{position:"absolute",bottom:0,left:0,height:3,
          background:"linear-gradient(90deg,#00BFFF,#A855F7,#FFD700)",
          boxShadow:"0 0 7px #00BFFF",
          width:`${pct}%`,transition:"width .15s linear"}}/>
      )}
    </button>
  );
}

/* ── Divider ─────────────────────────────────────────── */
const Divider=()=>(
  <div style={{position:"relative",height:14,overflow:"hidden",flexShrink:0}}>
    <div style={{position:"absolute",top:"50%",left:0,right:0,height:1,
      background:"linear-gradient(90deg,transparent,#00BFFF88,#A855F7,#00BFFF88,transparent)"}}/>
    <div style={{position:"absolute",top:"50%",left:"50%",width:7,height:7,
      transform:"translate(-50%,-50%) rotate(45deg)",
      background:"#00BFFF",boxShadow:"0 0 10px #00BFFF"}}/>
    {[-38,-19,19,38].map(o=>(
      <div key={o} style={{position:"absolute",top:"50%",
        left:`calc(50% + ${o}px)`,width:3,height:3,
        transform:"translate(-50%,-50%) rotate(45deg)",
        background:"rgba(0,191,255,.35)"}}/>
    ))}
    <div style={{position:"absolute",top:0,bottom:0,width:"18%",
      background:"linear-gradient(90deg,transparent,rgba(0,191,255,.28),transparent)",
      animation:"energyFlow 2s linear infinite"}}/>
  </div>
);

/* ── Main ────────────────────────────────────────────── */
const TAB_MS=11000;

export default function ClassRanking(){
  const[tab,setTab]=useState("semanal");
  const[show,setShow]=useState(false);
  const[transit,setTransit]=useState(false);
  const[cd,setCd]=useState(100);
  const[loading,setLoading]=useState(true);
  const[error,setError]=useState(null);
  const[dataMap,setDataMap]=useState({semanal:[],mensal:[]});
  const cdRef=useRef(100),cdInter=useRef(null),tabRef=useRef("semanal"),autoRef=useRef(null);
  const S=useSizes();

  const fetchAll=async()=>{
    setLoading(true);setError(null);
    try{
      const[rS,rM]=await Promise.all([
        apiFetch("/ranking?tipo=semanal"),apiFetch("/ranking?tipo=mensal"),
      ]);
      if(!rS.ok||!rM.ok)throw new Error("Erro HTTP");
      const[dS,dM]=await Promise.all([rS.json(),rM.json()]);
      const sort=a=>[...a].sort((x,y)=>parseFloat(y.porcentagem_presenca)-parseFloat(x.porcentagem_presenca));
      setDataMap({semanal:sort(dS),mensal:sort(dM)});
    }catch(e){setError(e.message||"Falha na conexão.");}
    finally{setLoading(false);}
  };

  useEffect(()=>{fetchAll();},[]);
  useEffect(()=>{
    if(loading||error)return;
    setTimeout(()=>setShow(true),280);
    resetCd();
    autoRef.current=setInterval(()=>{
      doSwitch(tabRef.current==="semanal"?"mensal":"semanal");
    },TAB_MS);
    return()=>{clearInterval(autoRef.current);clearInterval(cdInter.current);};
  },[loading,error]);

  const resetCd=()=>{
    clearInterval(cdInter.current);
    cdRef.current=100;setCd(100);
    const step=100/(TAB_MS/150);
    cdInter.current=setInterval(()=>{
      cdRef.current-=step;
      if(cdRef.current<=0){cdRef.current=100;setCd(100);}
      else setCd(cdRef.current);
    },150);
  };

  const doSwitch=(next)=>{
    if(transit)return;
    setTransit(true);setShow(false);
    setTimeout(()=>{tabRef.current=next;setTab(next);setTransit(false);setShow(true);resetCd();},400);
  };

  const sorted=dataMap[tab]||[];
  const top=sorted[0];

  return(
    <>
      <style>{STYLES}</style>
      <div style={{
        width:"100vw",height:"100vh",overflow:"hidden",
        background:"radial-gradient(ellipse 120% 60% at 50% -5%,#001A3A 0%,#000D1F 40%,#000508 75%,#000 100%)",
        display:"flex",flexDirection:"column",position:"relative",
      }}>
        {/* BG grid */}
        <div style={{position:"absolute",inset:0,pointerEvents:"none",
          backgroundImage:"linear-gradient(rgba(0,191,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,191,255,.025) 1px,transparent 1px)",
          backgroundSize:"55px 55px"}}/>
        {/* Glow spots */}
        <div style={{position:"absolute",bottom:-50,left:"5%",right:"5%",height:110,
          background:"radial-gradient(ellipse,rgba(0,128,255,.13),transparent 70%)",
          filter:"blur(18px)",pointerEvents:"none"}}/>
        <div style={{position:"absolute",top:-30,left:"15%",right:"15%",height:70,
          background:"radial-gradient(ellipse,rgba(0,191,255,.1),transparent 70%)",
          filter:"blur(14px)",pointerEvents:"none"}}/>
        {STREAKS.map(s=><SpeedStreak key={s.id} s={s}/>)}
        {RINGS.map(r=><FloatingRing key={r.id} r={r}/>)}
        {/* Scan beam */}
        <div style={{position:"absolute",left:0,right:0,height:2,
          background:"linear-gradient(90deg,transparent,rgba(0,191,255,.35),rgba(168,85,247,.25),transparent)",
          animation:"scanLine 5s linear infinite",pointerEvents:"none",zIndex:10}}/>
        {/* Scanlines */}
        <div style={{position:"absolute",inset:0,pointerEvents:"none",
          background:"repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,.05) 3px,rgba(0,0,0,.05) 4px)",
          zIndex:2}}/>
        {/* Vignette */}
        <div style={{position:"absolute",inset:0,pointerEvents:"none",
          background:"radial-gradient(ellipse 92% 92% at 50% 50%,transparent 38%,rgba(0,0,20,.6) 100%)",
          zIndex:2}}/>
        {/* Corner decorations */}
        {[{top:10,left:10,bt:"2px solid #00BFFF",bl:"2px solid #00BFFF"},
          {top:10,right:10,bt:"2px solid #00BFFF",br:"2px solid #00BFFF"},
          {bottom:10,left:10,bb:"2px solid #A855F7",bl:"2px solid #A855F7"},
          {bottom:10,right:10,bb:"2px solid #A855F7",br:"2px solid #A855F7"},
        ].map(({bt,bl,br,bb,...pos},i)=>(
          <div key={i} style={{position:"absolute",...pos,width:32,height:32,
            borderTop:bt,borderLeft:bl,borderRight:br,borderBottom:bb,
            opacity:.55,animation:"glowP 3s ease-in-out infinite",
            animationDelay:`${i*.5}s`,pointerEvents:"none",zIndex:20}}/>
        ))}

        {/* LOADING */}
        {loading&&(
          <div style={{position:"absolute",inset:0,zIndex:50,background:"#000",
            display:"flex",flexDirection:"column",
            alignItems:"center",justifyContent:"center",gap:20}}>
            <div style={{position:"relative",width:80,height:80}}>
              {[
                {inset:0,brd:"3px solid transparent",bt:"3px solid #FFD700",br:"3px solid #FFD700",dur:".8s"},
                {inset:10,brd:"3px solid transparent",bb:"3px solid #00BFFF",dur:"1.2s",dir:"ringCCW"},
                {inset:22,brd:"2px solid transparent",bt:"2px solid #A855F7",dur:"1.8s"},
              ].map((r,i)=>(
                <div key={i} style={{position:"absolute",inset:r.inset,borderRadius:"50%",
                  border:r.brd,borderTop:r.bt,borderRight:r.br,borderBottom:r.bb,
                  animation:`${r.dir||"ringCW"} ${r.dur} linear infinite`}}/>
              ))}
            </div>
            <div style={{fontFamily:"'Russo One',sans-serif",
              fontSize:"clamp(28px,5.5vw,56px)",
              background:"linear-gradient(90deg,#FFD700,#00BFFF,#A855F7,#00BFFF,#FFD700)",
              backgroundSize:"300% 100%",WebkitBackgroundClip:"text",
              WebkitTextFillColor:"transparent",
              animation:"energyFlow 2s linear infinite",letterSpacing:8}}>CLASSPULSE</div>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:"clamp(8px,1.5vw,11px)",
              color:"rgba(0,191,255,.45)",letterSpacing:7,fontWeight:700}}>TURBO LOADING...</div>
            <div style={{width:"min(210px,70vw)",height:5,borderRadius:8,
              background:"rgba(0,191,255,.08)",border:"1px solid rgba(0,191,255,.2)",overflow:"hidden"}}>
              <div style={{height:"100%",width:"70%",borderRadius:8,
                background:"linear-gradient(90deg,#0080FF,#00BFFF,#A855F7)",
                boxShadow:"0 0 10px #00BFFF",animation:"glowP .9s ease-in-out infinite"}}/>
            </div>
          </div>
        )}

        {/* ERROR */}
        {!loading&&error&&(
          <div style={{position:"absolute",inset:0,zIndex:50,
            background:"rgba(0,0,10,.97)",
            display:"flex",flexDirection:"column",
            alignItems:"center",justifyContent:"center",gap:18}}>
            <div style={{fontFamily:"'Russo One',sans-serif",
              fontSize:"clamp(38px,7vw,70px)",
              background:"linear-gradient(180deg,#FF4444,#FF0000)",
              WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
              letterSpacing:5,filter:"drop-shadow(0 0 20px #FF000077)"}}>GAME OVER</div>
            <div style={{fontFamily:"'Exo 2',sans-serif",fontSize:"clamp(11px,2vw,14px)",
              color:"rgba(255,80,80,.5)",letterSpacing:3,fontWeight:500}}>{error}</div>
            <button onClick={fetchAll} style={{fontFamily:"'Orbitron',sans-serif",
              fontWeight:700,fontSize:"clamp(10px,2vw,13px)",letterSpacing:3,
              padding:"11px 28px",border:"2px solid #00BFFF",
              background:"rgba(0,80,160,.3)",color:"#00BFFF",
              textShadow:"0 0 10px #00BFFF",boxShadow:"0 0 20px rgba(0,128,255,.35)",
              borderRadius:5}}>⚡ RETRY</button>
          </div>
        )}

        {/* MAIN — exact 100vh, no scroll */}
        {!loading&&!error&&(
          <div style={{
            flex:1,display:"flex",flexDirection:"column",
            padding:`${S.outerPy}px ${S.outerPx}px ${S.outerPy}px`,
            width:"100%",maxWidth:980,margin:"0 auto",
            position:"relative",zIndex:10,
            minHeight:0,overflow:"hidden",
          }}>
            {/* HEADER */}
            <div style={{textAlign:"center",marginBottom:S.hdrMb,flexShrink:0}}>
              <div style={{fontFamily:"'Exo 2',sans-serif",
                fontSize:"clamp(8px,1.3vw,11px)",fontWeight:700,
                color:"rgba(0,191,255,.32)",letterSpacing:"clamp(5px,1.5vw,10px)",marginBottom:2}}>
                ◈ SPEED CHAMPIONSHIP ◈
              </div>
              <h1 style={{fontFamily:"'Russo One',sans-serif",
                fontSize:"clamp(16px,3.5vw,36px)",
                background:"linear-gradient(90deg,#00BFFF,#FFD700,#A855F7,#00BFFF)",
                backgroundSize:"300% 100%",WebkitBackgroundClip:"text",
                WebkitTextFillColor:"transparent",
                animation:"energyFlow 4s linear infinite,neonFlicker 10s ease-in-out infinite",
                letterSpacing:"clamp(3px,1vw,6px)",lineHeight:1,userSelect:"none",
              }}>⚡ RANKING DAS TURMAS ⚡</h1>
              <div style={{fontFamily:"'Orbitron',sans-serif",
                fontSize:"clamp(7px,1.2vw,10px)",fontWeight:700,
                color:"rgba(0,191,255,.28)",letterSpacing:"clamp(3px,1vw,6px)",marginTop:3}}>
                {tab==="semanal"?"— CORRIDA SEMANAL —":"— TORNEIO MENSAL —"}
              </div>
            </div>

            {/* TABS */}
            <div style={{display:"flex",justifyContent:"center",
              gap:S.podGap,marginBottom:S.tabMb,flexShrink:0}}>
              <SpeedTab label="⚡ SEMANAL" active={tab==="semanal"} onClick={()=>doSwitch("semanal")} pct={tab==="semanal"?cd:100} fontSize={S.tabFsz}/>
              <SpeedTab label="🌀 MENSAL"  active={tab==="mensal"}  onClick={()=>doSwitch("mensal")}  pct={tab==="mensal"?cd:100}  fontSize={S.tabFsz}/>
            </div>

            {/* PODIUM */}
            <div style={{
              display:"flex",justifyContent:"center",alignItems:"flex-start",
              gap:S.podGap,marginBottom:S.podMb,flexShrink:0,
              opacity:transit?0:1,transform:transit?"scale(.92)":"scale(1)",
              transition:"opacity .35s,transform .35s",
            }}>
              {[{d:sorted[1],r:1},{d:sorted[0],r:0},{d:sorted[2],r:2}].map(
                ({d,r})=>d?(
                  <PodiumCard key={d.turma_id} turma={d} rankIdx={r} show={show&&!transit}
                    avSize={r===0?S.avP:S.avP*.87}
                    nmFsz={r===0?S.nmP:S.nmP*.88}
                    pctFsz={r===0?S.pctP:S.pctP*.84}
                    badgeFsz={r===0?S.badgeP:S.badgeP*.88}
                    barH={S.barHP}/>
                ):null
              )}
            </div>

            {/* DIVIDER */}
            <div style={{marginBottom:S.secGap,flexShrink:0}}><Divider/></div>

            {/* LIST — fills remaining space */}
            <div style={{flex:1,overflow:"hidden",minHeight:0,
              opacity:transit?0:1,transition:"opacity .35s",
              display:"flex",flexDirection:"column"}}>
              {sorted.map((t,i)=>(
                <SpeedRow key={t.turma_id} turma={t} rank={i+1}
                  pct={t.porcentagem_presenca}
                  show={show&&!transit} delay={.04*i}
                  avSz={S.avR} nmFsz={S.nmR} pctFsz={S.pctR}
                  rowPy={S.rowPy} rankSz={S.rankSz} barH={S.barHR}/>
              ))}
            </div>

            {/* FOOTER */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
              paddingTop:S.secGap,marginTop:S.secGap*.5,flexShrink:0,
              borderTop:"1px solid rgba(0,191,255,.1)"}}>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <div style={{width:7,height:7,borderRadius:"50%",
                  background:"#00BFFF",boxShadow:"0 0 7px #00BFFF",
                  animation:"liveBlip 1.2s ease-in-out infinite"}}/>
                <span style={{fontFamily:"'Orbitron',sans-serif",
                  fontSize:"clamp(6px,1.1vw,9px)",fontWeight:700,
                  color:"rgba(0,191,255,.45)",letterSpacing:2}}>AO VIVO</span>
              </div>
              <div style={{fontFamily:"'Russo One',sans-serif",
                fontSize:"clamp(10px,1.8vw,13px)",
                background:"linear-gradient(90deg,#FFD700,#00BFFF)",
                WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
                letterSpacing:2,filter:"drop-shadow(0 0 4px #FFD70044)",
                textAlign:"center"}}>
                {top?.nome_fantasia} • {parseFloat(top?.porcentagem_presenca||0).toFixed(2)}%
              </div>
              <div style={{fontFamily:"'Orbitron',sans-serif",
                fontSize:"clamp(6px,1.1vw,9px)",fontWeight:700,
                color:"rgba(0,191,255,.2)",letterSpacing:3}}>CLASSPULSE</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
