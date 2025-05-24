"use client";

import { Text, Button } from "@mantine/core";
import { useRouter } from "next/navigation";

export default function ReportsPage() {
  const router = useRouter();

  const createReport = () => {
    router.push("/reports/liquidation-report");
  };

  console.debug("Rendering ReportsPage");
  return (
    <>
      <Text>Reports</Text>
      <Button onClick={createReport}>NEW</Button>
    </>
  );
}
