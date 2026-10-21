import React, { useState } from "react";
import { Link } from "react-router-dom";
import { isDemo, resetDemo } from "../utils/api";

function Header() {
  const [error, setError] = useState(null);
  function reset() {
    if (
      !window.confirm(
        "Reset this browser’s demo decks and cards to the original samples?",
      )
    )
      return;
    try {
      resetDemo();
      window.location.assign("/");
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <header>
      <div className="topbar">
        <Link to="/" className="wordmark">
          F / M <span>Flashcard-o-matic</span>
        </Link>
        <a href="https://github.com/TravisCow/flashcard-o-matic">
          View source ↗
        </a>
      </div>
      <div className="hero">
        <p className="eyebrow">A LITTLE PRACTICE, EVERY DAY</p>
        <h1>
          Make room for
          <br />
          what you want to learn.
        </h1>
        <p>Build a deck. Turn a card. Let the small things stick.</p>
      </div>
      {isDemo && (
        <div className="demo-note">
          <div>
            <strong>Try the study demo</strong>
            <p>
              Sample decks and your edits stay in this browser. No account or
              shared server. Clearing browser data removes your changes.
            </p>
          </div>
          <button onClick={reset} className="btn btn-secondary">
            Reset demo
          </button>
        </div>
      )}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
    </header>
  );
}

export default Header;
