import Navbar from './components/Navbar'
import Hero from './sections/Hero'
import Projects from './sections/Projects'
import Contact from './sections/Contact'
import EnergyTrail from './components/EnergyTrail'
import trailStyles from './components/EnergyTrail.module.css'

export default function App() {
  return (
    <>
      <Navbar />
      <div className={trailStyles.stage}>
        <Hero />
        <Projects />
        <Contact />
        <EnergyTrail />
      </div>
    </>
  )
}
