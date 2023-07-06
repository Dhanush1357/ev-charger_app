import React, { useRef, useState, useEffect } from "react";
import MapView, { Marker } from "react-native-maps";
import { StyleSheet, Touchable, View, Text } from "react-native";
import * as FileSystem from "expo-file-system";
import { shareAsync } from "expo-sharing";
import Cbutton from "./components/floatingButton";
import { FontAwesome } from "@expo/vector-icons";

import * as Location from "expo-location";
import { api } from "./axios/constants";
import axios from "axios";

export default function App() {
	//location and map
	const mapRef = useRef();
	const [mapRegion, setMapRegion] = useState({
		latitude: 28.635741,
		longitude: 77.219986,
		latitudeDelta: 0.02,
		longitudeDelta: 0.005,
	});

	//get permission and location of the user
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

	//markers
	const showLocationsOfInterest = () => {
		return locationsOfInterest.map((item, index) => {
			return (
				<Marker key={index} coordinate={item.location}>
					<FontAwesome size={30} name="map-pin" fade style={{ color: "#ff2424" }} />
				</Marker>
			);
		});
	};

	//screenshot and share
	const takeSnapshotAndShare = async () => {
		const snapshot = await mapRef.current.takeSnapshot({ width: 500, height: 800, result: "base64" });
		const uri = FileSystem.documentDirectory + "snapshot.webp";
		const share = new FormData();
		share.append({
			file: uri,
		});

		console.log("Form Data", share._parts[(0, 0)]);

		axios({
			method: "POST",
			url: api,
			data: share._parts[(0, 0)],
		})
			.then(function (response) {
				console.log("image uploaded", response);
			})
			.catch((error) => {
				console.log("error uploading", error);
			});
		//save and share file locally
		/*await FileSystem.writeAsStringAsync(uri, snapshot, { encoding: FileSystem.EncodingType.Base64 });
		 await shareAsync(uri);*/
	};

	//mainscreen
	return (
		<View>
			<MapView ref={mapRef} style={styles.map} region={mapRegion}>
				{showLocationsOfInterest()}
				<Marker coordinate={mapRegion}>
					<FontAwesome size={30} name="location-arrow" beatFade style={{ color: "#da36dd" }} />
				</Marker>
			</MapView>

			<View style={styles.container}>
				<View style={styles.containerButton}>
					<Cbutton onPress={takeSnapshotAndShare} title="Screenshot and Share"></Cbutton>
				</View>
			</View>
		</View>
	);
}

//coordinates of dummy markers
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

//styles
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
