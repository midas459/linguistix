"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLearn } from "../../../lib/learn-store";

export default function LessonPlayer({ screens, lesson, moduleTitle, languageCode }) {
  const { language, setLang, completeLesson } = useLearn();

  useEffect(() => {
    setLang(languageCode);
  }, [languageCode, setLang]);
  const [screenIndex, setScreenIndex] = useState(0);
  const [selected, setSelected] = useState([]);
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [done, setDone] = useState(false);

  const screen = screens[screenIndex];

  function toggleChoice(id) {
    if (checked) return;
    if (screen.kind === "wordbank") {
      setSelected(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
    } else {
      setSelected([id]);
    }
  }

  function checkAnswer() {
    const isCorrect = screen.kind === "wordbank"
      ? JSON.stringify(selected) === JSON.stringify(screen.answer)
      : selected[0] === screen.correct;
    setCorrect(isCorrect);
    setChecked(true);
  }

  function nextScreen() {
    if (screenIndex === screens.length - 1) {
      completeLesson(lesson, moduleTitle);
      setDone(true);
      return;
    }
    setScreenIndex(index => index + 1);
    setSelected([]);
    setChecked(false);
    setCorrect(false);
  }

  function speak() {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(screen.audio || screen.stem || "");
    utterance.lang = language.speech;
    window.speechSynthesis.speak(utterance);
  }

  if (done) {
    return (
      <section className="module-card">
        <div className="eyebrow">Lesson complete</div>
        <h2>Great work!</h2>
        <p>You completed {lesson.title} and earned 20 XP. Your learning progress is saved in this browser.</p>
        <div className="actions">
          <Link className="button" href="/dashboard">Dashboard</Link>
          <Link className="button secondary" href={`/learn/${languageCode}`}>Back to course</Link>
        </div>
      </section>
    );
  }

  if (!screen) return <p>No practice screens are available for this lesson yet.</p>;

  return (
    <section className="exercise-panel">
      <div className="exercise-progress">Exercise {screenIndex + 1} of {screens.length}</div>
      <div className="exercise-track"><span style={{ width: `${((screenIndex + 1) / screens.length) * 100}%` }} /></div>
      <div className="eyebrow">{screen.title}</div>
      <h2>{screen.prompt}</h2>
      {screen.kind === "matrix" && screen.root?.length > 1 && (
        <p className="exercise-hint">Root: {screen.root.join(" · ")} {screen.pattern?.length ? `| Pattern: ${screen.pattern.join(" · ")}` : ""}</p>
      )}
      {screen.kind === "audio" && <button className="button secondary" type="button" onClick={speak}>Play pronunciation</button>}
      {screen.kind === "wordbank" && <p className="exercise-hint">Build: {screen.translation}</p>}
      {screen.stem && <div className="exercise-stem">{screen.stem}</div>}
      <div className="exercise-choices">
        {(screen.tiles || []).map(tile => {
          const id = typeof tile === "string" ? tile : tile.id;
          const label = typeof tile === "string" ? tile : tile.label;
          const sub = typeof tile === "string" ? "" : tile.sub;
          const active = selected.includes(id);
          return (
            <button
              className="exercise-choice"
              type="button"
              key={id}
              aria-pressed={active}
              onClick={() => toggleChoice(id)}
              disabled={checked}
            >
              <strong>{label}</strong>
              {sub && <small>{sub}</small>}
            </button>
          );
        })}
      </div>
      {checked && (
        <div className={correct ? "exercise-feedback success" : "exercise-feedback error"} role="status">
          <strong>{correct ? "Correct!" : "Not quite."}</strong>
          <p>{screen.note}</p>
        </div>
      )}
      <div className="actions">
        {!checked ? (
          <button className="button" type="button" onClick={checkAnswer} disabled={selected.length === 0}>Check answer</button>
        ) : (
          <button className="button" type="button" onClick={nextScreen}>{screenIndex === screens.length - 1 ? "Finish lesson" : "Continue"}</button>
        )}
      </div>
    </section>
  );
}
