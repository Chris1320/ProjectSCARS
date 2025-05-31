import datetime
from typing import Annotated, Any

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwe, jwt
from jose.exceptions import JWEError
from passlib.context import CryptContext
from sqlmodel import Session, select

from centralserver import info
from centralserver.internals import permissions
from centralserver.internals.config_handler import app_config
from centralserver.internals.logger import LoggerFactory
from centralserver.internals.mail_handler import send_mail
from centralserver.internals.models.role import Role
from centralserver.internals.models.token import DecodedJWTToken
from centralserver.internals.models.user import User

logger = LoggerFactory().get_logger(__name__)
crypt_ctx = CryptContext(schemes=["argon2"], deprecated="auto", argon2__type="ID")
oauth2_bearer = OAuth2PasswordBearer(tokenUrl="/v1/auth/token")


async def get_user(user_id: str, session: Session, by_id: bool = True) -> User | None:
    """Get a user from the database.

    Args:
        user_id: The ID of the user.
        session: The database session to use.
        by_id: If False, treat <user_id> as a username.

    Returns:
        The user object if found, None otherwise.
    """

    logger.debug(
        "Getting user with ID: %s" if by_id else "Getting user with username: %s",
        user_id,
    )
    return (
        session.exec(select(User).where(User.id == user_id)).first()
        if by_id
        else session.exec(select(User).where(User.username == user_id)).first()
    )


async def get_role(role_id: int, session: Session) -> Role | None:
    """Get a role by ID.

    Args:
        role_id: The ID of the role.
        session: The database session to use.

    Returns:
        The Role object.
    """

    logger.debug("Getting role with ID: %s", role_id)
    return session.get(Role, role_id)


async def get_user_role(
    user_id: str, session: Session, by_id: bool = True
) -> Role | None:
    """Get the role of a user.

    Args:
        user_id: The ID of the user.
        session: The database session to use.
        by_id: If False, treat <user_id> as a username.

    Returns:
        The ID of the role of the user.
    """

    logger.debug(
        (
            "Getting role for user with ID: %s"
            if by_id
            else "Getting role for user with username: %s"
        ),
        user_id,
    )
    return session.exec(
        select(Role).where(
            Role.id
            == session.exec(select(User.roleId).where(User.id == user_id)).first()
        )
        if by_id
        else select(Role).where(
            Role.id
            == session.exec(select(User.roleId).where(User.username == user_id)).first()
        )
    ).first()


async def authenticate_user(
    username: str, plaintext_password: str, login_ip: str | None, session: Session
) -> User | tuple[int, str]:
    """Find the user in the database and verify their password.
    This function will not authenticate deactivated and locked out users.

    Args:
        username: The username of the user to authenticate.
        plaintext_password: The plaintext password to verify.
        login_ip: The IP address of the user attempting to log in.
        session: The database session to use.

    Returns:
        A User object if the user is found and the password is
        correct. If the user is not found or the password is incorrect,
        returns a tuple with an HTTP status code and an error message.
    """

    logger.debug("Attempting to authenticate user `%s`", username)
    found_user: User | None = await get_user(username, session, False)

    if not found_user:
        logger.debug("Authentication failed: %s (user not found)", username)
        return (status.HTTP_401_UNAUTHORIZED, "User not found.")

    if found_user.deactivated:
        logger.debug("User %s is deactivated", username)
        return (status.HTTP_403_FORBIDDEN, "User is deactivated.")

    # Check if the user is locked out.
    if (
        found_user.failedLoginAttempts
        >= app_config.security.failed_login_lockout_attempts
    ):
        if not found_user.failedLoginTime:
            logger.warning(
                "User %s is locked out but has no failed login time.",
                username,
                app_config.security.failed_login_lockout_minutes,
            )
            found_user.failedLoginTime = datetime.datetime.now(datetime.timezone.utc)
            locked_out_until = found_user.failedLoginTime + datetime.timedelta(
                app_config.security.failed_login_lockout_minutes
            )
            session.commit()
            session.refresh(found_user)
            return (
                status.HTTP_429_TOO_MANY_REQUESTS,
                f"User is locked out until {locked_out_until} due to too many failed login attempts.",
            )

        # Check if the lockout period has expired.
        if found_user.failedLoginTime.replace(
            tzinfo=datetime.timezone.utc
        ) + datetime.timedelta(
            minutes=app_config.security.failed_login_lockout_minutes
        ) > datetime.datetime.now(
            datetime.timezone.utc
        ):
            logger.info(
                "Authentication failed: %s (user locked out due to too many failed attempts)",
                username,
            )
            logger.debug(
                "User %s is locked out until %s",
                username,
                found_user.failedLoginTime,
            )
            locked_out_until = found_user.failedLoginTime + datetime.timedelta(
                minutes=app_config.security.failed_login_lockout_minutes
            )
            return (
                status.HTTP_429_TOO_MANY_REQUESTS,
                f"User is locked out until {locked_out_until} due to too many failed login attempts.",
            )

        else:
            logger.info(
                "User %s is no longer locked out, resetting failed login attempts",
                username,
            )
            found_user.failedLoginAttempts = 0
            found_user.failedLoginTime = None
            found_user.failedLoginIp = None
            session.commit()
            session.refresh(found_user)

    if not crypt_ctx.verify(plaintext_password, found_user.password):
        logger.debug("Authentication failed: %s (invalid password)", username)
        logger.debug(
            "User %s has %d failed login attempts",
            username,
            found_user.failedLoginAttempts,
        )
        found_user.failedLoginAttempts += 1
        found_user.failedLoginTime = datetime.datetime.now(datetime.timezone.utc)
        found_user.failedLoginIp = login_ip
        session.commit()
        session.refresh(found_user)

        if found_user.email:
            if (
                found_user.failedLoginAttempts
                == app_config.security.failed_login_notify_attempts
            ):
                send_mail(
                    found_user.email,
                    f"{info.Program.name} | Someone is trying to access your account",
                    f"""\
Hello {found_user.nameFirst or found_user.username},

Someone has attempted to log in to your account on {info.Program.name}.
Please check your account activity and change your password if you did not initiate this login.

Login attempts: {found_user.failedLoginAttempts}
Last login attempt time: {found_user.failedLoginTime}
Last login attempt IP: {found_user.failedLoginIp or 'Unknown'}

If you continue to experience issues, please contact support.
""",
                    f"""\
<p>Hello {found_user.nameFirst or found_user.username},</p>

<p>Someone has attempted to log in to your account on {info.Program.name}.</p>
<p>Please check your account activity and change your password if you did not initiate this login.</p>

<ul>
    <li>Login attempts: {found_user.failedLoginAttempts}</li>
    <li>Last login attempt time: {found_user.failedLoginTime}</li>
    <li>Last login attempt IP: {found_user.failedLoginIp or 'Unknown'}</li>
</ul>

<p>If you continue to experience issues, please contact support.</p>
""",
                )

        tries_remaining = (
            app_config.security.failed_login_lockout_attempts
            - found_user.failedLoginAttempts
        )
        return (
            status.HTTP_401_UNAUTHORIZED,
            f"Invalid credentials. {tries_remaining} attempts remaining before lockout.",
        )

    found_user.failedLoginAttempts = 0
    found_user.failedLoginTime = None
    found_user.failedLoginIp = None
    session.commit()
    session.refresh(found_user)
    logger.debug("Authentication successful: %s", username)
    logger.debug("Returning user information for user id: %s", found_user.id)
    return found_user


async def create_access_token(
    user_id: str, expiration_td: datetime.timedelta, refresh: bool = False
) -> str:
    """Create a JWE access token for the user, valid for +<expiration_td>.

    Args:
        user_id: The ID of the user.
        expiration_td: The time delta for the token expiration.
        refresh: If True, the token is a refresh token.

    Returns:
        The encrypted JWT access token.
    """

    logger.debug("Creating access token for user `%s`...", user_id)
    token_data: dict[str, Any] = {
        "sub": user_id,
        "is_refresh": refresh,
        "exp": datetime.datetime.now(datetime.timezone.utc) + expiration_td,
    }

    access_token = jwe.encrypt(
        plaintext=jwt.encode(
            claims=token_data,
            key=app_config.authentication.signing_secret_key,
            algorithm=app_config.authentication.signing_algorithm,
        ),
        key=app_config.authentication.encryption_secret_key.encode(
            app_config.authentication.encoding
        ),
        algorithm=app_config.authentication.encryption_algorithm,
    ).decode("utf-8")

    # logger.debug("Access token: %s", access_token)
    return access_token


def verify_access_token(
    token: Annotated[str, Depends(oauth2_bearer)],
) -> DecodedJWTToken | None:
    """Get the current user from the JWE token.

    Args:
        token: The JWE token.

    Returns:
        The decoded JWE token payload.

    Raises:
        HTTPException: Raised when the token is invalid or expired.
    """

    try:
        logger.debug("Decrypting access token...")
        # logger.debug("Token: %s", token)
        decoded_jwe = jwe.decrypt(
            token,
            app_config.authentication.encryption_secret_key.encode(
                app_config.authentication.encoding
            ),
        )

        if decoded_jwe is None:
            logger.warning("Failed to decrypt JWE")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Failed to validate user.",
            )

        logger.debug("Decoding access token...")
        payload = jwt.decode(
            decoded_jwe.decode(app_config.authentication.encoding),
            app_config.authentication.signing_secret_key,
            algorithms=[app_config.authentication.signing_algorithm],
        )

        # Check if token is expired
        if payload.get("exp") is None:
            logger.warning("JWT is missing expiration date")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Failed to validate user.",
            )

        if datetime.datetime.fromtimestamp(
            payload["exp"], datetime.timezone.utc
        ) < datetime.datetime.now(datetime.timezone.utc):
            logger.warning("JWT is expired")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Failed to validate user.",
            )

        user_id: str | None = payload.get("sub", None)
        is_refresh_token: bool | None = payload.get("is_refresh", None)

        if user_id is None or is_refresh_token is None:
            logger.warning("JWT is missing content")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Failed to validate user.",
            )

        return DecodedJWTToken(id=user_id, is_refresh_token=is_refresh_token)

    except (JWTError, JWEError) as e:
        logger.warning("Failed to decode JWE/JWT: %s", e)
        logger.debug("Traceback:", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Failed to validate user.",
        )


async def verify_user_permission(
    required_role: str,
    session: Session,
    token: Annotated[DecodedJWTToken, Depends(oauth2_bearer)],
) -> bool:
    """Check if the user has the required permissions based on their role.

    Args:
        required_role: A permissions.ROLE_PERMISSIONS value.
        session: The database session to use.
        token: The user's access token.

    Returns:
        Returns True if the user has the required permissions, False otherwise.
    """

    if token.is_refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid JWT token",
        )

    user_role = await get_user_role(token.id, session)
    if user_role is None:
        logger.warning("User role not found for user ID: %s", token.id)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Failed to validate user permission.",
        )

    if user_role.id in permissions.ROLE_PERMISSIONS:
        logger.debug("Checking permissions for user role: %s", user_role.id)
        return required_role in permissions.ROLE_PERMISSIONS[user_role.id]

    logger.error("The role %s is not defined in ROLE_PERMISSIONS", user_role.id)
    return False
