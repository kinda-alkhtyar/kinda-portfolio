import styles from './AboutTechStack.module.css'

const groups = [
  { title: 'Front-end', skills: 'HTML · CSS · JavaScript · React · Vite', icon: 'screen' },
  { title: 'Back-end', skills: 'Supabase · REST APIs · Authentication · Databases', icon: 'database' },
  { title: 'Programming', skills: 'Python basics', icon: 'pencil' },
  { title: 'Tools', skills: 'Git · GitHub · VS Code · Figma', icon: 'gear' },
] as const

function StackIcon({ kind }: { kind: typeof groups[number]['icon'] }) {
  return (
    <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {kind === 'screen' && <><rect x="3" y="4" width="22" height="17" rx="1" /><path d="M10 21v4m8-4v4M7 25h14" /></>}
      {kind === 'database' && <><ellipse cx="14" cy="6" rx="10" ry="4" /><path d="M4 6v16c0 5.3 20 5.3 20 0V6M4 11c0 5.3 20 5.3 20 0M4 16c0 5.3 20 5.3 20 0" /></>}
      {kind === 'pencil' && <><path d="m3 25 3-9L20 2a2 2 0 0 1 3 0l3 3a2 2 0 0 1 0 3L12 22l-9 3ZM17 5l6 6M6 16l6 6M9 19 20 8M3 25l5-2" /></>}
      {kind === 'gear' && <><path d="m11 2 6 0 .7 3 2 .9 2.7-1.4 3 5-2.3 2.1v2.8l2.3 2.1-3 5-2.7-1.4-2 .9-.7 3h-6l-.7-3-2-.9-2.7 1.4-3-5L5 14.4v-2.8L2.6 9.5l3-5 2.7 1.4 2-.9L11 2Z" /><circle cx="14" cy="13" r="4" /></>}
    </svg>
  )
}

export default function AboutTechStack() {
  return (
    <section className={styles.section} aria-labelledby="stack-heading">
      <div className={styles.header}>
        <div>
          <p className={styles.label}><span>04</span><span aria-hidden="true">—</span>Skills &amp; technologies</p>
          <h2 id="stack-heading" className={styles.heading}>Tech Stack</h2>
        </div>
        <p className={styles.accent}>Tools that<br />power ideas</p>
      </div>
      <ul className={styles.groups}>
        {groups.map(({ title, skills, icon }) => (
          <li className={styles.group} key={title}>
            <div className={styles.groupHeading}><StackIcon kind={icon} /><h3>{title}</h3></div>
            <p>{skills}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
