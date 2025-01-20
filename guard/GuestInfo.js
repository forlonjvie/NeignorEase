import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Alert, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Function to fetch the last log of the current day for the guest
const getLastLogForToday = async (username, setErrorMessage) => {
  const todayLogURL = `http://192.168.43.178/12_18/4Capstone/app/guard/db_connection/get_today_guest.php?username=${username}`;

  try {
    const response = await fetch(todayLogURL, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    const jsonResponse = await response.json();
    if (jsonResponse.status === 'success' && jsonResponse.data.length > 0) {
      return jsonResponse.data[0].point; // Return the last log's point ("Entry" or "Exit")
    } else {
      return null; // No logs found
    }
  } catch (error) {
    setErrorMessage(`Error: ${error.message}`);
  }
  return null;
};

// Function to save a log to the server (Entry/Exit)
const saveLogToServer = async (username, point, setErrorMessage) => {
  const saveLogURL = 'http://192.168.43.178/12_18/4Capstone/app/guard/db_connection/save_log.php';
  const logData = {
    name: username, // guest's OTP
    point: point,   // Entry or Exit
  };

  try {
    const response = await fetch(saveLogURL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logData),
    });

    const jsonResponse = await response.json();
    if (jsonResponse.status !== 'success') {
      setErrorMessage(jsonResponse.message);
    }
  } catch (error) {
    setErrorMessage(`Error: ${error.message}`);
  }
};

const GuestInfo = ({ route }) => {
  const { guest } = route.params; // Get guest data from route params
  const [errorMessage, setErrorMessage] = useState('');
  const [nextAction, setNextAction] = useState('Entry'); // Default action is Entry
  const [guestLogs, setGuestLogs] = useState([]);

  // Fetch the last log on mount and determine next action (Entry/Exit)
  useEffect(() => {
    const fetchLastLog = async () => {
      const lastLog = await getLastLogForToday(guest.Guest_name, setErrorMessage);
      setNextAction(lastLog === 'Entry' ? 'Exit' : 'Entry'); // Set the next action
    };

    fetchLastLog();
  }, [guest.Guest_name]);

  // Handle log action (Entry/Exit)
  const handleLogAction = async () => {
    await saveLogToServer(guest.Guest_name, nextAction, setErrorMessage);

    setGuestLogs((prevLogs) => [
      ...prevLogs,
      {
        guestName: guest.Guest_name,
        logTime: new Date().toLocaleString(),
        action: nextAction,
        Date_confirmed: guest.Date_confirmed,
      },
    ]);

    Alert.alert(`${nextAction} Recorded`, `${nextAction} for ${guest.Guest_name} logged.`);
    setNextAction(nextAction === 'Entry' ? 'Exit' : 'Entry'); // Toggle next action
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: 'https://via.placeholder.com/100' }} style={styles.guestImage} />
      <Text style={styles.guestName}>{guest.Guest_name}</Text>
      <Text style={styles.guestDetails}>
        <Icon name="place" size={16} color="#888" /> {guest.HO_name}
      </Text>
      <Text style={styles.guestDetails}>
        <Icon name="email" size={16} color="#888" /> OTP: {guest.OTP}
      </Text>
      <Text style={styles.guestDetails}>
        <Icon name="access-time" size={16} color="#888" /> Confirm at: {guest.Date_confirmed}
      </Text>
      <Text style={styles.guestDetails}>
        <Icon name="access-time" size={16} color="#888" /> Validity: {guest.Validity}
      </Text>

      {/* Button to trigger the log action */}
      <TouchableOpacity style={styles.actionButton} onPress={handleLogAction}>
        <Text style={styles.actionButtonText}>Log {nextAction}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default GuestInfo;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f4f6f8', // Light background for a clean look
  },
  guestImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgb(10, 80, 57)', // Add a border to the image for emphasis
  },
  guestName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  guestDetails: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: 'rgb(10, 80, 57)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 20,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  errorMessage: {
    color: 'red',
    marginTop: 15,
    textAlign: 'center',
    fontSize: 14,
  },
});
