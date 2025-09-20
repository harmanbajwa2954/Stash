import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";
import * as React from "react";

export default function Email(userName = "",
    type = "budget-alert",
    data = {},) {
    if (type === "monthly-report") {

    }
    if (type === "budget-alert") {
        return (
            <Html>
                <Head />
                <Preview>Budget Alert</Preview>
                <Body style={styles.body}>
                    <Container style={styles.container}>
                        <Heading style={styles.title}>Budget Alert</Heading>
                        <Text style={styles.text}>Hello {userName},</Text>
                        <Text style={styles.text}>
                            You&rsquo;ve used {data?.percentageUsed.toFixed(1)}% of your 
                            monthly budget.
                        </Text>
                        <Section style={styles.statsContainer}>
                            <div style={styles.stat}>
                                <Text style={styles.text}>Budget Amount</Text>
                                <Text style={styles.heading}>₹{data?.budgetAmount}</Text>
                            </div>
                            <div style={styles.stat}>
                                <Text style={styles.text}>Spent So Far</Text>
                                <Text style={styles.heading}>₹{data?.totalExpenses}</Text>
                            </div>
                            <div style={styles.stat}>
                                <Text style={styles.text}>Remaining</Text>
                                <Text style={styles.heading}>₹{data?.budgetAmount - data?.totalExpenses}</Text>
                            </div>
                        </Section>
                    </Container>
                </Body>
            </Html>
        );
    }
}

const styles = {
    body: {
        backgroundColor: "#f6f9fc",
        fontFamily: "-apple-system, sans-serif",
    }
}
// 4:18:37
//run app server
// then run ingest server
// run email server