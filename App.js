import React, { useRef, useState, useEffect } from "react";
import MapView, { Marker } from "react-native-maps";
import { StyleSheet, View, Text, ScrollView, Animated, TouchableOpacity, Dimensions, Platform } from "react-native";
import * as FileSystem from "expo-file-system";
import { shareAsync } from "expo-sharing";
import { FontAwesome } from "@expo/vector-icons";
import Cbutton from "./components/floatingButton";
import FAB from "./components/chargerDetails";
import * as Location from "expo-location";
import { api } from "./axios/constants";
import axios from "axios";

export default function App() {
	//Initial Map Region
	const mapRef = useRef();
	const [mapRegion, setMapRegion] = useState({
		latitude: 28.635741,
		longitude: 77.219986,
		latitudeDelta: 0.02,
		longitudeDelta: 0.005,
	});

	//Get permission and location of the user
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

	//Markers of chargers location
	const data = require("./chargerData.json");
	const showLocationsOfInterest = () => {
		return data.chargers.map((item, index) => {
			return (
				<Marker key={index} coordinate={item.location} title={item.name}>
					<FontAwesome size={30} name="map-pin" fade style={{ color: "#ff2424" }} />
				</Marker>
			);
		});
	};

	//screenshot and share
	const takeSnapshotAndShare = async () => {
		const snapshot = await mapRef.current.takeSnapshot({ width: 500, height: 800, result: "base64" });
		const uri = FileSystem.documentDirectory + "snapshot.webp";

		//save and share file locally
		await FileSystem.writeAsStringAsync(uri, snapshot, { encoding: FileSystem.EncodingType.Base64 });
		await shareAsync(uri);

		//sending snapshot to API
		/*	
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
			*/
	};

	//mainscreen
	return (
		<View style={styles.mainContainer}>
			<MapView ref={mapRef} style={styles.map} region={mapRegion}>
				{showLocationsOfInterest()}
				<Marker coordinate={mapRegion}>
					<FontAwesome size={30} name="location-arrow" beatFade style={{ color: "#da36dd" }} />
				</Marker>
			</MapView>
			<Cbutton onPress={takeSnapshotAndShare} title="Sharee"></Cbutton>
		</View>
	);
}

//styles
const styles = StyleSheet.create({
	mainContainer: {
		flex: 1,
	},
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	map: {
		width: "100%",
		height: "100%",
	},
});
