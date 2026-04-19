"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Star,
  Phone,
  MessageSquare,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  Banknote,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";
import Estrellas from "@/components/ui/Estrellas";

export default function PerfilExperto() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();

  // === TUS ESTADOS INTACTOS ===
  const [trabajador, setTrabajador] = useState(null);
  const [fotos, setFotos] = useState([]);
  const [resenas, setResenas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [session, setSession] = useState(null);

  // === TU LÓGICA CORREGIDA INTACTA ===
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      const { data: dataTrabajador } = await supabase
        .from("trabajadores")
        .select(
          `
          *, 
          oficios(nombre, costo_defecto),
          promedio_trabajadores(promedio, total_resenas)
        `,
        )
        .eq("id", id)
        .single();

      const { data: dataFotos } = await supabase
        .from("portafolios")
        .select("*")
        .eq("trabajador_id", id)
        .order("creado_en", { ascending: false });

      const { data: dataResenas } = await supabase
        .from("resenas")
        .select(
          `
          *,
          usuarios(nombre_completo)
        `,
        )
        .eq("trabajador_id", id)
        .order("creado_en", { ascending: false });

      if (!isMounted) return;

      setSession(currentSession);
      setTrabajador(dataTrabajador);
      setFotos(dataFotos || []);
      setResenas(dataResenas || []);
      setLoading(false);
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [id, supabase]);

  const handleContratar = async (e) => {
    e.preventDefault();
    if (!session) return router.push("/login");

    setEnviando(true);
    const formData = new FormData(e.target);

    const { error } = await supabase.from("solicitudes").insert({
      cliente_id: session.user.id,
      trabajador_id: id,
      servicio_detalle: formData.get("detalle"),
      metodo_pago: formData.get("pago"),
      estado: "pendiente",
    });

    if (error) {
      toast.error("Error al enviar la solicitud");
    } else {
      toast.success("¡Solicitud enviada!");
      router.push("/cliente");
    }
    setEnviando(false);
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin h-10 w-10 text-[#14A5B8]" />
      </div>
    );

  const infoReputacion = trabajador?.promedio_trabajadores?.[0] || {
    promedio: 0,
    total_resenas: 0,
  };

  // === EL DISEÑO PREMIUM RESTAURADO ===
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <div className="max-w-5xl mx-auto p-6">
        {/* Botón Volver */}
        <Link href="/cliente">
          <Button
            variant="ghost"
            className="text-slate-500 hover:text-[#14A5B8] gap-2 font-bold mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Volver a la búsqueda
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* COLUMNA IZQUIERDA: PERFIL Y RESEÑAS */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tarjeta Principal de Perfil */}
            <Card className="border-0 shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
              <div className="h-32 bg-slate-900 w-full relative">
                <div className="absolute -bottom-16 left-8">
                  <div className="h-32 w-32 rounded-3xl bg-white p-1 shadow-lg">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${trabajador?.nombre_completo}`}
                      className="rounded-[1.2rem] bg-slate-100 w-full h-full object-cover"
                      alt="Avatar"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-20 pb-8 px-8">
                <div className="flex justify-between items-start flex-wrap gap-4">
                  <div>
                    <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
                      {trabajador?.nombre_completo}
                      <ShieldCheck className="text-blue-500 h-6 w-6" />
                    </h1>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge className="bg-[#14A5B8] hover:bg-[#14A5B8] px-4 py-1 rounded-lg">
                        {trabajador?.oficios?.nombre}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Estrellas
                          calificacion={infoReputacion.promedio}
                          tamano="h-4 w-4"
                        />
                        <span className="text-sm font-bold text-slate-400">
                          {infoReputacion.promedio} (
                          {infoReputacion.total_resenas} reseñas)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dialog de Contratación */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-[#14A5B8] hover:bg-[#0f8494] px-8 h-12 rounded-2xl font-bold shadow-lg shadow-[#14A5B8]/20">
                        Contratar Servicio
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-3xl p-8 sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">
                          Solicitar a {trabajador?.nombre_completo}
                        </DialogTitle>
                      </DialogHeader>
                      <form
                        onSubmit={handleContratar}
                        className="space-y-6 mt-4"
                      >
                        <div className="space-y-2">
                          <Label className="text-slate-700 font-semibold">
                            Detalle de lo que necesitas
                          </Label>
                          <textarea
                            name="detalle"
                            required
                            className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-[#14A5B8] outline-none h-24 resize-none"
                            placeholder="Ej: Necesito cambiar 3 enchufes y revisar el centro de carga..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-700 font-semibold">
                            Método de Pago Preferido
                          </Label>
                          <select
                            name="pago"
                            className="w-full p-3 rounded-xl border border-slate-200
                             bg-white outline-none focus:ring-2 focus:ring-[#14A5B8]"
                          >
                            <option value="Efectivo">Efectivo</option>
                            <option value="Tarjeta">Tarjeta</option>
                            <option value="Transferencia">Transferencia</option>
                          </select>
                        </div>
                        <Button
                          disabled={enviando}
                          className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-lg"
                        >
                          {enviando ? (
                            <Loader2 className="animate-spin h-5 w-5" />
                          ) : (
                            "Enviar Solicitud Directa"
                          )}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mt-10 pt-8 border-t border-slate-50">
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                      Ubicación
                    </p>
                    <p className="text-sm font-bold text-slate-700 flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-[#14A5B8]" />{" "}
                      {trabajador?.nombre_zona}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                      Costo Mínimo
                    </p>
                    <p className="text-sm font-bold text-slate-700 flex items-center gap-1">
                      <Banknote className="h-4 w-4 text-green-500" /> $
                      {trabajador?.oficios?.costo_defecto} MXN
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                      Contacto
                    </p>
                    <p className="text-sm font-bold text-slate-700 flex items-center gap-1">
                      <Phone className="h-4 w-4 text-blue-500" />{" "}
                      {trabajador?.telefono}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* SECCIÓN DE RESEÑAS */}
            <div className="space-y-6 pt-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Star className="h-6 w-6 text-yellow-400 fill-current" />
                Opiniones de Clientes ({resenas.length})
              </h2>

              {resenas.length === 0 ? (
                <div className="bg-white p-10 rounded-[2rem] border border-dashed text-center">
                  <MessageSquare className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">
                    Este experto aún no tiene opiniones escritas.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {resenas.map((r) => (
                    <Card
                      key={r.id}
                      className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[#14A5B8] text-lg">
                              {r.usuarios?.nombre_completo?.[0] || "U"}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">
                                {r.usuarios?.nombre_completo || "Usuario"}
                              </p>
                              <Estrellas
                                calificacion={r.calificacion}
                                tamano="h-3 w-3"
                              />
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">
                            {new Date(r.creado_en).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-600 text-sm italic leading-relaxed pl-1">
                          {r.comentario ||
                            "Calificó el servicio sin dejar un comentario."}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* COLUMNA DERECHA: PORTAFOLIO */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-[#14A5B8]" /> Portafolio
            </h2>
            {fotos.length === 0 ? (
              <div className="bg-white p-6 rounded-3xl border border-dashed text-center">
                <p className="text-sm text-slate-400 font-medium">
                  Sin fotos de trabajos previos.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {fotos.map((foto) => (
                  <Card
                    key={foto.id}
                    className="border-0 shadow-sm overflow-hidden rounded-3xl group"
                  >
                    <div className="relative aspect-square">
                      <img
                        src={foto.imagen_url}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        alt="Trabajo realizado"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex items-end">
                        <p className="text-white text-sm font-medium leading-snug">
                          {foto.descripcion}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
