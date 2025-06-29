import { StyleSheet, View, Text } from "react-native";
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";
import { useState } from "react";
import colors from "../assets/colors/colors";

const CELL_COUNT = 4;

function OTPInput({value, setValue}) {
  // const [value, setValue] = useState("");
  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });
  return (
    <View style={styles.root}>
      <CodeField
        ref={ref}
        {...props}
        value={value}
        onChangeText={setValue}
        cellCount={CELL_COUNT}
        rootStyle={styles.codeFieldRoot}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        renderCell={({ index, symbol, isFocused }) => (
          <View
            onLayout={getCellOnLayoutHandler(index)}
            key={index}
            style={[styles.cell, isFocused && styles.focusCell, symbol && styles.filledCell]}
          >
            <Text style={styles.text}>
              {symbol || (isFocused ? <Cursor /> : null)}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    // padding: 20,
    // minHeight: 300,
    // backgroundColor: "white",
  },
  codeFieldRoot: {
    // marginTop: 20,
  },
  cell: {
    width: 50,
    height: 50,
    borderWidth: 2,
    borderColor: colors.accent,
    borderRadius: 10,
    justifyContent: "center",
  },
  focusCell: {
    // borderColor: "#000",
  },
  filledCell: {
    backgroundColor: "#D5C8B8",
    borderWidth: 0,
  },
  text: {
    textAlign: "center",
    fontSize: 30,
    color: "#414E42",
  },
});

export default OTPInput;
