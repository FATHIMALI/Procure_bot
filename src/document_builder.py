from pathlib import Path

import pandas as pd


# Project root
BASE_DIR = Path(__file__).resolve().parent.parent

INPUT_FILE = (
    BASE_DIR
    / "data"
    / "processed"
    / "procurement_final.csv"
)

OUTPUT_DIR = (
    BASE_DIR
    / "data"
    / "processed"
    / "documents"
)


def build_documents():

    print("=" * 60)
    print("PROCURE BOT - DOCUMENT BUILDER")
    print("=" * 60)

    # Load processed procurement data
    df = pd.read_csv(INPUT_FILE)

    print(f"Records loaded: {len(df)}")

    # Create output directory
    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    document_count = 0

    for index, row in df.iterrows():

        po_id = row["po_id"]

        document = f"""
Purchase Order: {po_id}

Supplier: {row["supplier"]}

Item Category: {row["item_category"]}

Order Date: {row["order_date"]}

Delivery Date: {row["delivery_date"]}

Order Status: {row["order_status"]}

Quantity: {row["quantity"]}

Unit Price: {row["unit_price"]}

Negotiated Price: {row["negotiated_price"]}

Defective Units: {row["defective_units"]}

Compliance: {row["compliance"]}

Total Procurement Value: {row["total_value"]}

Negotiation Savings: {row["savings"]}

Defect Rate: {row["defect_rate"]}%
""".strip()

        output_file = OUTPUT_DIR / f"{po_id}.txt"

        output_file.write_text(
            document,
            encoding="utf-8"
        )

        document_count += 1

    print()
    print(f"Documents created: {document_count}")
    print(f"Output directory: {OUTPUT_DIR}")
    print()
    print("=" * 60)
    print("DOCUMENT BUILDING COMPLETED")
    print("=" * 60)


if __name__ == "__main__":
    build_documents()