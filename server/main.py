from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict this for production
    allow_methods=["*"],
    allow_headers=["*"],
)

model = SentenceTransformer("../../all-MiniLM-L6-v2")
metadata_dict = {}
metadata_embeddings = {}

class MetadataRequest(BaseModel):
    metadata: Dict[str, str]

class QueryRequest(BaseModel):
    query: str

def get_embedding(text):
    return model.encode(text)

@app.post("/set_metadata")
def set_metadata(data: MetadataRequest):
    global metadata_dict, metadata_embeddings
    metadata_dict = data.metadata
    metadata_embeddings = {
        col: get_embedding(f"{desc} : {col}") for col, desc in metadata_dict.items()
    }
    return {"message": "Metadata loaded successfully", "columns": list(metadata_dict.keys())}

@app.post("/match_column")
def match_column(data: QueryRequest):
    if not metadata_embeddings:
        return {"error": "Metadata not set. Please call /set_metadata first."}

    query_embedding = get_embedding(data.query)
    similarities = {
        col: float(cosine_similarity([query_embedding], [emb])[0][0])
        for col, emb in metadata_embeddings.items()
    }

    top_matches = sorted(similarities.items(), key=lambda x: x[1], reverse=True)[:3]
    result = [
        {
            "colAndDesc": f"{col} : {metadata_dict.get(col, '')}",
            "col":col,
            "score": round(score, 4)
        }
        for col, score in top_matches
    ]
    return {"query": data.query, "top_matches": result}
