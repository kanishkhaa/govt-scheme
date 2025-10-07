import pandas as pd

# Load the pickle file
df = pd.read_pickle("schemes_with_embeddings.pkl")

# Show basic info
print("Columns:", df.columns.tolist())
print("Number of schemes:", len(df))

# Show first 5 rows
print("\nSample data:")
print(df.head())

# Check if embeddings column exists
if "embeddings" in df.columns:
    print("\nEach embedding length:", len(df["embeddings"].iloc[0]))
