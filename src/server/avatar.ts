import { getAdminConfig } from "@/server/auth/config";
import { getDb } from "@/server/db";
import { invalidInput } from "@/server/errors";

const MAX_BYTES = 2 * 1024 * 1024;

function imageType(bytes: Uint8Array): "image/jpeg" | "image/png" | "image/webp" | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png";
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  return null;
}

/** Accepts a real JPEG, PNG, or WebP up to 2 MB. An empty field means no new photo. */
export async function readAvatarUpload(entry: FormDataEntryValue | null): Promise<{ bytes: Uint8Array<ArrayBuffer>; type: string } | null> {
  if (!(entry instanceof File) || entry.size === 0) return null;
  if (entry.size > MAX_BYTES) throw invalidInput("Please choose a JPG, PNG or WebP image under 2 MB.");
  const raw = new Uint8Array(await entry.arrayBuffer());
  const buffer = new ArrayBuffer(raw.byteLength);
  const bytes = new Uint8Array(buffer);
  bytes.set(raw);
  const type = imageType(bytes);
  if (!type) throw invalidInput("Please choose a JPG, PNG or WebP image under 2 MB.");
  return { bytes: bytes as Uint8Array<ArrayBuffer>, type };
}

export async function saveCustomerAvatar(customerId: string, entry: FormDataEntryValue | null): Promise<void> {
  const image = await readAvatarUpload(entry);
  if (!image) throw invalidInput("Please choose a JPG, PNG or WebP image under 2 MB.");
  await getDb().customer.update({ where: { id: customerId }, data: { avatar: image.bytes, avatarType: image.type } });
}

export async function clearCustomerAvatar(customerId: string): Promise<void> {
  await getDb().customer.update({ where: { id: customerId }, data: { avatar: null, avatarType: null } });
}

export async function customerAvatar(customerId: string): Promise<{ bytes: Uint8Array; type: string } | null> {
  const row = await getDb().customer.findUnique({ where: { id: customerId }, select: { avatar: true, avatarType: true } });
  if (!row?.avatar || !row.avatarType) return null;
  return { bytes: row.avatar, type: row.avatarType };
}

async function adminId(username: string): Promise<number | null> {
  const name = username.trim();
  const row = await getDb().adminAccount.findFirst({ where: { username: name }, select: { id: true } });
  if (row) return row.id;
  const { username: owner, passwordHash } = await getAdminConfig();
  if (owner.toLowerCase() !== name.toLowerCase()) return null;
  const created = await getDb().adminAccount.upsert({
    where: { id: 1 },
    create: { id: 1, username: owner, passwordHash, role: "OWNER" },
    update: { role: "OWNER" },
    select: { id: true },
  });
  return created.id;
}

export async function saveAdminAvatar(username: string, entry: FormDataEntryValue | null): Promise<void> {
  const image = await readAvatarUpload(entry);
  if (!image) throw invalidInput("Please choose a JPG, PNG or WebP image under 2 MB.");
  const id = await adminId(username);
  if (!id) throw invalidInput("Please choose a JPG, PNG or WebP image under 2 MB.");
  await getDb().adminAccount.update({ where: { id }, data: { avatar: image.bytes, avatarType: image.type } });
}

export async function clearAdminAvatar(username: string): Promise<void> {
  const id = await adminId(username);
  if (!id) return;
  await getDb().adminAccount.update({ where: { id }, data: { avatar: null, avatarType: null } }).catch(() => undefined);
}

export async function adminAvatar(username: string): Promise<{ bytes: Uint8Array; type: string } | null> {
  const row = await getDb().adminAccount.findFirst({
    where: { username: username.trim() },
    select: { avatar: true, avatarType: true },
  });
  if (!row?.avatar || !row.avatarType) return null;
  return { bytes: row.avatar, type: row.avatarType };
}
