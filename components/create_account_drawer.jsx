"use client";
import React, { useEffect, useState } from 'react'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from './ui/drawer';
import { Button } from './ui/button';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from 'react-hook-form';
import { accountSchema } from '@/app/lib/schema';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import useFetch from '@/hooks/use-fetch';
import { createAccount } from '@/actions/dashboard';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';


const CreateAccountDrawer = ({ children }) => {

    const [open, setOpen] = useState(false);
    const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm({
        resolver: zodResolver(accountSchema),
        defaultValues: {
            name: "",
            type: "CURRENT",
            balance: "",
            isDefault: false,
        },
    });

    const {data: newAccount, error,fn:createAccountFn, loading:createAccountLoading} = useFetch(createAccount)

    useEffect(()=>{
        if(newAccount && !createAccountLoading){
            toast.success("Account created Successfully");
            reset();
            setOpen(false);
        }
    },[createAccountLoading,newAccount])

    useEffect(()=>{
        if (error) {
            toast.error(error.message || "Failed to Create Account")
        }
    },[error])

    const onSubmit = async (data) => {
        await createAccountFn(data);
    }
    return (
        <div>
            <Drawer open={open} onOpenChange={setOpen}>
                <DrawerTrigger asChild>{children}</DrawerTrigger>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>Create New Account</DrawerTitle>
                        <DrawerDescription>Create Your STASH here..</DrawerDescription>
                    </DrawerHeader>

                    <div className='px-8 pb-8'>
                        <form  className='space-y-4' onSubmit={handleSubmit(onSubmit)}>
                            <div className='space-y-2'>
                                <label htmlFor="name" className='text-sm font-medium' >Account Name</label>
                                <Input id="name" placeholder="e.g. Main Checking"
                                    {...register("name")} />
                                {
                                    errors.name && (
                                        <p className='text-sm text-red-500'>{errors.name.message}</p>
                                    )
                                }
                            </div>
                            <div className='space-y-2'>
                                <label htmlFor="type" className='text-sm font-medium' >Account Type</label>
                                <Select onValueChange={(value) => setValue("type", value)} defaultValue={watch("type")}>
                                    <SelectTrigger className="w-[180px]" id="type">
                                        <SelectValue placeholder="Select Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CURRENT">CURRENT</SelectItem>
                                        <SelectItem value="SAVINGS">SAVINGS</SelectItem>
                                    </SelectContent>
                                </Select>
                                {
                                    errors.type && (
                                        <p className='text-sm text-red-500'>{errors.type.message}</p>
                                    )
                                }
                            </div>
                            <div className='space-y-2'>
                                <label htmlFor="balance" className='text-sm font-medium' >Initial Balance</label>
                                <Input id="balance" type="number" step="0.01" placeholder="00.00"
                                    {...register("balance")} />
                                {
                                    errors.balance && (
                                        <p className='text-sm text-red-500'>{errors.balance.message}</p>
                                    )
                                }
                            </div>
                            <div className='space-y-2 flex items-center justify-between rounded-lg border p-3'>
                                <div className='space-y-0.5'>
                                    <label htmlFor="isDefault" className='text-sm font-medium cursor-pointer' >Set as Default</label>
                                    <p className='text-sm text-muted-foreground'>This account will be selected as default for transactions.</p>
                                </div>
                                <Switch className="cursor-pointer" id="isDefault" onCheckedChange={(checked) => setValue("isDefault", checked)} checked={watch("isDefault")} />
                                {
                                    errors.isDefault && (
                                        <p className='text-sm text-red-500'>{errors.isDefault.message}</p>
                                    )
                                }
                            </div>
                            <div className='flex gap-4 pt-4'>
                                <DrawerClose asChild>
                                    <Button type="button" variant="outline" className="flex-1">Cancel</Button>
                                </DrawerClose>

                                <Button type="submit" disabled={createAccountLoading} className="flex-1">{createAccountLoading ? <p className="flex items-center justify-center"><Loader2 className='mr-2 h-4 w-4 animate-spin'/>Creating...</p> :"Create Account"}</Button>
                            </div>
                        </form>
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    )
}

export default CreateAccountDrawer
