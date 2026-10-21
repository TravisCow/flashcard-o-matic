import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { deleteDeck, listDecks } from "../utils/api/index.js";

function Home() {
  const [error, setError] = useState(null);
  const mountedRef = useRef(false);
  const [decks, setDecks] = useState(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const abortController = new AbortController();
    async function loadDecks() {
      try {
        const decks = await listDecks(abortController.signal);
        if (mountedRef.current) {
          setDecks((_) => [...decks]);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          setError(error.message || "Something went wrong. Please try again.");
        }
      }
    }
    loadDecks();

    return () => abortController.abort();
  }, []);

  const deleteHandler = async (deckId) => {
    try {
      setError(null);
      const confirmation = window.confirm(
        "Delete this deck? You will not be able to recover it.",
      );
      if (confirmation) {
        await deleteDeck(deckId);
        setDecks((current) => current.filter((deck) => deck.id !== deckId));
      }
    } catch (failure) {
      setError(failure.message || "Could not save. Please try again.");
    }
  };

  const styledDecks = (decks || []).map((deck) => (
    <div
      key={deck.id}
      className="card"
      style={{ width: "100%", marginTop: "1em" }}
    >
      <div className="card-body">
        <div className="d-flex justify-content-between">
          <h4 className="card-title">{deck.name}</h4>
          <p>{deck.cards.length} cards</p>
        </div>
        <p className="card-text text-secondary">{deck.description}</p>
        <div className="d-flex justify-content-between mt-4">
          <Link to={`/decks/${deck.id}`} className="card-link">
            <i className="fas fa-binoculars"></i> View
          </Link>
          <Link to={`/decks/${deck.id}/study`} className="card-link">
            <i className="fas fa-book"></i> Study
          </Link>
          <button
            className="btn btn-danger"
            onClick={() => deleteHandler(deck.id)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  ));

  return decks ? (
    <React.Fragment>
      {decks.length === 0 && (
        <p>No decks yet. Create your first deck to get started.</p>
      )}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {styledDecks}
    </React.Fragment>
  ) : error ? (
    <p role="alert">{error}</p>
  ) : (
    <p role="status">Loading decks…</p>
  );
}

export default Home;
