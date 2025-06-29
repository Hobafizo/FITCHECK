import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SignupScreen from "../screens/SignupScreen";
import LoginScreen from "../screens/LoginScreen";
import UserRegisterationScreen from "../screens/UserRegistertaionScreen";
import VerificationScreen from "../screens/VerificationScreen";
import colors from "../assets/colors/colors";
import RequestPasswordScreen from "../screens/RequestPasswordScreen";
import ChangePasswordAuthScreen from "../screens/ChangePasswordAuthScreen";

const Stack = createNativeStackNavigator();

function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.main },
        headerStyle: { backgroundColor: colors.main },
        headerTitleAlign: "center",
      }}
    >
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />

      <Stack.Screen
        name="UserRegisteration"
        component={UserRegisterationScreen}
      />
      <Stack.Screen
        name="Verification"
        component={VerificationScreen}
        options={{
          headerShown: true,
          title: "Verify Account",
        }}
      />
      <Stack.Screen
        name="RequestPassword"
        component={RequestPasswordScreen}
        options={{
          headerShown: true,
          headerTitleAlign: "left",
          title: "Trouble logging in?",
          headerTitleStyle: {
            fontFamily: "inter-semibold",
          },
        }}
      />
      <Stack.Screen
        name="ChangePasswordAuth"
        component={ChangePasswordAuthScreen}
        options={{
          title: "Change Password",
          headerShown: true,
          headerShadowVisible: false,
          headerTitleAlign: "center",
          headerTitleStyle: { fontFamily: "higuen", fontSize: 30 },
          headerStyle: { backgroundColor: colors.main },
        }}
      />
    </Stack.Navigator>
  );
}

export default AuthNavigator;
