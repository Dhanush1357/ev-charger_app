import React, { useRef, useState, useEffect } from "react";
import MapView, { Marker } from "react-native-maps";
import { StyleSheet, Touchable, View, Text } from "react-native";
import * as FileSystem from "expo-file-system";
import { shareAsync } from "expo-sharing";
import Cbutton from "./components/floatingButton";

import * as Location from "expo-location";

export default function App() {
	//location and map
	const mapRef = useRef();
	const [mapRegion, setMapRegion] = useState({
		latitude: 28.635741,
		longitude: 77.219986,
		latitudeDelta: 0.02,
		longitudeDelta: 0.005,
	});

	const userLocation = async () => {
		let { status } = await Location.requestForegroundPermissionsAsync();
		if (status !== "granted") {
			setErrorMsg("Permission to access location was denied");
		}
		let location = await Location.getCurrentPositionAsync({ enableHighAccuracy: true });
		setMapRegion({
			latitude: location.coords.latitude,
			longitude: location.coords.longitude,
			latitudeDelta: 0.3,
			longitudeDelta: 0.2,
		});
	};

	useEffect(() => {
		userLocation();
	}, []);

	const showLocationsOfInterest = () => {
		return locationsOfInterest.map((item, index) => {
			return <Marker key={index} coordinate={item.location} title={item.title} description={item.description} />;
		});
	};
	const takeSnapshotAndShare = async () => {
		const snapshot = await mapRef.current.takeSnapshot({ width: 500, height: 800, result: "base64" });
		const uri = FileSystem.documentDirectory + "snapshot.png";
		await FileSystem.writeAsStringAsync(uri, snapshot, { encoding: FileSystem.EncodingType.Base64 });
		await shareAsync(uri);
	};

	//fetch data

	//mainscreen

	return (
		<View>
			<MapView ref={mapRef} style={styles.map} region={mapRegion}>
				{showLocationsOfInterest()}
				<Marker coordinate={mapRegion} />
			</MapView>

			<View style={styles.container}>
				<View style={styles.containerButton}>
					<Cbutton onPress={takeSnapshotAndShare} title="Screenshot and save">
						{" "}
					</Cbutton>
				</View>
				<View style={styles.containerButton}>
					<Cbutton onPress={takeSnapshotAndShare} title="Screenshot and save"></Cbutton>
				</View>
			</View>
		</View>
	);
}
let locationsOfInterest = [
	{
		location: {
			latitude: 12.901505,
			longitude: 77.634432,
		},
	},
	{
		location: {
			latitude: 12.961067,
			longitude: 77.642162,
		},
	},
	{
		location: {
			latitude: 12.999874,
			longitude: 77.564263,
		},
	},
	{
		location: {
			latitude: 12.92744,
			longitude: 77.545507,
		},
	},
];
const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
	},
	containerButton: {
		flex: 1,
	},

	map: {
		width: "100%",
		height: "100%",
	},
});
