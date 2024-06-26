import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@rneui/base";
import { StatusBar } from "expo-status-bar";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../type";
import { auth } from "../firebaseconfig";
import Toast from "react-native-simple-toast";
import { Entypo } from "@expo/vector-icons";
import { CommonActions } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

type Props = NativeStackScreenProps<RootStackParamList, "LogInScreen">;

const LogInScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [isPasswordVisible, setIsPasswordVisible] = useState(true);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prevVisibility) => !prevVisibility);
  };

  const handleSignin = async () => {
    setIsLoading(true);
    try {
      const userCredential = await auth.signInWithEmailAndPassword(
        email,
        password
      );
      const user = userCredential.user;
      if (user?.emailVerified) {
        AsyncStorage.setItem("email", email);
        AsyncStorage.setItem("password", password);
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
        navigation.navigate("VerifyEmailScreen", email);
      }
      setIsLoading(false);
    } catch (error) {
      Toast.show("Invalid credentials", Toast.SHORT);
      console.log((error as Error).message);
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.credentialContainer}>
        <Image
          source={require("../assets/transparent balahiboss.png")}
          style={{ height: hp(10), width: wp(35), alignSelf: "center" }}
        />
        <Text style={styles.welcomeMessage}>Welcome to Retchi!</Text>
        <View style={styles.credentialChild}>
          <Text style={styles.inputLabel}>Enter your email:</Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 10,
              borderRadius: 8,
              paddingHorizontal: 14,
              borderColor: "#af71bd",
              borderWidth: 2,
            }}
          >
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={(text) => setEmail(text)}
              style={{
                flex: 1,
                paddingVertical: 10,
                paddingRight: 10,
                fontSize: 16,
                fontWeight: "300",
              }}
            />
          </View>
          <Text style={styles.inputLabel}>Enter your password:</Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 8,
              paddingHorizontal: 14,
              borderColor: "#af71bd",
              borderWidth: 2,
            }}
          >
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={(text) => setPassword(text)}
              style={{
                flex: 1,
                paddingVertical: 10,
                paddingRight: 10,
                fontSize: 16,
                fontWeight: "300",
              }}
              secureTextEntry={isPasswordVisible}
            />
            <TouchableOpacity onPress={togglePasswordVisibility}>
              <Entypo
                name={isPasswordVisible ? "eye-with-line" : "eye"}
                size={24}
                color="black"
                style={{ marginLeft: 10 }}
              />
            </TouchableOpacity>
          </View>
          <Button
            title={"Sign in"}
            containerStyle={{
              borderRadius: 15,
              paddingHorizontal: 5,
              marginTop: 10,
            }}
            titleStyle={{ fontSize: 15 }}
            buttonStyle={{ backgroundColor: "#af71bd" }}
            onPress={handleSignin}
            loading={isLoading}
          />
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("SignUpScreen");
            }}
          >
            <Text
              style={{
                color: "#6c7ae6",
                marginTop: 10,
                paddingHorizontal: 10,
                fontSize: 18,
                fontWeight: "500",
              }}
            >
              Don't have an account? Sign Up!
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("ForgotPasswordScreen", false)}
          >
            <Text
              style={{
                color: "#6c7ae6",
                marginTop: 10,
                paddingHorizontal: 10,
                fontSize: 18,
                fontWeight: "500",
              }}
            >
              Forgot Password?
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
};
export default LogInScreen;

const styles = StyleSheet.create({
  welcomeMessage: {
    textAlign: "center",
    marginVertical: 20,
    fontSize: 30,
    fontWeight: "bold",
  },
  container: {
    backgroundColor: "white",
    flex: 1,
  },
  credentialContainer: {
    alignSelf: "center",
    justifyContent: "center",
    flex: 1,
  },
  credentialChild: {
    borderWidth: 6,
    borderColor: "#af71bd",
    borderRadius: 10,
    padding: 20,
  },

  inputLabel: {
    marginBottom: 10,
    fontSize: 20,
    paddingHorizontal: 10,
    fontWeight: "500",
  },
});
