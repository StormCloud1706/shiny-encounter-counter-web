import { formatPokemonName } from '../api/pokemon'
import ShinyIndicator from './ShinyIndicator'

export default function HuntPanel({
  selectedPokemon,
  spriteData,
  spriteStatus,
  count,
  onRecord,
  onUndo,
  onReset,
}) {
  return (
    <section className="hunt-panel" aria-labelledby="hunt-title">
      <div className="sprite-stage">
        <span className="stage-label">Regular / shiny</span>
        {spriteStatus === 'loading' && (
          <p className="stage-message" role="status">
            Loading artwork...
          </p>
        )}
        {spriteStatus === 'error' && (
          <p className="stage-message error-message" role="alert">
            Shiny artwork unavailable.
          </p>
        )}
        {spriteStatus === 'ready' && (
          <div className="sprite-pair">
            <figure className="sprite-figure regular-figure">
              {spriteData?.regular ? (
                <img
                  className="pokemon-sprite"
                  src={spriteData.regular}
                  width="200"
                  height="200"
                  alt={`${formatPokemonName(selectedPokemon)} regular artwork`}
                />
              ) : (
                <span className="sprite-unavailable">No regular art</span>
              )}
              <figcaption>Regular</figcaption>
            </figure>
            <figure className="sprite-figure shiny-figure">
              <div className="sprite-image-wrap">
                <ShinyIndicator />
                <img
                  className="pokemon-sprite"
                  src={spriteData.shiny}
                  width="200"
                  height="200"
                  alt={`${formatPokemonName(selectedPokemon)} shiny artwork`}
                />
              </div>
              <figcaption>Shiny</figcaption>
            </figure>
          </div>
        )}
        {spriteStatus === 'idle' && (
          <span className="stage-placeholder">Choose a target</span>
        )}
      </div>

      <div className="hunt-details">
        <div className="hunt-heading">
          <div>
            <p className="eyebrow">Current hunt</p>
            <h2 id="hunt-title">
              {selectedPokemon
                ? `${formatPokemonName(selectedPokemon)} hunt`
                : 'Choose a Pokemon to begin'}
            </h2>
          </div>
          <span className="hunt-number">01</span>
        </div>

        <div className="count-display">
          <p className="eyebrow">Encounters</p>
          <p
            className="count-number"
            role="status"
            aria-label={`Encounters: ${count}`}
            aria-live="polite"
          >
            {count}
          </p>
        </div>

        <div className="counter-actions">
          <button
            type="button"
            className="button-primary"
            aria-label="Record encounter"
            title="Record encounter"
            disabled={!selectedPokemon}
            onClick={onRecord}
          >
            <span aria-hidden="true">+</span>
          </button>
          <button
            type="button"
            className="button-secondary"
            aria-label="Undo encounter"
            title="Undo encounter"
            disabled={!selectedPokemon || count === 0}
            onClick={onUndo}
          >
            <span aria-hidden="true">-</span>
          </button>
          <button
            type="button"
            className="button-reset"
            aria-label="Reset hunt"
            title="Reset hunt"
            disabled={!selectedPokemon || count === 0}
            onClick={onReset}
          >
            Reset
          </button>
        </div>
      </div>
    </section>
  )
}