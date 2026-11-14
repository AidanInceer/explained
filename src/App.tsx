import { lazy, Suspense, useEffect } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Home from './components/Home'
import { subjectById } from './data/subjects'
const LessonPage = lazy(() => import('./components/lesson/LessonPage'))
const Glossary = lazy(() => import('./components/Glossary'))
const Toolkit = lazy(() => import('./components/Toolkit'))
const Sources = lazy(() => import('./components/Sources'))
const SubjectPlan = lazy(() => import('./components/SubjectPlan'))

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
        <Suspense fallback={<p className="page" role="status">Loading</p>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lesson/:id" element={<LessonPage />} />
          <Route path="/toolkit" element={<Toolkit />} />
          <Route path="/glossary" element={<Glossary />} />
          <Route path="/sources" element={<Sources />} />
          <Route path="/software" element={<SubjectPlan subject={subjectById.software} />} />
          <Route path="/ai" element={<SubjectPlan subject={subjectById.ai} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </div>
      <footer className="foot">
        <p>
          Free and <a href="https://github.com/AidanInceer/explained">open source</a>. Progress is saved in this browser only. Concepts follow the books and community
          references on the <Link to="/sources">sources page</Link>.
        </p>
      </footer>
    </>
  )
}
