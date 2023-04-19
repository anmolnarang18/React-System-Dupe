import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import moment from 'moment';

import {SHIFT_STATUS, USER_TYPE} from '../shared/Constants';
import {COLORS} from '../shared/Styles';
import {decideShiftClr, decidingShiftType} from '../utils/UtilityFuncs';
import CustomButton from './CustomButton';
import ShiftSwappingModal from '../pages/tasks/ShiftSwappingModel';

export default function ShiftItem({
  data,
  userInfo,
  onConfirm,
  onComplete,
  onCancel,
  onSwap,
  onSwapResponse,
  onCardPress,
}) {
  const calcTime = () => {
    const start = moment(data.startDate);
    const end = moment(data.endDate);

    const hours = end.diff(start, 'hours');

    return hours;
  };

  let statusUI = null;

  switch (data.status) {
    case SHIFT_STATUS.NOT_ASSIGNED:
      statusUI = onConfirm && (
        <CustomButton
          title="Confirm"
          onPress={() => onConfirm(data._id)}
          parentStyles={{alignSelf: 'center'}}
        />
      );
      break;
    case SHIFT_STATUS.CONFIRMED:
      statusUI = onComplete && onCancel && (
        <View style={styles.row}>
          <CustomButton
            title="Complete"
            onPress={() => onComplete(data._id)}
            parentStyles={{width: '35%'}}
          />

          <ShiftSwappingModal
            shiftId={data._id}
            onSwap={onSwap}
            btnStyles={{width: '15%', backgroundColor: COLORS.secondary}}
          />

          <CustomButton
            title="Cancel"
            onPress={() => onCancel(data._id)}
            parentStyles={{
              width: '35%',
              backgroundColor: '#fff',
              borderWidth: 1,
              borderColor: 'red',
            }}
            textStyles={{color: 'red'}}
          />
        </View>
      );
      break;
    case SHIFT_STATUS.SWAP:
      if (data?.confirmedBy?._id === userInfo?._id) {
        statusUI = <Text style={styles.hgText} >Note: Waiting for response from {data?.swappedTo?.name}</Text>;
      } else if (data?.swappedTo?._id === userInfo?._id ) {
        statusUI = onSwapResponse && <>
         {data.confirmedBy?.name && (
          <Text style={{fontSize: 14, fontWeight: '400', marginTop: '3%'}}>
            <Text style={{fontWeight: '600'}}>Worker:</Text>{' '}
            {data.confirmedBy?.name}
          </Text>
        )}
        <View style={styles.row}>
          <CustomButton 
            title="Accept" 
            onPress={() => onSwapResponse(data._id, true)}
            parentStyles={{width:'45%'}} 
          />
          <CustomButton 
            title="Reject" 
            onPress={() => onSwapResponse(data._id, false)} 
            parentStyles={{width:'45%', backgroundColor: '#fff', borderWidth:1, borderColor: COLORS.secondary}} 
          />
        </View>
        </>
      }
      break;

    default:
      break;
  }
  
  return (
    <TouchableOpacity onPress={() => onCardPress(data)} style={styles.itemContainer}>
      <View style={styles.row}>
        <Text
          style={styles.headerText}>
          #{decidingShiftType(moment(data.startDate).format('HH:MM:SS'))}
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontWeight: '400',
            color: decideShiftClr(data.status),
          }}>
          {data.status}
        </Text>
      </View>

      <View style={[styles.row, {marginTop: '2%'}]}>
        <View>
          <Text style={{fontWeight: '600'}}>Start</Text>
          <Text
            style={styles.hgText}>
            {moment(data.startDate).format('DD/MMM/YY')}-
            {moment(data.startDate).format('hh:mm a')}
          </Text>
        </View>

        <View>
          <Text style={{fontWeight: '600'}}>End</Text>
          <Text
            style={styles.hgText}>
            {moment(data.endDate).format('DD/MMM/YY')}-
            {moment(data.endDate).format('hh:mm a')}
          </Text>
        </View>
      </View>

      <Text
        numberOfLines={2}
        style={{fontSize: 14, fontWeight: '400', marginTop: '2%'}}>
        ~ {data.description}
      </Text>
      {userInfo.type === USER_TYPE.MANAGER ? (
        data.confirmedBy?.name && (
          <Text style={{fontSize: 14, fontWeight: '400', marginTop: '3%'}}>
            <Text style={{fontWeight: '600'}}>Worker:</Text>{' '}
            {data.confirmedBy?.name}
          </Text>
        )
      ) : (
        <>
          <View style={styles.row}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '400',
                marginTop: '3%',
              }}>
              <Text style={{fontWeight: '600'}}>Manager:</Text>{' '}
              {data.createdBy.name}
            </Text>

            <Text
              style={{
                fontSize: 14,
                fontWeight: '400',
                marginTop: '3%',
              }}>
              <Text style={{fontWeight: '600'}}>Shift hours:</Text> {calcTime()}{' '}
              hrs
            </Text>
          </View>

          {data.status === SHIFT_STATUS.CONFIRMED && data.swappedFrom?(
            <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              marginTop: '3%',
            }}>
              Swapped from:
            <Text style={styles.hgText}> {data.swappedFrom.name}</Text>
           
          </Text>
          ):null}
          {statusUI}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    backgroundColor: '#fff',
    padding: '3%',
    width: '100%',
    borderColor: COLORS.secondary,
    borderWidth: 0.5,
    borderRadius: 5,
    display: 'flex',
    marginVertical: '3%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  headerText:{
      fontSize: 16,
      fontWeight: '700',
      color: COLORS.secondary,
  },
  hgText:{
    fontSize: 12,
    fontWeight: '400',
    marginTop: '2%',
    color: COLORS.primary,
  }
});

