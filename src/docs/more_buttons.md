# Adding new button types
This library is young and still growing! More key types will be added in the future either by me and/or by awesome developers that decide to collab and expand it by doing pull requests.

If you want to add more buttons, drop a [pull request](https://github.com/bandinopla/bandijoystick/pulls) and remember to work on a new branch.

## Create new
Run the key creation widget to create the required files and hook it up in the system:
```bash
pnpm run create:key
```


## Concept
A button is an objects that the developer of an app uses to detect when the user clicks on a button in the virtual joystick. It manages the syncronicity with the "other self" by overriding and implementing the `keepInSync` method inherited from `BANDI.Key`

```text
[Phone's Key] <====> [App's key]
```
 

# The `keepInSync` Method
This function is called when the key is instantiated. It will act diferently depending on if the key is remote ( *running on the phone* ) or on the app ( *the pc / tv* )
The goal here is to mirror or mimic the changes of the key. Usually, the phone will be the **source of truth** meaning: if the user clicks a button, logically, you have to mimic the push of the button in the application.
 
 

That's it!

