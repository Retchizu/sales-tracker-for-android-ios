import { StyleSheet, Text, View, Image } from "react-native";
import React, { useEffect } from "react";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions } from "@react-navigation/native";
import { auth } from "../firebaseconfig";
import Toast from "react-native-simple-toast";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

type Props = NativeStackScreenProps<RootStackParamList, "SplashScreen">;
const SplashScreen = ({ navigation }: Props) => {
  useEffect(() => {
    const unsubscribe = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem("email");
        const savedPassword = await AsyncStorage.getItem("password");
        if (savedEmail && savedPassword) {
          await auth.signInWithEmailAndPassword(savedEmail, savedPassword);
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [
                {
                  name: "HomeScreen",
                },
              ],
            })
          );
        } else {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [
                {
                  name: "LogInScreen",
                },
              ],
            })
          );
        }
      } catch (error) {
        Toast.show("Sign in again", Toast.SHORT);
        console.log((error as Error).message);
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: "LogInScreen",
              },
            ],
          })
        );
      }
    };
    unsubscribe();
  }, []);
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "white",
        flex: 1,
      }}
    >
      <Image
        style={{ height: hp(20), width: wp(40) }}
        source={require("../assets/icon.png")}
      />
      <Text
        style={{ fontSize: hp("5%"), color: "#af71bd", fontWeight: "bold" }}
      >
        RETCHI
      </Text>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({});
