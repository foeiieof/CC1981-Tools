"use client"

import * as TikTokSDK from '@/lib/sdk/tiktok'
import { Prisma, PrismaClient, TikTok_AccessToken } from '@prisma/client'
import { toast } from 'sonner'
import { useState } from 'react'
import { Omit } from '@prisma/client/runtime/library'
// import 'request'

const prisma = new PrismaClient()


async function FetchTikTokShopInformation(shop: string) {
  const shopInf = await prisma.tiktok_ShopInfo.findFirst({ where: { ShopId: shop } })
  if (shopInf?.ShopName != "") {
    const shopObject: Omit<TikTok_AccessToken, "Region" | "CreatedBy" | "CreationDate"> | null = await prisma.tikTok_AccessToken.findFirst({ where: { SellerName: shopInf?.ShopName } })
    if (shopObject?.AccessToken != "") {
      return { shopObject }
    }
  } else {
    return null
  }

}

export default function TiktokPage() {

  const [] = useState()


  const shopID = "7495755122783783386"

  // 1.get access token
  const app_code = "6e8psek8amb3m"
  const app_secret = "f40cbbcdb704ac1fc6b1ca69fc3e19ebdbb7d9f8"

  const shop_id = "7494159016463337149"
  const access_token = "ROW_8H2qlwAAAACVgvgLtQnuUA1zHVqvKfYym7UNRMfPoFkel12sydvOKDpVVB1b-zPahjzd4ouaA1slT_vhpqTrZiPy_Sysg3H3gEcea4GnN_Z4uQqBsAnrko0wodTctnE0E38QjPomkZo"
  const refresh_token = "ROW_WgDnagAAAAChUsWLYKqJP4XuZO3zLOqsONcTxHx4MaiOEWE21pcEzo_Um2h9Z-jdZz3ymPBOqJ8"

  const cfg = new TikTokSDK.ClientConfiguration(app_code, app_secret)
  const sdk = new TikTokSDK.TikTokShopNodeApiClient({ config: cfg })

  // const res = await TikTokSDK.AccessTokenTool.refreshToken()
  // .refreshToken("ROW_WgDnagAAAAChUsWLYKqJP4XuZO3zLOqsONcTxHx4MaiOEWE21pcEzo_Um2h9Z-jdZz3ymPBOqJ8", "6e8psek8amb3m", "f40cbbcdb704ac1fc6b1ca69fc3e19ebdbb7d9f8")
  // console.log(JSON.stringify(res.body))

  return (
    <div className="font-sans grid items-start justify-items-center p-8 pb-20 sm:p-20">
      <main className="w-full  flex flex-col gap-[32px] h-[80vh] row-start-2 justify-center items-center">

        <span>Tiktok</span>

      </main>
    </div>
  )
}
