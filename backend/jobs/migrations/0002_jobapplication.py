import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("candidates", "0001_initial"),
        ("jobs", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="JobApplication",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("applied_at", models.DateTimeField(auto_now_add=True)),
                (
                    "candidate",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="applications",
                        to="candidates.candidateprofile",
                    ),
                ),
                (
                    "job",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="applications",
                        to="jobs.jobposting",
                    ),
                ),
            ],
            options={
                "ordering": ["-applied_at"],
            },
        ),
        migrations.AddConstraint(
            model_name="jobapplication",
            constraint=models.UniqueConstraint(
                fields=("job", "candidate"),
                name="unique_application_per_job_candidate",
            ),
        ),
    ]
