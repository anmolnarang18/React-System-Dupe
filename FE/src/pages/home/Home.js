import React, {useEffect, useState} from 'react';

import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import {TabView, TabBar, SceneMap} from 'react-native-tab-view';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import AsyncStorage from '@react-native-async-storage/async-storage';

import CustomFloatingBtn from '../../components/CustomFloatingBtn';
import apiClient from '../../api/Api';

import {SHIFT_STATUS, SIGNEDIN_KEY, USER_TYPE} from '../../shared/Constants';
import {COLORS} from '../../shared/Styles';

import ShiftItem from '../../components/ShiftItem';

const ShiftListUI = ({
  shifts,
  userInfo,
  onReload,
  onConfirm,
  onCancel,
  onComplete,
  onSwap,
  onSwapResponse,
  onCardPress,
}) => (
  <FlatList
    data={shifts}
    keyExtractor={item => item._id}
    showsVerticalScrollIndicator={false}
    style={{height: '100%', width: '100%', padding: '3%', marginBottom: '1%'}}
    onRefresh={onReload}
    refreshing={false}
    ListEmptyComponent={() => (
      <View
        style={{
          display: 'flex',
          flex: 1,
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text style={{fontSize: 20, fontWeight: '700'}}>
          Shifts not found :(
        </Text>
      </View>
    )}
    renderItem={({item}) => (
      <ShiftItem
        data={item}
        userInfo={userInfo}
        onConfirm={onConfirm}
        onCancel={onCancel}
        onComplete={onComplete}
        onSwap={onSwap}
        onSwapResponse={onSwapResponse}
        onCardPress={onCardPress}
      />
    )}
  />
);

const renderTabBar = props => (
  <TabBar
    {...props}
    indicatorStyle={{backgroundColor: COLORS.primary}}
    style={{backgroundColor: COLORS.secondary, color: COLORS.secondary}}
  />
);

export default function Home({navigation}) {
  const [userInfo, setUserInfo] = useState({});

  const [notAssignedShifts, setNotAssignedShifts] = useState({
    isCalled: false,
    data: [],
  });
  const [confirmedShifts, setConfirmedShifts] = useState({
    isCalled: false,
    data: [],
  });
  const [exchangedShifts, setExchangedShifts] = useState({
    isCalled: false,
    data: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const layout = useWindowDimensions();

  const [index, setIndex] = useState(0);

  const [routes] = useState([
    {key: SHIFT_STATUS.NOT_ASSIGNED, title: 'Open'},
    {key: SHIFT_STATUS.CONFIRMED, title: 'Confirmed'},
    {key: SHIFT_STATUS.SWAP, title: 'Exchange'},
  ]);

  useEffect(() => {
    getUserInfo();
  }, []);

  const getUserInfo = async () => {
    let info = await AsyncStorage.getItem(SIGNEDIN_KEY);
    info = JSON.parse(info);
    setUserInfo(info);
    const shifts = await getShifts(SHIFT_STATUS.NOT_ASSIGNED);

    setNotAssignedShifts({
      isCalled: true,
      data: shifts,
    });
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure, you want to exit this application?',
      [
        {
          text: 'Yes',
          onPress: async () => {
            await AsyncStorage.removeItem(SIGNEDIN_KEY);
            navigation.reset({
              index: 0,
              routes: [{name: 'auth'}],
            });
          },
          style: 'positive',
        },
        {
          text: 'No',
          onPress: () => {},
          style: 'cancel',
        },
      ],
      {
        cancelable: true,
        // onDismiss: () =>
        //   Alert.alert(
        //     'This alert was dismissed by tapping outside of the alert dialog.',
        //   ),
      },
    );
  };

  const getShifts = async status => {
    setIsLoading(true);
    try {
      const shiftList = await apiClient.get('/shift/getShifts', {
        params: {
          status,
        },
      });

      if (shiftList) {
        setIsLoading(false);
        return shiftList.data.data || [];
      }
      setIsLoading(false);
      return [];
    } catch (error) {
      console.log('SHIFTLIST ERROR', error);
      console.log(
        'SHIFTLIST ERROR',
        error?.response?.data?.message ||
          error?.data?.message ||
          'Something went wrong!',
      );
      setIsLoading(false);
      return [];
    }
  };

  const createShift = () => {
    navigation.navigate('shift_create', {
      userInfo,
      handleShiftFetching,
    });
  };

  const shiftPress = data => {
    navigation.navigate('shift_detail', {
      shiftInfo: data,
      userInfo,
      fetchDataWithIndex,
    });
  };

  const handleShiftFetching = async (oldStatus, newStatus, isCompleted) => {
    if (oldStatus) {
      const oldStatusShifts = await getShifts(oldStatus);
    
      switch (oldStatus) {
        case SHIFT_STATUS.NOT_ASSIGNED:
          setNotAssignedShifts({
            data: oldStatusShifts,
            isCalled: true,
          });
          break;
        case SHIFT_STATUS.CONFIRMED:
          setConfirmedShifts({
            data: oldStatusShifts,
            isCalled: true,
          });

        case SHIFT_STATUS.SWAP:
          setExchangedShifts({
            data: oldStatusShifts,
            isCalled: true,
          });

        default:
          break;
      }
    }

    if (newStatus) {
      const newStatusShifts = await getShifts(newStatus);

      switch (newStatus) {
        case SHIFT_STATUS.NOT_ASSIGNED:
          setNotAssignedShifts({
            data: newStatusShifts,
            isCalled: true,
          });
          break;
        case SHIFT_STATUS.CONFIRMED:
          setConfirmedShifts({
            data: newStatusShifts,
            isCalled: true,
          });

        case SHIFT_STATUS.SWAP:
          setExchangedShifts({
            data: newStatusShifts,
            isCalled: true,
          });

        default:
          break;
      }
    }

    if (isCompleted) {
      const newStatusShifts = await getShifts(newStatus);
      setNotAssignedShifts({
        data: newStatusShifts,
        isCalled: true,
      });
    }
  };

  const handleReload = async () => {
    let shift = [];

    switch (index) {
      case 0:
        shift = await getShifts(SHIFT_STATUS.NOT_ASSIGNED);
        setNotAssignedShifts({
          isCalled: true,
          data: shift,
        });
        break;
      case 1:
        shift = await getShifts(SHIFT_STATUS.CONFIRMED);
        setConfirmedShifts({
          isCalled: true,
          data: shift,
        });
        break;
      case 2:
        shift = await getShifts(SHIFT_STATUS.SWAP);
        setExchangedShifts({
          isCalled: true,
          data: shift,
        });
        break;

      default:
        break;
    }
  };

  const handleShiftSwap = async id => {
    filterConfirmedShifts(id);

    Alert.alert('Success!', `Shift sent to swap.`, [], {cancelable: true});
    if (exchangedShifts.isCalled) {
      const shift = await getShifts(SHIFT_STATUS.SWAP);

      setExchangedShifts({
        isCalled: true,
        data: shift,
      });
    }
  };

  const alertShiftCancellation = id => {
    Alert.alert(
      'Cancel',
      'Are you sure, you want to cancel this shift?',
      [
        {
          text: 'Yes',
          onPress: () => handleShiftCompletion(id, true),
          style: 'positive',
        },
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
      ],
      {
        cancelable: true,
      },
    );
  };

  const alertSwapRejection = (id, isAccepted) => {
    Alert.alert(
      'Reject',
      'Are you sure, you want to reject this shift?',
      [
        {
          text: 'Yes',
          onPress: () => handleSwapResponse(id, isAccepted),
          style: 'positive',
        },
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
      ],
      {
        cancelable: true,
      },
    );
  };

  const handleShiftConfirmation = async id => {
    // setIsLoading(true);
    try {
      const result = await apiClient.post('/shift/confirmShift', {
        shiftId: id,
      });

      if (result.data) {
        const shifts = {...notAssignedShifts};

        const requiredShifts = shifts.data.filter(e => e._id !== id);

        const shift = await getShifts(SHIFT_STATUS.CONFIRMED);

        setConfirmedShifts({
          isCalled: true,
          data: shift,
        });
        setNotAssignedShifts({
          data: requiredShifts,
          isCalled: true,
        });
        setIsLoading(false);
        Alert.alert('Success!', `Shift Confirmed!`, [], {cancelable: true});
      }
    } catch (error) {
      console.log('CONFIRMATION ERROR', error);
      setIsLoading(false);
      Alert.alert(
        'Error',
        error?.response?.data?.message ||
          error?.data?.message ||
          'Something went wrong!',
      );
    }
  };

  const handleShiftCompletion = async (id, isCancelled) => {
    let endPoint = 'completeShift';

    if (isCancelled) endPoint = 'cancelShift';

    // setIsLoading(true);
    try {
      const result = await apiClient.post(`/shift/${endPoint}`, {
        shiftId: id,
      });

      if (result.data) {
        filterConfirmedShifts(id);
        setIsLoading(false);
        Alert.alert(
          'Success!',
          `Shift ${isCancelled ? 'Cancelled!' : 'Completed!'}`,
          [],
          {cancelable: true},
        );
      }
    } catch (error) {
      console.log('COMPLETION ERROR', error);
      setIsLoading(false);
      Alert.alert(
        'Error',
        error?.response?.data?.message ||
          error?.data?.message ||
          'Something went wrong!',
      );
    }
  };

  const handleSwapResponse = (shiftId, isAccepted) => {
    apiClient
      .post('/shift/swapResponse', {
        shiftId,
        isAccepted,
      })
      .then(async resp => {
        console.log('SWAP RESPONSE', resp);
        if (isAccepted) {
          Alert.alert('Success!', `Shift Confirmed!!`, [], {cancelable: true});
          const shifts = await getShifts(SHIFT_STATUS.CONFIRMED);
          setConfirmedShifts({
            isCalled: true,
            data: shifts,
          });
        } else {
          Alert.alert('Success!', `Response sent!`, [], {cancelable: true});
        }

        const swapShifts = [...exchangedShifts.data];

        const filteredShifts = swapShifts.filter(e => e._id !== shiftId);

        setExchangedShifts({
          isCalled: true,
          data: filteredShifts,
        });
      })
      .catch(error => {
        console.log('SWAPPING ERROR', error);

        Alert.alert(
          'Error',
          error?.response?.data?.message ||
            error?.data?.message ||
            'Something went wrong!',
        );
      });
  };

  const filterConfirmedShifts = id => {
    const shifts = {...confirmedShifts};

    const requiredShifts = shifts.data.filter(e => e._id !== id);

    setConfirmedShifts({
      isCalled: true,
      data: requiredShifts,
    });
  };

  const handleIndexChange =  index => {
    setIndex(index);
    fetchDataWithIndex(false,index);
  };

  const fetchDataWithIndex = async (isMandate, i) => {
    const reqIndex = i || index;
  
    switch (reqIndex) {
      case 0:
        if (isMandate || !notAssignedShifts.isCalled) {
          const shift = await getShifts(SHIFT_STATUS.NOT_ASSIGNED);

          setNotAssignedShifts({
            isCalled: true,
            data: shift,
          });
        }
        break;
      case 1:
        if (isMandate || !confirmedShifts.isCalled) {
          const shift = await getShifts(SHIFT_STATUS.CONFIRMED);

          setConfirmedShifts({
            isCalled: true,
            data: shift,
          });
        }

        break;
      case 2:
        if (isMandate || !exchangedShifts.isCalled) {
          const shift = await getShifts(SHIFT_STATUS.SWAP);

          setExchangedShifts({
            isCalled: true,
            data: shift,
          });
        }

        break;

      default:
        return;
    }
  }

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          {alignItems: 'center', justifyContent: 'center'},
        ]}>
        <ActivityIndicator color={COLORS.primary} size="large" />
        <Text>Fetching shifts...</Text>
      </View>
    );
  }

  const renderScene = SceneMap({
    [SHIFT_STATUS.NOT_ASSIGNED]: () => (
      <ShiftListUI
        shifts={notAssignedShifts.data}
        userInfo={userInfo}
        onConfirm={handleShiftConfirmation}
        onReload={handleReload}
        onCardPress={shiftPress}
      />
    ),
    [SHIFT_STATUS.CONFIRMED]: () => (
      <ShiftListUI
        shifts={confirmedShifts.data}
        userInfo={userInfo}
        onComplete={handleShiftCompletion}
        onCancel={alertShiftCancellation}
        onSwap={handleShiftSwap}
        onReload={handleReload}
        onCardPress={shiftPress}
      />
    ),
    [SHIFT_STATUS.SWAP]: () => (
      <ShiftListUI
        shifts={exchangedShifts.data}
        userInfo={userInfo}
        onSwapResponse={(id, isAccepted) => {
          isAccepted
            ? handleSwapResponse(id, isAccepted)
            : alertSwapRejection(id, isAccepted);
        }}
        onReload={handleReload}
        onCardPress={shiftPress}
      />
    ),
  });

  return (
    <View style={styles.container}>
      <TabView
        navigationState={{index, routes}}
        renderScene={renderScene}
        onIndexChange={handleIndexChange}
        renderTabBar={renderTabBar}
        initialLayout={{width: layout.width}}
      />
      {userInfo.type === USER_TYPE.MANAGER ? (
        <>
          <CustomFloatingBtn
            iconName="plus"
            onBtnPress={createShift}
            parentStyles={{bottom: 120}}
          />

          <CustomFloatingBtn
            iconName="logout"
            onBtnPress={handleLogout}
            parentStyles={{backgroundColor: 'red'}}
          />
        </>
      ) : (
        <CustomFloatingBtn
          iconName="logout"
          onBtnPress={handleLogout}
          parentStyles={{backgroundColor: 'red'}}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    backgroundColor: '#fff',
    width: '100%',
    height: '100%',
  },
  itemContainer: {
    backgroundColor: '#fff',
    padding: '3%',
    width: '100%',
    borderColor: COLORS.secondary,
    borderBottomWidth: 1,
    borderRadius: 8,
    display: 'flex',
    marginVertical: '3%',
  },
  headerContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    width: '100%',
  },
  headerText: {
    fontSize: 20,
    fontWeight: '700',
  },

  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  btnText: {
    marginTop: '3%',
    borderBottomWidth: 0.5,
    paddingVertical: '2%',
    paddingHorizontal: '5%',
    borderRadius: 8,
    color: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
});
