import { getUserAccounts } from "@/actions/dashboard";
import CreateAccountDrawer from "@/components/create_account_drawer";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import React from "react";
import AccountCard from "./_components/account-card";

async function DashboardPage() {
    const accounts = await getUserAccounts()
    return <div className="px-5">
        {/* Budget Progress */}

        {/* Overview */}

        {/* Accounts grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <CreateAccountDrawer >
                <Card className="cursor-pointer hover:bg-gray-200 shadow-xl transition-all border-dashed">
                    <CardContent className={"flex flex-col items-center text-muted-foreground h-full pt-5"}>
                        <Plus className="h-10 w-10 mb-2" />
                        <p className="text-sm font-medium">Add New Account</p>
                    </CardContent>
                </Card>
            </CreateAccountDrawer>

            {accounts.length >0 && accounts?.map((accounts)=>{
                return <AccountCard key={accounts.id} accounts={accounts} />;
            })}
        </div>
    </div>
}

export default DashboardPage