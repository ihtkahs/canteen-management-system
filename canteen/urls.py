from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('menu/', views.get_menu, name='get_menu'),
    path('update-stock/', views.update_stock, name='update_stock'),
]
