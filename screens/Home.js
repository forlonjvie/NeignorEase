import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios'; 
import Sidebar from './Sidebar'; 

const HomeScreen = ({ navigation }) => {
  const [user, setUser] = useState({});
  const [totalVisits, setTotalVisits] = useState(0);
  const [totalBills, setTotalBills] = useState(0);
  const [billStatus, setBillStatus] = useState('');
  const [daysOverdue, setDaysOverdue] = useState(0);
  const [isSidebarVisible, setSidebarVisible] = useState(false);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const { username } = JSON.parse(userData);
          const response = await axios.get(`https://darkorchid-caribou-718106.hostingersite.com/app/db_connection/getuser.php?username=${username}`);
          setUser(response.data);

          // Fetch total visits
          const visitResponse = await axios.get(`https://darkorchid-caribou-718106.hostingersite.com/app/db_connection/getVisitCount.php?username=${username}`);
          setTotalVisits(visitResponse.data.visit_count || 0);

          // Fetch total bills, bill status, and days overdue
          const billResponse = await axios.get(`https://darkorchid-caribou-718106.hostingersite.com/app/db_connection/getCurrentBill.php?username=${username}`);
          if (billResponse.data.error) {
            setTotalBills(billResponse.data.total_amount || 0);
          } else {
            setTotalBills(billResponse.data.amount);
            setBillStatus(billResponse.data.status);
            // Ensure daysOverdue is a whole number
            setDaysOverdue(Math.floor(billResponse.data.days_overdue)); // Use Math.floor to make it a whole number
          }

        } else {
          navigation.navigate('Login');
        }
      } catch (error) {
        console.error("Failed to get user data:", error);
        navigation.navigate('Login');
      }
    };

    getUserData();

    const intervalId = setInterval(() => {
      getUserData();
    }, 10000);

    return () => clearInterval(intervalId);
  }, [navigation]);

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  const imageUrl = user && user.ho_pic ? `https://darkorchid-caribou-718106.hostingersite.com/app/db_connection/${user.ho_pic}` : '';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleSidebar}>
          <Icon name="menu" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Home</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.profileImage} />
          ) : (
            <Icon name="person" size={40} color="#fff" /> // Placeholder icon if no image
          )}
        </TouchableOpacity>
      </View>

      {isSidebarVisible && <Sidebar onClose={toggleSidebar} navigation={navigation} />}

      <ScrollView contentContainerStyle={styles.content}>
        {billStatus === 'Overdue' && (
          <View style={styles.overdueBanner}>
            <Text style={styles.overdueText}>Your bill is overdue by {daysOverdue} days. Please settle it as soon as possible.</Text>
          </View>
        )}

        <View style={styles.dashboard}>
          <Text style={styles.dashboardTitle}>Dashboard</Text>
          <View style={styles.dashboardStats}>
            <View style={[styles.dashboardCard, billStatus === 'Overdue' ? styles.overdueBorder : {}]}>
              <Icon name="account-balance-wallet" size={24} color="#007bff" />
              <View style={styles.dashboardCardContent}>
                <Text style={styles.dashboardCardTitle}>Maintenance Due</Text>
                <Text style={styles.dashboardCardValue}>₱ {totalBills}</Text> 
              </View>
            </View>
            <View style={styles.dashboardCard}>
              <Icon name="people" size={24} color="#007bff" />
              <View style={styles.dashboardCardContent}>
                <Text style={styles.dashboardCardTitle}>Today's Visit Requests</Text>
                <Text style={styles.dashboardCardValue}>{totalVisits}</Text> 
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fff',
  },
  content: {
    padding: 20,
  },
  overdueBanner: {
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  overdueText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dashboardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'rgb(10, 80, 57)',
  },
  dashboardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dashboardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    width: '48%',
  },
  overdueBorder: {
    borderColor: 'red',
    borderWidth: 2,
  },
  dashboardCardContent: {
    marginLeft: 10,
  },
  dashboardCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  dashboardCardValue: {
    fontSize: 18,
    color: 'rgb(10, 80, 57)',
  },
});

export default HomeScreen;
