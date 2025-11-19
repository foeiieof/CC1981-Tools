import { B2C_SalesOrderTable_History, Prisma, PrismaClient } from "@prisma/client"
import { NextRequest } from "next/server"
import { IResponse, Lgr, ResponseHandle } from "../../utility"
import { endsWith } from "zod"
import { startOfDay } from "date-fns"

const prisma = new PrismaClient({ transactionOptions: { timeout: 30 } })

export async function GET(req: NextRequest) {
  try {
    const date = new Date()
    const query = req.nextUrl.searchParams
    const pageQ = Number(query.get("page") ?? undefined)
    const sizeQ = Number(query.get("size") ?? undefined)
    const yearQ = Number(query.get("year") ?? date.getFullYear())

    const startQ = query.get("start") ?? undefined
    const endQ = query.get("end") ?? undefined
    const orderSN = query.get("order_sn") ?? undefined

    const [page, limit, year] = [Math.floor(pageQ ?? 1), Math.floor(sizeQ), yearQ === 0 ? (new Date().getFullYear()) : yearQ]

    const cond: Prisma.B2C_SalesOrderTableWhereInput = {}
    Lgr.info({ start: startQ, end: endQ }, "Param")

    if (startQ || endQ) {
      const dateCond: Prisma.DateTimeFilter<"B2C_SalesOrderTable"> = {}
      if (startQ) {
        dateCond.gte = new Date(Number(startQ) * 1000)
      }
      if (endQ) {
        dateCond.lte = new Date(Number(endQ) * 1000)
      }
      cond.CreationDate = dateCond
    }

    if (!startQ && !endQ)
      cond.CreationDate = { gte: startOfDay(new Date()) }

    if (orderSN) {
      if (orderSN.includes("/")) {
        cond.OrderId = { contains: orderSN.split("/")[0] }
      } else {
        cond.OrderId = orderSN
      }
    }

    Lgr.info({ cond: cond, page: page, limit: limit }, "[API]-TIME")

    const pagi: { skip?: number, take?: number } = {}
    if (limit && page) {
      pagi.skip = Math.max(0, Number(limit * (page - 1)))
      pagi.take = limit
    }

    // pagi.take = 100
    const [data, count, channel] = await Promise.all([
      prisma.b2C_SalesOrderTable.findMany({
        where: cond,
        ...pagi,
        orderBy: { CreationDate: "desc" }
      }),
      prisma.b2C_SalesOrderTable.count({ where: cond }),
      prisma.b2C_ChannelTable.findMany()
    ])

    // Lgr.info(JSON.stringify(data))

    const dataMap = data.map((d) => {
      const brand = channel.find((c) => c.ChannelId === d.ChannelId)
      return {
        ...d,
        Brand: brand?.Name,
        Platform: brand?.ChannelType
      }
    })

    // test find error when bill not splits 
    // if (typeBill === "error") {
    //   const ids = dataMap.filter(e => !e.OrderId.includes("/")).map(e => e.OrderId.trim());
    //   const likeQuery = ids.map(id => `OrderId LIKE '%${id}%'`).join(" OR ");
    //   const res = await prisma.$queryRawUnsafe(`
    //   SELECT 
    //     [OrderId], 
    //     STRING_AGG([ItemSKU], ', ') AS [Items]
    //   FROM [tl].[b2c_SalesOrderLine]
    //   WHERE ${likeQuery}
    //   GROUP BY [OrderId]
    //   ;`);
    //   Lgr.info({ query: likeQuery }, "GetOrderB2C-query");
    //   Lgr.info({ order: res }, "GetOrderB2C");
    // }


    return ResponseHandle.success(dataMap, "getOrderFromB2C", 200, count, page, {}, { yearOfData: year })
  } catch (error) {
    const err = error as IResponse<unknown>
    Lgr.error({ message: err.message }, "[API] GetB2COrder")
    return ResponseHandle.error("[Tiktok] GetOrderAWB", err.message, 400)
  }
}
