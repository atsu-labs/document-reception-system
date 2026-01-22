import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

function HomePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">届出管理システム</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Document Reception Management System
        </p>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Backend: Hono + Drizzle ORM + Wrangler</p>
          <p>Frontend: React + Vite + shadcn/ui</p>
          <p>Development environment is ready! 🎉</p>
        </div>
      </div>
    </div>
  );
}

export default App;
