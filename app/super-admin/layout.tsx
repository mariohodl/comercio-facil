import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { LayoutDashboard, Users, Building2, Settings, LogOut, ShieldCheck, Tag } from 'lucide-react'
import { APP_NAME } from '@/lib/constants'
import { SignOut } from '@/lib/actions/user.actions'
import { Button } from '@/components/ui/button'

export default async function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    if (session?.user?.role !== 'SuperAdmin') {
        redirect('/')
    }

    const navItems = [
        { label: 'Dashboard', href: '/super-admin', icon: LayoutDashboard },
        { label: 'Catálogos', href: '/super-admin/catalog', icon: Tag },
        { label: 'Compañías', href: '/super-admin/companies', icon: Building2 },
        { label: 'Usuarios', href: '/super-admin/users', icon: Users },
        { label: 'Configuración', href: '/super-admin/settings', icon: Settings },
    ]

    return (
        <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
                <div className="p-6 flex items-center gap-3 border-b border-slate-800">
                    <div className="w-10 h-10 bg-orange rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                        <ShieldCheck className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="font-black text-lg leading-tight tracking-tight">SUPER <span className="text-orange">ADMIN</span></h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Console v1.0</p>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2 mt-4">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all group lg:text-sm font-bold"
                        >
                            <item.icon className="w-5 h-5 group-hover:text-orange transition-colors" />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <form action={SignOut}>
                        <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-red-500/10 hover:text-red-500 text-slate-400 font-bold rounded-xl h-12 transition-all">
                            <LogOut className="w-5 h-5" />
                            Cerrar Sesión
                        </Button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 flex flex-col">
                <header className="h-20 border-b border-slate-800 flex items-center justify-between px-8 shrink-0 backdrop-blur-xl bg-slate-950/50 sticky top-0 z-10">
                    <div className="flex flex-col">
                        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Panel de Control Global</h2>
                        <p className="text-white font-bold">{session.user.name}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-slate-900 border border-slate-800 rounded-2xl">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-xs font-bold text-slate-400 tracking-wide uppercase">System Healthy</span>
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
