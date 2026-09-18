import styles from './Navbar.module.css'
import logo from '../assets/projects/ka-logo.png'

const links = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact', href: '#contact' },
]

export default function Navbar() {
  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Main navigation">
        <a className={styles.logo} href="#home" aria-label="Kinda Alhidyar home">
          <span className={styles.logoSpace} aria-hidden="true">KA</span>
          <img className={styles.logoImage} src={logo} alt="" width={1536} height={1024} />
        </a>

        <ul className={styles.links}>
          {links.map(({ label, href }) => (
            <li key={href}>
              <a
                className={styles.link}
                href={href}
                aria-current={href === '#home' ? 'page' : undefined}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        <span className={styles.availability}>
          <span className={styles.dot} aria-hidden="true" />
          Available for freelance
        </span>
      </nav>
    </header>
  )
}
