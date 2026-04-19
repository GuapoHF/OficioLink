"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  User,
  Lock,
  MapPin,
  Briefcase,
  Save,
  Loader2,
  PlusCircle,
  Trash2,
} from "lucide-react";
import Sidebar from "@/components/ui/Sidebar";
import { toast } from "sonner";

export default function AjustesTrabajador() {
  const supabase = createClient();
  const [perfil, setPerfil] = useState(null);
  const [oficios, setOficios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const cargarPerfil = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase
          .from("trabajadores")
          .select("*")
          .eq("id", session.user.id)
          .single();
        setPerfil(data);

        const { data: ofi } = await supabase.from("oficios").select("*");
        setOficios(ofi);
      }
      setLoading(false);
    };
    cargarPerfil();
  }, [supabase]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setGuardando(true);
    const formData = new FormData(e.target);

    const { error } = await supabase
      .from("trabajadores")
      .update({
        nombre_completo: formData.get("nombre"),
        telefono: formData.get("telefono"),
        nombre_zona: formData.get("zona"),
        oficio_id: formData.get("oficio"),
      })
      .eq("id", perfil.id);

    if (error) toast.error("Error al actualizar perfil");
    else toast.success("¡Perfil actualizado con éxito!");
    setGuardando(false);
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin h-10 w-10 text-[#14A5B8]" />
      </div>
    );

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar rol="trabajador" />

      <div className="flex-1 md:ml-64 p-6 md:p-10 max-w-4xl mx-auto w-full space-y-8">
        <h1 className="text-3xl font-extrabold text-slate-900">
          Configuración de Perfil
        </h1>

        <form onSubmit={handleUpdate} className="space-y-6">
          {/* Datos Generales */}
          <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-white border-b border-slate-50">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-[#14A5B8]" /> Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre Completo</Label>
                  <Input
                    name="nombre"
                    defaultValue={perfil?.nombre_completo}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <Input
                    name="telefono"
                    defaultValue={perfil?.telefono}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Zona de Cobertura Principal</Label>
                <Input name="zona" defaultValue={perfil?.nombre_zona} />
              </div>
            </CardContent>
          </Card>

          {/* Oficio y Categorías */}
          <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-white border-b border-slate-50">
              <CardTitle className="text-lg flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-[#14A5B8]" /> Especialidad y
                Oficios
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>Oficio Principal</Label>
                <select
                  name="oficio"
                  defaultValue={perfil?.oficio_id}
                  className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm"
                >
                  {oficios.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-slate-500 italic">
                * Pronto podrás agregar múltiples sub-categorías para que más
                clientes te encuentren.
              </p>
            </CardContent>
          </Card>

          <Button
            disabled={guardando}
            className="w-full md:w-auto bg-[#14A5B8] h-12 px-10 rounded-xl font-bold"
          >
            {guardando ? (
              <Loader2 className="animate-spin mr-2" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Guardar Cambios
          </Button>
        </form>

        {/* Seguridad */}
        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-white border-b border-slate-50">
            <CardTitle className="text-lg flex items-center gap-2">
              <Lock className="h-5 w-5 text-slate-700" /> Seguridad
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Button variant="outline" className="rounded-xl border-slate-200">
              Cambiar Contraseña
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
