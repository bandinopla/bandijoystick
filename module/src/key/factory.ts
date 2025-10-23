import { Image, DeviceMotionRelay, CameraStream, DirKey, GamepadRelay, PushKey, type ButtonType, type Key, type RemoteKeyConfig } from "../module";

const mapping : { [key in ButtonType]:new (...args: any[]) => Key } = {
	"button":PushKey
	,"vec2":DirKey
	,"camera":CameraStream
	,"gpad-relay":GamepadRelay
	,"motion":DeviceMotionRelay
	,"image":Image
	//%INSERT_NEW_MAPPING%
}

export function newKeyFor( config:RemoteKeyConfig )
{ 
	if( !mapping[config.type] )
	{
		throw new Error(`Key config of unknown type: ${config.type}`);
	}

	return new mapping[config.type](config, config.kid);
}