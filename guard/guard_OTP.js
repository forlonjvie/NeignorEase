import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, FlatList, Modal } from 'react-native';

// Function to fetch homeowner data based on RFID UID
const fetchHomeownerDetails = async (rfidUID, setHomeownerData, setErrorMessage) => {
  const url = `http://192.168.43.178/12_18/4Capstone/app/guard/db_connection/getScan.php?rfid=${rfidUID}`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    const jsonResponse = await response.json();
    if (jsonResponse.Status && jsonResponse.Data.length > 0) {
      return jsonResponse.Data[0];
    } else {
      setErrorMessage(jsonResponse.Message || "No data available for this RFID.");
    }
  } catch (error) {
    setErrorMessage(`Error: ${error.message}`);
  }
  return null;
};

// Function to save logs to the server
const saveLogToServer = async (name, point, setErrorMessage) => {
  const logURL = "http://192.168.43.178/12_18/4Capstone/app/guard/db_connection/save_log_HO.php";
  const logData = { name, point };
  try {
    const response = await fetch(logURL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logData),
    });
    const jsonResponse = await response.json();
    if (jsonResponse.status === "success") {
      Alert.alert('Success', 'Log saved successfully.');
    } else {
      setErrorMessage(jsonResponse.message || "Failed to save log.");
    }
  } catch (error) {
    setErrorMessage(`Error: ${error.message}`);
  }
};

const App = ({ navigation }) => {
  const [homeownerData, setHomeownerData] = useState({
    HOQ_id: '',
    homeowner_id: '',
    username: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [homeownerLogs, setHomeownerLogs] = useState([]);
  const [nextAction, setNextAction] = useState('Entry');
  const [rfidUID, setRfidUID] = useState('');
  const [logModalVisible, setLogModalVisible] = useState(false);

  useEffect(() => {
    const fetchRFIDData = () => {
      fetch('http://192.168.43.178/12_18/4Capstone/app/guard/UIDContainer.php')
        .then(response => response.text())
        .then(data => {
          setRfidUID(data);
        })
        .catch(error => {
          console.error("Failed to fetch RFID UID:", error);
          Alert.alert('Error', 'Could not fetch RFID data.');
        });
    };

    const intervalId = setInterval(fetchRFIDData, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (rfidUID) {
        const latestData = await fetchHomeownerDetails(rfidUID, setHomeownerData, setErrorMessage);
        if (latestData) {
          setHomeownerData(latestData);
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [rfidUID]);

  const handleLogAction = async () => {
    await saveLogToServer(homeownerData.username, nextAction, setErrorMessage);
    setHomeownerLogs(prevLogs => [
      ...prevLogs,
      { ...homeownerData, logTime: new Date().toLocaleString(), action: nextAction },
    ]);
    Alert.alert(`${nextAction} Recorded`, `${nextAction} for ${homeownerData.username} logged.`);
    setNextAction(nextAction === 'Entry' ? 'Exit' : 'Entry');
  };

  return (
    <View style={styles.container}>
      {/* Navbar */}
      <View style={styles.navbar}>
  <TouchableOpacity style={styles.navButton} onPress={() => setLogModalVisible(true)}>
    <Text style={styles.navButtonText}>🗂 Homeowner Logs</Text>
  </TouchableOpacity>
  <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('TodayGuest')}>
    <Text style={styles.navButtonText}>📅 Today’s Guests</Text>
  </TouchableOpacity>
  <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('guard_ho_qr')}>
    <Text style={styles.navButtonText}>📅 Today’s Guests</Text>
  </TouchableOpacity>
</View>

      <Text style={styles.title}>Upcoming Homeowner</Text>
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{homeownerData.username || 'N/A'}</Text>
        <Text style={styles.cardValue}>{rfidUID ? rfidUID : 'Waiting for RFID scan...'}</Text>
      </View>

      <TouchableOpacity style={styles.actionButton} onPress={handleLogAction}>
        <Text style={styles.buttonText}>{nextAction}</Text>
      </TouchableOpacity>

      {/* Modal for Homeowner Logs */}
      <Modal
        visible={logModalVisible}
        animationType="slide"
        onRequestClose={() => setLogModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Homeowner Logs</Text>
          <FlatList
            data={homeownerLogs}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.logItem}>
                <Text style={styles.logText}>{`${item.action} - ${item.username} at ${item.logTime}`}</Text>
              </View>
            )}
          />
          <TouchableOpacity
            style={styles.closeModalButton}
            onPress={() => setLogModalVisible(false)}
          >
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    width: 360,
    left: -20,
    backgroundColor: '#2C3E50', // Darker shade for a modern look
    borderBottomWidth: 2,
    borderBottomColor: '#2980B9', // Accent color for the border
    borderRadius: 10,
    elevation: 5, // Shadow effect
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 15,
  },
  navButtonText: {
    color: '#ecf0f1', // Light text for contrast
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    color: '#007bff',
  },
  cardValue: {
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
    color: '#555',
  },
  actionButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 10,
    marginTop: 30,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#007bff',
  },
  logItem: {
    padding: 12,
    backgroundColor: '#e9ecef',
    borderRadius: 6,
    marginBottom: 10,
  },
  logText: {
    color: '#333',
    fontSize: 14,
  },
  closeModalButton: {
    backgroundColor: '#6c757d',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
});

export default App;
