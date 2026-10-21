import styles from './AboutOpportunities.module.css'
import { useI18n } from '../i18n/locale'
import type { MessageKey } from '../i18n/messages'

const details = [
  { label: 'experienceLabel', value: 'experienceValue', icon: 'briefcase' },
  { label: 'locationLabel', value: 'locationValue', icon: 'pin' },
  { label: 'openToLabel', value: 'openToValue', icon: 'laptop' },
  { label: 'languagesLabel', value: 'languagesValue', icon: 'globe' },
] as const

function DetailIcon({ kind }: { kind: typeof details[number]['icon'] }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {kind === 'briefcase' && <><rect x="2" y="8" width="28" height="21" rx="2" /><path d="M11 8V3h10v5M2 17h11m6 0h11" /><rect x="13" y="15" width="6" height="5" rx="1" /></>}
      {kind === 'pin' && <><path d="M26 12c0 8-10 18-10 18S6 20 6 12a10 10 0 1 1 20 0Z" /><circle cx="16" cy="12" r="4" /></>}
      {kind === 'laptop' && <><path d="M5 23V4h22v19M5 23l-3 5h28l-3-5H5ZM13 25h6" /></>}
      {kind === 'globe' && <><circle cx="16" cy="16" r="14" /><ellipse cx="16" cy="16" rx="6" ry="14" /><path d="M2 16h28M5 8c6 4 16 4 22 0M5 24c6-4 16-4 22 0" /></>}
    </svg>
  )
}

export default function AboutOpportunities() {
  const { t } = useI18n()
  return (
    <section className={styles.section} aria-labelledby="opportunities-heading">
      <h2 id="opportunities-heading" className={styles.heading}>
        <span>06</span><span aria-hidden="true">—</span>{t('opportunitiesHeading')}
      </h2>
      <dl className={styles.details}>
        {details.map(({ label, value, icon }) => (
          <div className={styles.detail} key={label}>
            <DetailIcon kind={icon} />
            <div className={styles.text}>
              <dt>{t(label as MessageKey)}</dt>
              <dd>{t(value as MessageKey)}</dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  )
}
