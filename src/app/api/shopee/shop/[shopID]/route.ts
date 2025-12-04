import { NextRequest, NextResponse } from "next/server"
import { ResponseHandle } from "@/app/api/utility"
import type ResponseInit from "url"
import prisma from "@/lib/prisma/client"


export interface IResShopeeTokenDetail {
  ShopID: string | undefined
  AccessToken: string | undefined
  RefreshToken: string | undefined

  Country: string | undefined
  CreatedAt: Date | undefined
  ExpiredAt: Date | undefined
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ shopID: string }> }) {

  const { shopID } = await params
  const param = shopID
  if (param === "") {
    return NextResponse.json(
      { message: "Bad Request in params" },
      { status: 400 }
    )
  }

  // find in db
  // const filter = Prisma.Shopee_AccessToken_LogScalarFieldEnum
  const res = await prisma.shopee_AccessToken.findFirst(
    {
      where: { ShopId: param },
      orderBy: { CreationDate: "desc" },
    }
  )

  const date = res?.CreationDate ? new Date(res.CreationDate) : undefined

  if (date != undefined) {
    const parseRes: IResShopeeTokenDetail = {
      ShopID: res?.ShopId,
      AccessToken: res?.AccessToken,
      RefreshToken: res?.RefreshToken ?? undefined,
      Country: res?.Country,
      CreatedAt: date,
      ExpiredAt: new Date(date.getTime() + 4 * 60 * 60 * 1000)
    }

    const init: ResponseInit = {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=60",
      }
    }

    return ResponseHandle.success(parseRes, "succes-shopee-shop", 200, 0, 0, init)
  }

  return ResponseHandle.error("error-shopee-shop", "fetch incomplete", 400)

}
