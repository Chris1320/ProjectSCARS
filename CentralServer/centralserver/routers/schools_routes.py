import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlmodel import Session, func, select

from centralserver.internals.auth_handler import (
    verify_access_token,
    verify_user_permission,
)
from centralserver.internals.db_handler import get_db_session
from centralserver.internals.logger import LoggerFactory
from centralserver.internals.models.school import School, SchoolCreate
from centralserver.internals.models.token import DecodedJWTToken
from centralserver.internals.models.user import User
from centralserver.internals.school_handler import create_school

logger = LoggerFactory().get_logger(__name__)

router = APIRouter(
    prefix="/v1/schools",
    tags=["schools"],
)

logged_in_dep = Annotated[DecodedJWTToken, Depends(verify_access_token)]


@router.post("/create", response_model=School)
async def create_school_endpoint(
    school: SchoolCreate,
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
) -> Response:
    """Create a new school in the system."""

    if not await verify_user_permission("schools:create", session, token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to create schools.",
        )

    new_school = await create_school(school, session)
    logger.debug("user %s created a new school with id %s", token.id, new_school.id)
    return Response(
        content=new_school.model_dump_json(),
        status_code=status.HTTP_201_CREATED,
        media_type="application/json",
    )


@router.get("/quantity", response_model=int)
async def get_schools_quantity_endpoint(
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
) -> int:
    """Get the total number of schools in the system."""

    if not await verify_user_permission("schools:global:read", session, token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view schools list.",
        )

    logger.debug("user %s fetching users quantity", token.id)
    return session.exec(select(func.count(School.id))).one()  # type: ignore


@router.get("/me", response_model=list[School])
async def get_assigned_schools_endpoint(
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
) -> list[School]:
    """Get the list of schools assigned to the user."""

    if not await verify_user_permission("schools:self:read", session, token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view your assigned schools.",
        )

    user = session.get(User, token.id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    return user.schools


@router.get("/all", response_model=list[School])
async def get_all_schools_endpoint(
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
    limit: int = 100,
    offset: int = 0,
) -> list[School]:
    """Get all schools and their information."""

    if not await verify_user_permission("schools:global:read", session, token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view all schools.",
        )

    return [
        school
        for school in session.exec(select(School).limit(limit).offset(offset)).all()
    ]


@router.get("/", response_model=School)
async def get_school_endpoint(
    school_id: int,
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
) -> School:
    """Get the information of a specific school."""

    user = session.get(User, token.id)
    school = session.get(School, school_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    if not school:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="School not found.",
        )

    required_permission = (
        "schools:self:read" if user in school.users else "schools:global:read"
    )

    if not await verify_user_permission(required_permission, session, token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view this school.",
        )

    return school


@router.patch("/", response_model=School)
async def update_school_endpoint(
    updated_school_info: School,
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
) -> School:
    """Update the information of a specific school."""

    user = session.get(User, token.id)
    school = session.get(School, updated_school_info.id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    if not school:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="School not found.",
        )

    required_permission = (
        "schools:self:modify" if user in school.users else "schools:global:modify"
    )

    if not await verify_user_permission(required_permission, session, token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to update this school.",
        )

    if updated_school_info.name:
        school.name = updated_school_info.name

    if updated_school_info.address:
        school.address = updated_school_info.address

    if updated_school_info.coordinates:
        school.coordinates = updated_school_info.coordinates

    if updated_school_info.phone:
        school.phone = updated_school_info.phone

    if updated_school_info.email:
        school.email = updated_school_info.email

    if updated_school_info.website:
        school.website = updated_school_info.website

    school.lastModified = datetime.datetime.now(datetime.timezone.utc)
    # school.lastModifiedById = token.id

    session.add(school)
    session.commit()
    session.refresh(school)

    logger.debug("user %s updated school with id %s", token.id, school.id)
    return school
