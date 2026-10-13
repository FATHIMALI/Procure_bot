from src.query_router import route_query

from src.quality_analysis import (
    highest_defect_rate,
    lowest_defect_rate,
    highest_supplier_defect_rate,
    lowest_supplier_defect_rate,
    total_procurement_value,
    total_savings,
    total_orders,
    total_defective_units,
    supplier_order_count,
    compliance_summary,
    supplier_performance_summary,
    supplier_defect_summary,
)

from src.rag_assistant import generate_answer


def analytics_answer(query):
    """Generate answers for procurement analytics queries."""

    query_lower = query.lower().strip()

    # ---------------------------------------------------------
    # 1. SUPPLIER PERFORMANCE SUMMARY
    # ---------------------------------------------------------
    if "supplier performance" in query_lower:

        summary = supplier_performance_summary()

        if summary is None or summary.empty:
            return "No supplier performance data is available."

        answer = "Supplier Performance Summary:\n\n"

        for _, row in summary.iterrows():

            answer += (
                f"Supplier: {row['supplier']}\n"
                f"  Orders: {int(row['total_orders'])}\n"
                f"  Total Quantity: {int(row['total_quantity'])}\n"
                f"  Defective Units: {int(row['defective_units'])}\n"
                f"  Average Defect Rate: "
                f"{row['average_defect_rate']:.2f}%\n"
                f"  Overall Defect Rate: "
                f"{row['overall_defect_rate']:.2f}%\n"
                f"  Total Procurement Value: "
                f"{row['total_value']:,.2f}\n"
                f"  Total Savings: "
                f"{row['total_savings']:,.2f}\n\n"
            )

        return answer.strip()

    # ---------------------------------------------------------
    # 2. COMPLIANCE COUNT
    # IMPORTANT: MUST COME BEFORE TOTAL ORDERS
    # ---------------------------------------------------------
    if (
        (
            "compliant" in query_lower
            and "non-compliant" in query_lower
        )
        or (
            "compliant" in query_lower
            and "non compliant" in query_lower
        )
        or "compliance summary" in query_lower
        or "overall compliance" in query_lower
        or "compliance rate" in query_lower
        or "compliance percentage" in query_lower
    ):

        result = compliance_summary()

        return (
            f"The overall compliance rate is "
            f"{result['compliance_rate']:.2f}%. "
            f"Out of {result['total_orders']:,} orders, "
            f"{result['compliant_orders']:,} are compliant and "
            f"{result['non_compliant_orders']:,} are non-compliant."
        )

    # ---------------------------------------------------------
    # 3. HIGHEST SUPPLIER OVERALL DEFECT RATE
    # IMPORTANT: MUST COME BEFORE "highest defect"
    # ---------------------------------------------------------
    if (
        "supplier with highest defect" in query_lower
        or "supplier with the highest defect" in query_lower
        or "highest supplier defect" in query_lower
        or "highest supplier overall defect" in query_lower
        or "highest overall defect rate" in query_lower
        or "which supplier has the highest defect rate" in query_lower
        or "which supplier has highest defect rate" in query_lower
    ):

        result = highest_supplier_defect_rate()

        if not result:
            return "No supplier defect data is available."

        return (
            f"The supplier with the highest overall defect rate "
            f"is {result['supplier']} with an overall defect rate "
            f"of {result['overall_defect_rate']:.2f}%. "
            f"This supplier has {int(result['total_orders']):,} orders "
            f"and {int(result['defective_units']):,} defective units."
        )

    # ---------------------------------------------------------
    # 4. LOWEST SUPPLIER OVERALL DEFECT RATE
    # ---------------------------------------------------------
    if (
        "supplier with lowest defect" in query_lower
        or "supplier with the lowest defect" in query_lower
        or "lowest supplier defect" in query_lower
        or "lowest supplier overall defect" in query_lower
        or "lowest overall defect rate" in query_lower
        or "which supplier has the lowest defect rate" in query_lower
        or "which supplier has lowest defect rate" in query_lower
    ):

        result = lowest_supplier_defect_rate()

        if not result:
            return "No supplier defect data is available."

        return (
            f"The supplier with the lowest overall defect rate "
            f"is {result['supplier']} with an overall defect rate "
            f"of {result['overall_defect_rate']:.2f}%. "
            f"This supplier has {int(result['total_orders']):,} orders "
            f"and {int(result['defective_units']):,} defective units."
        )
    # ---------------------------------------------------------
    # ---------------------------------------------------------
    # 4A. SUPPLIERS WITH HIGH DEFECT RATES
    # ---------------------------------------------------------
    if (
        "suppliers have high defect rates" in query_lower
        or "supplier high defect rates" in query_lower
        or "high defect rate suppliers" in query_lower
        or "which suppliers have high defect" in query_lower
    ):
        summary = supplier_defect_summary()

        if summary is None or summary.empty:
            return "No supplier defect data is available."

        answer = "Supplier Defect Rate Summary:\n\n"

        for _, row in summary.iterrows():
            answer += (
                f"Supplier: {row['supplier']}\n"
                f"  Overall Defect Rate: "
                f"{row['overall_defect_rate']:.2f}%\n"
                f"  Total Orders: {int(row['total_orders']):,}\n"
                f"  Defective Units: {int(row['defective_units']):,}\n\n"
            )

        return answer.strip()

    # 5. SPECIFIC SUPPLIER OVERALL DEFECT RATE
    # ---------------------------------------------------------
    if (
        "overall defect rate" in query_lower
        and "highest" not in query_lower
        and "lowest" not in query_lower
    ):

        summary = supplier_defect_summary()

        if summary is None or summary.empty:
            return "No supplier defect data is available."
        matched_supplier = None

        for supplier in summary["supplier"].tolist():

            if supplier.lower() in query_lower:
                matched_supplier = supplier
                break

        if matched_supplier is None:
            return (
                "I could not find the specified supplier "
                "in the procurement data."
            )

        result = summary[
            summary["supplier"] == matched_supplier
        ].iloc[0]

        return (
            f"The overall defect rate of "
            f"{matched_supplier} is "
            f"{result['overall_defect_rate']:.2f}%. "
            f"This supplier has "
            f"{int(result['total_orders']):,} orders and "
            f"{int(result['defective_units']):,} defective units."
        )

    # ---------------------------------------------------------
    # 6. HIGHEST INDIVIDUAL PO DEFECT RATE
    # ---------------------------------------------------------
    if (
        "highest individual po defect" in query_lower
        or "highest po defect" in query_lower
        or "highest individual purchase order defect" in query_lower
    ):

        result = highest_defect_rate()

        return (
            f"The highest individual PO defect rate is "
            f"{result['defect_rate']:.2f}% for "
            f"{result['supplier']} ({result['po_id']})."
        )

    # ---------------------------------------------------------
    # 7. LOWEST INDIVIDUAL PO DEFECT RATE
    # ---------------------------------------------------------
    if (
        "lowest individual po defect" in query_lower
        or "lowest po defect" in query_lower
        or "lowest individual purchase order defect" in query_lower
    ):

        result = lowest_defect_rate()

        return (
            f"The lowest individual PO defect rate is "
            f"{result['defect_rate']:.2f}% for "
            f"{result['supplier']} ({result['po_id']})."
        )

    # ---------------------------------------------------------
    # 8. TOTAL PROCUREMENT VALUE
    # ---------------------------------------------------------
    if (
        "total procurement value" in query_lower
        or "total procurement amount" in query_lower
        or "total value" in query_lower
    ):

        value = total_procurement_value()

        return (
            f"The total procurement value is "
            f"{value:,.2f}."
        )

    # ---------------------------------------------------------
    # 9. TOTAL SAVINGS
    # ---------------------------------------------------------
    if (
        "total savings" in query_lower
        or "negotiation savings" in query_lower
        or "total negotiation savings" in query_lower
    ):

        savings = total_savings()

        return (
            f"The total negotiation savings are "
            f"{savings:,.2f}."
        )

    # ---------------------------------------------------------
    # 10. TOTAL DEFECTIVE UNITS
    # ---------------------------------------------------------
    if (
        "total defective units" in query_lower
        or "defective units" in query_lower
        or "total defective" in query_lower
    ):

        defective = total_defective_units()

        return (
            f"The total number of defective units is "
            f"{defective:,}."
        )

    # ---------------------------------------------------------
    # 11. TOTAL ORDERS
    # IMPORTANT: AFTER COMPLIANCE
    # ---------------------------------------------------------
    if (
        "total orders" in query_lower
        or "number of orders" in query_lower
        or (
            "how many" in query_lower
            and "order" in query_lower
            and "compliant" not in query_lower
        )
    ):

        total = total_orders()

        return (
            f"There are {total:,} procurement orders "
            f"in the dataset."
        )

    # ---------------------------------------------------------
    # 12. SUPPLIER ORDER COUNT
    # ---------------------------------------------------------
    if (
        "supplier order count" in query_lower
        or "orders by supplier" in query_lower
    ):

        counts = supplier_order_count()

        formatted = ", ".join(
            f"{supplier}: {count}"
            for supplier, count in counts.items()
        )

        return (
            f"Procurement orders by supplier are: "
            f"{formatted}."
        )

    # ---------------------------------------------------------
    # FALLBACK
    # ---------------------------------------------------------
    return (
        "The query was identified as a Quality Analysis request, "
        "but a specific analytics operation has not been implemented yet."
    )


def ask_procure_bot(query):
    """Main Procure Bot controller."""

    route = route_query(query)

    print()
    print("=" * 70)
    print("PROCURE BOT")
    print("=" * 70)

    print()
    print("User Query:")
    print(query)

    print()
    print("Selected Route:")
    print(route.upper())

    if route == "analytics":
        answer = analytics_answer(query)
    else:
        answer = generate_answer(query, top_k=5)

    print()
    print("-" * 70)
    print("FINAL ANSWER")
    print("-" * 70)
    print(answer)

    print()
    print("=" * 70)

    return answer


def main():
    """Interactive Procure Bot application."""

    print()
    print("=" * 70)
    print("WELCOME TO PROCURE BOT")
    print("=" * 70)

    print()
    print(
        "Intelligent Procurement and Vendor Quality "
        "Analysis Assistant"
    )

    print()
    print("Ask questions about your procurement data.")
    print("Type 'exit' to stop.")
    print()

    while True:

        question = input("You: ").strip()

        if question.lower() == "exit":
            print()
            print("Procure Bot stopped.")
            break

        if not question:
            continue

        ask_procure_bot(question)

        print()


if __name__ == "__main__":
    main()
