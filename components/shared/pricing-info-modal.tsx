'use client'

import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Info, ShieldCheck, Zap, AlertCircle } from 'lucide-react'

interface PricingInfoModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export default function PricingInfoModal({ open, onOpenChange }: PricingInfoModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl">
                <div className="bg-gradient-to-br from-navy via-slate-800 to-navy p-6 pt-8 text-white relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Zap size={120} />
                    </div>
                    <DialogHeader className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-orange rounded-lg">
                                <ShieldCheck className="h-6 w-6 text-white" />
                            </div>
                            <DialogTitle className="text-2xl font-bold tracking-tight">Registro Ágil con Seguridad</DialogTitle>
                        </div>
                        <DialogDescription className="text-slate-300 text-base">
                            Hemos optimizado el flujo de inventario para que trabajes más rápido sin riesgos.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-6 space-y-6 bg-white">
                    <div className="space-y-4">
                        <div className="flex gap-4 items-start p-4 rounded-xl bg-orange/5 border border-orange/10 transition-all hover:bg-orange/10">
                            <div className="mt-1 bg-orange/20 p-2 rounded-lg">
                                <Zap className="h-5 w-5 text-orange" />
                            </div>
                            <div>
                                <h4 className="font-bold text-navy text-sm uppercase tracking-wider mb-1">Ahorra Tiempo</h4>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    Puedes registrar productos solo con el nombre y código de barras con precio <span className="font-bold text-orange">$0.00</span>. Ideal para recepciones rápidas de mercancía.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 items-start p-4 rounded-xl bg-blue-50/50 border border-blue-100 transition-all hover:bg-blue-50">
                            <div className="mt-1 bg-blue-100 p-2 rounded-lg">
                                <AlertCircle className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-navy text-sm uppercase tracking-wider mb-1">Protección en POS</h4>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    Los productos con precio <span className="font-bold">$0.00</span> se guardan como <strong>Borradores</strong>. No aparecerán en el POS hasta que les asignes un precio de venta mayor a cero.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-3 border border-slate-100 italic">
                        <Info className="h-5 w-5 text-slate-400 shrink-0" />
                        <p className="text-xs text-slate-500">
                            Nota: Debes desactivar la opción "Publicado" si planeas dejar el precio en 0 por ahora.
                        </p>
                    </div>
                </div>

                <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100">
                    <Button
                        onClick={() => onOpenChange(false)}
                        className="w-full bg-navy hover:bg-navy/90 text-white font-bold h-11 rounded-xl shadow-lg shadow-navy/10 transition-all active:scale-95"
                    >
                        Entendido, ¡gracias!
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
