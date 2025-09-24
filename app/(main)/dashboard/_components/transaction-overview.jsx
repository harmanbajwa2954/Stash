"use client";
import React, { useState } from 'react';
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { format } from 'date-fns';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from 'recharts';

const colors = ["#5B92E5", "#5EBF7F", "#4AC9B0", "#FF8C6E", "#FFAA7B", "#F7D05C", "#A075C8", "#4C658D", "#D9A864", "#A5D166"];
const DashboardOverview = ({ accounts, transactions }) => {
    const [selectedAccountId, setSelectedAccountId] = useState(
        accounts.find((a) => a.isDefault)?.id || accounts[0]?.id
    );

    const accountTransactions = transactions.filter(
        (t) => t.accountId === selectedAccountId
    );
    const recentTransactions = accountTransactions.sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    // calculating expense breakdown for current month
    const currentDate = new Date();
    const currentMonthExpense = accountTransactions.filter((t) => {
        const transactionDate = new Date(t.date);
        return (
            t.type === "EXPENSE" &&
            transactionDate.getMonth() === currentDate.getMonth() &&
            transactionDate.getFullYear() === currentDate.getFullYear()
        );
    });

    //grouping expenses by category
    const expensesByCategory = currentMonthExpense.reduce((acc, transaction) => {
        const category = transaction.category;
        if (!acc[category]) {
            acc[category] = 0;
        }
        acc[category] += transaction.amount;
        return acc;
    }, {});

    //formated data for pie chart
    const pieChartData = Object.entries(expensesByCategory).map(
        ([category, amount]) => ({
            name: category,
            value: amount,
        })
    );


    return (
        <div className='grid gap-4 md:grid-cols-2 '>
            <Card>
                <CardHeader className={"flex flex-row justify-between items-center space-y-0 pb-4"}>
                    <CardTitle>Recent Transactions</CardTitle>
                    <Select value={selectedAccountId}
                        onValueChange={setSelectedAccountId}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select Account" />
                        </SelectTrigger>
                        <SelectContent>
                            {accounts.map((account) => (
                                <SelectItem key={account.id} value={account.id}>
                                    {account.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardHeader>
                <CardContent>
                    <div className='space-y-4'>
                        {
                            recentTransactions.length === 0
                                ? (<p className='text-center text-muted-foreground'>No recent Transacations</p>)
                                : (recentTransactions.map((transaction) => (
                                    <div key={transaction.id} className='flex items-center justify-between'>
                                        <div className='space-y-1'>
                                            <p className='text-sm font-normal leading-none'>{transaction.description || "Untitled Transaction"}</p>
                                            <p className='text-sm text-muted-foreground'>{format(new Date(transaction.date), "PP")}</p>
                                        </div>
                                        <div >
                                            <div className={cn("flex items-center", transaction.type === "EXPENSE"
                                                ? "text-red-500" : "text-green-500"
                                            )}>
                                                {transaction.type === "EXPENSE" ? (
                                                    <ArrowDownRight className='mr-1 h-4 w-4' />
                                                ) : (<ArrowUpRight className='mr-1 h-4 w-4' />)}
                                                ₹{transaction.amount.toFixed(2)}</div>
                                        </div>
                                    </div>
                                )))
                        }
                    </div>
                </CardContent>
            </Card>


            <Card>
                <CardHeader>
                    <CardTitle>Monthly Expense Breakdown</CardTitle>
                </CardHeader>
                <CardContent className={"p-0 pb-5"}>{
                    pieChartData.length === 0 ? (
                        <p className='text-center text-muted-foreground py-4'>No Expense this month</p>
                    ) :
                        (
                            <ResponsiveContainer width={"100%"} height={300}>
                                <PieChart>
                                    <Pie data={pieChartData} cx="50%" cy="50%" dataKey={"value"} fill='#8884d8'
                                     outerRadius={80} label={({name, value})=> `${name}:₹${value.toFixed(2)}`}>
                                        {
                                            pieChartData.map((name, index) => (
                                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                            ))
                                        }
                                    </Pie>
                                    <Legend className='mt-2' />
                                </PieChart>
                            </ResponsiveContainer>
                        )
                }
                </CardContent>
            </Card>
        </div>
    )
}

export default DashboardOverview
