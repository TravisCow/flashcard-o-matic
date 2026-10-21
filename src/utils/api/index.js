import * as http from "./http";
import { createBrowserApi } from "./browser";
export const isDemo = process.env.REACT_APP_DEMO === "true";
const api = isDemo ? createBrowserApi(() => window.localStorage) : http;
export const {
  listDecks,
  readDeck,
  createDeck,
  updateDeck,
  deleteDeck,
  listCards,
  readCard,
  createCard,
  updateCard,
  deleteCard,
} = api;
export const resetDemo = () => api.reset();
