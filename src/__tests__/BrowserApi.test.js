import { createBrowserApi } from "../utils/api/browser";
function storage() {
  const data = new Map();
  return {
    getItem: (key) => data.get(key) || null,
    setItem: (key, value) => data.set(key, value),
    removeItem: (key) => data.delete(key),
  };
}
let disk, api;
beforeEach(() => {
  disk = storage();
  api = createBrowserApi(() => disk);
});
test("deck and card edits persist across API instances, and separate browsers stay independent", async () => {
  const deck = await api.createDeck({
    name: "Languages",
    description: "Practice",
  });
  const card = await api.createCard(deck.id, { front: "Hello", back: "Hola" });
  await api.updateDeck({ ...deck, name: "Spanish" });
  await api.updateCard({ ...card, back: "Buenos días" });
  const reopened = createBrowserApi(() => disk);
  expect((await reopened.readDeck(deck.id)).name).toBe("Spanish");
  expect((await reopened.readCard(card.id)).back).toBe("Buenos días");
  expect(await createBrowserApi(() => storage()).listDecks()).toHaveLength(2);
});
test("deleting a deck removes its cards without changing another deck", async () => {
  await api.deleteDeck(1);
  await expect(api.readDeck(1)).rejects.toThrow("not found");
  await expect(api.readCard(1)).rejects.toThrow("not found");
  expect((await api.readDeck(2)).cards).toHaveLength(3);
});
test("deleting a card updates the deck count and reset restores seeds", async () => {
  await api.deleteCard(1);
  expect((await api.readDeck(1)).cards).toHaveLength(2);
  api.reset();
  expect((await api.readDeck(1)).cards).toHaveLength(3);
});
test("invalid input and missing parents cannot create records", async () => {
  await expect(
    api.createDeck({ name: "  ", description: "test" }),
  ).rejects.toThrow("Name");
  await expect(api.createCard(999, { front: "a", back: "b" })).rejects.toThrow(
    "not found",
  );
  await expect(api.createCard(1, { front: "a", back: "" })).rejects.toThrow(
    "Back",
  );
  expect((await api.readDeck(1)).cards).toHaveLength(3);
});
test("storage failure reports no success and keeps previously saved data intact", async () => {
  await api.updateDeck({ id: 1, name: "Saved", description: "Before failure" });
  disk.setItem = () => {
    throw new Error("quota");
  };
  await expect(
    api.createDeck({ name: "Lost", description: "No space" }),
  ).rejects.toThrow("could not be saved");
  expect(await api.listDecks()).toHaveLength(2);
  expect((await api.readDeck(1)).name).toBe("Saved");
});
test("corrupt data shows a recoverable error instead of silently overwriting it", async () => {
  disk.setItem("flashcard-o-matic-demo-v1", "bad json");
  await expect(api.listDecks()).rejects.toThrow("Reset demo");
  api.reset();
  expect(await api.listDecks()).toHaveLength(2);
});
