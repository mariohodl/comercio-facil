import { Building2, Users, CreditCard, Activity, TrendingUp, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Company from '@/lib/db/models/company.model'
import User from '@/lib/db/models/user.model'
import { connectToDatabase } from '@/lib/db'

export default async function SuperAdminDashboard() {
    await connectToDatabase()

    // Real stats from DB
    const totalCompanies = await Company.countDocuments()
    const totalUsers = await User.countDocuments()
    const activeTrials = await Company.countDocuments({ planStatus: 'FREE_TRIAL' })
    const paidSubscriptions = await Company.countDocuments({ planStatus: 'ACTIVE' })

    const stats = [
        { label: 'Total Compañías', value: totalCompanies, icon: Building2, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Usuarios Globales', value: totalUsers, icon: Users, color: 'text-orange', bg: 'bg-orange/10' },
        { label: 'Suscripciones Activas', value: paidSubscriptions, icon: CreditCard, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: 'Pruebas Gratuitas', value: activeTrials, icon: Zap, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    ]

    return (
        <div className="space-y-10">
            {/* Hero Summary */}
            <div className="relative p-10 rounded-[2.5rem] bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20 overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black tracking-tight text-white">Consola de <span className="text-orange">Comercio Fácil</span></h1>
                        <p className="text-slate-400 font-medium max-w-md">Bienvenido al núcleo del sistema. Aquí puedes monitorear el crecimiento, gestionar suscripciones y asegurar la estabilidad de la plataforma.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="px-6 py-4 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-emerald-500 mb-1" />
                            <span className="text-2xl font-black text-white">+12%</span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Crecimiento x Mes</span>
                        </div>
                        <div className="px-6 py-4 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center">
                            <Activity className="w-5 h-5 text-blue-500 mb-1" />
                            <span className="text-2xl font-black text-white">99.9%</span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Uptime Cloud</span>
                        </div>
                    </div>
                </div>
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <Card key={idx} className="bg-slate-900 border-slate-800 shadow-none rounded-[2rem] hover:border-slate-700 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500">
                                {stat.label}
                            </CardTitle>
                            <div className={`p-2 rounded-xl ${stat.bg}`}>
                                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-white">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Quick Actions / Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xl font-bold text-white">Compañías en Tendencia</h3>
                        <button className="text-orange text-xs font-bold uppercase tracking-widest hover:underline">Ver todas</button>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-950/50 border-b border-slate-800">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Compañía</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Plan</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Estado</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Membresía</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50 text-sm">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <tr key={i} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-slate-400 group-hover:bg-slate-700 transition-colors">
                                                    C{i}
                                                </div>
                                                <span className="font-bold text-slate-200">Store Sample {i}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="px-3 py-1 rounded-lg bg-orange/10 text-orange text-[10px] font-black uppercase tracking-wider border border-orange/20">
                                                Premium
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                                <span className="text-slate-400 font-bold">Activo</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right font-mono text-slate-500 font-bold">
                                            MXN $2,450.00
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-white px-2">Monitor del Sistema</h3>
                    <div className="space-y-4">
                        {[
                            { label: 'Database Sync', status: 'Optimal', time: 'hace 2 min' },
                            { label: 'Email Dispatch', status: 'Optimal', time: 'hace 5 min' },
                            { label: 'Stripe Webhooks', status: 'Warning', time: 'hace 12 min' },
                            { label: 'Cloud Storage', status: 'Optimal', time: 'hace 1 hora' },
                        ].map((node, idx) => (
                            <div key={idx} className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-all">
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-white">{node.label}</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase">{node.time}</p>
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${node.status === 'Optimal' ? 'text-emerald-500 bg-emerald-500/10' : 'text-orange bg-orange/10'}`}>
                                    {node.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
