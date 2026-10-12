import re


def route_query(query):
    """
    Decide whether a procurement query should use
    Quality Analysis or RAG retrieval.

    Rule:
    - If a specific PO number is mentioned, use RAG.
    - Otherwise, use analytics for aggregate questions.
    """

    query_lower = query.lower()

    # ========================================================
    # PRIORITY 1: SPECIFIC PO QUERY
    # ========================================================

    # Example:
    # PO-00056
    # PO-00012
    # PO-12345

    po_match = re.search(
        r"\bPO-\d{5}\b",
        query.upper()
    )

    if po_match:
        return "rag"

    # ========================================================
    # PRIORITY 2: GENERAL ANALYTICS
    # ========================================================

    quality_analysis_keywords = [

        # General analytics
        "highest",
        "lowest",
        "maximum",
        "minimum",
        "average",
        "total",
        "sum",
        "count",
        "how many",

        # Defect / quality analysis
        "defect rate",
        "defective units",
        "defect",
        "quality analysis",
        "quality",
        "supplier performance",
        "supplier quality",

        # Procurement value
        "procurement value",
        "total value",
        "procurement amount",

        # Savings
        "savings",
        "negotiation savings",

        # Compliance analysis
        "compliance rate",
        "compliance percentage",
        "compliance summary",
        "overall compliance",

        # Supplier-level analysis
        "supplier overall",
        "overall supplier",
        "supplier with highest",
        "supplier with lowest",
    ]

    for keyword in quality_analysis_keywords:

        if keyword in query_lower:
            return "analytics"

    # ========================================================
    # DEFAULT
    # ========================================================

    return "rag"


# ============================================================
# TEST ROUTER
# ============================================================

if __name__ == "__main__":

    print("=" * 70)
    print("PROCURE BOT - QUERY ROUTER TEST")
    print("=" * 70)

    test_queries = [

        # ----------------------------------------------------
        # Analytics queries
        # ----------------------------------------------------

        "Which supplier has the highest defect rate?",
        "Which supplier has the highest overall defect rate?",
        "What is the total procurement value?",
        "How many defective units are there?",
        "What is the compliance rate?",
        "Which supplier has the lowest defect rate?",

        # ----------------------------------------------------
        # Specific PO queries
        # ----------------------------------------------------

        "Tell me about PO-00012.",
        "What is the compliance status of PO-00056?",
        "What item was ordered in PO-00012?",
        "Who is the supplier for PO-00056?",
        "How many defective units are there in PO-00056?",
        "What is the defect rate of PO-00056?",
    ]

    print()

    for query in test_queries:

        route = route_query(query)

        print("Query :", query)
        print("Route :", route)
        print("-" * 70)

    print()
    print("QUERY ROUTER TEST COMPLETED")
    print("=" * 70)
