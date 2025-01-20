// FILEPATH: c:/xampp/htdocs/1Caps/4Capstone/app/screens/sidebar/visit_reservation_list.js

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const GuestList = () => {
  const navigation = useNavigation();
  const [guests, setGuests] = useState([]);
  const [filteredGuests, setFilteredGuests] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleGuests, setVisibleGuests] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const { username } = JSON.parse(userData);
          const userResponse = await axios.get(
            `https://darkorchid-caribou-718106.hostingersite.com/app/db_connection/getuser.php?username=${username}`
          );
          setUser(userResponse.data);

          const visitResponse = await axios.get(
            `https://darkorchid-caribou-718106.hostingersite.com/app/db_connection/getVisitall.php?username=${username}`
          );
          if (visitResponse.data.error) {
            setGuests([]);
          } else {
            setGuests(visitResponse.data);
            setFilteredGuests(visitResponse.data);
          }
        } else {
          navigation.navigate('Login');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        navigation.navigate('Login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 10000);
    return () => clearInterval(intervalId);
  }, [navigation]);

  useEffect(() => {
    const filtered = guests.filter(guest =>
      [guest.Guest_lname, guest.Guest_fname, guest.guest_add]
        .some(field => field.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredGuests(filtered);
    setVisibleGuests(10);
  }, [searchQuery, guests]);

  const showMoreGuests = () => setVisibleGuests(prev => prev + 10);
  const showLessGuests = () => setVisibleGuests(10);

  const renderItem = ({ item }) => (
    <View style={styles.guestItem}>
      <Image
        source={{ uri: `https://darkorchid-caribou-718106.hostingersite.com/web/emman/web/img/${item.Guest_photo}` }}
        style={styles.profileImage}
      />
      <View style={styles.guestInfo}>
        <Text style={styles.guestName}>
          {`${item.Guest_lname}, ${item.Guest_fname} ${item.Guest_mname ? item.Guest_mname + ' ' : ''}${item.Guest_afname || ''}`}
        </Text>
        <Text style={styles.guestDetail}>
          <Icon name="place" size={16} color="#888" /> {item.guest_add}
        </Text>
        <Text style={styles.guestDetail}>
          <Icon name="event" size={16} color="#888" /> {item.visit_date}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.detailsButton}
        onPress={() => navigation.navigate('a_details', { guest: item })}
      >
        <Text style={styles.detailsButtonText}>Details</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0A5039" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search guests..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <View style={styles.content}>
        {filteredGuests.length === 0 ? (
          <View style={styles.noVisitorContainer}>
            <Text style={styles.noVisitorText}>No Visitors Found</Text>
          </View>
        ) : (
          <>
            <FlatList
              data={filteredGuests.slice(0, visibleGuests)}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
              contentContainerStyle={styles.guestList}
            />
            <View style={styles.showMoreLessContainer}>
              {visibleGuests < filteredGuests.length && (
                <TouchableOpacity style={styles.showMoreButton} onPress={showMoreGuests}>
                  <Text style={styles.showMoreButtonText}>Show More</Text>
                </TouchableOpacity>
              )}
              {visibleGuests > 10 && (
                <TouchableOpacity style={styles.showLessButton} onPress={showLessGuests}>
                  <Text style={styles.showLessButtonText}>Show Less</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}
      </View>
    </View>
  );
};

export default GuestList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 10,
  },
  searchInput: {
    height: 40,
    borderColor: '#CED4DA',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#FFF',
  },
  content: {
    flex: 1,
  },
  guestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  guestInfo: {
    flex: 1,
  },
  guestName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  guestDetail: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  detailsButton: {
    backgroundColor: '#0A5039',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  detailsButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  showMoreLessContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  showMoreButton: {
    backgroundColor: '#0A5039',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  showLessButton: {
    backgroundColor: '#A50000',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
    alignItems: 'center',
  },
  showMoreButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  showLessButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  noVisitorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noVisitorText: {
    fontSize: 18,
    color: '#888',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
});
