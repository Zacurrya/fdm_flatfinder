import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Text, TextInput, TextInputProps, TouchableOpacity, View } from "react-native";

type PasswordInputProps = {
	label: string;
	value: string;
	onChangeText: (value: string) => void;
	placeholder: string;
	error?: string;
	editable?: boolean;
	autoComplete?: TextInputProps["autoComplete"];
	textContentType?: TextInputProps["textContentType"];
};

export default function PasswordInput({
	label,
	value,
	onChangeText,
	placeholder,
	error,
	editable = true,
	autoComplete,
	textContentType,
}: PasswordInputProps) {
	const [isVisible, setIsVisible] = useState(false);

	return (
		<View>
			<Text className="text-fdm-fg/80 font-medium mb-2 ml-1 text-sm uppercase tracking-wider">
				{label}
			</Text>

			<View className="relative">
				<TextInput
					className="h-14 bg-fdm-fg/5 border-[1.5px] border-fdm-fg/10 rounded-2xl pl-4 pr-12 text-fdm-fg"
					value={value}
					onChangeText={onChangeText}
					secureTextEntry={!isVisible}
					autoCapitalize="none"
					autoComplete={autoComplete}
					textContentType={textContentType}
					placeholder={placeholder}
					placeholderTextColor="#ffffff66"
					editable={editable}
				/>

				<TouchableOpacity
					className="absolute right-4 top-0 h-14 items-center justify-center"
					onPress={() => setIsVisible((prev) => !prev)}
					accessibilityRole="button"
					accessibilityLabel={isVisible ? "Hide password" : "Show password"}
					disabled={!editable}
				>
					<Ionicons
						name={isVisible ? "eye-off-outline" : "eye-outline"}
						size={20}
						color="#ffffff99"
					/>
				</TouchableOpacity>
			</View>

			{error ? <Text className="text-red-400 text-sm mt-1">{error}</Text> : null}
		</View>
	);
}
