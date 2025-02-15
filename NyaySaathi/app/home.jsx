import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';

const ORS_API_KEY = "5b3ce3597851110001cf62484edfa7e43df048af9dd0d08117e2b16b"; 

const Home = () => {
    const [startLocation, setStartLocation] = useState(null);
    const [startAddress, setStartAddress] = useState('');
    const [endLocation, setEndLocation] = useState('');
    const [routeCoords, setRouteCoords] = useState([]);

    useEffect(() => {
        getCurrentLocation();
    }, []);

    // Get user's current location
    const getCurrentLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission denied', 'Allow location access to use this feature.');
            return;
        }

        let location = await Location.getCurrentPositionAsync({});
        const coords = { latitude: location.coords.latitude, longitude: location.coords.longitude };
        setStartLocation(coords);
    };

    // Convert address to coordinates
    const getCoordinates = async (address) => {
        if (!address) return null;
        const url = `https://api.openrouteservice.org/geocode/search?api_key=${ORS_API_KEY}&text=${encodeURIComponent(address)}`;
        try {
            const response = await axios.get(url);
            const data = response.data.features[0]?.geometry?.coordinates;
            if (data) {
                return { latitude: data[1], longitude: data[0] };
            } else {
                Alert.alert('Error', 'Invalid location. Please enter a valid address.');
                return null;
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch coordinates.');
            return null;
        }
    };

    // Fetch route data from OpenRouteService
    const getRoute = async () => {
        let startCoords = startLocation;
        if (startAddress) {
            startCoords = await getCoordinates(startAddress);
        }

        if (!startCoords || !endLocation) {
            Alert.alert('Error', 'Please enter valid locations.');
            return;
        }

        const endCoords = await getCoordinates(endLocation);
        if (!endCoords) return;

        console.log("Start Coords:", startCoords);
        console.log("End Coords:", endCoords);

        const url = `https://api.openrouteservice.org/v2/directions/driving-car/geojson`;

        try {
            const response = await axios.post(
                url,
                {
                    coordinates: [
                        [startCoords.longitude, startCoords.latitude],
                        [endCoords.longitude, endCoords.latitude]
                    ],
                },
                {
                    headers: {
                        "Authorization": ORS_API_KEY,
                        "Content-Type": "application/json",
                    },
                }
            );

            console.log("ORS Response:", response.data);

            if (response.data.features.length > 0) {
                const coordinates = response.data.features[0].geometry.coordinates.map(coord => ({
                    latitude: coord[1],
                    longitude: coord[0]
                }));
                setRouteCoords(coordinates);
            } else {
                Alert.alert('Error', 'No route found. Try again.');
            }
        } catch (error) {
            console.error("API Error:", error);
            Alert.alert('Error', 'Failed to fetch route. Try again.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Find the Safest Route</Text>

            <TextInput
                style={styles.input}
                placeholder="Enter Start Location (or leave empty for live location)"
                value={startAddress}
                onChangeText={setStartAddress}
            />

            <TouchableOpacity style={styles.button} onPress={getCurrentLocation}>
                <Text style={styles.buttonText}>Use Live Location</Text>
            </TouchableOpacity>

            <TextInput
                style={styles.input}
                placeholder="Enter End Destination"
                value={endLocation}
                onChangeText={setEndLocation}
            />

            <TouchableOpacity style={styles.button} onPress={getRoute}>
                <Text style={styles.buttonText}>Get Route</Text>
            </TouchableOpacity>

            <MapView
                style={styles.map}
                region={{
                    latitude: startLocation?.latitude || 28.6139,
                    longitude: startLocation?.longitude || 77.2090,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
            >
                {startLocation && <Marker coordinate={startLocation} title="Start Location" />}
                {routeCoords.length > 0 && <Marker coordinate={routeCoords[routeCoords.length - 1]} title="End Destination" />}

                {routeCoords.length > 0 && <Polyline coordinates={routeCoords} strokeWidth={4} strokeColor="blue" />}
            </MapView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
    input: { borderWidth: 1, padding: 10, marginVertical: 10, borderRadius: 5 },
    button: { backgroundColor: '#fa3c75', padding: 10, borderRadius: 5, alignItems: 'center' },
    buttonText: { color: '#fff', fontWeight: 'bold' },
    map: { width: '100%', height: 400, marginTop: 20 },
});

export default Home;
