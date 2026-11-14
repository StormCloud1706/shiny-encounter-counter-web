import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <main id="center">
      <h1>Shiny Counter</h1>
      <section aria-labelledby="hunt-title">
        <h2 id="hunt-title">Current hunt</h2>
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

      </section>
    </main>
  )
}

export default App
