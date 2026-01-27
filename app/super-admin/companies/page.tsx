import { connectToDatabase } from '@/lib/db'
import Company from '@/lib/db/models/company.model'
import { Building2, Search, Filter, Calendar, Users, ArrowUpRight, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

export default async function SuperAdminCompanies() {
    await connectToDatabase()
    const companies = await Company.find().sort({ createdAt: -1 })

    return (
        <div className="space-y-8">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Gestión de <span className="text-orange">Compañías</span></h1>
                    <p className="text-slate-500 font-medium font-sm">Supervisión técnica de todas las organizaciones registradas.</p>
                </div>
                <Button className="bg-orange hover:bg-orange-dark text-white rounded-2xl h-12 px-6 font-bold gap-2">
                    <Building2 className="w-5 h-5" />
                    Nueva Organización
                </Button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-orange transition-colors" />
                    <Input
                        placeholder="Buscar por nombre, ID o dueño..."
                        className="bg-slate-900 border-slate-800 h-12 pl-12 rounded-2xl text-white placeholder:text-slate-600 focus:border-orange focus:ring-orange/20 transition-all font-medium"
                    />
                </div>
                <Button variant="outline" className="h-12 px-6 rounded-2xl border-slate-800 text-slate-400 font-bold hover:bg-slate-800 hover:text-white">
                    <Filter className="w-5 h-5 mr-2" />
                    Filtros Avanzados
                </Button>
            </div>

            {/* Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-950/50 border-b border-slate-800">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Identificación</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Estratregia de Pago</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Estado</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Vencimiento</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {companies.map((company) => (
                                <tr key={company._id.toString()} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center font-black text-slate-400 border border-slate-700/50 group-hover:bg-slate-700 transition-colors">
                                                {company.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-extrabold text-white">{company.name}</span>
                                                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">ID: {company._id.toString().slice(-8)}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border shadow-sm ${company.plan === 'ADVANCED' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                                    company.plan === 'INTERMEDIATE' ? 'bg-orange/10 text-orange border-orange/20' :
                                                        'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                    }`}>
                                                    {company.plan}
                                                </span>
                                            </div>
                                            {company.freeMonths > 0 && (
                                                <span className="text-[10px] text-emerald-500 font-bold italic">
                                                    +{company.freeMonths} meses de regalo
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${company.planStatus === 'ACTIVE' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                                                company.planStatus === 'FREE_TRIAL' ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]' :
                                                    'bg-red-500'
                                                }`}></div>
                                            <span className="text-slate-400 text-sm font-bold capitalize">
                                                {company.planStatus.replace('_', ' ').toLowerCase()}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <Calendar className="w-4 h-4" />
                                            <span className="text-sm font-medium">
                                                {company.trialEndDate ? new Date(company.trialEndDate).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all">
                                                <Settings className="w-5 h-5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-orange/10 text-orange opacity-60 hover:opacity-100 transition-all">
                                                <ArrowUpRight className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {companies.length === 0 && (
                    <div className="p-20 text-center space-y-4">
                        <div className="w-20 h-20 bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                            <Building2 className="w-10 h-10 text-slate-600" />
                        </div>
                        <h3 className="text-xl font-bold text-white">No hay compañías registradas</h3>
                        <p className="text-slate-500 max-w-sm mx-auto">Las organizaciones que se unan a la plataforma aparecerán aquí vinculadas a sus planes de suscripción.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
