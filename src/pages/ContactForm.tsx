import { useState } from 'react'
import styles from './ContactForm.module.css'

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false)

  return (
    <section className={styles.section} aria-labelledby="message-heading">
      <form className={styles.form} onSubmit={(event) => {
        event.preventDefault()
        setSubmitted(true)
      }}>
        <div className={styles.header}>
          <h2 id="message-heading"><span aria-hidden="true">//</span>Send a message</h2>
          <p>I usually reply<br />within 24 hours.</p>
        </div>
        <div className={styles.field}>
          <label htmlFor="contact-name">Your name</label>
          <input id="contact-name" name="name" type="text" autoComplete="name" placeholder="Enter your name" required />
        </div>
        <div className={styles.field}>
          <label htmlFor="contact-email">Your email</label>
          <input id="contact-email" name="email" type="email" autoComplete="email" placeholder="Enter your email" required />
        </div>
        <div className={styles.field}>
          <label htmlFor="contact-message">Your message</label>
          <textarea id="contact-message" name="message" rows={5} placeholder="Tell me about your project, idea or opportunity…" required />
        </div>
        <button className={styles.submit} type="submit">Send message <span aria-hidden="true">→</span></button>
        <p className={styles.status} role="status">{submitted
          ? 'Your message has not been sent. Sending is not connected yet.'
          : 'Form preview only — sending is not connected yet.'}</p>
      </form>
    </section>
  )
}
