"use client";

import { Modal, Grid, Card, Text, useMantineTheme } from "@mantine/core";
import { useRouter } from "next/navigation";

interface LiquidationReportModalProps {
    opened: boolean;
    onClose: () => void;
    onSelect?: (category: string, path: string) => void;
}

export function LiquidationReportModal({ opened, onClose, onSelect }: LiquidationReportModalProps) {
    const theme = useMantineTheme();
    const router = useRouter();

    const handleSelect = (category: string, path: string) => {
        if (onSelect) onSelect(category, path);
        router.push(path);
        onClose();
    };

    const report_type = [
        {
            label: "Operating Expenses",
            value: "operating_expenses",
            path: "/reports/liquidation-report",
            description: "Day-to-day operational costs",
        },
        {
            label: "Administrative Expenses",
            value: "administrative_expenses",
            path: "/reports/liquidation-report",
            description: "Administrative and management costs",
        },
        {
            label: "Supplementary Feeding Fund",
            value: "supplementary_feeding_fund",
            path: "/reports/liquidation-report",
            description: "Student feeding program expenses",
        },
        {
            label: "Clinic Fund",
            value: "clinic_fund",
            path: "/reports/liquidation-report",
            description: "Medical and health services",
        },
        {
            label: "Faculty & Student Development Fund",
            value: "faculty_stud_dev_fund",
            path: "/reports/liquidation-report",
            description: "Training and development programs",
        },
        {
            label: "HE Fund",
            value: "he_fund",
            path: "/reports/liquidation-report",
            description: "HE instructional expenses",
        },
        {
            label: "School Operations Fund",
            value: "school_operations_fund",
            path: "/reports/liquidation-report",
            description: "School operations expenses",
        },
        {
            label: "Revolving Fund",
            value: "revolving_fund",
            path: "/reports/liquidation-report",
            description: "Revolving fund transactions",
        },
    ];

    return (
        <Modal opened={opened} onClose={onClose} title="Select Liquidation Report Category" size="lg" centered>
            <Grid>
                {report_type.map((category) => (
                    <Grid.Col span={{ base: 12, sm: 6 }} key={category.value}>
                        <Card
                            shadow="xs"
                            padding="sm"
                            radius="md"
                            withBorder
                            style={{
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                "&:hover": {
                                    transform: "translateY(-10px)",
                                    boxShadow: theme.shadows.md,
                                },
                            }}
                            onClick={() => handleSelect(category.value, `${category.path}?category=${category.value}`)}
                        >
                            <Text fw={500} size="sm" mb={4}>
                                {category.label}
                            </Text>
                            <Text size="xs" c="dimmed">
                                {category.description}
                            </Text>
                        </Card>
                    </Grid.Col>
                ))}
            </Grid>
        </Modal>
    );
}
