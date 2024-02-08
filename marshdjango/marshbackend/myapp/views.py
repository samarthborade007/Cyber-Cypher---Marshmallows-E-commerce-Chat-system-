from django.shortcuts import render
from rest_framework import viewsets # CREATE API ENDPOINDS HERE later add how you would normally code in python make sure reponse is correct request from front end , and RESULT is impt
from .models import Item
from .serializers import ItemSerializer
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view, permission_classes
from django.http import JsonResponse
from rest_framework.response import Response # Import DRF's Response

class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
# views.py

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def add_numbers(request):
    if request.method == 'POST':
        # Use request.data instead of request.POST for DRF
        num1 = request.data.get('num1')
        num2 = request.data.get('num2')

        # Ensure num1 and num2 are not None and can be converted to float
        try:
            num1 = float(num1)
            num2 = float(num2)
        except (TypeError, ValueError) as e:
            return Response({'error': 'Invalid input, num1 and num2 must be real numbers.'}, status=400)

        result = num1 + num2
        return Response({'result': result})  # Using DRF's Response for consistency
    else:
        return Response({'error': 'Invalid request method'}, status=400)
