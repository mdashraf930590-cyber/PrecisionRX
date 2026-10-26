"""Initial database schema migration."""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

revision = "0001_initial_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── users ────────────────────────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.Column("role", sa.String(50), nullable=False, server_default="viewer"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("npi_number", sa.String(20)),
        sa.Column("department", sa.String(100)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()")),
    )
    op.create_index("ix_users_email", "users", ["email"])

    # ── patients ─────────────────────────────────────────────────────────────
    op.create_table(
        "patients",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("mrn", sa.String(50), nullable=False, unique=True),
        sa.Column("first_name", sa.String(100), nullable=False),
        sa.Column("last_name", sa.String(100), nullable=False),
        sa.Column("date_of_birth", sa.DateTime(timezone=True), nullable=False),
        sa.Column("sex", sa.String(10), nullable=False),
        sa.Column("blood_type", sa.String(5)),
        sa.Column("ethnicity", sa.String(50)),
        sa.Column("weight_kg", sa.Float()),
        sa.Column("height_cm", sa.Float()),
        sa.Column("phone", sa.String(20)),
        sa.Column("email", sa.String(255)),
        sa.Column("address", JSONB),
        sa.Column("insurance", JSONB),
        sa.Column("emergency_contact", JSONB),
        sa.Column("primary_physician_id", sa.String(36), sa.ForeignKey("users.id")),
        sa.Column("risk_score", sa.Float(), server_default="0.0"),
        sa.Column("adherence_score", sa.Float(), server_default="0.0"),
        sa.Column("fhir_resource_id", sa.String(100)),
        sa.Column("is_deleted", sa.Boolean(), server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()")),
    )
    op.create_index("ix_patients_mrn", "patients", ["mrn"])

    # ── genomic_profiles ─────────────────────────────────────────────────────
    op.create_table(
        "genomic_profiles",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("patient_id", sa.String(36), sa.ForeignKey("patients.id"), nullable=False, unique=True),
        sa.Column("raw_vcf_path", sa.String(500)),
        sa.Column("parsed_snps", JSONB),
        sa.Column("metabolizer_statuses", JSONB),
        sa.Column("hla_alleles", JSONB),
        sa.Column("pgx_risk_flags", JSONB),
        sa.Column("processed_at", sa.DateTime(timezone=True)),
        sa.Column("pipeline_version", sa.String(20)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()")),
    )

    # ── lab_results ───────────────────────────────────────────────────────────
    op.create_table(
        "lab_results",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("patient_id", sa.String(36), sa.ForeignKey("patients.id"), nullable=False),
        sa.Column("loinc_code", sa.String(20), nullable=False),
        sa.Column("display_name", sa.String(200), nullable=False),
        sa.Column("value", sa.Float(), nullable=False),
        sa.Column("unit", sa.String(50)),
        sa.Column("reference_range_low", sa.Float()),
        sa.Column("reference_range_high", sa.Float()),
        sa.Column("interpretation", sa.String(20)),
        sa.Column("is_abnormal", sa.Boolean(), server_default="false"),
        sa.Column("ordering_provider_id", sa.String(36)),
        sa.Column("collected_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("resulted_at", sa.DateTime(timezone=True)),
        sa.Column("lab_name", sa.String(100)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()")),
    )
    op.create_index("ix_lab_results_patient_id", "lab_results", ["patient_id"])
    op.create_index("ix_lab_results_loinc_code", "lab_results", ["loinc_code"])

    # ── medications ───────────────────────────────────────────────────────────
    op.create_table(
        "medications",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("patient_id", sa.String(36), sa.ForeignKey("patients.id"), nullable=False),
        sa.Column("drug_name", sa.String(200), nullable=False),
        sa.Column("generic_name", sa.String(200)),
        sa.Column("rxnorm_code", sa.String(20)),
        sa.Column("ndc_code", sa.String(20)),
        sa.Column("dose_mg", sa.Float(), nullable=False),
        sa.Column("dose_unit", sa.String(20), server_default="mg"),
        sa.Column("frequency", sa.String(100), nullable=False),
        sa.Column("route", sa.String(50)),
        sa.Column("drug_class", sa.String(100)),
        sa.Column("indication", sa.String(200)),
        sa.Column("start_date", sa.DateTime(timezone=True), nullable=False),
        sa.Column("end_date", sa.DateTime(timezone=True)),
        sa.Column("is_active", sa.Boolean(), server_default="true"),
        sa.Column("prescriber_id", sa.String(36), sa.ForeignKey("users.id")),
        sa.Column("adherence_score", sa.Float()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()")),
    )
    op.create_index("ix_medications_patient_id", "medications", ["patient_id"])

    # ── ai_recommendations ────────────────────────────────────────────────────
    op.create_table(
        "ai_recommendations",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("patient_id", sa.String(36), sa.ForeignKey("patients.id"), nullable=False),
        sa.Column("model_version", sa.String(50), nullable=False),
        sa.Column("recommended_drug", sa.String(200), nullable=False),
        sa.Column("generic_name", sa.String(200)),
        sa.Column("dose_mg", sa.Float(), nullable=False),
        sa.Column("dose_unit", sa.String(20), server_default="mg"),
        sa.Column("frequency", sa.String(100)),
        sa.Column("titration_schedule", JSONB),
        sa.Column("confidence_score", sa.Float(), nullable=False),
        sa.Column("adr_probability", sa.Float()),
        sa.Column("adr_severity", sa.String(20)),
        sa.Column("risk_flags", JSONB),
        sa.Column("shap_values", JSONB),
        sa.Column("feature_importance", JSONB),
        sa.Column("natural_language_explanation", sa.Text()),
        sa.Column("alternative_drugs", JSONB),
        sa.Column("status", sa.String(20), server_default="pending"),
        sa.Column("doctor_id", sa.String(36), sa.ForeignKey("users.id")),
        sa.Column("doctor_notes", sa.Text()),
        sa.Column("reviewed_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()")),
    )
    op.create_index("ix_ai_recommendations_patient_id", "ai_recommendations", ["patient_id"])

    # ── wearable_readings ─────────────────────────────────────────────────────
    op.create_table(
        "wearable_readings",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("patient_id", sa.String(36), sa.ForeignKey("patients.id"), nullable=False),
        sa.Column("device_type", sa.String(100)),
        sa.Column("metric_type", sa.String(50)),
        sa.Column("value", sa.Float(), nullable=False),
        sa.Column("unit", sa.String(20)),
        sa.Column("is_anomaly", sa.Boolean(), server_default="false"),
        sa.Column("z_score", sa.Float()),
        sa.Column("recorded_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()")),
    )
    op.create_index("ix_wearable_readings_patient_id", "wearable_readings", ["patient_id"])

    # ── audit_logs ────────────────────────────────────────────────────────────
    op.create_table(
        "audit_logs",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id")),
        sa.Column("action", sa.String(100), nullable=False),
        sa.Column("resource_type", sa.String(100), nullable=False),
        sa.Column("resource_id", sa.String(36)),
        sa.Column("changes", JSONB),
        sa.Column("ip_address", sa.String(45)),
        sa.Column("user_agent", sa.String(500)),
        sa.Column("success", sa.Boolean(), server_default="true"),
        sa.Column("error_message", sa.Text()),
        sa.Column("timestamp", sa.DateTime(timezone=True), server_default=sa.text("NOW()")),
    )
    op.create_index("ix_audit_logs_user_id", "audit_logs", ["user_id"])
    op.create_index("ix_audit_logs_timestamp", "audit_logs", ["timestamp"])


def downgrade() -> None:
    op.drop_table("audit_logs")
    op.drop_table("wearable_readings")
    op.drop_table("ai_recommendations")
    op.drop_table("medications")
    op.drop_table("lab_results")
    op.drop_table("genomic_profiles")
    op.drop_table("patients")
    op.drop_table("users")
