import React from "react";
import { Router } from "react-router-dom";
import { createMemoryHistory } from "history";
import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "../App";
import { readDeck, createDeck, listDecks, updateDeck } from "../utils/api";
jest.mock("../utils/api");
const deck = {
  id: 1,
  name: "Practice",
  description: "Test deck",
  cards: [1, 2, 3].map((id) => ({
    id,
    deckId: 1,
    front: "Question " + id,
    back: "Answer " + id,
  })),
};
function open(path) {
  const history = createMemoryHistory({ initialEntries: [path] });
  render(
    <Router history={history}>
      <App />
    </Router>,
  );
  return history;
}
test("study advances through every card, restarts on its front, and can finish", async () => {
  readDeck.mockResolvedValue(deck);
  const history = open("/decks/1/study");
  await screen.findByText("Question: Question 1");
  for (let i = 1; i <= 2; i++) {
    fireEvent.click(screen.getByText("Flip"));
    expect(screen.getByText("Answer: Answer " + i)).toBeTruthy();
    fireEvent.click(screen.getByText("Next"));
    expect(screen.getByText("Question: Question " + (i + 1))).toBeTruthy();
    expect(screen.queryByText("Next")).toBeNull();
  }
  const confirm = jest.spyOn(window, "confirm").mockReturnValue(true);
  fireEvent.click(screen.getByText("Flip"));
  fireEvent.click(screen.getByText("Next"));
  expect(screen.getByText("Question: Question 1")).toBeTruthy();
  for (let i = 1; i <= 2; i++) {
    fireEvent.click(screen.getByText("Flip"));
    fireEvent.click(screen.getByText("Next"));
  }
  confirm.mockReturnValue(false);
  fireEvent.click(screen.getByText("Flip"));
  await act(async () => {
    fireEvent.click(screen.getByText("Next"));
  });
  expect(history.location.pathname).toBe("/decks/1");
  confirm.mockRestore();
});
test("failed create keeps inputs and shows a useful error", async () => {
  createDeck.mockRejectedValue(new Error("Storage is full"));
  open("/decks/new");
  fireEvent.change(screen.getByLabelText("Name"), {
    target: { value: "Keep me" },
  });
  fireEvent.change(screen.getByLabelText("Description"), {
    target: { value: "Keep this too" },
  });
  fireEvent.submit(screen.getByText("Submit").closest("form"));
  await screen.findByRole("alert");
  expect(screen.getByDisplayValue("Keep me")).toBeTruthy();
  expect(screen.getByText("Storage is full")).toBeTruthy();
});
test("missing deck and unavailable API show errors instead of a blank screen", async () => {
  readDeck.mockRejectedValue(new Error("Deck not found"));
  open("/decks/999");
  expect(await screen.findByRole("alert")).toHaveTextContent("Deck not found");
});
test("home distinguishes loading from an empty deck library", async () => {
  let finish;
  listDecks.mockReturnValue(
    new Promise((resolve) => {
      finish = resolve;
    }),
  );
  open("/");
  expect(screen.getByRole("status")).toHaveTextContent("Loading");
  finish([]);
  expect(await screen.findByText(/No decks yet/)).toBeTruthy();
});
test("edit deck saves on normal form submission", async () => {
  readDeck.mockResolvedValue(deck);
  updateDeck.mockResolvedValue({ ...deck, name: "Updated" });
  const history = open("/decks/1/edit");
  await screen.findByDisplayValue("Practice");
  fireEvent.change(screen.getByLabelText("Name"), {
    target: { value: "Updated" },
  });
  await act(async () => {
    fireEvent.submit(screen.getByText("Submit").closest("form"));
  });
  expect(updateDeck).toHaveBeenCalledWith(
    expect.objectContaining({ name: "Updated" }),
  );
  expect(history.location.pathname).toBe("/decks/1");
});
