import { useState } from 'react'
import { formatPokemonName } from '../api/pokemon'

export default function PokemonPicker({
  catalogStatus,
  pokemonCatalog,
  pokemonGenerations,
  pokemonTypes,
  selectedPokemon,
  selectedGeneration,
  selectedType,
  searchText,
  onGenerationChange,
  onTypeChange,
  onSearchChange,
  onPokemonChange,
}) {
  const [searchFocused, setSearchFocused] = useState(false)
  const selectedGenerationData = pokemonGenerations.find(
    (generation) => generation.id === Number(selectedGeneration),
  )
  const selectedTypeData = pokemonTypes.find(
    (type) => type.name === selectedType,
  )
  const normalizedSearch = searchText.trim().toLowerCase()
  const hasActiveFilters = Boolean(
    normalizedSearch || selectedGeneration || selectedType,
  )
  const filteredPokemon = pokemonCatalog.filter((entry) => {
    const matchesSearch = formatPokemonName(entry.name)
      .toLowerCase()
      .includes(normalizedSearch)
    const matchesGeneration =
      !selectedGenerationData ||
      selectedGenerationData.species.includes(entry.name)
    const matchesType =
      !selectedTypeData || selectedTypeData.species.includes(entry.name)

    return matchesSearch && matchesGeneration && matchesType
  })
  if (normalizedSearch) {
    filteredPokemon.sort((left, right) => {
      const leftName = formatPokemonName(left.name).toLowerCase()
      const rightName = formatPokemonName(right.name).toLowerCase()
      const leftStartsWithQuery = leftName.startsWith(normalizedSearch)
      const rightStartsWithQuery = rightName.startsWith(normalizedSearch)

      if (leftStartsWithQuery !== rightStartsWithQuery) {
        return leftStartsWithQuery ? -1 : 1
      }

      return leftName.localeCompare(rightName)
    })
  }
  const selectedPokemonIsFilteredOut =
    selectedPokemon &&
    !filteredPokemon.some((entry) => entry.name === selectedPokemon)

  return (
    <section className="selection-panel" aria-labelledby="selection-title">
      <div className="panel-heading">
        <span className="step-number">01</span>
        <div>
          <p className="eyebrow">Target</p>
          <h2 id="selection-title">Choose a Pokemon</h2>
        </div>
      </div>

      {catalogStatus === 'loading' && (
        <p className="status-message" role="status">
          Loading Pokemon catalog...
        </p>
      )}
      {catalogStatus === 'error' && (
        <p className="status-message error-message" role="alert">
          Could not load the Pokemon catalog. Refresh to try again.
        </p>
      )}
      {catalogStatus === 'ready' && (
        <div className="selection-controls">
          <div className="filter-fields">
            <div className="field">
              <label htmlFor="generation-filter">Filter by generation</label>
              <select
                id="generation-filter"
                value={selectedGeneration}
                onChange={(event) => onGenerationChange(event.target.value)}
              >
                <option value="">All generations</option>
                {pokemonGenerations.map((generation) => (
                  <option key={generation.id} value={generation.id}>
                    Generation {generation.id}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="type-filter">Filter by type</label>
              <select
                id="type-filter"
                value={selectedType}
                onChange={(event) => onTypeChange(event.target.value)}
              >
                <option value="">All types</option>
                {pokemonTypes.map((type) => (
                  <option key={type.name} value={type.name}>
                    {formatPokemonName(type.name)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="filter-summary">
            <span className="catalog-count">{filteredPokemon.length} found</span>
            {hasActiveFilters && (
              <button
                type="button"
                className="clear-filters"
                onClick={() => {
                  onSearchChange('')
                  onGenerationChange('')
                  onTypeChange('')
                  setSearchFocused(false)
                }}
              >
                Clear filters
              </button>
            )}
          </div>

          <div className="field">
            <label htmlFor="pokemon-search">Search Pokemon</label>
            <div
              className="search-control"
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  setSearchFocused(false)
                }
              }}
            >
              <input
                id="pokemon-search"
                type="search"
                placeholder="Try Eevee"
                value={searchText}
                onFocus={() => setSearchFocused(true)}
                onChange={(event) => onSearchChange(event.target.value)}
              />
              {searchFocused && searchText.trim() && filteredPokemon.length > 0 && (
                <div
                  className="search-suggestions"
                  role="group"
                  aria-label="Pokemon suggestions"
                >
                  {filteredPokemon.slice(0, 6).map((entry) => (
                    <button
                      key={entry.name}
                      type="button"
                      className="search-suggestion"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        onPokemonChange(entry.name)
                        onSearchChange('')
                        setSearchFocused(false)
                      }}
                    >
                      {formatPokemonName(entry.name)}
                    </button>
                  ))}
                </div>
              )}
              {searchFocused && searchText.trim() && filteredPokemon.length === 0 && (
                <p className="search-empty">No Pokemon found.</p>
              )}
            </div>
          </div>

          <div className="field">
            <label htmlFor="pokemon-choice">Choose a Pokemon</label>
            <select
              id="pokemon-choice"
              value={selectedPokemon}
              onChange={(event) => onPokemonChange(event.target.value)}
            >
              <option value="">Select a Pokemon</option>
              {selectedPokemonIsFilteredOut && (
                <option value={selectedPokemon}>
                  {formatPokemonName(selectedPokemon)} (current target)
                </option>
              )}
              {filteredPokemon.map((entry) => (
                <option key={entry.name} value={entry.name}>
                  {formatPokemonName(entry.name)}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

    </section>
  )
}