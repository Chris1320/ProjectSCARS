import { Center, Container, Image, Paper, Stack, Text } from "@mantine/core";
import { motion } from "motion/react";

type LoadingComponentProps = {
    message?: string;  // The message to display below the title
    withBorder?: boolean; // Whether to show a border around the loading screen
};

const randomMessages: string[] = [
    "Balancing the school canteen budget...",
    "Sharpening pencils and double-checking decimals...",
    "Making sure every peso finds its desk...",
    "Reviewing receipts with a magnifying glass...",
    "Organizing ledgers for learning...",
    "Counting coins...",
    "Preparing your financial report card...",
    "Ensuring every cent is in its seat...",
    "Counting coins and balancing books...",
    "Crunching numbers for your school’s success...",
    "Reviewing receipts and sharpening pencils...",
    "Auditing the piggy bank...",
    "Making sure every cent is accounted for...",
];

/**
 * Show a loading screen
 */
export const LoadingComponent: React.FC<LoadingComponentProps> = ({
    message = null,
    withBorder = true,
}) => {
    console.debug("Returning LoadingComponent", { message });
    if (!message) {
        message = randomMessages[Math.floor(Math.random() * randomMessages.length)];
        console.debug("Random message: ", message);
    }
    return (
        <Container size={420} my={40} style={{ paddingTop: "150px" }}>
            <Center>
                <Paper withBorder={withBorder} radius="md">
                    <Stack align="center" justify="center" gap="xs">
                        <motion.div key="logo" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ease: "easeOut", duration: 0.5 }}>
                            <Image
                                src="/assets/BENTOLogo.svg"
                                alt="BENTO Logo"
                                width={100}
                                height={100}
                                component={motion.img}
                                animate={{ rotate: 360 }}
                                transition={{
                                    repeat: Infinity,
                                    repeatType: "loop",
                                    duration: 4,
                                    ease: "linear",
                                    type: "spring",
                                    stiffness: 100,
                                    damping: 20
                                }}
                                style={{ originX: 0.5, originY: 0.5 }}
                                drag
                                dragElastic={{ top: 0.25, left: 0.25, right: 0.25, bottom: 0 }}
                                dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
                            />
                        </motion.div>
                        <motion.div key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                            <Stack align="center" justify="center" gap="xs">
                                {/* <Loader color="blue" type="bars" /> */}
                                {
                                    message &&
                                    <Text c="dimmed" ta="center" data-testid="loading-message">
                                        {message}
                                    </Text>
                                }
                            </Stack>
                        </motion.div>
                    </Stack>
                </Paper>
            </Center>
        </Container>
    );
};
