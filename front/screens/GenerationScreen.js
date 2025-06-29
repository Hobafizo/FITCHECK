import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import Collapsible from "react-native-collapsible";
import { filtersData, generationTags } from "../store/data";
import { useLocationStore } from "../store/locationStore";

import colors from "../assets/colors/colors";
import Pill from "../components/you screen/Pill";
import { Ionicons } from "@expo/vector-icons";
import { useFormik } from "formik";

function GenerationScreen() {
  const navigation = useNavigation();
  const [isAuto, setIsAuto] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const coords = useLocationStore((state) => state.coords);

  const handleGenerate = async (values) => {
    console.log({ values });
    const { dressCode, style, ...rest } = values;
    values = { Occasion: dressCode, Style: style, ...rest };
    console.log("values 2: ", values);

    const flatTags = Object.values(values)
      .flat()
      .filter((tag) => tag !== "");

    const FilterTags = Object.entries(values).reduce((acc, [Class, Tags]) => {
      if (isAuto && Class === "weather") {
        return acc;
      }
      if (Class === "theme") {
        acc.push(...Tags.map((Tag) => ({ Class, Tag })));
      } else if (Tags !== "") {
        acc.push({ Class, Tag: Tags });
      }
      return acc;
    }, []);

    console.log({ FilterTags });

    const requestPayload = {
      CheckWeather: isAuto,
      LocationLat: coords.latitude,
      LocationLon: coords.longitude,
      FilterTags,
    };
    console.log("data", requestPayload);
    try {
      const res = await fetch(
        process.env.EXPO_PUBLIC_API_HOST + "/wardrobe/getrecommendation",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestPayload),
        }
      );

      const data = await res.json();
      console.log("coords: ", coords);

      if (data.Result == false) {
        // showToast("Error", data.Errors[0]);
        console.log("Error", data.Errors[0]);
      } else {
        console.log("heyy: ", data);
        navigation.push("GeneratedOutfit", {
          suggestions: data.Suggestions,
          tags: flatTags,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const formik = useFormik({
    initialValues: {
      dressCode: "",
      style: "",
      theme: [],
      weather: "",
    },
    onSubmit: async (values) => handleGenerate(values),
  });

  function selectTag(field, title) {
    if (title === formik.values[field]) {
      formik.setFieldValue(field, "");
      return;
    }
    formik.setFieldValue(field, title);
  }

  function addTag(field, title) {
    formik.values[field].includes(title)
      ? formik.setFieldValue(
          field,
          formik.values[field].filter((item) => item !== title)
        )
      : formik.setFieldValue(field, [...formik.values.theme, title]);
  }

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <View style={styles.generationSection}>
        <Text style={styles.generationHeader}>What's the dress code</Text>
        <View style={styles.generationInput}>
          {generationTags[0].options.map((option) => (
            <Pill
              key={option}
              title={option}
              isSelected={option === formik.values.dressCode}
              setIsSelected={() => selectTag("dressCode", option)}
            />
          ))}
        </View>
        <Text style={styles.generationHeader}>
          What style are you going for?
        </Text>
        <View style={styles.generationInput}>
          {generationTags[1].options.map((option) => (
            <Pill
              key={option}
              title={option}
              isSelected={option === formik.values.style}
              setIsSelected={() => selectTag("style", option)}
            />
          ))}
        </View>
        <View style={styles.generationHeaderContianer}>
          <Text style={styles.generationHeader}>Color Theme:</Text>
          <Pressable onPress={() => setIsExpanded((prev) => !prev)}>
            <Text style={styles.showText}>
              {isExpanded ? "Show less" : "Show more"}
            </Text>
          </Pressable>
        </View>
        <View style={styles.generationInput}>
          {(isExpanded
            ? generationTags[2].options
            : generationTags[2].options.slice(0, 4)
          ).map((option, index) => (
            <Pill
              key={option}
              title={option}
              isSelected={formik.values.theme.includes(option)}
              setIsSelected={() => addTag("theme", option)}
            />
          ))}

          {/* <Collapsible
            renderChildrenCollapsed
            duration={500}
            easing={"easeInOutCubic"}
            collapsed={!isExpanded}
          >
            <View style={[styles.generationInput, { maxHeight: 400 }]}>
              {generationTags[2].options.slice(4).map((option) => (
                <Pill
                  key={option}
                  title={option}
                  isSelected={option === formik.values.theme}
                  setIsSelected={() => selectTag("theme", option)}
                />
              ))}
            </View>
          </Collapsible> */}
        </View>
        <View style={styles.automaticWeather}>
          <Pressable
            onPress={() => {
              setIsAuto((prev) => !prev);
            }}
          >
            {isAuto ? (
              <Ionicons name="checkbox" size={20} color={colors.pineGreen} />
            ) : (
              <Ionicons
                name="square-outline"
                size={20}
                // color={colors.pineGreen}
              />
            )}
          </Pressable>
          <Text style={styles.automaticWeatherText}>
            Automatically check the weather
          </Text>
        </View>
        <Collapsible collapsed={isAuto} style={{ paddingBottom: 15 }}>
          <View style={styles.generationSection}>
            <View style={{ paddingTop: 5 }}>
              <Text style={styles.generationHeader}>
                What's the weather like, or is it indoors?
              </Text>
              <Text style={styles.subHeader}>
                (This will override the weather-based suggesstion)
              </Text>
            </View>
            <View style={styles.generationInput}>
              {generationTags[3].options.map((option) => (
                <Pill
                  key={option}
                  title={option}
                  isSelected={option === formik.values.weather}
                  setIsSelected={() => selectTag("weather", option)}
                />
              ))}
            </View>
          </View>
        </Collapsible>
      </View>
      <Text style={[styles.subHeader]}>
        Note: Leaving options blank will use your general preferences.
      </Text>
      {formik.isSubmitting ? (
        <ActivityIndicator size={60} color={colors.accent} />
      ) : (
        <View style={styles.buttonWrapper}>
          <Pressable
            style={[
              styles.buttonInner,
              {
                backgroundColor: formik.isValid ? colors.accent : "#878787",
              },
            ]}
            onPress={formik.handleSubmit}
            disabled={!formik.isValid}
          >
            <Text style={styles.buttonTitle}>Generate</Text>
          </Pressable>
          <Ionicons
            name="sparkles-sharp"
            color="white"
            size={20}
            style={styles.sparkles}
          />
        </View>
      )}
      {/* <LottieView
        source={require("../assets/lottifiles/smeh.json")}
        autoPlay
        loop
        style={styles.lottieFile}
      /> */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    backgroundColor: colors.main,
    paddingHorizontal: 16,
    paddingTop: 25,
    alignItems: "center",
  },
  generationSection: {
    gap: 15,
    width: "100%",
  },
  generationHeaderContianer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: 8,
  },
  generationHeader: {
    fontFamily: "inter-medium",
    fontSize: 18,
    lineHeight: 20,
  },
  showText: {
    fontFamily: "inter-semibold",
    fontSize: 14,
    color: colors.pineGreen,
  },
  generationInput: {
    flexDirection: "row",
    gap: 4,
    paddingBottom: 5,
    flexWrap: "wrap",
  },
  automaticWeather: {
    flexDirection: "row",
    gap: 5,
  },
  automaticWeatherText: {
    fontFamily: "inter-medium",
    fontSize: 14,
  },
  subHeader: {
    fontFamily: "inter",
    fontSize: 12,
    color: "#878787",
  },
  buttonWrapper: {
    width: "100%",
    elevation: 4,
    overflow: "hidden",
    borderRadius: 10,
    marginTop: 8,
    marginVertical: 20,
  },
  buttonInner: {
    backgroundColor: "#878787",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
  },
  buttonTitle: {
    fontFamily: "higuen",
    fontSize: 24,
    fontStyle: 20,
    color: "white",
  },
  sparkles: {
    position: "absolute",
    right: 120,
    top: 7,
  },
  lottieFile: {
    width: 150,
    aspectRatio: 1,
  },
});

export default GenerationScreen;
