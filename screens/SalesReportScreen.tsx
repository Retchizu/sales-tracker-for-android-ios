import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { auth, db } from "../firebaseconfig";
import { PosReport, Product, ReportRootStackParamList } from "../type";
import { useSalesReportContext } from "../context/salesReportContext";
import Toast from "react-native-simple-toast";
import { SafeAreaView } from "react-native-safe-area-context";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import { Button, SearchBar } from "@rneui/base";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

const convertTimestampToDate = (
  timestamp: firebase.firestore.Timestamp
): Date => {
  const milliseconds = timestamp.seconds * 1000 + timestamp.nanoseconds / 1e6;
  return new Date(milliseconds);
};

type prop = NativeStackScreenProps<
  ReportRootStackParamList,
  "SalesReportScreen"
>;
const SalesReportScreen = ({ navigation }: prop) => {
  const [initialFetchSales, setInitialFetchSales] = useState(false);
  const { salesReports, setSalesReportList } = useSalesReportContext();
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState<PosReport[] | undefined>(
    undefined
  );
  const [initialRead, setInitialRead] = useState(false);

  const readData = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const fetched: PosReport[] = [];
        const docRef = db
          .collection("users")
          .doc(user.uid)
          .collection("sales")
          .orderBy("date", "desc");
        const querySnapshot = await docRef.get();
        querySnapshot.forEach((doc) => {
          const {
            productList,
            date,
            otherExpense,
            customer,
            customerPayment,
            dogTreatDiscount,
            catTreatDiscount,
            gateDiscount,
          } = doc.data();
          fetched.push({
            id: doc.id,
            productList,
            date: convertTimestampToDate(date),
            otherExpense,
            customer,
            customerPayment,
            dogTreatDiscount,
            catTreatDiscount,
            gateDiscount,
          });
        });
        if (!initialFetchSales) {
          setSalesReportList(fetched);
          setInitialFetchSales(true);
        }
      }
    } catch (error) {
      Toast.show("Error getting data", Toast.SHORT);
    }
  };

  const formatDateString = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const computeTotalPrice = () => {
    let total = 0;
    const nullCheck = !filteredData ? salesReports : filteredData;
    const products: { product: Product; quantity: Number }[] = [];
    nullCheck?.forEach((item) =>
      item.productList.forEach((product) => products.push(product))
    );
    products.forEach(
      (item) => (total += item.product.sellPrice * (item.quantity as number))
    );
    return total;
  };

  const computeTotalProfit = () => {
    let total = 0;
    const nullCheck = !filteredData ? salesReports : filteredData;

    nullCheck.forEach((parentItem) => {
      parentItem.productList.forEach((item) => {
        total +=
          (item.product.sellPrice - item.product.stockPrice) *
          (item.quantity as number);
      });
      total -=
        (parentItem.otherExpense as number) +
        (parentItem.catTreatDiscount as number) +
        (parentItem.dogTreatDiscount as number) +
        (parentItem.gateDiscount as number);
    });
    return total;
  };

  const computeTotalDiscount = () => {
    let total = 0;
    const nullCheck = !filteredData ? salesReports : filteredData;

    nullCheck?.forEach((item) => (total += item.otherExpense as number));
    return total;
  };

  const computeTotalCatTreat = () => {
    let total = 0;
    const nullCheck = !filteredData ? salesReports : filteredData;
    nullCheck.forEach((item) => (total += item.catTreatDiscount as number));

    return total;
  };
  const computeTotalDogTreat = () => {
    let total = 0;
    const nullCheck = !filteredData ? salesReports : filteredData;
    nullCheck.forEach((item) => (total += item.dogTreatDiscount as number));

    return total;
  };
  const computeTotalGateDiscount = () => {
    let total = 0;
    const nullCheck = !filteredData ? salesReports : filteredData;
    nullCheck.forEach((item) => (total += item.gateDiscount as number));

    return total;
  };

  const toggleStartDate = () => {
    if (!startDate) {
      setStartDate(new Date());
    }

    setShowStartDate(!showStartDate);
  };
  const toggleEndDate = () => {
    if (!endDate) {
      setEndDate(new Date());
    }

    setShowEndDate(!showEndDate);
  };

  const onChangeStartDate = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    if (event.type === "set" && selectedDate) {
      const currentDate = selectedDate;
      setShowStartDate(showStartDate);
      if (Platform.OS === "android") {
        toggleStartDate();
        setStartDate(currentDate);
      }
    } else {
      toggleStartDate();
    }
  };
  const onChangeEndDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === "set" && selectedDate) {
      const currentDate = selectedDate;
      setShowStartDate(showStartDate);
      if (Platform.OS === "android") {
        toggleEndDate();
        setEndDate(currentDate);
      }
    } else {
      toggleEndDate();
    }
  };

  const confirmIosEndDate = () => {
    setEndDate(endDate);
    toggleEndDate();
  };
  const confirmIosStartDate = () => {
    setStartDate(startDate);
    toggleStartDate();
  };

  const filterData = (start: Date, end: Date, query: string) => {
    if (end && start) {
      end.setHours(23);
      start.setHours(0);
    }
    const filteredItems = salesReports.filter((item) => {
      const itemDate = item.date;
      const isDateInRange =
        (!start || itemDate >= start) && (!end || itemDate <= end);

      const isCustomerNameMatch = item.customer?.customerName
        .toLowerCase()
        .includes(query.toLowerCase());

      return isDateInRange && (!query || isCustomerNameMatch);
    });
    const sortedFilteredItems = filteredItems.sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date : new Date(a.date);
      const dateB = b.date instanceof Date ? b.date : new Date(b.date);

      return dateB.getTime() - dateA.getTime();
    });

    setFilteredData(sortedFilteredItems);
  };

  useEffect(() => {
    if (!initialRead) {
      readData();
      setInitialRead(true);
      console.log("read");
    }
    filterData(new Date(), new Date(), "");
  }, [salesReports]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f7f7" }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginHorizontal: 10 }}>
        Fliter by name or date:
      </Text>
      <View>
        <SearchBar
          placeholder="Customer name filter"
          containerStyle={{
            backgroundColor: "white",
            borderColor: "white",
            marginHorizontal: 10,
          }}
          inputContainerStyle={{ backgroundColor: "#f7f2f7", borderRadius: 10 }}
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            filterData(startDate!, endDate!, text);
          }}
        />
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-evenly",
          }}
        >
          <Button
            title={`${!startDate ? "Start Date" : formatDateString(startDate)}`}
            onPress={toggleStartDate}
            containerStyle={{ borderRadius: 10 }}
            titleStyle={{ fontSize: 14 }}
            buttonStyle={{ backgroundColor: "pink" }}
          />
          <Text style={{ alignSelf: "center" }}> -- </Text>
          <Button
            title={`${!endDate ? "End Date" : formatDateString(endDate)}`}
            onPress={toggleEndDate}
            containerStyle={{ borderRadius: 10 }}
            titleStyle={{ fontSize: 14 }}
            buttonStyle={{ backgroundColor: "pink" }}
          />

          {showStartDate && (
            <DateTimePicker
              mode="date"
              display="calendar"
              value={startDate!}
              onChange={onChangeStartDate}
              minimumDate={new Date(2016, 0, 1)}
            />
          )}
          {showStartDate && Platform.OS === "ios" && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-around",
              }}
            >
              <Button
                title={"Cancel"}
                containerStyle={{
                  borderRadius: 10,
                  flex: 1,
                  marginHorizontal: 20,
                }}
                buttonStyle={{ backgroundColor: "pink" }}
                onPress={toggleStartDate}
              />
              <Button
                title={"Confirm"}
                containerStyle={{
                  borderRadius: 10,
                  flex: 1,
                  marginHorizontal: 20,
                }}
                buttonStyle={{ backgroundColor: "pink" }}
                onPress={confirmIosStartDate}
              />
            </View>
          )}

          {showEndDate && (
            <DateTimePicker
              mode="date"
              display="calendar"
              value={endDate!}
              onChange={onChangeEndDate}
              minimumDate={new Date(2016, 0, 1)}
            />
          )}
        </View>
        {showStartDate && Platform.OS === "ios" && (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
            }}
          >
            <Button
              title={"Cancel"}
              containerStyle={{
                borderRadius: 10,
                flex: 1,
                marginHorizontal: 20,
              }}
              buttonStyle={{ backgroundColor: "pink" }}
              onPress={toggleEndDate}
            />
            <Button
              title={"Confirm"}
              containerStyle={{
                borderRadius: 10,
                flex: 1,
                marginHorizontal: 20,
              }}
              buttonStyle={{ backgroundColor: "pink" }}
              onPress={confirmIosEndDate}
            />
          </View>
        )}
      </View>
      <Button
        title={"Confirm Date"}
        containerStyle={{
          borderRadius: 10,
          marginHorizontal: 30,
          marginTop: 5,
        }}
        titleStyle={{ fontSize: 14 }}
        buttonStyle={{ backgroundColor: "pink" }}
        onPress={() => {
          if (startDate && endDate) filterData(startDate, endDate, searchQuery);
        }}
      />

      <FlatList
        keyExtractor={(item) => item.id.toString()}
        style={{ marginTop: 5 }}
        data={!filteredData ? salesReports : filteredData}
        renderItem={({ item }) => (
          <View
            style={{
              flex: 1,
              paddingHorizontal: 10,
              paddingVertical: 10,
              borderColor: "pink",
              borderWidth: 5,
              borderRadius: 5,
              marginVertical: 5,
              marginHorizontal: 10,
            }}
          >
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("SummaryCustomerReportScreen", {
                  ...item,
                  date:
                    item.date instanceof Date
                      ? item.date.toISOString()
                      : item.date,
                })
              }
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{ fontSize: 18, fontWeight: "bold", maxWidth: "70%" }}
                >
                  {item.customer?.customerName}
                </Text>

                <Text numberOfLines={1} style={{ maxWidth: "90%" }}>
                  {item.date instanceof Date
                    ? formatDateString(item.date)
                    : item.date}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      />
      <View
        style={{
          borderColor: "lightgreen",
          borderWidth: 2,
          marginHorizontal: 5,
          padding: 5,
        }}
      >
        <Text style={{ fontSize: 16 }}>
          Total price sold: ₱{computeTotalPrice().toFixed(2)}
        </Text>
        <Text style={{ fontSize: 16 }}>
          Total profit: ₱{computeTotalProfit().toFixed(2)}
        </Text>
        <Text style={{ fontSize: 16 }}>
          Total of discounts: ₱{computeTotalDiscount().toFixed(2)}
        </Text>
        <Text style={{ fontSize: 16 }}>
          Total of Dog Treat Discount: ₱{computeTotalDogTreat().toFixed(2)}
        </Text>
        <Text style={{ fontSize: 16 }}>
          Total of Cat Treat Discount: ₱{computeTotalCatTreat().toFixed(2)}
        </Text>
        <Text style={{ fontSize: 16 }}>
          Total of Gate Discount: ₱{computeTotalGateDiscount().toFixed(2)}
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default SalesReportScreen;

const styles = StyleSheet.create({});
