import { ResponseHandle } from "@/app/api/utility"
import prisma from "@/lib/prisma/client"
import { TikTokShopNodeApiClient } from "@/lib/sdk/tiktok"
import { Prisma, } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"


export async function GET(req: NextRequest, { params }: { params: Promise<{ packageID: string }> }) {
  const query = req.nextUrl.searchParams
  const { packageID } = await params
  const para = {
    package_list: packageID,
    shop_cipher: query.get("shop_cipher") ?? undefined,
    access_token: query.get("access_token") ?? undefined,
    order_id: query.get("order_id") ?? undefined
  }

  if (!para.package_list
    || !para.access_token
    || !para.shop_cipher)
    return ResponseHandle.error("data required", "orderawb-tiktok-shop", 400)

  try {

    const api = new TikTokShopNodeApiClient({ config: { app_key: "6e8psek8amb3m", app_secret: "f40cbbcdb704ac1fc6b1ca69fc3e19ebdbb7d9f8" } })

    const resFile = await api.api.FulfillmentV202309Api
      .PackagesPackageIdShippingDocumentsGet((para.package_list ?? ""),
        "SHIPPING_LABEL_AND_PACKING_SLIP",
        para.access_token,
        "application/json",
        "A6",
        "PDF",
        para.shop_cipher
      )

    console.log(`[API] :${JSON.stringify(resFile.body)} \n`)
    if (resFile.body.data === null && resFile.body?.message) {
      return ResponseHandle.error("[Tiktok] GetOrderAWB", resFile.body.message, 400)
    } else {
      const urlPdf = resFile.body.data?.docUrl ?? ""
      const pdf = await fetch(urlPdf.toString())
      const arrayPdf: ArrayBuffer = await pdf.arrayBuffer()
      return new NextResponse(arrayPdf, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${encodeURIComponent(`TIKTOK-AWB-${para.order_id}.pdf`)}"`,
          "Cache-Control": "no-cache, no-store, must-revalidate",
        }
      })
    }
  } catch (error) {
    const err = error as ErrorEvent
    console.log(`[API as Error] :${err.message} \n`)
    return ResponseHandle.error("[Tiktok] GetOrderAWB", err.message, 400)
  }
}


export async function POST(req: NextRequest, { params }: { params: Promise<{ packageID: string }> }) {
  const query = req.nextUrl.searchParams
  const { packageID } = await params
  const para = {
    package_list: packageID,
    shop_cipher: query.get("shop_cipher") ?? undefined,
    access_token: query.get("access_token") ?? undefined,
    order_id: query.get("order_id") ?? undefined
  }

  console.log(`[API-LOG] ${JSON.stringify(para)}\n`)

  if (!para.package_list
    || !para.access_token
    || !para.shop_cipher)
    return ResponseHandle.error("data required", "orderawb-tiktok-shop", 400)

  try {

    const api = new TikTokShopNodeApiClient({ config: { app_key: "6e8psek8amb3m", app_secret: "f40cbbcdb704ac1fc6b1ca69fc3e19ebdbb7d9f8" } })

    const resFile = await api.api.FulfillmentV202309Api
      .PackagesPackageIdShippingDocumentsGet((para.package_list ?? ""),
        "SHIPPING_LABEL_AND_PACKING_SLIP",
        para.access_token,
        "application/json",
        "A6",
        "PDF",
        para.shop_cipher
      )

    // console.log(`[API] :${JSON.stringify(resFile.body.message)} \n`)
    if (resFile.body.code != 0 && resFile.body?.message) {
      return ResponseHandle.error("[GET]-Tiktok_Order", resFile.body.message, 400)
    }

    const urlPdf = resFile.body.data?.docUrl ?? ""
    const pdf = await fetch(urlPdf.toString())
    const arrayPdf: ArrayBuffer = await pdf.arrayBuffer()

    const buffer = Buffer.from(arrayPdf)
    const date = new Date()
    const data: Prisma.B2C_OrderAWBUncheckedCreateInput = {
      ChannelId: 70,
      OrderId: para.order_id ?? "",
      Seq: 1,
      FileAttached: buffer,
      FileName: para.order_id + "_1.pdf",
      FileSize: arrayPdf.byteLength,
      FileType: ".pdf",
      CreationDate: date,
      CreatedBy: "CC1981",
      ModifiedDate: date,
      ModifiedBy: "CC1981",
      IsSentSynnex: null,
      LastError: null,
      LastJson: null,
      SentStatus: null,
      SentDate: null,
      IsHaveAWB: true
    }

    const uploaded = await prisma.b2C_OrderAWB.create({ data: data })
    if (uploaded.OrderId) {
      return ResponseHandle.success(`Upload - ${para.order_id}`, "[POST]-Tiktok_Upload_AWB", 200)
    }

    return ResponseHandle.error(`Inomplete-Upload - ${para.order_id}`, "[POST]-TIktok_Upload_AWB", 400)
  } catch (error) {
    const err = error as ErrorEvent
    console.log(`[API as Error] :${err.message} \n`)
    return ResponseHandle.error(err.message, "[POST]-Tiktok-Upload_AWB", 400)
  }
}


