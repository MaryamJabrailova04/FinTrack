from rest_framework import serializers
from .models import Subscription
from expenses.models import Category


class SubscriptionSerializer(serializers.ModelSerializer):
    category = serializers.SerializerMethodField(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True, allow_null=True, required=False
    )

    class Meta:
        model = Subscription
        fields = ['id', 'name', 'price', 'category', 'category_id', 'start_date', 'monthly_day', 'notify_email', 'is_active']

    def get_category(self, obj):
        if obj.category:
            return {"id": obj.category.id, "name": obj.category.name}
        return None


