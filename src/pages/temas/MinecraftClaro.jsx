import { useState, useEffect, useRef, useCallback } from "react";
import { apiFetch } from "../../services/Api";

/* ═══════════════════════════════════════════════════════════════
   CLASSPULSE — MINECRAFT RANKING  v3
   Pixel Art · Tight Responsive · All Screen Sizes
   ═══════════════════════════════════════════════════════════════ */

const MC = {
  sky1:"#6AAFE6", sky2:"#9ACFEE", skyBot:"#C8EAFF",
  grass:"#5AA832", grassLt:"#78D44A", dirt:"#9B6B3C", dirtDk:"#7A5025",
  stone:"#7A7A7A", stoneDk:"#5E5E5E",
  diamond:"#29C8C8", diamondLt:"#7FFFFF",
  emerald:"#16C95A", emeraldLt:"#60FF99",
  gold:"#F5C400", goldLt:"#FFE566",
  obsidian:"#2C1654",
  xp:"#73C220", xpLt:"#B8FF44",
  enchant:"#8A2BE2", enchantLt:"#DA70FF",
  red:"#E03030",
};

/* ── SVG textures ──────────────────────────────────────── */
const mkSvg=(fill,s)=>`<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'><rect width='16' height='16' fill='${fill}'/>${s}</svg>`;
const SVGS={
  grass:mkSvg(MC.grass,`<rect x='0' y='0' width='16' height='5' fill='${MC.grassLt}' opacity='.55'/><rect x='2' y='6' width='2' height='2' fill='#000' opacity='.12'/><rect x='10' y='9' width='3' height='2' fill='#fff' opacity='.08'/>`),
  dirt:mkSvg(MC.dirt,`<rect x='1' y='1' width='3' height='3' fill='#000' opacity='.17'/><rect x='8' y='3' width='2' height='2' fill='#fff' opacity='.1'/><rect x='5' y='9' width='3' height='2' fill='#000' opacity='.14'/><rect x='11' y='11' width='3' height='3' fill='#000' opacity='.16'/>`),
  stone:mkSvg(MC.stone,`<rect x='0' y='0' width='4' height='3' fill='#000' opacity='.18'/><rect x='7' y='1' width='2' height='4' fill='#fff' opacity='.14'/><rect x='12' y='4' width='3' height='2' fill='#000' opacity='.16'/><rect x='2' y='8' width='4' height='3' fill='#000' opacity='.13'/><rect x='9' y='9' width='2' height='3' fill='#fff' opacity='.1'/>`),
  diamond:mkSvg("#1AAFAF",`<rect x='2' y='2' width='3' height='2' fill='${MC.diamondLt}' opacity='.5'/><rect x='9' y='0' width='2' height='3' fill='#000' opacity='.18'/><rect x='4' y='7' width='2' height='4' fill='${MC.diamondLt}' opacity='.45'/><rect x='6' y='5' width='2' height='2' fill='#fff' opacity='.5'/>`),
  gold:mkSvg("#D4A800",`<rect x='1' y='1' width='3' height='2' fill='${MC.goldLt}' opacity='.55'/><rect x='8' y='0' width='2' height='3' fill='#000' opacity='.16'/><rect x='3' y='8' width='3' height='3' fill='${MC.goldLt}' opacity='.45'/><rect x='6' y='5' width='2' height='2' fill='#fff' opacity='.45'/>`),
  emerald:mkSvg("#119E45",`<rect x='2' y='2' width='2' height='3' fill='${MC.emeraldLt}' opacity='.5'/><rect x='9' y='0' width='2' height='2' fill='#000' opacity='.16'/><rect x='4' y='8' width='3' height='3' fill='${MC.emeraldLt}' opacity='.45'/><rect x='6' y='5' width='2' height='2' fill='#fff' opacity='.45'/>`),
  obsidian:mkSvg(MC.obsidian,`<rect x='1' y='1' width='3' height='2' fill='${MC.enchant}' opacity='.22'/><rect x='9' y='3' width='2' height='3' fill='${MC.enchantLt}' opacity='.1'/><rect x='3' y='9' width='3' height='2' fill='${MC.enchant}' opacity='.18'/><rect x='6' y='6' width='3' height='3' fill='${MC.enchant}' opacity='.15'/>`),
};
const toUri=s=>`url("data:image/svg+xml,${encodeURIComponent(s)}")`;
const TX=Object.fromEntries(Object.entries(SVGS).map(([k,v])=>[k,{bg:toUri(v),sz:"32px 32px"}]));
const tx=k=>({backgroundImage:TX[k].bg,backgroundSize:TX[k].sz,imageRendering:"pixelated"});

/* ── Global CSS ────────────────────────────────────────── */
const G=`
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{width:100%;height:100%;overflow:hidden}
::-webkit-scrollbar{width:5px;background:${MC.sky1}}
::-webkit-scrollbar-thumb{background:${MC.grass}}
button{outline:none;cursor:pointer;border:none;font-family:inherit}

@keyframes bobA{0%,100%{transform:translateY(0) rotate(-1.2deg)}50%{transform:translateY(-10px) rotate(1.2deg)}}
@keyframes bobB{0%,100%{transform:translateY(0) rotate(.8deg)}50%{transform:translateY(-8px) rotate(-.8deg)}}
@keyframes bobC{0%,100%{transform:translateY(0) rotate(.5deg)}50%{transform:translateY(-6px) rotate(-.5deg)}}
@keyframes spinCW{from{transform:rotate(0)}to{transform:rotate(360deg)}}
@keyframes spinCCW{from{transform:rotate(360deg)}to{transform:rotate(0)}}
@keyframes cloudDrift{from{transform:translateX(-250px)}to{transform:translateX(110vw)}}
@keyframes pFall{0%{transform:translateY(-20px) rotate(0) scale(1.1);opacity:1}85%{opacity:.6}100%{transform:translateY(105vh) rotate(800deg) scale(.2);opacity:0}}
@keyframes xpGrow{from{width:0}}
@keyframes slideL{from{transform:translateX(-70px);opacity:0;filter:blur(3px)}to{transform:translateX(0);opacity:1;filter:blur(0)}}
@keyframes slideR{from{transform:translateX(70px);opacity:0;filter:blur(3px)}to{transform:translateX(0);opacity:1;filter:blur(0)}}
@keyframes popIn{0%{transform:scale(0) rotate(-15deg);opacity:0}55%{transform:scale(1.1) rotate(2deg)}75%{transform:scale(.95)}100%{transform:scale(1);opacity:1}}
@keyframes glowG{0%,100%{filter:drop-shadow(0 0 6px ${MC.goldLt}) drop-shadow(0 0 14px ${MC.gold})}50%{filter:drop-shadow(0 0 14px ${MC.goldLt}) drop-shadow(0 0 28px ${MC.gold})}}
@keyframes glowD{0%,100%{filter:drop-shadow(0 0 6px ${MC.diamondLt}) drop-shadow(0 0 12px ${MC.diamond})}50%{filter:drop-shadow(0 0 12px ${MC.diamondLt}) drop-shadow(0 0 24px ${MC.diamond})}}
@keyframes glowE{0%,100%{filter:drop-shadow(0 0 5px ${MC.emeraldLt}) drop-shadow(0 0 10px ${MC.emerald})}50%{filter:drop-shadow(0 0 11px ${MC.emeraldLt}) drop-shadow(0 0 22px ${MC.emerald})}}
@keyframes enchScroll{from{background-position:0 0}to{background-position:0 64px}}
@keyframes pxPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
@keyframes titleDrop{0%{transform:translateY(-40px) scaleY(1.25);opacity:0}55%{transform:translateY(4px) scaleY(.96);opacity:1}75%{transform:translateY(-2px)}100%{transform:translateY(0);opacity:1}}
@keyframes liveBlip{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.15;transform:scale(.5)}}
@keyframes rankBnc{0%,100%{transform:translateY(0)}30%{transform:translateY(-4px)}60%{transform:translateY(2px)}}
@keyframes scan{from{top:-2px}to{top:100%}}
@keyframes starPop{0%{transform:scale(.6) rotate(-12deg);opacity:0}60%{transform:scale(1.15) rotate(4deg);opacity:1}100%{transform:scale(1) rotate(0);opacity:1}}

.mc-row{transition:transform .12s steps(3),filter .15s;cursor:default}
.mc-row:hover{transform:translateX(7px)!important;filter:brightness(1.2) saturate(1.15)!important}
.pcrd{transition:filter .2s,transform .22s}
.pcrd:hover{filter:brightness(1.08)!important;transform:translateY(-3px) scale(1.02)!important}
`;

/* ── Particles ─────────────────────────────────────────── */
const PARTS=Array.from({length:22},(_,i)=>{
  const o=[
    {ch:"◆",col:MC.diamond},{ch:"◆",col:MC.emerald},{ch:"◆",col:MC.gold},
    {ch:"✦",col:MC.xpLt},{ch:"▪",col:MC.enchantLt},{ch:"◈",col:MC.goldLt},
  ][i%6];
  return{id:i,...o,x:Math.random()*100,delay:Math.random()*16,dur:10+Math.random()*10,size:8+Math.random()*9};
});
const Particle=({p})=>(
  <div style={{position:"fixed",left:`${p.x}%`,top:"-20px",fontSize:p.size,color:p.col,
    textShadow:`0 0 7px ${p.col}`,
    animation:`pFall ${p.dur}s ${p.delay}s infinite linear`,
    opacity:0,pointerEvents:"none",zIndex:1,imageRendering:"pixelated"}}>{p.ch}</div>
);

/* ── Clouds ─────────────────────────────────────────────── */
const CLOUDS=[{top:"4%",delay:0,dur:50,w:90,h:28},{top:"14%",delay:15,dur:68,w:130,h:36},{top:"1%",delay:30,dur:60,w:65,h:22}];
const Cloud=({c})=>(
  <div style={{position:"fixed",left:"-250px",top:c.top,width:c.w,height:c.h,
    animation:`cloudDrift ${c.dur}s ${c.delay}s linear infinite`,
    pointerEvents:"none",zIndex:2,imageRendering:"pixelated"}}>
    <div style={{position:"relative",width:"100%",height:"100%"}}>
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:"55%",background:"rgba(255,255,255,.9)"}}/>
      <div style={{position:"absolute",bottom:"38%",left:"14%",width:"36%",height:"64%",background:"rgba(255,255,255,.9)"}}/>
      <div style={{position:"absolute",bottom:"38%",left:"42%",width:"28%",height:"84%",background:"rgba(255,255,255,.9)"}}/>
      <div style={{position:"absolute",bottom:"38%",right:"13%",width:"26%",height:"56%",background:"rgba(255,255,255,.9)"}}/>
    </div>
  </div>
);

/* ── Grass strip ───────────────────────────────────────── */
const GrassStrip=()=>(
  <div style={{width:"100%",height:"clamp(10px,1.5vh,16px)",flexShrink:0,overflow:"hidden"}}>
    <div style={{...tx("grass"),width:"100%",height:"100%",
      borderTop:`2px solid ${MC.grassLt}`,borderBottom:`2px solid ${MC.dirtDk}`}}/>
  </div>
);

/* ── XP Bar ─────────────────────────────────────────────── */
const XpBar=({pct,col=MC.xp,glow=MC.xpLt,delay=0,h=8})=>{
  const val=Math.min(parseFloat(pct)||0,100);
  return(
    <div style={{width:"100%",height:h,background:"rgba(0,0,0,0.35)",
      border:"2px solid rgba(0,0,0,0.5)",imageRendering:"pixelated",
      position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,width:`${val}%`,
        background:`linear-gradient(90deg,${col}AA,${col},${glow})`,
        boxShadow:`0 0 6px ${glow}`,
        animation:`xpGrow 1.4s cubic-bezier(.16,1,.3,1) ${delay}s both`}}/>
      {Array.from({length:19},(_,i)=>(
        <div key={i} style={{position:"absolute",left:`${(i+1)*5.26}%`,
          top:0,bottom:0,width:1,background:"rgba(0,0,0,0.22)"}}/>
      ))}
    </div>
  );
};

/* ── Avatar ─────────────────────────────────────────────── */
const McAvatar=({url,name,size=64,rank=0})=>{
  const ini=(name||"??").slice(0,2).toUpperCase();
  const bc=rank===1?MC.gold:rank===2?MC.diamond:rank===3?MC.emerald:"rgba(255,255,255,.25)";
  return(
    <div style={{width:size,height:size,flexShrink:0,position:"relative"}}>
      <div style={{position:"absolute",inset:-3,border:`3px solid ${bc}`,
        imageRendering:"pixelated",zIndex:2}}/>
      <div style={{position:"absolute",inset:0,border:"2px solid rgba(0,0,0,.65)",zIndex:3}}/>
      {url?(
        <img src={url} alt={name}
          style={{width:"100%",height:"100%",objectFit:"cover",imageRendering:"pixelated",display:"block"}}/>
      ):(
        <div style={{width:"100%",height:"100%",...tx("obsidian"),
          display:"flex",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontFamily:"'Press Start 2P',monospace",fontSize:size*.2,
            color:bc,textShadow:`2px 2px 0 #000,0 0 10px ${bc}`,
            position:"relative",zIndex:1}}>{ini}</span>
        </div>
      )}
      {rank===1&&(
        <div style={{position:"absolute",inset:0,zIndex:4,
          background:`repeating-linear-gradient(45deg,transparent 0,${MC.enchant}0A 1px,transparent 2px,transparent 8px)`,
          animation:"enchScroll 1.8s linear infinite",pointerEvents:"none"}}/>
      )}
    </div>
  );
};

/* ── Podium Card ───────────────────────────────────────── */
const PCFG=[
  {label:"🏆",place:"1º LUGAR",full:"CAMPEÃO",
   rc:MC.gold,rl:MC.goldLt,txk:"gold",
   badgeBg:`linear-gradient(135deg,#7A5000,${MC.gold},#7A5000)`,badgeTxt:"#1A0A00",
   cardBg:"rgba(245,196,0,.11)",floatA:"bobA 3s ease-in-out infinite",
   glowA:"glowG 2s ease-in-out infinite",spinDur:"7s",order:2},
  {label:"💎",place:"2º LUGAR",full:"VICE",
   rc:MC.diamond,rl:MC.diamondLt,txk:"diamond",
   badgeBg:`linear-gradient(135deg,#004A48,${MC.diamond},#004A48)`,badgeTxt:"#001818",
   cardBg:"rgba(41,200,200,.09)",floatA:"bobB 3.5s ease-in-out infinite",
   glowA:"glowD 2.4s ease-in-out infinite",spinDur:"10s",order:1},
  {label:"🔮",place:"3º LUGAR",full:"BRONZE",
   rc:MC.emerald,rl:MC.emeraldLt,txk:"emerald",
   badgeBg:`linear-gradient(135deg,#004020,${MC.emerald},#004020)`,badgeTxt:"#001208",
   cardBg:"rgba(22,201,90,.09)",floatA:"bobC 3.9s .3s ease-in-out infinite",
   glowA:"glowE 2.8s ease-in-out infinite",spinDur:"13s",order:3},
];

function PodiumCard({turma,rankIdx,show,avSize,nameFontSize,pctFontSize,ringSize,badgeFontSize,xpH}){
  const c=PCFG[rankIdx];
  return(
    <div className="pcrd" style={{
      order:c.order,display:"flex",flexDirection:"column",alignItems:"center",
      flex:"1 1 0",minWidth:0,maxWidth:rankIdx===0?"clamp(150px,24vw,220px)":"clamp(130px,21vw,195px)",
      opacity:show?1:0,
      transform:show?"translateY(0) scale(1)":"translateY(-50px) scale(0.82)",
      transition:`opacity .65s ease ${rankIdx===0?.04:rankIdx===1?.18:.32}s,transform .65s cubic-bezier(.34,1.28,.64,1) ${rankIdx===0?.04:rankIdx===1?.18:.32}s`,
    }}>
      {/* Badge */}
      <div style={{
        fontFamily:"'Press Start 2P',monospace",fontSize:badgeFontSize,
        color:c.badgeTxt,background:c.badgeBg,
        padding:`${badgeFontSize*0.6}px ${badgeFontSize*2}px`,
        border:`2px solid ${c.rc}`,
        boxShadow:`0 0 14px ${c.rc}66,0 2px 0 rgba(0,0,0,.25)`,
        marginBottom:badgeFontSize*.8,letterSpacing:1,
        imageRendering:"pixelated",whiteSpace:"nowrap",
        animation:rankIdx===0?"pxPulse 2.2s ease-in-out infinite":"none",
      }}>{c.label} {c.full}</div>

      {/* Ring + Avatar */}
      <div style={{
        position:"relative",width:ringSize,height:ringSize,
        display:"flex",alignItems:"center",justifyContent:"center",
        marginBottom:badgeFontSize*.8,animation:c.floatA,
      }}>
        <div style={{position:"absolute",inset:0,borderRadius:"50%",
          ...tx(c.txk),opacity:.45,
          animation:`spinCW ${c.spinDur} linear infinite`,
          border:`3px solid ${c.rc}77`}}/>
        <div style={{position:"absolute",inset:6,borderRadius:"50%",
          border:`2px dashed ${c.rl}66`,
          animation:`spinCCW ${c.spinDur} linear infinite`}}/>
        <div style={{position:"absolute",inset:11,borderRadius:"50%",
          border:`2px solid ${c.rc}99`,
          background:`radial-gradient(circle,${c.rc}14,transparent 70%)`}}/>
        <div style={{position:"relative",zIndex:2,animation:c.glowA}}>
          <McAvatar url={turma.foto_url} name={turma.nome_fantasia} size={avSize} rank={rankIdx+1}/>
        </div>
        <div style={{
          position:"absolute",top:1,right:1,zIndex:3,
          width:avSize*.3,height:avSize*.3,
          ...tx(c.txk),border:`2px solid ${c.rc}`,
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:avSize*.18,imageRendering:"pixelated",
          animation:"starPop .7s ease both",
        }}>{c.label}</div>
      </div>

      {/* Card */}
      <div style={{
        width:"100%",background:c.cardBg,
        border:`3px solid ${c.rc}`,
        boxShadow:`0 0 18px ${c.rc}44,0 3px 0 rgba(0,0,0,.12)`,
        padding:`${badgeFontSize*.9}px ${badgeFontSize*.8}px`,
        display:"flex",flexDirection:"column",alignItems:"center",gap:badgeFontSize*.55,
        position:"relative",overflow:"hidden",
      }}>
        <div style={{position:"absolute",inset:0,...tx("dirt"),opacity:.05,pointerEvents:"none"}}/>
        <div style={{position:"absolute",top:0,left:0,right:0,height:3,
          background:`linear-gradient(90deg,transparent,${c.rc},transparent)`,opacity:.8}}/>
        {/* name */}
        <div style={{
          fontFamily:"'Press Start 2P',monospace",fontSize:nameFontSize,
          color:c.rc,textShadow:`2px 2px 0 rgba(0,0,0,.65),0 0 14px ${c.rc}`,
          textAlign:"center",lineHeight:1.55,letterSpacing:.4,
          wordBreak:"break-word",position:"relative",zIndex:1,
        }}>{turma.nome_fantasia}</div>
        {/* pct */}
        <div style={{
          fontFamily:"'VT323',monospace",fontSize:pctFontSize,
          color:c.rc,textShadow:`2px 2px 0 rgba(0,0,0,.5),0 0 10px ${c.rc}`,
          lineHeight:1,letterSpacing:2,position:"relative",zIndex:1,
        }}>{parseFloat(turma.porcentagem_presenca).toFixed(2)}<span style={{fontSize:".5em",opacity:.7}}>%</span></div>
        {/* xp bar */}
        <div style={{width:"90%",position:"relative",zIndex:1}}>
          <XpBar pct={turma.porcentagem_presenca} col={c.rc} glow={c.rl}
            delay={(rankIdx===0?.04:rankIdx===1?.18:.32)+.5} h={xpH}/>
        </div>
        <div style={{fontFamily:"'VT323',monospace",fontSize:nameFontSize*.9,
          color:`${c.rc}88`,letterSpacing:3,position:"relative",zIndex:1}}>{c.place}</div>
      </div>

      {/* Base blocks */}
      <div style={{display:"flex",gap:2,width:"86%"}}>
        {Array.from({length:rankIdx===0?5:3},(_,i)=>(
          <div key={i} style={{flex:1,height:8,...tx(c.txk),
            border:"2px solid rgba(0,0,0,.38)",borderTop:"none"}}/>
        ))}
      </div>
    </div>
  );
}

/* ── Rank Row ──────────────────────────────────────────── */
function RankRow({turma,rank,show,delay,avSize,nameFontSize,pctFontSize,rowPy,rankSz,xpH}){
  const isT3=rank<=3,isT5=rank<=5;
  const col=rank===1?MC.gold:rank===2?MC.diamond:rank===3?MC.emerald:isT5?MC.enchantLt:"rgba(60,40,10,.8)";
  const glow=rank===1?MC.goldLt:rank===2?MC.diamondLt:rank===3?MC.emeraldLt:isT5?MC.enchant:MC.xp;
  const dir=rank%2===0?"slideR":"slideL";
  return(
    <div className="mc-row" style={{
      display:"flex",alignItems:"center",gap:"clamp(5px,1.2vw,10px)",
      padding:`${rowPy}px clamp(8px,2vw,14px) ${rowPy}px clamp(5px,1.5vw,8px)`,
      ...tx(isT3?"dirt":"stone"),
      border:`2px solid ${col}44`,borderLeft:`5px solid ${col}`,
      marginBottom:3,position:"relative",overflow:"hidden",
      opacity:show?1:0,
      transform:show?"translateX(0)":(dir==="slideL"?"translateX(-70px)":"translateX(70px)"),
      transition:`opacity .42s ease ${delay}s,transform .42s cubic-bezier(.34,1.2,.64,1) ${delay}s`,
    }}>
      <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.5)",pointerEvents:"none"}}/>
      {/* Rank circle */}
      <div style={{
        width:rankSz,height:rankSz,flexShrink:0,position:"relative",zIndex:1,
        border:`2px solid ${col}`,
        background:isT3?`radial-gradient(circle,${col}33,${col}11)`:"rgba(0,0,0,.3)",
        display:"flex",alignItems:"center",justifyContent:"center",
        boxShadow:isT3?`0 0 8px ${glow}55`:"none",imageRendering:"pixelated",
        animation:rank<=3?`rankBnc ${2+rank*.4}s ease-in-out infinite`:"none",
      }}>
        <span style={{fontFamily:"'Press Start 2P',monospace",
          fontSize:nameFontSize*.75,color:col,textShadow:"1px 1px 0 #000"}}>{rank}</span>
      </div>
      {/* Avatar */}
      <div style={{position:"relative",zIndex:1,flexShrink:0}}>
        <McAvatar url={turma.foto_url} name={turma.nome_fantasia} size={avSize} rank={isT3?rank:0}/>
      </div>
      {/* Info */}
      <div style={{flex:1,minWidth:0,position:"relative",zIndex:1}}>
        <div style={{
          fontFamily:"'Press Start 2P',monospace",fontSize:nameFontSize,
          color:isT3?col:"#EEE0C0",textShadow:`2px 2px 0 #000,0 0 9px ${col}55`,
          whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",
          marginBottom:4,lineHeight:1.2,letterSpacing:.3,
        }}>{turma.nome_fantasia}</div>
        <XpBar pct={turma.porcentagem_presenca} col={col} glow={glow} delay={delay+.2} h={xpH}/>
        <div style={{fontFamily:"'VT323',monospace",fontSize:nameFontSize*.95,
          color:"rgba(255,255,255,.22)",letterSpacing:2,marginTop:2}}>{turma.nome}</div>
      </div>
      {/* Pct */}
      <div style={{
        fontFamily:"'VT323',monospace",fontSize:pctFontSize,
        color:isT3?col:"#EEE0C0",textShadow:`2px 2px 0 #000,0 0 8px ${col}`,
        flexShrink:0,lineHeight:1,
        minWidth:pctFontSize*1.9,textAlign:"right",position:"relative",zIndex:1,letterSpacing:1,
      }}>{(parseFloat(turma.porcentagem_presenca)||0).toFixed(2)}<span style={{fontSize:".52em",color:"rgba(255,255,255,.3)"}}>%</span></div>
    </div>
  );
}

/* ── Tab ───────────────────────────────────────────────── */
const McTab=({label,active,onClick,cd,fontSize})=>(
  <button onClick={onClick} style={{
    fontFamily:"'Press Start 2P',monospace",fontSize,letterSpacing:1,
    padding:`${fontSize*.9}px ${fontSize*2.2}px`,
    ...tx(active?"grass":"stone"),
    border:`3px solid ${active?MC.grassLt:"rgba(0,0,0,.38)"}`,
    borderBottom:`3px solid ${active?MC.grass:"rgba(0,0,0,.55)"}`,
    boxShadow:active?`0 0 16px ${MC.grassLt}66,0 4px 0 rgba(0,0,0,.25)`:"0 4px 0 rgba(0,0,0,.25)",
    color:active?"#000":"rgba(255,255,255,.45)",
    textShadow:active?"none":"1px 1px 0 #000",
    position:"relative",overflow:"hidden",imageRendering:"pixelated",
  }}>
    <div style={{position:"absolute",inset:0,
      background:active?"rgba(255,255,255,.1)":"rgba(0,0,0,.5)",pointerEvents:"none"}}/>
    <span style={{position:"relative",zIndex:1}}>{label}</span>
    {active&&(
      <div style={{position:"absolute",bottom:0,left:0,height:3,
        width:`${cd}%`,transition:"width .15s linear",
        background:`linear-gradient(90deg,${MC.xp},${MC.gold})`,
        boxShadow:`0 0 5px ${MC.xpLt}`}}/>
    )}
  </button>
);

/* ── Responsive sizing hook ────────────────────────────── */
function useSizes(){
  const[sz,setSz]=useState({w:window.innerWidth,h:window.innerHeight});
  useEffect(()=>{
    const fn=()=>setSz({w:window.innerWidth,h:window.innerHeight});
    window.addEventListener("resize",fn);
    return()=>window.removeEventListener("resize",fn);
  },[]);
  const{w,h}=sz;
  // Derive everything from actual viewport
  const isMobile=w<600;
  const isTablet=w>=600&&w<900;
  // Podium avatar size scales with available width
  const avP=isMobile?Math.min(56,w*.13):isTablet?Math.min(72,w*.1):Math.min(90,Math.min(w*.085,h*.1));
  const ringP=avP+32;
  // Name font in podium — smallest size that looks good pixelated
  const nmP=isMobile?6:isTablet?7:8;
  const pctP=isMobile?22:isTablet?26:30;
  const badgeP=isMobile?6:isTablet?7:8;
  const xpHP=isMobile?8:isTablet?10:12;
  // Row sizing
  const avR=isMobile?32:isTablet?38:Math.min(44,h*.055);
  const nmR=isMobile?6:isTablet?7:Math.min(8,w*.006);
  const pctR=isMobile?17:isTablet?19:Math.min(22,h*.028);
  const rowPy=isMobile?4:isTablet?5:Math.min(6,h*.007);
  const rankSz=isMobile?28:isTablet?32:Math.min(36,h*.048);
  const xpHR=isMobile?6:isTablet?7:8;
  const tabFsz=isMobile?6:isTablet?7:8;
  return{isMobile,isTablet,avP,ringP,nmP,pctP,badgeP,xpHP,avR,nmR,pctR,rowPy,rankSz,xpHR,tabFsz};
}

/* ── Main ──────────────────────────────────────────────── */
const TAB_MS=12000;
export default function MinecraftRanking(){
  const[tab,setTab]=useState("semanal");
  const[show,setShow]=useState(false);
  const[transit,setTransit]=useState(false);
  const[cd,setCd]=useState(100);
  const[loading,setLoading]=useState(true);
  const[error,setError]=useState(null);
  const[dataMap,setDataMap]=useState({semanal:[],mensal:[]});
  const cdRef=useRef(100),cdInter=useRef(null),tabRef=useRef("semanal"),autoRef=useRef(null);
  const S=useSizes();

  const fetchAll=useCallback(async()=>{
    setLoading(true);setError(null);
    try{
      const[rS,rM]=await Promise.all([apiFetch("/ranking?tipo=semanal"),apiFetch("/ranking?tipo=mensal")]);
      if(!rS.ok||!rM.ok) throw new Error("Erro ao carregar");
      const[dS,dM]=await Promise.all([rS.json(),rM.json()]);
      const sort=a=>[...a].sort((x,y)=>parseFloat(y.porcentagem_presenca)-parseFloat(x.porcentagem_presenca));
      setDataMap({semanal:sort(dS),mensal:sort(dM)});
    }catch(e){setError(e.message||"Conexão falhou.");}
    finally{setLoading(false);}
  },[]);

  useEffect(()=>{fetchAll();},[fetchAll]);
  useEffect(()=>{
    if(loading||error)return;
    setTimeout(()=>setShow(true),300);
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

  // Gap & padding scale with viewport
  const outerPad=S.isMobile?"6px 8px 6px":"8px 12px 8px";
  const podGap=S.isMobile?6:S.isTablet?10:14;
  const secGap=S.isMobile?4:S.isTablet?6:8;
  const headerMb=S.isMobile?4:S.isTablet?5:7;
  const tabGap=S.isMobile?6:S.isTablet?9:12;
  const tabMb=S.isMobile?5:S.isTablet?7:10;
  const podMb=S.isMobile?5:S.isTablet?7:10;

  return(
    <>
      <style>{G}</style>
      {PARTS.map(p=><Particle key={p.id} p={p}/>)}
      {CLOUDS.map((c,i)=><Cloud key={i} c={c}/>)}

      <div style={{
        width:"100vw",height:"100vh",overflow:"hidden",
        background:`linear-gradient(180deg,${MC.sky1} 0%,${MC.sky2} 28%,${MC.skyBot} 55%,#E8F8FF 78%,#F2FFF8 100%)`,
        display:"flex",flexDirection:"column",
        position:"relative",
      }}>
        {/* Scan beam */}
        <div style={{position:"fixed",left:0,right:0,height:2,
          background:`linear-gradient(90deg,transparent,${MC.grassLt}55,transparent)`,
          animation:"scan 9s linear infinite",pointerEvents:"none",zIndex:6}}/>

        {/* Corner blocks */}
        {[{top:0,left:0},{top:0,right:0},{bottom:0,left:0},{bottom:0,right:0}].map((pos,i)=>(
          <div key={i} style={{position:"fixed",...pos,width:20,height:20,
            ...tx("obsidian"),border:"2px solid rgba(0,0,0,.45)",
            zIndex:20,pointerEvents:"none",imageRendering:"pixelated"}}/>
        ))}

        {/* LOADING */}
        {loading&&(
          <div style={{position:"fixed",inset:0,zIndex:100,
            background:`linear-gradient(180deg,${MC.sky1},${MC.sky2})`,
            display:"flex",flexDirection:"column",
            alignItems:"center",justifyContent:"center",gap:16}}>
            <div style={{fontFamily:"'Press Start 2P',monospace",
              fontSize:"clamp(13px,3.5vw,26px)",color:MC.grass,
              textShadow:`3px 3px 0 ${MC.dirtDk},0 0 18px ${MC.xpLt}`,
              letterSpacing:2,textAlign:"center",animation:"pxPulse 1.2s ease-in-out infinite"}}>
              CLASSPULSE
            </div>
            <div style={{display:"flex",gap:10}}>
              {["⛏️","💎","🌿","🗡️","🧱"].map((e,i)=>(
                <span key={i} style={{fontSize:"clamp(20px,4vw,28px)",
                  animation:`bobA ${1.4+i*.25}s ${i*.15}s ease-in-out infinite`,
                  display:"inline-block"}}>{e}</span>
              ))}
            </div>
            <div style={{fontFamily:"'VT323',monospace",fontSize:"clamp(16px,3vw,22px)",
              color:"rgba(0,80,30,.45)",letterSpacing:6}}>CARREGANDO MUNDO...</div>
            <div style={{width:"min(260px,72vw)",height:16,
              background:"rgba(0,0,0,.12)",border:`3px solid ${MC.grass}`,overflow:"hidden"}}>
              <div style={{height:"100%",width:"65%",
                background:`linear-gradient(90deg,${MC.xp},${MC.xpLt})`,
                animation:"pxPulse .9s ease-in-out infinite"}}/>
            </div>
          </div>
        )}

        {/* ERROR */}
        {!loading&&error&&(
          <div style={{position:"fixed",inset:0,zIndex:100,
            background:`linear-gradient(180deg,${MC.sky1},${MC.sky2})`,
            display:"flex",flexDirection:"column",
            alignItems:"center",justifyContent:"center",gap:16}}>
            <div style={{fontFamily:"'Press Start 2P',monospace",
              fontSize:"clamp(14px,4vw,28px)",color:MC.red,
              textShadow:"3px 3px 0 #000",letterSpacing:2,textAlign:"center"}}>VOCÊ MORREU</div>
            <div style={{fontSize:"clamp(32px,8vw,48px)"}}>💀</div>
            <div style={{fontFamily:"'VT323',monospace",fontSize:"clamp(16px,3vw,20px)",
              color:"rgba(200,50,50,.5)",letterSpacing:4}}>{error}</div>
            <button onClick={fetchAll} style={{fontFamily:"'Press Start 2P',monospace",
              fontSize:"clamp(7px,2vw,10px)",letterSpacing:2,padding:"10px 22px",
              ...tx("grass"),border:`3px solid ${MC.grassLt}`,
              boxShadow:`0 0 14px ${MC.xpLt},0 4px 0 rgba(0,0,0,.25)`,
              color:"#000",imageRendering:"pixelated"}}>[ RENASCER ]</button>
          </div>
        )}

        {/* MAIN — flex column fills exactly 100vh */}
        {!loading&&!error&&(
          <div style={{
            flex:1,display:"flex",flexDirection:"column",
            padding:outerPad,
            width:"100%",maxWidth:960,margin:"0 auto",
            position:"relative",zIndex:10,
            minHeight:0, // allow children to shrink
          }}>

            {/* HEADER */}
            <div style={{textAlign:"center",marginBottom:headerMb,flexShrink:0}}>
              <div style={{fontFamily:"'VT323',monospace",
                fontSize:"clamp(10px,2vw,14px)",
                color:"rgba(0,90,30,.35)",letterSpacing:"clamp(4px,1.5vw,8px)",marginBottom:2}}>
                ◆ SERVIDOR CLASSPULSE ◆
              </div>
              <h1 style={{
                fontFamily:"'Press Start 2P',monospace",
                fontSize:"clamp(10px,2.8vw,22px)",
                background:`linear-gradient(180deg,${MC.gold} 0%,${MC.grass} 50%,${MC.diamond} 100%)`,
                WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
                letterSpacing:2,lineHeight:1.45,
                filter:`drop-shadow(3px 3px 0 rgba(0,0,0,.25))`,
                animation:"titleDrop .85s cubic-bezier(.34,1.3,.64,1) both",
                userSelect:"none",
              }}>⛏ RANKING DAS TURMAS ⛏</h1>
              <div style={{marginTop:4}}><GrassStrip/></div>
              <div style={{fontFamily:"'VT323',monospace",
                fontSize:"clamp(12px,2.2vw,16px)",
                color:"rgba(0,90,30,.38)",letterSpacing:"clamp(3px,1.2vw,6px)",marginTop:3}}>
                {tab==="semanal"?"— MISSÃO SEMANAL —":"— CONQUISTA MENSAL —"}
              </div>
            </div>

            {/* TABS */}
            <div style={{display:"flex",justifyContent:"center",
              gap:tabGap,marginBottom:tabMb,flexShrink:0}}>
              <McTab label="⚔ SEMANAL" active={tab==="semanal"} onClick={()=>doSwitch("semanal")} cd={tab==="semanal"?cd:100} fontSize={S.tabFsz}/>
              <McTab label="🏰 MENSAL"  active={tab==="mensal"}  onClick={()=>doSwitch("mensal")}  cd={tab==="mensal"?cd:100}  fontSize={S.tabFsz}/>
            </div>

            {/* PODIUM */}
            <div style={{
              display:"flex",justifyContent:"center",alignItems:"flex-start",
              gap:podGap,marginBottom:podMb,flexShrink:0,
              opacity:transit?0:1,transform:transit?"scale(.91)":"scale(1)",
              transition:"opacity .35s,transform .35s",
            }}>
              {[{d:sorted[1],r:1},{d:sorted[0],r:0},{d:sorted[2],r:2}].map(
                ({d,r})=>d?(
                  <PodiumCard key={d.turma_id} turma={d} rankIdx={r} show={show&&!transit}
                    avSize={r===0?S.avP:S.avP*.88}
                    ringSize={r===0?S.ringP:S.ringP*.88}
                    nameFontSize={r===0?S.nmP:S.nmP*.9}
                    pctFontSize={r===0?S.pctP:S.pctP*.85}
                    badgeFontSize={r===0?S.badgeP:S.badgeP*.88}
                    xpH={S.xpHP}/>
                ):null
              )}
            </div>

            {/* DIVIDER */}
            <div style={{flexShrink:0,marginBottom:secGap}}><GrassStrip/></div>

            {/* LIST — takes all remaining space, never overflows */}
            <div style={{
              flex:1,overflow:"hidden",minHeight:0,
              opacity:transit?0:1,transition:"opacity .35s",
              display:"flex",flexDirection:"column",
              gap:0,
            }}>
              {sorted.map((t,i)=>(
                <RankRow key={t.turma_id} turma={t} rank={i+1}
                  show={show&&!transit} delay={.04*i}
                  avSize={S.avR} nameFontSize={S.nmR}
                  pctFontSize={S.pctR} rowPy={S.rowPy}
                  rankSz={S.rankSz} xpH={S.xpHR}/>
              ))}
            </div>

            {/* FOOTER */}
            <div style={{
              display:"flex",justifyContent:"space-between",alignItems:"center",
              paddingTop:secGap,marginTop:secGap*.5,flexShrink:0,
              borderTop:`2px solid ${MC.grass}44`,
            }}>
              <div style={{display:"flex",alignItems:"center",gap:5}}>
                <div style={{width:7,height:7,background:MC.xp,
                  boxShadow:`0 0 7px ${MC.xpLt}`,
                  animation:"liveBlip 1.1s ease-in-out infinite",imageRendering:"pixelated"}}/>
                <span style={{fontFamily:"'Press Start 2P',monospace",
                  fontSize:"clamp(5px,1.2vw,7px)",color:`${MC.grass}88`,letterSpacing:2}}>AO VIVO</span>
              </div>
              <div style={{fontFamily:"'VT323',monospace",
                fontSize:"clamp(13px,2.2vw,17px)",
                color:`${MC.gold}BB`,letterSpacing:2,textAlign:"center",
                textShadow:`1px 1px 0 rgba(0,0,0,.2)`}}>
                👑 {top?.nome_fantasia} • {parseFloat(top?.porcentagem_presenca||0).toFixed(2)}%
              </div>
              <div style={{fontFamily:"'Press Start 2P',monospace",
                fontSize:"clamp(5px,1.2vw,7px)",color:"rgba(0,90,30,.18)",letterSpacing:2}}>
                CLASSPULSE
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
///minecraft ajustado responsividade