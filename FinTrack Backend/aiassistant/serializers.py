from typing import Any
from rest_framework import serializers


class ChatRequestSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=2000)


class ReceiptParseResponseSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    parsed = serializers.JSONField(allow_null=True)
    status = serializers.CharField()
    error = serializers.CharField(allow_blank=True)


class ReceiptCommitItem(serializers.Serializer):
    name = serializers.CharField()
    price = serializers.DecimalField(max_digits=12, decimal_places=2)
    category = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    date = serializers.DateField(required=False, allow_null=True)
    note = serializers.CharField(required=False, allow_blank=True)


class ReceiptCommitRequest(serializers.Serializer):
    job_id = serializers.IntegerField()
    items = serializers.ListField(child=ReceiptCommitItem())

