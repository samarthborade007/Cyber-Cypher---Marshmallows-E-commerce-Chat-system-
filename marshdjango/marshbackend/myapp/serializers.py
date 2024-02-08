from rest_framework import serializers #translate complex data types, such as Django querysets and model instances, into Python data types that can then be easily rendered into JSON
from .models import Item

class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = '__all__'
