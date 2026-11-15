import { useEffect, useState } from 'react'
import './App.css'
import {
  getPokemonCatalog,
  getPokemonGenerations,
  getPokemonSprites,
  getPokemonTypes,
} from './api/pokemon'
import HuntPanel from './components/HuntPanel'
import PokemonPicker from './components/PokemonPicker'

function App() {
  const [count, setCount] = useState(0)
  const [pokemonCatalog, setPokemonCatalog] = useState([])
  const [pokemonGenerations, setPokemonGenerations] = useState([])
  const [pokemonTypes, setPokemonTypes] = useState([])
  const [selectedPokemon, setSelectedPokemon] = useState('')
  const [selectedGeneration, setSelectedGeneration] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [catalogStatus, setCatalogStatus] = useState('loading')
  const [searchText, setSearchText] = useState('')
  const [spriteData, setSpriteData] = useState(null)
  const [spriteStatus, setSpriteStatus] = useState('idle')

  useEffect(() => {
    let isMounted = true

    Promise.all([
      getPokemonCatalog(),
      getPokemonGenerations(),
      getPokemonTypes(),
    ])
      .then(([catalog, generations, types]) => {
        if (isMounted) {
          setPokemonCatalog(catalog)
          setPokemonGenerations(generations)
          setPokemonTypes(types)
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

  useEffect(() => {
    if (!selectedPokemon) {
      return
    }

    let isCurrentSelection = true

    getPokemonSprites(selectedPokemon)
      .then((sprites) => {
        if (isCurrentSelection) {
          setSpriteData(sprites)
          setSpriteStatus('ready')
        }
      })
      .catch(() => {
        if (isCurrentSelection) {
          setSpriteData(null)
          setSpriteStatus('error')
        }
      })

    return () => {
      isCurrentSelection = false
    }
  }, [selectedPokemon])

  function handlePokemonChange(nextPokemon) {
    if (
      count > 0 &&
      nextPokemon !== selectedPokemon &&
      !window.confirm(
        "Changing Pokemon will reset this hunt's encounter count. Continue?",
      )
    ) {
      return
    }

    if (nextPokemon !== selectedPokemon) {
      setCount(0)
    }
    setSelectedPokemon(nextPokemon)
    setSpriteData(null)
    setSpriteStatus(nextPokemon ? 'loading' : 'idle')
  }

  function handleReset() {
    if (window.confirm('Reset this hunt?')) {
      setCount(0)
    }
  }

  return (
    <main className="app-shell">
      <div className="workspace">
        <div className="workspace-heading">
          <h1>Shiny hunt</h1>
          <span className="edition-mark">Hunt 01</span>
        </div>

        <div className="hunt-grid">
          <PokemonPicker
            catalogStatus={catalogStatus}
            pokemonCatalog={pokemonCatalog}
            pokemonGenerations={pokemonGenerations}
            pokemonTypes={pokemonTypes}
            selectedPokemon={selectedPokemon}
            selectedGeneration={selectedGeneration}
            selectedType={selectedType}
            searchText={searchText}
            onGenerationChange={setSelectedGeneration}
            onTypeChange={setSelectedType}
            onSearchChange={setSearchText}
            onPokemonChange={handlePokemonChange}
          />
          <HuntPanel
            selectedPokemon={selectedPokemon}
            spriteData={spriteData}
            spriteStatus={spriteStatus}
            count={count}
            onRecord={() => setCount((currentCount) => currentCount + 1)}
            onUndo={() =>
              setCount((currentCount) => Math.max(0, currentCount - 1))
            }
            onReset={handleReset}
          />
        </div>

      </div>
    </main>
  )
}

export default App