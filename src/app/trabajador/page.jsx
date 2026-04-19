"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  MapPin,
  Banknote,
  Calendar,
  User,
  Phone,
  CheckCircle2,
  Loader2,
  TrendingUp,
  ImageIcon,
  Upload,
  Trash2,
  Menu, // <-- Agregué Menu para el móvil
} from "lucide-react";
import BotonSalir from "@/components/ui/BotonSalir";
import BotonEliminar from "@/components/ui/BotonEliminar";
import Image from "next/image";
// 👇 NUESTRO NUEVO COMPONENTE 👇
import Sidebar from "@/components/ui/Sidebar";
export default function TrabajadorDashboard() {
  const supabase = createClient();
  const router = useRouter();
  const [solicitudes, setSolicitudes] = useState([]);
  const [portafolios, setPortafolios] = useState([]);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  const [subiendo, setSubiendo] = useState(false);
  const [archivo, setArchivo] = useState(null);
  const [descripcionFoto, setDescripcionFoto] = useState("");

  const cargarDatos = async (userId) => {
    // 1. Cargar solicitudes con toda la relación de la dirección del cliente
    const { data: dataSol, error: errorSol } = await supabase
      .from("solicitudes")
      .select(
        `
        *,
        usuarios (
          nombre_completo,
          telefono,
          calle,
          numero_ext,
          numero_int,
          colonia,
          codigo_postal,
          referencias
        )
      `,
      )
      .eq("trabajador_id", userId)
      .order("creado_en", { ascending: false });

    if (errorSol) {
      console.error("Error al cargar solicitudes:", errorSol);
    } else if (dataSol) {
      setSolicitudes(dataSol);
    }

    // 2. Cargar fotos del portafolio
    const { data: dataFotos } = await supabase
      .from("portafolios")
      .select("*")
      .eq("trabajador_id", userId)
      .order("creado_en", { ascending: false });

    if (dataFotos) setPortafolios(dataFotos);

    setLoading(false);
  };

  useEffect(() => {
    let canalRealtime;

    const verificarAcceso = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return router.push("/login");

      const { data: trabajador } = await supabase
        .from("trabajadores")
        .select(`*, oficios(nombre)`)
        .eq("id", session.user.id)
        .single();

      if (!trabajador) {
        await supabase.auth.signOut();
        return router.push("/login");
      }

      setPerfil(trabajador);
      await cargarDatos(session.user.id);

      // Escuchar cambios en tiempo real
      canalRealtime = supabase
        .channel(`worker-sync-${Date.now()}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "solicitudes",
            filter: `trabajador_id=eq.${session.user.id}`,
          },
          () => {
            cargarDatos(session.user.id);
            toast.info("Tus solicitudes han sido actualizadas");
          },
        )
        .subscribe();
    };

    verificarAcceso();

    return () => {
      if (canalRealtime) supabase.removeChannel(canalRealtime);
    };
  }, [router, supabase]);

  const actualizarEstado = async (id, nuevoEstado) => {
    const { error } = await supabase
      .from("solicitudes")
      .update({ estado: nuevoEstado })
      .eq("id", id);
    if (!error) {
      setSolicitudes(
        solicitudes.map((s) =>
          s.id === id ? { ...s, estado: nuevoEstado } : s,
        ),
      );
      toast.success("Estado actualizado correctamente");
    } else {
      toast.error("Error al actualizar el estado");
    }
  };

  const subirFoto = async (e) => {
    e.preventDefault();
    if (!archivo) return toast.error("Selecciona una imagen primero");

    setSubiendo(true);

    try {
      const fileExt = archivo.name.split(".").pop();
      const fileName = `${perfil.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("fotos_trabajos")
        .upload(filePath, archivo);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("fotos_trabajos").getPublicUrl(filePath);

      const { error: dbError } = await supabase.from("portafolios").insert({
        trabajador_id: perfil.id,
        imagen_url: publicUrl,
        descripcion: descripcionFoto,
      });

      if (dbError) throw dbError;

      setArchivo(null);
      setDescripcionFoto("");
      document.getElementById("foto-input").value = "";
      toast.success("¡Foto subida con éxito!");
      cargarDatos(perfil.id);
    } catch (error) {
      console.error(error);
      toast.error("Error al subir la foto: " + error.message);
    } finally {
      setSubiendo(false);
    }
  };

  const eliminarFoto = async (id, url) => {
    if (!confirm("¿Seguro que deseas eliminar esta foto?")) return;

    await supabase.from("portafolios").delete().eq("id", id);

    const nombreArchivo = url.split("/").pop();
    await supabase.storage.from("fotos_trabajos").remove([nombreArchivo]);

    toast.success("Foto eliminada");
    cargarDatos(perfil.id);
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin h-10 w-10 text-[#14A5B8]" />
      </div>
    );

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* 1. NUESTRO COMPONENTE SIDEBAR (Oculto en celular, fijo en Desktop) */}
      <Sidebar rol="trabajador" />

      {/* 2. CONTENEDOR PRINCIPAL (Se empuja a la derecha 64 unidades que es el ancho del Sidebar) */}
      <div className="flex-1 md:ml-64 flex flex-col">
        {/* Topbar exclusivo para celulares (se oculta en PC) */}
        <header className="md:hidden flex justify-between items-center bg-white p-4 border-b border-slate-200">
          <Image
            src="/logo-letras.png"
            alt="Oficio Link"
            width={100}
            height={30}
            className="h-6 w-auto"
          />
          <div className="flex gap-2">
            <BotonSalir />
          </div>
        </header>

        {/* 3. TU CONTENIDO ORIGINAL (Intacto en lógica, mejorado en layout) */}
        <main className="flex-1 p-6 md:p-10 space-y-8 max-w-6xl mx-auto w-full">
          {/* Banner de Bienvenida */}
          <div className="bg-slate-900 rounded-[2rem] p-8 md:p-12 text-white relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <TrendingUp className="w-64 h-64 text-[#14A5B8]" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <p className="text-[#14A5B8] font-semibold tracking-wider uppercase text-sm mb-2">
                  ¡Hola, {perfil?.nombre_completo.split(" ")[0]}!
                </p>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                  Bienvenido a tu <br /> jornada laboral
                </h1>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Columna Izquierda: Tarjetas de Solicitudes (Tu código exacto) */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">
                Solicitudes Activas
              </h2>
              {solicitudes.length === 0 ? (
                <Card className="border-dashed border-2 py-20 text-center bg-transparent">
                  <p className="text-slate-500 font-medium">
                    Aún no hay servicios solicitados.
                  </p>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {/* Aquí va todo tu .map de solicitudes intacto */}
                  {solicitudes.map((sol) => (
                    <Card
                      key={sol.id}
                      className="border-0 shadow-sm bg-white overflow-hidden hover:shadow-md transition-all"
                    >
                      <div className="flex">
                        <div
                          className={`w-2 ${sol.estado === "pendiente" ? "bg-amber-400" : sol.estado === "en_proceso" ? "bg-[#14A5B8]" : "bg-green-500"}`}
                        />
                        <div className="flex-1 p-6">
                          {/* Cabecera de la tarjeta */}
                          <div className="flex justify-between items-start mb-6">
                            <div className="flex gap-4 items-center">
                              <div className="bg-slate-100 h-14 w-14 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                <User className="text-slate-400 h-7 w-7" />
                              </div>
                              <div>
                                <h3 className="font-extrabold text-xl text-slate-900 leading-tight">
                                  {sol.usuarios?.nombre_completo ||
                                    "Cargando nombre..."}
                                </h3>
                                <p className="text-sm text-slate-500 flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />{" "}
                                  {new Date(sol.creado_en).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <Badge className="uppercase px-3 py-1 font-bold">
                              {sol.estado.replace("_", " ")}
                            </Badge>
                          </div>

                          {/* Logística */}
                          <div className="bg-slate-50 rounded-2xl p-5 mb-6 border border-slate-100">
                            <p className="text-[10px] text-[#14A5B8] uppercase font-black tracking-widest mb-3 flex items-center gap-2">
                              <MapPin className="h-3 w-3" /> Datos de Ubicación
                            </p>
                            {sol.usuarios?.calle ? (
                              <div className="text-slate-700 space-y-1">
                                <p className="font-bold text-base">
                                  {sol.usuarios.calle}{" "}
                                  {sol.usuarios.numero_ext
                                    ? `#${sol.usuarios.numero_ext}`
                                    : ""}
                                  {sol.usuarios.numero_int
                                    ? ` (Int. ${sol.usuarios.numero_int})`
                                    : ""}
                                </p>
                                <p className="text-sm">
                                  Col. {sol.usuarios.colonia}, C.P.{" "}
                                  {sol.usuarios.codigo_postal}
                                </p>
                                {sol.usuarios.referencias && (
                                  <p className="text-xs text-slate-500 italic mt-3 pt-3 border-t border-slate-200">
                                    <span className="font-bold text-slate-400 not-italic uppercase text-[9px] block mb-1">
                                      Referencias:
                                    </span>
                                    {sol.usuarios.referencias}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-slate-400 italic">
                                Cargando dirección detallada...
                              </p>
                            )}
                          </div>

                          {/* Detalles finales y botones */}
                          <div className="grid grid-cols-2 gap-6 py-4 border-t border-slate-100">
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase font-black mb-1">
                                Servicio
                              </p>
                              <p className="text-sm text-slate-800 font-semibold">
                                {sol.servicio_detalle}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase font-black mb-1">
                                Contacto
                              </p>
                              <p className="text-sm text-slate-800 font-semibold flex items-center gap-1">
                                <Phone className="h-4 w-4 text-blue-500" />{" "}
                                {sol.usuarios?.telefono || "No disponible"}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-3 mt-6">
                            {sol.estado === "pendiente" && (
                              <Button
                                onClick={() =>
                                  actualizarEstado(sol.id, "en_proceso")
                                }
                                className="flex-1 bg-[#14A5B8] h-12 rounded-xl font-bold"
                              >
                                Aceptar Trabajo
                              </Button>
                            )}
                            {sol.estado === "en_proceso" && (
                              <Button
                                onClick={() =>
                                  actualizarEstado(sol.id, "completado")
                                }
                                className="flex-1 bg-green-600 h-12 rounded-xl font-bold"
                              >
                                Finalizar Trabajo
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Columna Derecha: Portafolio (Tu código exacto) */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <ImageIcon className="h-6 w-6 text-[#14A5B8]" /> Portafolio
              </h2>
              <Card className="p-5 bg-white border-0 shadow-sm rounded-2xl">
                <form onSubmit={subirFoto} className="space-y-4">
                  <Input
                    id="foto-input"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setArchivo(e.target.files[0])}
                  />
                  <Input
                    placeholder="Descripción"
                    value={descripcionFoto}
                    onChange={(e) => setDescripcionFoto(e.target.value)}
                  />
                  <Button
                    disabled={subiendo || !archivo}
                    type="submit"
                    className="w-full bg-slate-900 h-12 rounded-xl"
                  >
                    {subiendo ? (
                      <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                      "Subir foto"
                    )}
                  </Button>
                </form>
              </Card>
              <div className="grid grid-cols-2 gap-3">
                {portafolios.map((foto) => (
                  <div
                    key={foto.id}
                    className="relative h-28 bg-slate-200 rounded-xl overflow-hidden group shadow-sm"
                  >
                    <img
                      src={foto.imagen_url}
                      className="w-full h-full object-cover"
                      alt="Trabajo"
                    />
                    <button
                      onClick={() => eliminarFoto(foto.id, foto.imagen_url)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-red-500 text-white p-1.5 rounded-lg shadow-md transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
