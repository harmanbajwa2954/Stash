"use server"
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server"

const serialzeTransactions = (obj)=>{
    const serialized = {...obj};
    if(obj.balance){
        serialized.balance = obj.balance.toNumber();
    }
}
export async function createAccount(data) {
    try {
        const { userId } = await auth()
        if (!userId) throw new Error("Unauthorized");

        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
        });
        if (!user) {
            throw new Error("User Not Found !");
        }

        //converting balance to float before saving
        const balanceFloat = parseFloat(data.balance)
        if (isNaN(balanceFloat)) {
            throw new Error("Invalid balance amount")
        }
        //check if user's first account

        const existingAccount = await db.account.findMany({
            where: { userId: user.id },
        });
        const shouldBeDefault = existingAccount.length === 0 ? true : data.isDefault;
        if (shouldBeDefault) {
            await db.account.updateMany({
                where: { userId: use.id, isDefault: true },
                data: { isDefault: false },
            });
        }
        
        const account = await db.account.create({
            data: {
                ...data,
                balance: balanceFloat,
                userId: user.id,
                isDefault: shouldBeDefault,
            },
        });

        const serializedAccount =  serialzeTransactions(account);
        revalidatePath("/dashbaord")
        return { success:true, data:serializedAccount };


    } catch (error) {
        throw new Error(error.message);
    }
}