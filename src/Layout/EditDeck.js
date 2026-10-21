import React, { useState, useEffect, useRef } from "react";
import { Link, useParams, useHistory } from "react-router-dom";
import { readDeck, updateDeck } from "../utils/api";

function EditDeck() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(false);
  const initialState = { name: "", description: "" };
  const [editDeckFormData, setEditDeckFormData] = useState(initialState);

  const { deckId } = useParams();
  const history = useHistory();

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
          setEditDeckFormData(() => loadedDeck);
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
    setEditDeckFormData((currentState) => ({
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
      const response = await updateDeck(editDeckFormData);
      setBusy(false);
      history.push(`/decks/${response.id}`);
    } catch (failure) {
      setError(failure.message || "Could not save. Please try again.");
      setBusy(false);
    }
  };

  if (loading) return <p role="status">Loading deck…</p>;
  if (error && !editDeckFormData.id) return <p role="alert">{error}</p>;
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
            <Link to={`/decks/${deckId}`}>
              {editDeckFormData.name ? editDeckFormData.name : "Loading..."}
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Edit Deck
          </li>
        </ol>
      </nav>
      <form onSubmit={submitHandler}>
        <h1 className="my-4 text-center">Edit Deck</h1>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            name="name"
            id="name"
            className="form-control form-control-lg"
            type="text"
            placeholder="Deck Name"
            onChange={changeHandler}
            value={editDeckFormData.name}
            maxLength={120}
            required
          ></input>
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            className="form-control"
            id="description"
            name="description"
            rows="5"
            placeholder="Brief description of the deck"
            onChange={changeHandler}
            value={editDeckFormData.description}
            maxLength={1000}
            required
          ></textarea>
        </div>
        <Link to={`/decks/${deckId}`} className="btn btn-secondary mr-2">
          Cancel
        </Link>
        <button className="btn btn-primary" disabled={busy} type="submit">
          Submit
        </button>
      </form>
    </React.Fragment>
  );
}

export default EditDeck;
