import { PrismaClient } from "@prisma/client"
import { NextRequest } from "next/server"
import { IResponse, Lgr, ResponseHandle } from "../../utility"

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  // return ResponseHandle.error("data required", "orderawb-tiktok-shop", 400)
  try {
    const query = req.nextUrl.searchParams
    const pageQ = Number(query.get("page"))
    const sizeQ = Number(query.get("size"))
    const yearQ = Number(query.get("year"))
    // const awb = await prisma
    if (!Number.isFinite(pageQ) || !Number.isFinite(sizeQ) || !Number.isFinite(yearQ)) return ResponseHandle.error("[B2C] GetOrder", "Invalid page/size", 400);
    const [page, limit, year] = [Math.floor(pageQ ?? 1), Math.floor(sizeQ ?? 100), yearQ === 0 ? (new Date().getFullYear()) : yearQ]
    const limitDate = new Date(year, 0, 1)
    const [data, count, channel] = await Promise.all([
      prisma.b2C_SalesOrderTable.findMany({
        where: { CreationDate: { gte: limitDate } },
        skip: Math.max(0, Number(limit * (page - 1))),
        take: limit, orderBy: { CreationDate: "desc" }
      }),
      prisma.b2C_SalesOrderTable.count({ where: { CreationDate: { gte: limitDate } } }),
      prisma.b2C_ChannelTable.findMany()
    ])


    const dataMap = data.map((d) => {
      const brand = channel.find((c) => c.ChannelId === d.ChannelId)
      return {
        ...d,
        Brand: brand?.Name,
        Platform: brand?.ChannelType
      }
    })

    return ResponseHandle.success(dataMap, "getOrderFromB2C", 200, count, page, {}, { yearOfData: year })
  } catch (error) {
    const err = error as IResponse<unknown>
    Lgr.error(err.message)
    return ResponseHandle.error("[Tiktok] GetOrderAWB", err.message, 400)
  }
}
