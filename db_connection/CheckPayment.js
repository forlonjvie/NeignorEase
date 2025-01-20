import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Sidebar from './Sidebar'; // Assuming you have a sidebar component
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const MonthlyDue = ({ navigation }) => {
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [username, setUsername] = useState(''); // Store username
  const [monthlyDue, setMonthlyDue] = useState(null); // Store monthly due data
  const [error, setError] = useState(null);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const { username } = JSON.parse(userData);
          setUsername(username); // Store username in state
          fetchMonthlyDue(username); // Fetch the monthly due based on the username
        } else {
          navigation.navigate('Login'); // Redirect to login if no user data
        }
      } catch (error) {
        console.error("Failed to get user data:", error);
        navigation.navigate('Login'); // Redirect to login on error
      }
    };
    getUserData();
  }, []);

  // Function to fetch monthly due from backend
  const fetchMonthlyDue = async (username) => {
    try {
      const response = await axios.get(`http://192.168.1.6/12_18/4Capstone/app/db_connection/getMonthlyDue.php?username=${username}`);
      if (response.data.error) {
        setError(response.data.error);
      } else {
        setMonthlyDue(response.data);
      }
    } catch (error) {
      console.error('Error fetching monthly due:', error);
      setError('Failed to fetch monthly due');
    }
  };

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setSidebarVisible((prevState) => !prevState);
  };

  // Navigate to profile screen
  const navigateToProfile = () => {
    navigation.navigate('Profile');
  };

  // Handle back button press
  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Monthly Due</Text>
        <TouchableOpacity onPress={navigateToProfile}>
          <Image source={require('../assets/man.png')} style={styles.userImage} />
        </TouchableOpacity>
      </View>

      {/* Sidebar */}
      {isSidebarVisible && <Sidebar onClose={toggleSidebar} navigation={navigation} />}

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.heading}>Homeowner Monthly Due</Text>
        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : monthlyDue ? (
          <View style={styles.card}>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Month:</Text>
              <Text style={styles.value}>{monthlyDue.month}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Year:</Text>
              <Text style={styles.value}>{monthlyDue.year}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Amount Due:</Text>
              <Text style={styles.value}>${monthlyDue.amount}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Status:</Text>
              <Text style={styles.value}>{monthlyDue.status}</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.loading}>Loading...</Text>
        )}
      </View>
    </View>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#007bff',
    marginTop: 30,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  value: {
    fontSize: 16,
    color: '#666',
  },
  error: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  loading: {
    fontSize: 18,
    textAlign: 'center',
  },
});

export default MonthlyDue;
