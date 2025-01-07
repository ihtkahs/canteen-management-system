from django.db import models

class MenuItem(models.Model):
    item_id = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=100)
    price = models.FloatField()
    stock = models.PositiveIntegerField()

    def __str__(self):
        return self.name
