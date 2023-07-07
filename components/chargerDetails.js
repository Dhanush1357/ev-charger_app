import React, { Component } from "react";
import { Text, View, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import Cbutton from "./floatingButton";

const data = require("../chargerData.json");
// console.log(data);
// console.log(data.chargers[0].connector_types[0]);

export default class FAB extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: data.chargers,
		};
	}

	render() {
		const { data } = this.state;
		return (
			<View style={styles.flatContainer}>
				<FlatList
					data={data}
					renderItem={({ item }) => (
						<View style={styles.list}>
							<Text>Name : {item.name}</Text>
							<Text>Address : {item.address}</Text>
							<Text>Distance:{item.distance}</Text>
							<Text>Connector Types : {item.connector_types}</Text>
						</View>
					)}
				/>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	flatContainer: {
		flex: 1,
		zIndex: 1,
	},
	list: {
		margin: 5,
		backgroundColor: "white",
		height: 80,
		justifyContent: "space-around",
		paddingLeft: 10,
		elevation: 1,
		zIndex: 1,
	},
});
