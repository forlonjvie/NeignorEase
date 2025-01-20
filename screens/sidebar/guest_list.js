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
    const fetchGuests = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const { username } = JSON.parse(userData);
          const response = await axios.get(
            `https://darkorchid-caribou-718106.hostingersite.com/app/db_connection/getVisitLog.php?username=${username}`
          );
          if (response.data.error) {
            console.error(response.data.error);
            setGuests([]);
          } else {
            setGuests(response.data);
          }
        } else {
          navigation.navigate('Login');
        }
      } catch (error) {
        console.error('Error fetching guests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGuests();
  }, [navigation]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <View style={styles.guestItem}>
      <Image
        source={{
          uri: item.Guest_photo || 'https://via.placeholder.com/100',
        }}
        style={styles.guestImage}
      />
      <View style={styles.guestInfo}>
        <Text style={styles.guestName}>
          {`${item.Guest_fname} ${item.Guest_mname || ''} ${item.Guest_lname}`.trim()}
        </Text>
        <Text style={styles.guestDetails}>
          <Icon name="email" size={16} color="#888" /> {item.Guest_email}
        </Text>
        <Text style={styles.guestDetails}>
          <Icon name="phone" size={16} color="#888" /> {item.guest_contact}
        </Text>
        <Text style={styles.guestDetails}>
          <Icon name="home" size={16} color="#888" /> {item.guest_add || 'No address provided'}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.statusButton}
        onPress={() => navigation.navigate('a_details', { guest: item })}
      >
        <Text style={styles.statusButtonText}>Details</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.content}>
      {guests.length > 0 ? (
        <FlatList
          data={guests}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.guestList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No confirmed guests for today</Text>
        </View>
      )}
    </View>
  );
};

export default GuestList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  guestList: {
    marginTop: 10,
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
  guestDetails: {
    fontSize: 14,
    color: '#888',
    marginVertical: 2,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
});
