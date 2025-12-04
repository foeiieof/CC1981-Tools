"use client"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { B2C_ChannelProcess, B2C_ChannelTable } from "@prisma/client"
import { IResponse } from "@/app/api/utility"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { DialogDescription } from "@radix-ui/react-dialog"

type ChannelCardProps = {
  channel: B2C_ChannelTable
}

async function FetchGetChannelProcess(channel: number) {
  try {
    const url = new URL('/api/channel-process', window.location.origin)
    if (channel) url.searchParams.set("channel", channel.toString())
    const res = await fetch(url, { cache: "force-cache" })
    const parseRes = await res.json() as IResponse<B2C_ChannelProcess[]>
    return parseRes

  } catch (error) {
    return error as IResponse<B2C_ChannelProcess[]>
  }
}

export function ChannelCard({ channel }: ChannelCardProps) {

  const isActive = channel?.IsActive === true
  const isConfirmed = channel?.IsConfirm === true

  const [channelData, setChannelData] = useState<B2C_ChannelProcess[] | undefined>(undefined)
  const [open, setOpen] = useState<boolean>(false)

  useEffect(() => {
    // setMounted(true)
    if (open) {
      (async () => {
        try {
          const res = await FetchGetChannelProcess(channel.ChannelId)
          if (res.error) return toast.error("Channel Process Error", { description: "Please try again" })
          setChannelData(res.data)
        } catch (error) {
          const err = error as IResponse<B2C_ChannelProcess[]>
          return toast.error("Channel Process Error", { description: err.message })
        }
      })()
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card

          className={cn(
            "group cursor-pointer border border-border/70 bg-card/80 backdrop-blur-sm",
            "transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm"
          )}
        >
          <CardHeader className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <CardTitle className="text-sm font-semibold tracking-tight">
                  {channel.Name}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  #{channel.ChannelId} · {channel.ChannelType}
                </CardDescription>
              </div>

              <div className="flex flex-col items-end gap-1">
                <Badge
                  className={cn(
                    "px-1.5 py-0.5 text-[10px] font-medium uppercase",
                    isActive
                      ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600"
                      : "border-slate-400/60 bg-slate-400/10 text-slate-600"
                  )}
                >
                  {isActive ? "Active" : "Inactive"}

                </Badge>

                {channel.Brand && (
                  <Badge
                    variant="outline"
                    className="px-1.5 py-0.5 text-[10px] font-normal"
                  >
                    {channel.Brand}
                  </Badge>
                )}

              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">

              {isConfirmed && (
                <span className="rounded-full border border-amber-500/60 bg-amber-500/5 px-2 py-0.5 text-amber-600">
                  Confirmed
                </span>
              )}
              {channel.ChannelGroup && (
                <span className="rounded-full border border-border/60 px-2 py-0.5">
                  {channel.ChannelGroup}
                </span>
              )}
              <span className="rounded-full border border-border/60 px-2 py-0.5">
                {channel.DataAreaId}
              </span>
            </div>
          </CardHeader>

          <CardContent className="flex items-center justify-between text-[11px] text-muted-foreground">
            <div className="flex flex-col gap-0.5">
              <span className="font-medium text-foreground/70">
                {channel.InvoiceAccount}
              </span>
              <span className="text-[10px]">
                SYN: {channel.AccountNum_SYN ?? "-"}
              </span>
              <span className="text-[10px]">
                INTERCOM: {channel.AccountNum_INTERCOM ?? "-"}
              </span>
            </div>

            <div className="flex flex-col items-end gap-0.5 text-right">
              <span className="text-[10px] uppercase tracking-wide">
                Last process
              </span>
              <span className="font-mono text-[10px]">
                {channel.LastProcessDate
                  ? new Date(channel.LastProcessDate).toLocaleString()
                  : "-"}
              </span>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>

      {/* DETAIL DIALOG */}
      <DialogContent className="max-w-xl border-border/80 bg-background/95 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-2">
            <div className="space-y-1">
              <DialogDescription>&nbsp;</DialogDescription>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold tracking-tight">
                  {channel.Name}
                </span>
                <Badge
                  variant="outline"
                  className="text-[10px] uppercase tracking-wide"
                >
                  {channel.ChannelType}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Channel #{channel.ChannelId} · {channel.Brand ?? "No brand"}
              </p>
            </div>

            <div className="flex flex-col items-end gap-1">
              <Badge
                className={cn(
                  "px-2 py-0.5 text-[10px] font-semibold uppercase",
                  isActive
                    ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-600"
                    : "border-slate-500/60 bg-slate-500/10 text-slate-600"
                )}
              >
                {isActive ? "Active" : "Inactive"}
              </Badge>
              {isConfirmed && (
                <Badge
                  variant="outline"
                  className="border-amber-500/60 bg-amber-500/5 text-[10px] text-amber-600"
                >
                  Confirmed channel
                </Badge>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <Separator className="my-2" />

        <ScrollArea className="max-h-[420px] pr-1">
          <div className="space-y-6 text-xs">
            {/* Accounts */}
            <section className="space-y-2">
              <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Accounts (CUST Code)
              </h3>
              <div className="grid grid-cols-2 gap-3 rounded-md border border-border/70 bg-muted/40 p-3">
                <Field label="Invoice Account" value={channel.InvoiceAccount} />
                <Field
                  label="Installment Account"
                  value={channel.InvoiceAccountInstallment}
                />
                <Field label="SYN Account" value={channel.AccountNum_SYN} />
                <Field
                  label="INTERCOM Account"
                  value={channel.AccountNum_INTERCOM}
                />
              </div>
            </section>

            {/* Locations */}
            <section className="space-y-2">
              <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Inventory & DataArea
              </h3>
              <div className="grid grid-cols-2 gap-3 rounded-md border border-border/70 bg-muted/40 p-3">
                <Field
                  label="InventLocation SYN"
                  value={channel.InventLocation_SYN}
                />
                <Field
                  label="InventLocation INTERCOM"
                  value={channel.InventLocation_INTERCOM}
                />
                <Field label="DataArea SYN" value={channel.DataArea_SYN} />
                <Field
                  label="DataArea INTERCOM"
                  value={channel.DataArea_INTERCOM}
                />
                <Field label="DataAreaId" value={channel.DataAreaId} />
                <Field label="Channel Group" value={channel.ChannelGroup} />
              </div>
            </section>

            {/* Notes (TH text) */}
            <section className="space-y-2">
              <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Notes
              </h3>
              <div className="space-y-3 rounded-md border border-border/70 bg-muted/40 p-3">
                <NoteField label="Invoice Note (SYN)" value={channel.InvoiceNote_SYN} />
                <NoteField
                  label="Invoice Note (INTERCOM)"
                  value={channel.InvoiceNote_INTERCOM}
                />
                <NoteField label="WH Note (SYN)" value={channel.WHNote_SYN} />
                <NoteField
                  label="WH Note (INTERCOM)"
                  value={channel.WHNote_INTERCOM}
                />
              </div>
            </section>

            {/* Meta */}
            <section className="space-y-2">
              <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Meta
              </h3>
              <div className="grid grid-cols-2 gap-3 rounded-md border border-border/70 bg-muted/40 p-3">
                <Field
                  label="Created"
                  value={`${channel.CreatedBy} · ${new Date(
                    channel.CreationDate
                  ).toLocaleString()}`}
                />
                <Field
                  label="Modified"
                  value={`${channel.ModifiedBy} · ${new Date(
                    channel.ModifiedDate
                  ).toLocaleString()}`}
                />
                <Field
                  label="Last Process Date"
                  value={
                    channel.LastProcessDate
                      ? new Date(channel.LastProcessDate).toLocaleString()
                      : "-"
                  }
                />
                <Field label="Partition" value={channel.Partition.toString()} />
                <Field
                  label="Lock Process"
                  value={channel.IsLockProcess ? "Locked" : "Unlocked"}
                />
                <Field
                  label="Clearance"
                  value={channel.IsClearance ? "Yes" : "No"}
                />
              </div>
            </section>

            {/* Channel Process Meta */}
            {
              channelData && (
                <section className="space-y-2">
                  <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Channel Process
                  </h3>
                  {channelData.map((process) => (
                    <div key={process.ChannelId + process.Seq} className="grid grid-cols-2 gap-3 rounded-md border border-border/70 bg-muted/40 p-3">
                      <Field label="Seq" value={process.Seq} />
                      <Field label="Type" value={process.Type} />

                      <Field label="AccountNum" value={process.AccountNum} />
                      <Field label="Invent Location" value={process.InventLocation} />

                      <Field
                        label="InterCom OnHand"
                        value={process.IsInterComOnHand ? "Yes" : "No"}
                      />

                      <Field
                        label="InterCom DataAreaID"
                        value={process.InterComDataAreaId ?? "-"}
                      />
                      <Field
                        label="InterCom InventLocation"
                        value={process.InterComInventLocation ?? "-"}
                      />

                      <Field label="RefSeq" value={process.RefSeq} />

                      <Field
                        label="Purchase Price"
                        value={process.IsPurchasePrice ? "Yes" : "No"}
                      />
                      <Field label="In VAT" value={process.IsInVat ? "Yes" : "No"} />
                      <Field
                        label="Confirm MKP"
                        value={process.IsConfirmMKP ? "Yes" : "No"}
                      />
                      <Field
                        label="Sent Ship Fee"
                        value={process.IsSentShipFee ? "Yes" : "No"}
                      />
                      <Field
                        label="Sent Bank Charge"
                        value={process.IsSentBankCharge ? "Yes" : "No"}
                      />
                      <Field
                        label="Sent Discount"
                        value={process.IsSentDiscount ? "Yes" : "No"}
                      />

                      <Field
                        label="Created"
                        value={`${process.CreatedBy} · ${new Date(process.CreationDate).toLocaleString()}`}
                      />
                      <Field
                        label="Modified"
                        value={`${process.ModifiedBy} · ${new Date(process.ModifiedDate).toLocaleString()}`}
                      />
                    </div>
                  ))}

                </section>
              )}
          </div>
        </ScrollArea>

        <div className="mt-3 flex justify-end gap-2">
          <Button variant="outline" size="sm">
            View raw JSON
          </Button>
          <Button size="sm">Edit channel</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

type FieldProps = {
  label: string
  value: string | number | null | undefined
}

function Field({ label, value }: FieldProps) {
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] font-medium text-muted-foreground">{label}</p>
      <p className="truncate text-[11px] font-medium text-foreground/80">
        {value ?? "-"}
      </p>
    </div>
  )
}

type NoteFieldProps = FieldProps

function NoteField({ label, value }: NoteFieldProps) {
  if (!value) return null
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-medium text-muted-foreground">{label}</p>
      <p className="rounded-md bg-background/70 p-2 text-[11px] leading-snug text-foreground/80">
        {value}
      </p>
    </div>
  )
}
