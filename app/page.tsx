"use client";

import { useEffect, useMemo, useState } from "react";

type Subject = "국어" | "수학" | "영어" | "사회" | "과학" | "기타";
type Session = { subject: Subject; minutes: number; finishedAt: string };

const subjects: Subject[] = ["국어", "수학", "영어", "사회", "과학", "기타"];
const FOCUS_MINUTES = 25;

export default function Home() {
  const [subject, setSubject] = useState<Subject>("수학");
  const [seconds, setSeconds] = useState(FOCUS_MINUTES * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("study-sessions");
      if (saved) setSessions(JSON.parse(saved) as Session[]);
      const theme = localStorage.getItem("study-theme");
      if (theme) setDark(theme === "dark");
    } catch {
      // Ignore unavailable or invalid local storage.
    }
  }, []);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setSeconds((current) => {
        if (current <= 1) {
          setRunning(false);
          const record = { subject, minutes: FOCUS_MINUTES, finishedAt: new Date().toISOString() };
          setSessions((old) => {
            const next = [record, ...old];
            try { localStorage.setItem("study-sessions", JSON.stringify(next)); } catch {}
            return next;
          });
          return FOCUS_MINUTES * 60;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running, mode, subject]);

  const todaySessions = useMemo(() => {
    const today = new Date().toDateString();
    return sessions.filter((s) => new Date(s.finishedAt).toDateString() === today);
  }, [sessions]);
  const todayMinutes = todaySessions.reduce((sum, s) => sum + s.minutes, 0);
  const subjectMinutes = subjects.map((name) => ({
    name,
    minutes: todaySessions.filter((s) => s.subject === name).reduce((sum, s) => sum + s.minutes, 0),
  }));
  const totalSeconds = FOCUS_MINUTES * 60;
  const progress = ((totalSeconds - seconds) / totalSeconds) * 100;
  const time = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  function resetTimer() {
    setRunning(false);
    setSeconds(FOCUS_MINUTES * 60);
  }

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    try { localStorage.setItem("study-theme", next ? "dark" : "light"); } catch {}
  }

  return (
    <main className={`study-app ${dark ? "dark" : "light"}`}>
      <div className="page-wrap">
        <header className="topbar">
          <a className="brand" href="#"><span className="brand-icon">S</span><span>STUDYFLOW<small>FOCUS • TRACK • GROW</small></span></a>
          <button className="theme-toggle" onClick={toggleTheme} aria-label="테마 변경">{dark ? "☼" : "☾"} <span>{dark ? "라이트 모드" : "다크 모드"}</span></button>
        </header>

        <section className="intro">
          <p className="eyebrow">YOUR PERSONAL STUDY SPACE</p>
          <h1>집중할 시간,<br /><em>지금 시작해.</em></h1>
          <p className="intro-copy">작은 집중이 쌓여 큰 성장이 됩니다.<br />오늘의 공부를 차근차근 기록해 보세요.</p>
        </section>

        <section className="workspace">
          <article className="timer-card">
            <div className="timer-heading">
              <div><span className="eyebrow">STUDY TIMER</span><h2>집중 세션</h2></div>
              <span className="mode-pill focus">FOCUS</span>
            </div>
            <div className="timer-ring" style={{ "--progress": `${progress}%` } as React.CSSProperties}>
              <div className="timer-inner"><span className="timer-label">FOCUS TIME</span><strong>{time}</strong><span className="timer-caption">지금은 한 가지에만 집중</span></div>
            </div>
            <div className="timer-actions">
              <button className="primary-btn" onClick={() => setRunning((v) => !v)}>{running ? "일시정지" : "시작하기"} <span>{running ? "Ⅱ" : "▶"}</span></button>
              <button className="reset-btn" onClick={() => resetTimer()}>초기화 ↺</button>
            </div>
            <div className="timer-settings"><button className="selected" onClick={resetTimer}>집중 25분</button><span className="timer-caption">완료하면 기록에 자동 저장</span></div>
          </article>

          <aside className="side-column">
            <article className="subject-card">
              <div className="card-heading"><div><span className="eyebrow">STUDY SUBJECT</span><h2>오늘 공부할 과목</h2></div><span className="tiny-icon">✎</span></div>
              <div className="subject-grid">{subjects.map((item, i) => <button key={item} className={subject === item ? "subject-option active" : "subject-option"} onClick={() => setSubject(item)}><span className="subject-symbol">{["가", "∑", "A", "지", "⚛", "＋"][i]}</span>{item}</button>)}</div>
              <p className="subject-note">선택한 과목이 집중 기록에 저장돼요.</p>
            </article>
            <article className="daily-card">
              <div className="card-heading"><div><span className="eyebrow">TODAY'S PROGRESS</span><h2>오늘의 기록</h2></div><span className="tiny-icon">↗</span></div>
              <div className="daily-total"><strong>{Math.floor(todayMinutes / 60)}<small>시간</small> {todayMinutes % 60}<small>분</small></strong><span>{todaySessions.length}회 집중 완료</span></div>
              <div className="daily-bar"><span style={{ width: `${Math.min(100, todayMinutes / 120 * 100)}%` }} /></div>
              <div className="goal-line"><span>일일 목표 2시간</span><b>{Math.min(100, Math.round(todayMinutes / 120 * 100))}%</b></div>
            </article>
          </aside>
        </section>

        <section className="stats-section">
          <div className="section-heading"><div><span className="eyebrow">SUBJECT BREAKDOWN</span><h2>과목별 공부 시간</h2></div><span className="today-label">TODAY</span></div>
          <div className="stats-grid">{subjectMinutes.map((item, i) => <article className="stat-card" key={item.name}><div className="stat-top"><span className="stat-dot" style={{ "--dot": ["#9d8cff", "#65b9ff", "#f4b66b", "#6bd4b2", "#f28b9a", "#a6b2bf"][i] } as React.CSSProperties} /><b>{item.name}</b><span>{item.minutes}분</span></div><div className="stat-bar"><span style={{ width: `${todayMinutes ? item.minutes / Math.max(...subjectMinutes.map((x) => x.minutes), 1) * 100 : 0}%`, "--dot": ["#9d8cff", "#65b9ff", "#f4b66b", "#6bd4b2", "#f28b9a", "#a6b2bf"][i] } as React.CSSProperties} /></div></article>)}</div>
        </section>
        <footer className="footer"><span>STUDYFLOW</span><span>한 번에 한 걸음씩.</span></footer>
      </div>
    </main>
  );
}
