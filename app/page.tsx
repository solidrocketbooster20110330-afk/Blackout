"use client";

import { useState } from "react";

const missions = [
  { id: "M-001", name: "FIRST CONTACT", rank: "E", type: "SIGNAL ANALYSIS", status: "AVAILABLE", detail: "알 수 없는 신호의 패턴을 분석하고 발신 코드를 복원하라." },
  { id: "M-002", name: "GHOST SIGNAL", rank: "D", type: "ENCRYPTION", status: "LOCKED", detail: "FIRST CONTACT 클리어 후 잠금 해제" },
  { id: "M-003", name: "BROKEN WALL", rank: "C", type: "LOGIC PUZZLE", status: "LOCKED", detail: "GHOST SIGNAL 클리어 후 잠금 해제" },
];

export default function Home() {
  const [active, setActive] = useState(missions[0]);
  const [lines, setLines] = useState<string[]>([
    "BLACKOUT OS v0.1.0 // SECURE SESSION",
    "연결 완료. 모든 명령은 시뮬레이션 환경에서만 실행됩니다.",
    "도움말을 보려면 help 를 입력하세요.",
  ]);
  const [command, setCommand] = useState("");
  const [cleared, setCleared] = useState(false);

  function runCommand() {
    const value = command.trim().toLowerCase();
    if (!value) return;
    let output = "";
    if (value === "help") output = "명령어: help / status / scan / analyze / decrypt / mission / hint / clear";
    else if (value === "status") output = "USER: ROOKIE  |  LEVEL: 01  |  EXP: 0/100  |  CREDITS: 250";
    else if (value === "scan") output = "SCAN COMPLETE // SIGNAL FOUND: 7F-2A-91 // ENCRYPTION: BASIC";
    else if (value === "analyze") output = "패턴 분석 결과: 숫자 시퀀스의 각 값은 3씩 증가합니다. 다음 값은 10.";
    else if (value === "decrypt") output = "암호 해독 대기 중. 분석 결과를 확인하고 미션을 진행하세요.";
    else if (value === "mission") output = active.name + " // " + active.detail;
    else if (value === "hint") output = "힌트: 신호에 포함된 숫자의 규칙을 먼저 찾아보세요.";
    else if (value === "clear") { setLines([]); setCommand(""); return; }
    else if (value === "10" || value === "answer 10") {
      if (!cleared) { setCleared(true); output = "MISSION CLEAR // FIRST CONTACT 완료! 보상 +100 EXP, +50 CREDITS"; }
      else output = "이미 완료한 미션입니다.";
    }
    else output = "명령을 인식하지 못했습니다. help 를 입력하세요.";
    setLines((prev) => [...prev, "rookie@blackout:~$ " + command, output]);
    setCommand("");
  }

  return (
    <main className="shell">
      <aside className="sidebar">
        <a className="brand" href="#"><span className="brand-mark">B_</span><span>BLACKOUT<small>INTELLIGENCE NETWORK</small></span></a>
        <div className="side-label">OPERATIONS</div>
        <a className="nav active" href="#overview"><span>◈</span> Overview</a>
        <a className="nav" href="#missions"><span>▣</span> Missions <i>03</i></a>
        <a className="nav" href="#terminal"><span>⌘</span> Terminal</a>
        <a className="nav" href="#loadout"><span>⬡</span> Loadout</a>
        <div className="side-label second">SYSTEM</div>
        <a className="nav" href="#profile"><span>◉</span> Agent Profile</a>
        <a className="nav" href="#settings"><span>⚙</span> Settings</a>
        <div className="sidebar-bottom"><span className="pulse" /> SYSTEM ONLINE <small>BUILD 0.1.0 / LOCAL</small></div>
      </aside>

      <section className="content" id="overview">
        <header className="topbar"><div className="breadcrumb">BLACKOUT <span>/</span> COMMAND CENTER</div><div className="agent"><span className="avatar">R</span><span>ROOKIE AGENT<small>ACCESS LEVEL 01</small></span><span className="online-dot" /></div></header>
        <div className="hero">
          <div className="eyebrow"><span className="pulse" /> SECURE CONNECTION ESTABLISHED</div>
          <h1>WELCOME TO<br /><em>THE SHADOW.</em></h1>
          <p>정보는 무기다. 흔적은 남기지 마라.<br />BLACKOUT 작전 네트워크에 접속했습니다.</p>
          <div className="hero-actions"><a className="primary-btn" href="#missions">작전 시작 <span>↗</span></a><a className="ghost-btn" href="#terminal">터미널 열기 <span>⌘</span></a></div>
          <div className="hero-code">SYS.2049 // NEXUS NODE 07<br />ENCRYPTION: AES-256 // STATUS: STABLE</div>
        </div>

        <div className="section-head"><div><span className="eyebrow">AGENT STATUS</span><h2>작전 현황</h2></div><span className="muted">LIVE PROFILE</span></div>
        <div className="stats">
          <div className="stat"><span>AGENT LEVEL</span><strong>01<span> / 100</span></strong><div className="progress"><b style={{width:"12%"}} /></div><small>EXP 12 / 100</small></div>
          <div className="stat"><span>MISSION CLEAR</span><strong>{cleared ? "01" : "00"}<span> / 30</span></strong><small>전체 작전 완료</small></div>
          <div className="stat"><span>CREDITS</span><strong>{cleared ? "300" : "250"}<span> CR</span></strong><small>장비 업그레이드에 사용</small></div>
          <div className="stat"><span>REPUTATION</span><strong>00<span> REP</span></strong><small>BLACKOUT 신뢰도</small></div>
        </div>

        <div className="section-head" id="missions"><div><span className="eyebrow">AVAILABLE OPERATIONS</span><h2>미션 브리핑</h2></div><span className="muted">01 / 03 UNLOCKED</span></div>
        <div className="mission-layout">
          <div className="mission-list">{missions.map((m) => <button key={m.id} className={"mission-row " + (active.id === m.id ? "selected" : "")} onClick={() => setActive(m)}><span className="rank">{m.rank}</span><span className="mission-info"><strong>{m.name}</strong><small>{m.id} · {m.type}</small></span><span className={"status " + (m.status === "AVAILABLE" ? "available" : "locked")}>{m.status === "AVAILABLE" ? "READY" : "LOCKED"}</span><span className="arrow">↗</span></button>)}</div>
          <div className="briefing"><div className="briefing-top"><span>MISSION BRIEFING</span><span className="rank-tag">RANK {active.rank}</span></div><h3>{active.name}</h3><p>{active.detail}</p><div className="briefing-meta"><span>REWARD <b>+100 EXP</b></span><span>DIFFICULTY <b>{active.rank}</b></span></div><a href="#terminal" className={"primary-btn full " + (active.status === "LOCKED" ? "disabled" : "")}>터미널에서 시작 <span>→</span></a></div>
        </div>

        <div className="section-head" id="terminal"><div><span className="eyebrow">SIMULATION ENVIRONMENT</span><h2>BLACKOUT 터미널</h2></div><span className="muted">SAFE MODE ENABLED</span></div>
        <div className="terminal"><div className="terminal-bar"><div className="window-dots"><i /><i /><i /></div><span>blackout@secure-node:~</span><span className="terminal-state">● CONNECTED</span></div><div className="terminal-body">{lines.map((line, i) => <div className={line.startsWith("rookie@") ? "input-line" : "output-line"} key={i}>{line}</div>)}<div className="command-line"><span>rookie@blackout:~$</span><input aria-label="Terminal command" value={command} onChange={(e) => setCommand(e.target.value)} onKeyDown={(e) => e.key === "Enter" && runCommand()} placeholder="명령어 입력..." /><button onClick={runCommand}>실행 ↵</button></div></div></div>
        <footer>BLACKOUT SIMULATION NETWORK <span>FICTIONAL ENVIRONMENT // NO REAL SYSTEM ACCESS</span></footer>
      </section>
    </main>
  );
}
