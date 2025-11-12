from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    profile_image = serializers.ImageField(required=False)

    class Meta:
        model = User
        fields = ["username", "email", "password", "profile_image"]

    def create(self, validated_data):
        profile_image = validated_data.pop("profile_image", None)

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"]
        )

        profile = Profile.objects.create(user=user)
        if profile_image:
            profile.image = profile_image
            profile.save()
        return user


class ProfileSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Profile
        fields = ["user", "image"]
