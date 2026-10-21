import React, { useState } from "react";
import { useRouteMatch, Link } from "react-router-dom";
import { deleteCard } from "../utils/api";

function ViewCards({ cards = [], onDelete }) {
  const [error, setError] = useState(null);

  const { url } = useRouteMatch();

  const deleteCardHandler = async (cardId) => {
    try {
      setError(null);
      const response = window.confirm(
        "Delete this card? You will not be able to recover it.",
      );
      if (response) {
        await deleteCard(cardId);
        onDelete(cardId);
      }
    } catch (failure) {
      setError(failure.message || "Could not save. Please try again.");
    }
  };

  const styledCards = cards.map((card, index) => (
    <div key={index} className="card">
      <div className="card-body">
        <div className="row d-flex justify-content-between">
          <div className="col-5">{card.front}</div>
          <div className="col-5">
            {card.back}
            <div>
              <Link to={`${url}/cards/${card.id}/edit`}>
                <i className="fas fa-edit"></i> Edit
              </Link>
              <button
                className="btn btn-danger m-3"
                onClick={() => deleteCardHandler(card.id)}
              >
                <i className="fas fa-trash"></i> Delete Card
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  ));
  return (
    <React.Fragment>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <div className="card">
        <div className="card-header text-center">
          <h2 className="text-center">Cards</h2>
        </div>
      </div>
      {cards.length === 0 && <p>No cards yet. Add a card to this deck.</p>}
      {styledCards}
    </React.Fragment>
  );
}

export default ViewCards;
