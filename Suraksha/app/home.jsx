import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import axios from "axios";
import dangerPoints from '../data/dangerPoints.json';

const ORS_API_KEY = process.env.ORS_API_KEY;

const ClearButton = ({ onPress }) => (
    <TouchableOpacity style={styles.clearButton} onPress={onPress}>
        <Text style={styles.clearButtonText}>×</Text>
    </TouchableOpacity>
);

const Home = () => {
    const [startLocation, setStartLocation] = useState(null);
    const [startAddress, setStartAddress] = useState("");
    const [endLocation, setEndLocation] = useState("");
    const [routeCoords, setRouteCoords] = useState([]);
    const [startSuggestions, setStartSuggestions] = useState([]);
    const [endSuggestions, setEndSuggestions] = useState([]);
    const [isLoadingStart, setIsLoadingStart] = useState(false);
    const [isLoadingEnd, setIsLoadingEnd] = useState(false);
    const [isLoadingRoute, setIsLoadingRoute] = useState(false);
    const [isLoadingLiveLocation, setIsLoadingLiveLocation] = useState(false);
    const [mapRegion, setMapRegion] = useState(null);

    useEffect(() => {
        getCurrentLocation();
    }, []);

    const getCurrentLocation = async () => {
        setIsLoadingLiveLocation(true);
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
            Alert.alert(
                "Permission denied",
                "Allow location access to use this feature."
            );
            setIsLoadingLiveLocation(false);
            return;
        }

        try {
            // Add location options for faster response
            let location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced, // Lower accuracy for faster response
                maximumAge: 10000, // Accept locations up to 10 seconds old
                timeout: 5000, // Timeout after 5 seconds
            });

            const currentLocation = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            };
            setStartLocation(currentLocation);

            // Set map region immediately for better UX
            setMapRegion({
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            });

            // Reverse geocoding with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            try {
                const response = await axios.get(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${currentLocation.latitude}&lon=${currentLocation.longitude}`,
                    {
                        headers: {
                            "User-Agent": "NyaySaathi/1.0.0",
                            "Accept-Language": "en-US,en;q=0.9",
                        },
                        signal: controller.signal,
                    }
                );

                clearTimeout(timeoutId);
                if (response.data && response.data.display_name) {
                    setStartAddress(response.data.display_name);
                    setStartSuggestions([]);
                }
            } catch (error) {
                if (error.name === "AbortError") {
                    console.log("Reverse geocoding timed out");
                    setStartAddress(
                        `${currentLocation.latitude.toFixed(
                            4
                        )}, ${currentLocation.longitude.toFixed(4)}`
                    );
                }
            }
        } catch (error) {
            console.error("Error getting location:", error);
            Alert.alert("Error", "Failed to get current location.");
        } finally {
            setIsLoadingLiveLocation(false);
        }
    };

    const getCoordinates = async (address) => {
        if (!address) return null;
        try {
            const response = await axios.get(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                    address
                )}&limit=1`,
                {
                    headers: {
                        "User-Agent": "NyaySaathi/1.0.0",
                        "Accept-Language": "en-US,en;q=0.9",
                    },
                }
            );
            if (response.data.length > 0) {
                return {
                    latitude: parseFloat(response.data[0].lat),
                    longitude: parseFloat(response.data[0].lon),
                };
            }
            return null;
        } catch (error) {
            Alert.alert("Error", "Failed to fetch coordinates.");
            return null;
        }
    };

    const getRoute = async () => {
        setIsLoadingRoute(true);
        let startCoords = startLocation;
        if (startAddress) startCoords = await getCoordinates(startAddress);
        if (!startCoords || !endLocation) {
            Alert.alert("Error", "Please enter valid locations.");
            setIsLoadingRoute(false);
            return;
        }

        const endCoords = await getCoordinates(endLocation);
        if (!endCoords) {
            setIsLoadingRoute(false);
            return;
        }

        try {
            const response = await axios.get(
                `https://router.project-osrm.org/route/v1/driving/${startCoords.longitude},${startCoords.latitude};${endCoords.longitude},${endCoords.latitude}?overview=full&geometries=geojson`
            );

            if (response.data.routes && response.data.routes.length > 0) {
                const coordinates = response.data.routes[0].geometry.coordinates.map(
                    (coord) => ({
                        latitude: coord[1],
                        longitude: coord[0],
                    })
                );
                setRouteCoords(coordinates);
                setMapRegion(getMapRegion(startCoords, endCoords));
            } else {
                Alert.alert("Error", "No route found.");
            }
        } catch (error) {
            console.error("API Error:", error);
            Alert.alert("Error", "Failed to fetch route.");
        } finally {
            setIsLoadingRoute(false);
        }
    };

    const searchLocations = async (query) => {
        if (!query || query.length < 3) return [];

        try {
            const response = await axios.get(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                    query
                )}&limit=5`,
                {
                    headers: {
                        "User-Agent": "NyaySaathi/1.0.0",
                        "Accept-Language": "en-US,en;q=0.9",
                    },
                }
            );

            return response.data.map((item) => ({
                display_name: item.display_name,
                lat: parseFloat(item.lat),
                lon: parseFloat(item.lon),
            }));
        } catch (error) {
            console.error("Error fetching suggestions:", error);
            return [];
        }
    };

    const getMapRegion = (startCoords, endCoords) => {
        const minLat = Math.min(startCoords.latitude, endCoords.latitude);
        const maxLat = Math.max(startCoords.latitude, endCoords.latitude);
        const minLng = Math.min(startCoords.longitude, endCoords.longitude);
        const maxLng = Math.max(startCoords.longitude, endCoords.longitude);

        const latDelta = (maxLat - minLat) * 1.5; // Add 50% padding
        const lngDelta = (maxLng - minLng) * 1.5;

        return {
            latitude: (minLat + maxLat) / 2,
            longitude: (minLng + maxLng) / 2,
            latitudeDelta: Math.max(latDelta, 0.05),
            longitudeDelta: Math.max(lngDelta, 0.05),
        };
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Find the Safest Route</Text>

            <View style={styles.inputContainer}>
                <View style={styles.searchBoxContainer}>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={[styles.input, styles.searchInput]}
                            placeholder="Enter Start Location"
                            value={startAddress}
                            onChangeText={async (text) => {
                                setStartAddress(text);
                                if (text.length >= 3) {
                                    setIsLoadingStart(true);
                                    const suggestions = await searchLocations(text);
                                    setStartSuggestions(suggestions);
                                    setIsLoadingStart(false);
                                } else {
                                    setStartSuggestions([]);
                                }
                            }}
                        />
                        {isLoadingStart ? (
                            <View style={styles.loadingIndicator}>
                                <ActivityIndicator size="small" color="#fa3c75" />
                            </View>
                        ) : (
                            startAddress !== "" && (
                                <ClearButton
                                    onPress={() => {
                                        setStartAddress("");
                                        setStartLocation(null);
                                        setStartSuggestions([]);
                                    }}
                                />
                            )
                        )}
                    </View>
                    {startSuggestions.length > 0 && (
                        <View style={styles.suggestionsContainer}>
                            {startSuggestions.map((suggestion, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.suggestionItem}
                                    onPress={() => {
                                        setStartAddress(suggestion.display_name);
                                        setStartLocation({
                                            latitude: suggestion.lat,
                                            longitude: suggestion.lon,
                                        });
                                        setStartSuggestions([]);
                                    }}
                                >
                                    <Text style={styles.suggestionText}>
                                        {suggestion.display_name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                <View style={styles.searchBoxContainer2}>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={[styles.input, styles.searchInput]}
                            placeholder="Enter End Destination"
                            value={endLocation}
                            onChangeText={async (text) => {
                                setEndLocation(text);
                                if (text.length >= 3) {
                                    const suggestions = await searchLocations(text);
                                    setEndSuggestions(suggestions);
                                } else {
                                    setEndSuggestions([]);
                                }
                            }}
                        />
                        {endLocation !== "" && (
                            <ClearButton
                                onPress={() => {
                                    setEndLocation("");
                                    setEndSuggestions([]);
                                }}
                            />
                        )}
                    </View>
                    {endSuggestions.length > 0 && (
                        <View style={styles.suggestionsContainer}>
                            {endSuggestions.map((suggestion, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.suggestionItem}
                                    onPress={() => {
                                        setEndLocation(suggestion.display_name);
                                        setEndSuggestions([]);
                                    }}
                                >
                                    <Text style={styles.suggestionText}>
                                        {suggestion.display_name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            </View>

            <TouchableOpacity
                style={[
                    styles.button,
                    isLoadingLiveLocation ? styles.buttonDisabled : null,
                ]}
                onPress={getCurrentLocation}
                disabled={isLoadingLiveLocation}
            >
                <View style={styles.buttonContent}>
                    {isLoadingLiveLocation ? (
                        <>
                            <Text style={styles.buttonLoadingText}>Getting Location</Text>
                            <ActivityIndicator size="small" color="#fff" />
                        </>
                    ) : (
                        <Text style={styles.buttonText}>Use Live Location</Text>
                    )}
                </View>
            </TouchableOpacity>
            <TouchableOpacity
                style={[
                    styles.button,
                    (!startLocation && !startAddress) || !endLocation || isLoadingRoute
                        ? styles.buttonDisabled
                        : null,
                ]}
                onPress={getRoute}
                disabled={
                    (!startLocation && !startAddress) || !endLocation || isLoadingRoute
                }
            >
                <View style={styles.buttonContent}>
                    {isLoadingRoute ? (
                        <>
                            <Text style={styles.buttonLoadingText}>Finding Route</Text>
                            <ActivityIndicator size="small" color="#fff" />
                        </>
                    ) : (
                        <Text style={styles.buttonText}>Find Safest Route</Text>
                    )}
                </View>
            </TouchableOpacity>

            <MapView
                style={styles.map}
                region={
                    mapRegion || {
                        latitude: startLocation?.latitude || 22.5726,
                        longitude: startLocation?.longitude || 88.3639,
                        latitudeDelta: 0.05,
                        longitudeDelta: 0.05,
                    }
                }
            >
                {startLocation && (
                    <Marker coordinate={startLocation} title="Start Location" pinColor="#ed00fa" />
                )}
                {routeCoords.length > 0 && (
                    <Marker
                        coordinate={routeCoords[routeCoords.length - 1]}
                        title="End Destination"
                        pinColor="#ed00fa" // This sets the end marker color to pink
                    />
                )}
                {routeCoords.length > 0 && (
                    <Polyline
                        coordinates={routeCoords}
                        strokeWidth={4}
                        strokeColor="#ed00fa"
                    />
                )}

                {/* Show Danger Points */}
                {dangerPoints.flat().map(
                    (point) =>
                        point.risk_level && ( // Ensure risk_level exists before calling toUpperCase()
                            <Marker
                                key={point.id}
                                coordinate={{
                                    latitude: point.latitude,
                                    longitude: point.longitude,
                                }}
                                title={`⚠ ${point.risk_level.toUpperCase()} RISK`}
                                description={point.description}
                                pinColor={point.risk_level === "high" ? "red" : "orange"}
                            />
                        )
                )}
            </MapView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#fff" },
    title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
    input: { borderWidth: 1, padding: 10, marginVertical: 10, borderRadius: 5 },
    button: {
        backgroundColor: "#fa3c75",
        padding: 10,
        borderRadius: 5,
        alignItems: "center",
    },
    buttonText: { color: "#fff", fontWeight: "bold" },
    map: { width: "100%", height: 400, marginTop: 20 },
    inputContainer: {
        width: "100%",
        paddingHorizontal: 20,
        position: "relative",
    },
    searchBoxContainer: {
        marginBottom: 15,
        position: "relative",
        zIndex: 2,
    },
    searchBoxContainer2: {
        marginBottom: 15,
        position: "relative",
        zIndex: 1,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        position: "relative",
        backgroundColor: "white",
        borderRadius: 8,
        marginVertical: 5,
        height: 50,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    searchInput: {
        flex: 1,
        height: "100%",
        paddingVertical: 0,
        paddingHorizontal: 15,
        paddingRight: 40,
        fontSize: 16,
    },
    suggestionsContainer: {
        position: "absolute",
        top: "100%",
        left: 0,
        right: 0,
        backgroundColor: "white",
        borderRadius: 8,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        maxHeight: 200,
    },
    suggestionItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    suggestionText: {
        fontSize: 14,
        color: "#333",
    },
    clearButton: {
        position: "absolute",
        right: 10,
        height: "100%",
        justifyContent: "center",
        paddingHorizontal: 10,
    },
    clearButtonText: {
        fontSize: 24,
        color: "#666",
        fontWeight: "bold",
    },
    buttonDisabled: {
        backgroundColor: "#ccc",
        opacity: 0.7,
    },
    loadingIndicator: {
        position: "absolute",
        right: 10,
        height: "100%",
        justifyContent: "center",
        paddingHorizontal: 10,
    },
    buttonContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    buttonLoadingText: {
        color: "#fff",
        fontWeight: "bold",
        marginRight: 10,
    },
});

export default Home;