"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BanknoteX, ClipboardCheck, ClipboardX, ClockArrowDown, Copy, Download, FileCheck2, HandHelping, HardDriveUpload, MoreHorizontal, Package, PackageOpen, Search, Truck } from "lucide-react"
import useSWR from "swr"
import {
  Select,
  SelectContent, SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import Image from "next/image"
import { useEffect, useMemo, useState } from 'react'
import { EnumShopee_GetOrderList, IResponse, Lgr } from "@/app/api/utility"
import { IResShopeeTokenDetail } from "../api/shopee/shop/[shopID]/route"
import { toast } from "sonner"
import { IResShopeeShopList } from "../api/shopee/shop/route"
import { IResShopee_GetOrderWithDetailsList_Struct, IResShopee_GetOrderWithDetailsList_Struct_ItemList, ShopeeOrderRequestBody } from "@/app/api/shopee/order/details/route"
import SkeletonShopeeTable from "./_components/SkeletonShopeeTable"
import { ColumnDef } from "@tanstack/react-table"
import OrderDetailsDialog from "./_components/DialogOrderDetails"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTable } from "./_components/DataTable"
import { IResShopee_GetOrderList_Struct, IResShopee_GetShippingDoc_Struct } from "@/app/api/shopee/order/route"
import { ShopeeLogoImages } from "./_components/ShopeeLogoImages"

//demo - data table 
// async function getData(): Promise<Payment[]> {
//   return [
//     {
//       id: "728ed52f",
//       amount: 100,
//       status: "pending",
//       email: "m@example.com",
//     }
//   ]
// }

// old way to fetch Order
// async function FetchShopeeOrderWithStatus(): Promise<Record<string, { count: number, data: IResShopee_GetOrderList_Struct[] }> | null> {
//   try {
//     const res = await fetch(`/api/shopee/order`, { cache: 'default', next: { revalidate: 10 } })
//     const data: IResponse<Record<string, { count: number, data: IResShopee_GetOrderList_Struct[] }> | null> = await res.json()
//     return data.data ?? null
//   } catch {
//     return null
//   }
// }

// async function FetchShopeeShop(): Promise<IResShopeeShopList[] | null> {
//   try {
//     const res = await fetch(`/api/shopee/shop`, { cache: 'force-cache', next: { revalidate: 3600 } })
//     const data: IResponse<IResShopeeShopList[]> = await res.json()
//     return data.data ?? null
//   } catch (err) {
//     console.error(`fetch [FetchShopeeShop] : ${err}`)
//     return null
//   }
// }

async function FetchShopeeShopAccessTokenByShopID(shop: string): Promise<IResShopeeTokenDetail | null> {
  try {
    const res = await fetch(`/api/shopee/shop/${shop}`, { cache: "no-cache" })
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
    // console.log(data)
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
// type IReqShopeeOrderWithDetailsAndState = { order_list: ShopeeOrderRequestBody }
const fetcherOrder = ([url, method]: [string, string]) => fetch(url, { method: method ?? "GET", cache: "force-cache", }).then(r => r.json())

const fetcherOrderDetails = async (key: [string, string]) => {
  const [url, bodyString] = key;
  const res = await fetch(url, {
    method: "POST",
    cache: "force-cache",
    body: bodyString,
  });
  return res.json();
};

// core fun page
export default function ShopeePage() {
  const [isLoadData, setIsLoadData] = useState(false)

  const [shopeeShopSelect, setShopeeShopSelect] = useState<string>("")
  const [shopeeAccess, setShopeeAccesss] = useState<IResShopeeTokenDetail>()

  const [inputOrderSearch, setInputOrderSearch] = useState<string>("")

  const [resOrderDoc, setResOrderDoc] = useState<IResShopee_GetShippingDoc_Struct[]>([])
  const [availableResOrderDoc, setAvailableResOrderDoc] = useState<string[]>([])

  const [activeTab, setActiveTab] = useState(EnumShopee_GetOrderList.UNPAID)
  const [orderStore, setOrderStore] = useState<ShopeeOrderRequestBody>({})

  const [isModalOrderDetails, setIsModalOrderDetails] = useState<boolean>(false)

  const [selectOrder, setSelectOrder] = useState<IResShopee_GetOrderWithDetailsList_Struct | null>(null)

  const ShopeeOrderDetailsColumn: ColumnDef<IResShopee_GetOrderWithDetailsList_Struct>[] = [
    // {
    //   accessorKey: "shop_id",
    //   header: "Shop ID",
    //   cell: info => info.getValue() ?? "-",
    // },
    {
      accessorKey: "shop_name",
      header: "Shop",
      cell: (info) => {
        const data = info.getValue() as string;
        return (
          <ShopeeLogoImages brand={(data && data.length > 1) ? data.toString() : ""} />
        )
      },
    },
    {
      accessorKey: "order_sn",
      header: "Order SN",
      cell: ({ row }) => {
        const order = row.original
        return (
          <button
            className="flex flex-row justify-center items-center gap-2 hover:bg-zinc-100  p-2 rounded-lg "
            type="button"
            onClick={() => {
              toast.success(`Copy OrderSN : ${order.order_sn}`)
              navigator.clipboard.writeText(order.order_sn)
            }}
          >
            {order.order_sn}
            <Copy size={12} />
          </button>
        )
      }
    },
    {
      accessorKey: "item_list",
      header: "Item",
      cell: info => {
        const items = info.getValue() as IResShopee_GetOrderWithDetailsList_Struct_ItemList[];
        const item = items[0]
        // if (items && items[1])
        //   console.log(items[1].item_id)
        return (
          <div className="flex space-x-1">
            <Image
              key={`img-${item.item_id}`}
              src={item.image_info?.image_url ?? ""}
              alt={item.item_name}
              height={160}
              width={120}
              className="h-auto w-[120px] object-cover rounded border"
              loading="lazy"
            // priority
            />
          </div>
        );
      }
    },

    {
      accessorKey: "order_status",
      header: "Order Status",
    },
    {
      accessorKey: "shipping_carrier",
      header: "Shipping Carrier",
    },
    {
      accessorKey: "cod",
      header: "COD",
      cell: info => {
        const data = info.getValue() ? "Yes" : "No"
        return (<span className={`font-bold ${data === "Yes" ? " text-green-600" : "text-red-600"}`}> {data}</span>)
      }
    },
    {
      accessorKey: "total_amount",
      header: "Total Amount",
      cell: info => (info.getValue() as number).toLocaleString() + " ฿",
    },
    {
      accessorKey: "payment_method",
      header: "Payment Method",
      cell: info => {
        const data = (info.getValue() as string)
        return (
          <span className="max-w-16 text-balance">
            {data.slice(0, 13)}
          </span>
        )
      }
    },

    {
      accessorKey: "create_time",
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
      accessorKey: "update_time",
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
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const order = row.original
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
                  setIsModalOrderDetails(true)
                }}
              >View order details</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Generate AWB</DropdownMenuItem>
              <DropdownMenuItem>Dowload AWB</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  // const getFetchOrderDetails =
  //   !!activeTab &&
  //   !!orderStore &&
  //   Array.isArray(orderStore[activeTab as EnumShopee_GetOrderList]) &&
  //   (orderStore[activeTab as EnumShopee_GetOrderList]?.length ?? 0) > 0;


  // const [data, setData] = useState<Payment[]>([])
  // const [dataOrderListWithCatagory, setOrderListWithCatagory] = useState<Record<string, { count: number, data: IResShopee_GetOrderList_Struct[] }> | null>(null)

  // const [data, mutate, isLoading] = useSWR(`/api/shopee/order`, fetcher, { revalidateOnFocus: true })
  const { data: dataOrderListWithCatagory } = useSWR<IResponse<Record<string, { count: number, data: IResShopee_GetOrderList_Struct[] }>>>(
    ["/api/shopee/order", "GET"],
    fetcherOrder,
    {
      // refreshInterval: 36000,
      // revalidateOnReconnect: true,
      revalidateOnFocus: false,
      refreshInterval: 0
    }
  )

  // shop access_token
  const { data: shopSelect } = useSWR(
    ["/api/shopee/shop", "GET"],
    async ([url, method]) => {
      const res = await fetch(url, { method, cache: "no-cache" })
      const parse = (await res.json()) as IResponse<IResShopeeShopList[]>
      return parse.data
    },
    {
      refreshInterval: 0,
      revalidateOnReconnect: false,
      revalidateOnFocus: false,
    }
  )



  const shouldFetchOrderDetails =
    !!activeTab &&
    !!orderStore &&
    Array.isArray(orderStore[activeTab as EnumShopee_GetOrderList]) &&
    orderStore[activeTab as EnumShopee_GetOrderList]!.length > 0;

  // for activetab
  // const orderListPayload = useMemo(() => {
  //   if (!shouldFetchOrderDetails) return null;
  //   return JSON.stringify({
  //     order_list: {
  //       [activeTab as EnumShopee_GetOrderList]: orderStore[activeTab]
  //     }
  //   });
  // }, [activeTab, orderStore, shouldFetchOrderDetails]);


  // const { data: dataOrderListWithDetails, isLoading: isOrderDetailsLoading } = useSWR<IResponse<Record<string, { count: number, data: IResShopee_GetOrderWithDetailsList_Struct[] }>>>(
  //   orderListPayload
  //     ? ["/api/shopee/order/details", orderListPayload]
  //     : null,
  //   fetcherOrderDetails,
  //   {
  //     revalidateOnReconnect: false,
  //     revalidateOnFocus: false,
  //     refreshInterval: 0
  //   }
  // );

  // for all
  const orderListPayload = useMemo(() => {
    if (!shouldFetchOrderDetails) return null;
    return JSON.stringify({
      order_list: {
        [activeTab as EnumShopee_GetOrderList]: orderStore[activeTab]
      }
    });
  }, [activeTab, orderStore, shouldFetchOrderDetails]);

  const { data: dataOrderListWithDetails, isLoading: isOrderDetailsLoading } = useSWR<IResponse<Record<string, { count: number, data: IResShopee_GetOrderWithDetailsList_Struct[] }>>>(
    orderListPayload
      ? ["/api/shopee/order/details", orderListPayload]
      : null,
    fetcherOrderDetails,
    {
      revalidateOnReconnect: false,
      revalidateOnFocus: false,
      refreshInterval: 0
    }
  );


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


  useEffect(() => {
    //   && shopSelect != undefined) {
    // if (!shopSelect || shopSelect.length === 0) return;
    if (dataOrderListWithCatagory && shopSelect != undefined) {
      // const fetchAccess = async () => {
      const newStore: ShopeeOrderRequestBody = { ...orderStore }
      Object.entries(dataOrderListWithCatagory.data ?? {}).map(([state, { data }]) => {
        const status = state as EnumShopee_GetOrderList
        newStore[status] ??= []
        data.forEach(i => {
          const shopID = i.shop_id ?? "unknown"
          // console.log(`data - i :${JSON.stringify(i)}`)
          const access = shopSelect?.find(o => (o.ShopID === shopID))
          // console.log(`data :${JSON.stringify(shopSelect) + "+" + shopID}`)
          // console.log(`access - ${JSON.stringify(access)}`)
          let entry = newStore[status]?.find(i => i.shop_id === shopID)
          if (!entry) {
            entry = {
              shop_id: i.shop_id ?? "",
              access_token: access?.AccessToken ?? "",
              order_sn_list: [i.order_sn]
            }
            newStore[status]?.push(entry)
          }
          entry.order_sn_list.push(i.order_sn)
        })
      })
      setOrderStore(newStore)
      // }
      // fetchAccess()
    }
    // }

  }, [dataOrderListWithCatagory, shopSelect])

  useEffect(() => {
    if (!dataOrderListWithCatagory) return;
    if (!shopSelect || shopSelect.length === 0) return; //
    const newStore: ShopeeOrderRequestBody = { ...orderStore };

    Object.entries(dataOrderListWithCatagory.data ?? {}).forEach(([state, { data }]) => {
      const status = state as EnumShopee_GetOrderList;
      newStore[status] ??= [];

      data.forEach(i => {
        const access = shopSelect.find(o => o.ShopID === i.shop_id);
        if (!access) {
          console.warn(`⚠️ Access not found for shop_id: ${i.shop_id}`);
          return;
        }

        let entry = newStore[status]?.find(e => e.shop_id === i.shop_id);
        if (!entry) {
          entry = {
            shop_id: i.shop_id ?? "",
            access_token: access.AccessToken ?? "",
            order_sn_list: [],
          };
          newStore[status]?.push(entry);
        }

        // กัน order_sn ซ้ำ
        if (!entry.order_sn_list.includes(i.order_sn)) {
          entry.order_sn_list.push(i.order_sn);
        }
      });
    });

    setOrderStore(newStore);
  }, [dataOrderListWithCatagory, shopSelect]);

  // fn-btn
  async function SeachSubmit() {
    setResOrderDoc([])
    // setIsLoadData(true)
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

  // const dialogMemo = useMemo(() => { return <OrderDetailsDialog data={selectOrder ?? undefined} state={[isModalOrderDetails, setIsModalOrderDetails]} /> }, [selectOrder])

  const iconMapTiktok: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
    UNPAID: BanknoteX,
    READY_TO_SHIP: PackageOpen,
    PROCESSED: Package,
    SHIPPED: Truck,
    COMPLETED: ClipboardCheck,
    CANCELLED: ClipboardX
  }

  function TabIconTiktok({ tab, active = false }: { tab: string, active?: boolean }) {
    const Icon = iconMapTiktok[tab] || BanknoteX
    return (
      <Icon
        className={`w-5 h-5 transition-colors duration-200 ${active ? "text-zinc-600 stroke-[2.3]" : "text-zinc-400 stroke-[1.5]"
          }`}
      />

    )
  }

  const orderDialog = useMemo(() => {
    if (!selectOrder) return null
    return <OrderDetailsDialog data={selectOrder} state={[isModalOrderDetails, setIsModalOrderDetails]} />
  }, [selectOrder, isModalOrderDetails])

  return (

    <div className="font-sans grid items-start justify-items-center p-8 pb-20 sm:p-20">
      <main className="w-full  flex flex-col gap-[32px] h-[80vh] row-start-2 justify-start items-center">

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
              const vals = val.target.value.trim().replaceAll(" ", ",")
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

        <Tabs
          value={activeTab}
          onValueChange={(val) => {
            setActiveTab(val as EnumShopee_GetOrderList)
          }}
          defaultValue="UNPAID"
          className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            {Object.values(EnumShopee_GetOrderList)
              .filter(f => f.toUpperCase() != "IN_CANCEL")
              .map(e => {
                const cc = dataOrderListWithCatagory?.data != null ? dataOrderListWithCatagory.data[e] : null
                return (
                  <TabsTrigger key={e} value={e.toString()} className="group">
                    <TabIconTiktok tab={e} active={activeTab === e} />
                    <span className="text-[10px] text-zinc-400 group-data-[state=active]:text-black ">{e.toString()}</span>
                    <div className={`w-fit h-fit px-[6px] text-center font-bold text-[10px] bg-zinc-200 rounded-full ${activeTab === e ? "text-black" : "text-white"}`}>
                      {cc?.count}
                    </div>
                  </TabsTrigger>
                )
              })}
          </TabsList>

          {
            isOrderDetailsLoading ? (
              <SkeletonShopeeTable />
            )
              :
              Object.values(EnumShopee_GetOrderList)
                .map(state => {
                  const data = dataOrderListWithDetails?.data != null
                    && dataOrderListWithDetails.data[state] != null
                    ? dataOrderListWithDetails.data[state] : null
                  if (data?.data === undefined) { return }
                  // Lgr.info(dataOrderListWithDetails?.data, "[dataOrderListWithDetails]")
                  return (
                    <TabsContent key={state} value={state}>
                      <DataTable
                        data={data.data}
                        columns={ShopeeOrderDetailsColumn} />
                      {/* <DataTable columns={ShopeeOrderDetailsColumn} data={data?.data} /> */}
                    </TabsContent>
                  )
                })
          }
        </Tabs>
        {orderDialog}
        {/* <OrderDetailsDialog data={selectOrder ?? undefined} state={[isModalOrderDetails, setIsModalOrderDetails]} /> */}
      </main >
    </div >
  )
} 
