import { Star } from "lucide-react";

export default function Estrellas({ calificacion = 0, tamano = "h-5 w-5" }) {
  // Redondeamos por si nos llega un 4.5
  const estrellasLlenas = Math.round(calificacion);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((estrella) => (
        <Star
          key={estrella}
          className={`transition-colors ${tamano} ${
            estrella <= estrellasLlenas
              ? "fill-yellow-400 text-yellow-400" // Estrella activa
              : "fill-slate-200 text-slate-200" // Estrella inactiva
          }`}
        />
      ))}
    </div>
  );
}
