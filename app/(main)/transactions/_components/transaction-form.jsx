"use client";
import { createTransaction, updateTransaction } from '@/actions/transaction';
import { transactionSchema } from '@/app/lib/schema';
import CreateAccountDrawer from '@/components/create_account_drawer';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import useFetch from '@/hooks/use-fetch';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarDaysIcon, Loader2, Receipt } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import ReceiptScanner from './reciept-scanner';

const AddTransactionForm = ({ accounts, categories, editMode = false, initialData = null }) => {
    const { register, setValue, handleSubmit, formState: { errors }, watch, getValues, reset } =
        useForm({
            resolver: zodResolver(transactionSchema),
            defaultValues: editMode && initialData ? {
                type: initialData.type,
                amount: initialData.amount.toString(),
                description: initialData.description,
                accountId: initialData.account,
                category: initialData.category,
                date: new Date(initialData.date),
                isReccuring: initialData.isReccuring,
                ...(initialData.recurringInterval && {
                    recurringInterval: initialData.recurringInterval,
                }),
            } : {
                type: "EXPENSE",
                amount: "",
                description: "",
                accountId: accounts.find((ac) => ac.isDefault)?.id,
                date: new Date(),
                isReccuring: false,
            },
        });

    const searchParams = useSearchParams();
    const editId = searchParams.get("edit");
    const { loading: transactionLoading, fn: transactionFn, data: transactionResult } = useFetch(editMode ? updateTransaction : createTransaction);
    const router = useRouter()
    const type = watch("type")
    const isReccuring = watch("isReccuring")
    const date = watch("date");

    const onSubmit = async (data) => {
        const formData = {
            ...data,
            amount: parseFloat(data.amount),
        }
        if (editMode) {
            transactionFn(editId, formData);
        } else {
            transactionFn(formData);
        }
    };

    useEffect(() => {
        if (transactionResult?.success && !transactionLoading) {
            toast.success(editMode ? "Transaction updated successfully" : "Transaction created Successfully");
            reset();
            router.push(`/account/${transactionResult.data.accountId}`)
        }
    }, [transactionResult, transactionLoading, editMode])

    const filteredCategories = categories.filter(
        (category) => category.type === type
    );
    const handleScanComplete = (scannedData) => {
        if (scannedData) {
            setValue("amount", scannedData.amount.toString());
            setValue("date", new Date(scannedData.date));
            if (scannedData.description) {
                setValue("description", scannedData.description);
            }
            if (scannedData.category) {
                setValue("category", scannedData.category);
            }
        }
    };

    return (
        <form className='space-y-6' onSubmit={handleSubmit(onSubmit)}>
            {/* AI recipt scanner */}

            {!editMode && <ReceiptScanner onScanComplete={handleScanComplete} />}

            <div className='space-y-2'>
                <label className='text-sm font-medium'>Type</label>
                <Select onValueChange={(value) => setValue("type", value)} defaultValue={type}>
                    <SelectTrigger className={"w-full"} >
                        <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="EXPENSE">Expense</SelectItem>
                        <SelectItem value="INCOME">Income</SelectItem>
                    </SelectContent>
                </Select>
                {
                    errors.type && (
                        <p className='text-sm text-red-500'>{errors.type.message}</p>
                    )
                }
            </div>
            <div className='grid gap-6 md:grid-cols-2'>
                <div className='space-y-2'>
                    <label className='text-sm font-medium'>Amount</label>
                    <Input type="number" step="0.01" placeholder="0.00" {...register("amount")} />
                    {
                        errors.amount && (
                            <p className='text-sm text-red-500'>{errors.amount.message}</p>
                        )
                    }
                </div>
                <div className='space-y-2'>
                    <label className='text-sm font-medium'>Account</label>
                    <Select onValueChange={(value) => setValue("accountId", value)} defaultValue={getValues("accountId")}>
                        <SelectTrigger className={"w-full"}>
                            <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent >
                            {accounts.map((account) => (
                                <SelectItem key={account.id} value={account.id}>
                                    {account.name} (₹{parseFloat(account.balance).toFixed(2)})
                                </SelectItem>
                            ))}
                            <CreateAccountDrawer>
                                <Button className={"w-full select-none items-center text-sm outline-none"} variant={"ghost"}>Create Account</Button>
                            </CreateAccountDrawer>
                        </SelectContent>
                    </Select>
                    {
                        errors.accountId && (
                            <p className='text-sm text-red-500'>{errors.accountId.message}</p>
                        )
                    }
                </div>
            </div>
            <div className='space-y-2 '>
                <label className='text-sm font-medium'>Category</label>
                <Select onValueChange={(value) => setValue("category", value)} defaultValue={getValues("category")}>
                    <SelectTrigger className={"w-full"} >
                        <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent >
                        {filteredCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id} >
                                {category.name}
                            </SelectItem>
                        ))}

                    </SelectContent>
                </Select>
                {
                    errors.category && (
                        <p className='text-sm text-red-500'>{errors.category.message}</p>
                    )
                }
            </div>
            <div className='space-y-2'>
                <label className='text-sm font-medium'>Date</label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button className={"w-full pl-3 text-left font-normal"}
                            variant={"outline"}>{date ? format(date, "PPP") : <span>Pick a date</span>}
                            <CalendarDaysIcon className='ml-auto h-4 w-4 opacity-50' />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className={"w-auto p-0"} align='start'>
                        <Calendar mode="single"
                            selected={date}
                            onSelect={(date) => setValue("date", date)}
                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus />
                    </PopoverContent>
                </Popover>
                {
                    errors.date && (
                        <p className='text-sm text-red-500'>{errors.date.message}</p>
                    )
                }
            </div>
            <div className='space-y-2'>
                <label className='text-sm font-medium'>Description</label>
                <Input placeholder="Enter description" {...register("description")} />
                {
                    errors.description && (
                        <p className='text-sm text-red-500'>{errors.description.message}</p>
                    )
                }
            </div>
            <div className='space-y-2'>
                <div className='space-y-2 flex items-center justify-between rounded-lg border p-3'>
                    <div className='space-y-0.5'>
                        <label className='text-sm font-medium cursor-pointer' >Recurring Transaction</label>
                        <p className='text-sm text-muted-foreground'>This transaction will be set as recurring transaction.</p>
                    </div>
                    <Switch checked={isReccuring} onCheckedChange={(checked) => setValue("isReccuring", checked)} />

                </div>
            </div>
            {
                isReccuring && (<div className='space-y-2 '>
                    <label className='text-sm font-medium'>Recurring Interval</label>
                    <Select onValueChange={(value) => setValue("recurringInterval", value)} defaultValue={getValues("recurringInterval")}>
                        <SelectTrigger className={"w-full"} >
                            <SelectValue placeholder="Select Interval" />
                        </SelectTrigger>
                        <SelectContent >
                            <SelectItem value="DAILY">Daily</SelectItem>
                            <SelectItem value="WEEKLY">Weekly</SelectItem>
                            <SelectItem value="MONTHLY">Monthly</SelectItem>
                            <SelectItem value="YEARLY">Yearly</SelectItem>
                        </SelectContent>
                    </Select>
                    {
                        errors.recurringInterval && (
                            <p className='text-sm text-red-500'>{errors.recurringInterval.message}</p>
                        )
                    }
                </div>)
            }

            <div className='flex flex-col sm:flex-row gap-4'>
                <Button type="button" variant={"outline"} className={"w-full sm:w-auto"} onClick={() => router.back()}>Cancel</Button>
                <Button type="submit" className={"w-full sm:w-auto flex items-center justify-center gap-2"} disabled={transactionLoading}>
                    {transactionLoading ? (<>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{editMode ? "Updating...":"Creating..."}</span>
                </>
                ) : editMode ?("Update Transaction") :(
                    "Create Transaction"
                )}</Button>
            </div>
        </form>
    )
}

export default AddTransactionForm
