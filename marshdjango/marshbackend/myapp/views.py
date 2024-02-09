from django.shortcuts import render
 # CREATE API ENDPOINDS HERE later add how you would normally code in python make sure reponse is correct request from front end , and RESULT is impt
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view, permission_classes
from django.http import JsonResponse
from rest_framework.response import Response # Import DRF's Response
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import pandas as pd
import joblib
from tensorflow.keras.models import load_model
from tensorflow.keras.models import Model
import pickle
from sklearn.metrics.pairwise import cosine_similarity
import json
from django.conf import settings

# myapp/views.py
from rest_framework import viewsets
from .models import Item
from .serializers import ItemSerializer

class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer

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



from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
import pandas as pd
import joblib
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences
import pickle
from sklearn.metrics.pairwise import cosine_similarity

autoencoder = load_model('../../marshDeepLearning/Code/Models/autoencoder_model.h5')
encoder_model = Model(inputs=autoencoder.input, outputs=autoencoder.layers[-3].output)
with open('../../marshDeepLearning/Code/Models/tokenizer.pickle', 'rb') as handle:
    tokenizer = pickle.load(handle)
label_encoders = joblib.load('../../marshDeepLearning/Code/Models/label_encoders.joblib')
scaler = joblib.load('../../marshDeepLearning/Code/Models/scaler.joblib')
data = pd.read_csv('../../marshDeepLearning/BigBasket Products.csv')

# Load tokenizer and create text_padded
with open('../../marshDeepLearning/Code/Models/tokenizer.pickle', 'rb') as handle:
    tokenizer = pickle.load(handle)
text_sequences = tokenizer.texts_to_sequences(data['description'].astype(str))
text_padded = pad_sequences(text_sequences, maxlen=100)  # Ensure this maxlen is same as used during model training

# Load autoencoder and create encoder model
autoencoder = load_model('../../marshDeepLearning/Code/Models/autoencoder_model.h5')
encoder_model = Model(inputs=autoencoder.input, outputs=autoencoder.layers[-3].output)

# Generate embeddings
item_embeddings = encoder_model.predict(text_padded)

# Compute cosine similarity matrix
similarity_matrix = cosine_similarity(item_embeddings)



def save_user_input(product_name):
    file_path = settings.BASE_DIR / 'user_input.json'
    input_data = {'product_name': product_name}
    with open(file_path, 'w') as json_file:
        json.dump(input_data, json_file)


# Function to recommend items based on cosine similarity
def recommend_items(item_id, similarity_matrix, items, label_encoders, top_k=3):
    item_category = items.iloc[item_id]['category']
    similarity_scores = list(enumerate(similarity_matrix[item_id]))
    similarity_scores = sorted(similarity_scores, key=lambda x: x[1], reverse=True)
    filtered_indices = []
    for idx, score in similarity_scores:
        if items.iloc[idx]['category'] == item_category and idx != item_id:
            filtered_indices.append(idx)
        if len(filtered_indices) == top_k:
            break
    recommended_items = items.iloc[filtered_indices]
    for feature in ['category', 'sub_category', 'brand']:
        recommended_items[feature] = label_encoders[feature].inverse_transform(recommended_items[feature])
    recommended_items_sorted = recommended_items.sort_values(by='rating', ascending=False)
    return recommended_items_sorted

# Function to get recommendations for a specific product
def get_recommendations_for_product(product_name, data, similarity_matrix, label_encoders, top_k=3):
    product_indices = data[data['product'].str.contains(product_name, case=False, na=False)].index
    if not product_indices.empty:
        product_index = product_indices[0]
        recommended_items = recommend_items(product_index, similarity_matrix, data, label_encoders, top_k=top_k)
        return recommended_items[['product', 'category', 'sub_category', 'brand', 'rating', 'sale_price']]
    else:
        return "No product found matching name '{}'".format(product_name)

# Django view to handle recommendations API endpoint
@api_view(['POST'])
@permission_classes([AllowAny])
def get_recommendations(request):
    product_name = request.data.get('product_name')
    if not product_name:
        return Response({'error': 'Product name not provided'}, status=400)
    
    try:
        recommendations = get_recommendations_for_product(product_name, data, similarity_matrix, label_encoders, top_k=3)
        if isinstance(recommendations, str):
            return Response({'error': recommendations}, status=404)
        return Response({
            'products': recommendations['product'].tolist(),
            'sale_prices': recommendations['sale_price'].tolist()
        })
    except Exception as e:
        return Response({'error': str(e)}, status=500)
