from django.shortcuts import render
from django.http import JsonResponse
from .models import MenuItem

def home(request):
    return render(request, 'index.html')

# API to get all menu items
def get_menu(request):
    query = request.GET.get('search', '')
    if query:
        items = MenuItem.objects.filter(name__icontains=query)  # Case-insensitive search by name
    else:
        items = MenuItem.objects.all()  # No search, return all items
    menu = [{"item_id": item.item_id, "name": item.name, "price": item.price, "stock": item.stock} for item in items]
    return JsonResponse({"menu": menu})

# API to update stock after a purchase
def update_stock(request):
    if request.method == "POST":
        import json
        data = json.loads(request.body)
        item_id = data.get("item_id")
        quantity = data.get("quantity")
        
        try:
            item = MenuItem.objects.get(item_id=item_id)
            if item.stock >= quantity:
                item.stock -= quantity
                item.save()
                return JsonResponse({"success": True, "message": "Stock updated."})
            else:
                return JsonResponse({"success": False, "message": "Insufficient stock."})
        except MenuItem.DoesNotExist:
            return JsonResponse({"success": False, "message": "Item not found."})
