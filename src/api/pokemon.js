const CATALOG_URL = 'https://pokeapi.co/api/v2/pokemon-species?limit=2000'
const CATALOG_CACHE_KEY = 'shiny-counter.pokemon-species.v1'
const GENERATION_URL = 'https://pokeapi.co/api/v2/generation?limit=20'
const GENERATION_CACHE_KEY = 'shiny-counter.generations.v1'
const TYPE_URL = 'https://pokeapi.co/api/v2/type?limit=100'
const TYPE_CACHE_KEY = 'shiny-counter.types.v1'
const SPRITE_CACHE_KEY = 'shiny-counter.sprite-pair.v3'

export async function getPokemonCatalog() {
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

export async function getPokemonGenerations() {
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

export async function getPokemonTypes() {
  const cachedTypes = localStorage.getItem(TYPE_CACHE_KEY)
  if (cachedTypes) {
    return JSON.parse(cachedTypes)
  }

  const listResponse = await fetch(TYPE_URL)
  if (!listResponse.ok) {
    throw new Error('Could not load Pokemon types')
  }

  const typeList = await listResponse.json()
  if (!Array.isArray(typeList.results)) {
    throw new Error('Pokemon type response was not a list')
  }

  const types = await Promise.all(
    typeList.results
      // These API entries are placeholders rather than useful hunt filters.
      .filter((type) => !['unknown', 'shadow'].includes(type.name))
      .map(async (type) => {
        const response = await fetch(type.url)
        if (!response.ok) {
          throw new Error('Could not load a Pokemon type')
        }

        const data = await response.json()
        return {
          name: data.name,
          species: data.pokemon.map((entry) => entry.pokemon.name),
        }
      }),
  )

  localStorage.setItem(TYPE_CACHE_KEY, JSON.stringify(types))
  return types
}

export async function getPokemonSprites(name) {
  const cacheKey = `${SPRITE_CACHE_KEY}:${name}`
  const cachedSprite = localStorage.getItem(cacheKey)
  if (cachedSprite) {
    return JSON.parse(cachedSprite)
  }

  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
  if (!response.ok) {
    throw new Error('Could not load the Pokemon sprite')
  }

  const data = await response.json()
  const sprites = {
    regular:
      data.sprites?.other?.home?.front_default ??
      data.sprites?.other?.['official-artwork']?.front_default ??
      data.sprites?.front_default,
    shiny:
      data.sprites?.other?.home?.front_shiny ??
      data.sprites?.other?.['official-artwork']?.front_shiny ??
      data.sprites?.front_shiny,
  }

  if (!sprites.shiny) {
    throw new Error('Shiny sprite is unavailable')
  }

  localStorage.setItem(cacheKey, JSON.stringify(sprites))
  return sprites
}

export function formatPokemonName(name) {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}