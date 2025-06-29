import {
  StyleSheet,
  View,
  Text,
  Alert,
  Image,
  Button,
  Pressable,
  Dimensions,
} from "react-native";
import colors from "../assets/colors/colors";
import { SaveFormat, ImageManipulator } from "expo-image-manipulator";

import * as ImagePicker from "expo-image-picker";
import Card from "../components/Card";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import PrimaryButton from "../components/PrimaryButton";
import { itemsDummyData } from "../store/data";
import { useNavigation } from "@react-navigation/native";

const deviceWidth = Dimensions.get("window").width;

function UploadItemScreen() {
  const navigation = useNavigation();
  const [images, setImages] = useState([]);
  const { manipulate } = ImageManipulator;

  async function requestPermissions() {
    const { status: cameraStatus } =
      await ImagePicker.requestCameraPermissionsAsync();
    const { status: galleryStatus } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== "granted" && galleryStatus !== "granted") {
      Alert.alert(
        "Permission Denied",
        "We need access to your camera and gallery."
      );
      return false;
    }

    return true;
  }

  async function resizeImage(context, width, height) {
    console.log("width: " + width, "height: " + height);

    if (width > height) {
      context.resize({ width: 1024 });
    } else {
      context.resize({ height: 1024 });
    }

    const image = await context.renderAsync();
    const result = await image.saveAsync({
      format: SaveFormat.JPEG,
    });
    return result;
  }

  async function openCamera() {
    const hasPermission = requestPermissions();

    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      // quality: 0,
      cameraType: ImagePicker.CameraType.back,
    });

    if (!result.canceled) {
      const context = manipulate(result.assets[0].uri);

      const img = await resizeImage(
        context,
        result.assets[0].width,
        result.assets[0].height
      );

      const image = {
        uri: img.uri,
        type: result.assets[0].mimeType,
        name: result.assets[0].fileName,
        isSelected: true,
      };
      setImages((prev) => [...prev, image]);
    }
  }

  async function openGallery() {
    const hasPermission = requestPermissions();

    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
    });

    if (!result.canceled) {
      try {
        // Use Promise.all to process all images in parallel
        const selectedImages = await Promise.all(
          result.assets.map(async (asset) => {
            const context = manipulate(asset.uri);
            const img = await resizeImage(context, asset.width, asset.height);

            return {
              uri: img.uri,
              type: asset.mimeType,
              name: asset.fileName,
              isSelected: true,
            };
          })
        );

        setImages((prev) => [...prev, ...selectedImages]);
      } catch (error) {
        console.error("Error processing images:", error);
      }
    }
  }

  async function handleUpload() {
    console.log(process.env.EXPO_PUBLIC_API_HOST);

    const formData = new FormData();
    console.log(images);
    // formData.append("ItemImages", JSON.stringify(images));
    images.forEach(({ isSelected, ...image }) => {
      if (isSelected) {
        formData.append(`ItemImages`, image);
      }
    });

    try {
      const res = await fetch(
        process.env.EXPO_PUBLIC_API_HOST + "/wardrobe/add",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      if (data.Result == false) {
        console.log("Error", data.Errors[0]);
      } else {
        // const itemID
        console.log("here", data);
        navigation.replace("ProcessingScreen", { itemsNumber: data.Items });
        // navigation.pop();

        setImages([]);
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <View style={styles.screen}>
      <View style={styles.gallery}>
        <View style={styles.boxWrapper}>
          <Pressable style={styles.box} onPress={openCamera}>
            <Ionicons name="camera-sharp" size={60} color={"#808080"} />
          </Pressable>
        </View>
        <View style={styles.boxWrapper}>
          <Pressable style={styles.box} onPress={openGallery}>
            <Ionicons name="images-sharp" size={60} color={"#808080"} />
          </Pressable>
        </View>

        {images.map((image, index) => (
          <View key={index} style={styles.boxWrapper}>
            <Pressable
              style={styles.box}
              onPress={() =>
                setImages((prevImages) => {
                  const updatedImages = [...prevImages];
                  updatedImages[index].isSelected =
                    !updatedImages[index].isSelected;
                  return updatedImages;
                })
              }
            >
              <Image
                source={{ uri: image.uri }}
                style={{
                  height: "100%",
                  width: "100%",
                  objectFit: "cover",
                }}
              />
              <Ionicons
                name={
                  image.isSelected
                    ? "checkmark-circle-sharp"
                    : "ellipse-outline"
                }
                size={24}
                color={colors.accent}
                style={styles.selectIcon}
              />
            </Pressable>
          </View>
        ))}
      </View>
      {/* <View
        style={{
          position: "absolute",
          width: "100%",
          bottom: 30,
          left: 15,
        }}
      >
        <PrimaryButton children={"UPLOAD"} onPress={handleUpload} />
      </View> */}
      <View style={styles.buttonWrapper}>
        <Pressable style={styles.button} onPress={handleUpload}>
          <Text style={styles.buttonTitle}>Upload</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.main,
    paddingVertical: 16,
    alignItems: "center",
  },
  gallery: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 4,
    // backgroundColor: "green",
    columnGap: "1%",
    rowGap: 4,
  },
  boxWrapper: {
    width: "24.25%",
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: "white",
  },
  box: {
    height: "100%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f3f0",
  },
  selectIcon: {
    position: "absolute",
    left: 2,
    top: 2,
  },
  buttonWrapper: {
    width: "95%",
    position: "absolute",
    bottom: 40,
  },
  button: {
    width: "100%",
    paddingVertical: 14,
    backgroundColor: colors.accent,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonTitle: {
    color: "white",
    fontFamily: "inter-semibold",
    fontSize: 18,
  },
});

export default UploadItemScreen;
