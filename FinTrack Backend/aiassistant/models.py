from django.db import models
from django.conf import settings

# Create your models here.


class ReceiptImport(models.Model):
    STATUS_UPLOADED = 'uploaded'
    STATUS_PARSED = 'parsed'
    STATUS_IMPORTED = 'imported'
    STATUS_ERROR = 'error'

    STATUS_CHOICES = [
        (STATUS_UPLOADED, 'Uploaded'),
        (STATUS_PARSED, 'Parsed'),
        (STATUS_IMPORTED, 'Imported'),
        (STATUS_ERROR, 'Error'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='receipt_imports')
    file = models.FileField(upload_to='receipts/%Y/%m/%d/')
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default=STATUS_UPLOADED)
    parsed = models.JSONField(blank=True, null=True)
    error = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['-created_at', '-id']
