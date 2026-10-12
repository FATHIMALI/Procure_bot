import pandas as pd

from src.config import PROCESSED_DATA_DIR


DATA_FILE = PROCESSED_DATA_DIR / "procurement_final.csv"


def load_data():
    """Load the processed procurement dataset."""

    df = pd.read_csv(DATA_FILE)

    return df


def highest_defect_rate():
    """
    Find the individual PO with the highest defect rate.
    """

    df = load_data()

    row = df.loc[df["defect_rate"].idxmax()]

    return {
        "supplier": row["supplier"],
        "po_id": row["po_id"],
        "defect_rate": float(row["defect_rate"]),
    }


def lowest_defect_rate():
    """
    Find the individual PO with the lowest defect rate.
    """

    df = load_data()

    row = df.loc[df["defect_rate"].idxmin()]

    return {
        "supplier": row["supplier"],
        "po_id": row["po_id"],
        "defect_rate": float(row["defect_rate"]),
    }


def total_procurement_value():
    """Calculate total procurement value."""

    df = load_data()

    return float(df["total_value"].sum())


def total_savings():
    """Calculate total negotiation savings."""

    df = load_data()

    return float(df["savings"].sum())


def total_orders():
    """Calculate total number of procurement orders."""

    df = load_data()

    return int(len(df))


def total_defective_units():
    """Calculate total defective units."""

    df = load_data()

    return int(df["defective_units"].sum())


def supplier_order_count():
    """Count procurement orders by supplier."""

    df = load_data()

    return (
        df["supplier"]
        .value_counts()
        .to_dict()
    )


def supplier_defect_summary():
    """
    Calculate supplier-level quality statistics.
    """

    df = load_data()

    summary = (
        df.groupby("supplier")
        .agg(
            total_orders=("po_id", "count"),
            total_quantity=("quantity", "sum"),
            defective_units=("defective_units", "sum"),
            average_defect_rate=("defect_rate", "mean"),
        )
        .reset_index()
    )

    summary["overall_defect_rate"] = (
        summary["defective_units"]
        / summary["total_quantity"]
        * 100
    )

    summary = summary.sort_values(
        "overall_defect_rate",
        ascending=False
    )

    return summary


def highest_supplier_defect_rate():
    """
    Find the supplier with the highest overall defect rate.

    This is different from highest_defect_rate(),
    which looks at one individual purchase order.
    """

    summary = supplier_defect_summary()

    row = summary.iloc[0]

    return {
        "supplier": row["supplier"],
        "total_orders": int(row["total_orders"]),
        "defective_units": int(row["defective_units"]),
        "overall_defect_rate": float(
            row["overall_defect_rate"]
        ),
    }


def lowest_supplier_defect_rate():
    """
    Find the supplier with the lowest overall defect rate.
    """

    summary = supplier_defect_summary()

    row = summary.iloc[-1]

    return {
        "supplier": row["supplier"],
        "total_orders": int(row["total_orders"]),
        "defective_units": int(row["defective_units"]),
        "overall_defect_rate": float(
            row["overall_defect_rate"]
        ),
    }


def compliance_summary():
    """
    Calculate procurement compliance statistics.
    """

    df = load_data()

    total = len(df)

    compliant = int(
        (df["compliance"].astype(str).str.lower() == "yes").sum()
    )

    non_compliant = total - compliant

    compliance_rate = (
        compliant / total * 100
        if total > 0
        else 0
    )

    return {
        "total_orders": total,
        "compliant_orders": compliant,
        "non_compliant_orders": non_compliant,
        "compliance_rate": compliance_rate,
    }


def supplier_performance_summary():
    """
    Generate a complete supplier performance summary.
    """

    df = load_data()

    summary = (
        df.groupby("supplier")
        .agg(
            total_orders=("po_id", "count"),
            total_quantity=("quantity", "sum"),
            defective_units=("defective_units", "sum"),
            average_defect_rate=("defect_rate", "mean"),
            total_value=("total_value", "sum"),
            total_savings=("savings", "sum"),
        )
        .reset_index()
    )

    summary["overall_defect_rate"] = (
        summary["defective_units"]
        / summary["total_quantity"]
        * 100
    )

    summary = summary.sort_values(
        "overall_defect_rate",
        ascending=False
    )

    return summary


if __name__ == "__main__":

    print("=" * 70)
    print("PROCURE BOT - PROCUREMENT QUALITY ANALYSIS")
    print("=" * 70)

    # ---------------------------------------------------------
    # Highest individual PO defect
    # ---------------------------------------------------------

    result = highest_defect_rate()

    print()
    print("Highest Individual PO Defect Rate")
    print("----------------------------------")
    print("Supplier    :", result["supplier"])
    print("PO ID       :", result["po_id"])
    print("Defect Rate :", f'{result["defect_rate"]:.2f}%')

    # ---------------------------------------------------------
    # Highest supplier-level defect
    # ---------------------------------------------------------

    result = highest_supplier_defect_rate()

    print()
    print("Highest Supplier Overall Defect Rate")
    print("-------------------------------------")
    print("Supplier        :", result["supplier"])
    print("Total Orders    :", result["total_orders"])
    print("Defective Units :", result["defective_units"])
    print(
        "Overall Rate    :",
        f'{result["overall_defect_rate"]:.2f}%'
    )

    # ---------------------------------------------------------
    # Total procurement value
    # ---------------------------------------------------------

    print()
    print("Total Procurement Value")
    print("-----------------------")
    print(f"{total_procurement_value():,.2f}")

    # ---------------------------------------------------------
    # Total savings
    # ---------------------------------------------------------

    print()
    print("Total Negotiation Savings")
    print("-------------------------")
    print(f"{total_savings():,.2f}")

    # ---------------------------------------------------------
    # Total orders
    # ---------------------------------------------------------

    print()
    print("Total Procurement Orders")
    print("------------------------")
    print(total_orders())

    # ---------------------------------------------------------
    # Total defective units
    # ---------------------------------------------------------

    print()
    print("Total Defective Units")
    print("---------------------")
    print(f"{total_defective_units():,}")

    # ---------------------------------------------------------
    # Compliance
    # ---------------------------------------------------------

    compliance = compliance_summary()

    print()
    print("Compliance Summary")
    print("------------------")
    print("Total Orders       :", compliance["total_orders"])
    print("Compliant Orders   :", compliance["compliant_orders"])
    print("Non-Compliant      :", compliance["non_compliant_orders"])
    print(
        "Compliance Rate    :",
        f'{compliance["compliance_rate"]:.2f}%'
    )

    # ---------------------------------------------------------
    # Supplier quality summary
    # ---------------------------------------------------------

    print()
    print("Supplier Quality Summary")
    print("------------------------")

    print(
        supplier_defect_summary().to_string(
            index=False
        )
    )

    print()
    print("=" * 70)
    print("QUALITY ANALYSIS COMPLETED")
    print("=" * 70)