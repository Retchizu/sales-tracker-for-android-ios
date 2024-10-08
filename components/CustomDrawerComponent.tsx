import { Image, StyleSheet, Text, View } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "@react-navigation/drawer";
import { auth } from "../firebaseConfig";
import { CommonActions, useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useToastContext } from "../context/ToastContext";
import Toast from "react-native-toast-message";

const CustomDrawerComponent = (props: DrawerContentComponentProps) => {
  const navigation = useNavigation();
  const { showToast } = useToastContext();
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Text style={styles.drawerHeaderTitle}>Retchi POS</Text>
      <Image
        source={require("../assets/icon-transparent.png")}
        style={{ width: wp(30), height: wp(30), alignSelf: "center" }}
      />
      <DrawerContentScrollView scrollEnabled={false}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      <View style={{ marginBottom: hp(3) }}>
        <DrawerItem
          style={{ borderTopWidth: wp(0.1) }}
          label={() => <Text style={styles.drawerLabelStyle}>Sign out</Text>}
          onPress={async () => {
            await auth.signOut();
            await AsyncStorage.removeItem("email");
            await AsyncStorage.removeItem("password");
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: "Auth Screen" }],
              })
            );
            showToast("info", "Signed out successfully");
          }}
          icon={() => (
            <Ionicons
              name="exit-outline"
              size={30}
              color="#634F40"
              style={{ alignSelf: "center" }}
            />
          )}
        />
      </View>
    </SafeAreaView>
  );
};

export default CustomDrawerComponent;

const styles = StyleSheet.create({
  drawerHeaderTitle: {
    fontFamily: "SoraBold",
    color: "#634F40",
    fontSize: wp(6),
    textAlign: "center",
  },
  drawerLabelStyle: {
    fontFamily: "SoraSemiBold",
    fontSize: wp(5),
    color: "#634F40",
  },
});
