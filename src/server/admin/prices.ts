import { Prisma } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { getDb } from "@/server/db";
import { invalidInput, notFound } from "@/server/errors";

export type AdminPriceOption = {
  id: string;
  durationMinutes: number;
  priceCents: number;
  active: boolean;
};

export type AdminPricedService = {
  id: string;
  name: string;
  active: boolean;
  options: AdminPriceOption[];
};

function refreshPrices() {
  revalidatePath("/");
  revalidatePath("/reservation");
  revalidatePath("/admin/prices");
  revalidatePath("/admin/bookings/new");
}

function priceCentsFromMad(value: number): number {
  if (!Number.isFinite(value) || value < 1 || value > 20000) {
    throw invalidInput("Enter a price between 1 and 20,000 MAD.");
  }
  return Math.round(value * 100);
}

function durationFrom(value: number): number {
  if (!Number.isInteger(value) || value < 15 || value > 300) {
    throw invalidInput("Enter a duration between 15 and 300 minutes.");
  }
  return value;
}

export async function listPricedServices(): Promise<AdminPricedService[]> {
  const rows = await getDb().service.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      active: true,
      options: { orderBy: { durationMinutes: "asc" }, select: { id: true, durationMinutes: true, priceCents: true, active: true } },
    },
  });
  return rows;
}

export async function addServicePrice(serviceId: string, durationMinutes: number, priceMad: number): Promise<void> {
  const duration = durationFrom(durationMinutes);
  const priceCents = priceCentsFromMad(priceMad);
  const service = await getDb().service.findUnique({ where: { id: serviceId }, select: { id: true } });
  if (!service) throw notFound("Treatment not found.");
  const existing = await getDb().serviceOption.findUnique({ where: { serviceId_durationMinutes: { serviceId, durationMinutes: duration } } });
  if (existing) throw invalidInput("This duration already exists. Turn it on, or delete it before adding it again.");
  try {
    await getDb().serviceOption.create({ data: { serviceId, durationMinutes: duration, priceCents, active: true } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw invalidInput("This duration already exists.");
    }
    throw error;
  }
  refreshPrices();
}

export async function updateServicePrice(optionId: string, priceMad: number): Promise<void> {
  const priceCents = priceCentsFromMad(priceMad);
  const { count } = await getDb().serviceOption.updateMany({ where: { id: optionId }, data: { priceCents } });
  if (count !== 1) throw notFound("Price not found.");
  refreshPrices();
}

export async function deleteServicePrice(optionId: string): Promise<void> {
  const { count } = await getDb().serviceOption.deleteMany({ where: { id: optionId } });
  if (count !== 1) throw notFound("Price not found.");
  refreshPrices();
}

export async function setServicePriceActive(optionId: string, active: boolean): Promise<void> {
  const { count } = await getDb().serviceOption.updateMany({ where: { id: optionId }, data: { active } });
  if (count !== 1) throw notFound("Price not found.");
  refreshPrices();
}

export async function setServiceBookable(serviceId: string, active: boolean): Promise<void> {
  const { count } = await getDb().service.updateMany({ where: { id: serviceId }, data: { active } });
  if (count !== 1) throw notFound("Treatment not found.");
  refreshPrices();
}
