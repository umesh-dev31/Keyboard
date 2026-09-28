import React, { Component } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

/** Root boundary: converts a blank page into a readable error. */
class RootBoundary extends Component {
  constructor(p) {
    super(p)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error) {
    return { error }
  }
  componentDidCatch(error) {
    // eslint-disable-next-line no-console
    console.error('[NOVA] root render error:', error)
  }
  render() {
    if (this.state.error) {
      const e = this.state.error
      return (
        <pre
          style={{
            position: 'fixed',
            inset: 0,
            padding: 24,
            background: '#0A0A0A',
            color: '#f87171',
            font: '13px/1.6 monospace',
            whiteSpace: 'pre-wrap',
            zIndex: 99999,
          }}
        >
          NOVA failed to render:{'\n'}
          {String(e?.stack || e?.message || e)}
        </pre>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RootBoundary>
      <App />
    </RootBoundary>
  </React.StrictMode>
)
