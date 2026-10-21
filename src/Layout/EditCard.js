import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useHistory } from "react-router-dom";
import { readDeck, readCard, updateCard } from "../utils/api";
import CardForm from "./CardForm";

function EditCard() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [cardLoading, setCardLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(false);
  const { deckId, cardId } = useParams();
  const history = useHistory();

  const initialCardState = { id: "", front: "", back: "", deckId: "" };
  const [deck, setDeck] = useState({
    name: "loading...",
    description: "",
  });
  const [editCard, setEditCard] = useState(initialCardState);

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
        const loadedDeck = await readDeck(deckId, abortController.signal);
        if (mountedRef.current) {
          setDeck(() => loadedDeck);
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

  useEffect(() => {
    const abortController = new AbortController();
    async function loadCard() {
      try {
        const loadedCard = await readCard(cardId, abortController.signal);
        if (mountedRef.current) {
          setEditCard(() => loadedCard);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          setError(error.message || "Something went wrong. Please try again.");
        }
      }
    }
    loadCard().finally(() => {
      if (mountedRef.current) setCardLoading(false);
    });
    return () => {
      abortController.abort();
    };
  }, [cardId]);

  const changeHandler = ({ target }) => {
    const { name, value } = target;
    setEditCard((currentState) => ({
      ...currentState,
      [name]: value,
    }));
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      setError(null);
      await updateCard(editCard);
      setEditCard(initialCardState);
      setBusy(false);
      history.push(`/decks/${deckId}`);
    } catch (failure) {
      setError(failure.message || "Could not save. Please try again.");
      setBusy(false);
    }
  };

  if (loading || cardLoading) return <p role="status">Loading deck…</p>;
  if (error && !editCard.id) return <p role="alert">{error}</p>;
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
          <li className="breadcrumb-item">
            <Link to={`/decks/${deckId}`}>{deck.name}</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Edit Card {cardId}
          </li>
        </ol>
      </nav>
      <h1 className="text-center">Edit Card</h1>
      <CardForm
        busy={busy}
        changeHandler={changeHandler}
        submitHandler={submitHandler}
        newCardData={editCard}
        deckId={deckId}
      />
    </React.Fragment>
  );
}

export default EditCard;
