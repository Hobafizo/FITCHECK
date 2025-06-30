import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "../screens/HomeScreen";
import OutfitDetailsScreen from "../screens/OutfitDetailsScreen";
import { Pressable } from "react-native";
import colors from "../assets/colors/colors";
import ItemScreen from "../screens/ItemScreen";
import SelectItemScreen from "../screens/SelecteItemScreen";

const Stack = createNativeStackNavigator();

function HomeTab() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen
        name="OutfitDetails"
        component={OutfitDetailsScreen}
        options={{
          headerShown: true,
          title: "Outfit",
          headerTitleStyle: {
            fontFamily: "higuen",
            fontSize: 30,
          },
          headerStyle: { backgroundColor: colors.main },
          headerShadowVisible: false,
          headerTitleAlign: "center",
        }}
      />
      <Stack.Screen
        name="ItemScreen"
        component={ItemScreen}
        options={{
          title: "Item",
          headerShown: true,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.main },
          headerTitleStyle: { fontFamily: "higuen", fontSize: 32 },
          headerTitleAlign: "center",
        }}
      />
      <Stack.Screen
        name="SelectItemScreen"
        component={SelectItemScreen}
        options={{
          headerShown: true,
          title: "Select Item",
          headerTitleStyle: {
            fontFamily: "higuen",
            fontSize: 30,
          },
          headerStyle: { backgroundColor: colors.main },
          headerShadowVisible: false,
          headerTitleAlign: "center",
        }}
      />
    </Stack.Navigator>
  );
}

export default HomeTab;
