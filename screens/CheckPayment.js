import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Sidebar from './Sidebar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const MonthlyDue = ({ navigation }) => {
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [username, setUsername] = useState('');
  const [monthlyDues, setMonthlyDues] = useState([]);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const { username } = JSON.parse(userData);
          setUsername(username);
          fetchMonthlyDue(username);
          const userResponse = await axios.get(
            `https://darkorchid-caribou-718106.hostingersite.com/app/db_connection/getuser.php?username=${username}`
          );
          setUser(userResponse.data);
        } else {
          navigation.navigate('Login');
        }
      } catch (error) {
        console.error('Failed to get user data:', error);
        navigation.navigate('Login');
      }
    };
    getUserData();
  }, []);

  const fetchMonthlyDue = async (username) => {
    try {
      const response = await axios.get(
        `https://darkorchid-caribou-718106.hostingersite.com/app/db_connection/getMonthlyDue.php?username=${username}`
      );
      if (response.data.error) {
        setError(response.data.error);
      } else {
        setMonthlyDues(response.data);
      }
    } catch (error) {
      console.error('Error fetching monthly due:', error.message);
      setError('Failed to fetch monthly due');
    }
  };

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  const navigateToProfile = () => {
    navigation.navigate('Profile');
  };

  const totalAmount = monthlyDues.reduce((total, due) => total + parseFloat(due.amount || 0), 0);

  const imageUrl = user?.ho_pic ? `https://darkorchid-caribou-718106.hostingersite.com/app/db_connection/${user.ho_pic}` : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleSidebar}>
          <Icon name="menu" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>My Bill</Text>
        <TouchableOpacity onPress={navigateToProfile}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.profileImage} />
          ) : (
            <Icon name="person" size={40} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {isSidebarVisible && <Sidebar onClose={toggleSidebar} navigation={navigation} />}

      <ScrollView style={styles.content}>
        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : monthlyDues.length > 0 ? (
          <>
            {monthlyDues.map((due, index) => (
              <View
                key={index}
                style={[
                  styles.card,
                  due.status === 'Overdue' && styles.overdueCard,
                ]}
              >
                <View style={styles.infoItem}>
                  <Text style={styles.label}>Month:</Text>
                  <Text style={styles.value}>{due.month}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.label}>Year:</Text>
                  <Text style={styles.value}>{due.year}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.label}>Amount Due:</Text>
                  <Text style={styles.value}>₱ {due.amount}.00</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.label}>Status:</Text>
                  <Text style={styles.value}>{due.status}</Text>
                </View>
              </View>
            ))}

            <View style={styles.totalBillsContainer}>
              <Text style={styles.totalBillsText}>Total Bills: ₱ {totalAmount.toFixed(2)}</Text>
            </View>
          </>
        ) : (
          <Text style={styles.loading}>Loading...</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: 'rgb(10, 80, 57)',
    marginTop: 30,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    elevation: 3,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fff',
  },
  content: { flex: 1, padding: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  overdueCard: { borderColor: 'red' },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  label: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  value: { fontSize: 16, color: '#666' },
  totalBillsContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  totalBillsText: { fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  error: { color: 'red', fontSize: 16, textAlign: 'center' },
  loading: { fontSize: 18, textAlign: 'center' },
});

export default MonthlyDue;


