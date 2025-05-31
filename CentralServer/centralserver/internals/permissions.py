from typing import Final

from centralserver.internals.models.user import DefaultRole

DEFAULT_ROLES: Final[tuple[DefaultRole, ...]] = (
    DefaultRole(id=1, description="Website Administrator", modifiable=False),
    DefaultRole(id=2, description="Superintendent", modifiable=False),
    DefaultRole(id=3, description="Administrator", modifiable=False),
    DefaultRole(id=4, description="Principal", modifiable=False),
    DefaultRole(id=5, description="Canteen Manager", modifiable=False),
)

PERMISSIONS: Final[dict[str, str]] = {
    "users:global:create": "Create new users of any role.",
    "users:global:modify": "Modify any user's information.",
    "users:global:read": "View all users' information.",
    "users:self:read": "View their own user information.",
    "roles:global:read": "View all user roles.",
    #####
    "reports:local:write": "Submit daily reports and monthly expenses.",
    "reports:local:read": "View monthly reports of their assigned school.",
}

ROLE_PERMISSIONS: Final[dict[int, list[str]]] = {
    1: [  # Website Administrator
        "roles:global:read",
        "users:global:create",
        "users:global:modify",
        "users:global:read",
        "users:self:read",
    ],
    2: [  # Superintendent
        "roles:global:read",
        "users:global:modify",
        "users:global:read",
        "users:self:read",
    ],
    3: [  # Administrator
        "roles:global:read",
        "users:global:modify",
        "users:global:read",
        "users:self:read",
    ],
    4: ["users:self:read"],  # Principal
    5: ["users:self:read"],  # Canteen Manager
}
