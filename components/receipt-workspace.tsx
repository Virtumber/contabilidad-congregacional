'use client'

import { useEffect, useState } from 'react'
import { Check, ChevronRight, CircleHelp, Copy, FileCheck2, FileText, Files, FlaskConical, LockKeyhole, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ReceiptPreview } from '@/components/receipt-preview'
import { ReceiptForm } from '@/components/receipt-form'
import { CopyGuide } from '@/components/copy-guide'
import { exampleValues, type ReceiptKey, type ReceiptValues } from '@/lib/receipt'
import { cn } from '@/lib/utils'

const steps = [
  { title: 'Tu comprobante', description: 'El PDF que ya tenés', icon: FileText },
  { title: 'Revisá los datos', description: 'Siempre tenés el control', icon: FileCheck2 },
  { title: 'Copiá y pegá', description: 'Sin volver a tipear', icon: Copy },
]

export function ReceiptWorkspace() {
  const [values, setValues] = useState<ReceiptValues>({ ...exampleValues })
  const [reviewed, setReviewed] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [guideOpen, setGuideOpen] = useState(false)
  const [finished, setFinished] = useState(false)
  const [resetCount, setResetCount] = useState(0)
  const isExample = file === null
  const currentStep = reviewed || finished ? 2 : 1

  useEffect(() => {
    if (!file) {
      setFileUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setFileUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  function updateField(key: ReceiptKey, value: string) {
    setValues(previous => ({ ...previous, [key]: value }))
    setReviewed(false)
    setFinished(false)
  }

  function chooseFile(nextFile: File) {
    setFile(nextFile)
    setValues({ date: '', worldwide: '', congregation: '' })
    setReviewed(false)
    setFinished(false)
    setResetCount(previous => previous + 1)
    toast('PDF abierto solo en tu navegador', { description: 'En esta versión, completá los tres datos a mano. No hay lectura automática.' })
  }

  function resetExample() {
    setFile(null)
    setValues({ ...exampleValues })
    setReviewed(false)
    setFinished(false)
    setResetCount(previous => previous + 1)
    toast('Volvimos al comprobante de ejemplo')
  }

  return (
    <div className="flex min-h-svh flex-col">
      <a href="#comprobante" className="sr-only fixed left-4 top-4 rounded-lg bg-primary px-4 py-3 text-primary-foreground focus:not-sr-only focus:z-50">Ir al comprobante</a>
      <header className="border-b bg-card text-card-foreground">
        <div className="mx-auto max-w-6xl px-5 sm:px-7 lg:px-10">
          <div className="flex h-20 items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Files className="size-6" strokeWidth={1.75} aria-hidden="true" /></div>
              <span className="text-3xl font-bold tracking-[-0.06em]">paso<span className="text-primary">.</span></span>
              <span className="ml-3 hidden border-l pl-5 text-sm text-muted-foreground sm:block">Tu ayudante de carga</span>
            </div>
            <HelpDialog />
          </div>
        </div>
      </header>

      <main id="comprobante" className="mx-auto w-full max-w-6xl flex-1 px-5 pb-10 pt-8 sm:px-7 lg:px-10 lg:pt-10">
        <div className="gentle-enter flex flex-col gap-6">
          <nav aria-label="Ubicación" className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>Asistente de carga</span><ChevronRight className="size-3.5" aria-hidden="true" /><span className="text-foreground">Donaciones recogidas</span>
          </nav>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2">
              <h1 className="text-balance text-3xl font-semibold leading-tight tracking-[-0.045em] sm:text-4xl lg:text-[42px]">Un papel, tres datos. <span className="text-primary">Listo.</span></h1>
              <p className="text-pretty text-base leading-relaxed text-muted-foreground">Tu comprobante de un lado. Los datos para copiar, del otro.</p>
            </div>
            <Badge variant="secondary" className="demo-badge"><FlaskConical data-icon="inline-start" />Ejemplo interactivo</Badge>
          </div>

          <section aria-label="Pasos para preparar el comprobante" className="rounded-xl border bg-card p-4 text-card-foreground sm:p-5">
            <ol className="flex items-center justify-between gap-2 sm:gap-5">
              {steps.map((step, index) => {
                const done = index < currentStep || finished
                const Icon = done ? Check : step.icon
                return (
                  <li key={step.title} aria-current={index === currentStep && !finished ? 'step' : undefined} className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center sm:flex-row sm:gap-3 sm:text-left">
                    <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-full sm:size-10', index === currentStep && !finished ? 'bg-primary text-primary-foreground' : done ? 'bg-secondary text-primary' : 'bg-muted text-muted-foreground')}><Icon className="size-[18px]" aria-hidden="true" /></span>
                    <div className="flex flex-col gap-0.5">
                      <span className={cn('text-sm font-medium', index > currentStep && !finished && 'text-muted-foreground')}>{step.title}</span>
                      <span className="hidden text-sm text-muted-foreground lg:block">{step.description}</span>
                    </div>
                    {index < 2 && <ChevronRight className="ml-auto hidden size-4 shrink-0 text-muted-foreground/50 min-[700px]:block" aria-hidden="true" />}
                  </li>
                )
              })}
            </ol>
          </section>

          <div className="grid items-stretch gap-5 min-[700px]:grid-cols-2 lg:gap-6">
            <ReceiptPreview file={file} fileUrl={fileUrl} onChooseFile={chooseFile} />
            <ReceiptForm key={resetCount} values={values} onChange={updateField} reviewed={reviewed} onReviewedChange={setReviewed} isExample={isExample} finished={finished} onStartCopy={() => setGuideOpen(true)} />
          </div>

          <section className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex max-w-2xl items-start gap-3 text-muted-foreground">
              <FlaskConical className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <p className="text-pretty text-sm leading-relaxed"><span className="font-medium text-foreground">Probá con tranquilidad.</span> Los datos iniciales son inventados. Este ejemplo no lee PDF automáticamente ni carga nada en tu plataforma.</p>
            </div>
            <Button variant="ghost" onClick={resetExample} className="h-10 self-start"><RotateCcw data-icon="inline-start" />Reiniciar ejemplo</Button>
          </section>
        </div>
      </main>

      <footer className="mx-auto w-full max-w-6xl px-5 pb-6 sm:px-7 lg:px-10">
        <div className="flex flex-col items-center justify-between gap-3 border-t pt-5 text-sm text-muted-foreground sm:flex-row">
          <p>Menos trabajo repetido. Un paso a la vez.</p>
          <div className="flex items-center gap-2"><LockKeyhole className="size-3.5" aria-hidden="true" /><span>Tus archivos no salen de este navegador.</span></div>
        </div>
      </footer>

      {guideOpen && <CopyGuide open={guideOpen} onOpenChange={setGuideOpen} values={values} isExample={isExample} onComplete={() => setFinished(true)} />}
    </div>
  )
}

function HelpDialog() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="ghost" className="h-10" />}><CircleHelp data-icon="inline-start" /><span className="hidden sm:inline">¿Cómo funciona?</span><span className="sm:hidden">Ayuda</span></DialogTrigger>
      <DialogContent className="guide-dialog sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Vamos de a un paso.</DialogTitle>
          <DialogDescription>Este es un ejemplo para probar cómo sería tu ayudante. No está conectado a tu plataforma.</DialogDescription>
        </DialogHeader>
        <ol className="flex flex-col gap-6 py-3">
          {[
            { icon: FileText, title: 'Mirá el comprobante', text: 'Empezamos con un papel de ejemplo y datos inventados. Podés ampliarlo para verlo mejor.' },
            { icon: FileCheck2, title: 'Revisá los tres datos', text: 'Compará la fecha y los importes. Si necesitás corregir algo, hacé clic en el dato y escribí.' },
            { icon: Copy, title: 'Probá copiar y pegar', text: 'Tocá «Copiar» y pegá el dato en un bloc de notas para probar. No cargues datos ficticios en tu plataforma.' },
          ].map((item, index) => (
            <li key={item.title} className="flex items-start gap-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary"><item.icon className="size-5" aria-hidden="true" /></span>
              <div className="flex flex-col gap-1"><h3 className="font-medium">{index + 1}. {item.title}</h3><p className="text-sm leading-relaxed text-muted-foreground">{item.text}</p></div>
            </li>
          ))}
        </ol>
        <div className="rounded-lg bg-muted p-4 text-sm leading-relaxed text-muted-foreground"><span className="font-medium text-foreground">¿Y mi propio PDF?</span> Podés abrirlo para verlo al lado de los campos, pero en esta versión tenés que completarlos a mano. Los archivos no se envían ni se guardan; al recargar se pierde lo que hiciste.</div>
      </DialogContent>
    </Dialog>
  )
}
