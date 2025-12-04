import { NextRequest } from "next/server"
import prisma from "@/lib/prisma/client"
import { IResponse, Lgr, ResponseHandle } from "../../utility"


export async function GET(req: NextRequest) {
  try {
    const res = await prisma.onlineSales_CategoryBrandCSCode.findMany({ select: { Brand: true }, distinct: ['Brand'] })
    const brands = res.length > 1 ? Object.values(res).map(i => i.Brand) : res
    return ResponseHandle.success(brands, "[API]B2C_BRANDS")
  } catch (error) {
    const err = error as IResponse<unknown>
    Lgr.error({ message: err.message }, "[API]B2C_BRANDS")
    return ResponseHandle.error("[API]B2C_BRANDS", err.message, 400)
  }
}
