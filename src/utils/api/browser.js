const KEY = "flashcard-o-matic-demo-v1";
const seed = {
  decks: [
    {
      id: 1,
      name: "Everyday Spanish",
      description: "A few useful phrases for your next conversation.",
    },
    {
      id: 2,
      name: "Web foundations",
      description: "Small questions about building things for the web.",
    },
  ],
  cards: [
    { id: 1, deckId: 1, front: "Good morning", back: "Buenos días" },
    { id: 2, deckId: 1, front: "Thank you", back: "Gracias" },
    { id: 3, deckId: 1, front: "See you later", back: "Hasta luego" },
    {
      id: 4,
      deckId: 2,
      front: "What does HTML describe?",
      back: "The structure and meaning of page content.",
    },
    {
      id: 5,
      deckId: 2,
      front: "What does CSS control?",
      back: "How content is presented: layout, color, spacing, and more.",
    },
    {
      id: 6,
      deckId: 2,
      front: "What does a URL identify?",
      back: "The location of a resource on the web.",
    },
  ],
};
const clone = (value) => JSON.parse(JSON.stringify(value));
const text = (value, name, max) => {
  if (typeof value !== "string" || !value.trim() || value.trim().length > max)
    throw new Error(`${name} must contain 1–${max} non-blank characters.`);
  return value.trim();
};
export function createBrowserApi(getStorage) {
  function load() {
    try {
      const raw = getStorage().getItem(KEY);
      if (!raw) return clone(seed);
      const data = JSON.parse(raw);
      if (!Array.isArray(data.decks) || !Array.isArray(data.cards))
        throw new Error();
      return data;
    } catch {
      throw new Error(
        "Saved demo data could not be opened. Enable browser storage or use Reset demo to restore the samples.",
      );
    }
  }
  function save(data) {
    try {
      getStorage().setItem(KEY, JSON.stringify(data));
    } catch {
      throw new Error(
        "Your changes could not be saved. Browser storage may be blocked or full. Your form has been kept.",
      );
    }
  }
  function find(rows, id, name) {
    const item = rows.find((row) => row.id === Number(id));
    if (!item)
      throw new Error(`${name} not found. Return home to choose another deck.`);
    return item;
  }
  const deckFields = (d) => ({
    name: text(d.name, "Name", 120),
    description: text(d.description, "Description", 1000),
  });
  const cardFields = (c) => ({
    front: text(c.front, "Front", 3000),
    back: text(c.back, "Back", 3000),
  });
  const nextId = (rows) => Math.max(0, ...rows.map((row) => row.id)) + 1;
  const withCards = (d, data) => ({
    ...d,
    cards: data.cards.filter((c) => c.deckId === d.id),
  });
  return {
    async listDecks() {
      const d = load();
      return d.decks.map((deck) => withCards(deck, d));
    },
    async readDeck(id) {
      const d = load();
      return withCards(find(d.decks, id, "Deck"), d);
    },
    async createDeck(deck) {
      const d = load();
      if (d.decks.length >= 100)
        throw new Error("This demo supports up to 100 decks.");
      const item = { ...deckFields(deck), id: nextId(d.decks) };
      d.decks.push(item);
      save(d);
      return clone(item);
    },
    async updateDeck(deck) {
      const d = load();
      const item = find(d.decks, deck.id, "Deck");
      Object.assign(item, deckFields(deck));
      save(d);
      return clone(item);
    },
    async deleteDeck(id) {
      const d = load();
      find(d.decks, id, "Deck");
      d.decks = d.decks.filter((x) => x.id !== Number(id));
      d.cards = d.cards.filter((x) => x.deckId !== Number(id));
      save(d);
      return {};
    },
    async listCards(id) {
      const d = load();
      find(d.decks, id, "Deck");
      return d.cards.filter((c) => c.deckId === Number(id));
    },
    async readCard(id) {
      return clone(find(load().cards, id, "Card"));
    },
    async createCard(deckId, card) {
      const d = load();
      find(d.decks, deckId, "Deck");
      if (d.cards.length >= 1000)
        throw new Error("This demo supports up to 1,000 cards.");
      const item = {
        ...cardFields(card),
        id: nextId(d.cards),
        deckId: Number(deckId),
      };
      d.cards.push(item);
      save(d);
      return clone(item);
    },
    async updateCard(card) {
      const d = load();
      const item = find(d.cards, card.id, "Card");
      Object.assign(item, cardFields(card));
      save(d);
      return clone(item);
    },
    async deleteCard(id) {
      const d = load();
      find(d.cards, id, "Card");
      d.cards = d.cards.filter((c) => c.id !== Number(id));
      save(d);
      return {};
    },
    reset() {
      try {
        getStorage().removeItem(KEY);
      } catch {
        throw new Error(
          "Browser storage is unavailable. Enable it and try again.",
        );
      }
    },
  };
}
