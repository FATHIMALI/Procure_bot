import streamlit as st
import pandas as pd

from src.config import PROCESSED_DATA_DIR


# ============================================================
# PAGE CONFIGURATION
# ============================================================

st.set_page_config(
    page_title="Procure Bot | Vendor Quality Dashboard",
    page_icon="📦",
    layout="wide"
)


# ============================================================
# LOAD DATA
# ============================================================

DATA_FILE = PROCESSED_DATA_DIR / "procurement_final.csv"


@st.cache_data
def load_data():

    df = pd.read_csv(DATA_FILE)

    return df


df = load_data()


# ============================================================
# PAGE HEADER
# ============================================================

st.title("📦 Procure Bot")

st.subheader(
    "Intelligent Procurement & Vendor Quality Analysis Dashboard"
)

st.markdown(
    """
    Analyze procurement orders, supplier performance,
    quality metrics, compliance and negotiation savings.
    """
)

st.divider()


# ============================================================
# KPI CALCULATIONS
# ============================================================

total_orders = len(df)

total_value = df["total_value"].sum()

total_savings = df["savings"].sum()

total_defective = df["defective_units"].sum()

compliant_orders = (
    df["compliance"]
    .astype(str)
    .str.lower()
    .eq("yes")
    .sum()
)

compliance_rate = (
    compliant_orders / total_orders * 100
    if total_orders > 0
    else 0
)


# ============================================================
# KPI CARDS
# ============================================================

col1, col2, col3, col4, col5 = st.columns(5)


with col1:

    st.metric(
        "📦 Total Orders",
        f"{total_orders:,}"
    )


with col2:

    st.metric(
        "💰 Procurement Value",
        f"${total_value:,.2f}"
    )


with col3:

    st.metric(
        "💵 Negotiation Savings",
        f"${total_savings:,.2f}"
    )


with col4:

    st.metric(
        "⚠️ Defective Units",
        f"{total_defective:,}"
    )


with col5:

    st.metric(
        "✅ Compliance Rate",
        f"{compliance_rate:.2f}%"
    )


st.divider()


# ============================================================
# SUPPLIER PERFORMANCE
# ============================================================

st.header("🏢 Supplier Performance")


supplier_summary = (
    df.groupby("supplier")
    .agg(
        total_orders=("po_id", "count"),
        total_quantity=("quantity", "sum"),
        defective_units=("defective_units", "sum"),
        procurement_value=("total_value", "sum"),
        negotiation_savings=("savings", "sum"),
    )
    .reset_index()
)


supplier_summary["defect_rate"] = (
    supplier_summary["defective_units"]
    / supplier_summary["total_quantity"]
    * 100
)


supplier_summary = supplier_summary.sort_values(
    "defect_rate",
    ascending=False
)


display_summary = supplier_summary.copy()

display_summary["defect_rate"] = (
    display_summary["defect_rate"]
    .round(2)
)


display_summary["procurement_value"] = (
    display_summary["procurement_value"]
    .round(2)
)


display_summary["negotiation_savings"] = (
    display_summary["negotiation_savings"]
    .round(2)
)


display_summary = display_summary.rename(
    columns={
        "supplier": "Supplier",
        "total_orders": "Orders",
        "total_quantity": "Quantity",
        "defective_units": "Defective Units",
        "defect_rate": "Defect Rate (%)",
        "procurement_value": "Procurement Value",
        "negotiation_savings": "Negotiation Savings",
    }
)


st.dataframe(
    display_summary,
    use_container_width=True,
    hide_index=True
)


st.divider()


# ============================================================
# SUPPLIER FILTER
# ============================================================

st.header("🔎 Supplier Analysis")


suppliers = sorted(
    df["supplier"]
    .dropna()
    .unique()
    .tolist()
)


selected_supplier = st.selectbox(
    "Select a supplier",
    ["All Suppliers"] + suppliers
)


if selected_supplier == "All Suppliers":

    filtered_df = df

else:

    filtered_df = df[
        df["supplier"] == selected_supplier
    ]


# ============================================================
# SELECTED SUPPLIER METRICS
# ============================================================

selected_orders = len(filtered_df)

selected_value = filtered_df["total_value"].sum()

selected_savings = filtered_df["savings"].sum()

selected_defective = filtered_df["defective_units"].sum()

selected_quantity = filtered_df["quantity"].sum()

selected_defect_rate = (
    selected_defective / selected_quantity * 100
    if selected_quantity > 0
    else 0
)


col1, col2, col3, col4 = st.columns(4)


with col1:

    st.metric(
        "Orders",
        f"{selected_orders:,}"
    )


with col2:

    st.metric(
        "Procurement Value",
        f"${selected_value:,.2f}"
    )


with col3:

    st.metric(
        "Negotiation Savings",
        f"${selected_savings:,.2f}"
    )


with col4:

    st.metric(
        "Defect Rate",
        f"{selected_defect_rate:.2f}%"
    )


st.divider()


# ============================================================
# DEFECT RATE CHART
# ============================================================

st.header("📊 Supplier Defect Rate")


chart_data = supplier_summary[
    ["supplier", "defect_rate"]
].copy()


chart_data = chart_data.set_index(
    "supplier"
)


st.bar_chart(
    chart_data,
    y="defect_rate"
)


st.divider()


# ============================================================
# PROCUREMENT STATUS
# ============================================================

st.header("📦 Procurement Order Status")


status_summary = (
    df["order_status"]
    .value_counts()
    .reset_index()
)


status_summary.columns = [
    "Order Status",
    "Orders"
]


st.dataframe(
    status_summary,
    use_container_width=True,
    hide_index=True
)


st.divider()


# ============================================================
# COMPLIANCE SUMMARY
# ============================================================

st.header("✅ Compliance Analysis")


compliance_counts = (
    df["compliance"]
    .astype(str)
    .str.strip()
    .str.title()
    .value_counts()
)


col1, col2 = st.columns(2)


with col1:

    st.metric(
        "Compliant Orders",
        f"{compliance_counts.get('Yes', 0):,}"
    )


with col2:

    st.metric(
        "Non-Compliant Orders",
        f"{compliance_counts.get('No', 0):,}"
    )


st.bar_chart(
    compliance_counts
)


# ============================================================
# FOOTER
# ============================================================

st.divider()

st.caption(
    "Procure Bot | Intelligent Procurement and Vendor "
    "Quality Analysis Assistant"
)