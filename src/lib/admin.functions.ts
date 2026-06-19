import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

function checkPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) throw new Error("Admin password não configurada");
  if (password !== expected) throw new Error("Senha incorreta");
}

async function getAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export const verifyAdminPassword = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ password: z.string() }).parse(d))
  .handler(async ({ data }) => {
    checkPassword(data.password);
    return { ok: true };
  });

export const upsertFranchise = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({
      password: z.string(),
      id: z.string().optional(),
      name: z.string().min(1),
      points: z.number().int(),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    checkPassword(data.password);
    const admin = await getAdmin();
    if (data.id) {
      const { error } = await admin.from("franchises").update({ name: data.name, points: data.points }).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await admin.from("franchises").insert({ name: data.name, points: data.points });
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteFranchise = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ password: z.string(), id: z.string() }).parse(d))
  .handler(async ({ data }) => {
    checkPassword(data.password);
    const admin = await getAdmin();
    const { error } = await admin.from("franchises").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const upsertSeller = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({
      password: z.string(),
      id: z.string().optional(),
      name: z.string().min(1),
      points: z.number().int(),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    checkPassword(data.password);
    const admin = await getAdmin();
    if (data.id) {
      const { error } = await admin.from("sellers").update({ name: data.name, points: data.points }).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await admin.from("sellers").insert({ name: data.name, points: data.points });
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteSeller = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ password: z.string(), id: z.string() }).parse(d))
  .handler(async ({ data }) => {
    checkPassword(data.password);
    const admin = await getAdmin();
    const { error } = await admin.from("sellers").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updatePrize = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ password: z.string(), prize: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    checkPassword(data.password);
    const admin = await getAdmin();
    const { error } = await admin.from("campaign_info").update({ prize: data.prize }).eq("id", 1);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
