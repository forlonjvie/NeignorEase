import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const GuestList = () => {
  const navigation = useNavigation();
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        const sessionKey = await AsyncStorage.getItem('sessionKey');

        if (userData && sessionKey) {
          const { username } = JSON.parse(userData);
          const response = await axios.get('http://192.168.43.178/12_18/4Capstone/app/guard/db_connection/getTodayGuest.php', {
            headers: {
              'Authorization': `Bearer ${sessionKey}`
            }
          });

          if (response.data.error) {
            setGuests([]);
          } else {
            // Filter guests with validity greater than or equal to today
            const today = new Date();
            const validGuests = response.data.filter(guest => {
              const guestValidityDate = new Date(guest.Validity);
              return guestValidityDate >= today;
            });
            setGuests(validGuests);
          }
        } else {
          navigation.navigate('Login');
        }
      } catch (error) {
        console.error('Failed to get user data:', error);
        navigation.navigate('Login');
      } finally {
        setLoading(false);
      }
    };
    getUserData();
  }, [navigation]);

  const renderItem = ({ item }) => (
    <View style={styles.guestItem}>
      <Image source={{ uri: 'https://via.placeholder.com/100' }} style={styles.guestImage} />
      <View style={styles.guestInfo}>
        <Text style={styles.guestName}>{item.Guest_name}</Text>
        <Text style={styles.guestValidity}>
          <Icon name="calendar-today" size={16} color="#888" /> Validity: {item.Validity}
        </Text>
        {/* Hidden Fields */}
        <Text style={[styles.guestAddress, styles.hidden]}>
          <Icon name="place" size={16} color="#888" /> Confirmed on: {item.Date_confirmed}
        </Text>
        <Text style={[styles.HO_name, styles.hidden]}>
          <Icon name="email" size={16} color="#888" /> Confirmed by: {item.HO_name}
        </Text>
        <Text style={[styles.guestEmail, styles.hidden]}>
          <Icon name="email" size={16} color="#888" /> OTP: {item.OTP}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.statusButton}
        onPress={() => navigation.navigate('GuestInfo', { guest: item })}
      >
        <Text style={styles.statusButtonText}>View</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {guests.length === 0 ? (
          <View style={styles.noVisitorContainer}>
            <Text style={styles.noVisitorText}>No Valid Visitors</Text>
          </View>
        ) : (
          <FlatList
            data={guests}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            style={styles.guestList}
          />
        )}
      </View>
    </View>
  );
};

export default GuestList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  guestList: {
    marginTop: 10,
  },
  hidden: {
    display: 'none',
  },
  guestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    borderRadius: 5,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  guestInfo: {
    flex: 1,
    marginLeft: 10,
  },
  guestName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  guestValidity: {
    fontSize: 14,
    color: '#888',
  },
  guestImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  statusButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    backgroundColor: 'rgb(10, 80, 57)',
    elevation: 2,
  },
  statusButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  noVisitorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noVisitorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'rgb(10, 80, 57)',
  },
});
