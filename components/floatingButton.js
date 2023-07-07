import { Pressable, StyleSheet, Text, View } from "react-native";
import * as React from "react";

Cbutton = (props) => {
	return (
		<Pressable style={styles.btnContainer} onPress={props.onPress}>
			<Text style={styles.title}>{props.title}</Text>
		</Pressable>
	);
};

export default Cbutton;

const styles = StyleSheet.create({
	btnContainer: {
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 50,
		position: "absolute",
		top: 40,
		right: 10,
		height: 50,
		width: 80,
		backgroundColor: "#191919",
	},
	title: {
		fontSize: 14,
		color: "#fff",
		fontWeight: "bold",
	},
});
