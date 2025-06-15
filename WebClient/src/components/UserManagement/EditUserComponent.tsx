"use client";
import { userAvatarConfig } from "@/lib/info";
import { useUser } from "@/lib/providers/user";
import { RoleType, SchoolType, UserPublicType, UserUpdateType } from "@/lib/types";
import { RemoveUserProfile } from "@/lib/api/user";
import {
    Button,
    Card,
    Center,
    FileButton,
    Flex,
    Group,
    Image,
    Modal,
    Select,
    Switch,
    TextInput,
    Tooltip,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
    IconCircleDashedCheck,
    IconCircleDashedX,
    IconDeviceFloppy,
    IconPencilCheck,
    IconSendOff,
    IconUser,
} from "@tabler/icons-react";
import { motion } from "motion/react";

import { useEffect, useState } from "react";

interface EditUserProps {
    index: number;
    user: UserPublicType;
    availableSchools: SchoolType[];
    availableRoles: RoleType[];
    currentPage: number;
    setIndex: React.Dispatch<React.SetStateAction<number | null>>;
    fetchUsers: (page: number) => void;
    UpdateUserInfo: (userInfo: UserUpdateType) => Promise<UserPublicType>;
    UploadUserAvatar: (userId: string, file: File) => Promise<UserPublicType>;
    fetchUserAvatar: (avatarUrn: string) => string | undefined;
}


interface EditUserValues {
    id: string;
    username: string | null;
    nameFirst: string | null;
    nameMiddle: string | null;
    nameLast: string | null;
    email: string | null;
    school: string | null;
    role: string | null;
    deactivated: boolean;
    forceUpdateInfo: boolean;
}


export function EditUserComponent({
    index,
    user,
    availableSchools,
    availableRoles,
    currentPage,
    setIndex,
    fetchUsers,
    UpdateUserInfo,
    UploadUserAvatar,
    fetchUserAvatar,
}: EditUserProps) {
    const [editUserAvatar, setEditUserAvatar] = useState<File | null>(null);
    const [editUserAvatarUrl, setEditUserAvatarUrl] = useState<string | null>(null);
    const [currentAvatarUrn, setCurrentAvatarUrn] = useState<string | null>(null);
    const [avatarRemoved, setAvatarRemoved] = useState(false);
    const [buttonLoading, buttonStateHandler] = useDisclosure(false);
    const userCtx = useUser();
    const availableSchoolNames = availableSchools.map(
        (school) => `[${school.id}] ${school.name}${school.address ? ` (${school.address})` : ""}`
    );
    const availableRoleDescriptions = availableRoles.map((role) => role.description);
    const form = useForm<EditUserValues>({
        mode: "uncontrolled",
        initialValues: {
            id: user.id,
            username: user.username || null,
            nameFirst: user.nameFirst || null,
            nameMiddle: user.nameMiddle || null,
            nameLast: user.nameLast || null,
            email: user.email || null,
            school: availableSchools.find((school) => school.id === user.schoolId)
                ? `[${availableSchools.find((school) => school.id === user.schoolId)!.id}] ${
                      availableSchools.find((school) => school.id === user.schoolId)!.name
                  }${
                      availableSchools.find((school) => school.id === user.schoolId)!.address
                          ? ` (${availableSchools.find((school) => school.id === user.schoolId)!.address})`
                          : ""
                  }`
                : null,
            role: availableRoles.find((role) => role.id === user.roleId)?.description || null,
            deactivated: user.deactivated,
            forceUpdateInfo: user.forceUpdateInfo,
        },
    });

    console.debug("form initial values:", form.values);
    useEffect(() => {
        console.debug("EditUserComponent mounted with index:", index);
        setAvatarRemoved(false);
        setEditUserAvatar(null);
        if (user.avatarUrn) {
            setCurrentAvatarUrn(user.avatarUrn);
            const avatarUrl = fetchUserAvatar(user.avatarUrn);
            setEditUserAvatarUrl(avatarUrl ? avatarUrl : null);
        } else {
            setCurrentAvatarUrn(null);
            setEditUserAvatarUrl(null);
        }
    }, [index, user, fetchUserAvatar]);

    const setAvatar = async (file: File | null) => {
        if (file === null) {
            console.debug("No file selected, skipping upload...");
            return;
        }
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > userAvatarConfig.MAX_FILE_SIZE_MB) {
            notifications.show({
                id: "file-too-large",
                title: "File Too Large",
                message: `File size ${fileSizeMB.toFixed(2)} MB exceeds the 2 MB limit.`,
                color: "red",
                icon: <IconSendOff />,
            });
            return;
        }
        if (!userAvatarConfig.ALLOWED_FILE_TYPES.includes(file.type)) {
            notifications.show({
                id: "invalid-file-type",
                title: "Invalid File Type",
                message: `Unsupported file type: ${file.type}. Allowed: JPG, PNG, WEBP.`,
                color: "red",
                icon: <IconSendOff />,
            });
            return;
        }

        setAvatarRemoved(false);
        setEditUserAvatar(file);
        setEditUserAvatarUrl((prevUrl) => {
            if (prevUrl && !currentAvatarUrn) {
                URL.revokeObjectURL(prevUrl); // Clean up previous URL
            }
            return URL.createObjectURL(file); // Create a new URL for the selected file
        });
    };

    const removeProfilePicture = () => {
        setAvatarRemoved(true);
        setEditUserAvatar(null);
        if (editUserAvatarUrl && !currentAvatarUrn) {
            URL.revokeObjectURL(editUserAvatarUrl);
        }
        setEditUserAvatarUrl(null);
    }

    const handleSave = async (values: EditUserValues): Promise<void> => {
        buttonStateHandler.open();
        const selectedSchool = availableSchools.find(
            (school) =>
                school.name === values.school || `[${school.id}] ${school.name} (${school.address})` === values.school
        );
        if (values.school && !selectedSchool) {
            notifications.show({
                id: "school-not-found",
                title: "Error",
                message: "Selected school not found.",
                color: "red",
                icon: <IconSendOff />,
            });
            buttonStateHandler.close();
            return;
        }

        const selectedRole = availableRoles.find((role) => role.description === values.role);
        if (!selectedRole) {
            notifications.show({
                id: "role-not-found",
                title: "Error",
                message: "Selected role not found.",
                color: "red",
                icon: <IconSendOff />,
            });
            buttonStateHandler.close();
            return;
        }

        // NOTE: Only update fields that have changed
        const newUserInfo: UserUpdateType = {
            id: values.id,
            username: values.username !== user.username ? values.username : undefined,
            nameFirst: values.nameFirst !== user.nameFirst ? values.nameFirst : undefined,
            nameMiddle: values.nameMiddle !== user.nameMiddle ? values.nameMiddle : undefined,
            nameLast: values.nameLast !== user.nameLast ? values.nameLast : undefined,
            email: values.email !== user.email ? values.email : undefined,
            schoolId: selectedSchool?.id !== user.schoolId ? selectedSchool?.id : undefined,
            roleId: selectedRole.id !== user.roleId ? selectedRole.id : undefined,
            deactivated: values.deactivated !== user.deactivated ? values.deactivated : undefined,
            forceUpdateInfo: values.forceUpdateInfo !== user.forceUpdateInfo ? values.forceUpdateInfo : undefined,
            finishedTutorials: null,
            password: null,
        };
        try {
            let updatedUser = await UpdateUserInfo(newUserInfo);
            notifications.show({
                id: "user-update-success",
                title: "Success",
                message: "User information updated successfully.",
                color: "green",
                icon: <IconPencilCheck />,
            });

            if (avatarRemoved && currentAvatarUrn) {
                try {
                    console.debug("Removing avatar...");
                    await RemoveUserProfile(values.id);
                    console.debug("Avatar removed successfully.");
                    notifications.show({
                        id: "avatar-remove-success",
                        title: "Success",
                        message: "Avatar removed successfully.",
                        color: "green",
                        icon: <IconPencilCheck />
                    });
                } catch (error) {
                    if (error instanceof Error) {
                        const detail = error.message || "Failed to remove avatar.";
                        console.error("Avatar removal failed:", detail);
                        notifications.show({
                            id: "avatar-remove-error",
                            title: "Avatar Removal Failed",
                            message: detail,
                            color: "red",
                            icon: <IconSendOff />,
                        });
                    }
                }
            }
            if (editUserAvatar) {
                try {
                    console.debug("Uploading avatar...");
                    updatedUser = await UploadUserAvatar(values.id, editUserAvatar);
                    if (updatedUser.avatarUrn) {
                        fetchUserAvatar(updatedUser.avatarUrn);
                        console.debug("Avatar uploaded successfully.");
                        notifications.show({
                            id: "avatar-upload-success",
                            title: "Success",
                            message: "Avatar uploaded successfully.",
                            color: "green",
                            icon: <IconPencilCheck />,
                        });
                    }
                } catch (error) {
                    if (error instanceof Error) {
                        const detail = error.message || "Failed to upload avatar.";
                        console.error("Avatar upload failed:", detail);
                        notifications.show({
                            id: "avatar-upload-error",
                            title: "Avatar Upload Failed",
                            message: detail,
                            color: "red",
                            icon: <IconSendOff />,
                        });
                        throw new Error(detail);
                    }
                    buttonStateHandler.close();
                }
            }
            if (updatedUser.avatarUrn && updatedUser.avatarUrn.trim() !== "" && !avatarRemoved) {
                fetchUserAvatar(updatedUser.avatarUrn);
            }
            fetchUsers(currentPage);
            setIndex(null);
        } catch (error) {
            try {
                if (error instanceof Error && error.message.includes("status code 403")) {
                    const detail = error.message || "Failed to update user information.";
                    notifications.show({
                        id: "user-update-error",
                        title: "Error",
                        message: detail,
                        color: "red",
                        icon: <IconSendOff />,
                    });
                }
                console.error("Update process failed:", error);
                notifications.show({
                    id: "user-update-error",
                    title: "Error",
                    message: (error as Error).message || "Failed to update user information. Please try again later.",
                    color: "red",
                    icon: <IconSendOff />,
                });
            } finally {
                buttonStateHandler.close();
            }
        }
    };

    const showRemoveButton = editUserAvatar || (currentAvatarUrn && !avatarRemoved);

    return (
        <Modal opened={index !== null} onClose={() => setIndex(null)} title="Edit User" centered>
            <Flex direction="column" gap="md">
                <Center>
                    <Card shadow="sm" radius="xl" withBorder style={{ position: "relative", cursor: "pointer" }}>
                        <FileButton onChange={setAvatar} accept="image/png,image/jpeg">
                            {(props) => (
                                <motion.div whileHover={{ scale: 1.05 }} style={{ position: "relative" }} {...props}>
                                    {editUserAvatarUrl && !avatarRemoved ? (
                                        <Image
                                            id="edit-user-avatar"
                                            src={editUserAvatarUrl}
                                            alt="User Avatar"
                                            h={150}
                                            w={150}
                                            radius="xl"
                                        />
                                    ) : (
                                        <IconUser size={150} color="gray" />
                                    )}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        whileHover={{ opacity: 1 }}
                                        style={{
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                                            borderRadius: "var(--mantine-radius-xl)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "white",
                                            fontWeight: 500,
                                        }}
                                    >
                                        Upload Picture
                                    </motion.div>
                                </motion.div>
                            )}
                        </FileButton>
                    </Card>
                </Center>
                {showRemoveButton && (
                    <Button
                        variant="outline"
                        color="red"
                        mt="md"
                        onClick={removeProfilePicture}
                    >
                        Remove Profile Picture
                    </Button>
                )}
                <form
                    onSubmit={form.onSubmit(handleSave)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            form.onSubmit(handleSave)();
                        }
                    }}
                >
                    <Tooltip
                        disabled={
                            userCtx.userInfo?.id === user?.id
                                ? userCtx.userPermissions?.includes("users:self:modify:username")
                                : userCtx.userPermissions?.includes("users:global:modify:username")
                        }
                        label="Username cannot be changed"
                        withArrow
                    >
                        <TextInput
                            disabled={
                                userCtx.userInfo?.id === user?.id
                                    ? !userCtx.userPermissions?.includes("users:self:modify:username")
                                    : !userCtx.userPermissions?.includes("users:global:modify:username")
                            }
                            label="Username"
                            placeholder="Username"
                            key={form.key("username")}
                            {...form.getInputProps("username")}
                        />
                    </Tooltip>
                    <Tooltip
                        disabled={
                            userCtx.userInfo?.id === user?.id
                                ? userCtx.userPermissions?.includes("users:self:modify:name")
                                : userCtx.userPermissions?.includes("users:global:modify:name")
                        }
                        label="Name cannot be changed"
                        withArrow
                    >
                        <TextInput
                            disabled={
                                userCtx.userInfo?.id === user?.id
                                    ? !userCtx.userPermissions?.includes("users:self:modify:name")
                                    : !userCtx.userPermissions?.includes("users:global:modify:name")
                            }
                            label="First Name"
                            placeholder="First Name"
                            key={form.key("nameFirst")}
                            {...form.getInputProps("nameFirst")}
                        />
                    </Tooltip>
                    <Tooltip
                        disabled={
                            userCtx.userInfo?.id === user?.id
                                ? userCtx.userPermissions?.includes("users:self:modify:name")
                                : userCtx.userPermissions?.includes("users:global:modify:name")
                        }
                        label="Name cannot be changed"
                        withArrow
                    >
                        <TextInput
                            disabled={
                                userCtx.userInfo?.id === user?.id
                                    ? !userCtx.userPermissions?.includes("users:self:modify:name")
                                    : !userCtx.userPermissions?.includes("users:global:modify:name")
                            }
                            label="Middle Name"
                            placeholder="Middle Name"
                            key={form.key("nameMiddle")}
                            {...form.getInputProps("nameMiddle")}
                        />
                    </Tooltip>
                    <Tooltip
                        disabled={
                            userCtx.userInfo?.id === user?.id
                                ? userCtx.userPermissions?.includes("users:self:modify:name")
                                : userCtx.userPermissions?.includes("users:global:modify:name")
                        }
                        label="Name cannot be changed"
                        withArrow
                    >
                        <TextInput
                            disabled={
                                userCtx.userInfo?.id === user?.id
                                    ? !userCtx.userPermissions?.includes("users:self:modify:name")
                                    : !userCtx.userPermissions?.includes("users:global:modify:name")
                            }
                            label="Last Name"
                            placeholder="Last Name"
                            key={form.key("nameLast")}
                            {...form.getInputProps("nameLast")}
                        />
                    </Tooltip>
                    <Tooltip
                        disabled={
                            userCtx.userInfo?.id === user?.id
                                ? userCtx.userPermissions?.includes("users:self:modify:email")
                                : userCtx.userPermissions?.includes("users:global:modify:email")
                        }
                        label="Email cannot be changed"
                        withArrow
                    >
                        <TextInput
                            disabled={
                                userCtx.userInfo?.id === user?.id
                                    ? !userCtx.userPermissions?.includes("users:self:modify:email")
                                    : !userCtx.userPermissions?.includes("users:global:modify:email")
                            }
                            label="Email"
                            placeholder="Email"
                            rightSection={
                                form.values.email &&
                                (user.emailVerified && form.values.email === user.email ? (
                                    <Tooltip
                                        label="This email has been verified. You're good to go!"
                                        withArrow
                                        multiline
                                        w={250}
                                    >
                                        <IconCircleDashedCheck size={16} color="green" />
                                    </Tooltip>
                                ) : (
                                    <Tooltip label="This email has not yet been verified." withArrow multiline w={250}>
                                        <IconCircleDashedX size={16} color="gray" />
                                    </Tooltip>
                                ))
                            }
                            key={form.key("email")}
                            {...form.getInputProps("email")}
                        />
                    </Tooltip>
                    <Tooltip
                        disabled={
                            userCtx.userInfo?.id === user?.id
                                ? userCtx.userPermissions?.includes("users:self:modify:school")
                                : userCtx.userPermissions?.includes("users:global:modify:school")
                        }
                        label="School cannot be changed"
                        withArrow
                    >
                        <Select
                            disabled={
                                userCtx.userInfo?.id === user?.id
                                    ? !userCtx.userPermissions?.includes("users:self:modify:school")
                                    : !userCtx.userPermissions?.includes("users:global:modify:school")
                            }
                            label="Assigned School"
                            placeholder="School"
                            data={availableSchoolNames}
                            key={form.key("school")}
                            searchable
                            {...form.getInputProps("school")}
                        />
                    </Tooltip>
                    <Tooltip
                        disabled={
                            userCtx.userInfo?.id === user?.id
                                ? userCtx.userPermissions?.includes("users:self:modify:role")
                                : userCtx.userPermissions?.includes("users:global:modify:role")
                        }
                        label="Role cannot be changed"
                        withArrow
                    >
                        <Select
                            disabled={
                                userCtx.userInfo?.id === user?.id
                                    ? !userCtx.userPermissions?.includes("users:self:modify:role")
                                    : !userCtx.userPermissions?.includes("users:global:modify:role")
                            }
                            label="Role"
                            placeholder="Role"
                            data={availableRoleDescriptions}
                            key={form.key("role")}
                            searchable
                            {...form.getInputProps("role")}
                        />
                    </Tooltip>
                    <Group mt="md">
                        <Tooltip
                            disabled={
                                userCtx.userInfo?.id === user?.id
                                    ? userCtx.userPermissions?.includes("users:self:deactivate")
                                    : userCtx.userPermissions?.includes("users:global:deactivate")
                            }
                            label="Deactivation status cannot be changed"
                            withArrow
                        >
                            <Switch
                                disabled={
                                    userCtx.userInfo?.id === user?.id
                                        ? !userCtx.userPermissions?.includes("users:self:deactivate")
                                        : !userCtx.userPermissions?.includes("users:global:deactivate")
                                }
                                label="Deactivated"
                                placeholder="Deactivated"
                                key={form.key("deactivated")}
                                {...form.getInputProps("deactivated", { type: "checkbox" })}
                            />
                        </Tooltip>
                        <Tooltip
                            disabled={
                                userCtx.userInfo?.id === user?.id
                                    ? userCtx.userPermissions?.includes("users:self:forceupdate")
                                    : userCtx.userPermissions?.includes("users:global:forceupdate")
                            }
                            label="Force Update Required cannot be changed"
                            withArrow
                        >
                            <Switch
                                disabled={
                                    userCtx.userInfo?.id === user?.id
                                        ? !userCtx.userPermissions?.includes("users:self:forceupdate")
                                        : !userCtx.userPermissions?.includes("users:global:forceupdate")
                                }
                                label="Force Update Required"
                                placeholder="Force Update Required"
                                key={form.key("forceUpdateInfo")}
                                {...form.getInputProps("forceUpdateInfo", { type: "checkbox" })}
                            />
                        </Tooltip>
                    </Group>
                    <Button loading={buttonLoading} rightSection={<IconDeviceFloppy />} type="submit" fullWidth mt="xl">
                        Save
                    </Button>
                </form>
            </Flex>
        </Modal>
    );
}
