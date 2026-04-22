from rest_framework import serializers
from .models import Field, FieldUpdate
from users.serializers import UserSerializer


class FieldUpdateSerializer(serializers.ModelSerializer):
    agent = UserSerializer(read_only=True)

    class Meta:
        model = FieldUpdate
        fields = ['id', 'stage', 'notes', 'agent', 'created_at']
        read_only_fields = ['agent', 'created_at']


class FieldSerializer(serializers.ModelSerializer):
    status = serializers.ReadOnlyField()
    agents = UserSerializer(many=True, read_only=True)
    agent_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        write_only=True,
        queryset=__import__('users.models', fromlist=['CustomUser']).CustomUser.objects.all(),
        source='agents'
    )
    latest_update = serializers.SerializerMethodField()

    class Meta:
        model = Field
        fields = [
            'id', 'name', 'crop_type', 'planting_date',
            'stage', 'status', 'agents', 'agent_ids',
            'latest_update', 'created_at'
        ]
        read_only_fields = ['status', 'created_at']

    def get_latest_update(self, obj):
        update = obj.updates.order_by('-created_at').first()
        if update:
            return FieldUpdateSerializer(update).data
        return None