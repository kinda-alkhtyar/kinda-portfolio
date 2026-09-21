import Navbar from '../components/Navbar'
import sword from '../assets/projects-page/hero-sword-red-energy..png'
import comingSoon from '../assets/projects-page/project-coming-soon-download..png'
import heading from '../assets/projects-page/projects-heading.png'
import logo from '../assets/projects/ka-logo.png'
import aqarati from '../assets/projects-page/aqarati-laptop-mockup.png'
import taaniqi from '../assets/projects-page/taaniqi-laptop-mockup.png'
import yumna from '../assets/projects-page/yumna-portfolio-laptop-mockup.png'
import styles from './ProjectsPage.module.css'

const projects = [
  { number: '01', title: 'Aqarati Syria', subtitle: 'Real estate platform', image: aqarati },
  { number: '02', title: 'Taaniqi with Iman', subtitle: 'Fashion & e-commerce', image: taaniqi },
  { number: '03', title: 'Yumna Al-Muallem Portfolio', subtitle: 'Design portfolio', image: yumna },
  { number: '04', title: 'FruitMilk', subtitle: '', image: null },
  { number: '05', title: 'Coming Soon', subtitle: 'A new project is on its way.', image: comingSoon },
  { number: '06', title: 'Coming Soon', subtitle: 'A new project is on its way.', image: comingSoon },
]

export default function ProjectsPage() {
  return (
    <div className={styles.page}>
      <Navbar currentPage="projects" />
      <main>
        <section className={styles.hero} aria-labelledby="projects-heading">
          <div className={styles.scene} aria-hidden="true">
            <img src={sword} alt="" fetchPriority="high" />
          </div>
          <div className={styles.heroContent}>
            <p className={styles.eyebrow}><span>03</span><span aria-hidden="true">—</span>Projects</p>
            <h1 id="projects-heading" className={styles.heading}><img src={heading} alt="Projects" width={2172} height={724} /></h1>
            <p className={styles.subtitle}>Digital products. Real impact.</p>
            <div className={styles.filters} role="group" aria-label="Project filters (preview only)">
              <button type="button" className={styles.selected} aria-pressed="true" aria-disabled="true">All</button>
              <button type="button" aria-pressed="false" aria-disabled="true">Websites</button>
              <button type="button" aria-pressed="false" aria-disabled="true">Apps</button>
            </div>
          </div>
          <p className={styles.verticalWords}>Ideas<br />Code<br />Products<br />A better<br />Tomorrow</p>
        </section>

        <section className={styles.work} aria-labelledby="selected-work-heading">
          <h2 id="selected-work-heading" className={styles.sectionHeading}>Selected work</h2>
          <div className={styles.grid}>
            {projects.map((project) => (
              <article className={styles.card} key={project.number} aria-labelledby={`work-${project.number}`}>
                <div className={styles.cardTop}><span>{project.number}</span><span>Website</span></div>
                <div className={`${styles.preview}${Number(project.number) > 4 ? ` ${styles.comingSoon}` : ''}`}>
                  {project.image
                    ? <img src={project.image} alt={Number(project.number) > 4 ? '' : `${project.title} website preview`} loading="lazy" decoding="async" />
                    : <p className={styles.missingPreview}>FruitMilk<span>Preview unavailable</span></p>}
                </div>
                <div className={styles.cardBottom}>
                  <div><h3 id={`work-${project.number}`}>{project.title}</h3><p>{project.subtitle}</p></div>
                  <span className={styles.arrow} aria-hidden="true">↗</span>
                </div>
              </article>
            ))}
          </div>
          <nav className={styles.pagination} aria-label="Projects pagination (preview only)">
            <button type="button" aria-label="Previous page" aria-disabled="true">←</button>
            <button type="button" aria-current="page" aria-disabled="true">1</button>
            <button type="button" aria-label="Page 2" aria-disabled="true">2</button>
            <button type="button" aria-label="Page 3" aria-disabled="true">3</button>
            <button type="button" aria-label="Next page" aria-disabled="true">→</button>
          </nav>
        </section>
      </main>
      <footer className={styles.footer}>
        <p>Let’s<br />build a brighter<br />tomorrow.</p>
        <div className={styles.footerMark}><img src={logo} alt="KA" width={1536} height={1024} /></div>
        <blockquote>“Better digital experiences for a brighter tomorrow.”</blockquote>
      </footer>
    </div>
  )
}
