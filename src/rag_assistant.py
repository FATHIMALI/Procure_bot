import re
import ollama
from qdrant_client import QdrantClient

from src.config import (
    EMBEDDING_MODEL,
    LLM_MODEL,
    QDRANT_HOST,
    QDRANT_PORT,
    COLLECTION_NAME,
)


# ============================================================
# RETRIEVE DOCUMENTS
# ============================================================

def retrieve_documents(query, top_k=5):

    client = QdrantClient(
        host=QDRANT_HOST,
        port=QDRANT_PORT
    )

    # ========================================================
    # EXACT PO NUMBER DETECTION
    # ========================================================

    po_match = re.search(
        r"\bPO-\d{5}\b",
        query.upper()
    )

    # ========================================================
    # EXACT PO RETRIEVAL
    # ========================================================

    if po_match:

        po_id = po_match.group(0)

        print()
        print(f"Exact PO detected: {po_id}")

        search_result = client.scroll(
            collection_name=COLLECTION_NAME,
            scroll_filter={
                "must": [
                    {
                        "key": "po_id",
                        "match": {
                            "value": po_id
                        }
                    }
                ]
            },
            limit=top_k,
            with_payload=True
        )

        points = search_result[0]

        if points:

            print(f"Exact PO retrieved: {po_id}")

            return points

        print(f"PO {po_id} was not found.")

        return []

    # ========================================================
    # SEMANTIC SEARCH FOR GENERAL QUESTIONS
    # ========================================================

    response = ollama.embed(
        model=EMBEDDING_MODEL,
        input=query
    )

    query_vector = response["embeddings"][0]

    search_result = client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_vector,
        limit=top_k,
        with_payload=True
    )

    return search_result.points


# ============================================================
# PARSE PROCUREMENT RECORD
# ============================================================

def parse_procurement_record(document_text):

    fields = {}

    for line in document_text.splitlines():

        if ":" in line:

            key, value = line.split(":", 1)

            key = key.strip()
            value = value.strip()

            fields[key] = value

    return fields


# ============================================================
# DETECT WHAT THE USER IS ASKING
# ============================================================

def detect_po_question_type(query):

    q = query.lower()

    # --------------------------------------------------------
    # FULL DETAILS
    # --------------------------------------------------------

    if any(keyword in q for keyword in [
        "full details",
        "complete details",
        "all details",
        "complete information",
        "all information",
        "tell me about",
        "details of",
        "details for",
        "information about",
        "information on"
    ]):
        return "details"

    # --------------------------------------------------------
    # COMPLIANCE
    # --------------------------------------------------------

    if any(keyword in q for keyword in [
        "compliance",
        "compliant",
        "compliance status"
    ]):
        return "compliance"

    # --------------------------------------------------------
    # SUPPLIER
    # --------------------------------------------------------

    if any(keyword in q for keyword in [
        "supplier",
        "vendor"
    ]):
        return "supplier"

    # --------------------------------------------------------
    # DEFECTIVE UNITS
    # --------------------------------------------------------

    if any(keyword in q for keyword in [
        "defective units",
        "defect units",
        "number of defects",
        "how many defects",
        "defective"
    ]):
        return "defective_units"

    # --------------------------------------------------------
    # DEFECT RATE
    # --------------------------------------------------------

    if any(keyword in q for keyword in [
        "defect rate",
        "defect percentage",
        "defective percentage"
    ]):
        return "defect_rate"

    # --------------------------------------------------------
    # NEGOTIATED PRICE
    # --------------------------------------------------------

    if any(keyword in q for keyword in [
        "negotiated price",
        "negotiation price",
        "negotiated cost"
    ]):
        return "negotiated_price"

    # --------------------------------------------------------
    # UNIT PRICE
    # --------------------------------------------------------

    if any(keyword in q for keyword in [
        "unit price",
        "price per unit"
    ]):
        return "unit_price"

    # --------------------------------------------------------
    # NEGOTIATION SAVINGS
    # --------------------------------------------------------

    if any(keyword in q for keyword in [
        "negotiation savings",
        "negotiated savings",
        "savings",
        "money saved",
        "amount saved"
    ]):
        return "negotiation_savings"

    # --------------------------------------------------------
    # PROCUREMENT VALUE
    # --------------------------------------------------------

    if any(keyword in q for keyword in [
        "procurement value",
        "total procurement",
        "total value",
        "order value"
    ]):
        return "procurement_value"

    # --------------------------------------------------------
    # QUANTITY
    # --------------------------------------------------------

    if any(keyword in q for keyword in [
        "quantity",
        "how many units",
        "number of units",
        "ordered units"
    ]):
        return "quantity"

    # --------------------------------------------------------
    # ORDER STATUS
    # --------------------------------------------------------

    if any(keyword in q for keyword in [
        "order status",
        "status of the order",
        "delivery status",
        "delivered",
        "delivery status"
    ]):
        return "order_status"

    # --------------------------------------------------------
    # ORDER DATE
    # --------------------------------------------------------

    if any(keyword in q for keyword in [
        "order date",
        "when was the order placed",
        "when was it ordered"
    ]):
        return "order_date"

    # --------------------------------------------------------
    # DELIVERY DATE
    # --------------------------------------------------------

    if any(keyword in q for keyword in [
        "delivery date",
        "when was it delivered",
        "when delivered"
    ]):
        return "delivery_date"

    # --------------------------------------------------------
    # ITEM CATEGORY
    # --------------------------------------------------------

    if any(keyword in q for keyword in [
        "item category",
        "category",
        "what item"
    ]):
        return "item_category"

    # --------------------------------------------------------
    # DEFAULT
    # --------------------------------------------------------

    return "details"


# ============================================================
# GENERATE ANSWER
# ============================================================

def generate_answer(query, top_k=5):

    print("=" * 70)
    print("PROCURE BOT - RAG QUESTION ANSWERING")
    print("=" * 70)

    print()
    print("Question:")
    print(query)

    # ========================================================
    # RETRIEVE DOCUMENTS
    # ========================================================

    results = retrieve_documents(
        query,
        top_k=top_k
    )

    print()
    print(f"Retrieved documents: {len(results)}")

    # ========================================================
    # NO DOCUMENT FOUND
    # ========================================================

    if not results:

        answer = (
            "I could not find sufficient information in the "
            "available procurement records to answer this question."
        )

        print()
        print(answer)

        return answer

    # ========================================================
    # GET FIRST PROCUREMENT RECORD
    # ========================================================

    payload = results[0].payload

    document_text = payload.get(
        "text",
        ""
    )

    if not document_text:

        answer = (
            "The procurement record was found, but it does not "
            "contain sufficient information to answer the question."
        )

        print()
        print(answer)

        return answer

    # ========================================================
    # CHECK FOR EXACT PO QUERY
    # ========================================================

    po_match = re.search(
        r"\bPO-\d{5}\b",
        query.upper()
    )

    # ========================================================
    # EXACT PO QUESTION
    # ========================================================

    if po_match:

        po_id = po_match.group(0)

        fields = parse_procurement_record(
            document_text
        )

        question_type = detect_po_question_type(
            query
        )

        # ----------------------------------------------------
        # SUPPLIER
        # ----------------------------------------------------

        if question_type == "supplier":

            answer = (
                f"The supplier for **{po_id}** is "
                f"**{fields.get('Supplier', 'Not available')}**."
            )

        # ----------------------------------------------------
        # COMPLIANCE
        # ----------------------------------------------------

        elif question_type == "compliance":

            answer = (
                f"The compliance status of **{po_id}** is "
                f"**{fields.get('Compliance', 'Not available')}**."
            )

        # ----------------------------------------------------
        # DEFECTIVE UNITS
        # ----------------------------------------------------

        elif question_type == "defective_units":

            answer = (
                f"**{po_id}** has "
                f"**{fields.get('Defective Units', 'Not available')}** "
                f"defective units."
            )

        # ----------------------------------------------------
        # DEFECT RATE
        # ----------------------------------------------------

        elif question_type == "defect_rate":

            answer = (
                f"The defect rate of **{po_id}** is "
                f"**{fields.get('Defect Rate', 'Not available')}**."
            )

        # ----------------------------------------------------
        # NEGOTIATED PRICE
        # ----------------------------------------------------

        elif question_type == "negotiated_price":

            answer = (
                f"The negotiated price for **{po_id}** is "
                f"**{fields.get('Negotiated Price', 'Not available')}**."
            )

        # ----------------------------------------------------
        # UNIT PRICE
        # ----------------------------------------------------

        elif question_type == "unit_price":

            answer = (
                f"The unit price for **{po_id}** is "
                f"**{fields.get('Unit Price', 'Not available')}**."
            )

        # ----------------------------------------------------
        # NEGOTIATION SAVINGS
        # ----------------------------------------------------

        elif question_type == "negotiation_savings":

            answer = (
                f"The negotiation savings for **{po_id}** are "
                f"**{fields.get('Negotiation Savings', 'Not available')}**."
            )

        # ----------------------------------------------------
        # PROCUREMENT VALUE
        # ----------------------------------------------------

        elif question_type == "procurement_value":

            answer = (
                f"The total procurement value of **{po_id}** is "
                f"**{fields.get('Total Procurement Value', 'Not available')}**."
            )

        # ----------------------------------------------------
        # QUANTITY
        # ----------------------------------------------------

        elif question_type == "quantity":

            answer = (
                f"The quantity ordered for **{po_id}** is "
                f"**{fields.get('Quantity', 'Not available')} units**."
            )

        # ----------------------------------------------------
        # ORDER STATUS
        # ----------------------------------------------------

        elif question_type == "order_status":

            answer = (
                f"The order status of **{po_id}** is "
                f"**{fields.get('Order Status', 'Not available')}**."
            )

        # ----------------------------------------------------
        # ORDER DATE
        # ----------------------------------------------------

        elif question_type == "order_date":

            answer = (
                f"The order date of **{po_id}** was "
                f"**{fields.get('Order Date', 'Not available')}**."
            )

        # ----------------------------------------------------
        # DELIVERY DATE
        # ----------------------------------------------------

        elif question_type == "delivery_date":

            answer = (
                f"The delivery date of **{po_id}** was "
                f"**{fields.get('Delivery Date', 'Not available')}**."
            )

        # ----------------------------------------------------
        # ITEM CATEGORY
        # ----------------------------------------------------

        elif question_type == "item_category":

            answer = (
                f"The item category of **{po_id}** is "
                f"**{fields.get('Item Category', 'Not available')}**."
            )

        # ----------------------------------------------------
        # FULL DETAILS
        # ----------------------------------------------------

        else:

            answer = f"""
### Purchase Order Details

- **Purchase Order:** {fields.get("Purchase Order", po_id)}
- **Supplier:** {fields.get("Supplier", "Not available")}
- **Item Category:** {fields.get("Item Category", "Not available")}
- **Order Date:** {fields.get("Order Date", "Not available")}
- **Delivery Date:** {fields.get("Delivery Date", "Not available")}
- **Order Status:** {fields.get("Order Status", "Not available")}
- **Quantity:** {fields.get("Quantity", "Not available")}
- **Unit Price:** {fields.get("Unit Price", "Not available")}
- **Negotiated Price:** {fields.get("Negotiated Price", "Not available")}
- **Defective Units:** {fields.get("Defective Units", "Not available")}
- **Compliance:** {fields.get("Compliance", "Not available")}
- **Total Procurement Value:** {fields.get("Total Procurement Value", "Not available")}
- **Negotiation Savings:** {fields.get("Negotiation Savings", "Not available")}
- **Defect Rate:** {fields.get("Defect Rate", "Not available")}

### Analysis

Purchase order **{fields.get("Purchase Order", po_id)}** was placed with **{fields.get("Supplier", "the supplier")}** for **{fields.get("Item Category", "the specified item category")}**.

The recorded order status is **{fields.get("Order Status", "not available")}**, and the compliance status is **{fields.get("Compliance", "not available")}**.

The order contains **{fields.get("Quantity", "not available")} units** at a unit price of **{fields.get("Unit Price", "not available")}**.

The negotiated price is **{fields.get("Negotiated Price", "not available")}**, with recorded negotiation savings of **{fields.get("Negotiation Savings", "not available")}**.

The record shows **{fields.get("Defective Units", "not available")} defective units**, corresponding to a defect rate of **{fields.get("Defect Rate", "not available")}**.

### Conclusion

**{po_id}** is recorded as **{fields.get("Order Status", "not available")}** with a compliance status of **{fields.get("Compliance", "not available")}**.
""".strip()

        print()
        print("-" * 70)
        print("PROCURE BOT ANSWER")
        print("-" * 70)
        print(answer)

        print()
        print("=" * 70)
        print("RAG QUESTION ANSWERING COMPLETED")
        print("=" * 70)

        return answer

    # ========================================================
    # GENERAL PROCUREMENT QUESTION
    # USE OLLAMA
    # ========================================================

    context_parts = []

    for i, result in enumerate(
        results,
        start=1
    ):

        payload = result.payload

        text = payload.get(
            "text",
            ""
        )

        if text:

            context_parts.append(
                f"PROCUREMENT RECORD {i}:\n{text}"
            )

    context = "\n\n".join(
        context_parts
    )

    prompt = f"""
You are Procure Bot, an intelligent procurement assistant.

Answer the user's question using ONLY the procurement
records provided below.

Do not invent information.

If the information is not available, clearly say that the
information is not available in the provided procurement
records.

Give a clear and useful explanation.

User Question:
{query}

Procurement Records:
{context}

Provide a detailed but concise answer.
"""

    response = ollama.chat(
        model=LLM_MODEL,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        options={
            "temperature": 0.2,
            "num_predict": 500
        }
    )

    answer = response[
        "message"
    ][
        "content"
    ].strip()

    print()
    print("-" * 70)
    print("PROCURE BOT ANSWER")
    print("-" * 70)
    print(answer)

    print()
    print("=" * 70)
    print("RAG QUESTION ANSWERING COMPLETED")
    print("=" * 70)

    return answer
