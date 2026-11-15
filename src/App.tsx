import { Fragment, lazy, Suspense, useEffect } from 'react'
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Home from './components/Home'
import Landing from './components/intro/Landing'
import { SUBJECTS, subjectOfPath } from './data/subjects'
const LessonPage = lazy(() => import('./components/lesson/LessonPage'))
const Glossary = lazy(() => import('./components/Glossary'))
const Toolkit = lazy(() => import('./components/Toolkit'))
const Interviews = lazy(() => import('./components/Interviews'))
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
        The address may be wrong, or the lesson was renamed. <Link to="/">Go to the home page</Link> and choose a subject.
      </p>
    </main>
  )
}

function Footer() {
  const subject = subjectOfPath(useLocation().pathname)
  return (
    <footer className="foot">
      <p>
        Free and <a href="https://github.com/AidanInceer/explained">open source</a>. Progress is saved in this browser only.
        {subject && (
          <>
            {' '}
            The lessons follow the books and references on the <Link to={`${subject.path}/sources`}>sources page</Link>.
          </>
        )}
      </p>
    </footer>
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
          <Route path="/" element={<Landing />} />
          <Route path="/data" element={<Home />} />
          <Route path="/lesson/:id" element={<LessonPage />} />
          {SUBJECTS.map((s) => (
            <Fragment key={s.id}>
              {s.status === 'planned' && <Route path={s.path} element={<SubjectPlan subject={s} />} />}
              <Route path={`${s.path}/toolkit`} element={<Toolkit subject={s} />} />
              <Route path={`${s.path}/glossary`} element={<Glossary subject={s} />} />
              <Route path={`${s.path}/interviews`} element={<Interviews subject={s} />} />
              <Route path={`${s.path}/sources`} element={<Sources subject={s} />} />
            </Fragment>
          ))}
          {/* Addresses from before there were three subjects. */}
          <Route path="/toolkit" element={<Navigate to="/data/toolkit" replace />} />
          <Route path="/glossary" element={<Navigate to="/data/glossary" replace />} />
          <Route path="/sources" element={<Navigate to="/data/sources" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </div>
      <Footer />
    </>
  )
}
