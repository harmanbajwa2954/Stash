import CreateAccountDrawer from "@/components/create_account_drawer";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import React from "react";

function DashboardPage() {
    return <div className="px-5">
        {/* Budget Progress */}

        {/* Overview */}

        {/* Accounts grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <CreateAccountDrawer >
                <Card className="cursor-pointer  hover:shadow-xl transition-all border-dashed">
                    <CardContent className={"flex flex-col items-center text-muted-foreground h-full pt-5"}>
                        <Plus className="h-10 w-10 mb-2" />
                        <p className="text-sm font-medium">Add New Account</p>
                    </CardContent>
                </Card>
            </CreateAccountDrawer>
        </div>
    </div>
}

export default DashboardPage