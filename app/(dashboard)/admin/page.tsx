"use client";

import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { useAppData } from "@/lib/store/data-context";

const LINKS = [
  {
    href: "/admin/resultados",
    title: "Actualizar resultados",
    desc: "Introduce marcadores, goleadores y MVP.",
  },
  {
    href: "/admin/competiciones",
    title: "Crear competiciones",
    desc: "Liga, eliminatoria, ida y vuelta o grupos.",
  },
  {
    href: "/admin/clubes",
    title: "Gestionar clubes",
    desc: "Equipos, capitanes y eliminación.",
  },
  {
    href: "/admin/jugadores",
    title: "Traspasos de jugadores",
    desc: "Mover jugadores entre clubes o dejarlos libres.",
  },
  {
    href: "/admin/usuarios",
    title: "Usuarios y roles",
    desc: "Asignar captain o admin.",
  },
];

export default function AdminPage() {
  const data = useAppData();

  return (
    <div>
      <PageHeader
        title="Panel Admin"
        description="Gestión central de la LSA Superliga."
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        {[
          { label: "Clubes", value: data.clubs.length },
          { label: "Jugadores", value: data.players.length },
          { label: "Partidos", value: data.matches.length },
          { label: "Competiciones", value: data.competitions.length },
        ].map((s) => (
          <Card key={s.label}>
            <CardBody className="text-center">
              <p className="text-3xl font-bold text-cyan-400">{s.value}</p>
              <p className="text-xs uppercase text-zinc-500">{s.label}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href}>
            <Card className="h-full transition-all hover:border-cyan-500/30">
              <CardBody>
                <h2 className="font-bold text-white">{l.title}</h2>
                <p className="mt-1 text-sm text-zinc-500">{l.desc}</p>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
