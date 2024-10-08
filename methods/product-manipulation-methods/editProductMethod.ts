import { Product, ProductStackParamList } from "../../types/type";
import { updateProductData } from "../data-methods/updateProductData";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { auth, db } from "../../firebaseConfig";
import { ToastType } from "react-native-toast-message";

export const handleSameProductData = (
  products: Product[],
  id: string,
  updateProduct: (productId: String, attribute: Partial<Product>) => void,
  navigation: NativeStackNavigationProp<
    ProductStackParamList,
    "EditProductScreen",
    undefined
  >,
  productInfo: {
    productName: string;
    stockPrice: string;
    sellPrice: string;
    lowStockThreshold: string;
    buyStock: string;
    editStock: string;
  },
  showToast: (type: ToastType, text1: string, text2?: string) => void
) => {
  const previousProductData = products.find(
    (previousProduct) => previousProduct.id === id
  );
  if (!previousProductData) {
    return;
  }
  const updatedProduct: Product = {
    id: id,
    productName: productInfo.productName,
    stockPrice: parseFloat(
      productInfo.stockPrice.trim() ? productInfo.stockPrice : "0"
    ),
    sellPrice: parseFloat(
      productInfo.sellPrice.trim() ? productInfo.sellPrice : "0"
    ),
    stock: parseFloat(
      productInfo.editStock.trim() ? productInfo.editStock : "0"
    ),
    lowStockThreshold: parseFloat(
      productInfo.lowStockThreshold.trim() ? productInfo.lowStockThreshold : "0"
    ),
  };
  const isSameData =
    previousProductData.productName === updatedProduct.productName &&
    previousProductData.stockPrice === updatedProduct.stockPrice &&
    previousProductData.sellPrice === updatedProduct.sellPrice &&
    previousProductData.stock === updatedProduct.stock &&
    previousProductData.lowStockThreshold === updatedProduct.lowStockThreshold;
  if (!isSameData) {
    updateProductData(updatedProduct, updateProduct, showToast);
    navigation.pop();
    navigation.replace("ProductInfoScreen", updatedProduct);
  } else {
    navigation.pop();
    navigation.replace("ProductInfoScreen", updatedProduct);
  }
};

export const handleBuyStock = async (
  stockToBuy: number,
  updateProduct: (productId: String, attribute: Partial<Product>) => void,
  products: Product[],
  id: string,
  navigation: NativeStackNavigationProp<
    ProductStackParamList,
    "EditProductScreen",
    undefined
  >,
  showToast: (type: ToastType, text1: string, text2?: string) => void
) => {
  try {
    if (isNaN(stockToBuy)) {
      showToast("error", "Stock value required", "Can not buy stock");
      return;
    }
    const getProductToUpdate = products.find((product) => product.id === id);
    if (getProductToUpdate) {
      const user = auth.currentUser;
      updateProduct(id, { stock: getProductToUpdate.stock + stockToBuy });
      await db
        .collection("users")
        .doc(user?.uid)
        .collection("products")
        .doc(id)
        .update({
          stock: getProductToUpdate.stock + stockToBuy,
        });

      const updatedProduct: Product = {
        id: id,
        productName: getProductToUpdate.productName,
        stockPrice: getProductToUpdate.stockPrice,
        sellPrice: getProductToUpdate.sellPrice,
        stock: getProductToUpdate.stock + stockToBuy,
        lowStockThreshold: getProductToUpdate.lowStockThreshold,
      };
      showToast("success", "Stocks added successfully");
      navigation.pop();
      navigation.replace("ProductInfoScreen", updatedProduct);
    }
  } catch (error) {
    showToast("error", "Error occured", "Try again later");
  }
};
