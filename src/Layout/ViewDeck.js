import React, { useState, useEffect, useRef } from "react";
import { Link, useParams, useHistory, Route } from "react-router-dom";
import { deleteDeck, readDeck } from "../utils/api";
import ViewCards from "./ViewCards";

function ViewDeck() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(false);
  const { deckId } = useParams();
  const history = useHistory();
  const [deck, setDeck] = useState({ name: "loading...", cards: [] });

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const abortController = new AbortController();
    async function loadDeck() {
      try {
        const response = await readDeck(deckId, abortController.signal);
        if (mountedRef.current) {
          setDeck(() => ({ ...response }));
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          setError(error.message || "Something went wrong. Please try again.");
        }
      }
    }
    loadDeck().finally(() => {
      if (mountedRef.current) setLoading(false);
    });
    return () => {
      abortController.abort();
    };
  }, [deckId]);

  const deleteHandler = async (deckId) => {
    try {
      setError(null);
      const confirmation = window.confirm(
        "Delete this deck? You will not be able to recover it.",
      );
      if (confirmation) {
        await deleteDeck(deckId);
        history.push("/");
      }
    } catch (failure) {
      setError(failure.message || "Could not save. Please try again.");
    }
  };

  if (loading) return <p role="status">Loading deck…</p>;
  if (error && !deck.id) return <p role="alert">{error}</p>;
  return (
    <React.Fragment>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/">
              <i className="fas fa-home"></i> Home
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {deck.name}
          </li>
        </ol>
      </nav>
      <div className="card">
        <div className="card-header text-center">
          <h2>{deck.name}</h2>
        </div>
        <div className="card-body">
          <blockquote className="blockquote mb-0">
            <p>{deck.description}</p>
          </blockquote>
          <div className="d-flex justify-content-around">
            <Link to={`/decks/${deck.id}/edit`}>
              <i className="fas fa-edit"></i> Edit
            </Link>
            <Link to={`/decks/${deck.id}/study`}>
              <i className="fas fa-book"></i> Study
            </Link>
            <Link to={`/decks/${deck.id}/cards/new`}>
              <i className="fas fa-plus"></i> Add Cards
            </Link>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => deleteHandler(deckId)}
            >
              <i className="fas fa-trash"></i> Delete Deck
            </button>
          </div>
        </div>
      </div>
      <Route>
        <ViewCards
          cards={deck.cards}
          onDelete={(cardId) =>
            setDeck((current) => ({
              ...current,
              cards: current.cards.filter((card) => card.id !== cardId),
            }))
          }
        />
      </Route>
    </React.Fragment>
  );
}

export default ViewDeck;
