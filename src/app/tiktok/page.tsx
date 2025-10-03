"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { IResponse } from '../api/utility'
import { IResTiktokShopList } from '../api/tiktok/shop/route'
import { useEffect, useMemo, useState } from "react"
import { BookOpenText, Check, Copy, FileCheck2, HardDriveUpload, MoreHorizontal, PackagePlus, ReceiptText, Search } from "lucide-react"
import axios, { AxiosError } from "axios"
import { toast } from "sonner"
import { IResTiktokOrderInformationAWB } from "../api/tiktok/order-awb/route"
import { Tabs, TabsContent, TabsList, TabsTrigger, } from "@/components/ui/tabs"
import SkeletonShopeeTable from "../shopee/_components/SkeletonShopeeTable"
import { IResTiktokOrderSDK } from "../api/tiktok/order/route"
import { ColumnDef } from "@tanstack/react-table"
import Image from 'next/image'
import { Order202309GetOrderListResponseDataOrdersLineItems, Order202309GetOrderListResponseDataOrdersPayment } from "@/lib/sdk/tiktok"
import DialogTiktokOrderDetails from "./_components/DialogTiktokOrderDetails"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import useSWR from "swr"
import { DataTableForTiktok } from "./_components/DataTableForTiktok"


// export enum EnumTiktokOrderStatusOnTab { UNPAID = "UNPAID" }

export enum EnumTiktokOrderStatus {
  UNPAID = "UNPAID",

  ON_HOLD = "ON_HOLD",
  PRE_ORDER = "PRE_ORDER",

  PARTIALLY_SHIPPING = "PARTIALLY_SHIPPING",

  AWAITING_SHIPMENT = "AWAITING_SHIPMENT",
  AWAITING_COLLECTION = "AWAITING_COLLECTION",

  IN_TRANSIT = "IN_TRANSIT",
  DELIVERED = "DELIVERED",

  COMPLETED = "COMPLETED",

  CANCELLED = "CANCELLED",

  UNKNOWN = "UNKNOWN"
}

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

async function FetchTiktokOrderInformation(shop: string, accesstkn: string, orders: string[]) {
  try {
    const res = await fetch(`/api/tiktok/order-awb?shop_cipher=${shop}&access_token=${accesstkn}&order_list=${orders.join(",")}`)
    const data: IResponse<IResTiktokOrderInformationAWB[] | null> = await res.json()
    return data.data
  } catch (error) {
    const err = error as AxiosError
    toast.error(err.message)
    return null
  }
}

async function FetchTiktokOrderAWB(shop: string, accesstkn: string, order: string, pck: string) {
  try {
    const resFetch = await fetch(`/api/tiktok/order-awb/${pck}?shop_cipher=${shop}&access_token=${accesstkn}&order_id=${order}`, {
      method: "GET", headers: { "Accept": "application/pdf" }
    })

    if (resFetch.status != 200) {
      const json: IResponse<unknown> = await resFetch.json()
      return json.message
    }

    const resData = await resFetch.arrayBuffer()
    if (resData) {
      const file = new Blob([resData], { type: "application/pdf" })
      return file
    }
  } catch (err) {
    const er = err as AxiosError
    return er.message
  }
}

async function FetchTiktokOrderAWBToB2C(shop: string, accesstkn: string, order: string, pck: string) {
  try {
    const url = new URL(`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/tiktok/order-awb/${pck}`)
    url.searchParams.append("shop_cipher", shop)
    url.searchParams.append("access_token", accesstkn)
    url.searchParams.append("order_id", order)
    const res = await axios.post<IResponse<string>>(url.toString())
    if (res) return res.data
    return null
  } catch (err) {
    console.log(err)
    const er = err as AxiosError<{ error: string }>
    toast.error(`Order: ${order}\n` + er.response?.data.error)
    return null
  }
}


// async function FetchTiktokOrderList() {
//   try {
//     const res = await fetch(`/api/tiktok/order`, { method: "GET" })
//     const resData: IResponse<Record<string, IResTiktokOrderSDK[]>> = await res.json()
//     if (resData.error)
//       return null
//     return resData.data
//   } catch (err) {
//     const er = err as IResponse<unknown>
//     toast.error(er.message)
//   }
// }


export default function TiktokPage() {

  const [tiktokShop, setTiktokShop] = useState<IResTiktokShopList[]>([])
  const [shopSelect, setShopSelect] = useState<IResTiktokShopList | null>(null)
  const [orderID, setOrderID] = useState<string>("")
  const [orderList, setOrderList] = useState<IResTiktokOrderInformationAWB[]>()


  const [isTiktokDetailsOpen, setIsTiktokDetailsOpen] = useState<boolean>(false)
  const [selectOrder, setSelectOrder] = useState<IResTiktokOrderSDK | null>(null)

  const FetcherOrder = (url: string) => fetch(url, { method: "GET" }).then((res) => res.json()).then((json) => json.data)
  const { data: ordersAllShop } = useSWR<Record<string, IResTiktokOrderSDK[]>>(
    `/api/tiktok/order`, FetcherOrder,
    {
      revalidateOnReconnect: false,
      refreshInterval: 0
    })

  useEffect(() => {
    if (tiktokShop.length === 0) {
      const FetchTT = async () => {
        const res = await FetchTikTokShopInformation()
        if (res != null) setTiktokShop(res)
      }
      FetchTT()
    }
  }, [tiktokShop])



  async function SubmitSearch() {
    console.log(orderID.trim().split(','))
    if (!tiktokShop || orderID === "")
      toast.error('data is required')
    const orderDe = await FetchTiktokOrderInformation(shopSelect?.CipherID ?? "", shopSelect?.AccessToken ?? "", orderID.trim().split(','))
    if (orderDe != null)
      setOrderList(orderDe)
  }

  async function DowloadAWBDoc(order: string, pkg: string, cipher?: string) {
    let cipherID: string
    let accessToken: string
    if (cipher) {
      cipherID = cipher
      accessToken = tiktokShop.find(i => i.CipherID === cipher)?.AccessToken ?? ""
    } else {
      cipherID = shopSelect?.CipherID ?? ""
      accessToken = shopSelect?.AccessToken ?? ""
    }

    const file = await FetchTiktokOrderAWB(cipherID, accessToken, order, pkg)
    // console.log(`[LOG] ${JSON.stringify(file)}`)
    if (file instanceof Blob) {
      toast.success(`Fetch Tiktok-AWB order: ${order}`)
      const url = URL.createObjectURL(file)
      const a = document.createElement("a");
      a.href = url;
      a.download = `TIKTOK-AWB-${order}.pdf`
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } else {
      toast.error(`Fetch Tiktok-AWB order: ${order} ${file}`)
    }
  }

  async function UploadAWBDocToB2C(order: string, pkg: string) {
    const uploaded = await FetchTiktokOrderAWBToB2C(shopSelect?.CipherID ?? "", shopSelect?.AccessToken ?? "", order, pkg)
    if (uploaded != null) {
      toast.success(uploaded.data?.toString())
    }
  }

  const DialogTiktokOrder = useMemo(() => {
    if (!selectOrder) return null
    return <DialogTiktokOrderDetails data={selectOrder} state={[isTiktokDetailsOpen, setIsTiktokDetailsOpen]} />
  }, [selectOrder, isTiktokDetailsOpen])


  const TiktokOrderDetailsColumn: ColumnDef<IResTiktokOrderSDK>[] = [
    {
      accessorKey: "shop_name",
      header: "Shop Name",
      cell: info => info.getValue() ?? "-",
    },
    {
      accessorKey: "id",
      header: "Order SN",
      cell: ({ row }) => {
        const order = row.original
        return (
          <button
            className="flex flex-row justify-center items-center gap-2 hover:bg-zinc-100  p-2 rounded-lg "
            type="button"
            onClick={() => {
              toast.success(`Copy OrderSN : ${order.id}`)
              navigator.clipboard.writeText(order.id ?? "")
            }}
          >
            {order.id}
            <Copy size={12} />
          </button>
        )
      }
    },
    {
      accessorKey: "lineItems",
      header: "Item",
      cell: info => {
        const items = info.getValue() as Order202309GetOrderListResponseDataOrdersLineItems[] | undefined;
        const item = items && items[0] ? items[0] : undefined
        if (item) {
          return (
            <div className="flex space-x-1">
              <Image
                key={`img-${item}`}
                src={item.skuImage ?? ""}
                alt={item.skuName ?? ""}
                height={160}
                width={120}
                className="h-auto w-[120px] object-cover rounded border"
                loading="lazy"
              />
            </div>
          );
        } else {
          return (<div className="h-10 w-10 bg-gray-200 rounded"></div>)
        }

      }
    },

    {
      accessorKey: "status",
      header: "Order Status",
    },
    {
      accessorKey: "shippingProvider",
      header: "Shipping Carrier",
    },
    {
      accessorKey: "isCod",
      header: "COD",
      cell: info => {
        const data = info.getValue() ? "Yes" : "No"
        return (<span className={`font-bold ${data === "Yes" ? " text-green-600" : "text-red-600"}`}> {data}</span>)
      }
    },
    {
      accessorKey: "payment",
      header: "Total Amount",
      cell: info => {
        const payment: Order202309GetOrderListResponseDataOrdersPayment | undefined = info.getValue() as Order202309GetOrderListResponseDataOrdersPayment
        return (
          <span>{payment.totalAmount + "฿"}</span>
        )
      }
    },
    {
      accessorKey: "paymentMethodName",
      header: "Payment Method",
      cell: info => {
        const data = (info.getValue() as string)
        return (
          <span className="max-w-16 text-balance">
            {data}
          </span>
        )
      }
    },

    {
      accessorKey: "createTime",
      header: "Create Time",
      cell: info => {
        const time = new Date(info.getValue() as number * 1000).toLocaleString("th-TH", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit"
        })
        return (
          <span>
            {time}
          </span>
        )
      },
    },
    {
      accessorKey: "updateTime",
      header: "Update Time",
      cell: info => {
        const time = new Date(info.getValue() as number * 1000).toLocaleString("th-TH", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit"
        })
        return (
          <span>
            {time}
          </span>
        )
      },
    },
    {
      accessorKey: "on_server",
      header: "B2CServer",
      cell: i => {

        if (i.row.original.status === "UNPAID" || i.row.original.status === "ON_HOLD") return null

        const check = i.getValue() as boolean
        if (check) {
          return (
            <Check className="bg-green-400 rounded-full text-white p-[2px] mx-auto" />
          )
        } else {
          return (
            <div className="flex justify-center items-center">
              <Button className="">
                <HardDriveUpload />
              </Button>
            </div>
          )
        }
      }
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const order = row.original
        // return <span>ok</span>
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setSelectOrder(order)
                  setIsTiktokDetailsOpen(true)
                }}
              ><BookOpenText />
                View order details</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled={true}
              >
                <PackagePlus />
                Generate AWB
              </DropdownMenuItem>
              {
                order.packages && order.packages.length > 0 ? (<>
                  <DropdownMenuItem
                    onClick={() => {
                      if (order.packages) {
                        order.packages.map((i) => {
                          DowloadAWBDoc(order.id ?? "", i.id ?? "", order.cipher_id)
                        })
                      } else {
                        toast.error(`Order: ${order.id} status invalidate`)
                      }
                    }}
                  ><ReceiptText />
                    Dowload AWB
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    disabled={typeof order.on_server === "boolean" && order.on_server ? order.on_server : false}
                    onClick={() => {
                      if (order.packages) {
                        order.packages.map((i) => {
                          DowloadAWBDoc(order.id ?? "", i.id ?? "", order.cipher_id)
                        })
                      } else {
                        toast.error(`Order: ${order.id} status invalidate`)
                      }
                    }}
                  >
                    {
                      typeof order.on_server === "boolean" && order.on_server ? (
                        <Check className="bg-green-400 rounded-full text-white p-[2px]" />
                      ) : (
                        <HardDriveUpload />
                      )
                    }
                    Upload AWB To B2C
                  </DropdownMenuItem>
                </>
                ) : ("")
              }
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <div className="font-sans grid items-start justify-items-center p-8 pb-20 sm:p-20">
      <main className="w-full  flex flex-col gap-[32px] h-[80vh] row-start-2 justify-start items-center">

        {/* <span>Tiktk</span> */}
        <div className="flex flex-col w-full max-w-sm  items-center gap-2">
          <Select onValueChange={(i) => {
            const data = tiktokShop.find(t => t.ShopID === i)
            if (data != undefined) setShopSelect(data)
          }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Shop" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Brands</SelectLabel>
                {
                  tiktokShop.map((i) => {
                    return (
                      <SelectItem key={`${i.ShopID}`} disabled={!i.IsActive} value={`${i.ShopID}`}>
                        {i.ShopName}
                      </SelectItem>
                    )
                  })
                }
              </SelectGroup>
            </SelectContent>
          </Select>

          <div className="w-full flex flex-row justify-center items-center gap-2">
            <Input
              value={orderID}
              onChange={(e) => setOrderID(e.target.value.trim().replace(/\s+/g, ""))}
              placeholder="Enter order ID"
              className="border px-2 py-1"
            />
            <Button
              onClick={SubmitSearch}
              variant={"outline"}
            >
              <Search />
            </Button>
          </div>
        </div>
        <div className="flex flex-col w-full max-w-sm justify-center items-center gap-2">

          {
            orderList
              ? (
                orderList.map((i) => (
                  <div
                    key={`orl-${i.order_id}`}
                    className="bg-white border border-gray-100 w-full min-h-[5rem] flex flex-row items-center justify-between px-4 py-3 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    {/* Left section */}
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-900 font-semibold text-sm">
                        {i.payment_method ?? "Unknown Payment"}
                      </span>
                      <div className="flex flex-row items-center gap-2 text-xs text-gray-600">
                        <FileCheck2 className="w-4 h-4 text-green-500" />
                        <span>{i.shipping_provider ?? "No Provider"}</span>
                      </div>
                    </div>

                    {/* Right section */}
                    <div className="flex flex-col justify-center items-end gap-1">
                      <span className="text-xs text-gray-500">
                        Order: <span className="font-medium text-gray-800">{i.order_id}</span>
                      </span>

                      {/* Status badge */}
                      <span
                        className={`text-[11px] font-medium px-3 py-1 rounded-full border ${i.status === "CANCELLED"
                          ? "bg-red-50 text-red-600 border-red-200"
                          : i.status === "COMPLETED"
                            ? "bg-green-50 text-green-600 border-green-200"
                            : i.status === "IN_TRANSIT"
                              ? "bg-blue-50 text-blue-600 border-blue-200"
                              : "bg-gray-50 text-gray-600 border-gray-200"
                          }`}
                      >
                        {i.status}
                      </span>

                      {/* Packages as buttons */}
                      {i.packages?.map((pkg) => (
                        <div
                          key={`pkg-${pkg}`}
                          className="flex flex-col"
                        >
                          <div
                            className="flex flex-row gap-2 mt-1">
                            <Button
                              disabled={i.status === "IN_TRANSIT"}
                              // key={`pck-${pkg}`}
                              type="button"
                              variant="outline"
                              size="sm"
                              className="text-xs px-2 py-1 h-auto"
                              onClick={() => DowloadAWBDoc(i.order_id, pkg ?? "")}
                            >
                              <ReceiptText className="text-zinc-400" size={12} />
                              {pkg}
                            </Button>
                          </div>

                          <div className="flex flex-row gap-2 mt-1">
                            <Button
                              disabled={i.on_server}
                              type="button"
                              variant="outline"
                              size="sm"
                              className="text-xs px-2 py-1 h-auto"
                              onClick={() => UploadAWBDocToB2C(i.order_id, pkg ?? "")}
                            >
                              <HardDriveUpload className="text-zinc-400" size={12} />
                              {i.order_id}
                            </Button>
                          </div></div>
                      ))}

                    </div>
                  </div>
                ))
              )
              : (<></>)}
        </div>
        <Tabs
          defaultValue="UNPAID"
          className="w-full">
          <TabsList className="grid w-full grid-cols-10">
            {Object.values(EnumTiktokOrderStatus).filter(i => i != "UNKNOWN").map(e => {
              const dataCount = ordersAllShop && ordersAllShop[e] ? ordersAllShop[e].length : null
              return (
                <TabsTrigger key={e} value={e.toString()} className="group">
                  <span className="text-[12px]">{e.toString()}</span>
                  <div className={`w-fit h-fit px-[6px] text-center font-bold text-[10px] bg-zinc-200 rounded-full text-white group-data-[state=active]:text-black`}>
                    {dataCount}
                  </div>
                </TabsTrigger>
              )
            })}
          </TabsList>

          {ordersAllShop ?
            Object.values(EnumTiktokOrderStatus).filter(i => i != "UNKNOWN").map(e => {
              const data = ordersAllShop && ordersAllShop[e] ? ordersAllShop[e] : []

              return (
                <TabsContent key={e} value={e}>
                  {
                    <DataTableForTiktok
                      data={data}
                      columns={TiktokOrderDetailsColumn}
                      state={{
                        columnVisibility: {
                          on_server: data.some(i => i.status === "UNPAID" || i.status === "ON_HOLD") ? false : true
                        }
                      }}
                    />

                  }
                </TabsContent>
              )
            }) : (<SkeletonShopeeTable />)
          }
        </Tabs>
        {DialogTiktokOrder}
      </main >
    </div >
  )
}


