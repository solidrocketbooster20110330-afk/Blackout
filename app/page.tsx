"use client";

import { useEffect, useState } from "react";

type Mission = { id: number; name: string; rank: string; enemy: string; power: number; reward: number; exp: number; unlocked: boolean };

const missions: Mission[] = [
  { id: 1, name: "FIRST CONTACT", rank: "E", enemy: "ROGUE DRONE", power: 18, reward: 60, exp: 45, unlocked: true },
  { id: 2, name: "GHOST SIGNAL", rank: "D", enemy: "SECURITY BOT", power: 32, reward: 100, exp: 75, unlocked: false },
  { id: 3, name: "BROKEN WALL", rank: "C", enemy: "SENTINEL MK-I", power: 55, reward: 160, exp: 120, unlocked: false },
];

export default function Home() {
  const [level, setLevel] = useState(1);
  const [exp, setExp] = useState(0);
  const [credits, setCredits] = useState(250);
  const [power, setPower] = useState(24);
  const [cleared, setCleared] = useState<number[]>([]);
  const [selected, setSelected] = useState(1);
  const [battle, setBattle] = useState(false);
  const [playerHp, setPlayerHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(100);
  const [feed, setFeed] = useState<string[]>(["BLACKOUT combat simulator ready.", "미션을 선택하고 자동 전투를 시작하세요."]);
  const [busy, setBusy] = useState(false);

  const mission = missions[selected - 1];
  const needExp = level * 100;
  const unlocked = (id: number) => id === 1 || cleared.includes(id - 1);

  useEffect(() => {
    if (!battle || busy) return;
    setBusy(true);
    const timer = window.setTimeout(() => {
      const damage = Math.max(7, power + Math.floor(Math.random() * 9) - 5);
      const nextEnemy = Math.max(0, enemyHp - damage);
      setEnemyHp(nextEnemy);
      setFeed((old) => [...old, `ROOKIE attacks ${mission.enemy} for ${damage} DMG.`]);
      if (nextEnemy <= 0) {
        setBattle(false);
        setBusy(false);
        setCleared((old) => old.includes(mission.id) ? old : [...old, mission.id]);
        setCredits((old) => old + mission.reward);
        setExp((old) => {
          let total = old + mission.exp;
          let nextLevel = level;
          while (total >= nextLevel * 100) {
            total -= nextLevel * 100;
            nextLevel += 1;
          }
          if (nextLevel > level) {
            setLevel(nextLevel);
            setPower((p) => p + (nextLevel - level) * 5);
            setFeed((f) => [...f, `LEVEL UP! AGENT LEVEL ${nextLevel} // COMBAT POWER INCREASED`]);
          }
          return total;
        });
        setFeed((old) => [...old, `MISSION CLEAR! +${mission.exp} EXP / +${mission.reward} CR`]);
        return;
      }
      const retaliation = Math.max(5, Math.floor(mission.power * 0.45) + Math.floor(Math.random() * 5));
      const nextPlayer = Math.max(0, playerHp - retaliation);
      setPlayerHp(nextPlayer);
      setFeed((old) => [...old, `${mission.enemy} counterattacks for ${retaliation} DMG.`]);
      if (nextPlayer <= 0) {
        setBattle(false);
        setFeed((old) => [...old, "MISSION FAILED. Recover and try again."]);
      }
      setBusy(false);
    }, 850);
    return () => window.clearTimeout(timer);
  }, [battle, busy, enemyHp, playerHp, power, mission, level]);

  function startMission() {
    if (!unlocked(mission.id) || cleared.includes(mission.id)) return;
    setPlayerHp(100);
    setEnemyHp(100);
    setBattle(true);
    setFeed((old) => [...old, `MISSION START // ${mission.name}`, `TARGET: ${mission.enemy}`]);
  }

  function upgrade() {
    if (credits < 100) {
      setFeed((old) => [...old, "NOT ENOUGH CREDITS. Upgrade costs 100 CR."]);
      return;
    }
    setCredits((old) => old - 100);
    setPower((old) => old + 8);
    setFeed((old) => [...old, "WEAPON UPGRADE COMPLETE // +8 COMBAT POWER"]);
  }

  return (
    <main className="game-shell">
      <header className="game-header">
        <a className="game-brand" href="#"><span className="brand-mark">B_</span><span>BLACKOUT<small>AGENT RPG // 2049</small></span></a>
        <span className="online"><i /> SIMULATION ONLINE</span>
      </header>
      <section className="welcome">
        <div className="eyebrow">ROOKIE OPERATIVE // COMMAND HUB</div>
        <h1>BUILD YOUR<br /><em>LEGEND.</em></h1>
        <p>작전을 완료하고 요원을 성장시켜라.<br />전투는 자동으로 진행됩니다.</p>
      </section>
      <section className="profile-grid">
        <article className="profile-card"><span>AGENT LEVEL</span><strong>LV. {String(level).padStart(2, "0")}</strong><div className="bar"><b style={{ width: `${Math.min(100, exp / needExp * 100)}%` }} /></div><small>{exp} / {needExp} EXP</small></article>
        <article className="profile-card"><span>COMBAT POWER</span><strong>{power}<small> CP</small></strong><small>요원 전투 능력</small></article>
        <article className="profile-card"><span>CREDITS</span><strong>{credits}<small> CR</small></strong><small>장비 강화에 사용</small></article>
        <article className="profile-card"><span>MISSIONS</span><strong>{cleared.length}<small> / 3</small></strong><small>완료한 작전</small></article>
      </section>
      <section className="section-title"><div><span className="eyebrow">OPERATIONS</span><h2>미션 선택</h2></div><span className="subtle">CLEAR TO UNLOCK</span></section>
      <div className="mission-grid">
        <div className="mission-list">{missions.map((m) => <button key={m.id} onClick={() => setSelected(m.id)} className={`mission-card ${selected === m.id ? "chosen" : ""}`}><span className="mission-rank">{m.rank}</span><span className="mission-name"><b>{m.name}</b><small>{m.enemy} · POWER {m.power}</small></span><span className={unlocked(m.id) ? "ready" : "locked"}>{cleared.includes(m.id) ? "CLEARED" : unlocked(m.id) ? "READY" : "LOCKED"}</span></button>)}</div>
        <article className="mission-detail"><div className="detail-top"><span>MISSION BRIEF</span><b>RANK {mission.rank}</b></div><h3>{mission.name}</h3><p>목표: {mission.enemy}를 제압하라. 자동 전투에서 승리하면 보상을 획득합니다.</p><div className="reward-row"><span>REWARD <b>+{mission.exp} EXP</b></span><span><b>+{mission.reward} CR</b></span></div><button className="main-button" disabled={!unlocked(mission.id) || cleared.includes(mission.id) || battle} onClick={startMission}>{battle ? "AUTO BATTLE IN PROGRESS..." : cleared.includes(mission.id) ? "MISSION CLEARED" : unlocked(mission.id) ? "START AUTO BATTLE →" : "MISSION LOCKED"}</button></article>
      </div>
      <section className="section-title"><div><span className="eyebrow">LIVE COMBAT</span><h2>자동 전투</h2></div><span className="subtle">{battle ? "ENGAGED" : "STANDBY"}</span></section>
      <section className="battle-panel">
        <div className="combatants"><div className="combatant"><div className="fighter-icon">R</div><b>ROOKIE AGENT</b><small>LV.{level} · {power} CP</small><div className="hp"><b style={{ width: `${playerHp}%` }} /></div><small>HP {playerHp}/100</small></div><div className="versus">VS</div><div className="combatant"><div className="fighter-icon enemy">×</div><b>{mission.enemy}</b><small>RANK {mission.rank}</small><div className="hp enemy-hp"><b style={{ width: `${enemyHp}%` }} /></div><small>HP {enemyHp}/100</small></div></div>
        <div className="battle-feed">{feed.slice(-6).map((line, i) => <p key={i}>{line}</p>)}</div>
      </section>
      <section className="section-title"><div><span className="eyebrow">UPGRADE BAY</span><h2>장비 강화</h2></div><span className="subtle">COST 100 CR</span></section>
      <section className="upgrade-panel"><div><b>TACTICAL WEAPON MOD</b><p>무기를 강화해 전투력을 +8 올립니다.</p></div><button className="upgrade-button" onClick={upgrade} disabled={battle}>UPGRADE · 100 CR</button></section>
      <footer className="game-footer">BLACKOUT // FICTIONAL AGENT RPG <span>SIMULATION ONLY · NO REAL SYSTEM ACCESS</span></footer>
    </main>
  );
}
