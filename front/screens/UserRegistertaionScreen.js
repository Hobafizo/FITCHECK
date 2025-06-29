import {
  StyleSheet,
  View,
  Text,
  Pressable,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import UserRegisterationForm from "../components/UserRegisterationForm";
import Toast from "react-native-toast-message";

function UserRegisterationScreen({ route }) {
  const navigation = useNavigation();
  // const { Email } = route.params.values;
  // console.log(Email);
  const showToast = (msg1, msg2) => {
    Toast.show({
      type: "error",
      text1: msg1,
      text2: msg2,
      position: "bottom",
    });
  };

  return (
    <KeyboardAvoidingView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <UserRegisterationForm showToast={showToast} />
        <Toast />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
});

export default UserRegisterationScreen;
