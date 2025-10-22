import type { ButtonType, Key } from "bandijoystick";
import { createButton } from "./Button";
import { createCameraStreamButton } from "./CameraStreamDisplay";
import { createDirectonalStickButton } from "./Stick";
import { createGamepadRelayButton } from "./GamepadRelayUI";
//%IMPORT%

const mapping : { [key in ButtonType]:(host:HTMLDivElement, key:Key)=>VoidFunction } = {
	"button": createButton
	,"vec2": createDirectonalStickButton
	,"camera": createCameraStreamButton
	,"gpad-relay": createGamepadRelayButton
	//%INSERT_NEW_MAPPING%
}

export function createKeyUI( key:Key, host:HTMLDivElement ):VoidFunction {
	if( !mapping[key.config.type] )
	{
		throw new Error(`Key config of unknown type: ${key.config.type}`);
	}

	return mapping[key.config.type]( host, key );
}