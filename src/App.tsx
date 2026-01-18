export default function App() {
  return (
    <div className="min-h-screen bg-bg-primary p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-semibold text-text-primary">AV Designer</h1>
        <p className="text-text-secondary">Design system initialized with Tailwind CSS.</p>

        <div className="card p-6 space-y-4">
          <h2 className="text-xl font-medium text-text-primary">Button Variants</h2>
          <div className="flex flex-wrap gap-3">
            <button className="btn-primary">Primary</button>
            <button className="btn-secondary">Secondary</button>
            <button className="btn-ghost">Ghost</button>
            <button className="btn-danger">Danger</button>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="text-xl font-medium text-text-primary">Input</h2>
          <div className="space-y-2">
            <label className="label">Example Label</label>
            <input className="input" placeholder="Enter text..." />
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="text-xl font-medium text-text-primary">Status Pills</h2>
          <div className="flex flex-wrap gap-2">
            <span className="pill pill-quoting">Quoting</span>
            <span className="pill pill-review">Client Review</span>
            <span className="pill pill-ordered">Ordered</span>
            <span className="pill pill-progress">In Progress</span>
            <span className="pill pill-hold">On Hold</span>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="text-xl font-medium text-text-primary">Colors</h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-12 bg-bg-primary border border-white/10 rounded-md" />
              <p className="text-xs text-text-tertiary">bg-primary</p>
            </div>
            <div className="space-y-2">
              <div className="h-12 bg-bg-secondary rounded-md" />
              <p className="text-xs text-text-tertiary">bg-secondary</p>
            </div>
            <div className="space-y-2">
              <div className="h-12 bg-bg-tertiary rounded-md" />
              <p className="text-xs text-text-tertiary">bg-tertiary</p>
            </div>
            <div className="space-y-2">
              <div className="h-12 bg-accent-gold rounded-md" />
              <p className="text-xs text-text-tertiary">accent-gold</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
