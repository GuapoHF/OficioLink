"use client";
import Sidebar from "@/components/ui/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Lock, MapPin } from "lucide-react";

export default function AjustesCliente() {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar rol="cliente" />

      <div className="flex-1 md:ml-64 p-6 md:p-10 max-w-4xl mx-auto w-full">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-8">
          Configuración de Cuenta
        </h1>

        <div className="space-y-6">
          {/* Tarjeta de Dirección */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#14A5B8]">
                <MapPin className="h-5 w-5" /> Mi Dirección Principal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Calle</Label>
                  <Input placeholder="Ej. Av. Siempre Viva" />
                </div>
                <div className="space-y-2">
                  <Label>Colonia</Label>
                  <Input placeholder="Ej. Centro" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Referencias adicionales</Label>
                <Input placeholder="Ej. Casa blanca con portón negro" />
              </div>
              <Button className="bg-slate-900">Actualizar Dirección</Button>
            </CardContent>
          </Card>

          {/* Tarjeta de Seguridad */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-700">
                <Lock className="h-5 w-5" /> Seguridad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nueva Contraseña</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <Button variant="outline">Cambiar Contraseña</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
