"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Subject = "국어" | "수학" | "영어" | "사회" | "과학" | "기타";
type Session = { subject: Subject; seconds: number; finishedAt: string };
const subjects: Subject[] = ["국어", "수학", "영어", "사회", "과학", "기타"];

export default function Home() {
  const [subject, setSubject] = useState<Subject>("수학");
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const startedAt = useRef<number | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("study-sessions");
      if (saved) {
        const old = JSON.parse(saved) as Array<{subject: Subject; minutes?: number; seconds?: number; finishedAt: string}>;
        setSessions(old.map((s) => ({subject:s.subject, seconds:s.seconds ?? (s.minutes ?? 0) * 60, finishedAt:s.finishedAt})));
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!running) return;
    const tick = window.setInterval(() => {
      if (startedAt.current !== null) setElapsed((Date.now() - startedAt.current) / 1000);
    }, 250);
    return () => window.clearInterval(tick);
  }, [running]);

  const today = useMemo(() => sessions.filter((s) => new Date(s.finishedAt).toDateString() === new Date().toDateString()), [sessions]);
  const todaySeconds = today.reduce((sum, s) => sum + s.seconds, 0);
  const format = (n: number) => {
    const whole = Math.floor(n);
    return [Math.floor(whole / 3600), Math.floor((whole % 3600) / 60), whole % 60].map((v) => String(v).padStart(2, "0")).join(":");
  };

  function startPause() {
    if (running) {
      if (startedAt.current !== null) setElapsed((Date.now() - startedAt.current) / 1000);
      startedAt.current = null;
      setRunning(false);
    } else {
      startedAt.current = Date.now() - elapsed * 1000;
      setRunning(true);
    }
  }

  function finishSession() {
    if (running && startedAt.current !== null) setElapsed((Date.now() - startedAt.current) / 1000);
    const duration = running && startedAt.current !== null ? (Date.now() - startedAt.current) / 1000 : elapsed;
    startedAt.current = null;
    setRunning(false);
    if (duration < 1) { setElapsed(0); return; }
    const record: Session = { subject, seconds: Math.floor(duration), finishedAt: new Date().toISOString() };
    setSessions((old) => {
      const next = [record, ...old];
      try { localStorage.setItem("study-sessions", JSON.stringify(next)); } catch {}
      return next;
    });
    setElapsed(0);
  }

  function reset() {
    startedAt.current = running ? Date.now() : null;
    setElapsed(0);
    if (running) startedAt.current = Date.now();
  }

  return (
    <main className="study-app dark">
      <div className="page-wrap">
        <header className="topbar">
          <a className="brand" href="#"><span className="brand-icon">S</span><span>STUDYFLOW<small>FOCUS • TRACK • GROW</small></span></a>
          <span className="mono status">{running ? "● RECORDING" : "○ READY"}</span>
        </header>
        <section className="intro">
          <p className="eyebrow">YOUR PERSONAL STUDY SPACE</p>
          <h1>집중할 시간,<br /><em>지금 시작해.</em></h1>
          <p className="intro-copy">시간을 재고, 오늘의 공부를 기록해 보세요.</p>
        </section>
        <section className="workspace">
          <article className="timer-card">
            <div className="timer-heading"><div><span className="eyebrow">STOPWATCH</span><h2>공부 스톱워치</h2></div><span className="mode-pill">{running ? "RUNNING" : "STOPPED"}</span></div>
            <div className="stopwatch-face"><span className="timer-label">ELAPSED TIME</span><strong>{format(elapsed)}</strong><span className="timer-caption">{running ? "집중 중입니다" : "시작 버튼을 눌러 측정하세요"}</span></div>
            <div className="timer-actions">
              <button className="primary-btn" onClick={startPause}>{running ? "일시정지 Ⅱ" : elapsed > 0 ? "계속하기 ▶" : "시작하기 ▶"}</button>
              <button className="reset-btn" onClick={reset}>초기화 ↺</button>
              <button className="reset-btn finish-btn" onClick={finishSession}>기록 저장</button>
            </div>
            <p className="timer-caption save-hint">기록 저장을 누르면 선택한 과목에 공부 시간이 추가돼요.</p>
          </article>
          <aside className="side-column">
            <article className="subject-card"><div className="card-heading"><div><span className="eyebrow">STUDY SUBJECT</span><h2>공부 과목</h2></div></div>
              <div className="subject-grid">{subjects.map((item) => <button key={item} className={subject === item ? "subject-option active" : "subject-option"} onClick={() => setSubject(item)}>{item}</button>)}</div>
              <p className="subject-note">측정 중 과목을 바꾸면 저장할 때 선택한 과목으로 기록돼요.</p>
            </article>
            <article className="daily-card"><div className="card-heading"><div><span className="eyebrow">TODAY'S TOTAL</span><h2>오늘의 공부 시간</h2></div></div>
              <div className="daily-total"><strong>{format(todaySeconds)}</strong><span>{today.length}개 세션</span></div>
              <div className="daily-bar"><span style={{width:`${Math.min(100,todaySeconds/7200*100)}%`}} /></div>
              <div className="goal-line"><span>일일 목표 2시간</span><b>{Math.min(100,Math.round(todaySeconds/7200*100))}%</b></div>
            </article>
          </aside>
        </section>
        <section className="stats-section"><div className="section-heading"><div><span className="eyebrow">SUBJECT BREAKDOWN</span><h2>과목별 공부 시간</h2></div><span className="today-label">TODAY</span></div>
          <div className="stats-grid">{subjects.map((name) => { const secs = today.filter((s) => s.subject === name).reduce((sum,s) => sum+s.seconds,0); return <article className="stat-card" key={name}><div className="stat-top"><b>{name}</b><span>{format(secs)}</span></div><div className="stat-bar"><span style={{width:`${todaySeconds ? secs/Math.max(...subjects.map((n)=>today.filter((s)=>s.subject===n).reduce((sum,s)=>sum+s.seconds,0)),1)*100 : 0}%`}} /></div></article>; })}</div>
        </section>
        <footer className="footer"><span>STUDYFLOW</span><span>한 번에 한 걸음씩.</span></footer>
      </div>
    </main>
  );
}
