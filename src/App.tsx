import { useEffect } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Home from './components/Home'
import LessonPage from './components/LessonPage'
import Glossary from './components/Glossary'
import Toolkit from './components/Toolkit'
import Sources from './components/Sources'
import Brand from './components/Brand'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function NotFound() {
  return (
    <main className="page narrow">
      <h1>This page does not exist</h1>
      <p>
        The address may be wrong, or the lesson was renamed. <Link to="/">Go to the map</Link> to find it.
      </p>
    </main>
  )
}

export default function App() {
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <ScrollToTop />
      <Header />
      <div id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lesson/:id" element={<LessonPage />} />
          <Route path="/toolkit" element={<Toolkit />} />
          <Route path="/glossary" element={<Glossary />} />
          <Route path="/sources" element={<Sources />} />
          <Route path="/brand" element={<Brand />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <footer className="foot">
        <p>
          Runs on your machine. Progress is saved in this browser only. Concepts follow the books and community
          references on the <Link to="/sources">sources page</Link>. <Link to="/brand">Name and logo options</Link>.
        </p>
      </footer>
    </>
  )
}
