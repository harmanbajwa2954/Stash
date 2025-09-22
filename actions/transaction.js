"use server";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { success } from "zod";

const serilizeAmount = (obj) => ({
    ...obj,
    amount: obj.amount.toNumber(),
});


export async function createTransaction(data) {
    try {
        const { userId } = await auth();
        if (!userId) throw new Error("Unauthorized");

        //Arcjet to add rate limiting

        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
        });
        if (!user) {
            throw new Error("User Not Found !");
        }

        const account = await db.account.findUnique({
            where: {
                id: data.accountId,
                userId:  user.id,
            },
        });
        if(!account) {
            throw new Error("Account not found");
        }

        const balanceChange = data.type === "EXPENSE" ? -data.amount: data.amount;
        const newBalance = account.balance.toNumber() + balanceChange;

        const  transaction = await db.$transaction(async (tx) => {
            const newTransaction = await tx.transaction.create({
                data: {
                    ...data,
                    userId: user.id,
                    nextReccuringDate: data.isReccuring && data.recurringInterval 
                    ? calculateNextRecuringDate(data.date, data.recurringInterval)
                    :null,
                }
            });

            await tx.account.update({
                where: {id: data.accountId},
                data: {balance: newBalance},
            })
            return newTransaction;
        });

        revalidatePath("/dashboard");
        revalidatePath(`/account/${transaction.accountId}`);

        return {success: true, data: serilizeAmount(transaction)}
    } catch (error) {
        throw new Error(error.message);
    }
}

function calculateNextRecuringDate(startDate, interval) {
    const date = new Date(startDate)
    switch (interval) {
        case "DAILY":
            date.setDate(date.getDate() +1);
            break;
        case "WEEKLY":
            date.setDate(date.getDate() +7);
            break;
        case "MONTHLY":
            date.setDate(date.getMonth() +1);
            break;
        case "YEARLY":
            date.setDate(date.getFullYear() +1);
            break;
    }
    return date;
}