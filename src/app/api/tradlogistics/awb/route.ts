import { ResponseHandle } from "@/app/api/utility"
import { TikTokShopNodeApiClient } from "@/lib/sdk/tiktok"
import { PrismaClient } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  // return ResponseHandle.error("data required", "orderawb-tiktok-shop", 400)
  try {
    // const awb = await prisma 

  } catch (error) {
    return ResponseHandle.error("[Tiktok] GetOrderAWB", "", 400)
  }
}
