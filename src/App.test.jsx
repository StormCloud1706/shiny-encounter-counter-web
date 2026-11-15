import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import App from './App'

const pokemonCatalogResponse = {
  results: [
    { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' },
    { name: 'eevee', url: 'https://pokeapi.co/api/v2/pokemon/133/' },
  ],
}

beforeEach(() => {
  localStorage.clear()
  vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok: true,
    json: async () => pokemonCatalogResponse,
  })
})

describe('Shiny Counter', () => {
    afterEach(() => {
        cleanup()
        vi.restoreAllMocks()
    })
  it('starts with zero encounters', () => {
    render(<App />)

    expect(screen.getByText('Encounters: 0')).toBeInTheDocument()
  })
  it('increments encounters when "Record encounter" is clicked', async () => {
    render(<App />)
    const button = screen.getByText('Record encounter')
    await button.click()
    expect(screen.getByText('Encounters: 1')).toBeInTheDocument()
  })
  it('decrements encounters when "Undo encounter" is clicked', async () => {
    render(<App />)
    const recordButton = screen.getByText('Record encounter')
    await recordButton.click()
    const undoButton = screen.getByText('Undo encounter')
    await undoButton.click()
    expect(screen.getByText('Encounters: 0')).toBeInTheDocument()
  })
    it('does not go below zero encounters', async () => {
    render(<App />)
    const undoButton = screen.getByText('Undo encounter')
    await undoButton.click()

    expect(screen.getByText('Encounters: 0')).toBeInTheDocument()
  })
    it('keeps the count when reset is cancelled', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<App />)

    await screen.getByText('Record encounter').click()
    await screen.getByText('Reset hunt').click()

    expect(confirm).toHaveBeenCalledWith('Reset this hunt?')
    expect(screen.getByText('Encounters: 1')).toBeInTheDocument()
  })
    it('resets the count when reset is confirmed', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<App />)

    await screen.getByText('Record encounter').click()
    await screen.getByText('Reset hunt').click()

    expect(confirm).toHaveBeenCalledWith('Reset this hunt?')
    expect(screen.getByText('Encounters: 0')).toBeInTheDocument()
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
})