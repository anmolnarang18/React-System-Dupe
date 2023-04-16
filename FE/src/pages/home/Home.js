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
  tasks,
  userInfo,
  onReload,
  onConfirm,
  onCancel,
  onComplete,
  onSwap,
}) => (
  <FlatList
    data={tasks}
    keyExtractor={item => item._id}
    contentContainerStyle={[styles.container, {padding: '3%'}]}
    onRefresh={onReload}
    refreshing={false}
    ListEmptyComponent={() => (
      <View
        style={{
          width: '100%',
          height: '90%',
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
          onPress: async() => {
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

  const taskPress = data => {
    navigation.navigate('task_detail', {
      taskInfo: data,
      userInfo,
      handleShiftFetching,
    });
  };

  const handleShiftFetching = async (oldStatus, newStatus, isCompleted) => {
    if (oldStatus) {
      const oldStatusTasks = await getShifts(oldStatus);
      console.log('COMING OLD', oldStatusTasks);
      switch (oldStatus) {
        case SHIFT_STATUS.NOT_ASSIGNED:
          setNotAssignedShifts({
            data: oldStatusTasks,
            isCalled: true,
          });
          break;
        case SHIFT_STATUS.CONFIRMED:
          setConfirmedShifts({
            data: oldStatusTasks,
            isCalled: true,
          });

        case SHIFT_STATUS.SWAP:
          setExchangedShifts({
            data: oldStatusTasks,
            isCalled: true,
          });

        default:
          break;
      }
    }

    if (newStatus) {
      const newStatusTasks = await getShifts(newStatus);

      switch (newStatus) {
        case SHIFT_STATUS.NOT_ASSIGNED:
          setNotAssignedShifts({
            data: newStatusTasks,
            isCalled: true,
          });
          break;
        case SHIFT_STATUS.CONFIRMED:
          setConfirmedShifts({
            data: newStatusTasks,
            isCalled: true,
          });

        case SHIFT_STATUS.SWAP:
          setExchangedShifts({
            data: newStatusTasks,
            isCalled: true,
          });

        default:
          break;
      }
    }

    if (isCompleted) {
      const newStatusTasks = await getShifts(newStatus);
      setNotAssignedShifts({
        data: newStatusTasks,
        isCalled: true,
      });
    }
  };

  const handleMemberCreation = () => {
    navigation.navigate('auth', {
      screen: 'app_signup',
      params: {
        isMember: true,
        userInfo: userInfo,
      },
    });
  };

  const handleReload = async () => {
    let task = [];

    switch (index) {
      case 0:
        task = await getShifts(SHIFT_STATUS.NOT_ASSIGNED);
        setNotAssignedShifts({
          isCalled: true,
          data: task,
        });
        break;
      case 1:
        task = await getShifts(SHIFT_STATUS.CONFIRMED);
        setConfirmedShifts({
          isCalled: true,
          data: task,
        });
        break;
      case 2:
        task = await getShifts(SHIFT_STATUS.SWAP);
        console.log('COMING HERE', task);
        setExchangedShifts({
          isCalled: true,
          data: task,
        });
        break;

      default:
        break;
    }
  };

  const handleShiftSwap = () => {
    Alert.alert('Coming Soon!');
  }

  const alertShiftCancellation = (id) => {
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
  }

  const handleShiftConfirmation = async id => {

    setIsLoading(true);
    try {
      const result = await apiClient.post('/shift/confirmShift', {
        shiftId: id,
      });

      if (result.data) {
        const shifts = {...notAssignedShifts};

        const requiredShifts = shifts.data.filter(e => e._id !== id);

        const task = await getShifts(SHIFT_STATUS.CONFIRMED);

        setConfirmedShifts({
          isCalled: true,
          data: task,
        });
        setNotAssignedShifts({
          data: requiredShifts,
          isCalled: true,
        });
        setIsLoading(false);
        Alert.alert(
          'Success!',
          `Shift Confirmed!`,[],{cancelable: true}
        );
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

    setIsLoading(true);
    try {
      const result = await apiClient.post(`/shift/${endPoint}`, {
        shiftId: id,
      });

      if (result.data) {
        const shifts = {...confirmedShifts};

        const requiredShifts = shifts.data.filter(e => e._id !== id);

        setConfirmedShifts({
          isCalled: true,
          data: requiredShifts,
        });
        setIsLoading(false);
        Alert.alert(
          'Success!',
          `Shift ${isCancelled?'Cancelled!':'Completed!'}`,[],{cancelable: true}
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

  const handleIndexChange = async index => {
    setIndex(index);
    switch (index) {
      case 0:
        if (!notAssignedShifts.isCalled) {
          const task = await getShifts(SHIFT_STATUS.NOT_ASSIGNED);

          setNotAssignedShifts({
            isCalled: true,
            data: task,
          });
        }
        break;
      case 1:
        if (!confirmedShifts.isCalled) {
          const task = await getShifts(SHIFT_STATUS.CONFIRMED);

          setConfirmedShifts({
            isCalled: true,
            data: task,
          });
        }

        break;
      case 2:
        if (!exchangedShifts.isCalled) {
          const task = await getShifts(SHIFT_STATUS.SWAP);

          setExchangedShifts({
            isCalled: true,
            data: task,
          });
        }

        break;

      default:
        return;
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container,{alignItems:'center', justifyContent:'center'}]} >
        <ActivityIndicator color={COLORS.primary} size='large' />
        <Text>Fetching shifts...</Text>
      </View>
    )
}

  const renderScene = SceneMap({
    [SHIFT_STATUS.NOT_ASSIGNED]: () => (
      <ShiftListUI
        tasks={notAssignedShifts.data}
        userInfo={userInfo}
        onConfirm={handleShiftConfirmation}
        onReload={handleReload}
      />
    ),
    [SHIFT_STATUS.CONFIRMED]: () => (
      <ShiftListUI
        tasks={confirmedShifts.data}
        userInfo={userInfo}
        onComplete={handleShiftCompletion}
        onCancel={alertShiftCancellation}
        onSwap={handleShiftSwap}
        onReload={handleReload}
      />
    ),
    [SHIFT_STATUS.SWAP]: () => <Text>shifts to exchange</Text>,
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
