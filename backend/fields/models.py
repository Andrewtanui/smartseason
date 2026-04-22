from django.db import models
from django.utils import timezone
from datetime import timedelta


class Field(models.Model):
    STAGE_CHOICES = [
        ('planted', 'Planted'),
        ('growing', 'Growing'),
        ('ready', 'Ready'),
        ('harvested', 'Harvested'),
    ]

    name = models.CharField(max_length=100)
    crop_type = models.CharField(max_length=100)
    planting_date = models.DateField()
    stage = models.CharField(max_length=20, choices=STAGE_CHOICES, default='planted')
    agents = models.ManyToManyField(
        'users.CustomUser',
        related_name='assigned_fields',
        blank=True
    )
    created_by = models.ForeignKey(
        'users.CustomUser',
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_fields'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def status(self):
        if self.stage == 'harvested':
            return 'completed'
        latest_update = self.updates.order_by('-created_at').first()
        if not latest_update:
            return 'at_risk'
        if (timezone.now() - latest_update.created_at) > timedelta(days=7):
            return 'at_risk'
        return 'active'

    def __str__(self):
        return f"{self.name} ({self.crop_type})"


class FieldUpdate(models.Model):
    field = models.ForeignKey(Field, on_delete=models.CASCADE, related_name='updates')
    agent = models.ForeignKey(
        'users.CustomUser',
        on_delete=models.SET_NULL,
        null=True,
        related_name='field_updates'
    )
    stage = models.CharField(max_length=20)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.field.name} update by {self.agent} at {self.created_at}"