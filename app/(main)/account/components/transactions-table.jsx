"use client";
// 3:11:00
import React, { useEffect, useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from '@/components/ui/checkbox';
import { categoryColors } from '@/data/categories';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, MoreHorizontal, RefreshCw, Search, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
const RECURRING_INTERVALS = { DAILY: "Daily", WEEKLY: "Weekly", MONTHLY: "Monthly", YEARLY: "Yearly" };

const TransactionsTable = ({ transactions }) => {

    const router = useRouter();
    const [selectedIds, setSelectedIDs] = useState([]);
    const [sortConfig, setSortConfig] = useState({
        field: "date",
        direction: "desc",
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [recurringFilter, setRecurringFilter] = useState("");

    const handleSelect = (id) => {
        setSelectedIDs(current => current.includes(id)
            ? current.filter(item => item != id)
            : [...current, id])
    };
    const handleSelectAll = (id) => {
        setSelectedIDs((current) => current.length === filterAndSortTransactions.length
            ? [] : filterAndSortTransactions.map(t => t.id))
    };


    const filterAndSortTransactions = transactions;
    // useMemo(()=>{
    //     let results = [...transactions]
    // });
    const handleBulkDelete = ()=>{}
    const handleSort = (field) => {
        setSortConfig((current) => ({
            field,
            direction:
                current.field === field && current.direction === "asc" ? "desc" : "asc",
        }));
    };
    return (
        <div className='space-y-4'>
            {/* Filters  */}
            <div className='flex flex-col sm:flex-row gap-4'>
                <div className='relative flex-1'>
                    <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                    <Input className='pl-8 '
                    placeholder='Search transactions...'
                    value={searchTerm}
                    onChange={(e)=> setSearchTerm(e.target.value)} 
                    />
                </div>
                <div className='flex items-center gap-2'>
                    <Select >
                        <SelectTrigger className='cursor-pointer '>
                            <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="INCOME">Income</SelectItem>
                            <SelectItem value="EXPENSE">Expense</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={recurringFilter} onValueChange={(value)=> setRecurringFilter(value)}>
                        <SelectTrigger className='cursor-pointer'>
                            <SelectValue placeholder="All Transactions" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="recurring">Recurring Only</SelectItem>
                            <SelectItem value="non-recurring">Non-Recurring Only</SelectItem>
                        </SelectContent>
                    </Select>
                    {selectedIds.length>0 && (<div className='flex items-center gap-2'>
                        <Button size="sm" onClick={handleBulkDelete} variant="destructive">Delete Selected ({selectedIds.length})
                            <Trash />
                        </Button>
                    </div>)}
                </div>
            </div>
            {/* Transactions  */}
            <div className='rounded-md border'>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">
                                <div><Checkbox className="border-gray-400" onCheckedChange={handleSelectAll} checked={selectedIds.length === filterAndSortTransactions.length && filterAndSortTransactions.length > 0} /></div>
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => handleSort("date")}>
                                <div className='flex items-center'>Date{sortConfig.field === 'date' && (sortConfig.direction === 'asc' ? (<ChevronUp className='ml-1 h-4 w-4' />)
                                    : (<ChevronDown className='ml-1 h-4 w-4' />))}</div>
                            </TableHead>
                            <TableHead >Description</TableHead>
                            <TableHead className="cursor-pointer" onClick={() => handleSort("category")}>
                                <div className='flex items-center'>Category{sortConfig.field === 'category' && (sortConfig.direction === 'asc' ? (<ChevronUp className='ml-1 h-4 w-4' />)
                                    : (<ChevronDown className='ml-1 h-4 w-4' />))}</div>
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => handleSort("amount")}>
                                <div className='flex items-center'>Amount{sortConfig.field === 'amount' && (sortConfig.direction === 'asc' ? (<ChevronUp className='ml-1 h-4 w-4' />)
                                    : (<ChevronDown className='ml-1 h-4 w-4' />))}</div>
                            </TableHead>
                            <TableHead>Recurring</TableHead>

                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filterAndSortTransactions.length === 0 ? (<TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No Transactions Found</TableCell></TableRow>)
                            : (filterAndSortTransactions.map((transactions) => (
                                <TableRow key={transactions.id}>
                                    <TableCell><Checkbox onCheckedChange={() => handleSelect(transactions.id)} checked={selectedIds.includes(transactions.id)} className={"border-gray-400"} /></TableCell>
                                    <TableCell>{format(new Date(transactions.date), "PP")}</TableCell>
                                    <TableCell>{transactions.description}</TableCell>
                                    <TableCell className="capitalize"><span style={{ background: categoryColors[transactions.category] }} className='px-2 py-1 rounded text-white text-sm'>{transactions.category}</span></TableCell>
                                    <TableCell className={transactions.type === "EXPENSE" ? 'text-red-500' : 'text-green-500'}>{transactions.type === "EXPENSE" ? '-' : '+'}₹{transactions.amount.toFixed(2)}</TableCell>
                                    <TableCell>{transactions.isReccuring ?
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Badge variant="outline" className={"gap-1 bg-purple-100 text-purple-700 hover:bg-purple-200"}>
                                                    <RefreshCw className='h-3 w-3' />
                                                    {
                                                        RECURRING_INTERVALS[transactions.recurringInterval]
                                                    }</Badge>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <div className='text-sm'>
                                                    <div className='font-medium'>Next Date:</div>
                                                    <div>{format(new Date(transactions.nextReccuringDate), "PP")}</div>
                                                </div>
                                            </TooltipContent>
                                        </Tooltip> :
                                        <Badge variant="outline" className="gap-1">One-time</Badge>}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant='ghost' className="h-8 w-8 p-0">
                                                    <MoreHorizontal className='h-4 w-4' />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuLabel onClick={() => {
                                                    router.push(`/transaction/create?edit=${transactions.id}`)
                                                }}>Edit</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className={"text-destructive cursor-pointer"} onClick={() => deleteFn([transactions.id])}>Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )))
                        }
                    </TableBody>
                </Table>
            </div>

        </div>
    )
}

export default TransactionsTable;
