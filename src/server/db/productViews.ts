import { db } from "@/db";
import { ProductTable, ProductViewTable } from "@/db/schema";
import { CACHE_TAGS, dbCache, getUserTag } from "@/lib/cache";
import { and, count, eq, gte } from "drizzle-orm";

export async function getProductViewCount(userId: string, date: Date) {
  const cacheFn = dbCache(getProductViewCountInternal, {
    tags: [getUserTag(userId, CACHE_TAGS.products)],
  });

  return cacheFn(userId, date);
}

async function getProductViewCountInternal(userId: string, startDate: Date) {
  const counts = await db
    .select({ pricingViewCount: count() })
    .from(ProductViewTable)
    .innerJoin(ProductTable, eq(ProductTable.id, ProductViewTable.productId))
    .where(
      and(
        eq(ProductTable.clerkUserId, userId),
        gte(ProductViewTable.visitedAt, startDate)
      )
    );

  return counts[0]?.pricingViewCount ?? 0;
}