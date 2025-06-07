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
    roleId: number;
    deactivated: boolean;
    finishedTutorials: string;
    forceUpdateInfo: boolean;
    emailVerified: boolean;
    dateCreated: Date;
    lastModified: Date;
    lastLoggedInTime?: Date | null;
    lastLoggedInIp?: string | null;
};

/** A model used when updating user information. */
export type UserUpdateType = {
    id: string; // The ID of the user to be updated.
    username: string;
    email?: string | null;
    nameFirst?: string | null;
    nameMiddle?: string | null;
    nameLast?: string | null;
    roleId: number;
    deactivated?: boolean | null;
    finishedTutorials?: string | null;
    forceUpdateInfo?: boolean | null;
    password?: string | null;
};

export type ServerMessageType = {
    message: string;
};

export type RoleType = {
    id: number;
    description: string;
    modifiable: boolean;
};

export type NotificationType = {
    id: string;
    created: Date;
    ownerId: string;
    title: string;
    content: string;
    important: boolean;
    type: string;
    archived: boolean;
};

export type SchoolType = {
    id: number;
    name: string;
    address?: string | null;
    coordinates?: string | null;

    phone?: string | null;
    email?: string | null;
    website?: string | null;

    logoUrn?: string | null;

    dateCreated: Date;
    lastModified: Date;
};

export type SchoolUpdateType = {
    name: string;
    address?: string | null;
    coordinates?: string | null;

    phone?: string | null;
    email?: string | null;
    website?: string | null;
};
