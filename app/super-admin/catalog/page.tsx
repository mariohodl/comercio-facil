'use client'

import { useState, useEffect } from 'react'
import { ICategory } from '@/lib/db/models/category.model'
import { ISubCategory } from '@/lib/db/models/sub-category.model'
import { getAllCategories, approveCategory } from '@/lib/actions/category.actions'
import { getAllSubCategories, approveSubCategory } from '@/lib/actions/sub-category.actions'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from '@/components/ui/badge'
import { Check, Globe, X, Clock, Loader2 } from 'lucide-react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

export default function CatalogApprovalPage() {
    const { showSuccess, showError } = useToast()
    const [categories, setCategories] = useState<ICategory[]>([])
    const [subCategories, setSubCategories] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [processingId, setProcessingId] = useState<string | null>(null)

    const fetchData = async () => {
        setLoading(true)
        try {
            // Get all categories (unfiltered by storeId for SuperAdmin)
            const catRes = await getAllCategories({ page: 1, limit: 100 })
            setCategories(catRes.categories.filter((c: any) => !c.isApproved))

            const subRes = await getAllSubCategories({ page: 1, limit: 100 })
            setSubCategories(subRes.subCategories.filter((s: any) => !s.isApproved))
        } catch (error) {
            showError('Error loading pending items')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleApproveCategory = async (id: string, isGlobal: boolean) => {
        setProcessingId(id)
        try {
            const res = await approveCategory(id, isGlobal)
            if (res.success) {
                showSuccess(res.message)
                setCategories(prev => prev.filter(c => c._id !== id))
            } else {
                showError(res.message)
            }
        } catch (error) {
            showError('Error approving category')
        } finally {
            setProcessingId(null)
        }
    }

    const handleApproveSubCategory = async (id: string, isGlobal: boolean) => {
        setProcessingId(id)
        try {
            const res = await approveSubCategory(id, isGlobal)
            if (res.success) {
                showSuccess(res.message)
                setSubCategories(prev => prev.filter(s => s._id !== id))
            } else {
                showError(res.message)
            }
        } catch (error) {
            showError('Error approving sub category')
        } finally {
            setProcessingId(null)
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Aprobación de <span className="text-orange">Catálogos</span></h1>
                    <p className="text-slate-400 font-semibold text-xs uppercase tracking-widest">Revisa y aprueba las categorías propuestas por las tiendas.</p>
                </div>
            </div>

            <Tabs defaultValue="categories" className="w-full">
                <TabsList className="bg-slate-900 border border-slate-800 p-1 rounded-2xl mb-6">
                    <TabsTrigger value="categories" className="rounded-xl px-8 data-[state=active]:bg-orange data-[state=active]:text-white font-bold">Categorías ({categories.length})</TabsTrigger>
                    <TabsTrigger value="subcategories" className="rounded-xl px-8 data-[state=active]:bg-orange data-[state=active]:text-white font-bold">Subcategorías ({subCategories.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="categories">
                    <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-950/50">
                                <TableRow className="hover:bg-transparent border-slate-800">
                                    <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[10px] px-6">Categoría</TableHead>
                                    <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[10px] px-6">Slug</TableHead>
                                    <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[10px] px-6">Tienda ID</TableHead>
                                    <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[10px] px-6">Fecha</TableHead>
                                    <TableHead className="text-right text-slate-500 font-bold uppercase tracking-wider text-[10px] px-6">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-20 text-slate-500">
                                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-orange" />
                                            Cargando propuestas...
                                        </TableCell>
                                    </TableRow>
                                ) : categories.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-20 text-slate-500 font-bold italic">
                                            No hay categorías pendientes de aprobación.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    categories.map((cat) => (
                                        <TableRow key={cat._id} className="border-slate-800/50 transition-colors hover:bg-white/5">
                                            <TableCell className="px-6 py-4">
                                                <div className="font-bold text-slate-200">{cat.categoryName}</div>
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                <code className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded-lg">{cat.categorySlug}</code>
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                <span className="text-sm font-medium text-slate-400">{cat.storeId || 'N/A'}</span>
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(cat.createdAt).toLocaleDateString()}
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="border-emerald-500/20 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white font-bold rounded-xl h-9"
                                                        onClick={() => handleApproveCategory(cat._id, false)}
                                                        disabled={processingId === cat._id}
                                                    >
                                                        <Check className="w-4 h-4 mr-2" /> Aprobar
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl h-9 shadow-lg shadow-blue-500/20"
                                                        onClick={() => handleApproveCategory(cat._id, true)}
                                                        disabled={processingId === cat._id}
                                                    >
                                                        <Globe className="w-4 h-4 mr-2" /> Hacer Global
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                <TabsContent value="subcategories">
                    <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-950/50">
                                <TableRow className="hover:bg-transparent border-slate-800">
                                    <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[10px] px-6">Subcategoría</TableHead>
                                    <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[10px] px-6">Categoría Padre</TableHead>
                                    <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[10px] px-6">Tienda ID</TableHead>
                                    <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[10px] px-6">Fecha</TableHead>
                                    <TableHead className="text-right text-slate-500 font-bold uppercase tracking-wider text-[10px] px-6">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-20 text-slate-500">
                                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-orange" />
                                            Cargando propuestas...
                                        </TableCell>
                                    </TableRow>
                                ) : subCategories.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-20 text-slate-500 font-bold italic">
                                            No hay subcategorías pendientes de aprobación.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    subCategories.map((sub) => (
                                        <TableRow key={sub._id} className="border-slate-800/50 transition-colors hover:bg-white/5">
                                            <TableCell className="px-6 py-4">
                                                <div className="font-bold text-slate-200">{sub.name}</div>
                                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{sub.code}</div>
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 font-bold">
                                                    {sub.parentCategory?.categoryName || 'N/A'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                <span className="text-sm font-medium text-slate-400">{sub.storeId || 'N/A'}</span>
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(sub.createdAt).toLocaleDateString()}
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="border-emerald-500/20 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white font-bold rounded-xl h-9"
                                                        onClick={() => handleApproveSubCategory(sub._id, false)}
                                                        disabled={processingId === sub._id}
                                                    >
                                                        <Check className="w-4 h-4 mr-2" /> Aprobar
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl h-9 shadow-lg shadow-blue-500/20"
                                                        onClick={() => handleApproveSubCategory(sub._id, true)}
                                                        disabled={processingId === sub._id}
                                                    >
                                                        <Globe className="w-4 h-4 mr-2" /> Hacer Global
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
