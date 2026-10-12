import os
import pandas as pd


# ============================================================
# DATA PATH
# ============================================================

DATA_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "data",
    "processed",
    "procurement_cleaned.csv"
)


# ============================================================
# LOAD DATA
# ============================================================

def load_data():
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(
            f"Procurement dataset not found at: {DATA_PATH}"
        )

    df = pd.read_csv(DATA_PATH)
    df.columns = df.columns.str.strip()

    return df


# ============================================================
# FIND PURCHASE ORDER
# ============================================================

def get_purchase_order(po_id):

    df = load_data()

    result = df[
        df["PO_ID"].astype(str).str.upper().str.strip()
        == po_id.upper().strip()
    ]

    if result.empty:
        return None

    return result.iloc[0]


# ============================================================
# COMPLIANCE CHECKER
# ============================================================

def check_compliance(po_id):

    row = get_purchase_order(po_id)

    # --------------------------------------------------------
    # PO NOT FOUND
    # --------------------------------------------------------

    if row is None:
        return {
            "found": False,
            "po_id": po_id,
            "compliance_status": "Not Found",
            "is_compliant": False,
            "violations": [
                f"Purchase order {po_id} was not found in the procurement dataset."
            ]
        }

    # --------------------------------------------------------
    # GET ACTUAL DATA
    # --------------------------------------------------------

    actual_po = str(row["PO_ID"])
    supplier = str(row["Supplier"])

    quantity = float(row["Quantity"])
    unit_price = float(row["Unit_Price"])
    negotiated_price = float(row["Negotiated_Price"])
    defective_units = float(row["Defective_Units"])

    dataset_compliance = str(row["Compliance"]).strip()

    # --------------------------------------------------------
    # PROCUREMENT VALUE
    # --------------------------------------------------------
    # Procurement value is based on negotiated price.
    #
    # Example:
    # Quantity × Negotiated Price
    # --------------------------------------------------------

    procurement_value = quantity * negotiated_price

    # --------------------------------------------------------
    # DEFECT RATE
    # --------------------------------------------------------

    if quantity > 0:
        defect_rate = (defective_units / quantity) * 100
    else:
        defect_rate = 0

    # --------------------------------------------------------
    # SAVINGS
    # --------------------------------------------------------

    savings = quantity * (unit_price - negotiated_price)

    # --------------------------------------------------------
    # COMPLIANCE RULES
    # --------------------------------------------------------

    violations = []

    # RULE 1
    # Defect rate should not exceed 10%
    if defect_rate > 10:
        violations.append(
            f"Defect rate is {defect_rate:.2f}%, "
            f"which exceeds the allowed threshold of 10%."
        )

    # RULE 2
    # Quantity must be greater than zero
    if quantity <= 0:
        violations.append(
            "Order quantity is zero or invalid."
        )

    # RULE 3
    # Negotiated price must be greater than zero
    if negotiated_price <= 0:
        violations.append(
            "Negotiated price is zero or invalid."
        )

    # RULE 4
    # Dataset compliance flag
    if dataset_compliance.lower() in [
        "no",
        "non-compliant",
        "non compliant",
        "false",
        "0"
    ]:
        violations.append(
            "The procurement dataset marks this purchase order as non-compliant."
        )

    # --------------------------------------------------------
    # FINAL STATUS
    # --------------------------------------------------------

    is_compliant = len(violations) == 0

    compliance_status = (
        "Compliant"
        if is_compliant
        else "Non-Compliant"
    )

    # --------------------------------------------------------
    # RETURN RESULT
    # --------------------------------------------------------

    return {
        "found": True,

        "po_id": actual_po,

        "supplier": supplier,

        "quantity": int(quantity)
        if quantity.is_integer()
        else quantity,

        "unit_price": round(unit_price, 2),

        "negotiated_price": round(
            negotiated_price,
            2
        ),

        "procurement_value": round(
            procurement_value,
            2
        ),

        "savings": round(
            savings,
            2
        ),

        "defective_units": int(defective_units)
        if defective_units.is_integer()
        else defective_units,

        "defect_rate": round(
            defect_rate,
            2
        ),

        "dataset_compliance": dataset_compliance,

        "compliance_status": compliance_status,

        "is_compliant": is_compliant,

        "violations": violations
    }


# ============================================================
# TEST
# ============================================================

if __name__ == "__main__":

    print("=" * 70)
    print("PROCURE BOT - COMPLIANCE CHECKER")
    print("=" * 70)

    po_id = input("Enter PO ID: ").strip()

    result = check_compliance(po_id)

    print()
    print("RESULT")
    print("-" * 70)

    for key, value in result.items():
        print(f"{key}: {value}")

    print("-" * 70)