import EmailTemplate from "@/emails/template";
import { db } from "../prisma";
import { inngest } from "./client";
import { sendEmail } from "@/actions/send-email";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const checkBudgetAlert = inngest.createFunction(
    { name: "Check Budget Alerts" },
    { cron: "0 */6 * * *" },
    async ({ event, step }) => {
        const budgets = await step.run("fetch-budget", async () => {
            return await db.budget.findMany({
                include: {
                    user: {
                        include: {
                            accounts: {
                                where: {
                                    isDefault: true,
                                },
                            },
                        },
                    },
                },
            });
        });

        for (const budget of budgets) {
            const defaultAccount = budget.user.accounts[0];
            if (!defaultAccount) continue;

            await step.run(`check-budget-${budget.id}`, async () => {

                const currentDate = new Date()
                const startOfMonth = new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                );
                const endOfMonth = new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() + 1,
                );

                const expenses = await db.transaction.aggregate({
                    where: {
                        userId: budget.userId,
                        accountId: defaultAccount.id,
                        type: "EXPENSE",
                        date: {
                            gte: startOfMonth,
                            lte: endOfMonth,
                        },
                    },
                    _sum: { amount: true },
                });

                const totalExpenses = expenses._sum.amount?.toNumber() || 0;
                const budgetAmount = budget.amount;
                const percentageUsed = (totalExpenses / budgetAmount) * 100;

                if (percentageUsed >= 80 && (!budget.lastAlertSent || isNewMonth(new Date(budget.lastAlertSent), new Date()))) {
                    //send email
                    
                    await sendEmail({
                        to: budget.user.email,
                        subject: `Budget Alert for ${defaultAccount.name}`,
                        react: <EmailTemplate
                            userName={budget.user.name}
                            type="budget-alert"
                            data={{
                                percentageUsed,
                                budgetAmount,
                                totalExpenses,
                                accountName: defaultAccount.name,
                            }}
                        />
                    })


                    // update lastalert sent
                    await db.budget.update({
                        where: { id: budget.id },
                        data: { lastAlertSent: new Date() },
                    })
                }
            });
        }
    }
);

function isNewMonth(lastAlertDate, currentDate) {
    return (
        lastAlertDate.getMonth() !== currentDate.getMonth() ||
        lastAlertDate.getFullYear() !== currentDate.getFullYear()
    );
}

export const triggerRecurringTransactions = inngest.createFunction({
    id: "trigger-recurring-transactions",
    name: "Trigger Recurring Transacations",
}, { cron: "0 0 * * *" },
    async ({ step }) => {
        // fetching all due recurring transactions
        const recurringTransactions = await step.run(
            "fetch-recurring-transactions",
            async () => {
                return await db.transaction.findMany({
                    where: {
                        isReccuring: true,
                        status: "COMPLETED",
                        OR: [
                            { lastProcessed: null },
                            { nextReccuringDate: { lte: new Date() } },
                        ],
                    },
                });
            }
        );
        // create events for each transaction
        if (recurringTransactions.length > 0) {
            const events = recurringTransactions.map((transaction) => ({
                name: "transaction.recurring.process",
                data: { transactionId: transaction.id, userId: transaction.userId },
            }));

            await inngest.send(events);
        }
        return { triggered: recurringTransactions.length }
    });

export const processRecurringTransactions = inngest.createFunction({
    id: "process-recurring-transaction",
    throttle: {
        limit: 10, //only 10 transaction will be processed
        period: "1m",//per minute
        key: "event.data.userId",
    },
},
    { event: "transaction.recurring.process" },
    async ({ event, step }) => {
        //validating event data
        if (!event?.data?.transactionId || !event?.data?.userId) {
            return { error: "Missing required event data" }
        }
        await step.run("process-transaction", async () => {
            const transaction = await db.transaction.findUnique({
                where: {
                    id: event.data.transactionId,
                    userId: event.data.userId,
                },
                include: {
                    account: true,
                },
            });

            if (!transaction || !isTransactionDue(transaction)) return;

            // Create new transaction and update account balance in a transaction
            await db.$transaction(async (tx) => {
                // Create new transaction
                await tx.transaction.create({
                    data: {
                        type: transaction.type,
                        amount: transaction.amount,
                        description: `${transaction.description} (Recurring)`,
                        date: new Date(),
                        category: transaction.category,
                        userId: transaction.userId,
                        accountId: transaction.accountId,
                        isReccuring: false,
                    },
                });

                // Update account balance
                const balanceChange =
                    transaction.type === "EXPENSE"
                        ? -transaction.amount.toNumber()
                        : transaction.amount.toNumber();

                await tx.account.update({
                    where: { id: transaction.accountId },
                    data: { balance: { increment: balanceChange } },
                });

                // Update last processed date and next recurring date
                await tx.transaction.update({
                    where: { id: transaction.id },
                    data: {
                        lastProcessed: new Date(),
                        nextReccuringDate: calculateNextRecurringDate(
                            new Date(),
                            transaction.recurringInterval
                        ),
                    },
                });
            });
        });
    }
);

function isTransactionDue(transaction) {
    // If no lastProcessed date, transaction is due
    if (!transaction.lastProcessed) return true;

    const today = new Date();
    const nextDue = new Date(transaction.nextReccuringDate);

    // Compare with nextDue date
    return nextDue <= today;
}

function calculateNextRecurringDate(date, interval) {
    const next = new Date(date);
    switch (interval) {
        case "DAILY":
            next.setDate(next.getDate() + 1);
            break;
        case "WEEKLY":
            next.setDate(next.getDate() + 7);
            break;
        case "MONTHLY":
            next.setMonth(next.getMonth() + 1);
            break;
        case "YEARLY":
            next.setFullYear(next.getFullYear() + 1);
            break;
    }
    return next;
}

export const generateMonthlyReports = inngest.createFunction(
    {
        id: "generate-monthly-reports",
        name: "Generate Monthly Reports",
    },
    {
        cron: "0 0 1 * *"
    }, async ({ step }) => {
        const users = await step.run("fetch-users", async () => {
            return await db.user.findMany({
                include: { accounts: true },
            });
        });

        for (const user of users) {
            await step.run(`generate-report-${user.id}`, async () => {
                const lastMonth = new Date();
                lastMonth.setMonth(lastMonth.getMonth());

                const stats = await getMonthlyStats(user.id, lastMonth);
                const monthName = lastMonth.toLocaleString("default", { month: "long" });
                const insights = await generateFinancialInsights(stats, monthName);
                await sendEmail({
                    to: user.email,
                    subject: `Your Monthly Financial Report - ${monthName}`,
                    react: <EmailTemplate
                        userName={user.name}
                        type="monthly-report"
                        data={{
                            stats,
                            month: monthName,
                            insights,
                        }}
                    />
                })
            });

        }
        return { processed: users.length }
    }
);
async function generateFinancialInsights(stats, monthName) {
    const genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAi.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    Analyze this financial data and provide 3 concise, actionable insights.
    Focus on spending patterns and practical advice.
    Keep it friendly and conversational.

    Financial Data for ${monthName}:
    - Total Income: $${stats.totalIncome}
    - Total Expenses: $${stats.totalExpenses}
    - Net Income: $${stats.totalIncome - stats.totalExpenses}
    - Expense Categories: ${Object.entries(stats.byCategory)
            .map(([category, amount]) => `${category}: $${amount}`)
            .join(", ")}

    Format the response as a JSON array of strings, like this:
    ["insight 1", "insight 2", "insight 3"]
  `;
        try {
    const result = await model.generateContent(prompt);

    const text = result.response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
    const parsed = JSON.parse(cleanedText);

    return parsed;
    } catch (error) {
        return [
            "Your highest expense category this month might need attention.",
            "Consider setting up a budget for better financial management.",
            "Track your recurring expenses to identify potential savings.",
        ];
    }
}

const getMonthlyStats = async (userId, month) => {
    const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
    const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    const transactions = await db.transaction.findMany({
        where: {
            userId,
            date: {
                gte: startDate,
                lte: endDate,
            },
        },
    });

    return transactions.reduce(
        (stats, t) => {
            const amount = t.amount.toNumber();
            if (t.type === "EXPENSE") {
                stats.totalExpenses += amount;
                stats.byCategory[t.category] =
                    (stats.byCategory[t.category] || 0) + amount;
            } else {
                stats.totalIncome += amount;
            }
            return stats;
        },
        {
            totalExpenses: 0,
            totalIncome: 0,
            byCategory: {},
            transactionCount: transactions.length,
        }
    );
}