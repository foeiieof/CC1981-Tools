import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import React, { useState } from "react"
import { Spinner } from '@/components/ui/shadcn-io/spinner';
import { Button } from "@/components/ui/button"

type IReqDeleteChannelDialog = {
  deleteId: number,
  open: boolean,
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}


export default function DeleChannelDialog({ deleteId, open, setOpen }: IReqDeleteChannelDialog) {

  const [isSpin, setIsSpin] = useState(false)

  async function handleDelete(id: number) {
    setIsSpin(true)
    try {
      const res = await fetch("/api/channel-process-working", {
        method: "DELETE",
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify({ id: id })
      })

      const resParse = await res.json()
      if (resParse == null) throw new Error(`Error - DeleteChannelProcessWorking`)
      setIsSpin(false)
      setOpen(false)
      // console.log("resParse ::", resParse)
      window.location.reload()
    }
    catch (e) {
      setIsSpin(false)
      console.log(`Error - DeleteChannelProcessWorking : ${e}`)
    }
  }
  return (
    <AlertDialog
      open={open}
      onOpenChange={setOpen} >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Comfirm Delete : {deleteId}</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button

            onClick={() => {
              handleDelete(deleteId)
            }}
          >
            {isSpin ? (<Spinner />) : ("Delete")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent >
    </AlertDialog >
  )
}

