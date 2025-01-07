from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('menu/', views.get_menu, name='get_menu'),
    path('add_to_cart/', views.add_to_cart, name='add_to_cart'),
    path('generate_bill/', views.generate_bill, name='generate_bill'),
]
