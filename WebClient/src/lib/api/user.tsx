import ky from "ky";

import { Connections, LocalStorage } from "@/lib/info";
import { UserPublicType } from "@/lib/types";
import { CentralServerGetUserInfo } from "@/lib/api/auth";
import { GetAccessTokenHeader } from "@/lib/api/auth";

const endpoint = `${Connections.CentralServer.endpoint}/api/v1`;

export async function CentralServerGetUserAvatar(): Promise<Blob | null> {
    if (localStorage.getItem(LocalStorage.user_data) === null) {
        console.debug("Getting user data first...");
        await CentralServerGetUserInfo(true);
    }

    const lsContent = localStorage.getItem(LocalStorage.user_data);
    if (lsContent === null) {
        console.error("User data is still not set.");
        throw new Error("User data is still not set.");
    }

    const userData: UserPublicType = JSON.parse(lsContent);

    if (userData.avatarUrn === null) {
        return null;
    }
    console.log(userData.avatarUrn);
    const centralServerResponse = await ky.get(`${endpoint}/users/avatar/${userData.avatarUrn}`, {
        headers: { Authorization: GetAccessTokenHeader() },
    });
    if (!centralServerResponse.ok) {
        const errorMessage = `Failed to get avatar: ${centralServerResponse.status} ${centralServerResponse.statusText}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }

    const userAvatar: Blob = await centralServerResponse.blob();

    console.debug("Avatar response blob size:", userAvatar.size);
    return userAvatar;
}

export async function CentralServerUploadUserAvatar(file: File): Promise<UserPublicType> {
    const formData = new FormData();
    formData.append("img", file);

    const centralServerResponse = await ky.patch(`${endpoint}/users/update/me/avatar`, {
        headers: { Authorization: GetAccessTokenHeader() },
        body: formData,
    });
    if (!centralServerResponse.ok) {
        const errorMessage = `Failed to upload avatar: ${centralServerResponse.status} ${centralServerResponse.statusText}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }

    const updatedUserData: UserPublicType = await centralServerResponse.json();
    localStorage.setItem(LocalStorage.user_data, JSON.stringify(updatedUserData));
    return updatedUserData;
}
