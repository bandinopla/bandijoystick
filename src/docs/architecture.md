# Architecture
This is the overview of what's going on in terms of calls and events from the moment the QR code is shows, to the moment the user can start to touch keys:

*Notice the mobile is redirected to bandijoystickjs.web.app for the webapp joystick app, but you can hook your own mobile ui using `config({remoteControlUrl})`*

## Flowchart
![Architecture overview](/architecture.drawio.svg)

## In human terms...
* Your app shows the QR code for the "player 1" slot
* The user scans the code with the phone and is redirected to the virtual joystick app.
* The user's virtual joystick asks your app to let it connect to the "player 1" slot.
* Your app's Player 1 joystick sends an "ok" the label "Player 1" and the keys it should show.
* The user from now on can interact with the keys.
* Your app interacts with the keys too...
* Everything is kept in syn behind the scenes.

