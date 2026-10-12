import pandas as pd

from src.config import (
    RAW_DATA_DIR,
    PROCESSED_DATA_DIR,
)


# ============================================================
# FILE PATHS
# ============================================================

INPUT_FILE = (
    PROCESSED_DATA_DIR
    / "procurement_cleaned.csv"
)

OUTPUT_FILE = (
    PROCESSED_DATA_DIR
    / "procurement_final.csv"
)


# ============================================================
# DATA PROCESSING
# ============================================================

def process_procurement_data():

    print("=" * 70)
    print("PROCURE BOT - PROCUREMENT DATA PROCESSING")
    print("=" * 70)

    # --------------------------------------------------------
    # Load dataset
    # --------------------------------------------------------

    print()
    print("Loading procurement dataset...")

    df = pd.read_csv(INPUT_FILE)

    print(
        "Original rows:",
        len(df)
    )

    # --------------------------------------------------------
    # Standardize column names
    # --------------------------------------------------------

    df.columns = (
        df.columns
        .str.strip()
        .str.lower()
        .str.replace(" ", "_")
        .str.replace("-", "_")
    )

    # --------------------------------------------------------
    # Remove duplicate records
    # --------------------------------------------------------

    before_duplicates = len(df)

    df = df.drop_duplicates()

    after_duplicates = len(df)

    print(
        "Duplicates removed:",
        before_duplicates - after_duplicates
    )

    # --------------------------------------------------------
    # Convert date columns
    # --------------------------------------------------------

    df["order_date"] = pd.to_datetime(
        df["order_date"],
        errors="coerce"
    )

    df["delivery_date"] = pd.to_datetime(
        df["delivery_date"],
        errors="coerce"
    )

    # --------------------------------------------------------
    # Convert numeric columns
    # --------------------------------------------------------

    numeric_columns = [
        "quantity",
        "unit_price",
        "negotiated_price",
        "defective_units",
    ]

    for column in numeric_columns:

        df[column] = pd.to_numeric(
            df[column],
            errors="coerce"
        )

    # --------------------------------------------------------
    # Handle missing defective units
    # --------------------------------------------------------

    df["defective_units"] = (
        df["defective_units"]
        .fillna(0)
    )

    # --------------------------------------------------------
    # Handle missing quantity
    # --------------------------------------------------------

    df["quantity"] = (
        df["quantity"]
        .fillna(0)
    )

    # --------------------------------------------------------
    # Handle missing prices
    # --------------------------------------------------------

    df["unit_price"] = (
        df["unit_price"]
        .fillna(0)
    )

    df["negotiated_price"] = (
        df["negotiated_price"]
        .fillna(0)
    )

    # ========================================================
    # FEATURE ENGINEERING
    # ========================================================

    # --------------------------------------------------------
    # Total procurement value
    #
    # Quantity × Negotiated Price
    # --------------------------------------------------------

    df["total_value"] = (
        df["quantity"]
        * df["negotiated_price"]
    ).round(2)

    # --------------------------------------------------------
    # Negotiation savings
    #
    # (Unit Price - Negotiated Price) × Quantity
    # --------------------------------------------------------

    df["savings"] = (
        (
            df["unit_price"]
            - df["negotiated_price"]
        )
        * df["quantity"]
    ).round(2)

    # --------------------------------------------------------
    # Defect rate
    #
    # Defective Units / Quantity × 100
    # --------------------------------------------------------

    df["defect_rate"] = (
        (
            df["defective_units"]
            / df["quantity"].replace(0, pd.NA)
        )
        * 100
    )

    df["defect_rate"] = (
        df["defect_rate"]
        .fillna(0)
        .round(2)
    )

    # --------------------------------------------------------
    # Round quantity and defective units
    # --------------------------------------------------------

    df["quantity"] = (
        df["quantity"]
        .round(0)
        .astype(int)
    )

    df["defective_units"] = (
        df["defective_units"]
        .round(0)
        .astype(int)
    )

    # --------------------------------------------------------
    # Round financial columns again
    # --------------------------------------------------------

    df["unit_price"] = (
        df["unit_price"]
        .round(2)
    )

    df["negotiated_price"] = (
        df["negotiated_price"]
        .round(2)
    )

    df["total_value"] = (
        df["total_value"]
        .round(2)
    )

    df["savings"] = (
        df["savings"]
        .round(2)
    )

    # --------------------------------------------------------
    # Format dates
    # --------------------------------------------------------

    df["order_date"] = (
        df["order_date"]
        .dt.strftime("%Y-%m-%d")
    )

    df["delivery_date"] = (
        df["delivery_date"]
        .dt.strftime("%Y-%m-%d")
    )

    # --------------------------------------------------------
    # Reorder columns
    # --------------------------------------------------------

    desired_columns = [
        "po_id",
        "supplier",
        "order_date",
        "delivery_date",
        "item_category",
        "order_status",
        "quantity",
        "unit_price",
        "negotiated_price",
        "defective_units",
        "compliance",
        "total_value",
        "savings",
        "defect_rate",
    ]

    df = df[desired_columns]

    # --------------------------------------------------------
    # Save processed dataset
    # --------------------------------------------------------

    PROCESSED_DATA_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    df.to_csv(
        OUTPUT_FILE,
        index=False
    )

    # ========================================================
    # DISPLAY RESULTS
    # ========================================================

    print()
    print("Final rows:", len(df))

    print(
        "Final columns:",
        len(df.columns)
    )

    print()
    print("Columns:")

    for column in df.columns:
        print(
            "-",
            column
        )

    print()
    print("Financial validation:")
    print(
        "Total procurement value:",
        f"{df['total_value'].sum():,.2f}"
    )

    print(
        "Total negotiation savings:",
        f"{df['savings'].sum():,.2f}"
    )

    print()
    print("Output file:")
    print(OUTPUT_FILE)

    print()
    print("=" * 70)
    print("DATA PROCESSING COMPLETED")
    print("=" * 70)


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":
    process_procurement_data()