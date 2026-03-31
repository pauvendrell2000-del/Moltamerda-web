// Este archivo es un placeholder - el middleware redirige '/' a '/ca/' automáticamente
// Ver middleware.ts para la lógica de redirección

import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/ca");
}
