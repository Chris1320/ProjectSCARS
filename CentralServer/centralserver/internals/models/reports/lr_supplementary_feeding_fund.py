import datetime
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from centralserver.internals.models.reports.monthly_report import MonthlyReport


class LiquidationReportSupplementaryFeedingFund(SQLModel, table=True):
    """A model representing the liquidation (Supplementary Feeding Fund) reports."""

    __tablename__: str = "liquidationReportSupplementaryFeedingFund"  # type: ignore

    parent: datetime.date = Field(
        primary_key=True, index=True, foreign_key="monthlyReports.id"
    )
    notedby: str = Field(foreign_key="users.id")
    preparedby: str = Field(foreign_key="users.id")
    teacherInCharge: str = Field(foreign_key="users.id")

    entries: list["SupplementaryFeedingFundEntry"] = Relationship(
        back_populates="parent_report"
    )
    certified_by: list["SupplementaryFeedingFundCertifiedBy"] = Relationship(
        back_populates="parent_report"
    )
    parent_report: "MonthlyReport" = Relationship(
        back_populates="supplementary_feeding_fund_report"
    )


class SupplementaryFeedingFundCertifiedBy(SQLModel, table=True):
    __tablename__: str = "liquidationReportSupplementaryFeedingFundCertifiedBy"  # type: ignore

    parent: datetime.date = Field(
        primary_key=True,
        index=True,
        foreign_key="liquidationReportSupplementaryFeedingFund.parent",
    )
    user: str = Field(foreign_key="users.id")

    parent_report: "LiquidationReportSupplementaryFeedingFund" = Relationship(
        back_populates="certified_by"
    )


class SupplementaryFeedingFundEntry(SQLModel, table=True):
    __tablename__: str = "liquidationReportSupplementaryFeedingFundEntries"  # type: ignore

    parent: datetime.date = Field(
        primary_key=True,
        index=True,
        foreign_key="liquidationReportSupplementaryFeedingFund.parent",
    )
    date: datetime.datetime
    receipt: str
    particulars: str
    unit: str
    quantity: float
    unitPrice: float

    parent_report: "LiquidationReportSupplementaryFeedingFund" = Relationship(
        back_populates="entries"
    )
