// FILEPATH: c:/xampp/htdocs/1Caps/4Capstone/app/screens/sidebar/A_visit_details.js

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Guest = ({ route, navigation }) => {
  const { guest } = route.params;
  const [username, setUsername] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const parsedData = JSON.parse(userData);
          setUsername(parsedData.username);
        } else {
          navigation.navigate('Login');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        navigation.navigate('Login');
      }
    };
    fetchUserData();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.card}>
          {guest && (
            <>
              <Image 
                source={{ uri: `https://darkorchid-caribou-718106.hostingersite.com/web/emman/web/img/${guest.Guest_photo}` }} 
                style={styles.profileImage} 
              />
              <View style={styles.infoItem}>
                <Text style={styles.label}>Name:</Text>
                <Text style={styles.value}>
                  {guest.Guest_lname}, {guest.Guest_fname} {guest.Guest_mname ? guest.Guest_mname + ' ' : ''}{guest.Guest_afname ? guest.Guest_afname : ''}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{guest.Guest_email}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.label}>Contact:</Text>
                <Text style={styles.value}>{guest.guest_contact}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.label}>Address:</Text>
                <Text style={styles.value}>{guest.guest_add}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.label}>Relation:</Text>
                <Text style={styles.value}>{guest.relation}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.label}>Expected Arrival:</Text>
                <Text style={styles.value}>{guest.visit_date}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.label}>Status:</Text>
                <Text style={styles.value}>{guest.status || 'Pending'}</Text>
              </View>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f9f9f9' 
  },
  content: { 
    flex: 1, 
    padding: 20 
  },
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 10, 
    padding: 20, 
    marginBottom: 20, 
    elevation: 3 
  },
  profileImage: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    alignSelf: 'center', 
    marginBottom: 20 
  },
  infoItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 15 
  },
  label: { 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  value: { 
    fontSize: 16 
  },
});

export default Guest;
