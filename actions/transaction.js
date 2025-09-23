"use server";
import aj from "@/lib/arcjet";
import { db } from "@/lib/prisma";
import { request } from "@arcjet/next";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";

const genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const serilizeAmount = (obj) => ({
    ...obj,
    amount: obj.amount.toNumber(),
});


export async function createTransaction(data) {
    try {
        const { userId } = await auth();
        if (!userId) throw new Error("Unauthorized");

        //Arcjet to add rate limiting
        const req = await request();
        const decision = await aj.protect(req, {
            userId,
            requested: 1, //specifies how many tokens to consume
        })

        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) {
                const { remaining, reset } = decision.reason;
                console.error({
                    code: "RATE_LIMIT_EXCEEDED",
                    details: {
                        remaining, resetInSeconds: reset,
                    },
                });
                throw new Error("Too many requests. Please try again later.")
            }
            throw new Error("Request Blocked");
        }

        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
        });
        if (!user) {
            throw new Error("User Not Found !");
        }

        const account = await db.account.findUnique({
            where: {
                id: data.accountId,
                userId: user.id,
            },
        });
        if (!account) {
            throw new Error("Account not found");
        }

        const balanceChange = data.type === "EXPENSE" ? -data.amount : data.amount;
        const newBalance = account.balance.toNumber() + balanceChange;

        const transaction = await db.$transaction(async (tx) => {
            const newTransaction = await tx.transaction.create({
                data: {
                    ...data,
                    userId: user.id,
                    nextReccuringDate: data.isReccuring && data.recurringInterval
                        ? calculateNextRecuringDate(data.date, data.recurringInterval)
                        : null,
                }
            });

            await tx.account.update({
                where: { id: data.accountId },
                data: { balance: newBalance },
            })
            return newTransaction;
        });

        revalidatePath("/dashboard");
        revalidatePath(`/account/${transaction.accountId}`);

        return { success: true, data: serilizeAmount(transaction) }
    } catch (error) {
        throw new Error(error.message);
    }
}

function calculateNextRecuringDate(startDate, interval) {
    const date = new Date(startDate)
    switch (interval) {
        case "DAILY":
            date.setDate(date.getDate() + 1);
            break;
        case "WEEKLY":
            date.setDate(date.getDate() + 7);
            break;
        case "MONTHLY":
            date.setDate(date.getMonth() + 1);
            break;
        case "YEARLY":
            date.setDate(date.getFullYear() + 1);
            break;
    }
    return date;
}

export async function scanReceipt(file) {
    try {
        const model = genAi.getGenerativeModel({ model: "gemini-1.5-flash" });

        //convert file to ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        const base64String = Buffer.from(arrayBuffer).toString("base64")

        const prompt = `Analyze this receipt image and extract the following information in JSON format:
      - Total amount (just the number)
      - Date (in ISO format)
      - Description or items purchased (brief summary)
      - Merchant/store name
      - Suggested category (one of: Housing,Transportation,Groceries,Utilities,Entertainment,Food,Shopping,Healthcare,Education,Personal,Travel,Insurance,Gifts,Bills,Other Expenses )
      
      Only respond with valid JSON in this exact format:
      {
        "amount": number,
        "date": "ISO date string",
        "description": "string",
        "merchantName": "string",
        "category": "string"
      }

      If its not a recipt, return an empty object`;
        const result = await model.generateContent([
            {
                inlineData: {
                    data: base64String,
                    mimeType: file.type,
                },
            },
            prompt,
        ]);

        const response = await result.response;
        const text = response.text();
        const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

        try {
            const data = JSON.parse(cleanedText)
            return {
                amount: parseFloat(data.amount),
                date: new Date(data.date),
                description: data.description,
                category: data.category,
                merchantName: data.merchantName,
            };
        } catch (parseError) {
            throw new Error("Invalid response format from AI");
        }

    } catch (error) {
        throw new Error("Failed to scan reciept");
    }
}

export async function getTransaction(id) {
    try {
        const { userId } = await auth();
        if (!userId) throw new Error("Unauthorized");

        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
        });

        if (!user) {
            throw new Error("User Not Found !");
        }

        const transaction = await db.transaction.findUnique({
            where: {
                id,
                userId: user.id,
            },
        });
        if (!transaction) throw new Error("Transaction not Found");

        return serilizeAmount(transaction);
    } catch {

    }
}

export async function updateTransaction(id, data) {
    try {
        const { userId } = await auth();
        if (!userId) throw new Error("Unauthorized");

        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
        });

        if (!user) {
            throw new Error("User Not Found !");
        }

        //Get original transaction to calculate balance change
        const originalTransaction = await db.transaction.findUnique({
            where: {
                id,
                userId: user.id,
            },
            include: {
                account: true,
            }
        });

        if (!originalTransaction) throw new Error("Transaction not found");

        //calculate balance changes
        const oldBalanceChange = originalTransaction.type === "EXPENSE"
            ? -originalTransaction.amount.toNumber()
            : originalTransaction.amount.toNumber();

        const newBalanceChange = data.type === "EXPENSE" ? -data.amount : data.amount;
        const netBalanceChange = newBalanceChange - oldBalanceChange;

        const transaction = await db.$transaction(async (tx) => {
            const updated = await tx.transaction.update({
                where: {
                    id,
                    userId: user.id,
                },
                data: {
                    ...data,
                    userId: user.id,
                    nextReccuringDate: data.isReccuring && data.recurringInterval
                        ? calculateNextRecuringDate(data.date, data.recurringInterval)
                        : null,
                }
            });

            await tx.account.update({
                where: { id: data.accountId },
                data: { balance: { increment: netBalanceChange, }, },
            })
            return updated;
        });
        revalidatePath("/dashboard");
        revalidatePath(`/account/${transaction.accountId}`);

        return { success: true, data: serilizeAmount(transaction) };

    } catch (error) {
        throw new Error(error.message);

    }
}