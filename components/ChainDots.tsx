import React from 'react';
import { StyleSheet, View } from 'react-native';

interface ChainDotsProps {
  filledDays: string[];
  last7Dates: string[];
  accentColor: string;
}

export function ChainDots({ filledDays, last7Dates, accentColor }: ChainDotsProps) {
  return (
    <View style={styles.row}>
      {last7Dates.map((day, i) => {
        const filled = filledDays.includes(day);
        return (
          <React.Fragment key={day}>
            <View
              style={[
                styles.dot,
                filled
                  ? { backgroundColor: accentColor, borderColor: accentColor }
                  : { backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.22)' },
              ]}
            />
            {i < last7Dates.length - 1 && (
              <View
                style={[
                  styles.line,
                  {
                    backgroundColor: filled && filledDays.includes(last7Dates[i + 1])
                      ? accentColor
                      : 'rgba(255,255,255,0.18)',
                  },
                ]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
  },
  line: {
    width: 12,
    height: 1.5,
  },
});
