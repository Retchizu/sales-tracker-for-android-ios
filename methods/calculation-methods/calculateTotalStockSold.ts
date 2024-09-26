import { Product, SalesReport } from "../../types/type";

export const calculateTotalStockSold = (
  salesReports: SalesReport[],
  productId: string
) => {
  let total = 0;
  salesReports.forEach((report) => {
    const extractedSelectedProduct = report.selectedProduct.find(
      (selectedProd) => selectedProd.id === productId
    );
    total += extractedSelectedProduct?.quantity
      ? extractedSelectedProduct.quantity
      : 0;
  });

  return total;
};