from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'role']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            role=validated_data.get('role', 'agent')
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    assigned_fields = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'is_active', 'assigned_fields']

    def get_assigned_fields(self, obj):
        return [
            {'id': f.id, 'name': f.name} 
            for f in obj.assigned_fields.all()
        ]