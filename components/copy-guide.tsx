'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight, Check, CircleCheck, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { copyToClipboard, getCopyValue, receiptFields, type ReceiptValues } from '@/lib/receipt'

interface CopyGuideProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  values: ReceiptValues
  isExample: boolean
  onComplete: () => void
}

export function CopyGuide({ open, onOpenChange, values, isExample, onComplete }: CopyGuideProps) {
  const [step, setStep] = useState(0)
  const [copied, setCopied] = useState(false)
  const [copying, setCopying] = useState(false)
  const [copyError, setCopyError] = useState(false)
  const complete = step === receiptFields.length
  const field = receiptFields[step]

  async function copyCurrent() {
    if (!field || copying) return
    setCopying(true)
    setCopyError(false)
    try {
      const success = await copyToClipboard(getCopyValue(field.key, values[field.key]))
      if (!success) throw new Error('Clipboard unavailable')
      setCopied(true)
      toast('Dato copiado. Ahora podés pegarlo.')
    } catch {
      setCopyError(true)
    } finally {
      setCopying(false)
    }
  }

  function next() {
    setCopied(false)
    setCopyError(false)
    if (step === receiptFields.length - 1) onComplete()
    setStep(previous => previous + 1)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="guide-dialog sm:max-w-lg">
        {complete ? (
          <>
            <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary"><CircleCheck className="size-7" aria-hidden="true" /></div>
            <DialogHeader>
              <DialogTitle>{isExample ? 'Así de simple. Un dato a la vez.' : 'Ya tenés los tres datos.'}</DialogTitle>
              <DialogDescription>{isExample ? 'Terminaste la prueba. No se cargó nada en tu plataforma y estos datos no se guardaron.' : 'Revisá lo que pegaste en tu plataforma, adjuntá el PDF original y guardá el movimiento allí. Este ayudante no envió ni guardó nada en esa plataforma.'}</DialogDescription>
            </DialogHeader>
            <div className="rounded-xl bg-muted p-4 text-sm leading-relaxed text-muted-foreground">{isExample ? 'En una versión con lectura automática, partiríamos de tu propio PDF. Por ahora, este ejemplo te permite probar la revisión y la copia.' : 'No olvides adjuntar el mismo comprobante que acabás de revisar.'}</div>
            <Button className="primary-action w-full" onClick={() => onOpenChange(false)}>Volver al comprobante<ArrowRight data-icon="inline-end" /></Button>
          </>
        ) : (
          <>
            <span className="text-sm font-medium text-primary">DATO {step + 1} DE 3</span>
            <DialogHeader>
              <DialogTitle>{step === 0 ? 'Primero, la fecha.' : step === 1 ? 'Ahora, Obra mundial.' : 'Por último, Congregación.'}</DialogTitle>
              <DialogDescription>{isExample ? 'Copiá este dato y pegalo en un bloc de notas para probar. No uses datos ficticios en tu plataforma.' : `Copiá este dato y pegalo en el campo «${field.label}» de tu plataforma.`}</DialogDescription>
            </DialogHeader>
            <div className="rounded-xl border bg-muted px-5 py-6 text-foreground">
              <div className="flex flex-col gap-3"><span className="text-sm text-muted-foreground">{field.label}</span><span className="select-all text-3xl font-medium tracking-tight tabular-nums">{getCopyValue(field.key, values[field.key])}</span></div>
            </div>
            {field.key !== 'date' && <p className="text-sm text-muted-foreground">Se copia sin el signo $ ni los puntos de miles.</p>}
            <Button className="primary-action w-full" disabled={copying} onClick={() => void copyCurrent()}>{copied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}{copied ? 'Copiado. Podés pegarlo' : `Copiar ${field.shortLabel}`}</Button>
            {copyError && <p role="alert" className="text-sm leading-relaxed">El navegador no permitió copiar. Seleccioná el dato de arriba, usá la opción «Copiar» del navegador y después <button className="text-primary underline" onClick={() => setCopied(true)}>continuá con la copia manual</button>.</p>}
            <div className="flex items-center justify-between gap-3 border-t pt-4">
              <Button variant="ghost" disabled={step === 0} onClick={() => { setStep(previous => previous - 1); setCopied(false); setCopyError(false) }}><ArrowLeft data-icon="inline-start" />Anterior</Button>
              <Button variant="secondary" className="h-10" disabled={!copied} onClick={next}>{isExample ? 'Ya lo probé' : 'Ya lo pegué'}<ArrowRight data-icon="inline-end" /></Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
