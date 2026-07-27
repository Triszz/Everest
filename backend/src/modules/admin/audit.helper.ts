import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../config/prisma";
import type { Request } from "express";
import type { PrismaClient } from "../../generated/prisma/client";

export interface AuditContext {
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditActor {
  userId: string | null;
  actorType?: "ADMIN" | "SYSTEM" | "CUSTOMER" | "PARTNER";
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditPayload {
  actorId: string | null;
  actorType?: "ADMIN" | "SYSTEM" | "CUSTOMER" | "PARTNER";
  action: string;
  targetType?:
    | "USER"
    | "PARTNER"
    | "BRANCH"
    | "CATEGORY"
    | "VOUCHER"
    | "POLICY"
    | "BANNER"
    | "POPUP"
    | "POST"
    | "ORDER"
    | "ADMIN";
  targetId?: string | number | null;
  description: string;
  metadata?: Prisma.InputJsonValue;
  ctx?: AuditContext;
}

type Tx = Prisma.TransactionClient | PrismaClient | typeof prisma;

const buildData = (p: AuditPayload) => ({
  actorId: p.actorId,
  actorType: p.actorType ?? "ADMIN",
  action: p.action,
  targetType: p.targetType ?? null,
  targetId: p.targetId != null ? String(p.targetId) : null,
  description: p.description,
  ipAddress: p.ctx?.ipAddress ?? null,
  userAgent: p.ctx?.userAgent ?? null,
  metadata: p.metadata ?? Prisma.JsonNull,
});

export async function writeAudit(payload: AuditPayload) {
  try {
    await prisma.adminAuditLog.create({ data: buildData(payload) });
  } catch (err) {
    console.error("[audit] failed to write log", { action: payload.action, err });
  }
}

export async function writeAuditTx(tx: Tx, payload: AuditPayload) {
  return tx.adminAuditLog.create({ data: buildData(payload) });
}

// Convenience: build payload từ Express request (admin actions)
export function writeAdminAudit(
  req: Request,
  partial: Omit<AuditPayload, "actorId" | "ctx" | "actorType"> & {
    actorId?: string | null;
    actorType?: AuditPayload["actorType"];
  },
) {
  return writeAudit({
    actorId: partial.actorId ?? req.user?.userId ?? null,
    actorType: partial.actorType ?? "ADMIN",
    action: partial.action,
    targetType: partial.targetType,
    targetId: partial.targetId,
    description: partial.description,
    metadata: partial.metadata,
    ctx: req.auditCtx,
  });
}

// Service-side helper: build AuditPayload từ actor info
export function buildAuditPayload(
  actor: AuditActor,
  partial: Omit<AuditPayload, "actorId" | "actorType" | "ctx">,
): AuditPayload {
  return {
    actorId: actor.userId,
    actorType: actor.actorType ?? "ADMIN",
    ...partial,
    ctx: { ipAddress: actor.ipAddress, userAgent: actor.userAgent },
  };
}