"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Settings,
  Briefcase,
  LayoutDashboard,
  UserSquare,
  Star,
} from "lucide-react";
import BotonSalir from "./BotonSalir";
import Image from "next/image";

export default function Sidebar({ rol }) {
  // Hook de Next.js para saber en qué página estamos y "pintar" el botón activo
  const pathname = usePathname();

  // 1. Menú del Cliente
  const menuCliente = [
    { nombre: "Buscar Expertos", ruta: "/cliente", icono: Search },
    { nombre: "Configuración", ruta: "/cliente/ajustes", icono: Settings },
  ];

  // 2. Menú del Trabajador
  const menuTrabajador = [
    {
      nombre: "Panel de Trabajos",
      ruta: "/trabajador",
      icono: LayoutDashboard,
    },
    { nombre: "Configuración", ruta: "/trabajador/ajustes", icono: Settings },
  ];

  // Elegimos qué menú mostrar según el rol que le pasemos al componente
  const menu = rol === "cliente" ? menuCliente : menuTrabajador;

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-screen fixed left-0 top-0 z-40">
      {/* Sección del Logo */}
      <div className="h-20 flex items-center px-6 border-b border-slate-100">
        <Image
          src="/logo-letras.png"
          alt="Oficio Link"
          width={130}
          height={40}
          className="w-auto h-8"
        />
      </div>

      {/* Navegación Principal */}
      <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-3">
          Menú Principal
        </p>

        {menu.map((item) => {
          const activo = pathname === item.ruta;
          const Icono = item.icono;

          return (
            <Link
              key={item.nombre}
              href={item.ruta}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-semibold text-sm ${
                activo
                  ? "bg-[#14A5B8]/10 text-[#14A5B8]"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icono
                className={`h-5 w-5 ${activo ? "text-[#14A5B8]" : "text-slate-400"}`}
              />
              {item.nombre}
            </Link>
          );
        })}
      </nav>

      {/* Footer del Sidebar (Botón de salir) */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="w-full flex items-center justify-center">
          {/* Aquí usamos tu componente que ya tenías */}
          <BotonSalir className="w-full bg-white text-slate-700 border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100" />
        </div>
      </div>
    </aside>
  );
}
