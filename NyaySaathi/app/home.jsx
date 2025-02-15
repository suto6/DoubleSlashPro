import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';

const ORS_API_KEY = "5b3ce3597851110001cf62484edfa7e43df048af9dd0d08117e2b16b";

// Sample danger points (Replace with API call later)
const dangerPoints = [
    [
        {
            "id": 1,
            "latitude": 28.7041,
            "longitude": 77.1025,
            "risk_level": "high",
            "description": "Reported incidents of harassment at night.",
            "time": "After 9 PM",
            "reports": 12
        },
        {
            "id": 2,
            "latitude": 28.6139,
            "longitude": 77.2090,
            "risk_level": "medium",
            "description": "Poor lighting and deserted at night.",
            "time": "Evening & Night",
            "reports": 7
        },
        {
            "id": 3,
            "latitude": 28.5355,
            "longitude": 77.3910,
            "risk_level": "high",
            "description": "Multiple cases of theft and harassment reported.",
            "time": "Late Night",
            "reports": 15
        },
        {
            "id": 4,
            "latitude": 19.0760,
            "longitude": 72.8777,
            "risk_level": "low",
            "description": "Occasional catcalling incidents reported.",
            "time": "Evening",
            "reports": 3
        },
        {
            "id": 5,
            "latitude": 12.9716,
            "longitude": 77.5946,
            "risk_level": "high",
            "description": "Dark alleys with no CCTV coverage.",
            "time": "Night",
            "reports": 10
        },
        {
            "id": 6,
            "latitude": 22.5726,
            "longitude": 88.3639,
            "risk_level": "medium",
            "description": "Isolated area with no security presence.",
            "time": "Late Evening",
            "reports": 5
        }
    ]

];

const Home = () => {
    const [startLocation, setStartLocation] = useState(null);
    const [startAddress, setStartAddress] = useState('');
    const [endLocation, setEndLocation] = useState('');
    const [routeCoords, setRouteCoords] = useState([]);

    useEffect(() => {
        getCurrentLocation();
    }, []);

    const getCurrentLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission denied', 'Allow location access to use this feature.');
            return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setStartLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
        });
    };

    const getCoordinates = async (address) => {
        if (!address) return null;
        const url = `https://api.openrouteservice.org/geocode/search?api_key=${ORS_API_KEY}&text=${encodeURIComponent(address)}`;
        try {
            const response = await axios.get(url);
            const data = response.data.features[0]?.geometry?.coordinates;
            return data ? { latitude: data[1], longitude: data[0] } : null;
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch coordinates.');
            return null;
        }
    };

    const getRoute = async () => {
        let startCoords = startLocation;
        if (startAddress) startCoords = await getCoordinates(startAddress);
        if (!startCoords || !endLocation) {
            Alert.alert('Error', 'Please enter valid locations.');
            return;
        }

        const endCoords = await getCoordinates(endLocation);
        if (!endCoords) return;

        const url = `https://api.openrouteservice.org/v2/directions/driving-car/geojson`;

        try {
            const response = await axios.post(
                url,
                { coordinates: [[startCoords.longitude, startCoords.latitude], [endCoords.longitude, endCoords.latitude]] },
                { headers: { "Authorization": ORS_API_KEY, "Content-Type": "application/json" } }
            );

            if (response.data.features.length > 0) {
                const coordinates = response.data.features[0].geometry.coordinates.map(coord => ({
                    latitude: coord[1],
                    longitude: coord[0]
                }));
                setRouteCoords(coordinates);
            } else {
                Alert.alert('Error', 'No route found.');
            }
        } catch (error) {
            console.error("API Error:", error);
            Alert.alert('Error', 'Failed to fetch route.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Find the Safest Route</Text>

            <TextInput style={styles.input} placeholder="Enter Start Location" value={startAddress} onChangeText={setStartAddress} />
            <TouchableOpacity style={styles.button} onPress={getCurrentLocation}>
                <Text style={styles.buttonText}>Use Live Location</Text>
            </TouchableOpacity>
            <TextInput style={styles.input} placeholder="Enter End Destination" value={endLocation} onChangeText={setEndLocation} />
            <TouchableOpacity style={styles.button} onPress={getRoute}>
                <Text style={styles.buttonText}>Get Route</Text>
            </TouchableOpacity>

            <MapView
                style={styles.map}
                region={{ latitude: startLocation?.latitude || 28.6139, longitude: startLocation?.longitude || 77.2090, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
            >
                {startLocation && <Marker coordinate={startLocation} title="Start Location" />}
                {routeCoords.length > 0 && <Marker coordinate={routeCoords[routeCoords.length - 1]} title="End Destination" />}
                {routeCoords.length > 0 && <Polyline coordinates={routeCoords} strokeWidth={4} strokeColor="blue" />}

                {/* Show Danger Points */}
                {dangerPoints.flat().map(point => (
                    point.risk_level && (  // Ensure risk_level exists before calling toUpperCase()
                        <Marker
                            key={point.id}
                            coordinate={{ latitude: point.latitude, longitude: point.longitude }}
                            title={`⚠ ${point.risk_level.toUpperCase()} RISK`}
                            description={point.description}
                            pinColor={point.risk_level === "high" ? "red" : "orange"}
                        />
                    )
                ))}

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
