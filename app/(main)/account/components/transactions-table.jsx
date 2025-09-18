"use client";

import React from 'react';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Checkbox } from '@/components/ui/checkbox';

const TransactionsTable = ({transactions}) => {
    const handleSort = ()=>{ };
    return (
        <div className='space-y-4'>
            {/* Filters  */}

            {/* Transactions  */}
            <div className='rounded-md border'>
                <Table>
                    <TableCaption>Detail of Transactions</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">
                                <div className='border-2 inline border-black'><Checkbox /></div>
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={()=> handleSort("date")}>
                                <div className='flex items-center justify-end'>Date</div>
                            </TableHead>
                            <TableHead >Description</TableHead>
                            <TableHead className="cursor-pointer" onClick={()=> handleSort("category")}>
                                <div className='flex items-center justify-end'>Category</div>
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={()=> handleSort("amount")}>
                                <div className='flex items-center justify-end'>Amount</div>
                            </TableHead>
                            <TableHead>Recurring</TableHead>
                        
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell className="font-medium">INV001</TableCell>
                            <TableCell>Paid</TableCell>
                            <TableCell>Credit Card</TableCell>
                            <TableCell className="text-right">$250.00</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>

        </div>
    )
}

export default TransactionsTable;
// 2:42:35