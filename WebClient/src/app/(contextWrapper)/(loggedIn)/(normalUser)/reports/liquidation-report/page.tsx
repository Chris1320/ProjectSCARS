"use client";

import "@mantine/dates/styles.css";
import { LoadingComponent } from "@/components/LoadingComponent/LoadingComponent";
import { CreatableUnitSelect } from "@/components/CreatableUnitSelect";
import { SplitButton } from "@/components/SplitButton/SplitButton";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import dayjs from "dayjs";
import {
    ActionIcon,
    Badge,
    Button,
    Card,
    Divider,
    FileInput,
    Flex,
    Group,
    Image,
    Modal,
    NumberInput,
    Paper,
    ScrollArea,
    Stack,
    Table,
    Text,
    TextInput,
    Textarea,
    Title,
    Tooltip,
} from "@mantine/core";
import { MonthPickerInput, DateInput } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import {
    IconCalendar,
    IconEye,
    IconFileText,
    IconPlus,
    IconTrash,
    IconUpload,
    IconX,
    IconHistory,
} from "@tabler/icons-react";

const report_type = {
    operating_expenses: "Operating Expenses",
    administrative_expenses: "Administrative Expenses",
    supplementary_feeding_fund: "Supplementary Feeding Fund",
    clinic_fund: "Clinic Fund",
    faculty_stud_dev_fund: "Faculty and Student Development Fund",
    he_fund: "HE Fund",
    school_operations_fund: "School Operations Fund",
    revolving_fund: "Revolving Fund",
};

const QTY_FIELDS_REQUIRED = ["operating_expenses", "administrative_expenses"];
const RECEIPT_FIELDS_REQUIRED = [
    "supplementary_feeding_fund",
    "clinic_fund",
    "faculty_stud_dev_fund",
    "he_fund",
    "school_operations_fund",
    "revolving_fund",
];

const defaultUnitOptions = ["pcs", "packs", "boxes", "kg", "liters", "gallons", "bottles"];

interface ExpenseDetails {
    id: Date;
    date: Date;
    particulars: string;
    receiptNumber?: string;
    quantity?: number;
    unit?: string;
    unitPrice: number;
}

function LiquidationReportContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const category = searchParams.get("category");

    const [reportPeriod, setReportPeriod] = useState<Date | null>(new Date());
    const [unitOptions, setUnitOptions] = useState<string[]>(defaultUnitOptions);
    const [expenseItems, setExpenseItems] = useState<ExpenseDetails[]>([
        {
            id: new Date(),
            date: new Date(),
            particulars: "",
            receiptNumber: RECEIPT_FIELDS_REQUIRED.includes(category || "") ? "" : undefined,
            quantity: QTY_FIELDS_REQUIRED.includes(category || "") ? 1 : undefined,
            unit: QTY_FIELDS_REQUIRED.includes(category || "") ? "" : undefined,
            unitPrice: 0,
        },
    ]);
    const [notes, setNotes] = useState<string>("");
    const [attachments, setAttachments] = useState<File[]>([]);
    const [previewFile, setPreviewFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>("");
    const [opened, { open, close }] = useDisclosure(false);

    const hasQtyUnit = QTY_FIELDS_REQUIRED.includes(category || "");
    const hasReceiptVoucher = RECEIPT_FIELDS_REQUIRED.includes(category || "");

    const handleClose = () => {
        router.push("/reports");
    };

    const addNewItem = () => {
        const newItem: ExpenseDetails = {
            id: new Date(),
            date: new Date(),
            particulars: "",
            receiptNumber: hasReceiptVoucher ? "" : undefined,
            quantity: hasQtyUnit ? 1 : undefined,
            unit: hasQtyUnit ? "" : undefined,
            unitPrice: 0,
        };
        setExpenseItems([...expenseItems, newItem]);
    };

    const removeItem = (id: Date) => {
        if (expenseItems.length > 1) {
            setExpenseItems(expenseItems.filter((item) => item.id !== id));
        }
    };

    const updateItem = (id: Date, field: keyof ExpenseDetails, value: string | number | Date) => {
        setExpenseItems(
            expenseItems.map((item) => {
                if (item.id === id) {
                    const updatedItem = { ...item, [field]: value };
                    return updatedItem;
                }
                return item;
            })
        );
    };

    const addUnitOption = (newUnit: string) => {
        if (!unitOptions.includes(newUnit)) {
            setUnitOptions([...unitOptions, newUnit]);
        }
    };

    const getFileTypeInfo = (file: File) => {
        if (file.type.startsWith("image/")) {
            return { icon: IconEye, color: "blue", label: "Image" };
        } else if (file.type === "application/pdf") {
            return { icon: IconFileText, color: "red", label: "PDF" };
        }
        return { icon: IconFileText, color: "gray", label: "File" };
    };

    const handleFileUpload = (files: File[]) => {
        if (files) {
            setAttachments([...attachments, ...files]);
        }
    };

    const handlePreviewFile = (file: File) => {
        if (file.type.startsWith("image/")) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setPreviewFile(file);
            open();
        } else if (file.type === "application/pdf") {
            // For PDF files, open in new tab
            const url = URL.createObjectURL(file);
            window.open(url, "_blank");
        }
    };

    const handleClosePreview = () => {
        close();
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl("");
        }
        setPreviewFile(null);
    };

    const removeAttachment = (index: number) => {
        setAttachments(attachments.filter((_, i) => i !== index));
    };

    const calculateTotalAmount = () => {
        return expenseItems.reduce((sum, item) => {
            if (hasQtyUnit) {
                return sum + (item.quantity || 1) * item.unitPrice;
            } else {
                return sum + item.unitPrice;
            }
        }, 0);
    };

    const calculateItemTotal = (item: ExpenseDetails) => {
        if (hasQtyUnit) {
            return (item.quantity || 1) * item.unitPrice;
        } else {
            return item.unitPrice;
        }
    };

    const handleSubmitReport = () => {
        console.log("Submitting liquidation report...");
    };

    const handleSaveDraft = () => {
        console.log("Saving draft liquidation report...");
    };

    const handlePreview = () => {
        console.log("Previewing liquidation report...");
    };

    const getDateRange = () => {
        if (!reportPeriod) return { minDate: undefined, maxDate: undefined };

        const startOfMonth = dayjs(reportPeriod).startOf("month").toDate();
        const endOfMonth = dayjs(reportPeriod).endOf("month").toDate();

        return { minDate: startOfMonth, maxDate: endOfMonth };
    };

    const { minDate, maxDate } = getDateRange();

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
            <Stack gap="lg">
                {/* Header */}
                <Flex justify="space-between" align="center" className="flex-col sm:flex-row gap-4">
                    <Group gap="md">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <IconHistory size={28} />
                        </div>
                        <div>
                            <Title order={2} className="text-gray-800">
                                {report_type[category as keyof typeof report_type] || "Report Category Not Found"}
                            </Title>
                            <Text size="sm" c="dimmed">
                                Create and manage expense liquidation
                            </Text>
                        </div>
                    </Group>
                    <ActionIcon
                        variant="subtle"
                        color="gray"
                        size="lg"
                        onClick={handleClose}
                        className="hover:bg-gray-100"
                    >
                        <IconX size={20} />
                    </ActionIcon>
                </Flex>

                {/* Month Selection */}
                <Card withBorder>
                    <Group justify="space-between" align="center" className="flex-col sm:flex-row gap-4">
                        <Text fw={500}>Report Period</Text>
                        <MonthPickerInput
                            placeholder="Select month"
                            value={reportPeriod}
                            onChange={(value) => setReportPeriod(value ? new Date(value) : null)}
                            leftSection={<IconCalendar size={16} />}
                            className="w-full sm:w-64"
                            valueFormat="MMMM YYYY"
                            required
                        />
                    </Group>
                </Card>

                {/* Item Details Table */}
                <Card withBorder>
                    <Group justify="space-between" align="center" mb="md">
                        <Text fw={500}>Item Details</Text>
                        <Button
                            leftSection={<IconPlus size={16} />}
                            onClick={addNewItem}
                            variant="light"
                            className="bg-blue-50 hover:bg-blue-100"
                        >
                            Add Item
                        </Button>
                    </Group>

                    <div className="overflow-x-auto">
                        <ScrollArea>
                            <Table striped highlightOnHover>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th className="w-44">Date</Table.Th>
                                        {hasReceiptVoucher && <Table.Th className="w-40">Receipt/Voucher No.</Table.Th>}
                                        <Table.Th>{hasReceiptVoucher ? "Item" : "Particulars"}</Table.Th>
                                        {hasQtyUnit && (
                                            <>
                                                <Table.Th className="w-32">Quantity</Table.Th>
                                                <Table.Th className="w-32">Unit</Table.Th>
                                            </>
                                        )}
                                        <Table.Th className="w-36">Amount</Table.Th>
                                        {hasQtyUnit && <Table.Th className="w-36">Total</Table.Th>}
                                        <Table.Th className="w-16"></Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {expenseItems.map((item) => (
                                        <Table.Tr key={item.id.toISOString()}>
                                            <Table.Td>
                                                <DateInput
                                                    className="w-full"
                                                    placeholder="Select date"
                                                    value={item.date}
                                                    onChange={(date) => updateItem(item.id, "date", date || new Date())}
                                                    minDate={minDate}
                                                    maxDate={maxDate}
                                                    date={reportPeriod || new Date()}
                                                    required
                                                />
                                            </Table.Td>
                                            {hasReceiptVoucher && (
                                                <Table.Td>
                                                    <TextInput
                                                        className="w-full"
                                                        placeholder="Enter receipt/voucher no."
                                                        value={item.receiptNumber || ""}
                                                        onChange={(e) =>
                                                            updateItem(item.id, "receiptNumber", e.currentTarget.value)
                                                        }
                                                    />
                                                </Table.Td>
                                            )}
                                            <Table.Td>
                                                <TextInput
                                                    className="w-full"
                                                    placeholder="Enter item description"
                                                    value={item.particulars}
                                                    onChange={(e) =>
                                                        updateItem(item.id, "particulars", e.currentTarget.value)
                                                    }
                                                    required
                                                />
                                            </Table.Td>
                                            {hasQtyUnit && (
                                                <>
                                                    <Table.Td>
                                                        <NumberInput
                                                            className="w-full"
                                                            placeholder="Qty"
                                                            value={item.quantity}
                                                            onChange={(value) =>
                                                                updateItem(item.id, "quantity", Number(value) || 1)
                                                            }
                                                            min={1}
                                                        />
                                                    </Table.Td>
                                                    <Table.Td>
                                                        <CreatableUnitSelect
                                                            value={item.unit}
                                                            onChange={(value) => updateItem(item.id, "unit", value)}
                                                            unitOptions={unitOptions}
                                                            onAddUnit={addUnitOption}
                                                        />
                                                    </Table.Td>
                                                </>
                                            )}
                                            <Table.Td>
                                                <NumberInput
                                                    className="w-full"
                                                    placeholder=""
                                                    value={item.unitPrice}
                                                    onChange={(value) =>
                                                        updateItem(item.id, "unitPrice", Number(value) || 0)
                                                    }
                                                    min={0}
                                                    leftSection="₱"
                                                    hideControls
                                                />
                                            </Table.Td>
                                            {hasQtyUnit && (
                                                <Table.Td>
                                                    <Text fw={500}>₱{calculateItemTotal(item).toFixed(2)}</Text>
                                                </Table.Td>
                                            )}
                                            <Table.Td>
                                                <ActionIcon
                                                    color="red"
                                                    variant="subtle"
                                                    onClick={() => removeItem(item.id)}
                                                    disabled={expenseItems.length === 1}
                                                    className="hover:bg-red-50"
                                                >
                                                    <IconTrash size={16} />
                                                </ActionIcon>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        </ScrollArea>
                    </div>

                    <Divider my="md" />

                    <Group justify="flex-end">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <Text size="lg" fw={700} className="text-gray-800">
                                Total Amount: ₱{calculateTotalAmount().toFixed(2)}
                            </Text>
                        </div>
                    </Group>
                </Card>

                {/* Notes Section */}
                <Card withBorder>
                    <Stack gap="md">
                        <Text fw={500}>Memo</Text>
                        <Textarea
                            placeholder="Add note"
                            value={notes}
                            onChange={(e) => setNotes(e.currentTarget.value)}
                            minRows={3}
                            maxRows={6}
                        />
                    </Stack>
                </Card>

                {/* File Attachments */}
                <Card withBorder>
                    <Stack gap="md">
                        <Text fw={500}>Attachments</Text>
                        <FileInput
                            placeholder="Add attachment"
                            leftSection={<IconUpload size={18} />}
                            multiple
                            accept="image/*,.pdf"
                            onChange={handleFileUpload}
                            className="w-full sm:w-96"
                            size="md"
                        />

                        {attachments.length > 0 && (
                            <div>
                                <Text size="sm" c="dimmed" mb="xs">
                                    Uploaded files ({attachments.length}):
                                </Text>
                                <Stack gap="xs">
                                    {attachments.map((file, index) => {
                                        const { icon: Icon, color, label } = getFileTypeInfo(file);
                                        const isImage = file.type.startsWith("image/");
                                        const isPDF = file.type === "application/pdf";

                                        return (
                                            <Paper key={index} p="sm" withBorder className="hover:bg-gray-50">
                                                <Group justify="space-between">
                                                    <Group gap="sm">
                                                        <div className="flex items-center gap-2">
                                                            <Icon size={16} color={color} />
                                                            <Badge variant="light" color={color} size="xs">
                                                                {label}
                                                            </Badge>
                                                        </div>
                                                        <div>
                                                            <Text size="sm" fw={500}>
                                                                {file.name}
                                                            </Text>
                                                            <Text size="xs" c="dimmed">
                                                                {(file.size / 1024).toFixed(1)} KB
                                                            </Text>
                                                        </div>
                                                    </Group>

                                                    <Group gap="xs">
                                                        {(isImage || isPDF) && (
                                                            <Tooltip label={`Preview ${label.toLowerCase()}`}>
                                                                <ActionIcon
                                                                    size="sm"
                                                                    variant="light"
                                                                    color="blue"
                                                                    onClick={() => handlePreviewFile(file)}
                                                                    className="hover:bg-blue-50"
                                                                >
                                                                    <IconEye size={14} />
                                                                </ActionIcon>
                                                            </Tooltip>
                                                        )}
                                                        <Tooltip label="Remove file">
                                                            <ActionIcon
                                                                size="sm"
                                                                color="red"
                                                                variant="light"
                                                                onClick={() => removeAttachment(index)}
                                                                className="hover:bg-red-50"
                                                            >
                                                                <IconX size={14} />
                                                            </ActionIcon>
                                                        </Tooltip>
                                                    </Group>
                                                </Group>
                                            </Paper>
                                        );
                                    })}
                                </Stack>
                            </div>
                        )}
                    </Stack>
                </Card>

                {/* Action Buttons */}
                <Group justify="flex-end" gap="md">
                    <Button variant="outline" onClick={handleClose} className="hover:bg-gray-100">
                        Cancel
                    </Button>
                    <SplitButton
                        onSubmit={handleSubmitReport}
                        onSaveDraft={handleSaveDraft}
                        onPreview={handlePreview}
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={!reportPeriod || expenseItems.some((item) => !item.date || !item.particulars)}
                    >
                        Submit Report
                    </SplitButton>
                </Group>

                <Modal opened={opened} onClose={handleClosePreview} title={previewFile?.name} size="lg" centered>
                    {previewUrl && previewFile?.type.startsWith("image/") && (
                        <div className="flex justify-center">
                            <Image
                                src={previewUrl}
                                alt={previewFile.name}
                                fit="contain"
                                style={{ maxHeight: "70vh" }}
                            />
                        </div>
                    )}
                </Modal>
            </Stack>
        </div>
    );
}

export default function LiquidationReportPage(): React.ReactElement {
    return (
        <Suspense fallback={<LoadingComponent message="Please wait..." />}>
            <LiquidationReportContent />
        </Suspense>
    );
}
