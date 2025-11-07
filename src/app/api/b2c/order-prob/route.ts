import { PrismaClient } from "@prisma/client"
import { NextRequest } from "next/server"
import { IResponse, Lgr, ResponseHandle } from "@/app/api/utility"

const prisma = new PrismaClient({
  transactionOptions: { timeout: 30 }
})

export async function GET(req: NextRequest) {
  try {
    const date = new Date()
    const query = req.nextUrl.searchParams
    const pageQ = Number(query.get("page") ?? 1)
    const sizeQ = Number(query.get("size") ?? 200)
    const yearQ = Number(query.get("year") ?? date.getFullYear())
    // const awb = await prisma
    if (!Number.isFinite(pageQ) || !Number.isFinite(sizeQ) || !Number.isFinite(yearQ)) return ResponseHandle.error("[B2C] GetOrder", "Invalid page/size", 400);
    const [page, limit, year] = [Math.floor(pageQ ?? 1), Math.floor(sizeQ ?? 100), yearQ === 0 ? (new Date().getFullYear()) : yearQ]

    const limitDate = new Date(year, 0, 1)
    Lgr.info({ limit: limit.toString() }, "[API]-GetOrderB2C")
    const [data, count, channel] = await Promise.all([
      prisma.b2C_SalesOrderTable.findMany({
        where: { CreationDate: { gte: limitDate } },
        skip: Math.max(0, Number(limit * (page - 1))),
        take: limit, orderBy: { CreationDate: "desc" }
      }),
      prisma.b2C_SalesOrderTable.count({ where: { CreationDate: { gte: limitDate } } }),
      prisma.b2C_ChannelTable.findMany()
    ])

    Lgr.info(JSON.stringify(data))

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
