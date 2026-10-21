import React, { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { readDeck, createCard } from "../utils/api";
import CardForm from "./CardForm";

function AddCard() {
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(false);
  const initialFormState = {
    id: "",
    front: "",
    back: "",
    deckId: "",
  };
  const [deck, setDeck] = useState({
    name: "loading...",
    description: "",
    cards: [],
  });
  const [newCardData, setNewCardData] = useState(initialFormState);

  const { deckId } = useParams();
  // effect just for tracking mounted state
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

  const changeHandler = ({ target }) => {
    const { name, value } = target;
    setSaved(false);
    setNewCardData((currentState) => ({
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
      await createCard(deckId, newCardData);
      setNewCardData(initialFormState);
      setSaved(true);
    } catch (failure) {
      setError(failure.message || "Could not save. Please try again.");
    } finally {
      setBusy(false);
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
          <li className="breadcrumb-item">
            <Link to={`/decks/${deckId}`}>{deck.name}</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Add Card
          </li>
        </ol>
      </nav>
      <h1 className="my-4 text-center">
        {deck.name}: <span>Add Card</span>
      </h1>
      {saved && <p role="status">Card saved. Add another or choose Done.</p>}
      <CardForm
        busy={busy}
        changeHandler={changeHandler}
        submitHandler={submitHandler}
        newCardData={newCardData}
        deckId={deckId}
      />
    </React.Fragment>
  );
}

export default AddCard;
