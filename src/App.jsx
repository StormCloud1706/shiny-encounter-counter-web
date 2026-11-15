import { useEffect, useState } from 'react'
import './App.css'

const CATALOG_URL = 'https://pokeapi.co/api/v2/pokemon?limit=2000'
const CATALOG_CACHE_KEY = 'shiny-counter.pokemon-catalog.v1'

async function getPokemonCatalog() {
  const cachedCatalog = localStorage.getItem(CATALOG_CACHE_KEY)
  if (cachedCatalog) {
    return JSON.parse(cachedCatalog)
  }

  const response = await fetch(CATALOG_URL)
  if (!response.ok) {
    throw new Error('Could not load the Pokemon catalog')
  }

  const data = await response.json()
  if (!Array.isArray(data.results)) {
    throw new Error('Pokemon catalog response was not a list')
  }

  localStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify(data.results))
  return data.results
}

function formatPokemonName(name) {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function App() {
  const [count, setCount] = useState(0)
  const [pokemonCatalog, setPokemonCatalog] = useState([])
  const [selectedPokemon, setSelectedPokemon] = useState('')
  const [catalogStatus, setCatalogStatus] = useState('loading')

  useEffect(() => {
    let isMounted = true

    getPokemonCatalog()
      .then((catalog) => {
        if (isMounted) {
          setPokemonCatalog(catalog)
          setCatalogStatus('ready')
        }
      })
      .catch(() => {
        if (isMounted) {
          setCatalogStatus('error')
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <main id="center">
      <h1>Shiny Counter</h1>
      <section aria-labelledby="hunt-title">
        <label htmlFor="pokemon-choice">Choose a Pokemon</label>
        {catalogStatus === 'loading' && (
          <p role="status">Loading Pokemon catalog...</p>
        )}
        {catalogStatus === 'error' && (
          <p role="alert">
            Could not load the Pokemon catalog. Refresh to try again.
          </p>
        )}
        {catalogStatus === 'ready' && (
          <select
            id="pokemon-choice"
            value={selectedPokemon}
            onChange={(event) => setSelectedPokemon(event.target.value)}
          >
            <option value="">Select a Pokemon</option>
            {pokemonCatalog.map((entry) => (
              <option key={entry.name} value={entry.name}>
                {formatPokemonName(entry.name)}
              </option>
            ))}
          </select>
        )}
        <h2 id="hunt-title">
          {selectedPokemon
            ? `${formatPokemonName(selectedPokemon)} hunt`
            : 'Choose a Pokemon to begin'}
        </h2>
        <p aria-live="polite">Encounters: {count}</p>
        <button
          type="button"
          className="counter"
          onClick={() => setCount((currentCount) => currentCount + 1)}
        >
          Record encounter
        </button>

        <button
          type="button"
          className="counter"
          onClick={() =>
            setCount((currentCount) => Math.max(0, currentCount - 1))
          }
        >
          Undo encounter
        </button>

        <button
          type="button"
          className="counter"
          onClick={() => {
            if (window.confirm('Reset this hunt?')) {
              setCount(0)
            }
          }}
        >
          Reset hunt
        </button>

      </section>
    </main>
  )
}

export default App
