"use client"

import { useEffect, useState } from "react"
import { object, z } from "zod"
import { useForm, UseFormReturn } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import {
  Dialog,
  DialogDescription,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
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
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { IResponse, Lgr } from "@/app/api/utility"
import { toast } from "sonner"
import React from "react"


//
// --------------------------------------
// FETCH 
// --------------------------------------
async function FetchGetBrandOnline() {
  try {
    const url = new URL(`/api/b2c/brands`, window.location.origin)
    const res = await fetch(url, { cache: "default" })
    return await res.json() as IResponse<string[]>
  } catch (error) {
    return error as IResponse<string[]>
  }
}



//
// --------------------------------------
// SCHEMA
// --------------------------------------
const ChannelSchema = z.object({
  ChannelType: z.string().optional(),
  Name: z.string().min(1),
  Brand: z.string().min(1),
  InvoiceAccount: z.string().optional(),
  AccountNum_SYN: z.string().optional(),
  InventLocation_SYN: z.string().optional(),
  InvoiceNote_SYN: z.string().optional(),
})

type ChannelFormData = z.infer<typeof ChannelSchema>

//
// --------------------------------------
// MAIN WIZARD COMPONENT
// --------------------------------------
export function ChannelWizard() {
  const [step, setStep] = useState(1)
  const form = useForm<ChannelFormData>({
    resolver: zodResolver(ChannelSchema),
    defaultValues: {
      ChannelType: undefined,
      Name: "",
      Brand: "",
      InvoiceAccount: "",
      AccountNum_SYN: "",
      InventLocation_SYN: "",
      InvoiceNote_SYN: "",
    },
  })

  const next = () => setStep((s) => s + 1)
  const back = () => setStep((s) => s - 1)

  const onSubmit = (data: ChannelFormData) => {
    console.log("SAVE:", data)
  }




  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Create Channel</Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create B2C Channel</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <Stepper step={step} />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {step === 1 && <Step1_SelectType form={form} />}
            {step === 2 && <Step2_Form form={form} />}
            {step === 3 && <Step3_Review form={form} />}

            <div className="flex justify-between pt-2">
              {step > 1 ? (
                <Button type="button" variant="outline" onClick={back}>
                  Back
                </Button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <Button type="button" onClick={next}>
                  Next
                </Button>
              ) : (
                <Button type="submit">Save</Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

//
// --------------------------------------
// STEPPER
// --------------------------------------
const Stepper = React.memo(function Stepper({ step }: { step: number }) {
  return (
    <div className="flex justify-center my-6">
      <div className="flex items-center gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center">
            {/* Circle */}
            <div
              className={cn(
                "h-7 w-7 rounded-full border flex items-center justify-center text-xs font-medium transition-all",
                step >= i
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground bg-muted/40"
              )}
            >
              {i}
            </div>

            {/* Line */}
            {i < 3 && (
              <div
                className={cn(
                  "mx-4 h-[2px] w-12 rounded-full transition-all",
                  step > i ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
})
//
// --------------------------------------
// STEP 1: SELECT TYPE
// --------------------------------------
function Step1_SelectType({ form }: { form: UseFormReturn<ChannelFormData> }) {

  enum types {
    ASUS = "ASUS",
    HUAWEI = "HUAWEI",
    LINE = "LINE",
    NOCNOC = "NOCNOC",
    LAZADA = "LAZADA",
    SHOPEE = "SHOPEE",
    TIKTOK = "TIKTOK",
    EPP = "EPP",
    JD = "JD",
    CentralGroup = "CentralGroup",
  }
  return (
    <div className="space-y-4">
      <p className="text-sm font-medium">Channel Type</p>

      <div className="grid grid-cols-2 gap-2">
        {Object.values(types).map((t) => (
          <Button
            key={t}
            type="button"
            variant={form.watch("ChannelType") === t ? "default" : "outline"}
            onClick={() => {
              form.setValue("ChannelType", t)
            }
            }
            className="py-6 text-sm"
          >
            {t}
          </Button>
        ))}
      </div>

      <FormMessage />
    </div>
  )
}

//
// --------------------------------------
// STEP 2: FORM INPUTS
// --------------------------------------
const Step2_Form = React.memo(function Step2_Form({ form }: { form: UseFormReturn<ChannelFormData> }) {

  const [mounted, setMounted] = useState<boolean>(false)
  const [brands, setBrands] = useState<string[] | undefined>(undefined)

  useEffect(() => {
    if (mounted === false) {
      (async () => {
        const res = await FetchGetBrandOnline()
        if (res.error) toast.error("Error Form", { description: "please try again !" })
        setBrands(res.data)
      })()
    }
    setMounted(true)
  }, [])

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="Name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Channel Name</FormLabel>
            <FormControl>
              <Input placeholder="HuaweixLazada" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="Brand"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Brand</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              // value={field.value}
              {...field}>
              <FormControl>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a brand" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectGroup>
                  {
                    brands?.map((i) => {
                      Lgr.info(i)
                      return (
                        <SelectItem key={i} value={i}>{i}</SelectItem>
                      )
                    })
                  }
                </SelectGroup>
              </SelectContent>
            </Select>
            {/* <Input placeholder="HUAWEI" {...field} /> */}
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="InvoiceAccount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Invoice Account</FormLabel>
            <FormControl>
              <Input placeholder="HUAWEIXXXX" {...field} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="AccountNum_SYN"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Account SYN</FormLabel>
            <FormControl>
              <Input placeholder="CLOUDXSHOP" {...field} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="InventLocation_SYN"
        render={({ field }) => (
          <FormItem>
            <FormLabel>InventLocation (SYN)</FormLabel>
            <FormControl>
              <Input placeholder="ECOM_MKP_A" {...field} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="InvoiceNote_SYN"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Invoice Note</FormLabel>
            <FormControl>
              <Textarea placeholder="หมายเลขคำสั่งซื้อ <@Order>" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  )
})

//
// --------------------------------------
// STEP 3: REVIEW
// --------------------------------------
const Step3_Review = React.memo(function Step3_Review({ form }: { form: UseFormReturn<ChannelFormData> }) {
  const data = form.getValues()
  return (
    <div className="space-y-2 text-sm">
      <Review label="Channel Type" value={data.ChannelType ?? ""} />
      <Review label="Name" value={data.Name} />
      <Review label="Brand" value={data.Brand} />
      <Review label="Invoice Account" value={data.InvoiceAccount ?? ""} />
      <Review label="InventLocation SYN" value={data.InventLocation_SYN ?? ""} />
      <Review label="Invoice Note" value={data.InvoiceNote_SYN ?? ""} />
    </div>
  )
})

const Review = React.memo(function Review({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b py-1 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value || "-"}</span>
    </div>
  )
})
