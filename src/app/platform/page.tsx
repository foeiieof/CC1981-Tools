"use client"
import { ChannelCard } from "@/app/platform/_components/ChannelCard";
import { B2C_ChannelTable } from "@prisma/client";
import { useEffect, useState } from "react";
import { IResponse } from "../api/utility";
import { parse } from "path";
import { toast } from "sonner";
import { Record } from "@prisma/client/runtime/library";
import { ChannelWizard } from "./_components/ChannelProcessDialog";

async function FetchChanelData() {
  try {
    const res = await fetch(`/api/channel-brand`)
    const parseRes = await res.json() as IResponse<B2C_ChannelTable[]>
    return parseRes
  } catch (error) {
    const res = error as IResponse<B2C_ChannelTable[]>
    return res
  }
}

export default function PlatformPage() {

  const [channel, setChannel] = useState<Record<string, B2C_ChannelTable[]> | undefined>(undefined)
  const [mounted, setMounted] = useState<boolean>(false)

  useEffect(() => {
    if (mounted) return
    (async () => {
      const res = await FetchChanelData()
      if (res.error) return toast.error('Fetch Data Error', { description: 'please refrsh this page' })
      setMounted(true)

      const groupByBrand = res.data?.reduce((acc: Record<string, B2C_ChannelTable[]>, item) => {
        const key = item.ChannelType || "unknown"
        if (!acc[key]) acc[key] = []
        acc[key].push(item)
        return acc
      }, {})

      return setChannel((prev) => ({
        ...prev,
        ...groupByBrand
      }))
    })()
  }, [])

  return (
    <div className="font-sans grid items-start justify-items-center p-4 pb-20 sm:p-20">
      <main className="w-full  flex flex-row gap-6 h-[80vh] row-start-2 justify-center items-start">
        <div className="w-full flex flex-col justify-center items-start ">
          <div className="w-full flex flex-row justify-between items-center">
            <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight  first:mt-0"> Channel Tables </h2>
            <ChannelWizard />
          </div>
          <div className="w-full overflow-y-auto">


            {channel &&
              Object.entries(channel).map(([type, channels]) => {
                const byPlatform = channels.reduce(
                  (acc, item) => {
                    const key = item.ChannelType || "unknown"
                    if (!acc[key]) acc[key] = []
                    acc[key].push(item)
                    return acc
                  },
                  {} as Record<string, B2C_ChannelTable[]>
                )
                return (
                  <div key={type} className="space-y-4 py-4">

                    {Object.entries(byPlatform).map(([platform, items]) => {
                      const byBrand = items.reduce(
                        (acc, item) => {
                          const key = item.Brand || "unknown"
                          if (!acc[key]) acc[key] = []
                          acc[key].push(item)
                          return acc
                        },
                        {} as Record<string, B2C_ChannelTable[]>
                      )

                      return (
                        <div key={platform} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h1 className="text-sm font-semibold tracking-tight">
                              {platform}
                            </h1>
                            <p className="text-[10px] text-muted-foreground">
                              {items.length} channels
                            </p>
                          </div>

                          {/* map brand */}
                          {Object.entries(byBrand).map(([brand, brandItems]) => (
                            <div key={brand} className="space-y-2">
                              <p className="text-[11px] font-medium text-muted-foreground">
                                {brand}
                              </p>

                              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                {/* map channel inside brand */}
                                {brandItems.map((ch) => (
                                  <ChannelCard key={ch.ChannelId} channel={ch} />
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    })}


                  </div>
                )
              })}
          </div>

        </div>
      </main>
    </div>
  )
}


