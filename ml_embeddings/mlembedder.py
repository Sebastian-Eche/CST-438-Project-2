# from sentence_transformers import SentenceTransformer
import json
import sys
import math
import requests
import os

api_key = os.environ.get("HUGGINGFACE_API")
API_URL = "https://router.huggingface.co/hf-inference/pipeline/sentence-similarity/sentence-transformers/all-MiniLM-L6-v2"
headers = {"Authorization": f"Bearer {api_key}"}

def query(rank, rank1):

    payload = {
        "inputs" : {
            "source_sentence": rank,
            "sentences": [rank1]
        }
    }

    print(json.dumps(payload))

    response = requests.post(API_URL, headers=headers, json=payload)

    print(f"Response {response.status_code}")
    return response.json()


def dot_product(A,B):
    dot = 0
    for num, num2 in zip(A, B):
        dot += num * num2
    return dot

def get_magnitude(A):
    magnitude = 0
    for num in A:
        magnitude += num**2
    
    return math.sqrt(magnitude)

def cosine_similarity(A, B):
    dot = dot_product(A, B)
    magnitude_a = get_magnitude(A)
    magnitude_b = get_magnitude(B)

    return dot / (magnitude_a * magnitude_b)

def similarity_list(tier_string, tier1_string):
    similarity = []
    current_rank = tier_string.split("^")
    current_rank1 = tier1_string.split("^")
    for rank, rank1 in zip(current_rank, current_rank1):
        # embedding = model.encode([rank])[0]
        # embedding1 = model.encode([rank1])[0]
        result = query(rank,rank1)
        similarity.append(result[0])

    return average_similarity(similarity)

        

def average_similarity(similarity_list):
    return sum(similarity_list) / len(similarity_list)


# model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
tier = sys.argv[1]
tier1 = sys.argv[2]
# embedding = model.encode([tier])[0]
# embedding1 = model.encode([tier1])[0]
# average = similarity_list(tier, tier1)

# result = query(tier, tier1)

print(similarity_list(tier, tier1))

# print(average)



