import { StyleSheet, View } from "react-native";
import React, { useState } from "react";
import CustomerForm from "../../../components/CustomerForm";
import { EditCustomerScreenProp } from "../../../types/type";
import { updateCustomerData } from "../../../methods/data-methods/updateCustomerData";
import { useCustomerContext } from "../../../context/CustomerContext";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useToastContext } from "../../../context/ToastContext";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";

const EditCustomerScreen = ({ route, navigation }: EditCustomerScreenProp) => {
  const customerId = route.params.id;
  const [customer, setCustomer] = useState({
    customerName: route.params.customerName,
    customerInfo: route.params.customerInfo,
  });

  const { updateCustomer } = useCustomerContext();
  const { showToast } = useToastContext();
  const navi = useNavigation();
  console.log(navigation.getState());
  const handleCustomerUpdateSubmit = () => {
    updateCustomerData(customerId, customer, updateCustomer, showToast);

    navigation.pop();
    navigation.replace("CustomerInfoScreen", {
      id: customerId,
      customerName: customer.customerName,
      customerInfo: customer.customerInfo,
    });
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: wp(5),
        backgroundColor: "#F3F0E9",
      }}
    >
      <CustomerForm
        customer={customer}
        buttonLabel="Update Customer"
        formTitle="Update a customer"
        setCustomer={setCustomer}
        submit={() => handleCustomerUpdateSubmit()}
      />
      <Toast position="bottom" autoHide visibilityTime={2000} />
    </View>
  );
};

export default EditCustomerScreen;

const styles = StyleSheet.create({});
