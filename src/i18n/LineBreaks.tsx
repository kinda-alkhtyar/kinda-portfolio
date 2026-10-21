import { Fragment } from 'react'
import { useI18n } from './locale'
import type { MessageKey } from './messages'

export default function LineBreaks({ id }: { id: MessageKey }) {
  const { lines } = useI18n()
  return <>{lines(id).map((line, index) => <Fragment key={index}>{index > 0 && <br />}{line}</Fragment>)}</>
}
