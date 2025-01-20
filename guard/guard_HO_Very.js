import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, FlatList } from 'react-native';

// Function to fetch homeowner data
const fetchHomeownerDetails = async (setHomeownerData, setErrorMessage) => {
  const url = "http://192.168.43.178/12_18/4Capstone/app/guard/db_connection/getHOquery.php";
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
      return jsonResponse.Data[0]; // Assuming the first record is the latest
    } else {
      setErrorMessage(jsonResponse.Message || "No data available");
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

// Function to get the latest log for today
const getLastLogForToday = async (username, setErrorMessage) => {
  const url = `http://192.168.43.178/12_18/4Capstone/app/guard/db_connection/get_today_log.php?username=${username}`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    const jsonResponse = await response.json();
    if (jsonResponse.status === "success" && jsonResponse.data.length > 0) {
      return jsonResponse.data[0].point; // Last action for today (either "Entry" or "Exit")
    }
  } catch (error) {
    setErrorMessage(`Error: ${error.message}`);
  }
  return null;
};

const App = ({ navigation }) => {
  const [homeownerData, setHomeownerData] = useState({
    HOQ_id: '',
    homeowner_id: '',
    username: '',
    address: '',
    date: '',
    time: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [homeownerLogs, setHomeownerLogs] = useState([]);
  const [nextAction, setNextAction] = useState('Entry');

  useEffect(() => {
    const interval = setInterval(async () => {
      const latestData = await fetchHomeownerDetails(setHomeownerData, setErrorMessage);
      if (latestData) {
        setHomeownerData(latestData);
        const lastLog = await getLastLogForToday(latestData.username, setErrorMessage);
        setNextAction(lastLog === 'Entry' ? 'Exit' : 'Entry'); // Toggle action based on the last log
      }
    }, 5000); // Fetch data every 5 seconds
    return () => clearInterval(interval); // Clear interval on unmount
  }, []);

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
      <TouchableOpacity style={styles.refreshButton} onPress={() => navigation.navigate('TodayGuest')}>
        <Text style={styles.refreshText}>Switch to Expect Guest for Today</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Homeowner Query Details</Text>
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder="Username" value={homeownerData.username} editable={false} />
        <TextInput style={styles.input} placeholder="Address" value={homeownerData.address} editable={false} />
        <TextInput style={styles.input} placeholder="Date" value={homeownerData.date} editable={false} />
        <TextInput style={styles.input} placeholder="Time" value={homeownerData.time} editable={false} />
      </View>

      <TouchableOpacity style={styles.actionButton} onPress={handleLogAction}>
        <Text style={styles.buttonText}>{nextAction}</Text>
      </TouchableOpacity>

      <Text style={styles.logsTitle}>Homeowner Logs:</Text>
      <FlatList
        data={homeownerLogs}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.logItem}>
            <Text>{`${item.action} - ${item.username} at ${item.logTime}`}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f0f0',
    marginTop: 50,
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    color: '#222',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
    fontSize: 16,
  },
  refreshButton: {
    position: 'absolute',
    top: 10,
    right: 95,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 70,
    elevation: 4,
  },
  refreshText: {
    fontSize: 10,
    color: '#444',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  actionButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  logsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 15,
  },
  logItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default App;
