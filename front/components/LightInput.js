import { useState } from "react";
import { StyleSheet, View, Text, TextInput } from "react-native";
import { useField } from "formik";

function LightInput({
  name,
  content,
  isPassword = false,
  alignCenter = false,
  readOnly = false,
}) {
  const [value, setValue] = useState(content);
  const [field, meta, helpers] = useField(name);
  // console.log("here: ", field);

  return (
    <View
      style={[styles.inputContainer, alignCenter && { alignItems: "center" }]}
    >
      <TextInput
        secureTextEntry={isPassword}
        value={field.value}
        onChangeText={(text) => helpers.setValue(text)}
        style={styles.inputField}
        readOnly={readOnly}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 3,
    backgroundColor: "#F5ECE3",
    borderRadius: 8,
    elevation: 3,
  },
  inputField: {
    fontFamily: "poppins",
    fontSize: 14,
    height: 32,
    lineHeight: 20,
    textAlignVertical: "center",
    paddingVertical: 0,
    color: "#00000080",
  },
});

export default LightInput;
