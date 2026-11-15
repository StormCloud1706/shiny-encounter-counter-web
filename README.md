# Shiny Counter

A React app for tracking encounters during a Pokemon shiny hunt. The current
version supports one active hunt at a time.

## Features

- Search the Pokemon catalogue by name.
- Filter by generation and type.
- Compare the selected Pokemon's regular and shiny artwork side by side.
- Record and undo encounters, with a confirmed reset.
- Get a warning before switching targets if encounters would be discarded.
- Reuse cached catalogue, filter, and sprite data between visits.

Hunt progress is not saved yet. Refreshing the page resets the encounter count.
See [TODO.md](TODO.md) for the project roadmap.

## Code Layout

- `src/App.jsx` coordinates shared state and data loading.
- `src/api/pokemon.js` fetches and caches PokeAPI catalogue, generation, type,
	and sprite data.
- `src/components/PokemonPicker.jsx` contains search and catalogue filters.
- `src/components/HuntPanel.jsx` contains the sprite preview and encounter
	controls.
- `src/App.test.jsx` checks the main interactions with mocked API responses.

## Run Locally

You need Node.js and npm installed.

```sh
npm install
npm run dev
```

Vite prints a local URL in the terminal. Open that URL in your browser.

## Project Checks

```sh
npm test -- --run
npm run lint
npm run build
```

The tests use Vitest and React Testing Library. API responses are mocked in
tests, so the suite does not require an internet connection.

## Data and Artwork

Pokemon catalogue, generation, type, and sprite data come from
[PokeAPI](https://pokeapi.co/). The app caches those reference data in browser
storage; this does not save hunt progress. Pokemon and related artwork are
trademarks and property of their respective owners.
