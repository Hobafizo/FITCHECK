import { StyleSheet, Image, View, Pressable } from "react-native";

import Card from "./Card";

function ItemCard({ onPress, onLongPress, img }) {
  return (
    <Card onPress={onPress} onLongPress={onLongPress}>
      <Image style={styles.image} source={img} />
    </Card>
  );
}

const styles = StyleSheet.create({
  image: {
    height: "100%",
    width: "100%",
    objectFit: "contain",
  },
});

export default ItemCard;
