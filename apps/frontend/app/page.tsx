import { ConfigurationPanel } from './components/ConfigurationPanel'

export default function HomePage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-gray-900 mb-1">Amelia</h1>
        <p className="text-sm text-gray-500">La tua maestra di codice. Scegli come allenarti.</p>
      </div>
      <ConfigurationPanel />
    </main>
  )
}