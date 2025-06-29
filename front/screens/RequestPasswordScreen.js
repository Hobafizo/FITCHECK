import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
} from "react-native";
import * as yup from "yup";
import { Formik } from "formik";
import colors from "../assets/colors/colors";
import LightInput from "../components/LightInput";
import ValidatedInput from "../components/ValidatedInput";
import PrimaryButton from "../components/PrimaryButton";
import { useNavigation } from "@react-navigation/native";

const validationSchema = yup.object().shape({
  Email: yup.string().label("Email").email().required(),
});

function RequestPasswordScreen() {
  const navigation = useNavigation();
  const handleRequestPassword = async (values) => {
    console.log(values);
    // return;
    try {
      const res = await fetch(
        process.env.EXPO_PUBLIC_API_HOST + "/auth/reqforgetpw",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );

      console.log("res", res);

      const data = await res.json();
      if (data.Result == false) {
        showToast("Error", data.Errors[0]);
      } else {
        console.log("hiii");
        navigation.navigate("ChangePasswordAuth", { Email: values.Email });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, padding: 40 }}>
      <Formik
        initialValues={{ Email: "" }}
        validationSchema={validationSchema}
        onSubmit={handleRequestPassword}
      >
        {(formikProps) => (
          <View style={styles.screen}>
            <Text style={styles.mainTitle}>Getting Back into your account</Text>
            <Text style={styles.subTitle}>
              Tell us some information about your account
            </Text>
            <Text style={styles.inputLabel}>Email</Text>
            <ValidatedInput
              placeholder={"JohnDoe@gmail.com"}
              error={formikProps.errors.Email}
              touched={formikProps.touched.Email}
              handleChange={formikProps.handleChange("Email")}
              handleBlur={formikProps.handleBlur("Email")}
            />
            {formikProps.touched.Email && !formikProps.errors.Email && (
              <Text style={styles.note}>
                You'll need to verify that you own this email.
              </Text>
            )}

            <PrimaryButton onPress={formikProps.handleSubmit}>
              Continue
            </PrimaryButton>
          </View>
        )}
      </Formik>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  mainTitle: {
    fontFamily: "higuen",
    fontSize: 50,
  },
  subTitle: {
    marginVertical: 6,
    fontFamily: "inter-semibold",
    fontSize: 17,
  },
  inputLabel: {
    fontFamily: "inter-semibold",
    marginVertical: 4,
    fontSize: 15,
    color: colors.accent,
  },
  note: {
    fontFamily: "inter",
    fontSize: 13,
    color: "#5b5b5b",
    marginLeft: 4,
    marginTop: -6,
    marginBottom: 30,
  },
});

export default RequestPasswordScreen;
