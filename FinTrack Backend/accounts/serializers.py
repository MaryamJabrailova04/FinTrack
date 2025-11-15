from rest_framework import serializers
from django.contrib.auth import get_user_model


User = get_user_model()


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(min_length=6, write_only=True)
    name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    username = serializers.CharField(max_length=150, required=False, allow_blank=True)

    def validate(self, attrs):
        email = attrs['email'].lower()
        username = attrs.get('username') or email
        if User.objects.filter(username=username).exists():
            raise serializers.ValidationError({"username": "Username already exists"})
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError({"email": "Email already registered"})
        attrs['email'] = email
        attrs['username'] = username
        return attrs


