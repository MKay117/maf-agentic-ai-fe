import streamlit as st
import requests
import base64
import json
import random
import string

# -------------------------------
# Page & App Title
# -------------------------------
st.set_page_config(page_title="YesARC Mate", layout="wide")

st.title("💬 YesARC Mate")
st.markdown("Provide your inputs below to send a review request to the backend.")

# -------------------------------
# Backend endpoint
# -------------------------------
# Normal BE Web service url
# API_URL = "https://yes-bank-demo-agent-be-degbfneabtfbcdgu.southindia-01.azurewebsites.net/review"

# RAG BE Web service url (active)
API_URL = "http://localhost:8000/review"

# -------------------------------
# Helpers
# -------------------------------
def generate_id(length: int = 8) -> str:
    """
    Generate an ID using letters, digits, and special chars.
    Charset includes: A-Za-z0-9!@#$%_-
    """
    alphabet = string.ascii_letters + string.digits + "!@#$%_-"
    return "".join(random.choice(alphabet) for _ in range(length))

def read_json_file(uploaded_file) -> dict:
    """
    Safely parse an uploaded JSON file and return a dict.
    If the JSON root is not a dict, return it under the filename key.
    If parsing fails, include an error marker for visibility.
    """
    if uploaded_file is None:
        return {}
    try:
        data = json.loads(uploaded_file.read().decode("utf-8"))
        uploaded_file.seek(0)  # reset pointer
        if isinstance(data, dict):
            return data
        else:
            return {uploaded_file.name: data}
    except Exception as e:
        try:
            uploaded_file.seek(0)
        except Exception:
            pass
        return {uploaded_file.name: {"__error__": f"Invalid JSON: {e}"}}

def image_to_base64(first_image_file) -> str:
    """
    Convert the first uploaded image to base64 string (no data: prefix).
    Return empty string if no image provided.
    """
    if not first_image_file:
        return ""
    content = first_image_file.read()
    first_image_file.seek(0)
    print(base64.b64encode(content).decode("utf-8"))
    return base64.b64encode(content).decode("utf-8")

def post_json(url: str, payload: dict, timeout: int = 30):
    """
    POST JSON payload to backend (application/json).
    """
    headers = {"Content-Type": "application/json"}
    resp = requests.post(url, headers=headers, json=payload, timeout=timeout)
    resp.raise_for_status()
    try:
        return resp.json()
    except Exception:
        return {"text": resp.text, "status_code": resp.status_code}

# -------------------------------
# Inputs
# -------------------------------
text_prompt = st.text_area("📝 Enter your text prompt", height=150)

json_file = st.file_uploader("📄 Upload a JSON file (metadata)", type=["json"])

image_files = st.file_uploader(
    "🖼️ Upload image(s) (first image will be sent as diagram_base64)",
    type=["png", "jpg", "jpeg"],
    accept_multiple_files=True
)

# -------------------------------
# Submit
# -------------------------------
if st.button("🔍 Submit for Review"):
    if not text_prompt.strip() and not json_file and not image_files:
        st.warning("Please provide at least one input (prompt, JSON, or image).")
    else:
        with st.spinner("Processing your request..."):
            # Generate IDs
            req_id = generate_id(8)     # Per requirement: 8-char alphanumeric + special
            user_id = generate_id(8)    # Auto-generated user ID (no user input)

            # Build metadata
            metadata = {}
            metadata.update(read_json_file(json_file))  # merge uploaded JSON (if any)
            metadata["prompt"] = text_prompt
            metadata["req_id"] = req_id

            # diagram_base64 from the first image (if any)
            diagram_b64 = ""
            if image_files and len(image_files) > 0:
                diagram_b64 = image_to_base64(image_files[0])

            # Final payload per your schema
            payload = {
                "metadata": metadata,
                "diagram_base64": diagram_b64,
                "user_id": user_id
            }

            # Show payload preview (optional)
            with st.expander("🔎 View request payload"):
                st.json(payload)

            try:
                result = post_json(API_URL, payload, timeout=45)
                st.success("✅ Review request sent successfully!")
                st.markdown("### 🧾 Backend Response")
                st.json(result)
            except requests.exceptions.Timeout:
                st.error("❌ Error: Request timed out.")
            except requests.exceptions.HTTPError as e:
                st.error(f"❌ HTTP error: {e}")
                if e.response is not None:
                    try:
                        st.code(e.response.text, language="json")
                    except Exception:
                        pass
            except requests.exceptions.RequestException as e:
                st.error(f"❌ Network error: {e}")
            except Exception as e:
                pass


# import streamlit as st
# import requests
# from dotenv import load_dotenv
# import os

# load_dotenv()
# API_URL = os.getenv("API_URL", "http://localhost:8000/orchestrate")

# st.title("AI Review – Sizing, Tech Stack, Infra Architecture")

# prompt = st.text_area("Prompt / context for the review", placeholder="E.g., Review proposed migration plan...")
# json_file = st.file_uploader("Upload JSON (sizing + tech stack + questionnaires)", type=["json"])
# image_file = st.file_uploader("Upload architecture diagram (PNG/JPG)", type=["png", "jpg", "jpeg"])

# if st.button("Run Review", type="primary", disabled=not(prompt and json_file and image_file)):
#     with st.spinner("Submitting to backend..."):
#         files = {
#             "sizing_json": (json_file.name, json_file.getvalue(), "application/json"),
#             "architecture_image": (image_file.name, image_file.getvalue(), image_file.type or "image/png"),
#         }
#         data  = {"prompt": prompt}
#         resp = requests.post(API_URL, data=data, files=files, timeout=120)
#         if resp.ok:
#             result = resp.json()
#             st.subheader("Sizing Review")
#             st.write(result["sizing_review"]["content"])
#             st.subheader("Tech Stack Review")
#             st.write(result["tech_stack_review"]["content"])
#             st.subheader("Infra Architecture Review")
#             st.write(result["infra_review"]["content"])
#             st.subheader("Final Summary")
#             st.write(result["summary"]["content"])
#         else:
#             st.error(f"Request failed: {resp.status_code} – {resp.text}")