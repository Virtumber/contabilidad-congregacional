'use client'

import { useState } from 'react'
import { ArrowRight, CalendarDays, Check, CircleCheck, Copy, Info, PencilLine } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { copyToClipboard, formatAmount, getCopyValue, getFieldError, parseAmount, receiptFields, type ReceiptKey, type ReceiptValues } from '@/lib/receipt'

interface ReceiptFormProps {
  values: ReceiptValues
  onChange: (key: ReceiptKey, value: string) => void
  reviewed: boolean
  onReviewedChange: (reviewed: boolean) => void
  isExample: boolean
  finished: boolean
  onStartCopy: () => void
}

export function ReceiptForm({ values, onChange, reviewed, onReviewedChange, isExample, finished, onStartCopy }: ReceiptFormProps) {
  const [touched, setTouched] = useState<Partial<Record<ReceiptKey, boolean>>>({})
  const [copied, setCopied] = useState<Partial<Record<ReceiptKey, string>>>({})
  const worldwide = parseAmount(values.worldwide)
  const congregation = parseAmount(values.congregation)
  const total = worldwide !== null && congregation !== null ? formatAmount(worldwide + congregation) : '—'
  const valid = receiptFields.every(field => getFieldError(field.key, values[field.key]) === null)

  async function copyField(key: ReceiptKey, label: string) {
    const error = getFieldError(key, values[key])
    if (error) {
      setTouched(previous => ({ ...previous, [key]: true }))
      return
    }
    try {
      const success = await copyToClipboard(getCopyValue(key, values[key]))
      if (!success) throw new Error('Clipboard unavailable')
      setCopied(previous => ({ ...previous, [key]: values[key] }))
      toast(`${label}: copiado`, { description: isExample ? 'Pegalo en un bloc de notas para probar.' : 'Ahora podés pegarlo en el campo de tu plataforma.' })
    } catch {
      toast.error('El navegador no permitió copiar', { description: 'Seleccioná el dato y usá Copiar en el menú del navegador.' })
    }
  }

  return (
    <Card className="workspace-card min-w-0">
      <CardHeader>
        <CardTitle><h2>Datos para copiar</h2></CardTitle>
        <CardDescription>En el mismo orden que tu plataforma.</CardDescription>
        <CardAction><span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-primary"><Copy className="size-[18px]" aria-hidden="true" /></span></CardAction>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-5">
        <Alert className="review-note" role="note"><Info /><AlertTitle>{isExample ? 'Empecemos con un ejemplo' : 'Completá los datos de tu PDF'}</AlertTitle><AlertDescription>{isExample ? 'Ya preparamos tres datos ficticios. Comparalos con el comprobante.' : 'La lectura automática todavía no está incluida. Podés escribir y copiar los datos.'}</AlertDescription></Alert>
        <FieldGroup>
          {receiptFields.map(field => {
            const error = touched[field.key] ? getFieldError(field.key, values[field.key]) : null
            const isCopied = copied[field.key] === values[field.key] && !!values[field.key]
            return (
              <Field key={field.key} data-invalid={!!error}>
                <FieldLabel htmlFor={field.key}>{field.label}</FieldLabel>
                <InputGroup className="data-input">
                  <InputGroupInput id={field.key} value={values[field.key]} onChange={event => onChange(field.key, event.target.value)} onBlur={() => setTouched(previous => ({ ...previous, [field.key]: true }))} placeholder={field.key === 'date' ? 'dd/mm/aaaa' : '0,00'} inputMode={field.key === 'date' ? 'text' : 'decimal'} maxLength={field.key === 'date' ? 10 : 18} autoComplete="off" spellCheck={false} aria-invalid={!!error} aria-describedby={error ? `${field.key}-error` : undefined} />
                  <InputGroupAddon align="inline-start">{field.key === 'date' ? <CalendarDays aria-hidden="true" /> : <span aria-hidden="true">$</span>}</InputGroupAddon>
                  <InputGroupAddon align="inline-end"><InputGroupButton variant={isCopied ? 'secondary' : 'ghost'} size="sm" aria-label={`${isCopied ? 'Volver a copiar' : 'Copiar'} ${field.label}`} onClick={() => void copyField(field.key, field.label)}>{isCopied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}<span>{isCopied ? 'Copiado' : 'Copiar'}</span></InputGroupButton></InputGroupAddon>
                </InputGroup>
                {error && <FieldError id={`${field.key}-error`}>{error}</FieldError>}
              </Field>
            )
          })}
        </FieldGroup>
        <div className="flex items-center justify-between gap-3 rounded-lg bg-muted px-4 py-3.5 text-foreground">
          <div className="flex flex-col gap-0.5"><span className="text-sm font-medium">Total del comprobante</span><span className="text-sm text-muted-foreground">Obra mundial + Congregación</span></div>
          <output aria-label="Total del comprobante" aria-live="polite" className="shrink-0 text-lg font-semibold tracking-tight tabular-nums lg:text-xl">{total === '—' ? '—' : `$ ${total}`}</output>
        </div>
        <p className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground"><PencilLine className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" /><span>Podés corregir cualquier dato antes de copiarlo.</span></p>
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-4">
        <Field orientation="horizontal" data-disabled={!valid}>
          <Checkbox id="reviewed" checked={reviewed} onCheckedChange={onReviewedChange} disabled={!valid} />
          <FieldLabel htmlFor="reviewed">Revisé los datos con el comprobante</FieldLabel>
        </Field>
        <Button className="primary-action w-full" disabled={!reviewed || !valid} onClick={onStartCopy}>{finished ? <><CircleCheck data-icon="inline-start" />Volver a practicar</> : <>Copiar paso a paso<ArrowRight data-icon="inline-end" /></>}</Button>
      </CardFooter>
    </Card>
  )
}
