import styles from './Navbar.module.css'
import logo from '../assets/projects/ka-logo.png'
import LanguageSwitcher from './LanguageSwitcher'
import { useI18n } from '../i18n/locale'

const links = [
  { label: 'Home', href: '#home' },
  { label: 'Projects', href: '/projects' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: '3D', href: '/3d' },
]
const labelMap = { Home: 'navHome', Projects: 'navProjects', About: 'navAbout', Contact: 'navContact', '3D': 'nav3d' } as const

export default function Navbar({ currentPage = 'home' }: { currentPage?: 'home' | 'contact' | 'projects' | '3d' }) {
  const { t, to } = useI18n()
  const pageLinks = currentPage !== 'home'
    ? links.map((link) => ({ ...link, href: link.label === 'Contact' ? '/contact' : link.href.startsWith('#') ? `/${link.href}` : link.href }))
    : links
  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label={t('navLabel')}>
        <a className={styles.logo} href={currentPage === 'home' ? '#home' : to('/#home')} aria-label={t('navLogo')}>
          <span className={styles.logoSpace} aria-hidden="true">KA</span>
          <img className={styles.logoImage} src={logo} alt="" width={1536} height={1024} />
        </a>

        <ul className={styles.links}>
          {pageLinks.map(({ label, href }) => (
            <li key={href}>
              <a
                className={styles.link}
                href={href.startsWith('#') ? href : to(href)}
                aria-current={label.toLowerCase() === currentPage ? 'page' : undefined}
              >
                {t(labelMap[label as keyof typeof labelMap])}
              </a>
            </li>
          ))}
        </ul>

        <LanguageSwitcher />
        <span className={styles.availability}>
          <span className={styles.dot} aria-hidden="true" />
          {t('navAvailability')}
        </span>
      </nav>
    </header>
  )
}
