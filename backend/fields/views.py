from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Field, FieldUpdate
from .serializers import FieldSerializer, FieldUpdateSerializer
from .permissions import IsAdmin, IsAdminOrAssignedAgent
from users.models import CustomUser


class FieldListCreateView(generics.ListCreateAPIView):
    serializer_class = FieldSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdmin()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        queryset = Field.objects.all().prefetch_related('agents', 'updates')
        
        if user.role != 'admin':
            queryset = user.assigned_fields.all().prefetch_related('agents', 'updates')
        
        # Admin can filter by agent_id
        agent_id = self.request.query_params.get('agent_id')
        if user.role == 'admin' and agent_id:
            queryset = queryset.filter(agents__id=agent_id)
            
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class AssignAgentsView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, pk):
        field = get_object_or_404(Field, pk=pk)
        agent_ids = request.data.get('agent_ids', [])
        
        if not isinstance(agent_ids, list):
            return Response(
                {"error": "agent_ids must be a list"},
                status=status.HTTP_400_BAD_REQUEST
            )

        agents = CustomUser.objects.filter(id__in=agent_ids, role='agent')
        
        if len(agents) != len(agent_ids):
            found_ids = set(agents.values_list('id', flat=True))
            missing_ids = set(agent_ids) - found_ids
            return Response(
                {"error": f"Agents with IDs {list(missing_ids)} not found or are not agents"},
                status=status.HTTP_400_BAD_REQUEST
            )

        field.agents.set(agents)
        return Response(FieldSerializer(field).data)


class FieldDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FieldSerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAdmin()]
        return [IsAdminOrAssignedAgent()]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Field.objects.all().prefetch_related('agents', 'updates')
        return user.assigned_fields.all().prefetch_related('agents', 'updates')


class FieldUpdateListCreateView(APIView):
    permission_classes = [IsAdminOrAssignedAgent]

    def get(self, request, pk):
        field = get_object_or_404(Field, pk=pk)
        self.check_object_permissions(request, field)
        updates = field.updates.order_by('-created_at')
        serializer = FieldUpdateSerializer(updates, many=True)
        return Response(serializer.data)

    def post(self, request, pk):
        field = get_object_or_404(Field, pk=pk)
        self.check_object_permissions(request, field)
        serializer = FieldUpdateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(agent=request.user, field=field)
            field.stage = serializer.validated_data['stage']
            field.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role == 'admin':
            fields = Field.objects.all().prefetch_related('agents', 'updates')
        else:
            fields = user.assigned_fields.all().prefetch_related('agents', 'updates')

        total = fields.count()
        status_breakdown = {'active': 0, 'at_risk': 0, 'completed': 0}
        stage_breakdown = {'planted': 0, 'growing': 0, 'ready': 0, 'harvested': 0}

        for f in fields:
            status_breakdown[f.status] += 1
            stage_breakdown[f.stage] += 1

        return Response({
            'total_fields': total,
            'status_breakdown': status_breakdown,
            'stage_breakdown': stage_breakdown,
        })