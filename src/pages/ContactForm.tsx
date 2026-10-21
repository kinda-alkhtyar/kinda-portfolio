import { useEffect, useRef } from 'react'
import styles from './ContactForm.module.css'
import { useI18n } from '../i18n/locale'

export default function ContactForm() {
  const { t } = useI18n()
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const animations: Animation[] = []
    let entered = false
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting) || motion.matches || entered) return
      entered = true
      observer.disconnect()
      const elements = section.querySelectorAll<HTMLElement>(
        `.${styles.header} > *, .${styles.field}, .${styles.submit}`,
      )
      elements.forEach((element, index) => {
        animations.push(element.animate([
          { opacity: 0, transform: 'translateY(16px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ], {
          duration: 850,
          delay: index * 90,
          easing: 'cubic-bezier(.22, 1, .36, 1)',
          fill: 'backwards',
        }))
      })
    }, { threshold: 0.12 })

    const updateMotion = () => {
      if (motion.matches) {
        observer.disconnect()
        animations.forEach((animation) => animation.cancel())
      } else if (!entered) {
        observer.observe(section)
      }
    }
    updateMotion()
    motion.addEventListener('change', updateMotion)
    return () => {
      observer.disconnect()
      animations.forEach((animation) => animation.cancel())
      motion.removeEventListener('change', updateMotion)
    }
  }, [])

  return (
    <section ref={sectionRef} className={styles.section} aria-labelledby="message-heading">
      <form className={styles.form} onSubmit={(event) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        const name = String(data.get('name') ?? '').trim()
        const email = String(data.get('email') ?? '').trim()
        const message = String(data.get('message') ?? '').trim()
        const subject = encodeURIComponent(t('emailSubject', { name }))
        const body = encodeURIComponent(`${message}\n\n${t('emailFrom')}: ${name}\n${t('email')}: ${email}`)
        window.location.href = `mailto:alhidyarkinda@gmail.com?subject=${subject}&body=${body}`
      }}>
        <div className={styles.header}>
          <h2 id="message-heading"><span aria-hidden="true">//</span>{t('messageHeading')}</h2>
          <p>{t('emailAppNote')}</p>
        </div>
        <div className={styles.field}>
          <label htmlFor="contact-name">{t('yourName')}</label>
          <input id="contact-name" name="name" type="text" autoComplete="name" placeholder={t('namePlaceholder')} required onInvalid={(event) => event.currentTarget.setCustomValidity(t('formRequired'))} onInput={(event) => event.currentTarget.setCustomValidity('')} />
        </div>
        <div className={styles.field}>
          <label htmlFor="contact-email">{t('yourEmail')}</label>
          <input id="contact-email" name="email" type="email" autoComplete="email" placeholder={t('emailPlaceholder')} required onInvalid={(event) => event.currentTarget.setCustomValidity(t(event.currentTarget.validity.valueMissing ? 'formRequired' : 'formEmailInvalid'))} onInput={(event) => event.currentTarget.setCustomValidity('')} />
        </div>
        <div className={styles.field}>
          <label htmlFor="contact-message">{t('yourMessage')}</label>
          <textarea id="contact-message" name="message" rows={5} placeholder={t('messagePlaceholder')} required onInvalid={(event) => event.currentTarget.setCustomValidity(t('formRequired'))} onInput={(event) => event.currentTarget.setCustomValidity('')} />
        </div>
        <button className={styles.submit} type="submit">{t('openEmailApp')} <span aria-hidden="true">→</span></button>
        <p className={styles.status}>{t('reviewMessage')}</p>
      </form>
    </section>
  )
}
