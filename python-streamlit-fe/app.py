# import streamlit as st
# import requests
# import base64
# import json
# import time
# import random
# import string

# # -------------------------------
# # Page & App Title
# # -------------------------------
# st.set_page_config(page_title="YesARC Mate", layout="wide")

# st.title("💬 YesARC Mate")
# st.markdown("Provide your inputs below to send a review request to the backend.")

# # -------------------------------
# # Backend endpoint
# # -------------------------------
# API_URL = "http://localhost:8000/review"

# # -------------------------------
# # Helper Functions
# # -------------------------------

# def read_json_file(uploaded_file) -> dict:
#     """
#     Safely parse an uploaded JSON file and return a dict.
#     """
#     if uploaded_file is None:
#         return {}
#     try:
#         data = json.loads(uploaded_file.read().decode("utf-8"))
#         uploaded_file.seek(0)
#         if isinstance(data, dict):
#             return data
#         else:
#             return {uploaded_file.name: data}
#     except Exception as e:
#         try:
#             uploaded_file.seek(0)
#         except:
#             pass
#         return {uploaded_file.name: {"__error__": f"Invalid JSON: {e}"}}


# def image_to_base64(first_image_file) -> str:
#     """Convert the first uploaded image to base64 string."""
#     if not first_image_file:
#         return ""
#     content = first_image_file.read()
#     first_image_file.seek(0)
#     return base64.b64encode(content).decode("utf-8")


# # -------------------------------
# # Auto ID generator
# # -------------------------------
# def generate_id(n=8):
#     return ''.join(random.choices(string.ascii_letters + string.digits, k=n))


# # -------------------------------
# # Inputs
# # -------------------------------
# text_prompt = st.text_area("📝 Enter your text prompt", height=150)

# json_file = st.file_uploader("📄 Upload a JSON file (metadata)", type=["json"])

# image_files = st.file_uploader(
#     "🖼️ Upload image(s) (first image will be sent as diagram_base64)",
#     type=["png", "jpg", "jpeg"],
#     accept_multiple_files=True
# )

# # -------------------------------
# # Submit Button
# # -------------------------------
# if st.button("🔍 Submit for Review"):

#     if not text_prompt.strip() and not json_file and not image_files:
#         st.warning("Please provide at least one input (prompt, JSON, or image).")

#     else:
#         with st.spinner("Processing your request..."):

#             req_id = generate_id(8)

#             # Build metadata
#             metadata = {}
#             metadata.update(read_json_file(json_file))
#             metadata["prompt"] = text_prompt
#             metadata["req_id"] = req_id

#             # Base64 image
#             diagram_b64 = ""
#             if image_files and len(image_files) > 0:
#                 diagram_b64 = image_to_base64(image_files[0])

#             # Final payload
#             payload = {
#                 "metadata": metadata,
#                 "diagram_base64": diagram_b64
#             }

#             # Payload preview
#             with st.expander("🔎 View request payload"):
#                 st.json(payload)

#             # Normal POST (no streaming)
#             try:
#                 response = requests.post(API_URL, json=payload, timeout=60)
#                 response.raise_for_status()

#                 # Try to parse JSON, else show text
#                 try:
#                     resp_from_be = response.json()
#                     status = resp_from_be.get("status")
#                     st.markdown("### 📡 Backend Response")
#                     # st.json(response.json())
#                     if status == "success":
#                         st.markdown(resp_from_be.get("last_agent_summary"))
#                     else:
#                         st.markdown(resp_from_be.get("message"))
#                 except Exception:
#                     st.markdown("### 📡 Backend Response (text)")
#                     st.code(response.text)

#                 st.success("✅ Request completed")

#             except requests.exceptions.Timeout:
#                 st.error("❌ Error: Request timed out.")
#             except requests.exceptions.HTTPError as e:
#                 st.error(f"❌ HTTP error: {e}")
#                 if e.response is not None:
#                     st.code(e.response.text, language="json")
#             except requests.exceptions.RequestException as e:
#                 st.error(f"❌ Network error: {e}")
#             except Exception as e:
#                 st.error(f"❌ Unexpected error: {e}")

# import streamlit as st
# import requests
# import base64
# import json
# import time
# import random
# import string

# # -------------------------------
# # Page & App Title
# # -------------------------------
# st.set_page_config(page_title="YesARC Mate", layout="wide")

# # Centered title with custom styling
# st.markdown(
#     """
#     <h1 style='text-align: center; font-weight: bold; color: royalblue;'>
#         <span style="color: red;">🖥️</span> YesARC Mate
#     </h1>
#     """,
#     unsafe_allow_html=True
# )

# # -------------------------------
# # Backend endpoint
# # -------------------------------
# API_URL = "http://localhost:8000/review"

# # -------------------------------
# # Helper Functions
# # -------------------------------

# def read_json_file(uploaded_file) -> dict:
#     """Safely parse an uploaded JSON file and return a dict."""
#     if uploaded_file is None:
#         return {}
#     try:
#         data = json.loads(uploaded_file.read().decode("utf-8"))
#         uploaded_file.seek(0)
#         if isinstance(data, dict):
#             return data
#         else:
#             return {uploaded_file.name: data}
#     except Exception as e:
#         try:
#             uploaded_file.seek(0)
#         except:
#             pass
#         return {uploaded_file.name: {"__error__": f"Invalid JSON: {e}"}}


# def image_to_base64(first_image_file) -> str:
#     """Convert the first uploaded image to base64 string."""
#     if not first_image_file:
#         return ""
#     content = first_image_file.read()
#     first_image_file.seek(0)
#     return base64.b64encode(content).decode("utf-8")


# # -------------------------------
# # Auto ID generator
# # -------------------------------
# def generate_id(n=8):
#     return ''.join(random.choices(string.ascii_letters + string.digits, k=n))


# # -------------------------------
# # Inputs (UI Updated)
# # -------------------------------
# json_file = st.file_uploader(
#     "📄 Upload the architecture details in JSON format for review",
#     type=["json"]
# )

# # -------------------------------
# # Submit Button
# # -------------------------------
# if st.button("🔍 Submit for Review"):

#     if not json_file:
#         st.warning("Please upload a JSON file.")
#     else:
#         with st.spinner("Processing your request..."):

#             req_id = generate_id(8)

#             # Build metadata
#             metadata = {}
#             metadata.update(read_json_file(json_file))
#             metadata["req_id"] = req_id
#             metadata["prompt"] = ""  # Keeping original field for compatibility

#             # Since images are removed from UI, send blank
#             diagram_b64 = ""

#             # Final payload
#             payload = {
#                 "metadata": metadata,
#                 "diagram_base64": diagram_b64
#             }

#             # Payload preview
#             with st.expander("🔎 View request payload"):
#                 st.json(payload)

#             # Normal POST (no streaming)
#             try:
#                 response = requests.post(API_URL, json=payload, timeout=60)
#                 response.raise_for_status()

#                 # Try to parse JSON, else show text
#                 try:
#                     resp_from_be = response.json()
#                     status = resp_from_be.get("status")
#                     st.markdown("### 📡 Backend Response")
#                     if status == "success":
#                         st.markdown(resp_from_be.get("last_agent_summary"))
#                     else:
#                         st.markdown(resp_from_be.get("message"))
#                 except Exception:
#                     st.markdown("### 📡 Backend Response (text)")
#                     st.code(response.text)

#                 st.success("✅ Request completed")

#             except requests.exceptions.Timeout:
#                 st.error("❌ Error: Request timed out.")
#             except requests.exceptions.HTTPError as e:
#                 st.error(f"❌ HTTP error: {e}")
#                 if e.response is not None:
#                     st.code(e.response.text, language="json")
#             except requests.exceptions.RequestException as e:
#                 st.error(f"❌ Network error: {e}")
#             except Exception as e:
#                 st.error(f"❌ Unexpected error: {e}")

import streamlit as st
import requests
import base64
import json
import time
import random
import string

# -------------------------------
# Page & App Title
# -------------------------------
st.set_page_config(page_title="YesARC Mate", layout="wide")

# Centered title with custom styling
st.markdown(
    """
    <h1 style='text-align: center; font-weight: bold; color: royalblue;'>
        <span style="color: red;">🖥️</span> YesARC Mate
    </h1>
    """,
    unsafe_allow_html=True
)

# -------------------------------
# Backend endpoint
# -------------------------------
API_URL = "http://localhost:8000/review"

# -------------------------------
# Helper Functions
# -------------------------------

def read_json_file(uploaded_file) -> dict:
    """Safely parse an uploaded JSON file and return a dict."""
    if uploaded_file is None:
        return {}
    try:
        data = json.loads(uploaded_file.read().decode("utf-8"))
        uploaded_file.seek(0)
        if isinstance(data, dict):
            return data
        else:
            return {uploaded_file.name: data}
    except Exception as e:
        try:
            uploaded_file.seek(0)
        except:
            pass
        return {uploaded_file.name: {"__error__": f"Invalid JSON: {e}"}}


def image_to_base64(first_image_file) -> str:
    """Convert the first uploaded image to base64 string."""
    if not first_image_file:
        return ""
    content = first_image_file.read()
    first_image_file.seek(0)
    return base64.b64encode(content).decode("utf-8")


# -------------------------------
# Auto ID generator
# -------------------------------
def generate_id(n=8):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=n))


# -------------------------------
# Inputs (UI Updated)
# -------------------------------
json_file = st.file_uploader(
    "📄 Upload the architecture details in JSON format for review",
    type=["json"]
)

# -------------------------------
# Submit Button
# -------------------------------
if st.button("🔍 Submit for Review"):

    if not json_file:
        st.warning("Please upload a JSON file.")
    else:
        with st.spinner("Processing your request..."):

            req_id = generate_id(8)

            # Build metadata
            metadata = {}
            metadata.update(read_json_file(json_file))
            metadata["req_id"] = req_id
            metadata["prompt"] = ""  # Keeping original field for compatibility

            # Since images are removed from UI, send blank
            diagram_b64 = ""

            # Final payload
            payload = {
                "metadata": metadata,
                "diagram_base64": diagram_b64
            }

            # Payload preview
            with st.expander("🔎 View request payload"):
                st.json(payload)

            # Normal POST (no streaming)
            try:
                response = requests.post(API_URL, json=payload, timeout=60)
                response.raise_for_status()

                # Try to parse JSON, else show text
                try:
                    resp_from_be = response.json()
                    st.markdown("### 📡 Backend Response")

                    status = resp_from_be.get("status")
                    review_id = resp_from_be.get("review_id")

                    # Show review id if available
                    if review_id:
                        st.markdown(f"**🧾 Review ID:** `{review_id}`")

                    if status == "success":
                        # New contract from formatting agent:
                        # { review_id, status: "success", summary: "<final text>" }
                        summary = resp_from_be.get("summary") or resp_from_be.get("last_agent_summary")

                        st.success("✅ Architecture review completed successfully.")
                        st.markdown("#### 📝 Executive Summary")
                        if summary:
                            st.markdown(summary)
                        else:
                            st.info("No summary text returned from backend.")

                    elif status == "failure":
                        # Failure contract:
                        # { review_id, status: "failure", stage, issues, message }
                        message = resp_from_be.get("message", "Review failed due to unknown reasons.")
                        issues = resp_from_be.get("issues", [])
                        stage = resp_from_be.get("stage")

                        st.error("❌ Review could not be completed.")
                        if stage:
                            st.markdown(f"**Failure Stage:** `{stage}`")
                        st.markdown("#### ❗ Failure Message")
                        st.markdown(message)

                        if issues:
                            st.markdown("#### 🧩 Detected Issues")
                            for idx, issue in enumerate(issues, start=1):
                                level = issue.get("level", "ERROR")
                                field = issue.get("field", "")
                                msg = issue.get("message", str(issue))
                                st.markdown(f"- **[{level}]** `{field}` – {msg}")

                    else:
                        # Fallback for any unexpected shape
                        st.warning("Received unexpected response format from backend.")
                        st.json(resp_from_be)

                    # Raw response for debugging
                    with st.expander("🧾 View raw backend response"):
                        st.json(resp_from_be)

                    st.success("✅ Request completed")

                except Exception:
                    st.markdown("### 📡 Backend Response (text)")
                    st.code(response.text)

                # End of try JSON parse

            except requests.exceptions.Timeout:
                st.error("❌ Error: Request timed out.")
            except requests.exceptions.HTTPError as e:
                st.error(f"❌ HTTP error: {e}")
                if e.response is not None:
                    with st.expander("🔧 Backend error body"):
                        st.code(e.response.text, language="json")
            except requests.exceptions.RequestException as e:
                st.error(f"❌ Network error: {e}")
            except Exception as e:
                st.error(f"❌ Unexpected error: {e}")
