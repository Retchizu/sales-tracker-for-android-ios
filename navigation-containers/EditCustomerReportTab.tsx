import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  EditCustomerReportScreenProp,
  EditCustomerReportTabParamList,
  EditCustomerReportTabScreenProp,
} from "../types/type";
import EditCustomerReportScreen from "../screens/sales-report-stack/edit-customer-report/EditCustomerReportScreen";
import ProductListEditCustomerReportScreen from "../screens/sales-report-stack/edit-customer-report/ProductListEditCustomerReportScreen";
import PreviewEditCustomerReportScreen from "../screens/sales-report-stack/edit-customer-report/PreviewEditCustomerReportScreen";
import Entypo from "@expo/vector-icons/Entypo";
import AntDesign from "@expo/vector-icons/AntDesign";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { TouchableOpacity } from "react-native";
import { CommonActions, useNavigation } from "@react-navigation/native";

const EditCustomerReportTab =
  createBottomTabNavigator<EditCustomerReportTabParamList>();

export const EditCustomerReportTabScreen = ({
  route,
}: EditCustomerReportTabScreenProp) => {
  const params = route.params;
  const navigation = useNavigation();
  return (
    <EditCustomerReportTab.Navigator
      screenOptions={{
        headerTitle: "Edit Mode",
        headerTitleAlign: "center",
        headerTitleStyle: {
          color: "#634F40",
          fontFamily: "SoraExtraBold",
        },
        headerStyle: { height: hp(5), backgroundColor: "#F3F0E9" },
        tabBarStyle: {
          backgroundColor: "#F0D8B8",
        },
        tabBarLabelStyle: {
          fontFamily: "SoraSemiBold",
          fontSize: wp(3),
          color: "#634F40",
        },
        tabBarActiveBackgroundColor: "#E6B794",
        headerRight: () => (
          <TouchableOpacity
            activeOpacity={0.6}
            style={{ paddingHorizontal: wp(2) }}
            onPress={() =>
              navigation.dispatch(
                CommonActions.reset({
                  index: 1,
                  routes: [
                    { name: "SalesReportScreen" },
                    { name: "CustomerReportScreen", params },
                  ],
                })
              )
            }
          >
            <Entypo name="cross" size={30} color="#634F40" />
          </TouchableOpacity>
        ),
      }}
    >
      <EditCustomerReportTab.Screen
        name="EditCustomerReportScreen"
        component={EditCustomerReportScreen}
        options={{
          tabBarIcon: () => <AntDesign name="form" size={24} color="#634F40" />,
          tabBarLabel: "Edit Invoice",
        }}
        initialParams={params}
      />
      <EditCustomerReportTab.Screen
        name="ProductListEditCustomerReportScreen"
        component={ProductListEditCustomerReportScreen}
        options={{
          tabBarIcon: () => <Entypo name="box" size={24} color="#634F40" />,
          tabBarLabel: "Product List",
        }}
        initialParams={params}
      />
      <EditCustomerReportTab.Screen
        name="PreviewEditCustomerReportScreen"
        component={PreviewEditCustomerReportScreen}
        options={{
          tabBarIcon: () => (
            <Entypo name="shopping-cart" size={24} color="#634F40" />
          ),
          tabBarLabel: "Cart",
        }}
        initialParams={params}
      />
    </EditCustomerReportTab.Navigator>
  );
};
