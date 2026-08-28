import { requireAuth } from "./requireAuth";

export interface OwnerCheckResult {
  ok: boolean;
  userId?: string;
  isAdmin?: boolean;
  status?: number;
  message?: string;
}

/**
 * Pass the resource's owning userId (e.g. order.userId). Allows the
 * request through if the logged-in user IS that owner, OR is an admin.
 * Use for customer-facing GET routes that must not leak other customers'
 * data (order details, return details) but also need admin visibility.
 */
export async function requireOwnerOrAdmin(resourceUserId?: string): Promise<OwnerCheckResult> {
  const authCheck = await requireAuth();
  if (!authCheck.ok || !authCheck.user) {
    return { ok: false, status: authCheck.status, message: authCheck.message };
  }

  const isAdmin = authCheck.user.role === "admin";
  const isOwner = resourceUserId ? String(authCheck.user._id) === resourceUserId : false;

  // A guest order (no userId recorded at all) can't be owner-verified either
  // way with the current data model — only admins can view those. This is
  // the same guest-order limitation flagged back in the cancel-order route.
  if (!isOwner && !isAdmin) {
    return { ok: false, status: 403, message: "not authorized to view this" };
  }

  return { ok: true, userId: String(authCheck.user._id), isAdmin };
}