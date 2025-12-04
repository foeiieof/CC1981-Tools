import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { Lgr, ResponseHandle } from "@/app/api/utility"
import { promisify } from "util"
import stream from "stream"
import archiver from "archiver"
import axios from "axios"
import { Prisma, PrismaClient } from "@prisma/client"
import prisma from "@/lib/prisma/client"

const pipeline = promisify(stream.pipeline)


export async function POST(req: NextRequest) {

  const query = req.nextUrl.searchParams
  const body: { order_list: string[] } = await req.json()

  if (body.order_list.length < 1) {
    return NextResponse.json(
      { message: "Bad Request in params" },
      { status: 400 }
    )
  }
  const shopQuerry = query.get("shop_id") ?? ""
  const accessQuery = query.get("access_token") ?? ""
  const typeQuery = query.get("type") ?? ""

  // find in open api
  const baseAPI = process.env.SHOPEE_BASE_API ?? "https://partner.shopeemobile.com"
  const pathAPI = "/api/v2/logistics/download_shipping_document"
  const partnerID = process.env.SHOPEE_PARTNER_ID ?? "2003362"
  const secretKey = process.env.SHOPEE_SECRET_KEY ?? undefined
  const timestamp = Math.floor(new Date().getTime() / 1000)

  if (shopQuerry === "" || accessQuery === "" || secretKey === undefined) return ResponseHandle.error("[GET]-api/shopee/order", "Bad request", 400)

  const url = new URL(baseAPI)
  url.pathname = pathAPI
  url.searchParams.append("partner_id", partnerID)
  url.searchParams.append("timestamp", timestamp.toString())
  url.searchParams.append("shop_id", shopQuerry)
  url.searchParams.append("access_token", accessQuery)

  Lgr.info({ param: typeQuery }, "POST Shopee Doc")
  // generate sign
  const baseSign = `${partnerID}${pathAPI}${timestamp}${accessQuery}${shopQuerry}`
  const sign = crypto.createHmac("sha256", secretKey).update(baseSign).digest("hex")
  url.searchParams.append("sign", sign)

  // get shopee open API
  console.log("url to ShopeeAPI: ", url.toString())
  const order: { order_sn: string }[] = body.order_list.map((i) => ({ order_sn: i.trim() }))

  try {
    if (typeQuery === "PDF") {
      const res = await fetch(url.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_list: order
        })
      })

      if (!res.ok) {
        return ResponseHandle.error("[GET]api/Shopee/Order-awb", "response cant fetch", 400)
      }

      const data: ArrayBuffer = await res.arrayBuffer()

      return new NextResponse(Buffer.from(data), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename=SHOPEE_AWB_-${order.join("_")}.pdf`
        },
      })
    } else if (typeQuery === "ZIP") {

      console.log(`route : ${typeQuery}`)
      const pass = new stream.PassThrough()
      const zip = archiver("zip", { zlib: { level: 9 } })
      zip.pipe(pass)

      for (const o of order) {
        // const res = await fetch(url.toString(), {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({
        //     order_list: [{ order_sn: o.order_sn }]
        //   })
        // })

        // if (!res.ok) {
        //   console.log(`error route.shopee.order - awb: ${o}`)
        //   continue
        // }

        // const buff = await res.arrayBuffer()


        const ress = await axios({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          url: url.toString(),
          data: { order_list: [{ order_sn: o.order_sn.toString() }] },
          responseType: "arraybuffer",
          timeout: 2000
        })

        console.log(`fetch in route - body :${o.order_sn} - ${url.host.toString()}`)

        if (ress.status != 200) {
          console.log(`error route.shopee.order - awb: ${o}`)
          continue
        }

        const buff = Buffer.from(ress.data)

        zip.append(buff, { name: `SHOPEE_AWB_${o.order_sn}.pdf` })
      }


      await zip.finalize()
      const readAble = new ReadableStream({
        start(controller) {
          pass.on("data", (chunk) => controller.enqueue(chunk))
          pass.on("end", () => controller.close())
          pass.on("error", (err) => controller.error(err))
        }
      })

      return new NextResponse(readAble, {
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename = Shopee_AWB_${Date.now()}.zip`,
        },
      })

    } else if (typeQuery === "SERVER") {

      const orderTarget = order[0]
      const res = await axios({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        url: url.toString(),
        data: { order_list: order },
        responseType: "arraybuffer",
        timeout: 2000
      })

      if (res.status != 200) {
        return ResponseHandle.error("[POST] api/shopee/order-awb", "error-shopee-shop-order-awb not type", 400)
      }

      const bff = Buffer.from(res.data)

      const dataCreate: Prisma.B2C_OrderAWBCreateInput = {
        ChannelId: 65,
        OrderId: "demo-" + orderTarget.order_sn.toString(),
        Seq: 1,

        FileAttached: bff,

        FileName: "demo-" + orderTarget.order_sn.toString(),
        FileSize: bff.length,
        FileType: ".pdf",

        CreationDate: new Date(),
        CreatedBy: "CC1981",
        ModifiedDate: new Date(),
        ModifiedBy: "CC1981",
        IsSentSynnex: 1,
        LastJson: "",
        SentStatus: true,
        SentDate: new Date(),
        IsHaveAWB: true
      }


      const uni: Prisma.B2C_OrderAWBWhereUniqueInput =
        { ChannelId_OrderId_Seq: { OrderId: orderTarget.order_sn.toString(), ChannelId: 65, Seq: 1 } }

      const resOn = await prisma.b2C_OrderAWB.upsert({
        where: uni,
        update: {
          FileAttached: bff,
          FileSize: bff.length,
          ModifiedDate: new Date(),
          SentDate: new Date(),
          SentStatus: true,
          IsHaveAWB: true,
        },
        create: dataCreate,
        select: { OrderId: true }
      })

      if (!resOn || !resOn.OrderId)
        return ResponseHandle.error("error", "error-shopee-shop-order-awb upload server failed", 400)

      return ResponseHandle.success({ Order_sn: orderTarget.order_sn.toString(), Upload_server: true }, "upload-AWB-to-Server")
    } else {
      return ResponseHandle.error("error", "error-shopee-shop-order-awb not type", 400)
    }
  } catch (err) {
    console.log(`[CATCH] order-awb/order : ${err}`)
    return ResponseHandle.error("error", "[GET]api/Shopee/Order-awb", 400)
  }

}
