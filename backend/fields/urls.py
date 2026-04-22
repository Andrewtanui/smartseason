from django.urls import path
from .views import (
    FieldListCreateView, FieldDetailView, FieldUpdateListCreateView, 
    DashboardView, AssignAgentsView
)

urlpatterns = [
    path('', FieldListCreateView.as_view(), name='field_list_create'),
    path('<int:pk>/', FieldDetailView.as_view(), name='field_detail'),
    path('<int:pk>/updates/', FieldUpdateListCreateView.as_view(), name='field_updates'),
    path('<int:pk>/assign-agents/', AssignAgentsView.as_view(), name='field_assign_agents'),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
]