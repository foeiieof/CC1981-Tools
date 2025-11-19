import { IReqOrderGroup } from "@/app/api/types"
import { IResponse, Lgr, ResponseHandle } from "@/app/api/utility"
import { Prisma, PrismaClient } from "@prisma/client"
import { DefaultArgs } from "@prisma/client/runtime/library"
import { NextRequest } from "next/server"

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    const query = req.nextUrl.searchParams
    const orderSN = query.get("order_sn") ?? undefined
    if (!orderSN) return ResponseHandle.error('params is required', "orderSN not found")

    const orderList = orderSN.split(',')
    const condWhere: Prisma.B2C_SalesOrderLineWhereInput = {}
    if (orderList) {
      condWhere.OrderId = { in: orderList.map(i => i) }
    }

    const orderDetail = await prisma.b2C_SalesOrderLine.findMany({ where: condWhere })

    return ResponseHandle.success(orderDetail, 'ok')
  } catch (error) {
    const err = error as IResponse<unknown>
    Lgr.error({ message: err.message }, "[API] GetB2COrder")
    return ResponseHandle.error("[Tiktok] GetOrderAWB", err.message, 400)
  }
}

export async function POST(req: NextRequest) {
  try {
    const query: IReqOrderGroup = await req.json()

    if (!query.order_sn) return ResponseHandle.error('params is required', "orderSN not found")

    Lgr.info({ data: query }, "Params in API")
    const condOrderTableWhere: Prisma.B2C_SalesOrderTableWhereInput = { OrderId: query.order_sn }
    const condOrderLineWhere: Prisma.B2C_SalesOrderLineWhereInput = { OrderId: query.order_sn }

    const [orderTables, orderDetails] = await Promise.all([prisma.b2C_SalesOrderTable.findFirstOrThrow({ where: condOrderTableWhere }), prisma.b2C_SalesOrderLine.findMany({ where: condOrderLineWhere })])

    if (!orderTables || !orderDetails)
      return ResponseHandle.error(`order_sn: ${query.order_sn} not found`, "Split Bill Error")


    const updateTable = Array.from({ length: query.order_groups }, (_, n) => ({ ...orderTables, OrderId: `${query.order_sn}/${n + 1}` }))

    const updateLine = Object.entries(query.order_group_items).map(async ([sku, group]) => {
      const orderLine = orderDetails.find(i => i.ItemSKU === sku)
      if (!orderLine) return null;
      return prisma.b2C_SalesOrderLine.update({
        where: {
          ChannelId_OrderId_Seq: {
            ChannelId: orderLine.ChannelId,
            OrderId: orderLine.OrderId,
            Seq: orderLine.Seq
          }
        },
        data: { ...orderLine, OrderId: orderLine.OrderId + "/" + group }
      })
    }
    )

    const [resOrderTables, resOrderLines] = await Promise.all([
      prisma.b2C_SalesOrderTable.createMany({ data: updateTable }),
      updateLine])


    let deleteStatus
    if (resOrderLines && resOrderTables) {
      deleteStatus = await prisma.b2C_SalesOrderTable.delete({
        where: {
          ChannelId_OrderId: {
            ChannelId: orderTables.ChannelId,
            OrderId: orderTables.OrderId
          }
        }
      })
    }

    return ResponseHandle.success({ b2c_saleOrderTable: resOrderTables, b2c_saleOrderLine: resOrderLines, status: deleteStatus }, 'ok')

    // return ResponseHandle.success({ b2c_saleOrderTable: orderTables, b2c_saleOrderLine: orderDetails }, "ok!")

    // find 
    // find --> update

    // 1.b2c_saleOrderLine 
    // 2.b2c_saleOrderTable

  } catch (error) {
    const err = error as IResponse<unknown>
    Lgr.error({ message: err.message }, "[API] GetB2COrder")
    return ResponseHandle.error("[Tiktok] GetOrderAWB", err.message, 400)
  }
}
