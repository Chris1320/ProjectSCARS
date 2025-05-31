import datetime
import hashlib
import os
import smtplib
from email import encoders
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from centralserver import info
from centralserver.internals.config_handler import app_config
from centralserver.internals.exceptions import EmailTemplateNotFoundError
from centralserver.internals.logger import LoggerFactory

logger = LoggerFactory().get_logger(__name__)


def create_attachment(bytes_data: bytes, filename: str, content_type: str) -> MIMEBase:
    """Create an email attachment from bytes data.

    Args:
        bytes_data: The content of the file as bytes.
        filename: The name of the file to be attached.
        content_type: The MIME type of the file (e.g., 'application/pdf').

    Returns:
        A MIMEBase object representing the attachment.
    """

    attachment = MIMEBase(*content_type.split("/"))
    attachment.set_payload(bytes_data)
    encoders.encode_base64(attachment)
    attachment.add_header("Content-Disposition", f"attachment; filename={filename}")
    return attachment


def send_mail(
    to_address: str,
    subject: str,
    text: str,
    html: str | None = None,
    attachments: list[MIMEBase] | None = None,
):
    """Send an email to the specified recipient.

    If mailing is disabled in the configuration, the email content will be logged instead of sent.

    Args:
        to_address: The email address of the recipient.
        subject: The subject of the email.
        text: The plain text content of the email.
        html: The HTML content of the email (optional).
        attachments: A list of files (optional).
    """

    if not app_config.mailing.enabled:
        logger.info("Mailing is disabled, printing to logs instead.")
        logger.info("To: %s", to_address)
        logger.info("Subject: %s", subject)
        logger.info("Text: %s", text)
        return

    try:

        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = app_config.mailing.from_address
        message["To"] = to_address
        message["Reply-To"] = app_config.mailing.from_address
        message["Return-Path"] = app_config.mailing.from_address
        message["Message-ID"] = (
            "<{message_hash}@{domain}>".format(  # pylint: disable=C0209
                message_hash=hashlib.sha256(
                    f"{to_address}{subject}{text}".encode()
                ).hexdigest(),
                domain=app_config.mailing.from_address.split("@")[1],
            )
        )
        message["Date"] = datetime.datetime.now().strftime("%a, %d %b %Y %H:%M:%S %z")
        message["X-Mailer"] = info.Program.name

        plain_content = MIMEText(text, "plain", "utf-8")
        html_content = MIMEText(html, "html", "utf-8") if html else None

        message.attach(plain_content)
        if html_content:
            message.attach(html_content)

        if attachments:
            for attachment in attachments:
                message.attach(attachment)

        # Send the email
        with smtplib.SMTP(app_config.mailing.server, app_config.mailing.port) as server:
            server.starttls()  # Upgrade the connection to a secure encrypted SSL/TLS connection
            server.login(app_config.mailing.username, app_config.mailing.password)
            server.sendmail(
                from_addr=app_config.mailing.from_address,
                to_addrs=[to_address],
                msg=message.as_string(),
            )

    except smtplib.SMTPException as e:
        logger.error("Failed to send email: %s", e)

    except Exception as e:  # pylint: disable=W0718
        logger.error("An unexpected error occurred while sending email: %s", e)


def get_template(template_name: str):
    """Get the content of an email template.

    Args:
        template_name: The name of the template file to read.

    Returns:
        The content of the template file as a string.
    """

    try:
        with open(
            os.path.join(app_config.mailing.templates_dir, template_name),
            "r",
            encoding=app_config.mailing.templates_encoding,
        ) as template_file:
            return template_file.read()
    except FileNotFoundError:
        raise EmailTemplateNotFoundError(
            f"The template '{template_name}' was not found in the templates directory."
        )
