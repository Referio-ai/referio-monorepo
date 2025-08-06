from src.config.infisical import ENV

SLACK_URL = "https://slack.com/api/chat.postMessage"

# TABLE NAMES
DOCUMENTS = "documents"
FACILITY_ENTITY = "facility_entity"
ORGANIZATIONS = "organizations"
PATIENTS = "patients"
REFERRALS = "referrals"
REFERRALS_BATCH = "referrals_batch"
REFERRALS_STATUS = "referrals_status"
REFERRAL_STATUS_HISTORY = "referral_status_history"
REWARDS = "rewards"

# REFERRAL STATUS CONSTANTS
REFERRAL_STATUS_SCHEDULED = "scheduled"
REFERRAL_STATUS_DECLINED_SERVICES = "declined_services"
REFERRAL_STATUS_UNABLE_TO_REACH = "unable_to_reach"
REFERRAL_STATUS_REPORT_SENT = "report_sent"

# REFERRAL STATUS OPTIONS (for UI display)
REFERRAL_STATUS_OPTIONS = [
    REFERRAL_STATUS_SCHEDULED,
    REFERRAL_STATUS_DECLINED_SERVICES,
    REFERRAL_STATUS_UNABLE_TO_REACH,
    REFERRAL_STATUS_REPORT_SENT
]

# REFERRAL STATUS LABELS (for UI display)
REFERRAL_STATUS_LABELS = {
    REFERRAL_STATUS_SCHEDULED: "Scheduled",
    REFERRAL_STATUS_DECLINED_SERVICES: "Declined Services",
    REFERRAL_STATUS_UNABLE_TO_REACH: "Unable to Reach",
    REFERRAL_STATUS_REPORT_SENT: "Report Sent"
}

# REFERRAL STATUS MAPPING (maps UI status to database status)
REFERRAL_STATUS_MAPPING = {
    "Scheduled": "active",  # Scheduled means active
    "Declined Services": "archive",  # Declined means archive
    "Unable to Reach": "archive",  # Unable to reach means archive
    "Report Sent": "archive"  # Report sent means archive
}