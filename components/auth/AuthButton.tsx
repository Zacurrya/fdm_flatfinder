import React from 'react';
import { ActivityIndicator, DimensionValue, Text, TouchableOpacity, ViewStyle } from 'react-native';

export type AuthButtonProps = {
    label: string;
    onPress: () => void;
    borderColour?: string;
    fontSize?: number;
    textColour?: string;
    width?: DimensionValue;
    height?: DimensionValue;
    backgroundColour?: string;
    disabled?: boolean;
    isLoading?: boolean;
    style?: ViewStyle;
};

const AuthButton = ({
    label,
    onPress,
    borderColour,
    fontSize = 18,
    textColour = '#000000',
    width = '100%',
    height,
    backgroundColour = 'transparent',
    disabled = false,
    isLoading = false,
    style,
}: AuthButtonProps) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || isLoading}
            style={[
                {
                    backgroundColor: backgroundColour,
                    borderColor: borderColour,
                    borderWidth: borderColour ? 2 : 0,
                    width: width,
                    height: height,
                    borderRadius: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: disabled ? 0.7 : 1,
                    paddingVertical: height ? undefined : 16, // provide default padding if height is omitted
                },
                backgroundColour === '#ccff00' && {
                    shadowColor: '#ccff00',
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    elevation: 4,
                },
                style,
            ]}
            activeOpacity={0.8}
        >
            {isLoading ? (
                <ActivityIndicator color={textColour} />
            ) : (
                <Text
                    style={{
                        color: textColour,
                        fontSize,
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                    }}
                >
                    {label}
                </Text>
            )}
        </TouchableOpacity>
    );
};

export default AuthButton;
