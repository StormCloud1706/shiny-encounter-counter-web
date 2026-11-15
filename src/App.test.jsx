import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import App from './App'

const pokemonCatalogResponse = {
  results: [
    { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' },
    { name: 'eevee', url: 'https://pokeapi.co/api/v2/pokemon/133/' },
    { name: 'chikorita', url: 'https://pokeapi.co/api/v2/pokemon/152/' },
    { name: 'charizard', url: 'https://pokeapi.co/api/v2/pokemon/6/' },
    { name: 'rattata', url: 'https://pokeapi.co/api/v2/pokemon/19/' },
    { name: 'raichu', url: 'https://pokeapi.co/api/v2/pokemon/26/' },
    { name: 'raticate', url: 'https://pokeapi.co/api/v2/pokemon/20/' },
  ],
}

const pokemonGenerationListResponse = {
  results: [
    { name: 'generation-i', url: 'https://pokeapi.co/api/v2/generation/1/' },
    { name: 'generation-ii', url: 'https://pokeapi.co/api/v2/generation/2/' },
  ],
}

const pokemonTypeListResponse = {
  results: [
    { name: 'grass', url: 'https://pokeapi.co/api/v2/type/12/' },
    { name: 'normal', url: 'https://pokeapi.co/api/v2/type/1/' },
  ],
}

const generationOneResponse = {
  id: 1,
  pokemon_species: [{ name: 'pikachu' }, { name: 'eevee' }],
}

const generationTwoResponse = {
  id: 2,
  pokemon_species: [{ name: 'chikorita' }],
}

const grassTypeResponse = {
  name: 'grass',
  pokemon: [{ pokemon: { name: 'chikorita' } }],
}

const normalTypeResponse = {
  name: 'normal',
  pokemon: [{ pokemon: { name: 'eevee' } }],
}

const eeveeDetailsResponse = {
  sprites: {
    other: {
      home: {
        front_default:
          'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/133.png',
        front_shiny:
          'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/133.png',
      },
      'official-artwork': {
        front_default:
          'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png',
        front_shiny:
          'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/133.png',
      },
    },
  },
}

const chikoritaDetailsResponse = {
  sprites: { front_shiny: null },
}

beforeEach(() => {
  localStorage.clear()
  const favicon = document.createElement('link')
  favicon.rel = 'icon'
  favicon.href = '/shiny-sparkles.svg?v=3'
  document.head.append(favicon)
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
    const requestUrl = String(url)
    let responseData = pokemonCatalogResponse

    if (requestUrl.includes('/generation?')) {
      responseData = pokemonGenerationListResponse
    } else if (requestUrl.includes('/type?')) {
      responseData = pokemonTypeListResponse
    } else if (requestUrl.includes('/generation/1/')) {
      responseData = generationOneResponse
    } else if (requestUrl.includes('/generation/2/')) {
      responseData = generationTwoResponse
    } else if (requestUrl.includes('/type/1/')) {
      responseData = normalTypeResponse
    } else if (requestUrl.includes('/type/12/')) {
      responseData = grassTypeResponse
    } else if (requestUrl.includes('/pokemon/eevee')) {
      responseData = eeveeDetailsResponse
    } else if (requestUrl.includes('/pokemon/chikorita')) {
      responseData = chikoritaDetailsResponse
    }

    return {
      ok: true,
      json: async () => responseData,
    }
  })
})

async function choosePokemon(user, pokemonName = 'eevee') {
  const pokemonPicker = await screen.findByRole('combobox', {
    name: 'Choose a Pokemon',
  })
  await user.selectOptions(pokemonPicker, pokemonName)
}

describe('Shiny Counter', () => {
    afterEach(() => {
        cleanup()
        vi.restoreAllMocks()
          document.querySelector('link[rel="icon"]')?.remove()
    })
    it('uses the shiny sparkle mark in the browser tab', () => {
      render(<App />)

      expect(document.querySelector('link[rel="icon"]')).toHaveAttribute(
        'href',
        '/shiny-sparkles.svg?v=3',
      )
    })
  it('starts with zero encounters', () => {
    render(<App />)

    expect(
      screen.getByRole('status', { name: 'Encounters: 0' }),
    ).toBeInTheDocument()
  })
  it('disables encounter actions until a Pokemon is selected', () => {
    render(<App />)

    expect(screen.getByRole('button', { name: 'Record encounter' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Undo encounter' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Reset hunt' })).toBeDisabled()
  })
  it('increments encounters when "Record encounter" is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)
    await choosePokemon(user)
    await user.click(screen.getByRole('button', { name: 'Record encounter' }))
    expect(
      screen.getByRole('status', { name: 'Encounters: 1' }),
    ).toBeInTheDocument()
  })
  it('decrements encounters when "Undo encounter" is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)
    await choosePokemon(user)
    await user.click(screen.getByRole('button', { name: 'Record encounter' }))
    await user.click(screen.getByRole('button', { name: 'Undo encounter' }))
    expect(
      screen.getByRole('status', { name: 'Encounters: 0' }),
    ).toBeInTheDocument()
  })
    it('does not go below zero encounters', async () => {
      const user = userEvent.setup()
    render(<App />)
      await choosePokemon(user)
      expect(screen.getByRole('button', { name: 'Undo encounter' })).toBeDisabled()

    expect(
      screen.getByRole('status', { name: 'Encounters: 0' }),
    ).toBeInTheDocument()
  })
    it('keeps the count when reset is cancelled', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
      const user = userEvent.setup()
    render(<App />)

      await choosePokemon(user)
      await user.click(screen.getByRole('button', { name: 'Record encounter' }))
      await user.click(screen.getByRole('button', { name: 'Reset hunt' }))

    expect(confirm).toHaveBeenCalledWith('Reset this hunt?')
    expect(
      screen.getByRole('status', { name: 'Encounters: 1' }),
    ).toBeInTheDocument()
  })
    it('resets the count when reset is confirmed', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
      const user = userEvent.setup()
    render(<App />)

      await choosePokemon(user)
      await user.click(screen.getByRole('button', { name: 'Record encounter' }))
      await user.click(screen.getByRole('button', { name: 'Reset hunt' }))

    expect(confirm).toHaveBeenCalledWith('Reset this hunt?')
    expect(
      screen.getByRole('status', { name: 'Encounters: 0' }),
    ).toBeInTheDocument()
  })
  it('keeps the current target and count when a target change is cancelled', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
    const user = userEvent.setup()
    render(<App />)

    await choosePokemon(user)
    await user.click(screen.getByRole('button', { name: 'Record encounter' }))
    const pokemonPicker = screen.getByRole('combobox', {
      name: 'Choose a Pokemon',
    })
    await user.selectOptions(pokemonPicker, 'pikachu')

    expect(confirm).toHaveBeenCalledWith(
      "Changing Pokemon will reset this hunt's encounter count. Continue?",
    )
    expect(pokemonPicker).toHaveValue('eevee')
    expect(
      screen.getByRole('heading', { name: 'Eevee hunt' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('status', { name: 'Encounters: 1' }),
    ).toBeInTheDocument()
  })
  it('clears the count when a target change is confirmed', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const user = userEvent.setup()
    render(<App />)

    await choosePokemon(user)
    await user.click(screen.getByRole('button', { name: 'Record encounter' }))
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Choose a Pokemon' }),
      'pikachu',
    )

    expect(
      screen.getByRole('heading', { name: 'Pikachu hunt' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('status', { name: 'Encounters: 0' }),
    ).toBeInTheDocument()
  })
  it('updates the hunt heading when a Pokemon is selected', async () => {
    const user = userEvent.setup()
    render(<App />)

    const pokemonPicker = await screen.findByRole('combobox', {
      name: 'Choose a Pokemon',
    })
    await user.selectOptions(pokemonPicker, 'eevee')

    expect(
      screen.getByRole('heading', { name: 'Eevee hunt' }),
    ).toBeInTheDocument()
    expect(
      await screen.findByRole('img', { name: 'Eevee regular artwork' }),
    ).toHaveAttribute(
      'src',
      eeveeDetailsResponse.sprites.other.home.front_default,
    )
    expect(
      await screen.findByRole('img', { name: 'Eevee shiny artwork' }),
    ).toHaveAttribute(
      'src',
      eeveeDetailsResponse.sprites.other.home.front_shiny,
    )
    expect(document.querySelector('.regular-figure .shiny-indicator')).toBeNull()
    expect(document.querySelectorAll('.shiny-figure .shiny-indicator')).toHaveLength(1)
    expect(
      document.querySelector('.shiny-indicator'),
    ).toHaveAttribute('aria-hidden', 'true')
    expect(document.querySelector('link[rel="icon"]')).toHaveAttribute(
      'href',
      '/shiny-sparkles.svg?v=3',
    )
  })
  it('explains when a shiny sprite is unavailable', async () => {
    const user = userEvent.setup()
    render(<App />)

    const pokemonPicker = await screen.findByRole('combobox', {
      name: 'Choose a Pokemon',
    })
    await user.selectOptions(pokemonPicker, 'chikorita')

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Shiny artwork unavailable.',
    )
  })
    it('filters the catalogue by search text', async () => {
    const user = userEvent.setup()
    render(<App />)

    const searchInput = await screen.findByRole('searchbox', {
      name: 'Search Pokemon',
    })
    await user.type(searchInput, 'eev')

    expect(
      screen.getByRole('option', { name: 'Eevee' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('option', { name: 'Pikachu' }),
    ).not.toBeInTheDocument()
  })
  it('shows search suggestions that can be chosen', async () => {
    const user = userEvent.setup()
    render(<App />)

    const searchInput = await screen.findByRole('searchbox', {
      name: 'Search Pokemon',
    })
    await user.type(searchInput, 'eev')

    const suggestion = screen.getByRole('button', { name: 'Eevee' })
    await user.click(suggestion)

    expect(
      screen.getByRole('heading', { name: 'Eevee hunt' }),
    ).toBeInTheDocument()
    expect(searchInput).toHaveValue('')
  })
  it('ranks names starting with the query alphabetically before other matches', async () => {
    const user = userEvent.setup()
    render(<App />)

    const searchInput = await screen.findByRole('searchbox', {
      name: 'Search Pokemon',
    })
    await user.type(searchInput, 'r')

    const suggestions = within(
      screen.getByRole('group', { name: 'Pokemon suggestions' }),
    ).getAllByRole('button')
    const suggestionNames = suggestions.map((suggestion) => suggestion.textContent)

    expect(suggestionNames.slice(0, 3)).toEqual([
      'Raichu',
      'Raticate',
      'Rattata',
    ])
    expect(suggestionNames.indexOf('Charizard')).toBeGreaterThan(2)
  })
  it('hides search suggestions when focus leaves the search control', async () => {
    const user = userEvent.setup()
    render(<App />)

    const searchInput = await screen.findByRole('searchbox', {
      name: 'Search Pokemon',
    })
    await user.type(searchInput, 'eev')
    expect(screen.getByRole('button', { name: 'Eevee' })).toBeInTheDocument()

    await user.click(screen.getByRole('heading', { name: 'Shiny hunt' }))

    expect(screen.queryByRole('button', { name: 'Eevee' })).not.toBeInTheDocument()
  })
  it('clears search and filters without changing the active hunt', async () => {
    const user = userEvent.setup()
    render(<App />)

    await choosePokemon(user)
    const searchInput = await screen.findByRole('searchbox', {
      name: 'Search Pokemon',
    })
    await user.type(searchInput, 'eev')
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Filter by generation' }),
      '2',
    )
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Filter by type' }),
      'grass',
    )
    await user.click(screen.getByRole('button', { name: 'Clear filters' }))

    expect(searchInput).toHaveValue('')
    expect(
      screen.getByRole('combobox', { name: 'Filter by generation' }),
    ).toHaveValue('')
    expect(
      screen.getByRole('combobox', { name: 'Filter by type' }),
    ).toHaveValue('')
    expect(
      screen.getByRole('combobox', { name: 'Choose a Pokemon' }),
    ).toHaveValue('eevee')
    expect(
      screen.getByRole('heading', { name: 'Eevee hunt' }),
    ).toBeInTheDocument()
  })
  it('filters the catalogue by generation', async () => {
    const user = userEvent.setup()
    render(<App />)

    const generationFilter = await screen.findByRole('combobox', {
      name: 'Filter by generation',
    })
    await user.selectOptions(generationFilter, '2')

    expect(
      screen.getByRole('option', { name: 'Chikorita' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('option', { name: 'Pikachu' }),
    ).not.toBeInTheDocument()
  })
  it('filters the catalogue by Pokemon type', async () => {
    const user = userEvent.setup()
    render(<App />)

    const typeFilter = await screen.findByRole('combobox', {
      name: 'Filter by type',
    })
    await user.selectOptions(typeFilter, 'grass')

    expect(
      screen.getByRole('option', { name: 'Chikorita' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('option', { name: 'Eevee' }),
    ).not.toBeInTheDocument()
  })
  it('keeps the active target visible when filtering generations', async () => {
    const user = userEvent.setup()
    render(<App />)

    await choosePokemon(user)
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Filter by generation' }),
      '2',
    )

    const pokemonPicker = screen.getByRole('combobox', {
      name: 'Choose a Pokemon',
    })
    expect(pokemonPicker).toHaveValue('eevee')
    expect(
      screen.getByRole('option', { name: 'Eevee (current target)' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Eevee hunt' }),
    ).toBeInTheDocument()
  })
})