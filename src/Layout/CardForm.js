import React from "react";
import { Link } from "react-router-dom";

function CardForm({ deckId, newCardData, changeHandler, submitHandler, busy }) {
  return (
    <form onSubmit={submitHandler}>
      <div className="form-group">
        <label htmlFor="front">Front</label>
        <textarea
          className="form-control"
          id="front"
          name="front"
          rows="5"
          placeholder="Front side of card"
          onChange={changeHandler}
          value={newCardData.front}
          maxLength={3000}
          required
        ></textarea>
      </div>
      <div className="form-group">
        <label htmlFor="back">Back</label>
        <textarea
          className="form-control"
          id="back"
          name="back"
          rows="5"
          placeholder="Back side of card"
          onChange={changeHandler}
          value={newCardData.back}
          required
        ></textarea>
      </div>
      <Link className="btn btn-secondary mr-2" to={`/decks/${deckId}`}>
        Done
      </Link>
      <button disabled={busy} type="submit" className="btn btn-primary">
        Save
      </button>
    </form>
  );
}

export default CardForm;
