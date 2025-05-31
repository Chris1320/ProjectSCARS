import datetime
import uuid
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from pydantic import EmailStr
from sqlmodel import Session, select

from centralserver import info
from centralserver.internals.auth_handler import (
    authenticate_user,
    create_access_token,
    verify_access_token,
    verify_user_permission,
)
from centralserver.internals.config_handler import app_config
from centralserver.internals.db_handler import get_db_session
from centralserver.internals.exceptions import EmailTemplateNotFoundError
from centralserver.internals.logger import LoggerFactory
from centralserver.internals.mail_handler import get_template, send_mail
from centralserver.internals.models.role import Role
from centralserver.internals.models.token import DecodedJWTToken, JWTToken
from centralserver.internals.models.user import (
    User,
    UserCreate,
    UserPasswordResetRequest,
    UserPublic,
)
from centralserver.internals.user_handler import (
    create_user,
    crypt_ctx,
    validate_password,
)

logger = LoggerFactory().get_logger(__name__)

router = APIRouter(
    prefix="/v1/auth",
    tags=["authentication"],
    # dependencies=[Depends(get_db_session)],
)

logged_in_dep = Annotated[DecodedJWTToken, Depends(verify_access_token)]


@router.post("/create", status_code=status.HTTP_201_CREATED, response_model=UserPublic)
async def create_new_user(
    new_user: UserCreate,
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
) -> UserPublic:
    """Create a new user in the database.

    Args:
        new_user: The new user's information.
        token: The decoded JWT token of the logged-in user.
        session: The database session.

    Returns:
        A newly created user object.
    """

    if not await verify_user_permission("users:global:create", session, token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to create a user.",
        )

    user_role = session.get(Role, new_user.roleId)
    if not user_role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role ID provided.",
        )

    logger.info("Creating new user: %s", new_user.username)
    logger.debug("Created by user: %s", token.id)
    user = UserPublic.model_validate(await create_user(new_user, session))
    logger.debug("Returning new user information: %s", user)
    return user


@router.post("/token")
async def request_access_token(
    data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: Annotated[Session, Depends(get_db_session)],
    request: Request,
) -> JWTToken:
    """Get an access token for a user.

    Args:
        data: The data from the OAuth2 password request form.
        session: The database session.
        request: The HTTP request object.

    Returns:
        A JWT token.

    Raises:
        HTTPException: If the user cannot be authenticated.
    """

    logger.info("Requesting access token for user: %s", data.username)
    user: User | tuple[int, str] = await authenticate_user(
        data.username,
        data.password,
        request.client.host if request.client else None,
        session,
    )

    if isinstance(user, tuple):
        logger.warning(
            "Failed to authenticate user %s: %s (%s)", data.username, user[1], user[0]
        )
        raise HTTPException(
            status_code=user[0],
            detail=user[1],
        )

    user.lastLoggedInTime = datetime.datetime.now(datetime.timezone.utc)
    user.lastLoggedInIp = request.client.host if request.client else None
    session.commit()
    session.refresh(user)

    return JWTToken(
        uid=uuid.uuid4(),
        access_token=await create_access_token(
            user.id,
            datetime.timedelta(
                minutes=app_config.authentication.access_token_expire_minutes
            ),
            False,
        ),
        token_type="bearer",
    )


@router.post("/recovery/request")
async def request_password_recovery(
    username: str, email: EmailStr, session: Annotated[Session, Depends(get_db_session)]
) -> dict[Literal["message"], str]:
    """Request a password recovery for a user.

    Args:
        username: The username of the user.
        email: The email address of the user.
        session: The database session.
    """

    logger.info("Requesting password recovery for user: %s", username)
    user = session.exec(select(User).where(User.username == username)).first()

    if not user:
        logger.warning("User not found for password recovery: %s", username)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    if not user.email:
        logger.warning(
            "User %s does not have an email address set for password recovery.",
            username,
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user does not have an email address set for password recovery.",
        )

    if user.email != email:
        logger.warning(
            "Email mismatch for user %s: provided %s, expected %s",
            username,
            email,
            user.email,
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email does not match the user's email address.",
        )

    # Generate a recovery token and set its expiration time
    user.recoveryToken = str(uuid.uuid4())
    user.recoveryTokenExpires = datetime.datetime.now(
        datetime.timezone.utc
    ) + datetime.timedelta(
        minutes=app_config.authentication.recovery_token_expire_minutes
    )
    session.commit()
    session.refresh(user)
    recovery_link = (
        f"{app_config.connection.base_url}/resetPassword?token={user.recoveryToken}"
    )
    logger.debug("Generated recovery link for user %s: %s", username, recovery_link)

    try:
        send_mail(
            to_address=user.email,
            subject=f"{info.Program.name} | Password Recovery Request",
            text=get_template("password_recovery.txt").format(
                name=user.nameFirst or user.username,
                app_name=info.Program.name,
                recovery_link=recovery_link,
                expiration_time=app_config.authentication.recovery_token_expire_minutes,
            ),
            html=get_template("password_recovery.html").format(
                name=user.nameFirst or user.username,
                app_name=info.Program.name,
                recovery_link=recovery_link,
                expiration_time=app_config.authentication.recovery_token_expire_minutes,
            ),
        )

    except EmailTemplateNotFoundError:
        logger.error("Template for password recovery email not found.")
        logger.debug("User's password recovery link: %s", recovery_link)

    return {"message": "ok"}


@router.post("/recovery/reset")
async def reset_password(
    data: UserPasswordResetRequest,
    session: Annotated[Session, Depends(get_db_session)],
) -> dict[str, str]:
    """Reset a user's password using a recovery token.

    Args:
        token: The recovery token.
        new_password: The new password for the user.
        session: The database session.

    Returns:
        A message indicating the success of the operation.
    """

    logger.info("Resetting password for token: %s", data.recovery_token)
    user = session.exec(
        select(User).where(User.recoveryToken == data.recovery_token)
    ).first()

    if not user or not user.recoveryToken or not user.recoveryTokenExpires:
        logger.warning(
            "Invalid or missing recovery token or user: %s", data.recovery_token
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or missing recovery token or user.",
        )

    if user.deactivated:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated.",
        )

    password_is_valid, password_err = await validate_password(data.new_password)
    if not password_is_valid:
        logger.warning(
            "Failed to reset password for user: %s (%s)", user.username, password_err
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid password format ({password_err})",
        )

    logger.debug(
        "%s < %s",
        user.recoveryTokenExpires.replace(tzinfo=datetime.timezone.utc),
        datetime.datetime.now(datetime.timezone.utc),
    )
    if user.recoveryTokenExpires.replace(
        tzinfo=datetime.timezone.utc
    ) < datetime.datetime.now(datetime.timezone.utc):
        logger.warning("Invalid or expired recovery token: %s", data.recovery_token)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Expired recovery token.",
        )

    user.password = crypt_ctx.hash(data.new_password)
    user.recoveryToken = None
    user.recoveryTokenExpires = None
    session.commit()
    session.refresh(user)
    logger.info("Password reset successful for user: %s", user.username)
    return {"message": "Password reset successful."}


@router.get("/roles", response_model=list[Role])
async def get_all_roles(
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
) -> list[Role]:
    """Get all roles in the database.

    Args:
        token: The decoded JWT token of the logged-in user.
        session: The database session.

    Returns:
        A list of all roles in the database.
    """

    if not await verify_user_permission("roles:global:read", session, token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view all roles.",
        )

    # NOTE: Should we include the permissions of each role in the response?
    return [role for role in session.exec(select(Role)).all()]
