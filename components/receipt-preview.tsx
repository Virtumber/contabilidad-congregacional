'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Download, FileText, LoaderCircle, Maximize2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

interface ReceiptPreviewProps {
  file: File | null
  fileUrl: string | null
  onChooseFile: (file: File) => void
}

function SampleReceipt({ enlarged = false }: { enlarged?: boolean }) {
  return <Image src="/images/comprobante-ejemplo.png" alt="Comprobante ficticio. Fecha: 05/09/2026. Obra mundial: 15.000 pesos. Congregación: 25.000 pesos. Total: 40.000 pesos." width={1024} height={1024} priority={!enlarged} className={cn('receipt-sheet h-auto w-full bg-card object-contain', enlarged ? 'max-h-[65svh] max-w-xl' : 'max-w-[380px] -rotate-1')} sizes={enlarged ? '600px' : '(min-width: 1024px) 380px, (min-width: 700px) 290px, 380px'} />
}

export function ReceiptPreview({ file, fileUrl, onChooseFile }: ReceiptPreviewProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const fileName = file?.name || 'comprobante-ejemplo.pdf'

  async function acceptFile(nextFile: File | undefined) {
    if (!nextFile) return
    setError('')
    if (nextFile.size > 10 * 1024 * 1024) {
      setError('El PDF supera los 10 MB. Elegí un archivo más pequeño.')
      return
    }
    try {
      const header = new TextDecoder().decode(await nextFile.slice(0, 1024).arrayBuffer())
      if (!header.includes('%PDF-') || !nextFile.name.toLowerCase().endsWith('.pdf')) {
        setError('Elegí un archivo PDF válido. Este archivo no parece ser un PDF.')
        return
      }
      onChooseFile(nextFile)
      setUploadOpen(false)
    } catch {
      setError('No pudimos abrir el archivo. Probá seleccionarlo de nuevo.')
    }
  }

  async function downloadPdf() {
    if (file && fileUrl) {
      const link = document.createElement('a')
      link.href = fileUrl
      link.download = file.name
      link.click()
      return
    }
    setBusy(true)
    try {
      const [{ jsPDF }, response] = await Promise.all([import('jspdf'), fetch('/images/comprobante-ejemplo.png')])
      if (!response.ok) throw new Error('Image unavailable')
      const image = new Uint8Array(await response.arrayBuffer())
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [210, 210] })
      pdf.addImage(image, 'PNG', 0, 0, 210, 210)
      pdf.save('comprobante-ejemplo.pdf')
      toast('PDF de ejemplo descargado', { description: 'Contiene datos ficticios. No lo adjuntes a un registro real.' })
    } catch {
      toast.error('No pudimos preparar la descarga. Intentá de nuevo.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card className="workspace-card min-w-0">
      <CardHeader>
        <CardTitle><h2>Tu comprobante</h2></CardTitle>
        <CardDescription>El papel que ya escaneaste.</CardDescription>
        <CardAction><span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground"><FileText className="size-5" aria-hidden="true" /></span></CardAction>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-0">
        <div className="flex items-center justify-between gap-2 rounded-t-lg border bg-card px-3 py-3 text-card-foreground">
          <div className="flex min-w-0 items-center gap-2"><FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" /><span className="truncate text-sm" title={fileName}>{fileName}</span></div>
          {!file && <Badge variant="outline" className="demo-badge">Ejemplo</Badge>}
        </div>
        <div className="receipt-stage flex min-h-80 flex-1 items-center justify-center overflow-hidden border-x px-5 py-7 lg:min-h-[370px] lg:px-7">
          {file ? (fileUrl ? <object data={`${fileUrl}#toolbar=0&navpanes=0&view=FitH`} type="application/pdf" className="h-[370px] w-full" aria-label={`Vista de ${fileName}`}><p className="text-center text-sm leading-relaxed">Tu navegador no muestra el PDF aquí. <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">Abrilo en otra pestaña</a> para verlo.</p></object> : <LoaderCircle className="size-6 animate-spin text-primary" aria-label="Abriendo PDF" />) : <SampleReceipt />}
        </div>
        <div className="flex items-center justify-between gap-3 rounded-b-lg border bg-card px-3 py-2 text-card-foreground">
          <span className="text-sm text-muted-foreground">{file ? 'Vista local del PDF' : 'Página 1 de 1'}</span>
          <div className="flex items-center gap-1">
            <Dialog>
              <DialogTrigger render={<Button variant="ghost" size="icon" aria-label="Ampliar comprobante" />}><Maximize2 /></DialogTrigger>
              <DialogContent className="guide-dialog sm:max-w-2xl">
                <DialogHeader><DialogTitle>Tu comprobante, más cerca</DialogTitle><DialogDescription>{file ? fileName : 'Datos ficticios para probar. No es un comprobante real.'}</DialogDescription></DialogHeader>
                <div className="flex max-h-[70svh] justify-center overflow-auto rounded-lg bg-muted p-3">{file && fileUrl ? <object data={fileUrl} type="application/pdf" className="h-[65svh] w-full" aria-label={`Vista ampliada de ${fileName}`}><a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">Abrir el PDF en otra pestaña</a></object> : <SampleReceipt enlarged />}</div>
              </DialogContent>
            </Dialog>
            <Button variant="ghost" size="icon" aria-label="Descargar comprobante PDF" disabled={busy} onClick={downloadPdf}>{busy ? <LoaderCircle className="animate-spin" /> : <Download />}</Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-between gap-2">
        <span className="hidden text-sm text-muted-foreground lg:block">¿Tenés otro comprobante?</span>
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogTrigger render={<Button variant="outline" className="h-10 w-full lg:w-auto" />}><Upload data-icon="inline-start" />Elegir otro PDF</DialogTrigger>
          <DialogContent className="guide-dialog sm:max-w-lg">
            <DialogHeader><DialogTitle>Abrí tu comprobante</DialogTitle><DialogDescription>Podés verlo al lado de los campos. El archivo se queda en tu navegador y desaparece al recargar.</DialogDescription></DialogHeader>
            <Alert className="review-note"><FileText /><AlertTitle>Por ahora, la lectura es manual</AlertTitle><AlertDescription>Este ejemplo todavía no extrae datos del PDF. Al abrirlo, los campos quedarán vacíos para que los completes vos.</AlertDescription></Alert>
            <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="sr-only" tabIndex={-1} aria-label="Seleccionar comprobante PDF" onChange={event => { void acceptFile(event.target.files?.[0]); event.target.value = '' }} />
            <button type="button" className={cn('flex min-h-44 flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/40', dragging ? 'border-primary bg-secondary text-primary' : 'border-input bg-muted text-foreground hover:border-primary/50')} onClick={() => inputRef.current?.click()} onDragOver={event => { event.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={event => { event.preventDefault(); setDragging(false); void acceptFile(event.dataTransfer.files[0]) }}>
              <span className="flex flex-col items-center gap-3"><Upload className="size-7 text-primary" aria-hidden="true" /><span className="font-medium">Elegí un PDF o arrastralo acá</span><span className="text-sm text-muted-foreground">Hasta 10 MB · Solo archivos PDF</span></span>
            </button>
            {error && <p role="alert" className="text-sm font-medium leading-relaxed">{error}</p>}
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  )
}
