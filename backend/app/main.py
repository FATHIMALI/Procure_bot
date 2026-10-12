import os 
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from pathlib import Path
import pandas as pd
import math
import sqlite3
from datetime import datetime

from src.procure_bot import ask_procure_bot
from src.compliance_checker import check_compliance

from src.quality_analysis import (
    total_procurement_value,
    total_savings,
    total_orders,
    total_defective_units,
    compliance_summary,
    highest_supplier_defect_rate,
    lowest_supplier_defect_rate,
    highest_defect_rate,
    lowest_defect_rate,
    supplier_performance_summary,
)


# ============================================================
# APP
# ============================================================

app = FastAPI(
    title="Procure Bot API",
    description="Intelligent Procurement and Vendor Quality Analysis Assistant",
    version="2.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# REQUEST MODELS
# ============================================================

class QueryRequest(BaseModel):
    question: str


class QueryResponse(BaseModel):
    question: str
    answer: str


class RFQRequest(BaseModel):
    supplier: str
    item: str
    quantity: int
    required_date: Optional[str] = ""
    additional_requirements: Optional[str] = ""


# ============================================================
# DATA LOCATION
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[2]

DATA_FILE = BASE_DIR / "data" / "processed" / "procurement_cleaned.csv"


# ============================================================
# DATA HELPERS
# ============================================================

def load_procurement_data():
    """
    Load procurement CSV safely.
    """

    if not DATA_FILE.exists():
        raise FileNotFoundError(
            f"Procurement dataset not found: {DATA_FILE}"
        )

    df = pd.read_csv(DATA_FILE)

    # Remove completely empty rows
    df = df.dropna(how="all")

    return df


def clean_value(value):
    """
    Convert pandas/numpy values into JSON-safe values.
    """

    if pd.isna(value):
        return None

    if isinstance(value, float):
        if math.isnan(value) or math.isinf(value):
            return None

    return value


def dataframe_to_records(df):
    """
    Convert dataframe into JSON-safe records.
    """

    records = df.to_dict(orient="records")

    cleaned = []

    for record in records:

        new_record = {}

        for key, value in record.items():
            new_record[str(key)] = clean_value(value)

        cleaned.append(new_record)

    return cleaned


def find_column(df, possible_names):
    """
    Find a dataframe column using flexible matching.
    """

    normalized = {
        str(col).strip().lower().replace(" ", "_"): col
        for col in df.columns
    }

    for name in possible_names:

        key = name.strip().lower().replace(" ", "_")

        if key in normalized:
            return normalized[key]

    # Partial matching
    for col in df.columns:

        col_normalized = (
            str(col)
            .strip()
            .lower()
            .replace(" ", "_")
        )

        for name in possible_names:

            name_normalized = (
                name.strip()
                .lower()
                .replace(" ", "_")
            )

            if name_normalized in col_normalized:
                return col

    return None


# ============================================================
# HOME
# ============================================================

@app.get("/")
def home():

    return {
        "message": "Procure Bot Backend is running successfully!",
        "status": "online",
        "version": "2.0.0"
    }


# ============================================================
# HEALTH
# ============================================================

@app.get("/health")
def health():

    return {
        "status": "healthy"
    }


# ============================================================
# AI QUERY / RAG
# ============================================================

@app.post("/api/query", response_model=QueryResponse)
def query_procure_bot(request: QueryRequest):

    try:

        if not request.question.strip():
            raise HTTPException(
                status_code=400,
                detail="Question cannot be empty."
            )

        answer = ask_procure_bot(request.question)

        return {
            "question": request.question,
            "answer": answer
        }

    except HTTPException:
        raise

    except Exception as e:

        return {
            "question": request.question,
            "answer": f"Unable to process the question: {str(e)}"
        }


# ============================================================
# DASHBOARD SUMMARY
# ============================================================

@app.get("/api/dashboard/summary")
def dashboard_summary():

    compliance = compliance_summary()

    return {
        "total_procurement_value": total_procurement_value(),
        "total_savings": total_savings(),
        "total_orders": total_orders(),
        "total_defective_units": total_defective_units(),
        "compliance_rate": compliance["compliance_rate"],
        "compliant_orders": compliance["compliant_orders"],
        "non_compliant_orders": compliance["non_compliant_orders"],
    }


# ============================================================
# SUPPLIER QUALITY
# ============================================================

@app.get("/api/dashboard/suppliers")
def dashboard_suppliers():

    summary = supplier_performance_summary()

    records = dataframe_to_records(summary)

    return {
        "suppliers": records
    }


# ============================================================
# QUALITY SUMMARY
# ============================================================

@app.get("/api/dashboard/quality")
def dashboard_quality():

    highest_po = highest_defect_rate()
    lowest_po = lowest_defect_rate()

    highest_supplier = highest_supplier_defect_rate()
    lowest_supplier = lowest_supplier_defect_rate()

    return {
        "highest_individual_po_defect": highest_po,
        "lowest_individual_po_defect": lowest_po,
        "highest_supplier_defect": highest_supplier,
        "lowest_supplier_defect": lowest_supplier,
        "total_defective_units": total_defective_units(),
    }

# =====================================================
# QUALITY ANALYSIS - SUPPLIER DETAILS
# =====================================================

@app.get("/api/quality/supplier/{supplier_name}")
def quality_supplier_details(supplier_name: str):
    try:

        if not os.path.exists(DATA_FILE):
            return {
                "success": False,
                "error": "Procurement data file not found."
            }

        df = pd.read_csv(DATA_FILE)

        # -------------------------------------------------
        # Required columns
        # -------------------------------------------------

        required_columns = [
            "PO_ID",
            "Supplier",
            "Order_Date",
            "Delivery_Date",
            "Item_Category",
            "Order_Status",
            "Quantity",
            "Unit_Price",
            "Negotiated_Price",
            "Defective_Units",
            "Compliance"
        ]

        for column in required_columns:
            if column not in df.columns:
                df[column] = ""

        # -------------------------------------------------
        # Find supplier
        # -------------------------------------------------

        search_supplier = supplier_name.strip().lower()

        supplier_df = df[
            df["Supplier"]
            .astype(str)
            .str.strip()
            .str.lower()
            == search_supplier
        ].copy()

        if supplier_df.empty:
            return {
                "success": False,
                "error": f"Supplier '{supplier_name}' not found."
            }

        # -------------------------------------------------
        # Numeric conversion
        # -------------------------------------------------

        supplier_df["Quantity"] = pd.to_numeric(
            supplier_df["Quantity"],
            errors="coerce"
        ).fillna(0)

        supplier_df["Unit_Price"] = pd.to_numeric(
            supplier_df["Unit_Price"],
            errors="coerce"
        ).fillna(0)

        supplier_df["Negotiated_Price"] = pd.to_numeric(
            supplier_df["Negotiated_Price"],
            errors="coerce"
        ).fillna(0)

        supplier_df["Defective_Units"] = pd.to_numeric(
            supplier_df["Defective_Units"],
            errors="coerce"
        ).fillna(0)

        # -------------------------------------------------
        # Overall supplier metrics
        # -------------------------------------------------

        total_orders = len(supplier_df)

        total_quantity = int(
            supplier_df["Quantity"].sum()
        )

        total_defective_units = int(
            supplier_df["Defective_Units"].sum()
        )

        procurement_value = float(
            (
                supplier_df["Quantity"]
                * supplier_df["Negotiated_Price"]
            ).sum()
        )

        defect_rate = 0

        if total_quantity > 0:
            defect_rate = (
                total_defective_units /
                total_quantity
            ) * 100

        # -------------------------------------------------
        # Compliance
        # -------------------------------------------------

        compliance_values = (
            supplier_df["Compliance"]
            .astype(str)
            .str.strip()
            .str.lower()
        )

        compliant_orders = int(
            compliance_values.isin(
                [
                    "yes",
                    "true",
                    "1",
                    "compliant"
                ]
            ).sum()
        )

        non_compliant_orders = int(
            compliance_values.isin(
                [
                    "no",
                    "false",
                    "0",
                    "non-compliant",
                    "non compliant"
                ]
            ).sum()
        )

        compliance_rate = 0

        if total_orders > 0:
            compliance_rate = (
                compliant_orders /
                total_orders
            ) * 100

        # -------------------------------------------------
        # Product / Category grouping
        # -------------------------------------------------

        products = []

        grouped_products = supplier_df.groupby(
            "Item_Category",
            dropna=False
        )

        for product_name, group in grouped_products:

            product_name = str(product_name)

            product_quantity = int(
                group["Quantity"].sum()
            )

            product_defective_units = int(
                group["Defective_Units"].sum()
            )

            product_procurement_value = float(
                (
                    group["Quantity"]
                    * group["Negotiated_Price"]
                ).sum()
            )

            product_defect_rate = 0

            if product_quantity > 0:
                product_defect_rate = (
                    product_defective_units /
                    product_quantity
                ) * 100

            product_compliance = (
                group["Compliance"]
                .astype(str)
                .str.strip()
                .str.lower()
            )

            product_non_compliant = product_compliance.isin(
                [
                    "no",
                    "false",
                    "0",
                    "non-compliant",
                    "non compliant"
                ]
            ).sum()

            if product_non_compliant > 0:
                product_compliance_status = "Non-Compliant"

            elif len(group) > 0 and (
                product_compliance.isin(
                    [
                        "yes",
                        "true",
                        "1",
                        "compliant"
                    ]
                ).sum()
                == len(group)
            ):
                product_compliance_status = "Compliant"

            else:
                product_compliance_status = "Review Required"

            products.append({

                "product": product_name,

                "total_orders": len(group),

                "total_quantity": product_quantity,

                "procurement_value": round(
                    product_procurement_value,
                    2
                ),

                "defective_units": product_defective_units,

                "defect_rate": round(
                    product_defect_rate,
                    2
                ),

                "compliance": product_compliance_status,

                "po_ids": [
                    str(po)
                    for po in group["PO_ID"].tolist()
                ]
            })

        # -------------------------------------------------
        # PO history
        # -------------------------------------------------

        orders = []

        for _, row in supplier_df.iterrows():

            quantity = float(
                row["Quantity"]
            )

            negotiated_price = float(
                row["Negotiated_Price"]
            )

            defective_units = float(
                row["Defective_Units"]
            )

            po_defect_rate = 0

            if quantity > 0:
                po_defect_rate = (
                    defective_units /
                    quantity
                ) * 100

            orders.append({

                "po_id": str(
                    row["PO_ID"]
                ),

                "order_date": str(
                    row["Order_Date"]
                ),

                "delivery_date": str(
                    row["Delivery_Date"]
                ),

                "product": str(
                    row["Item_Category"]
                ),

                "order_status": str(
                    row["Order_Status"]
                ),

                "quantity": int(
                    quantity
                ),

                "unit_price": round(
                    float(row["Unit_Price"]),
                    2
                ),

                "negotiated_price": round(
                    negotiated_price,
                    2
                ),

                "procurement_value": round(
                    quantity * negotiated_price,
                    2
                ),

                "defective_units": int(
                    defective_units
                ),

                "defect_rate": round(
                    po_defect_rate,
                    2
                ),

                "compliance": str(
                    row["Compliance"]
                )
            })

        # -------------------------------------------------
        # Return
        # -------------------------------------------------

        return {

            "success": True,

            "supplier": supplier_name,

            "summary": {

                "total_orders": total_orders,

                "total_quantity": total_quantity,

                "procurement_value": round(
                    procurement_value,
                    2
                ),

                "total_defective_units":
                    total_defective_units,

                "defect_rate": round(
                    defect_rate,
                    2
                ),

                "compliant_orders":
                    compliant_orders,

                "non_compliant_orders":
                    non_compliant_orders,

                "compliance_rate": round(
                    compliance_rate,
                    2
                )
            },

            "products": products,

            "orders": orders
        }

    except Exception as e:

        return {
            "success": False,
            "error": str(e)
        }



# ============================================================
# COMPLIANCE
# ============================================================

@app.get("/api/dashboard/compliance")
def dashboard_compliance():

    return compliance_summary()


# ============================================================
# PURCHASE ORDERS
# ============================================================

@app.get("/api/purchase-orders")
def purchase_orders(
    search: Optional[str] = None,
    supplier: Optional[str] = None,
    compliance: Optional[str] = None,
    limit: int = 100
):

    try:

        df = load_procurement_data()

        # Search
        if search:

            search_text = search.lower()

            mask = df.astype(str).apply(
                lambda row: row.str.lower().str.contains(
                    search_text,
                    na=False
                ).any(),
                axis=1
            )

            df = df[mask]

        # Supplier filter
        supplier_col = find_column(
            df,
            [
                "supplier",
                "supplier_name",
                "vendor",
                "vendor_name"
            ]
        )

        if supplier and supplier_col:

            df = df[
                df[supplier_col]
                .astype(str)
                .str.lower()
                .eq(supplier.lower())
            ]

        # Compliance filter
        compliance_col = find_column(
            df,
            [
                "compliance",
                "compliance_status",
                "compliant",
                "compliance_flag"
            ]
        )

        if compliance and compliance_col:

            df = df[
                df[compliance_col]
                .astype(str)
                .str.lower()
                .str.contains(
                    compliance.lower(),
                    na=False
                )
            ]

        # Limit
        limit = max(1, min(limit, 1000))

        df = df.head(limit)

        return {
            "count": len(df),
            "orders": dataframe_to_records(df),
            "columns": [str(col) for col in df.columns]
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Unable to load purchase orders: {str(e)}"
        )

# =====================================================
# DYNAMIC PRODUCT SEARCH
# =====================================================

@app.get("/api/products/search")
def search_products(q: str = ""):
    try:
        import pandas as pd

        # ---------------------------------------------------------
        # SEARCH TERM
        # ---------------------------------------------------------
        search_term = str(q or "").strip().lower()

        # ---------------------------------------------------------
        # PROCUREMENT DATASET PATH
        # ---------------------------------------------------------
        csv_path = r"C:\Users\T9957\Desktop\Procure_Bot\data\processed\procurement_cleaned.csv"

        # ---------------------------------------------------------
        # LOAD DATA
        # ---------------------------------------------------------
        df = pd.read_csv(csv_path)

        if df.empty:
            return {
                "success": True,
                "count": 0,
                "products": []
            }

        # ---------------------------------------------------------
        # REQUIRED COLUMNS
        # ---------------------------------------------------------
        required_columns = [
            "PO_ID",
            "Supplier",
            "Item_Category",
            "Quantity",
            "Unit_Price",
            "Negotiated_Price",
            "Defective_Units",
            "Compliance"
        ]

        missing_columns = [
            column
            for column in required_columns
            if column not in df.columns
        ]

        if missing_columns:
            return {
                "success": False,
                "error": "Missing columns: " + ", ".join(missing_columns)
            }

        # ---------------------------------------------------------
        # CLEAN STRING COLUMNS
        # ---------------------------------------------------------
        string_columns = [
            "PO_ID",
            "Supplier",
            "Item_Category",
            "Compliance"
        ]

        for column in string_columns:
            df[column] = (
                df[column]
                .fillna("")
                .astype(str)
                .str.strip()
            )

        # ---------------------------------------------------------
        # CONVERT NUMERIC COLUMNS
        # ---------------------------------------------------------
        numeric_columns = [
            "Quantity",
            "Unit_Price",
            "Negotiated_Price",
            "Defective_Units"
        ]

        for column in numeric_columns:
            df[column] = pd.to_numeric(
                df[column],
                errors="coerce"
            ).fillna(0)

        # ---------------------------------------------------------
        # SEARCH
        #
        # If search is empty:
        #     show all procurement products
        #
        # If search exists:
        #     search across multiple useful fields
        # ---------------------------------------------------------
        if search_term:

            searchable_columns = [
                "PO_ID",
                "Supplier",
                "Item_Category",
                "Compliance"
            ]

            search_mask = pd.Series(
                False,
                index=df.index
            )

            for column in searchable_columns:
                search_mask = (
                    search_mask
                    |
                    df[column]
                    .str.lower()
                    .str.contains(
                        search_term,
                        na=False,
                        regex=False
                    )
                )

            matched_df = df[search_mask].copy()

        else:
            matched_df = df.copy()

        # ---------------------------------------------------------
        # NO MATCH
        # ---------------------------------------------------------
        if matched_df.empty:
            return {
                "success": True,
                "count": 0,
                "products": []
            }

        # ---------------------------------------------------------
        # GROUP BY PRODUCT + SUPPLIER
        # ---------------------------------------------------------
        grouped = (
            matched_df
            .groupby(
                [
                    "Item_Category",
                    "Supplier"
                ],
                dropna=False
            )
            .agg(
                order_count=("PO_ID", "count"),
                total_quantity=("Quantity", "sum"),
                average_unit_price=("Unit_Price", "mean"),
                average_negotiated_price=(
                    "Negotiated_Price",
                    "mean"
                ),
                defective_units=(
                    "Defective_Units",
                    "sum"
                )
            )
            .reset_index()
        )

        # ---------------------------------------------------------
        # DEFECT RATE
        # ---------------------------------------------------------
        grouped["defect_rate"] = (
            grouped["defective_units"]
            /
            grouped["total_quantity"].replace(0, 1)
            *
            100
        )

        # ---------------------------------------------------------
        # BUILD PRODUCT RESPONSE
        # ---------------------------------------------------------
        products = []

        for _, row in grouped.iterrows():

            product_name = str(
                row["Item_Category"]
            ).strip()

            supplier_name = str(
                row["Supplier"]
            ).strip()

            products.append({

                "product": product_name,

                "category": product_name,

                "supplier": supplier_name,

                "order_count": int(
                    row["order_count"]
                ),

                "total_quantity": int(
                    row["total_quantity"]
                ),

                "average_unit_price": round(
                    float(
                        row["average_unit_price"]
                    ),
                    2
                ),

                "average_negotiated_price": round(
                    float(
                        row["average_negotiated_price"]
                    ),
                    2
                ),

                "defective_units": int(
                    row["defective_units"]
                ),

                "defect_rate": round(
                    float(
                        row["defect_rate"]
                    ),
                    2
                )
            })

        # ---------------------------------------------------------
        # SORT
        # Highest order count first
        # ---------------------------------------------------------
        products.sort(
            key=lambda item: item["order_count"],
            reverse=True
        )

        # ---------------------------------------------------------
        # FINAL RESPONSE
        # ---------------------------------------------------------
        return {
            "success": True,
            "count": len(products),
            "products": products
        }

    except FileNotFoundError:
        return {
            "success": False,
            "error": "Procurement CSV file not found."
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

@app.get("/api/procurement-requests/{request_id}/supplier-sourcing")
def supplier_sourcing(request_id: int):
    try:
        import pandas as pd

        # ---------------------------------------------------------
        # LOAD PROCUREMENT REQUEST
        # ---------------------------------------------------------

        conn = sqlite3.connect(
            PROCUREMENT_REQUEST_DB_PATH
        )

        conn.row_factory = sqlite3.Row

        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                id,
                item,
                category,
                quantity,
                required_date,
                notes,
                status,
                created_at
            FROM procurement_requests
            WHERE id = ?
        """, (request_id,))

        row = cursor.fetchone()

        conn.close()

        if row is None:
            return {
                "success": False,
                "error": "Procurement request not found."
            }

        request_data = dict(row)

        # ---------------------------------------------------------
        # ONLY APPROVED REQUESTS
        # ---------------------------------------------------------

        if request_data["status"] != "Approved":
            return {
                "success": False,
                "error": (
                    "Supplier sourcing is available "
                    "only for approved procurement requests."
                )
            }

        # ---------------------------------------------------------
        # PROCUREMENT CSV
        # ---------------------------------------------------------

        csv_path = (
            r"C:\Users\T9957\Desktop\Procure_Bot"
            r"\data\processed\procurement_cleaned.csv"
        )

        df = pd.read_csv(csv_path)

        if df.empty:
            return {
                "success": True,
                "request": request_data,
                "match_type": "none",
                "suppliers": []
            }

        # ---------------------------------------------------------
        # NORMALIZE VALUES
        # ---------------------------------------------------------

        item = str(
            request_data.get("item") or ""
        ).strip().lower()

        category = str(
            request_data.get("category") or ""
        ).strip().lower()

        # ---------------------------------------------------------
        # CATEGORY MAPPING
        # ---------------------------------------------------------

        category_mapping = {
            "laptop": "electronics",
            "computer": "electronics",
            "desktop": "electronics",
            "monitor": "electronics",
            "keyboard": "electronics",
            "mouse": "electronics",
            "printer": "electronics",
            "scanner": "electronics",
            "tablet": "electronics",
            "mobile": "electronics",
            "phone": "electronics",

            "paper": "office supplies",
            "pen": "office supplies",
            "notebook": "office supplies",
            "stationery": "office supplies",

            "bolt": "mro",
            "nut": "mro",
            "tools": "mro",
            "maintenance": "mro",

            "box": "packaging",
            "carton": "packaging",
            "packaging": "packaging",

            "steel": "raw materials",
            "plastic": "raw materials",
            "metal": "raw materials"
        }

        # ---------------------------------------------------------
        # DETERMINE TARGET CATEGORY
        # ---------------------------------------------------------

        target_category = ""

        if item in category_mapping:
            target_category = category_mapping[item]

        elif category:
            target_category = category

        # ---------------------------------------------------------
        # CATEGORY MATCH
        # ---------------------------------------------------------

        matched_df = pd.DataFrame()

        if target_category:
            matched_df = df[
                df["Item_Category"]
                .fillna("")
                .astype(str)
                .str.lower()
                .str.strip()
                == target_category
            ].copy()

        # ---------------------------------------------------------
        # EXACT ITEM SEARCH
        #
        # Dataset currently has no Product column.
        # Therefore item-specific matching cannot be claimed.
        # ---------------------------------------------------------

        has_product_column = (
            "Product" in df.columns
            or "Product_Name" in df.columns
            or "Item" in df.columns
        )

        exact_product_match = pd.DataFrame()

        if has_product_column:

            possible_product_columns = [
                "Product",
                "Product_Name",
                "Item"
            ]

            product_column = None

            for column in possible_product_columns:
                if column in df.columns:
                    product_column = column
                    break

            if product_column:

                exact_product_match = df[
                    df[product_column]
                    .fillna("")
                    .astype(str)
                    .str.lower()
                    .str.contains(
                        item,
                        na=False,
                        regex=False
                    )
                ].copy()

        # ---------------------------------------------------------
        # DETERMINE MATCH TYPE
        # ---------------------------------------------------------

        if not exact_product_match.empty:

            matched_df = exact_product_match

            match_type = "product"

        elif not matched_df.empty:

            match_type = "category"

        else:

            match_type = "none"

        # ---------------------------------------------------------
        # NO SUPPLIER MATCH
        # ---------------------------------------------------------

        if matched_df.empty:

            return {
                "success": True,
                "request": request_data,
                "match_type": "none",
                "message": (
                    "No matching procurement records "
                    "were found for this request."
                ),
                "suppliers": []
            }

        # ---------------------------------------------------------
        # SUPPLIER GROUPING
        # ---------------------------------------------------------

        grouped = (
            matched_df
            .groupby("Supplier")
            .agg(
                order_count=("PO_ID", "count"),
                total_quantity=("Quantity", "sum"),
                average_unit_price=(
                    "Unit_Price",
                    "mean"
                ),
                average_negotiated_price=(
                    "Negotiated_Price",
                    "mean"
                ),
                defective_units=(
                    "Defective_Units",
                    "sum"
                )
            )
            .reset_index()
        )

        # ---------------------------------------------------------
        # DEFECT RATE
        # ---------------------------------------------------------

        grouped["defect_rate"] = (
            grouped["defective_units"]
            /
            grouped["total_quantity"].replace(
                0,
                1
            )
            *
            100
        )

        # ---------------------------------------------------------
        # SUPPLIER RESULTS
        # ---------------------------------------------------------

        suppliers = []

        for _, supplier in grouped.iterrows():

            suppliers.append({

                "supplier": str(
                    supplier["Supplier"]
                ),

                "order_count": int(
                    supplier["order_count"]
                ),

                "total_quantity": int(
                    supplier["total_quantity"]
                ),

                "average_unit_price": round(
                    float(
                        supplier[
                            "average_unit_price"
                        ]
                    ),
                    2
                ),

                "average_negotiated_price": round(
                    float(
                        supplier[
                            "average_negotiated_price"
                        ]
                    ),
                    2
                ),

                "defective_units": int(
                    supplier[
                        "defective_units"
                    ]
                ),

                "defect_rate": round(
                    float(
                        supplier["defect_rate"]
                    ),
                    2
                )
            })

        suppliers.sort(
            key=lambda x: x["order_count"],
            reverse=True
        )

        # ---------------------------------------------------------
        # RESPONSE
        # ---------------------------------------------------------

        return {
            "success": True,

            "request": request_data,

            "requested_item": request_data[
                "item"
            ],

            "requested_category": request_data[
                "category"
            ],

            "matched_category": (
                target_category
                if target_category
                else None
            ),

            "match_type": match_type,

            "supplier_count": len(
                suppliers
            ),

            "suppliers": suppliers
        }

    except Exception as e:

        print(
            "Supplier sourcing error:",
            str(e)
        )

        return {
            "success": False,
            "error": str(e)
        }

    
            
# ============================================================
# SINGLE PURCHASE ORDER
# ============================================================

@app.get("/api/purchase-orders/{po_number}")
def get_purchase_order(po_number: str):

    try:

        df = load_procurement_data()

        po_col = find_column(
            df,
            [
                "po_number",
                "po_no",
                "purchase_order",
                "purchase_order_number",
                "order_id",
                "po"
            ]
        )

        if not po_col:

            raise HTTPException(
                status_code=500,
                detail="Purchase order column not found."
            )

        result = df[
            df[po_col]
            .astype(str)
            .str.lower()
            .eq(po_number.lower())
        ]

        if result.empty:

            raise HTTPException(
                status_code=404,
                detail=f"Purchase order {po_number} not found."
            )

        return {
            "order": dataframe_to_records(result)[0]
        }

    except HTTPException:
        raise

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ============================================================
# SUPPLIERS
# ============================================================

@app.get("/api/suppliers")
def suppliers():

    try:

        summary = supplier_performance_summary()

        return {
            "count": len(summary),
            "suppliers": dataframe_to_records(summary)
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Unable to load suppliers: {str(e)}"
        )


# ============================================================
# ANALYTICS SUMMARY
# ============================================================

@app.get("/api/analytics/summary")
def analytics_summary():

    compliance = compliance_summary()

    return {
        "procurement": {
            "total_value": total_procurement_value(),
            "total_savings": total_savings(),
            "total_orders": total_orders(),
        },

        "quality": {
            "total_defective_units": total_defective_units(),
            "highest_po_defect": highest_defect_rate(),
            "lowest_po_defect": lowest_defect_rate(),
            "highest_supplier_defect": highest_supplier_defect_rate(),
            "lowest_supplier_defect": lowest_supplier_defect_rate(),
        },

        "compliance": {
            "rate": compliance["compliance_rate"],
            "compliant_orders": compliance["compliant_orders"],
            "non_compliant_orders": compliance["non_compliant_orders"],
        }
    }


# ============================================================
# DATASET INFO
# ============================================================

@app.get("/api/data/info")
def data_info():

    try:

        df = load_procurement_data()

        return {
            "file": str(DATA_FILE),
            "rows": len(df),
            "columns": len(df.columns),
            "column_names": [
                str(col)
                for col in df.columns
            ]
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# ============================================================
# RFQ EMAIL GENERATOR
# ============================================================

@app.post("/api/rfq/generate")
def generate_rfq(request: RFQRequest):

    # --------------------------------------------------------
    # VALIDATION
    # --------------------------------------------------------

    if not request.supplier.strip():
        raise HTTPException(
            status_code=400,
            detail="Supplier name is required."
        )

    if not request.item.strip():
        raise HTTPException(
            status_code=400,
            detail="Item name is required."
        )

    if request.quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Quantity must be greater than zero."
        )

    supplier = request.supplier.strip()
    item = request.item.strip()
    item_lower = item.lower()

    required_date = (
        request.required_date.strip()
        if request.required_date
        else "Please confirm the earliest available delivery date"
    )

    additional = (
        request.additional_requirements.strip()
        if request.additional_requirements
        else "Please include applicable taxes, shipping charges, warranty terms, and payment terms."
    )

    # --------------------------------------------------------
    # DEFAULT VALUES
    # --------------------------------------------------------

    category = "General Procurement"

    requirements = [
        "Product / service specification",
        "Brand / manufacturer if applicable",
        "Technical specifications",
        "Quantity and unit of measurement",
        "Unit price",
        "Total price",
        "Quality standards / certifications",
        "Warranty details if applicable",
        "Delivery timeline",
        "Taxes and applicable charges",
        "Payment terms",
        "Quotation validity"
    ]

    subject = f"Request for Quotation - {item}"

    # --------------------------------------------------------
    # LAPTOP / COMPUTER / IT EQUIPMENT
    # --------------------------------------------------------

    if any(word in item_lower for word in [
        "laptop",
        "computer",
        "desktop",
        "pc",
        "notebook",
        "workstation",
        "monitor",
        "printer"
    ]):

        category = "IT Equipment"

        requirements = [
            "Brand and model",
            "Processor specification",
            "RAM / memory configuration",
            "Storage capacity and type",
            "Display specification",
            "Operating system",
            "Technical specifications",
            "Unit price",
            "Total price",
            "Warranty period",
            "Delivery timeline",
            "Taxes and applicable charges",
            "Payment terms",
            "Quotation validity"
        ]

        subject = f"Request for Quotation - {item} - IT Equipment"

    # --------------------------------------------------------
    # MOBILE / TABLET
    # --------------------------------------------------------

    elif any(word in item_lower for word in [
        "mobile",
        "smartphone",
        "phone",
        "tablet",
        "iphone",
        "android",
        "ipad"
    ]):

        category = "Mobile / Consumer Electronics"

        requirements = [
            "Brand and model",
            "Processor specification",
            "RAM and storage",
            "Display specification",
            "Battery capacity",
            "Camera specification",
            "Operating system",
            "Unit price",
            "Total price",
            "Warranty details",
            "Delivery timeline",
            "Taxes and applicable charges",
            "Payment terms",
            "Quotation validity"
        ]

        subject = f"Request for Quotation - {item} - Consumer Electronics"

    # --------------------------------------------------------
    # POWER CABLE / ELECTRICAL CABLE
    # --------------------------------------------------------

    elif any(word in item_lower for word in [
        "power cable",
        "electrical cable",
        "electric cable",
        "wire",
        "power wire"
    ]):

        category = "Electrical Cable"

        requirements = [
            "Cable type",
            "Conductor material",
            "Number of cores",
            "Gauge / cross-section",
            "Cable length",
            "Voltage rating",
            "Current rating",
            "Insulation material",
            "Sheathing material",
            "Applicable standards and certifications",
            "Unit price",
            "Total price",
            "Packaging details",
            "Delivery timeline",
            "Taxes and applicable charges",
            "Payment terms",
            "Quotation validity"
        ]

        subject = f"Request for Quotation - {item} - Electrical Cable"

    # --------------------------------------------------------
    # NETWORK CABLE
    # --------------------------------------------------------

    elif any(word in item_lower for word in [
        "network cable",
        "ethernet cable",
        "ethernet",
        "cat5",
        "cat6",
        "lan cable"
    ]):

        category = "Network Cable"

        requirements = [
            "Cable category",
            "Cable type",
            "Conductor material",
            "Cable length",
            "Gauge / cross-section",
            "Bandwidth specification",
            "Shielding type",
            "Insulation / sheathing material",
            "Applicable networking standards",
            "Certifications",
            "Unit price",
            "Total price",
            "Packaging details",
            "Delivery timeline",
            "Taxes and applicable charges",
            "Payment terms",
            "Quotation validity"
        ]

        subject = f"Request for Quotation - {item} - Network Cable"

    # --------------------------------------------------------
    # ELECTRICAL / ELECTRONIC ITEMS
    # --------------------------------------------------------

    elif any(word in item_lower for word in [
        "switch",
        "socket",
        "led",
        "sensor",
        "electronic component",
        "networking equipment"
    ]):

        category = "Electrical / Electronic Equipment"

        requirements = [
            "Product type",
            "Brand / manufacturer",
            "Model number",
            "Technical specifications",
            "Voltage / power requirements",
            "Quantity",
            "Unit price",
            "Total price",
            "Applicable standards / certifications",
            "Warranty details",
            "Delivery timeline",
            "Taxes and applicable charges",
            "Payment terms",
            "Quotation validity"
        ]

        subject = f"Request for Quotation - {item} - Electrical / Electronic"

    # --------------------------------------------------------
    # RAW MATERIAL
    # --------------------------------------------------------

    elif any(word in item_lower for word in [
        "steel",
        "iron",
        "metal",
        "aluminium",
        "aluminum",
        "copper",
        "cement",
        "plastic",
        "rubber",
        "chemical",
        "raw material"
    ]):

        category = "Raw Material"

        requirements = [
            "Material grade / specification",
            "Material composition",
            "Dimensions / size",
            "Quantity and unit of measurement",
            "Unit price",
            "Total price",
            "Quality standards",
            "Certifications",
            "Packaging details",
            "Delivery timeline",
            "Taxes and applicable charges",
            "Payment terms",
            "Quotation validity"
        ]

        subject = f"Request for Quotation - {item} - Raw Material"

    # --------------------------------------------------------
    # INDUSTRIAL EQUIPMENT
    # --------------------------------------------------------

    elif any(word in item_lower for word in [
        "machine",
        "machinery",
        "generator",
        "motor",
        "pump",
        "compressor",
        "transformer",
        "industrial equipment"
    ]):

        category = "Industrial Equipment"

        requirements = [
            "Equipment model",
            "Technical specifications",
            "Capacity / performance",
            "Power requirements",
            "Operating specifications",
            "Unit price",
            "Total price",
            "Installation charges",
            "Warranty period",
            "Maintenance / service details",
            "Delivery timeline",
            "Taxes and applicable charges",
            "Payment terms",
            "Quotation validity"
        ]

        subject = f"Request for Quotation - {item} - Industrial Equipment"

    # --------------------------------------------------------
    # SOFTWARE / CLOUD
    # --------------------------------------------------------

    elif any(word in item_lower for word in [
        "software",
        "license",
        "licence",
        "subscription",
        "saas",
        "cloud",
        "hosting"
    ]):

        category = "Software / Digital Service"

        requirements = [
            "Software / service name",
            "Version / edition",
            "Number of users / licenses",
            "Subscription period",
            "Features and technical specifications",
            "Implementation / setup charges",
            "Unit price",
            "Total price",
            "Support and maintenance",
            "Taxes and applicable charges",
            "Payment terms",
            "Quotation validity"
        ]

        subject = f"Request for Quotation - {item} - Software"

    # --------------------------------------------------------
    # OFFICE / FURNITURE
    # --------------------------------------------------------

    elif any(word in item_lower for word in [
        "chair",
        "table",
        "desk",
        "furniture",
        "cabinet",
        "office",
        "stationery",
        "paper"
    ]):

        category = "Office Supplies / Furniture"

        requirements = [
            "Product specification",
            "Brand / manufacturer",
            "Material",
            "Dimensions",
            "Quantity",
            "Unit price",
            "Total price",
            "Warranty details",
            "Delivery timeline",
            "Installation charges if applicable",
            "Taxes and applicable charges",
            "Payment terms",
            "Quotation validity"
        ]

        subject = f"Request for Quotation - {item} - Office Supplies"

    # --------------------------------------------------------
    # SUPPLIER INTRODUCTION
    # --------------------------------------------------------

    supplier_lower = supplier.lower()

    if any(word in supplier_lower for word in [
        "logistics",
        "transport",
        "shipping",
        "freight"
    ]):

        introduction = (
            f"We would like to request a quotation from {supplier} "
            f"for the supply and delivery of the following requirement."
        )

    elif any(word in supplier_lower for word in [
        "tech",
        "technology",
        "software",
        "solutions",
        "systems"
    ]):

        introduction = (
            f"We would like to request a detailed technical and commercial "
            f"quotation from {supplier} for the following requirement."
        )

    elif any(word in supplier_lower for word in [
        "manufacturing",
        "manufacturer",
        "industries",
        "industrial"
    ]):

        introduction = (
            f"We would like to request a detailed technical and commercial "
            f"quotation from {supplier} for the following requirement."
        )

    else:

        introduction = (
            f"We would like to request a quotation from {supplier} "
            f"for the following procurement requirement."
        )

    # --------------------------------------------------------
    # REQUIREMENT LIST
    # --------------------------------------------------------

    requirement_text = "\n".join(
        f"{index}. {requirement}"
        for index, requirement in enumerate(requirements, start=1)
    )

    # --------------------------------------------------------
    # EMAIL BODY
    # --------------------------------------------------------

    body = f"""Dear {supplier} Team,

{introduction}

Procurement Category: {category}

Item: {item}
Quantity: {request.quantity}
Required Delivery Date: {required_date}

Please provide the following details in your quotation:

{requirement_text}

Additional Requirements:
{additional}

Please ensure that all technical and commercial details are clearly mentioned in the quotation.

Please share your quotation at the earliest convenience.

Thank you.

Best regards,
Procurement Team
"""
    # Save generated RFQ to SQLite database

    conn = sqlite3.connect(RFQ_DB_PATH)

    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO rfq_history (
            supplier,
            item,
            quantity,
            required_date,
            category,
            subject,
            body,
            created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        supplier,
        item,
        request.quantity,
        required_date,
        category,
        subject,
        body.strip(),
        datetime.now().isoformat()
    ))

    conn.commit()

    conn.close()

    return {
        "success": True,
        "supplier": supplier,
        "item": item,
        "quantity": request.quantity,
        "required_date": required_date,
        "category": category,
        "subject": subject,
        "body": body.strip()
    }
# ============================================================
# SYSTEM STATUS
# ============================================================

@app.get("/api/system/status")
def system_status():

    qdrant_status = "Configured"
    ollama_status = "Configured"
    rag_status = "Active"

    return {
        "backend": "Online",
        "qdrant": qdrant_status,
        "ollama": ollama_status,
        "rag": rag_status
    }

# ============================================================
# RFQ HISTORY DATABASE
# ============================================================

RFQ_DB_PATH = str(BASE_DIR / "data" / "rfq_history.db")


def init_rfq_database():

    conn = sqlite3.connect(RFQ_DB_PATH)

    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS rfq_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            supplier TEXT NOT NULL,
            item TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            required_date TEXT,
            category TEXT,
            subject TEXT,
            body TEXT,
            created_at TEXT NOT NULL
        )
    """)

    conn.commit()
    conn.close()


init_rfq_database()

# ============================================================
# GET RFQ HISTORY
# ============================================================

@app.get("/api/rfq/history")
def get_rfq_history():

    try:

        conn = sqlite3.connect(RFQ_DB_PATH)
        conn.row_factory = sqlite3.Row

        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                id,
                supplier,
                item,
                quantity,
                required_date,
                category,
                subject,
                body,
                created_at
            FROM rfq_history
            ORDER BY id DESC
        """)

        rows = cursor.fetchall()

        conn.close()

        rfqs = [dict(row) for row in rows]

        return {
            "success": True,
            "count": len(rfqs),
            "rfqs": rfqs
        }

    except Exception as e:

        return {
            "success": False,
            "error": str(e)
        }
# ============================================================
# PROCUREMENT REQUEST DATABASE
# ============================================================

PROCUREMENT_REQUEST_DB_PATH = str(BASE_DIR / "data" / "procurement_requests.db")


def init_procurement_request_database():
    os.makedirs(BASE_DIR / "data", exist_ok=True)

    conn = sqlite3.connect(PROCUREMENT_REQUEST_DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS procurement_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item TEXT NOT NULL,
            category TEXT,
            quantity INTEGER NOT NULL,
            required_date TEXT,
            notes TEXT,
            status TEXT NOT NULL DEFAULT 'New',
            created_at TEXT NOT NULL
        )
    """)

    conn.commit()
    conn.close()


init_procurement_request_database()


# ============================================================
# CREATE PROCUREMENT REQUEST
# ============================================================

@app.post("/api/procurement-requests")
def create_procurement_request(request: dict):

    try:
        item = str(request.get("item", "")).strip()
        category = str(request.get("category", "")).strip()
        required_date = str(
            request.get("required_date", "")
        ).strip()
        notes = str(request.get("notes", "")).strip()

        quantity = request.get("quantity")

        if not item:
            return {
                "success": False,
                "error": "Item is required."
            }

        if quantity is None or str(quantity).strip() == "":
            return {
                "success": False,
                "error": "Quantity is required."
            }

        try:
            quantity = int(quantity)
        except (TypeError, ValueError):
            return {
                "success": False,
                "error": "Quantity must be a valid number."
            }

        if quantity <= 0:
            return {
                "success": False,
                "error": "Quantity must be greater than zero."
            }

        created_at = datetime.now().isoformat(
            timespec="seconds"
        )

        conn = sqlite3.connect(
            PROCUREMENT_REQUEST_DB_PATH
        )

        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO procurement_requests (
                item,
                category,
                quantity,
                required_date,
                notes,
                status,
                created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            item,
            category,
            quantity,
            required_date,
            notes,
            "New",
            created_at
        ))

        request_id = cursor.lastrowid

        conn.commit()
        conn.close()

        return {
            "success": True,
            "message": "Procurement request created successfully.",
            "request_id": request_id,
            "data": {
                "id": request_id,
                "item": item,
                "category": category,
                "quantity": quantity,
                "required_date": required_date,
                "notes": notes,
                "status": "New",
                "created_at": created_at
            }
        }

    except Exception as e:

        return {
            "success": False,
            "error": str(e)
        }


# ============================================================
# GET PROCUREMENT REQUESTS
# ============================================================

@app.get("/api/procurement-requests")
def get_procurement_requests():

    try:

        conn = sqlite3.connect(
            PROCUREMENT_REQUEST_DB_PATH
        )

        conn.row_factory = sqlite3.Row

        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                id,
                item,
                category,
                quantity,
                required_date,
                notes,
                status,
                created_at
            FROM procurement_requests
            ORDER BY id DESC
        """)

        rows = cursor.fetchall()

        conn.close()

        requests = [
            dict(row)
            for row in rows
        ]

        return {
            "success": True,
            "count": len(requests),
            "requests": requests
        }

    except Exception as e:

        return {
            "success": False,
            "error": str(e)
        }


# ============================================================
# GET SINGLE PROCUREMENT REQUEST
# ============================================================

@app.get("/api/procurement-requests/{request_id}")
def get_procurement_request(request_id: int):

    try:

        conn = sqlite3.connect(
            PROCUREMENT_REQUEST_DB_PATH
        )

        conn.row_factory = sqlite3.Row

        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                id,
                item,
                category,
                quantity,
                required_date,
                notes,
                status,
                created_at
            FROM procurement_requests
            WHERE id = ?
        """, (request_id,))

        row = cursor.fetchone()

        conn.close()

        if row is None:
            return {
                "success": False,
                "error": "Procurement request not found."
            }

        return {
            "success": True,
            "data": dict(row)
        }

    except Exception as e:

        return {
            "success": False,
            "error": str(e)
        }
    

# ============================================================
# UPDATE PROCUREMENT REQUEST STATUS
# ============================================================

@app.put("/api/procurement-requests/{request_id}/status")
def update_procurement_request_status(
    request_id: int,
    request: dict
):

    try:

        status = str(
            request.get("status", "")
        ).strip()

        allowed_statuses = [
            "New",
            "In Review",
            "Approved",
            "Rejected"
        ]

        if status not in allowed_statuses:
            return {
                "success": False,
                "error": (
                    "Invalid status. "
                    "Allowed values: New, In Review, "
                    "Approved, Rejected."
                )
            }

        conn = sqlite3.connect(
            PROCUREMENT_REQUEST_DB_PATH
        )

        cursor = conn.cursor()

        cursor.execute("""
            SELECT id
            FROM procurement_requests
            WHERE id = ?
        """, (request_id,))

        existing_request = cursor.fetchone()

        if existing_request is None:

            conn.close()

            return {
                "success": False,
                "error": "Procurement request not found."
            }

        cursor.execute("""
            UPDATE procurement_requests
            SET status = ?
            WHERE id = ?
        """, (
            status,
            request_id
        ))

        conn.commit()

        cursor.execute("""
            SELECT
                id,
                item,
                category,
                quantity,
                required_date,
                notes,
                status,
                created_at
            FROM procurement_requests
            WHERE id = ?
        """, (request_id,))

        row = cursor.fetchone()

        conn.close()

        return {
            "success": True,
            "message": "Procurement request status updated successfully.",
            "data": {
                "id": row[0],
                "item": row[1],
                "category": row[2],
                "quantity": row[3],
                "required_date": row[4],
                "notes": row[5],
                "status": row[6],
                "created_at": row[7]
            }
        }

    except Exception as e:

        return {
            "success": False,
            "error": str(e)
        }

    
# ============================================================
# DELETE RFQ FROM HISTORY
# ============================================================

@app.delete("/api/rfq/history/{rfq_id}")
def delete_rfq_history(rfq_id: int):

    try:

        conn = sqlite3.connect(RFQ_DB_PATH)

        cursor = conn.cursor()

        cursor.execute(
            "DELETE FROM rfq_history WHERE id = ?",
            (rfq_id,)
        )

        deleted_rows = cursor.rowcount

        conn.commit()

        conn.close()

        if deleted_rows == 0:
            return {
                "success": False,
                "error": "RFQ not found."
            }

        return {
            "success": True,
            "message": "RFQ deleted successfully.",
            "id": rfq_id
        }

    except Exception as e:

        return {
            "success": False,
            "error": str(e)
        }

    
# ============================================================
# SUPPLIER COMPARISON
# ============================================================

@app.get("/api/supplier-comparison")
def supplier_comparison():

    try:
        import pandas as pd

        csv_path = r"data\processed\procurement_cleaned.csv"

        df = pd.read_csv(csv_path)

        # Convert numeric columns
        numeric_columns = [
            "Quantity",
            "Unit_Price",
            "Negotiated_Price",
            "Defective_Units"
        ]

        for column in numeric_columns:
            df[column] = pd.to_numeric(
                df[column],
                errors="coerce"
            ).fillna(0)

        # Calculate procurement value
        df["Procurement_Value"] = (
            df["Quantity"] * df["Negotiated_Price"]
        )

        # Calculate savings
        df["Savings"] = (
            df["Quantity"] *
            (df["Unit_Price"] - df["Negotiated_Price"])
        )

        supplier_data = []

        # Group by supplier
        for supplier, group in df.groupby("Supplier"):

            total_orders = len(group)

            total_quantity = group["Quantity"].sum()

            defective_units = group["Defective_Units"].sum()

            total_procurement_value = (
                group["Procurement_Value"].sum()
            )

            total_savings = group["Savings"].sum()

            # Defect rate
            if total_quantity > 0:
                defect_rate = (
                    defective_units /
                    total_quantity
                ) * 100
            else:
                defect_rate = 0

            # Average prices
            average_unit_price = (
                group["Unit_Price"].mean()
            )

            average_negotiated_price = (
                group["Negotiated_Price"].mean()
            )

            # Compliance
            compliance_values = (
                group["Compliance"]
                .astype(str)
                .str.strip()
                .str.lower()
            )

            compliant_orders = (
                compliance_values.isin([
                    "yes",
                    "true",
                    "1",
                    "compliant"
                ]).sum()
            )

            non_compliant_orders = (
                total_orders - compliant_orders
            )

            if total_orders > 0:
                compliance_rate = (
                    compliant_orders /
                    total_orders
                ) * 100
            else:
                compliance_rate = 0

            supplier_data.append({
                "supplier": supplier,
                "total_orders": int(total_orders),
                "total_quantity": int(total_quantity),
                "defective_units": int(defective_units),
                "defect_rate": round(defect_rate, 2),
                "average_unit_price": round(
                    average_unit_price, 2
                ),
                "average_negotiated_price": round(
                    average_negotiated_price, 2
                ),
                "total_procurement_value": round(
                    total_procurement_value, 2
                ),
                "total_savings": round(
                    total_savings, 2
                ),
                "compliant_orders": int(
                    compliant_orders
                ),
                "non_compliant_orders": int(
                    non_compliant_orders
                ),
                "compliance_rate": round(
                    compliance_rate, 2
                )
            })

        return {
            "success": True,
            "count": len(supplier_data),
            "suppliers": supplier_data
        }

    except Exception as e:

        return {
            "success": False,
            "error": str(e)
        }
    
# ============================================================
# COMPLIANCE CHECKER API
# ============================================================

@app.post("/api/compliance/check")
def compliance_check(request: dict):
    """
    Check compliance for a specific purchase order.
    """

    po_id = request.get("po_id")

    if not po_id:
        return {
            "success": False,
            "error": "PO ID is required."
        }

    try:
        result = check_compliance(po_id)

        return {
            "success": True,
            "data": result
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


