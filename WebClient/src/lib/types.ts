/** A type representing an access token. */
export type TokenType = {
    token: string;
    type: string;
};

/** A type representing a user without sensitive information. */
export type UserPublicType = {
    id: string;
    username: string;
    email?: string | null;
    nameFirst?: string | null;
    nameMiddle?: string | null;
    nameLast?: string | null;
    avatarUrn?: string | null;
    schoolId?: number | null;
    roleId: number;
    deactivated: boolean;
    finishedTutorials: string;
    forceUpdateInfo: boolean;
    dateCreated: Date;
    lastModified: Date;
    lastLoggedInTime?: Date | null;
    lastLoggedInIp?: string | null;
};
