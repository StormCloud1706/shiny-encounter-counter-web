import { useEffect, useState } from 'react'
import './App.css'

const CATALOG_URL = 'https://pokeapi.co/api/v2/pokemon-species?limit=2000'
const CATALOG_CACHE_KEY = 'shiny-counter.pokemon-species.v1'
const GENERATION_URL = 'https://pokeapi.co/api/v2/generation?limit=20'
const GENERATION_CACHE_KEY = 'shiny-counter.generations.v1'

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

async function getPokemonGenerations() {
  const cachedGenerations = localStorage.getItem(GENERATION_CACHE_KEY)
  if (cachedGenerations) {
    return JSON.parse(cachedGenerations)
  }

  const listResponse = await fetch(GENERATION_URL)
  if (!listResponse.ok) {
    throw new Error('Could not load Pokemon generations')
  }

  const generationList = await listResponse.json()
  if (!Array.isArray(generationList.results)) {
    throw new Error('Pokemon generation response was not a list')
  }

  const generations = await Promise.all(
    generationList.results.map(async (generation) => {
      const response = await fetch(generation.url)
      if (!response.ok) {
        throw new Error('Could not load a Pokemon generation')
      }

      const data = await response.json()
      return {
        id: data.id,
        species: data.pokemon_species.map((entry) => entry.name),
      }
    }),
  )

  localStorage.setItem(GENERATION_CACHE_KEY, JSON.stringify(generations))
  return generations
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
  const [pokemonGenerations, setPokemonGenerations] = useState([])
  const [selectedPokemon, setSelectedPokemon] = useState('')
  const [selectedGeneration, setSelectedGeneration] = useState('')
  const [catalogStatus, setCatalogStatus] = useState('loading')
  const [searchText, setSearchText] = useState('')

  const selectedGenerationData = pokemonGenerations.find(
    (generation) => generation.id === Number(selectedGeneration),
  )
  const normalizedSearch = searchText.trim().toLowerCase()
  const filteredPokemon = pokemonCatalog.filter((entry) => {
    const matchesSearch = formatPokemonName(entry.name)
      .toLowerCase()
      .includes(normalizedSearch)
    const matchesGeneration =
      !selectedGenerationData ||
      selectedGenerationData.species.includes(entry.name)

    return matchesSearch && matchesGeneration
  })

  useEffect(() => {
    let isMounted = true

    Promise.all([getPokemonCatalog(), getPokemonGenerations()])
      .then(([catalog, generations]) => {
        if (isMounted) {
          setPokemonCatalog(catalog)
          setPokemonGenerations(generations)
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
        {catalogStatus === 'loading' && (
          <p role="status">Loading Pokemon catalog...</p>
        )}
        {catalogStatus === 'error' && (
          <p role="alert">
            Could not load the Pokemon catalog. Refresh to try again.
          </p>
        )}
        {catalogStatus === 'ready' && (
          <>
            <label htmlFor="generation-filter">Filter by generation</label>
            <select
              id="generation-filter"
              value={selectedGeneration}
              onChange={(event) => setSelectedGeneration(event.target.value)}
            >
              <option value="">All generations</option>
              {pokemonGenerations.map((generation) => (
                <option key={generation.id} value={generation.id}>
                  Generation {generation.id}
                </option>
              ))}
            </select>
            <label htmlFor="pokemon-search">Search Pokemon</label>
            <input
              id="pokemon-search"
              type="search"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />
            <label htmlFor="pokemon-choice">Choose a Pokemon</label>
            <select
              id="pokemon-choice"
              value={selectedPokemon}
              onChange={(event) => setSelectedPokemon(event.target.value)}
            >
              <option value="">Select a Pokemon</option>
              {filteredPokemon.map((entry) => (
                <option key={entry.name} value={entry.name}>
                  {formatPokemonName(entry.name)}
                </option>
              ))}
            </select>
          </>
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
