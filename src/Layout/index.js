import React from "react";
import { Route, Link, Switch } from "react-router-dom";
import Header from "./Header";
import NotFound from "./NotFound";
import Home from "./Home";
import StudyDeck from "./StudyDeck";
import CreateDeck from "./CreateDeck";
import ViewDeck from "./ViewDeck";
import EditDeck from "./EditDeck";
import AddCard from "./AddCard";
import EditCard from "./EditCard";

function Layout() {
  return (
    <React.Fragment>
      <Header />
      <main id="main" className="container">
        <Switch>
          <Route exact path="/">
            <Link className="btn btn-secondary" to="/decks/new">
              <i className="fas fa-plus"></i> Create Deck
            </Link>
            <Home />
          </Route>

          <Route exact path="/decks/new">
            <CreateDeck />
          </Route>

          <Route exact path="/decks/:deckId/study">
            <StudyDeck />
          </Route>

          <Route exact path="/decks/:deckId/edit">
            <EditDeck />
          </Route>

          <Route exact path="/decks/:deckId">
            <ViewDeck />
          </Route>

          <Route exact path="/decks/:deckId/cards/new">
            <AddCard />
          </Route>

          <Route exact path="/decks/:deckId/cards/:cardId/edit">
            <EditCard />
          </Route>

          <Route>
            <NotFound />
          </Route>
        </Switch>
      </main>
    </React.Fragment>
  );
}

export default Layout;
