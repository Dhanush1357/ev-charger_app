import React, { useRef, useState, useEffect } from "react";
import MapView, { Marker } from "react-native-maps";
import { StyleSheet, View, Text, ScrollView, Animated, TouchableOpacity, Platform, Dimensions } from "react-native";
import * as FileSystem from "expo-file-system";
import { shareAsync } from "expo-sharing";
import { FontAwesome } from "@expo/vector-icons";
import Cbutton from "./components/floatingButton";
import * as Location from "expo-location";
import { api } from "./axios/constants";
import axios from "axios";

export default function App() {
	const { width, height } = Dimensions.get("window");
	const CARD_WIDTH = width * 0.7;
	const SPACING_FOR_CARD_INSET = width * 0.1;
	const mapRef = useRef();
	const _scrollView = React.useRef(null);

	let mapIndex = 0;
	let mapAnimation = new Animated.Value(0);

	//Initial Map Region
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
			latitudeDelta: 0.1,
			longitudeDelta: 0.3,
		});
	};
	useEffect(() => {
		userLocation();
	}, []);

	//Importing json data
	const data = require("./chargerData.json");

	//Markers of chargers location
	const showLocationsOfMarker = () => {
		return data.chargers.map((item, index) => {
			return (
				<Marker onPress={(e) => onMarkerPress(e)} key={index} coordinate={item.location} title={item.name}>
					<FontAwesome size={30} name="map-pin" fade style={{ color: "#ff2424" }} />
				</Marker>
			);
		});
	};

	//CardView of markers
	const showChargerDetails = () => {
		return data.chargers.map((item, index) => {
			return (
				<Animated.View style={styles.card} key={index}>
					<Text style={styles.cardTitle} numberOfLines={1}>
						{item.name}
					</Text>
					<Text style={styles.cardAddress}>
						{item.address}
						<Text>{"                              "}</Text>
						<Text style={{ color: "#DA396C" }}>
							{item.distance} {item.distance_metrics}
						</Text>
					</Text>
					<Text style={styles.supCon}>supported connectors</Text>
					<Text style={styles.avaCOn}>
						{item.connector_types[0]}
						{"\n"}
						<Text style={styles.chSpeed}>15kW Fast Charging</Text>
					</Text>
					<Text style={styles.avaCOn}>
						{item.connector_types[1]}
						{"\n"}
						<Text style={styles.chSpeed}>50kW Fast Charging</Text>
					</Text>
					<Text style={styles.avaCOn}>
						{item.connector_types[2]}
						{"\n"}
						<Text style={styles.chSpeed}>3kW Fast Charging</Text>
					</Text>
				</Animated.View>
			);
		});
	};

	//Mapping cards to markers
	useEffect(() => {
		mapAnimation.addListener(({ value }) => {
			let index = Math.floor(value / CARD_WIDTH + 0.3);
			if (index >= data.chargers.length) {
				index = data.chargers.length - 1;
			}
			if (index <= 0) {
				index = 0;
			}

			clearTimeout(regionTimeout);
			//Changing the RegionView to current card on screen
			const regionTimeout = setTimeout(() => {
				if (mapIndex !== index) {
					mapIndex = index;
					const { location } = data.chargers[index];
					mapRef.current.animateToRegion({
						...location,
						latitudeDelta: 0.1,
						longitudeDelta: 0.1,
					});
				}
			});
		});
	});

	//Mapping markers to cards
	const onMarkerPress = (mapEventData) => {
		const markerID = mapEventData._targetInst.return.key;

		let x = markerID * CARD_WIDTH + markerID * 20;

		_scrollView.current.scrollTo({ x: x, y: 0, animated: true });
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

	//MainScreen
	return (
		<View style={styles.mainContainer}>
			<MapView ref={mapRef} style={styles.map} region={mapRegion}>
				{showLocationsOfMarker()}
				<Marker coordinate={mapRegion} title="Your Location">
					<FontAwesome size={30} name="location-arrow" beatFade style={{ color: "#da36dd" }} />
				</Marker>
			</MapView>
			<Cbutton onPress={takeSnapshotAndShare} title="Share"></Cbutton>
			<Animated.ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				ref={_scrollView}
				pagingEnabled
				decelerationRate={"normal"}
				snapToInterval={340}
				snapToAlignment="center"
				style={styles.scrollView}
				contentContainerStyle={{
					paddingHorizontal: Platform.OS === "android" ? SPACING_FOR_CARD_INSET : 0,
				}}
				onScroll={Animated.event(
					[
						{
							nativeEvent: {
								contentOffset: {
									x: mapAnimation,
								},
							},
						},
					],
					{ useNativeDriver: true }
				)}
			>
				{showChargerDetails()}
			</Animated.ScrollView>
		</View>
	);
}

//styles
const styles = StyleSheet.create({
	mainContainer: {
		flex: 1,
	},
	chSpeed: {
		color: "#3BAE96",
		fontSize: 10,
	},
	avaCOn: {
		marginVertical: 5,
		marginHorizontal: 20,
		color: "#fff",
		textTransform: "capitalize",
	},
	supCon: {
		marginVertical: 10,
		marginHorizontal: 10,
		color: "#3BAE96",
		fontSize: 12,
		fontWeight: "bold",
		textTransform: "uppercase",
	},
	card: {
		elevation: 2,
		height: 225,
		width: 225,
		backgroundColor: "#191919",
		borderRadius: 10,
		marginHorizontal: 30,
		marginVertical: 40,
		overflow: "hidden",
	},
	cardTitle: {
		paddingTop: 15,
		paddingLeft: 10,
		fontSize: 12,
		color: "#fff",
		fontWeight: "bold",
		textTransform: "uppercase",
	},
	cardAddress: {
		fontSize: 10,
		paddingLeft: 10,
		paddingTop: 2,
		color: "#8a8a91",
		fontWeight: "bold",
	},
	scrollView: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		paddingVertical: 30,
		paddingHorizontal: 5,
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
