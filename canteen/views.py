from django.shortcuts import render
from django.http import JsonResponse
from .models import MenuItem
from decimal import Decimal

# Home view to display the index page
def home(request):
    return render(request, 'index.html')

# View to get the menu and search for items
def get_menu(request):
    query = request.GET.get('search', '')
    if query:
        items = MenuItem.objects.filter(name__icontains=query)  # Case-insensitive search by name
    else:
        items = MenuItem.objects.all()  # No search, return all items
    menu = [{"item_id": item.item_id, "name": item.name, "price": item.price, "stock": item.stock} for item in items]
    return JsonResponse({"menu": menu})

# View to process adding items to the cart and reducing stock
def add_to_cart(request):
    item_id = request.POST.get('item_id')
    quantity = int(request.POST.get('quantity'))
    try:
        item = MenuItem.objects.get(item_id=item_id)

        # Check if the item is in stock
        if item.stock >= quantity:
            item.stock -= quantity  # Reduce the stock by the quantity added to the cart
            item.save()  # Save the updated stock in the database
            total_price = item.price * quantity
            return JsonResponse({"message": "Item added to cart", "total_price": str(total_price), "item_name": item.name, "item_price": str(item.price), "stock_left": item.stock}, status=200)
        else:
            return JsonResponse({"error": "Insufficient stock available."}, status=400)
    except MenuItem.DoesNotExist:
        return JsonResponse({"error": "Item not found."}, status=404)
    
# View to update quantity in the cart
def update_cart_quantity(request):
    if request.method == 'POST':
        item_id = request.POST.get('item_id')
        quantity = int(request.POST.get('quantity'))
        try:
            item = MenuItem.objects.get(item_id=item_id)

            # Check if the item is in stock
            if item.stock >= quantity:
                # Update the cart item quantity
                item.stock -= quantity  # Reduce the stock
                item.save()  # Save the updated stock in the database

                total_price = item.price * quantity  # Calculate new total price
                return JsonResponse({
                    "message": "Quantity updated successfully", 
                    "item_price": str(item.price), 
                    "total_price": str(total_price),
                    "stock_left": item.stock
                }, status=200)
            else:
                return JsonResponse({"error": "Insufficient stock available."}, status=400)
        except MenuItem.DoesNotExist:
            return JsonResponse({"error": "Item not found."}, status=404)
    else:
        return JsonResponse({"error": "Invalid request method."}, status=400)

# View to generate the bill
def generate_bill(request):
    cart = request.session.get('cart', [])
    total_amount = sum(item['total'] for item in cart)
    bill_items = [
        {"name": item['item_name'], "quantity": item['quantity'], "price": item['item_price'], "total": item['total']}
        for item in cart
    ]
    # Clear the cart after generating the bill
    request.session['cart'] = []
    return JsonResponse({"bill_items": bill_items, "total_amount": str(total_amount)})
