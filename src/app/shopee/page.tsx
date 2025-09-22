"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, FileCheck2, HardDriveUpload, Search } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { useEffect, useState } from 'react'
import { IResponse } from "../api/utility"
import { IResShopeeTokenDetail } from "../api/shopee/shop/[shopID]/route"
import { Spinner } from "@/components/ui/shadcn-io/spinner"
import { toast } from "sonner"
import { IResShopee_GetShippingDoc_Struct } from "../api/shopee/order/route"

import { IResShopeeShopList } from "../api/shopee/shop/route"

async function FetchShopeeShop(): Promise<IResShopeeShopList[] | null> {
  try {
    const res = await fetch(`/api/shopee/shop`, { cache: 'force-cache', next: { revalidate: 3600 } })
    const data: IResponse<IResShopeeShopList[]> = await res.json()
    return data.data ?? null
  } catch (err) {
    console.error(`fetch [FetchShopeeShop] : ${err}`)
    return null
  }
}

async function FetchShopeeShopAccessTokenByShopID(shop: string): Promise<IResShopeeTokenDetail | null> {
  try {
    const res = await fetch(`/api/shopee/shop/${shop}`)
    const data: IResponse<IResShopeeTokenDetail> = await res.json()
    return data.data ?? null
  } catch (err) {
    console.error(`fetch [FetchShopeeShopAccessToken] : ${err}`)
    return null
  }
}

async function FetchShopeeLogisticShipDocResultByOrderSN(order: string[], shopID: string, accessToken: string): Promise<IResShopee_GetShippingDoc_Struct[] | Error> {
  try {
    const init: RequestInit = {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        order_list: order
      })
    }

    const res = await fetch(`/api/shopee/order?shop_id=${shopID}&access_token=${accessToken}`, init)

    const data: IResponse<IResShopee_GetShippingDoc_Struct[]> | null = await res.json()
    console.log(data)
    return data?.data ?? new Error(data?.message)
  } catch (err: unknown) {
    // console.log(`fetch [FetchShopeeLogisticShipDocByOrderSN] : ${err}`)
    return new Error(String(err))
  }
}

type TypeFile = "PDF" | "ZIP" | "SERVER"

async function FetchShopeeLogisticShipDocFileByOrderSN(order: string[], shopID: string, accessToken: string, type: TypeFile) {
  if (type != "PDF" && type != "ZIP" && type != "SERVER") {
    toast.error(`error awb-type : ${type}`)
    return null
  }
  try {
    const init = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_list: order })
    }
    const res = await fetch(`/api/shopee/order-awb?shop_id=${shopID}&access_token=${accessToken}&type=${type}`, init)

    if (!res.ok) {
      return null
    }

    return await res.blob()

  } catch (err) {
    toast.error(`fetch [FetchShopeeLogisticShipDocFileByOrderSN] : ${err}`)
  }
}

export default function ShopeePage() {
  const [isLoadData, setIsLoadData] = useState(false)

  const [shopSelect, setShopSelect] = useState<IResShopeeShopList[]>()

  const [shopeeShopSelect, setShopeeShopSelect] = useState<string>("")
  const [shopeeAccess, setShopeeAccesss] = useState<IResShopeeTokenDetail>()

  const [inputOrderSearch, setInputOrderSearch] = useState<string>("")

  const [resOrderDoc, setResOrderDoc] = useState<IResShopee_GetShippingDoc_Struct[]>([])
  const [availableResOrderDoc, setAvailableResOrderDoc] = useState<string[]>([])

  useEffect(() => {
    const fetchShop = async () => {
      const shop = await FetchShopeeShop()
      if (shop != null) {
        setShopSelect(shop)
      }
    }
    fetchShop()
  }, [])

  useEffect(() => {
    // select shop and fetch
    if (shopeeShopSelect != "") {
      const fetchAccess = async () => {
        const access = await FetchShopeeShopAccessTokenByShopID(shopeeShopSelect)
        if (access != null) setShopeeAccesss(access)
        // console.log("FetchShopeeShopAccessTokenByShopID: ", access)
      }
      fetchAccess()
    }
  }, [shopeeShopSelect])

  // fn-btn
  async function SeachSubmit() {
    setResOrderDoc([])
    setIsLoadData(true)
    // check param
    if (inputOrderSearch != "" && shopeeAccess != undefined && shopeeAccess.ShopID != undefined && shopeeAccess.AccessToken != undefined) {

      const orderlist = inputOrderSearch.split(",")
      const res = await FetchShopeeLogisticShipDocResultByOrderSN(orderlist, shopeeAccess?.ShopID, shopeeAccess?.AccessToken)
      if (!(res instanceof Error)) {
        console.log("FetchShopeeLogisticShipDocByOrderSN:", res)
        toast.success(`Fetch order: ${inputOrderSearch}`)
        setResOrderDoc(() => [...(Array.isArray(res) ? res : [res])])
        setAvailableResOrderDoc(Array.isArray(res) ? res.filter(r => r.status === "READY").map(r => r.order_sn) : [])
        return setIsLoadData(false)
      } else {
        setIsLoadData(false)
        toast.error(`Fetch order: ${res.message}`)
        return console.log("order not found :", inputOrderSearch)
      }
    }
    return console.log("something went wrong")
  }

  async function DowloadDocSubmit(order: string[]) {
    if (order.length > 0 && shopeeAccess != undefined && shopeeAccess.ShopID != undefined && shopeeAccess.AccessToken != undefined) {
      const res = await FetchShopeeLogisticShipDocFileByOrderSN(order, shopeeAccess?.ShopID, shopeeAccess?.AccessToken, "PDF")
      if (res != null && res instanceof Blob) {
        toast.success(`Fetch Shopee-AWB order: ${order}`)
        const url = URL.createObjectURL(res)
        const a = document.createElement("a");
        a.href = url;
        a.download = `SHOPEE_AWB_${order}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        return setIsLoadData(false)
      } else {
        toast.error(`Fetch Shopee-AWB order: ${order}`)
        return setIsLoadData(false)
      }
    }
  }

  async function UploadDocSubmit(order: string[]) {
    if (order.length > 0 && shopeeAccess != undefined && shopeeAccess.ShopID != undefined && shopeeAccess.AccessToken != undefined) {
      const res = await FetchShopeeLogisticShipDocFileByOrderSN(order, shopeeAccess?.ShopID, shopeeAccess?.AccessToken, "SERVER")
      if (res != null && res instanceof Blob) {
        toast.success(`Fetch Shopee-AWB order: ${order}`)
        const url = URL.createObjectURL(res)
        const a = document.createElement("a");
        a.href = url;
        a.download = `SHOPEE_AWB_${order}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        return setIsLoadData(false)
      } else {
        toast.error(`Fetch Shopee-AWB order: ${order}`)
        return setIsLoadData(false)
      }
    }
  }

  async function SumDowloadDocSubmit() {
    if (availableResOrderDoc.length > 0 && shopeeAccess != undefined && shopeeAccess.ShopID != undefined && shopeeAccess.AccessToken != undefined) {
      const res = await FetchShopeeLogisticShipDocFileByOrderSN(availableResOrderDoc, shopeeAccess?.ShopID, shopeeAccess?.AccessToken, "ZIP")
      if (res != null) {
        toast.success(`Fetch Shopee-AWB order: ${availableResOrderDoc.join(",")}`)
        const url = URL.createObjectURL(res)
        const a = document.createElement("a");
        a.href = url;
        a.download = `SHOPEE_AWB_${availableResOrderDoc.join("-")}.zip`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        return setIsLoadData(false)
      } else {
        toast.error(`Fetch Shopee-AWB order: ${availableResOrderDoc.join(",")}`)
        return setIsLoadData(false)
      }
    }
  }


  return (

    <div className="font-sans grid items-start justify-items-center p-8 pb-20 sm:p-20">
      <main className="w-full  flex flex-col gap-[32px] h-[80vh] row-start-2 justify-center items-center">

        {isLoadData ? (
          <>
            <AlertDialog open={isLoadData}>
              <AlertDialogContent className="w-fit flex justify-center">
                <AlertDialogHeader>
                  <AlertDialogTitle></AlertDialogTitle>
                  <AlertDialogDescription>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <Spinner className='self-center' />
                <AlertDialogFooter>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        ) : ("")}

        <h1> Shopee Page </h1>
        <h2> Check & Dowload AWB</h2>

        <div className="flex flex-col w-full max-w-sm  items-center gap-2">

          <Select defaultValue={shopeeShopSelect} onValueChange={(val) => setShopeeShopSelect(val)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Shop" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Brands</SelectLabel>
                {
                  shopSelect != null && shopSelect?.length > 0 ? (
                    shopSelect.map((i) => (
                      <SelectItem key={i.ShopID} value={i.ShopID}>{i.ShopName}</SelectItem>
                    ))
                  ) : (<></>)
                }
              </SelectGroup>
            </SelectContent>
          </Select>

          <div className="w-full flex flex-row justify-center items-center gap-2">
            <Input disabled={!shopeeShopSelect} type="text" placeholder="OrderSN" value={inputOrderSearch} onChange={(val) => {
              const vals = val.target.value.trim()
              setInputOrderSearch(vals)
            }} />
            <Button variant="outline" onClick={async () => SeachSubmit()} disabled={(!shopeeShopSelect || !inputOrderSearch)}>
              {/* <FolderSearch /> */}
              <Search />
            </Button>
          </div>

        </div>

        <div className="flex flex-col w-full max-w-sm justify-center items-center gap-2">
          {
            availableResOrderDoc.length > 1 ? (
              <Button
                variant="outline"
                onClick={async () => SumDowloadDocSubmit()}
                className="w-full border-gray-300 hover:bg-gray-50"
              >
                Dowload [ {availableResOrderDoc.length} ] files in zip
                <Download
                  className="text-gray-600" />
              </Button>
            ) : ("")
          }
          {
            resOrderDoc.length > 0 ? (
              resOrderDoc.map((i) => {
                return (
                  <div
                    key={i.order_sn}
                    className="bg-white border border-gray-200 w-full h-16 flex flex-row items-center justify-between px-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* order sn + status */}
                    <div className="flex flex-col">
                      <span className="text-gray-800 font-bold">
                        Order : {i.order_sn}</span>
                      <span
                        className={`text-xs font-bold ${i.status === "READY" ? "text-green-600" : "text-red-500"
                          }`}
                      >
                        <div className="flex flex-row gap-2">
                          <FileCheck2 className="w-4 h-4" />
                          {i.status}
                        </div>
                      </span>
                    </div>

                    <div className="flex flex-row justify-center items-center gap-2 ">

                      <Tooltip>
                        <TooltipTrigger asChild>

                          <Button
                            variant="outline"
                            disabled={i.onServer}
                            onClick={() => UploadDocSubmit([i.order_sn])}
                            className="border-gray-300 hover:bg-gray-50"
                          >

                            <HardDriveUpload className="text-gray-600" />
                          </Button>

                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{`Upload To B2C for AWB Printing`} </p>
                        </TooltipContent>
                      </Tooltip>


                      {/* action button */}


                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button

                            variant="default"
                            disabled={i.status != "READY"}
                            onClick={() => DowloadDocSubmit([i.order_sn])}
                          // className=" border-gray-300 hover:bg-gray-50 "
                          >
                            <Download
                              className="text-white" />
                          </Button>
                          {/* <Button variant="outline">Hover</Button> */}
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{`Download ${i.order_sn}.pdf`} </p>
                        </TooltipContent>
                      </Tooltip>

                    </div>

                  </div>

                )
              })
            ) : (
              <>
                {/* No Data */}
              </>
            )

          }
        </div>

      </main >
    </div >
  )
} 
