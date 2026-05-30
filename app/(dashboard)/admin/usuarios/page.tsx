"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Card, CardBody } from "@/components/ui/card";
import type { UserRole } from "@/lib/types";

type AdminUser = {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
  player: {
    id: string;
    name: string;
    gamertag: string;
    clubName: string | null;
  } | null;
};

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetId, setResetId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => setUsers(d.users ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function updateRole(userId: string, role: UserRole) {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role }),
    });
    if (res.ok) {
      setMessage(
        role === "admin"
          ? "Rol actualizado. El usuario debe recargar la página (F5) para acceder al panel admin."
          : "Rol actualizado.",
      );
    }
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role } : u)),
    );
  }

  async function deleteUser(userId: string, gamertag: string) {
    if (!confirm(`¿Eliminar la cuenta de ${gamertag}? Esta acción no se puede deshacer.`)) {
      return;
    }
    const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error ?? "Error al eliminar usuario.");
      return;
    }
    setMessage(`Cuenta eliminada: ${gamertag}`);
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  }

  async function resetPassword(userId: string) {
    if (newPassword.length < 6) {
      setMessage("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    const res = await fetch(`/api/admin/users/${userId}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword }),
    });
    if (res.ok) {
      setMessage("Contraseña restablecida (almacenada cifrada).");
      setResetId(null);
      setNewPassword("");
    } else {
      setMessage("Error al restablecer contraseña.");
    }
  }

  return (
    <div>
      <PageHeader
        title="Usuarios y cuentas"
        description="Gestión de cuentas. Las contraseñas nunca se muestran; solo se pueden restablecer de forma segura."
        action={
          <Link href="/admin" className="text-sm text-violet-400 hover:underline">
            ← Panel admin
          </Link>
        }
      />

      {message && (
        <p className="mb-4 rounded-lg border border-violet-500/30 bg-violet-500/10 px-4 py-3 text-sm text-violet-300">
          {message}
        </p>
      )}

      <Card>
        <CardBody>
          {loading ? (
            <p className="text-sm text-zinc-500">Cargando usuarios…</p>
          ) : users.length === 0 ? (
            <p className="text-sm text-zinc-500">No hay usuarios registrados.</p>
          ) : (
            <ul className="divide-y divide-white/5">
              {users.map((u) => (
                <li key={u.id} className="space-y-3 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-white">{u.email}</p>
                      <p className="text-xs text-zinc-500">
                        Registro: {new Date(u.createdAt).toLocaleDateString("es-ES")}
                      </p>
                      {u.player && (
                        <p className="mt-1 text-sm text-zinc-400">
                          {u.player.gamertag} · {u.player.name}
                          {u.player.clubName ? ` · ${u.player.clubName}` : " · Sin club"}
                        </p>
                      )}
                    </div>
                    <Select
                      label="Rol"
                      value={u.role}
                      onChange={(e) => updateRole(u.id, e.target.value as UserRole)}
                      className="min-w-[140px]"
                    >
                      <option value="user">User</option>
                      <option value="captain">Captain</option>
                      <option value="admin">Admin</option>
                    </Select>
                  </div>
                  {resetId === u.id ? (
                    <div className="flex flex-wrap items-end gap-2 rounded-lg border border-white/10 p-3">
                      <Input
                        label="Nueva contraseña"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="min-w-[200px] flex-1"
                      />
                      <Button onClick={() => resetPassword(u.id)}>Guardar</Button>
                      <Button variant="secondary" onClick={() => setResetId(null)}>
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <Button variant="ghost" onClick={() => setResetId(u.id)}>
                        Restablecer contraseña
                      </Button>
                      {u.player && u.role !== "admin" && (
                        <Button
                          variant="ghost"
                          className="text-rose-400 hover:text-rose-300"
                          onClick={() => deleteUser(u.id, u.player!.gamertag)}
                        >
                          Eliminar cuenta
                        </Button>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
