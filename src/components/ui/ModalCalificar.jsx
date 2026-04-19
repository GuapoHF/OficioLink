"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star, Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export default function ModalCalificar({ solicitud }) {
  const supabase = createClient();
  const [abierto, setAbierto] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comentario, setComentario] = useState("");
  const [guardando, setGuardando] = useState(false);

  const handleGuardar = async () => {
    if (rating === 0)
      return toast.error("Por favor selecciona una calificación de estrellas.");

    setGuardando(true);

    // 1. Obtenemos al usuario activo directamente para evitar fallos de ID
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Tu sesión expiró");
      setGuardando(false);
      return;
    }

    // 2. Imprimimos lo que vamos a mandar para verificar que nada sea 'undefined'
    const datosAEnviar = {
      solicitud_id: solicitud.id,
      cliente_id: session.user.id, // Forzamos usar el ID de la sesión segura
      trabajador_id: solicitud.trabajador_id,
      calificacion: rating,
      comentario: comentario,
    };
    console.log("Enviando a BD:", datosAEnviar);

    const { error } = await supabase.from("resenas").insert(datosAEnviar);

    setGuardando(false);

    if (error) {
      console.error("🚨 ERROR AL GUARDAR RESEÑA:", error);
      if (error.code === "23505") {
        toast.error("Ya habías calificado este servicio antes.");
      } else {
        // Truco para forzar a leer el error aunque sea un objeto vacío
        toast.error(
          `Error BD: ${JSON.stringify(error) === "{}" ? "Bloqueo de Seguridad (RLS)" : error.message}`,
        );
      }
      return;
    }

    toast.success("¡Gracias por calificar al experto!");
    setAbierto(false);
  };
  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="mt-2 w-full md:w-auto border-yellow-400 text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700 font-bold rounded-xl h-10 px-6 transition-all"
        >
          <Star className="h-4 w-4 mr-2 fill-current" />
          Calificar Experto
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md p-8 rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-extrabold text-center text-slate-900">
            ¿Cómo te fue con el servicio?
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-6 py-4">
          {/* Estrellas Interactivas */}
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((estrella) => (
              <button
                key={estrella}
                type="button"
                className="transition-transform hover:scale-110 focus:outline-none"
                onClick={() => setRating(estrella)}
                onMouseEnter={() => setHover(estrella)}
                onMouseLeave={() => setHover(0)}
              >
                <Star
                  className={`h-12 w-12 transition-colors ${
                    estrella <= (hover || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-slate-100 text-slate-200"
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            {rating === 0
              ? "Selecciona una estrella"
              : rating === 1
                ? "Terrible"
                : rating === 2
                  ? "Malo"
                  : rating === 3
                    ? "Regular"
                    : rating === 4
                      ? "Muy Bueno"
                      : "¡Excelente!"}
          </p>

          {/* Campo de Comentario */}
          <div className="w-full space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-[#14A5B8]" />
              Deja un comentario (Opcional)
            </label>
            <textarea
              className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-[#14A5B8] focus:border-transparent outline-none resize-none h-24 text-sm"
              placeholder="Ej. Llegó muy puntual y dejó todo limpio..."
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
            />
          </div>

          <Button
            onClick={handleGuardar}
            disabled={guardando}
            className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg"
          >
            {guardando ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              "Enviar Calificación"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
