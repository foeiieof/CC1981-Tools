"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { IResponse } from '../api/utility'
import { IResTiktokShopList } from '../api/tiktok/shop/route'
import { useEffect, useState } from "react"
import { FileCheck2, Search } from "lucide-react"


async function FetchTikTokShopInformation() {
  try {
    const res = await fetch(`/api/tiktok/shop`, { cache: 'force-cache' })
    const data: IResponse<IResTiktokShopList[]> = await res.json()
    return data.data ?? null
  } catch (err) {
    console.log(`fetch [TikTok_ShopInfo] : ${err}`)
    return null
  }

}

export default function TiktokPage() {

  const [tiktokShop, setTiktokShop] = useState<IResTiktokShopList[]>([])

  useEffect(() => {

    if (tiktokShop.length === 0) {
      const FetchTT = async () => {
        const res = await FetchTikTokShopInformation()
        if (res != null) setTiktokShop(res)
      }
      FetchTT()
    }
  }, [tiktokShop])


  // const shopID = "7495755122783783386"

  // 1.get access token
  // const app_code = "6e8psek8amb3m"
  // const app_secret = "f40cbbcdb704ac1fc6b1ca69fc3e19ebdbb7d9f8"

  // const shop_id = "7494159016463337149"
  // const access_token = "ROW_8H2qlwAAAACVgvgLtQnuUA1zHVqvKfYym7UNRMfPoFkel12sydvOKDpVVB1b-zPahjzd4ouaA1slT_vhpqTrZiPy_Sysg3H3gEcea4GnN_Z4uQqBsAnrko0wodTctnE0E38QjPomkZo"
  // const refresh_token = "ROW_WgDnagAAAAChUsWLYKqJP4XuZO3zLOqsONcTxHx4MaiOEWE21pcEzo_Um2h9Z-jdZz3ymPBOqJ8"

  // const cfg = new TikTokSDK.ClientConfiguration(app_code, app_secret)
  // const sdk = new TikTokSDK.TikTokShopNodeApiClient({ config: cfg })

  // const res = await TikTokSDK.AccessTokenTool.refreshToken()
  // .refreshToken("ROW_WgDnagAAAAChUsWLYKqJP4XuZO3zLOqsONcTxHx4MaiOEWE21pcEzo_Um2h9Z-jdZz3ymPBOqJ8", "6e8psek8amb3m", "f40cbbcdb704ac1fc6b1ca69fc3e19ebdbb7d9f8")
  // console.log(JSON.stringify(res.body))

  return (
    <div className="font-sans grid items-start justify-items-center p-8 pb-20 sm:p-20">
      <main className="w-full  flex flex-col gap-[32px] h-[80vh] row-start-2 justify-start items-center">

        <span>Tiktk</span>
        <div className="flex flex-col w-full max-w-sm  items-center gap-2">
          <Select >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Shop" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Brands</SelectLabel>
                {
                  tiktokShop.map((i) => {
                    return (
                      <SelectItem key={`${i.ShopID}`} disabled={!i.IsActive} value={`loop-${i.ShopID}`}>
                        {i.ShopName}
                      </SelectItem>
                    )
                  })
                }
              </SelectGroup>
            </SelectContent>
          </Select>
          <div className="w-full flex flex-row justify-center items-center gap-2">
            <Input />
            <Button
              variant={"outline"}
            >
              <Search />
            </Button>
          </div>
        </div>
        <div className="flex flex-col w-full max-w-sm justify-center items-center gap-2">
          <div
            className="bg-white border border-gray-200 w-full h-16 flex flex-row items-center justify-between px-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col">
              <span className="text-gray-800 font-bold">
              </span>
              <span
                className={` text-xs font-bold `} >
                <div className="flex flex-row gap-2">
                  <FileCheck2 className="w-4 h-4" />
                </div>
              </span>
            </div>

            <div className="flex flex-row justify-center items-center gap-2 ">

            </div>

          </div>
          <>
          </>
        </div>


      </main>
    </div>
  )
}
